import { useState, useEffect, useRef } from 'react';
import { ProgramDaySummaryComponent } from './ProgramDaySummaryComponent';
import { ProgramType } from '@/app/shared/types';
import { Exercise, ExerciseProgram, ProgramDay } from '@/app/types/program';
import { LoadingSpinner } from './LoadingSpinner';
import { ProgramFeedbackQuestionnaire, ProgramFeedback } from './ProgramFeedbackQuestionnaire';
import { submitProgramFeedback } from '@/app/services/programFeedbackService';
import { useAuth } from '@/app/context/AuthContext';
import { ExerciseSelectionPage } from './ExerciseSelectionPage';
import { useUser } from '@/app/context/UserContext';
import { useTranslation } from '@/app/i18n';

// Updated interface to match the actual program structure

interface ExerciseProgramPageProps {
  program: ExerciseProgram;
  isLoading: boolean;
  onToggleView: () => void;
  dayName: (day: number) => string;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  onDaySelect: (day: ProgramDay, dayName: string) => void;
  isActive?: boolean;
}

// Add styles to hide scrollbars while maintaining scroll functionality
const scrollbarHideStyles = `
  .scrollbar-hide {
    -ms-overflow-style: none;  /* IE and Edge */
    scrollbar-width: none;     /* Firefox */
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;            /* Chrome, Safari and Opera */
  }
`;

// Add styles to head
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = scrollbarHideStyles;
  document.head.appendChild(style);
}

// Helper function to get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Add function to get next Monday's date
function getNextMonday(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const diff = day === 0 ? 1 : 8 - day; // if Sunday (0), add 1 day, otherwise add days until next Monday
  result.setDate(result.getDate() + diff);
  return result;
}

// Create a reusable loading component
function ProgramLoadingUI() {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-gray-900">
      <LoadingSpinner 
        message="Creating Program" 
        submessage="Please wait while we generate your personalized exercise program..."
        fullScreen={true}
        size="large"
      />
    </div>
  );
}

export function ExerciseProgramPage({
  program,
  isLoading,
  dayName,
  onDaySelect,
  isActive = false,
}: ExerciseProgramPageProps) {
  // Get current date info
  const currentDate = new Date();
  const currentWeekNumber = getWeekNumber(currentDate);
  const currentDayOfWeek = currentDate.getDay() || 7; // Convert Sunday (0) to 7

  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [showOverview, setShowOverview] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFeedbackQuestionnaire, setShowFeedbackQuestionnaire] = useState(false);
  const [isGeneratingProgram, setIsGeneratingProgram] = useState(false);
  const { user } = useAuth();
  const [showExerciseSelectionPage, setShowExerciseSelectionPage] = useState(false);
  const [selectedExercises, setSelectedExercises] = useState<{
    effective: string[];
    ineffective: string[];
  }>({
    effective: [],
    ineffective: []
  });
  // Add state to track which selection step to show
  const [selectionStep, setSelectionStep] = useState<'effective' | 'ineffective'>('effective');
  // Add state to save feedback form scroll position
  const [feedbackScrollPosition, setFeedbackScrollPosition] = useState(0);
  const { answers } = useUser();
  const { t } = useTranslation();

  // Check if overview has been seen before
  useEffect(() => {
    if (!program?.program) return;

    const programId = `program-${program.createdAt}`;
    const hasSeenOverview = localStorage.getItem(programId);

    if (hasSeenOverview) {
      setShowOverview(false);
    } else {
      setShowOverview(true);
      // Mark as seen
      localStorage.setItem(programId, 'true');
    }
  }, [program]);

  // Check if today is the day for feedback (the same date as nextMonday)
  useEffect(() => {
    const checkFeedbackDay = () => {
      const nextMonday = getNextMonday(new Date());
      const today = new Date();
      
      // Check if the dates match (ignoring time)
      const todayStr = today.toDateString();
      const nextMondayStr = nextMonday.toDateString();
      
      // Set to show feedback questionnaire directly instead of exercise selection
      setShowFeedbackQuestionnaire(todayStr === nextMondayStr);
    };
    
    checkFeedbackDay();
  }, []);

  const handleCloseOverview = () => {
    setShowOverview(false);
  };

  // Function to handle exercise selection
  const handleExerciseSelection = (effectiveExercises: string[], ineffectiveExercises: string[]) => {
    // Update the selected exercises
    if (selectionStep === 'effective') {
      setSelectedExercises(prev => ({
        ...prev,
        effective: effectiveExercises
      }));
    } else {
      setSelectedExercises(prev => ({
        ...prev,
        ineffective: ineffectiveExercises
      }));
    }
    
    // Return to the feedback form
    setShowExerciseSelectionPage(false);
    setShowFeedbackQuestionnaire(true);
    
    // Restore feedback form scroll position
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: feedbackScrollPosition, behavior: 'instant' });
      }
    }, 0);
  };

  // Function to handle editing a specific selection step
  const handleEditSelection = (step: 'effective' | 'ineffective') => {
    // Save current scroll position before switching to exercise selection
    if (containerRef.current) {
      setFeedbackScrollPosition(containerRef.current.scrollTop);
    }
    
    setSelectionStep(step);
    setShowFeedbackQuestionnaire(false);
    setShowExerciseSelectionPage(true);
    
    // Reset scroll position when switching to exercise selection
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 0);
  };

  // Set initial week and day when program loads
  useEffect(() => {
    if (!program?.program || !Array.isArray(program.program)) return;

    // Find the program week that corresponds to the current calendar week
    let weekToSelect = 1;
    for (let i = 0; i < program.program.length; i++) {
      const weekDate = new Date(currentDate);
      weekDate.setDate(currentDate.getDate() - (currentDayOfWeek - 1) + i * 7);
      if (getWeekNumber(weekDate) === currentWeekNumber) {
        weekToSelect = i + 1;
        break;
      }
    }

    // If current week is beyond program weeks, select the last available week
    if (weekToSelect > program.program.length) {
      weekToSelect = program.program.length;
    }

    setSelectedWeek(weekToSelect);
    setExpandedDays([currentDayOfWeek]);

    // Scroll selected week and day into view after state updates
    setTimeout(() => {
      // Scroll week into view
      const weekButton = document.querySelector(
        `[data-week="${weekToSelect}"]`
      );
      if (weekButton) {
        weekButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }

      // Scroll day into view
      const dayButton = document.querySelector(
        `[data-day="${currentDayOfWeek}"]`
      );
      if (dayButton) {
        dayButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }
    }, 100); // Small delay to ensure state updates have completed
  }, [program, currentWeekNumber, currentDayOfWeek]);

  const handleWeekChange = (weekNumber: number) => {
    setSelectedWeek(weekNumber);

    // If it's the next week (beyond program length), clear expanded days
    if (weekNumber > program.program.length) {
      setExpandedDays([]);
      return;
    }

    // Find the selected week data
    const weekData = program?.program.find((w) => w.week === weekNumber);
    if (!weekData) return;

    // Get current date info for default day selection
    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay() || 7; // Convert Sunday (0) to 7

    // If we have expanded days, try to keep the same day expanded in the new week
    if (expandedDays.length > 0) {
      const currentDayNumber = expandedDays[0];
      // Find the corresponding day in the new week
      const dayExists = weekData.days.find((d) => d.day === currentDayNumber);

      if (dayExists) {
        // Keep the same day expanded if it exists in the new week
        setExpandedDays([currentDayNumber]);
      } else {
        // If the day doesn't exist in the new week, expand the current day of the week
        setExpandedDays([currentDayOfWeek]);
      }
    } else {
      // If no day was expanded, expand the current day of the week
      setExpandedDays([currentDayOfWeek]);
    }

    // Scroll the selected week button into view with a slight delay to ensure DOM update
    setTimeout(() => {
      const weekButton = document.querySelector(`[data-week="${weekNumber}"]`);
      if (weekButton) {
        weekButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }

      // After scrolling the week button into view, scroll to the bottom
      if (containerRef.current) {
        setTimeout(() => {
          containerRef.current?.scrollTo({
            top: containerRef.current.scrollHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    }, 0);
  };

  const handleDayClick = (dayNumber: number) => {
    const isExpanding = !expandedDays.includes(dayNumber);

    // Only change selection if we're selecting a different day
    if (isExpanding) {
      setExpandedDays([dayNumber]); // Show only the clicked day
      
      // Scroll the selected day button into view with a slight delay to ensure DOM update
      setTimeout(() => {
        const dayButton = document.querySelector(`[data-day="${dayNumber}"]`);
        if (dayButton) {
          dayButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center',
          });
        }

        // After scrolling the day button into view, scroll to the bottom
        if (containerRef.current) {
          setTimeout(() => {
            containerRef.current?.scrollTo({
              top: containerRef.current.scrollHeight,
              behavior: 'smooth',
            });
          }, 100);
        }
      }, 0);
    }
    // If already selected, do nothing (prevent deselection)
  };

  const handleDayDetailClick = (day: ProgramDay, dayName: string) => {
    onDaySelect(day, dayName);
  };

  const getDayShortName = (dayOfWeek: number): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayOfWeek - 1];
  };

  // Function to handle feedback submission and program generation
  const handleFeedbackSubmit = async (feedback: ProgramFeedback) => {
    if (!user || !user.uid) {
      console.error('User must be logged in to submit feedback');
      return Promise.reject(new Error('User must be logged in'));
    }
    
    try {
      setIsGeneratingProgram(true);
      
      // Extract only the latest week from the program for the follow-up
      const latestWeekNumber = Math.max(...(program?.program?.map(week => week.week) || [0]));
      const latestWeek = program?.program?.find(week => week.week === latestWeekNumber);
      
      // Create a new program object with only the latest week
      const programWithLatestWeek = {
        ...program,
        program: latestWeek ? [latestWeek] : [],
        questionnaire: answers // Include the original questionnaire answers
      };
      
      // Merge selected exercises with feedback data
      const feedbackWithExercises = {
        ...feedback,
        mostEffectiveExercises: selectedExercises.effective,
        leastEffectiveExercises: selectedExercises.ineffective
      };
      
      // Use the program follow up assistant ID
      const programFollowUpAssistantId = 'asst_PjMTzHis7vLSeDZRhbBB1tbe';
      
      // Submit feedback and generate new program with the specific assistant
      const newProgramId = await submitProgramFeedback(
        user.uid,
        programWithLatestWeek,
        feedbackWithExercises,
        programFollowUpAssistantId
      );
      
      console.log('New program generated with ID:', newProgramId);
      
      // Redirect to refresh program view
      window.location.href = '/program';
      
      return Promise.resolve();
    } catch (error) {
      console.error('Error generating new program:', error);
      setIsGeneratingProgram(false);
      return Promise.reject(error);
    }
  };
  
  const handleFeedbackCancel = () => {
    // Always go back to the program page
    setShowFeedbackQuestionnaire(false);
    setShowExerciseSelectionPage(false);
    
    // Reset scroll position
    setTimeout(() => {
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'instant' });
      }
    }, 0);
  };

  // Extract all unique exercises from the program
  const getAllProgramExercises = (): Exercise[] => {
    if (!program?.program) return [];
    
    const uniqueExercises = new Map<string, Exercise>();
    
    program.program.forEach(week => {
      week.days.forEach(day => {
        if (day.exercises) {
          day.exercises.forEach(exercise => {
            const exerciseId = exercise.id || exercise.exerciseId || exercise.name;
            if (exerciseId && !uniqueExercises.has(exerciseId)) {
              uniqueExercises.set(exerciseId, exercise);
            }
          });
        }
      });
    });
    
    return Array.from(uniqueExercises.values());
  };

  const renderNextWeekCard = () => {
    const nextMonday = getNextMonday(new Date());
    const previousExercises = getAllProgramExercises();
    
    // Show the exercise selection page if user clicked on a field
    if (showExerciseSelectionPage) {
      // Filter exercises to prevent overlap between effective/ineffective selections
      const filteredExercises = previousExercises.filter(exercise => {
        const exerciseId = exercise.id || exercise.exerciseId || exercise.name;
        // For effective selection, filter out exercises already marked as ineffective
        if (selectionStep === 'effective') {
          return !selectedExercises.ineffective.includes(exerciseId);
        }
        // For ineffective selection, filter out exercises already marked as effective
        return !selectedExercises.effective.includes(exerciseId);
      });
      
      return (
        <ExerciseSelectionPage
          previousExercises={filteredExercises}
          onSave={(effective, ineffective) => {
            if (selectionStep === 'effective') {
              handleExerciseSelection(effective, selectedExercises.ineffective);
            } else {
              handleExerciseSelection(selectedExercises.effective, ineffective);
            }
          }}
          onCancel={() => {
            setShowExerciseSelectionPage(false);
            setShowFeedbackQuestionnaire(true);
            
            // Restore feedback form scroll position
            setTimeout(() => {
              if (containerRef.current) {
                containerRef.current.scrollTo({ top: feedbackScrollPosition, behavior: 'instant' });
              }
            }, 0);
          }}
          initialStep={selectionStep}
          initialEffectiveExercises={selectedExercises.effective}
          initialIneffectiveExercises={selectedExercises.ineffective}
        />
      );
    }
    
    // Show the feedback form directly instead of starting with exercise selection
    if (showFeedbackQuestionnaire) {
      return (
        <ProgramFeedbackQuestionnaire
          onSubmit={handleFeedbackSubmit}
          onCancel={handleFeedbackCancel}
          nextWeekDate={nextMonday}
          isFeedbackDay={true}
          previousExercises={previousExercises}
          mostEffectiveExercises={selectedExercises.effective}
          leastEffectiveExercises={selectedExercises.ineffective}
          onEditExercises={handleEditSelection}
        />
      );
    }
    
    // Otherwise just show the "Coming Soon" card with a button to start feedback
    return (
      <div className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <svg
            className="w-12 h-12 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-app-title text-white">Ready for Your Next Program?</h3>
          <p className="text-gray-300">
            Share your feedback on this week&rsquo;s exercises to get your personalized program for next week
          </p>
          <button
            onClick={() => setShowFeedbackQuestionnaire(true)}
            className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
          >
            Start Feedback Process
          </button>
        </div>
      </div>
    );
  };

  if (isLoading || program === null || !Array.isArray(program.program)) {
    return <ProgramLoadingUI />;
  }

  const selectedWeekData = program.program.find((w) => w.week === selectedWeek);

  return (
    <div
      className={`bg-gray-900 flex flex-col h-screen text-white ${
        isLoading ? 'items-center justify-center' : ''
      }`}
    >
      {isLoading ? (
        <ProgramLoadingUI />
      ) : (
        <>
          <style>{scrollbarHideStyles}</style>

          {/* Custom header with title only - hide when showing feedback or selection */}
          {!showFeedbackQuestionnaire && !showExerciseSelectionPage && (
            <>
              <div className="py-3 px-4 flex items-center justify-between">
                {/* Empty spacer with same width as menu button to balance the title */}
                <div className="w-10"></div>
                <div className="flex flex-col items-center">
                  <h1 className="text-app-title text-center">
                    {program.title ||
                      (program.type === ProgramType.Recovery
                        ? t('program.recoveryProgramTitle')
                        : t('program.exerciseProgramTitle'))}
                  </h1>
                  {isActive ? (
                    <div className="mt-1 px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full flex items-center">
                      <span className="w-2 h-2 rounded-full bg-green-400 mr-1"></span>
                      Active Program
                    </div>
                  ) : (
                    <div className="mt-1 px-2 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded-full flex items-center">
                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
                      Inactive Program
                    </div>
                  )}
                </div>
                {/* Space for menu button */}
                <div className="w-10"></div>
              </div>
            </>
          )}

          {/* Program Overview Modal */}
          {showOverview && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/95">
              <div className="max-w-2xl w-full bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50 flex flex-col max-h-[90vh]">
                {/* Fixed Header */}
                <div className="p-8 pb-0">
                  <div className="text-center">
                    <h2 className="text-3xl font-bold text-white tracking-tight">
                      {program.title ||
                        (program.type === ProgramType.Exercise
                          ? t('program.yourExerciseProgramTitle')
                          : t('program.yourRecoveryProgramTitle'))}
                    </h2>
                    <p className="mt-4 text-lg text-gray-400">
                      {program.type === ProgramType.Exercise
                        ? 'Personalized for your fitness goals'
                        : 'Personalized for your recovery journey'}
                    </p>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  <p className="text-xl text-gray-300 leading-relaxed">
                    {program.programOverview}
                  </p>

                  {program.timeFrame && program.timeFrameExplanation && (
                    <div className="border-t border-gray-700/50 pt-6">
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <svg
                          className="w-5 h-5 mr-2 text-indigo-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        Program Duration: {program.timeFrame}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">
                        {program.timeFrameExplanation}
                      </p>
                    </div>
                  )}

                  {program.whatNotToDo && (
                    <div className="border-t border-gray-700/50 pt-6">
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <svg
                          className="w-5 h-5 mr-2 text-red-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                          />
                        </svg>
                        What Not To Do
                      </h3>
                      <p className="text-red-400 leading-relaxed">
                        {program.whatNotToDo}
                      </p>
                    </div>
                  )}

                  {program.afterTimeFrame && (
                    <div className="border-t border-gray-700/50 pt-6">
                      {program.afterTimeFrame.expectedOutcome && (
                        <div className="mb-6">
                          <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                            <svg
                              className="w-5 h-5 mr-2 text-green-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            Expected Outcome
                          </h3>
                          <p className="text-gray-300 leading-relaxed">
                            {program.afterTimeFrame.expectedOutcome}
                          </p>
                        </div>
                      )}

                      {program.afterTimeFrame.nextSteps && (
                        <div>
                          <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                            <svg
                              className="w-5 h-5 mr-2 text-blue-400"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M13 5l7 7-7 7M5 5l7 7-7 7"
                              />
                            </svg>
                            Next Steps
                          </h3>
                          <p className="text-gray-300 leading-relaxed">
                            {program.afterTimeFrame.nextSteps}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Fixed Footer */}
                <div className="p-8 pt-4 border-t border-gray-700/50">
                  <div className="flex justify-center">
                    <button
                      onClick={handleCloseOverview}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-200"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={containerRef} className="h-screen overflow-y-auto pb-32">
            <div className="max-w-4xl mx-auto px-4">
              {/* Program overview button - hide when showing feedback or selection */}
              {!showFeedbackQuestionnaire && !showExerciseSelectionPage && (
                <div className="text-center mb-4 space-y-2 mt-2">
                  <div className="flex justify-center mb-2">
                    <button
                      onClick={() => setShowOverview(true)}
                      className="px-6 py-2 text-sm bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 hover:text-white transition-colors duration-200 inline-flex items-center gap-2"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      View Program Overview
                    </button>
                  </div>
                </div>
              )}

              {/* Only show Week/Day tabs if not showing feedback or exercise selection */}
              {!showFeedbackQuestionnaire && !showExerciseSelectionPage && (
                <>
                  {/* Week Tabs */}
                  <div className="mb-6 overflow-x-auto scrollbar-hide">
                    <div className="flex space-x-2 min-w-max">
                      {program.program.map((week) => (
                        <button
                          key={week.week}
                          data-week={week.week}
                          onClick={() => handleWeekChange(week.week)}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                            selectedWeek === week.week
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                          }`}
                        >
                          Week{' '}
                          {getWeekNumber(
                            new Date(
                              currentDate.getTime() +
                                (week.week - 1) * 7 * 24 * 60 * 60 * 1000
                            )
                          )}
                        </button>
                      ))}
                      <button
                        className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                          selectedWeek === program.program.length + 1
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                        onClick={() => handleWeekChange(program.program.length + 1)}
                      >
                        Next Week
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Selected Week Content */}
              {selectedWeek <= program.program.length && selectedWeekData && !showFeedbackQuestionnaire && !showExerciseSelectionPage ? (
                <div className="space-y-4">
                  {/* Day Tabs */}
                  <div className="overflow-x-auto scrollbar-hide mb-6">
                    <div className="flex space-x-2 min-w-max">
                      {selectedWeekData.days.map((day, index) => (
                        <button
                          key={day.day}
                          data-day={day.day}
                          onClick={() => handleDayClick(day.day)}
                          className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex flex-col items-center ${
                            expandedDays.includes(day.day)
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white opacity-50'
                          }`}
                        >
                          <span className="text-sm opacity-80 mb-1">
                            {getDayShortName(index + 1)}
                          </span>
                          {day.isRestDay ? (
                            <span className="text-xs mt-1 opacity-80">
                              Rest
                            </span>
                          ) : (
                            <span className="text-xs mt-1 opacity-80">
                              Activity
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Day Content */}
                  {expandedDays.map((dayNumber) => {
                    const day = selectedWeekData.days.find(
                      (d) => d.day === dayNumber
                    );
                    if (!day) return null;

                    const dayIndex = selectedWeekData.days.findIndex(
                      (d) => d.day === dayNumber
                    );

                    return (
                      <ProgramDaySummaryComponent
                        key={day.day}
                        day={day}
                        dayName={dayName(dayIndex + 1)}
                        isHighlighted={day.day === 1}
                        onClick={() =>
                          handleDayDetailClick(day, dayName(dayIndex + 1))
                        }
                      />
                    );
                  })}
                </div>
              ) : (
                renderNextWeekCard()
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
