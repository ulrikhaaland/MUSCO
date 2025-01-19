import { useState, useEffect, useRef, ReactNode } from 'react';
import { ExerciseProgramCalendar } from './ExerciseProgramCalendar';
import { TopBar } from './TopBar';
import { ProgramType } from './ExerciseQuestionnaire';
import { searchYouTubeVideo } from '@/app/utils/youtube';

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
  /** Day of week, where 1 = Monday and 7 = Sunday */
  dayOfWeek: number;
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
}

function getYouTubeEmbedUrl(url: string | undefined | number): string {
  if (!url || typeof url !== 'string') return '';
  
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

function useIntersectionObserver(options: IntersectionObserverInit = {}): [React.RefObject<HTMLDivElement>, boolean] {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);
  const wasIntersectedOnce = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !wasIntersectedOnce.current) {
        setIsVisible(true);
        wasIntersectedOnce.current = true;
      }
    }, { threshold: 0.1, ...options });

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

interface RevealOnScrollProps {
  children: ReactNode;
  className?: string;
}

function RevealOnScroll({ children, className = "" }: RevealOnScrollProps) {
  const [ref, isVisible] = useIntersectionObserver();
  
  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-8"
      } ${className}`}
    >
      {children}
    </div>
  );
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
      const setTime = (45 * exercise.sets);
      const restTime = exercise.rest ? 
        exercise.rest * (exercise.sets - 1) : 
        30 * (exercise.sets - 1);
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
}: ExerciseProgramPageProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const showDetailsButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);

  // Process program to add calculated durations
  useEffect(() => {
    if (program) {
      program.program.forEach(week => {
        week.days.forEach(day => {
          if (!day.isRestDay) {
            day.duration = calculateDuration(day.exercises);
          }
        });
      });
    }
  }, [program]);

  const handleVideoClick = async (exercise: Exercise) => {
    if (loadingVideoExercise === exercise.name) return; // Prevent duplicate requests
    
    // If we already have a video URL, just display it
    if (exercise.videoUrl) {
      setVideoUrl(getYouTubeEmbedUrl(exercise.videoUrl));
      return;
    }
    
    setLoadingVideoExercise(exercise.name);
    try {
      const searchQuery = `${exercise.name} proper form`;
      const videoUrl = await searchYouTubeVideo(searchQuery);
      if (videoUrl) {
        // Update the exercise's videoUrl
        exercise.videoUrl = videoUrl;
        // Show the video
        setVideoUrl(getYouTubeEmbedUrl(videoUrl));
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoadingVideoExercise(null);
    }
  };

  const closeVideo = () => {
    setVideoUrl(null);
  };

  const handleShowDetails = () => {
    setShowDetails(!showDetails);
    if (!showDetails && showDetailsButtonRef.current && containerRef.current) {
        const button = showDetailsButtonRef.current;
        const container = containerRef.current;
        if (button && container) {
          const buttonRect = button.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const relativeTop = buttonRect.top - containerRect.top + container.scrollTop;
          const topBarHeight = 50;
          
          container.scrollTo({
            top: relativeTop - topBarHeight,
            behavior: 'smooth'
          });
        }
    }
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

  if (showCalendar) {
    return (
      <ExerciseProgramCalendar
        program={program}
        onBack={onBack}
        onToggleView={() => setShowCalendar(false)}
        showCalendarView={showCalendar}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 pt-8">
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
        onRightClick={() => setShowCalendar(true)}
      />

      <div 
        ref={containerRef}
        className="pt-8 max-w-4xl mx-auto px-4 pb-8 sm:px-6 lg:px-8 h-[calc(100dvh)] overflow-y-auto"
      >
        <div className="space-y-8 mb-8">
          <RevealOnScroll>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white tracking-tight">
                {programType === ProgramType.Exercise ? 'Your Exercise Program' : 'Your Recovery Program'}
              </h2>
              <p className="mt-4 text-lg text-gray-400">
                {programType === ProgramType.Exercise 
                  ? 'Personalized for your fitness goals'
                  : 'Personalized for your recovery journey'
                }
              </p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50 space-y-6">
              {program.programOverview && (
                <p className="text-xl text-gray-300 leading-relaxed">{program.programOverview}</p>
              )}
              
              <button
                ref={showDetailsButtonRef}
                onClick={handleShowDetails}
                className="flex items-center justify-center w-full text-gray-400 hover:text-white transition-colors duration-200 mt-4"
              >
                <span className="text-sm font-medium mr-2">
                  {showDetails ? "Show Less" : "Show More Details"}
                </span>
                <svg
                  className={`w-5 h-5 transform transition-transform duration-200 ${
                    showDetails ? "rotate-180" : ""
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
                <>
                  {program.timeFrame && program.timeFrameExplanation && (
                    <div className="border-t border-gray-700/50 pt-6" data-program-duration>
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Program Duration: {program.timeFrame}
                      </h3>
                      <p className="text-gray-300 leading-relaxed">{program.timeFrameExplanation}</p>
                    </div>
                  )}
                  {program.whatNotToDo && (
                    <div className="border-t border-gray-700/50 pt-6">
                      <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                        <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        What Not To Do
                      </h3>
                      <p className="text-red-400 leading-relaxed">{program.whatNotToDo}</p>
                    </div>
                  )}
                  {(program.afterTimeFrame?.expectedOutcome || program.afterTimeFrame?.nextSteps) && (
                    <div className="border-t border-gray-700/50 pt-6 space-y-6">
                      {program.afterTimeFrame.expectedOutcome && (
                        <div>
                          <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                            <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Expected Outcome
                          </h3>
                          <p className="text-gray-300 leading-relaxed">{program.afterTimeFrame.expectedOutcome}</p>
                        </div>
                      )}
                      {program.afterTimeFrame.nextSteps && (
                        <div>
                          <h3 className="flex items-center text-lg font-semibold text-white mb-3">
                            <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                            </svg>
                            Next Steps
                          </h3>
                          <p className="text-gray-300 leading-relaxed">{program.afterTimeFrame.nextSteps}</p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </RevealOnScroll>

          <div className="space-y-6">
            {program.program.map((week, index) => (
              <RevealOnScroll key={week.week}>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center">
                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold text-sm mr-3">
                          {week.week}
                        </span>
                        <h3 className="text-xl font-semibold text-white">Week {week.week}</h3>
                      </div>
                      {week.differenceReason && (
                        <div className="text-gray-400 text-sm">
                          {week.differenceReason}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-6">
                    {week.days.map((day, dayIndex) => (
                      <div key={dayIndex} className="bg-gray-900/50 rounded-xl p-6 ring-1 ring-gray-700/30">
                        <div className="flex justify-between items-start mb-4">
                          <h4 className="text-lg font-medium text-white">
                            Day {day.day}
                          </h4>
                          {!day.isRestDay && day.duration && (
                            <div className="flex items-center text-gray-400">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span className="text-sm">{day.duration}</span>
                            </div>
                          )}
                        </div>
                        <p className="text-gray-300 mb-6">{day.description}</p>
                        {!day.isRestDay && (
                          <div className="space-y-4">
                            {day.exercises.map((exercise, exerciseIndex) => (
                              <div key={exerciseIndex} className="bg-gray-800/50 rounded-lg p-4">
                                <div className="flex justify-between items-start gap-4">
                                  <h5 className="text-white font-medium flex-1">{exercise.name}</h5>
                                  <button
                                    onClick={() => handleVideoClick(exercise)}
                                    className="flex items-center space-x-1 bg-indigo-500/90 hover:bg-indigo-400 text-white px-2.5 py-1 rounded-md text-xs transition-colors duration-200"
                                    disabled={loadingVideoExercise === exercise.name}
                                  >
                                    {loadingVideoExercise === exercise.name ? (
                                      <div className="w-3.5 h-3.5 border-t-2 border-white rounded-full animate-spin" />
                                    ) : (
                                      <svg
                                        className="w-3.5 h-3.5"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                      </svg>
                                    )}
                                    <span>Video</span>
                                  </button>
                                </div>
                                {exercise.description && (
                                  <p className="text-gray-300 mt-3 leading-relaxed">{exercise.description}</p>
                                )}
                                {exercise.modification && (
                                  <p className="text-yellow-300/90 mt-3 text-sm leading-relaxed">
                                    <span className="font-medium">Modification:</span>{" "}
                                    {exercise.modification}
                                  </p>
                                )}
                                {exercise.precaution && (
                                  <p className="text-yellow-300/90 mt-2 text-sm leading-relaxed">
                                    <span className="font-medium">Precaution:</span>{" "}
                                    {exercise.precaution}
                                  </p>
                                )}
                                
                                {((exercise.sets && exercise.repetitions) || exercise.duration || exercise.rest) && (
                                  <div className="mt-4 flex flex-wrap gap-3">
                                    {exercise.duration ? (
                                      <div className="bg-gray-800/80 px-4 py-2 rounded-lg">
                                        <span className="text-gray-300 text-sm">
                                          {exercise.duration}
                                        </span>
                                      </div>
                                    ) : (
                                      <>
                                        {exercise.sets && (
                                          <div className="bg-gray-800/80 px-4 py-2 rounded-lg">
                                            <span className="text-gray-300 text-sm">
                                              {exercise.sets} sets
                                            </span>
                                          </div>
                                        )}
                                        {exercise.repetitions && (
                                          <div className="bg-gray-800/80 px-4 py-2 rounded-lg">
                                            <span className="text-gray-300 text-sm">
                                              {exercise.repetitions} reps
                                            </span>
                                          </div>
                                        )}
                                        {exercise.rest && exercise.rest !== 0 && (
                                          <div className="bg-gray-800/80 px-4 py-2 rounded-lg">
                                            <span className="text-gray-300 text-sm">
                                              {exercise.rest} seconds rest
                                            </span>
                                          </div>
                                        )}
                                      </>
                                    )}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </RevealOnScroll>
            ))}
          </div>
        </div>
      </div>

      {videoUrl && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 transition-colors duration-200"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 