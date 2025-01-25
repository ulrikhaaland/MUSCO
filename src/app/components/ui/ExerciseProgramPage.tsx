import { useState, useEffect, useRef } from 'react';
import { TopBar } from './TopBar';
import { ProgramDayComponent } from './ProgramDayComponent';
import { ProgramType } from '@/app/shared/types';

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

export interface Exercise {
  name: string;
  description: string;
  sets?: number;
  repetitions?: number;
  rest?: number;
  modification?: string;
  videoUrl?: string;
  duration?: string;
  precaution?: string;
  warmup?: boolean;
  instructions?: string;
}

export interface ProgramDay {
  day: number;
  description: string;
  exercises: Exercise[];
  isRestDay: boolean;
  duration?: string;
}

export interface ProgramWeek {
  week: number;
  differenceReason?: string;
  days: ProgramDay[];
}

export interface AfterTimeFrame {
  expectedOutcome: string;
  nextSteps: string;
}

export interface ExerciseProgram {
  programOverview: string;
  timeFrame: string;
  timeFrameExplanation: string;
  afterTimeFrame: AfterTimeFrame;
  whatNotToDo: string;
  program: ProgramWeek[];
}

interface ExerciseProgramPageProps {
  onBack: () => void;
  isLoading: boolean;
  program?: ExerciseProgram;
  programType: ProgramType;
  onToggleView: () => void;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise: string | null;
  dayName: (day: number) => string;
}

// Helper function to get ISO week number
function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

// Add function to get next Sunday's date
function getNextSunday(d: Date): Date {
  const result = new Date(d);
  result.setDate(result.getDate() + (7 - result.getDay()));
  return result;
}

export function ExerciseProgramPage({
  onBack,
  isLoading,
  program,
  programType,
  onToggleView,
  onVideoClick,
  loadingVideoExercise,
  dayName,
}: ExerciseProgramPageProps) {
  // Get current date info
  const currentDate = new Date();
  const currentWeekNumber = getWeekNumber(currentDate);
  const currentDayOfWeek = currentDate.getDay() || 7; // Convert Sunday (0) to 7

  const [showDetails, setShowDetails] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const showDetailsButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial week and day when program loads
  useEffect(() => {
    if (!program || !program.program.length) return;

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

    // Find the selected week data
    const weekData = program?.program.find((w) => w.week === weekNumber);
    if (!weekData) return;

    // If we have expanded days, try to keep the same day expanded in the new week
    if (expandedDays.length > 0) {
      const currentDayNumber = expandedDays[0];
      // Find the corresponding day in the new week
      const dayExists = weekData.days.find((d) => d.day === currentDayNumber);

      if (dayExists) {
        // Keep the same day expanded if it exists in the new week
        setExpandedDays([currentDayNumber]);
      } else {
        // If the day doesn't exist in the new week, expand the first day
        setExpandedDays([weekData.days[0].day]);
      }
    } else if (weekData.days.length > 0) {
      // If no day was expanded, expand the first day
      setExpandedDays([weekData.days[0].day]);
    }

    setExpandedExercises([]);

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

    setExpandedDays(
      (prev) =>
        prev.includes(dayNumber)
          ? [] // If clicking the currently expanded day, collapse it
          : [dayNumber] // Otherwise, show only the clicked day
    );
    setExpandedExercises([]);

    // Only scroll if we're expanding
    if (isExpanding) {
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
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
    if (!showDetails && showDetailsButtonRef.current && containerRef.current) {
      const button = showDetailsButtonRef.current;
      const container = containerRef.current;
      if (button && container) {
        const buttonRect = button.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        const relativeTop =
          buttonRect.top - containerRect.top + container.scrollTop;
        const topBarHeight = 70;

        setTimeout(() => {
          container.scrollTo({
            top: relativeTop - topBarHeight,
            behavior: 'smooth',
          });
        }, 100);
      }
    }
  };

  const getDayShortName = (dayOfWeek: number): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayOfWeek - 1];
  };

  const renderNextWeekCard = () => {
    const nextSunday = getNextSunday(new Date());
    const formattedDate = nextSunday.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

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
          <h3 className="text-xl font-semibold text-white">Coming Soon</h3>
          <p className="text-gray-300">
            Your next week&apos;s program will be available on {formattedDate}
          </p>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col bg-gray-900">
        <div className="flex flex-col items-center justify-center h-full space-y-4 px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          <div className="text-xl text-white font-medium">Creating Program</div>
          <div className="text-gray-400 max-w-sm">
            Please wait while we generate your personalized exercise program...
          </div>
        </div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="h-screen w-screen flex flex-col bg-gray-900">
        <div className="flex flex-col items-center justify-center h-full">
          <p className="text-gray-400">No program available</p>
        </div>
      </div>
    );
  }

  const selectedWeekData = program.program.find((w) => w.week === selectedWeek);

  return (
    <div className="min-h-screen from-gray-900 to-gray-800 flex flex-col h-[calc(100dvh)]">
      <TopBar
        onBack={onBack}
        rightContent={
          <>
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="ml-2">Calendar</span>
          </>
        }
        onRightClick={onToggleView}
      />

      <div ref={containerRef} className="flex-1 overflow-y-auto pt-16">
        <div className="max-w-4xl mx-auto px-4 pb-32">
          {/* Program Overview */}
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-white tracking-tight">
              {programType === ProgramType.Exercise
                ? 'Your Exercise Program'
                : 'Your Recovery Program'}
            </h2>
            <p className="mt-4 text-lg text-gray-400">
              {programType === ProgramType.Exercise
                ? 'Personalized for your fitness goals'
                : 'Personalized for your recovery journey'}
            </p>
          </div>

          {/* Program Overview Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50 space-y-6 mb-8">
            <p className="text-xl text-gray-300 leading-relaxed">
              {program.programOverview}
            </p>
            <button
              ref={showDetailsButtonRef}
              onClick={() => handleShowDetails()}
              className="flex items-center justify-center w-full text-gray-400 hover:text-white transition-colors duration-200"
            >
              <span className="text-sm font-medium mr-2">
                {showDetails ? 'Show Less' : 'Show More Details'}
              </span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-200 ${
                  showDetails ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>

            {showDetails && (
              <div className="space-y-6 pt-4">
                {program.timeFrame && program.timeFrameExplanation && (
                  <div
                    className="border-t border-gray-700/50 pt-6"
                    data-program-duration
                  >
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
                {(program.afterTimeFrame?.expectedOutcome ||
                  program.afterTimeFrame?.nextSteps) && (
                  <div className="border-t border-gray-700/50 pt-6 space-y-6">
                    {program.afterTimeFrame.expectedOutcome && (
                      <div>
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
            )}
          </div>

          {/* Week Tabs */}
          <div className="mb-6 overflow-x-auto scrollbar-hide">
            <div className="flex space-x-2 min-w-max">
              {program.program.map((week) => {
                const weekOffset = week.week - 1;
                const weekDate = new Date(currentDate);
                weekDate.setDate(currentDate.getDate() + weekOffset * 7);
                const actualWeekNumber = getWeekNumber(weekDate);

                return (
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
                    Week {actualWeekNumber}
                  </button>
                );
              })}
              {/* Next Week Button */}
              <button
                onClick={() => setSelectedWeek(program.program.length + 1)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  selectedWeek === program.program.length + 1
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
                }`}
              >
                Week{' '}
                {getWeekNumber(
                  new Date(
                    currentDate.getTime() +
                      program.program.length * 7 * 24 * 60 * 60 * 1000
                  )
                )}
              </button>
            </div>
          </div>

          {/* Selected Week Content */}
          {selectedWeek <= program.program.length
            ? selectedWeekData && (
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
                              : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-white'
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
                      <ProgramDayComponent
                        key={day.day}
                        day={day}
                        dayName={dayName(dayIndex + 1)}
                        expandedExercises={expandedExercises}
                        onExerciseToggle={(exerciseId) => {
                          const isExpanding =
                            !expandedExercises.includes(exerciseId);

                          setExpandedExercises((prev) =>
                            prev.includes(exerciseId)
                              ? prev.filter((id) => id !== exerciseId)
                              : [...prev, exerciseId]
                          );

                          // Only scroll if we're expanding
                          if (isExpanding && containerRef.current) {
                            setTimeout(() => {
                              containerRef.current?.scrollTo({
                                top: containerRef.current.scrollHeight,
                                behavior: 'smooth',
                              });
                            }, 100);
                          }
                        }}
                        onVideoClick={(exercise) => onVideoClick(exercise)}
                        loadingVideoExercise={loadingVideoExercise}
                      />
                    );
                  })}
                </div>
              )
            : renderNextWeekCard()}
        </div>
      </div>
    </div>
  );
}
