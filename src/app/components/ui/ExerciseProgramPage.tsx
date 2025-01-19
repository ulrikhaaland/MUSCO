import { useState, useEffect, useRef, ReactNode } from 'react';
import { ExerciseProgramCalendar } from './ExerciseProgramCalendar';
import { TopBar } from './TopBar';
import { ProgramType } from './ExerciseQuestionnaire';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import { ProgramDayComponent } from './ProgramDayComponent';

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
}

function useIntersectionObserver(
  options: IntersectionObserverInit = {}
): [React.RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const wasIntersectedOnce = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !wasIntersectedOnce.current) {
          setIsVisible(true);
          wasIntersectedOnce.current = true;
        }
      },
      { threshold: 0.1, ...options }
    );

    const element = elementRef.current;
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  return [elementRef, isVisible];
}

function calculateDuration(exercises: Exercise[]): string {
  let totalMinutes = 0;

  exercises.forEach((exercise, index) => {
    // Parse duration string to get minutes
    if (exercise.duration) {
      const durationMatch = exercise.duration.match(/(\d+)/);
      if (durationMatch) {
        totalMinutes += parseInt(durationMatch[0]);
      }
    } else if (exercise.sets && exercise.repetitions) {
      // Estimate time for strength exercises if duration is not provided
      // Assuming 45 seconds per set plus rest time
      const setTime = 45 * exercise.sets;
      const restTime = exercise.rest
        ? exercise.rest * (exercise.sets - 1)
        : 30 * (exercise.sets - 1);
      totalMinutes += Math.ceil((setTime + restTime) / 60);
    }

    // Add transition time between exercises (1 minute)
    if (index < exercises.length - 1) {
      totalMinutes += 2;
    }
  });

  if (totalMinutes < 60) {
    return `${totalMinutes} min`;
  } else {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  }
}

export function ExerciseProgramPage({
  onBack,
  isLoading,
  program,
  programType,
  onToggleView,
  onVideoClick,
  loadingVideoExercise,
}: ExerciseProgramPageProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState(1);
  const [expandedDays, setExpandedDays] = useState<number[]>([]);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const showDetailsButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Set initial day when program loads
  useEffect(() => {
    if (program && program.program.length > 0) {
      const firstWeek = program.program[0];
      if (firstWeek.days.length > 0) {
        setExpandedDays([firstWeek.days[0].day]);
      }
    }
  }, [program]);

  // Process program to add calculated durations
  useEffect(() => {
    if (program) {
      program.program.forEach((week) => {
        week.days.forEach((day) => {
          if (!day.isRestDay) {
            day.duration = calculateDuration(day.exercises);
          }
        });
      });
    }
  }, [program]);

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
    }, 0);
  };

  const handleDayClick = (dayNumber: number) => {
    setExpandedDays(
      (prev) =>
        prev.includes(dayNumber)
          ? [] // If clicking the currently expanded day, collapse it
          : [dayNumber] // Otherwise, show only the clicked day
    );
    setExpandedExercises([]);

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
    }, 0);
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

  const getDayName = (dayOfWeek: number): string => {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];

    return days[dayOfWeek - 1];
  };

  const getDayShortName = (dayOfWeek: number): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayOfWeek - 1];
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex flex-col h-screen">
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
        <div className="max-w-4xl mx-auto px-4 pb-8">
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
                  Week {week.week}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Week Content */}
          {selectedWeekData && (
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
                        <span className="text-xs mt-1 opacity-80">Rest</span>
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
                    dayName={getDayName(dayIndex + 1)}
                    expandedExercises={expandedExercises}
                    onExerciseToggle={(exerciseId) => {
                      setExpandedExercises((prev) =>
                        prev.includes(exerciseId)
                          ? prev.filter((id) => id !== exerciseId)
                          : [...prev, exerciseId]
                      );
                    }}
                    onVideoClick={(exercise) => onVideoClick(exercise)}
                    loadingVideoExercise={loadingVideoExercise}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
