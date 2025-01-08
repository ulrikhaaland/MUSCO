import { useState, useEffect, useRef, ReactNode } from 'react';
import { ExerciseProgramCalendar } from './ExerciseProgramCalendar';

export interface Exercise {
  name: string;
  description: string;
  sets?: number;
  repetitions?: number;
  rest?: string;
  modification?: string;
  videoUrl?: string;
  duration?: string;
  precaution?: string;
}

export interface ProgramDay {
  day: number;
  dayOfWeek: number;
  description: string;
  exercises: Exercise[];
  isRestDay: boolean;
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
  program: ProgramDay[];
}

interface ExerciseProgramPageProps {
  onBack: () => void;
  isLoading: boolean;
  program?: ExerciseProgram;
}

function getYouTubeEmbedUrl(url: string): string {
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

export function ExerciseProgramPage({
  onBack,
  isLoading,
  program,
}: ExerciseProgramPageProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);

  const handleVideoClick = (url: string) => {
    setVideoUrl(getYouTubeEmbedUrl(url));
  };

  const closeVideo = () => {
    setVideoUrl(null);
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
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <div className="flex-none p-6 border-b border-gray-800/50">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            <span className="text-sm font-medium">Back to chat</span>
          </button>
          <button
            onClick={() => setShowCalendar(true)}
            className="p-2 rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors duration-200"
          >
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
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <RevealOnScroll>
            <div className="text-center">
              <h2 className="text-4xl font-bold text-white tracking-tight">Your Exercise Program</h2>
              <p className="mt-4 text-lg text-gray-400">Personalized for your recovery and goals</p>
            </div>
          </RevealOnScroll>

          <RevealOnScroll>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50 space-y-6">
              {program.programOverview && (
                <p className="text-xl text-gray-300 leading-relaxed">{program.programOverview}</p>
              )}
              {program.timeFrame && program.timeFrameExplanation && (
                <div className="border-t border-gray-700/50 pt-6">
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
            </div>
          </RevealOnScroll>

          <div className="space-y-6">
            
            {program.program.map((day, index) => (
              <RevealOnScroll key={day.day}>
                <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 shadow-xl ring-1 ring-gray-700/50">
                  <div className="mb-8">
                    <div className="flex items-center mb-4">
                      <span className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-400 font-semibold text-sm mr-3">
                        {day.day}
                      </span>
                      <h3 className="text-xl font-semibold text-white">Day {day.day}</h3>
                    </div>
                    <p className="text-gray-300 leading-relaxed">{day.description}</p>
                  </div>
                  <div className="space-y-4">
                    {day.exercises.map((exercise, index) => (
                      <div key={index} className="bg-gray-900/50 rounded-xl p-6 ring-1 ring-gray-700/30">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-lg font-medium text-white flex-1">
                            {exercise.name}
                          </h4>
                          {exercise.videoUrl && (
                            <button
                              onClick={() => handleVideoClick(exercise.videoUrl!)}
                              className="flex items-center space-x-2 bg-indigo-500 hover:bg-indigo-400 text-white px-4 py-2 rounded-lg text-sm transition-colors duration-200"
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
                                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span>Watch Video</span>
                            </button>
                          )}
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
                        {(exercise.sets || exercise.repetitions || exercise.duration || exercise.rest) && (
                          <div className="mt-4 flex flex-wrap gap-3">
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
                            {exercise.duration && (
                              <div className="bg-gray-800/80 px-4 py-2 rounded-lg">
                                <span className="text-gray-300 text-sm">
                                  {exercise.duration}
                                </span>
                              </div>
                            )}
                            {exercise.rest && exercise.rest !== "n/a" && (
                              <div className="bg-gray-800/80 px-4 py-2 rounded-lg">
                                <span className="text-gray-300 text-sm">
                                  {exercise.rest} rest
                                </span>
                              </div>
                            )}
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