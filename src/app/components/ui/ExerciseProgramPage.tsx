import { useState, useEffect, useRef } from 'react';
import { ProgramDaySummaryComponent } from './ProgramDaySummaryComponent';
import { ProgramType } from '@/app/shared/types';
import {
  Exercise,
  ExerciseProgram,
  ProgramDay,
  ProgramStatus,
} from '@/app/types/program';
import {
  ProgramFeedbackQuestionnaire,
  ProgramFeedback,
} from './ProgramFeedbackQuestionnaire';
import { submitProgramFeedback } from '@/app/services/programFeedbackService';
import { useAuth } from '@/app/context/AuthContext';
import { ExerciseSelectionPage } from './ExerciseSelectionPage';
import { useUser } from '@/app/context/UserContext';
import { useTranslation } from '@/app/i18n';
import { useRouter } from 'next/navigation';

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
  onOverviewVisibilityChange?: (visible: boolean) => void;
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

// Helper function to get the end of the week (Sunday) for a given date
const getEndOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0 is Sunday, 1 is Monday, etc.

  if (dayOfWeek === 0) {
    // Already Sunday
    return result;
  }

  // Add days until we reach Sunday (day 0)
  const daysUntilSunday = 7 - dayOfWeek;
  result.setDate(result.getDate() + daysUntilSunday);

  // Set to end of day (23:59:59.999)
  result.setHours(23, 59, 59, 999);

  return result;
};

// Helper function to get the start of the week (Monday) for a given date
const getStartOfWeek = (date: Date): Date => {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0 is Sunday, 1 is Monday, etc.

  // Calculate days to subtract to get to Monday
  // For Sunday (0), subtract 6 days to get to previous Monday
  // For Monday (1), subtract 0 days
  // For Tuesday (2), subtract 1 day, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  result.setDate(result.getDate() - daysToSubtract);

  // Set to start of day (00:00:00.000)
  result.setHours(0, 0, 0, 0);

  return result;
};

// Create a reusable loading component - no longer needed as we're using the global loader context
// This function is removed in favor of using the global loader context

export function ExerciseProgramPage({
  program,
  isLoading,
  dayName,
  onDaySelect,
  isActive = false,
  onOverviewVisibilityChange,
}: ExerciseProgramPageProps) {
  // Get current date info
  const currentDate = new Date();
  const currentWeekNumber = getWeekNumber(currentDate);
  const currentDayOfWeek = currentDate.getDay() || 7; // Convert Sunday (0) to 7

  const [selectedWeek, setSelectedWeek] = useState<number>(1);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [showOverview, setShowOverview] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFeedbackQuestionnaire, setShowFeedbackQuestionnaire] =
    useState(false);
  const { user } = useAuth();
  const [showExerciseSelectionPage, setShowExerciseSelectionPage] =
    useState(false);
  const [selectedExercises, setSelectedExercises] = useState<{
    effective: string[];
    ineffective: string[];
  }>({
    effective: [],
    ineffective: [],
  });
  // Add state to track which selection step to show
  const [selectionStep, setSelectionStep] = useState<
    'effective' | 'ineffective'
  >('effective');
  // Add state to save feedback form scroll position
  const [feedbackScrollPosition, setFeedbackScrollPosition] = useState(0);
  const { answers, diagnosisData, generateFollowUpProgram } = useUser();
  const { t } = useTranslation();
  const router = useRouter();

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

  // Notify parent when overview visibility changes
  useEffect(() => {
    if (onOverviewVisibilityChange) {
      onOverviewVisibilityChange(showOverview);
    }
  }, [showOverview, onOverviewVisibilityChange]);

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
  const handleExerciseSelection = (
    effectiveExercises: string[],
    ineffectiveExercises: string[]
  ) => {
    // Update the selected exercises
    if (selectionStep === 'effective') {
      setSelectedExercises((prev) => ({
        ...prev,
        effective: effectiveExercises,
      }));
    } else {
      setSelectedExercises((prev) => ({
        ...prev,
        ineffective: ineffectiveExercises,
      }));
    }

    // Return to the feedback form
    setShowExerciseSelectionPage(false);
    setShowFeedbackQuestionnaire(true);

    // Restore feedback form scroll position using window
    setTimeout(() => {
      // Use window.scrollTo for page scroll restoration
      window.scrollTo({ top: feedbackScrollPosition, behavior: 'instant' });
    }, 0);
  };

  // Set initial week and day when program loads
  useEffect(() => {
    if (!program?.program || !Array.isArray(program.program)) return;

    // Get current date for comparison
    const currentDate = new Date();
    const currentTimestamp = currentDate.getTime();

    // Get the current week's Monday and Sunday
    const currentWeekStart = getStartOfWeek(currentDate);
    const currentWeekEnd = getEndOfWeek(currentDate);

    // Sort weeks by createdAt date for consistent processing (earliest to latest)
    const sortedWeeks = [...program.program].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return a.week - b.week;
    });

    // Group weeks by week number to handle multiple programs for the same week
    const weeksByNumber = sortedWeeks.reduce((acc, week) => {
      if (!acc[week.week]) {
        acc[week.week] = [];
      }
      acc[week.week].push(week);
      return acc;
    }, {} as Record<number, typeof sortedWeeks>);

    // For each group, sort by createdAt and keep only the latest
    const latestWeeksByNumber = Object.entries(weeksByNumber).reduce((acc, [weekNum, weeks]) => {
      // Sort by createdAt descending (latest first)
      const sortedByCreatedAt = [...weeks].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0;
      });
      
      // Keep only the latest week for each week number
      acc[parseInt(weekNum)] = sortedByCreatedAt[0];
      return acc;
    }, {} as Record<number, (typeof sortedWeeks)[0]>);

    // Create a new array of weeks that contains only the latest version of each week
    const deduplicatedWeeks = Object.values(latestWeeksByNumber).sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return a.week - b.week;
    });

    // Default to the most recent week (last in the sorted array)
    let weekToSelect = deduplicatedWeeks.length > 0 ? deduplicatedWeeks[deduplicatedWeeks.length - 1].week : 1;
    let foundMatch = false;
    
    // Try to find the week that contains today's date - SEARCH IN REVERSE (newest first)
    // Create a copy of deduplicatedWeeks sorted newest first
    const newestFirstWeeks = [...deduplicatedWeeks].sort((a, b) => {
      if (a.createdAt && b.createdAt) {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return b.week - a.week;
    });
    
    // Now search through weeks newest to oldest
    for (const week of newestFirstWeeks) {
      if (week.createdAt) {
        const weekCreatedAt = new Date(week.createdAt);
        const weekStartDate = getStartOfWeek(weekCreatedAt);
        const weekEndDate = getEndOfWeek(weekCreatedAt);

        // Check if current date falls within this week's time range
        // or if current week overlaps with program week
        const isCurrentDateInWeekRange =
          currentTimestamp >= weekStartDate.getTime() &&
          currentTimestamp <= weekEndDate.getTime();

        const doWeeksOverlap =
          currentWeekStart.getTime() <= weekEndDate.getTime() &&
          currentWeekEnd.getTime() >= weekStartDate.getTime();

        if (isCurrentDateInWeekRange || doWeeksOverlap) {
          weekToSelect = week.week;
          foundMatch = true;
          break;
        }
      }
    }

    // If no direct match found, use the most recent week (already set as default)
    setSelectedWeek(weekToSelect);
    setExpandedDays([currentDayOfWeek]);

    // Scroll the selected week button into view with a short delay to ensure rendering is complete
    setTimeout(() => {
      // Scroll to the last/latest week button first to ensure the scroll area shows the most recent weeks
      const weekButtons = document.querySelectorAll('[data-week]');
      const lastWeekButton = weekButtons[weekButtons.length - 1];
      
      if (lastWeekButton) {
        lastWeekButton.scrollIntoView({
          behavior: 'instant',
          block: 'nearest',
          inline: 'end'
        });
      }
      
      // Then scroll to the selected week button
      const selectedWeekButton = document.querySelector(`[data-week="${weekToSelect}"]`);
      if (selectedWeekButton) {
        selectedWeekButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center'
        });
      }

      // Scroll day into view
      const dayButton = document.querySelector(`[data-day="${currentDayOfWeek}"]`);
      if (dayButton && selectedWeekButton) {
        setTimeout(() => {
          dayButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
          });
        }, 100);
      }
    }, 100);
  }, [program, currentDayOfWeek]);

  const handleWeekChange = (weekNumber: number) => {
    setSelectedWeek(weekNumber);

    // If it's the next week (beyond program length), clear expanded days
    if (weekNumber > program.program.length) {
      setExpandedDays([]);
      return;
    }

    // Find the selected week data - but make sure we get the latest version of that week
    const weeksWithSameNumber = program?.program.filter(w => w.week === weekNumber);
    let weekData;
    
    if (weeksWithSameNumber.length > 1) {
      // Multiple versions - sort by createdAt descending and take the first one
      weekData = [...weeksWithSameNumber].sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return 0; 
      })[0];
    } else {
      // Only one version - use it directly
      weekData = weeksWithSameNumber[0];
    }
    
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

    // Scroll the selected week button into view using element.scrollIntoView
    setTimeout(() => {
      const weekButton = document.querySelector(`[data-week="${weekNumber}"]`);
      if (weekButton) {
        weekButton.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'center',
        });
      }

      // Scroll towards the bottom after week potentially scrolled into view
      // Use window scroll
      setTimeout(() => {
        const targetY = document.body.scrollHeight * 0.8; // Scroll 80% down
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      }, 150); // Delay slightly after element scroll
    }, 0);
  };

  const handleDayClick = (dayNumber: number) => {
    const isExpanding = !expandedDays.includes(dayNumber);

    if (isExpanding) {
      setExpandedDays([dayNumber]); // Show only the clicked day

      // Scroll the selected day button into view using element.scrollIntoView
      setTimeout(() => {
        const dayButton = document.querySelector(`[data-day="${dayNumber}"]`);
        if (dayButton) {
          dayButton.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest', // Changed to 'nearest' to avoid unnecessary large scrolls
            inline: 'center',
          });
        }

        // Scroll towards the bottom after day potentially scrolled into view
        // Use window scroll
        setTimeout(() => {
          const targetY = document.body.scrollHeight * 0.8; // Scroll 80% down
          window.scrollTo({ top: targetY, behavior: 'smooth' });
        }, 150); // Delay slightly after element scroll
      }, 0);
    }
  };

  const handleDayDetailClick = (day: ProgramDay, dayName: string) => {
    onDaySelect(day, dayName);
  };

  // Helper function to get the day short name with translations
  function getDayShortName(dayOfWeek: number, t: (key: string) => string): string {
    const days = [
      t('exerciseProgram.dayAbbr.mon'),
      t('exerciseProgram.dayAbbr.tue'),
      t('exerciseProgram.dayAbbr.wed'),
      t('exerciseProgram.dayAbbr.thu'),
      t('exerciseProgram.dayAbbr.fri'),
      t('exerciseProgram.dayAbbr.sat'),
      t('exerciseProgram.dayAbbr.sun')
    ];
    return days[dayOfWeek - 1];
  }

  // Helper function to get the translated month abbreviation
  function getMonthAbbreviation(month: number, t: (key: string) => string): string {
    const months = [
      t('month.jan'),
      t('month.feb'),
      t('month.mar'),
      t('month.apr'),
      t('month.may'),
      t('month.jun'),
      t('month.jul'),
      t('month.aug'),
      t('month.sep'),
      t('month.oct'),
      t('month.nov'),
      t('month.dec')
    ];
    return months[month];
  }

  // Function to handle feedback submission and program generation
  const handleFeedbackSubmit = async (feedback: ProgramFeedback) => {
    if (!user || !user.uid) {
      console.error(t('exerciseProgram.feedback.error'));
      return Promise.reject(new Error(t('exerciseProgram.feedback.error')));
    }

    try {
      // Extract only the latest week from the program for the follow-up
      const latestWeekNumber = Math.max(
        ...(program?.program?.map((week) => week.week) || [0])
      );
      const latestWeek = program?.program?.find(
        (week) => week.week === latestWeekNumber
      );

      // Create a new program object with only the latest week
      const programWithLatestWeek = {
        ...program,
        program: latestWeek ? [latestWeek] : [],
      };

      // Merge selected exercises with feedback data
      const feedbackWithExercises = {
        ...feedback,
        mostEffectiveExercises: selectedExercises.effective,
        leastEffectiveExercises: selectedExercises.ineffective,
      };

      // Submit feedback and generate new program with the specific assistant
      const newProgramId = await submitProgramFeedback(
        user.uid,
        programWithLatestWeek,
        diagnosisData,
        answers,
        feedbackWithExercises
      );

      console.log(t('exerciseProgram.feedback.success'), newProgramId);

      // Redirect to refresh program view
      generateFollowUpProgram();

      return Promise.resolve();
    } catch (error) {
      console.error(t('exerciseProgram.feedback.error.generating'), error);
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

    // Find the latest week based on createdAt date
    const latestWeek = program.program.reduce((latest, current) => {
      if (!latest.createdAt) return current;
      if (!current.createdAt) return latest;
      return new Date(current.createdAt) > new Date(latest.createdAt)
        ? current
        : latest;
    }, program.program[0]);

    // Only process exercises from the latest week
    if (latestWeek) {
      latestWeek.days.forEach((day) => {
        if (day.exercises) {
          day.exercises.forEach((exercise) => {
            const exerciseId =
              exercise.id || exercise.exerciseId || exercise.name;
            if (exerciseId && !uniqueExercises.has(exerciseId)) {
              uniqueExercises.set(exerciseId, exercise);
            }
          });
        }
      });
    }

    return Array.from(uniqueExercises.values());
  };

  // Render next week card function inside the component
  const renderNextWeekCard = () => {
    const nextMonday = getNextMonday(new Date());
    const previousExercises = getAllProgramExercises();

    // Show the exercise selection page if user clicked on a field
    if (showExerciseSelectionPage) {
      // Filter exercises to prevent overlap between effective/ineffective selections
      const filteredExercises = previousExercises.filter((exercise) => {
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
                containerRef.current.scrollTo({
                  top: feedbackScrollPosition,
                  behavior: 'instant',
                });
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
          <h3 className="text-app-title text-white">
            {t('exerciseProgram.nextWeekCard.title')}
          </h3>
          <p className="text-gray-300">
            {t('exerciseProgram.nextWeekCard.description')}
          </p>
          <button
            onClick={() => setShowFeedbackQuestionnaire(true)}
            className="mt-4 px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
          >
            {t('exerciseProgram.nextWeekCard.button')}
          </button>
        </div>
      </div>
    );
  };

  // If loading or no program, just return null as we're using the global loader context
  if (isLoading || program === null || !Array.isArray(program.program)) {
    return null;
  }

  // If showing exercise selection page, display that instead
  if (showExerciseSelectionPage) {
    return (
      <ExerciseSelectionPage
        previousExercises={getAllProgramExercises()}
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
              containerRef.current.scrollTo({
                top: feedbackScrollPosition,
                behavior: 'instant',
              });
            }
          }, 0);
        }}
        initialStep={selectionStep}
        initialEffectiveExercises={selectedExercises.effective}
        initialIneffectiveExercises={selectedExercises.ineffective}
      />
    );
  }

  // If showing feedback questionnaire, display that instead
  if (showFeedbackQuestionnaire) {
    return (
      <ProgramFeedbackQuestionnaire
        onSubmit={handleFeedbackSubmit}
        onCancel={handleFeedbackCancel}
        nextWeekDate={getNextMonday(new Date())}
        isFeedbackDay={true}
        previousExercises={getAllProgramExercises()}
      />
    );
  }

  const selectedWeekData = program.program.find((w) => w.week === selectedWeek);

  return (
    <div
      className={`bg-gray-900 flex flex-col min-h-screen text-white ${
        isLoading ? 'items-center justify-center' : ''
      }`}
    >
      {isLoading ? (
        <div className="w-full flex items-center justify-center bg-gray-900 py-20">
          {/* We're using the global loader context now, no need for a spinner here */}
          <div className="text-center">
            <p className="text-gray-400">{t('exerciseProgram.loading')}</p>
          </div>
        </div>
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
                      {t('exerciseProgram.badge.active')}
                    </div>
                  ) : (
                    <div className="mt-1 px-2 py-0.5 bg-gray-500/20 text-gray-300 text-xs rounded-full flex items-center">
                      <span className="w-2 h-2 rounded-full bg-gray-400 mr-1"></span>
                      {t('exerciseProgram.badge.inactive')}
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
                        ? t('exerciseProgram.overview.title.exercise')
                        : t('exerciseProgram.overview.title.recovery')}
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
                        {t('exerciseProgram.overview.programDuration')} {program.timeFrame}
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
                        {t('exerciseProgram.overview.whatNotToDo')}
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
                            {t('exerciseProgram.overview.expectedOutcome')}
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
                            {t('exerciseProgram.overview.nextSteps')}
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
                      {t('exerciseProgram.button.getStarted')}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
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
                      {t('exerciseProgram.button.viewOverview')}
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
                      {/* Group weeks by week number and use only the latest version of each week */}
                      {(() => {
                        // Group weeks by their week number
                        const weeksByNumber = program.program.reduce((acc, week) => {
                          if (!acc[week.week]) {
                            acc[week.week] = [];
                          }
                          acc[week.week].push(week);
                          return acc;
                        }, {} as Record<number, typeof program.program>);
                        
                        // For each group, get only the latest version by createdAt
                        const uniqueWeeks = Object.entries(weeksByNumber).map(([weekNum, weeks]) => {
                          // Sort by createdAt descending (latest first)
                          return weeks.sort((a, b) => {
                            if (a.createdAt && b.createdAt) {
                              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                            }
                            return 0;
                          })[0]; // Take the first (latest) one
                        });
                        
                        // Sort unique weeks by createdAt ascending (earliest to latest)
                        return uniqueWeeks.sort((a, b) => {
                          if (a.createdAt && b.createdAt) {
                            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                          }
                          return a.week - b.week;
                        }).map(week => (
                          <button
                            key={`${week.week}-${week.createdAt}`}
                            data-week={week.week}
                            onClick={() => handleWeekChange(week.week)}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                              selectedWeek === week.week
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                            }`}
                          >
                            {t('exerciseProgram.weekTab')}{' '}
                            {week.createdAt
                              ? getWeekNumber(new Date(week.createdAt))
                              : getWeekNumber(
                                  new Date(
                                    currentDate.getTime() +
                                      (week.week - 1) * 7 * 24 * 60 * 60 * 1000
                                  )
                                )}
                            {week.createdAt && (
                              <span className="text-xs opacity-70 block">
                                {(() => {
                                  // Calculate week start (Monday) and end (Sunday) dates
                                  const weekCreatedAt = new Date(week.createdAt);
                                  const weekStart = getStartOfWeek(weekCreatedAt);
                                  const weekEnd = getEndOfWeek(weekCreatedAt);
                                  
                                  // Format the dates with translated month names
                                  const startMonth = getMonthAbbreviation(weekStart.getMonth(), t);
                                  const startDay = weekStart.getDate();
                                  const endDay = weekEnd.getDate();
                                  const endMonth = getMonthAbbreviation(weekEnd.getMonth(), t);
                                  
                                  // If start and end are in the same month, use "Month Day-Day" format
                                  if (startMonth === endMonth) {
                                    return `${startMonth} ${startDay}-${endDay}`;
                                  }
                                  
                                  // Otherwise, use "Month Day-Month Day" format
                                  return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
                                })()}
                              </span>
                            )}
                          </button>
                        ));
                      })()}
                      <button
                        data-week={program.program.length + 1}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                          selectedWeek === program.program.length + 1
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                        }`}
                        onClick={() =>
                          handleWeekChange(program.program.length + 1)
                        }
                      >
                        {t('exerciseProgram.nextWeek')}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Selected Week Content */}
              {selectedWeek <= program.program.length &&
              !showFeedbackQuestionnaire &&
              !showExerciseSelectionPage ? (
                <div className="space-y-4">
                  {/* Get the latest version of the selected week */}
                  {(() => {
                    // Find all versions of the selected week
                    const weeksWithSameNumber = program?.program.filter(w => w.week === selectedWeek);
                    let selectedWeekData;
                    
                    if (weeksWithSameNumber.length > 1) {
                      // Multiple versions - sort by createdAt descending and take the first one
                      selectedWeekData = [...weeksWithSameNumber].sort((a, b) => {
                        if (a.createdAt && b.createdAt) {
                          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        }
                        return 0; 
                      })[0];
                    } else {
                      // Only one version - use it directly
                      selectedWeekData = weeksWithSameNumber[0];
                    }
                    
                    if (!selectedWeekData) return null;
                    
                    return (
                      <>
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
                                  {getDayShortName(index + 1, t)}
                                </span>
                                {day.isRestDay ? (
                                  <span className="text-xs mt-1 opacity-80">
                                    {t('exerciseProgram.day.rest')}
                                  </span>
                                ) : (
                                  <span className="text-xs mt-1 opacity-80">
                                    {t('calendar.workout')}
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
                      </>
                    );
                  })()}
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
