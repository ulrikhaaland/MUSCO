import { LoadingMessage } from './LoadingMessage';
import { useState } from 'react';

interface Exercise {
  name: string;
  description: string;
  sets?: number;
  repetitions?: number;
  rest?: string;
  modification?: string;
  videoUrl?: string;
}

interface ProgramDay {
  day: number;
  exercises: Exercise[];
}

interface ExerciseProgramPageProps {
  onBack: () => void;
  isLoading: boolean;
  program?: {
    programOverview: string;
    program: ProgramDay[];
  };
  isEmbedded?: boolean;
}

function getYouTubeEmbedUrl(url: string): string {
  // Handle different YouTube URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }

  // If no match found, return the original URL
  return url;
}

export function ExerciseProgramPage({
  onBack,
  isLoading,
  program,
  isEmbedded = false,
}: ExerciseProgramPageProps) {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const handleVideoClick = (url: string) => {
    setVideoUrl(getYouTubeEmbedUrl(url));
  };

  const closeVideo = () => {
    setVideoUrl(null);
  };

  return (
    <div className="h-full w-full bg-gray-900">
      <div className="flex-none p-4 border-b border-gray-800">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white"
        >
          <svg
            className="w-6 h-6 mr-2"
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
          Back to chat
        </button>
      </div>

      <div className="overflow-y-auto h-[calc(100%-73px)]" style={{ WebkitOverflowScrolling: 'touch' }}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full space-y-4 px-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            <div className="text-xl text-white font-medium">Creating Program</div>
            <div className="text-gray-400 max-w-sm">Please wait while we generate your personalized exercise program...</div>
          </div>
        ) : program?.program ? (
          <div className="max-w-3xl mx-auto p-4 pb-32 space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-white">Your Exercise Program</h2>
              <p className="mt-4 text-xl text-gray-400">
                {program.programOverview}
              </p>
            </div>

            <div className="space-y-8">
              {program.program.map((day) => (
                <div key={day.day} className="bg-gray-800 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-white mb-4">Day {day.day}</h3>
                  <div className="space-y-4">
                    {day.exercises.map((exercise, index) => (
                      <div key={index} className="bg-gray-700 rounded-lg p-4">
                        <div className="flex justify-between items-start gap-4">
                          <h4 className="text-lg font-medium text-white flex-1">{exercise.name}</h4>
                          {exercise.videoUrl && (
                            <button
                              onClick={() => handleVideoClick(exercise.videoUrl!)}
                              className="flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md text-sm flex-shrink-0"
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
                        <p className="text-gray-300 mt-2">{exercise.description}</p>
                        {exercise.modification && (
                          <p className="text-yellow-300 mt-2 text-sm">
                            <span className="font-medium">Modification:</span> {exercise.modification}
                          </p>
                        )}
                        {exercise.sets && exercise.repetitions && (
                          <div className="mt-4 flex flex-wrap gap-4">
                            <div className="bg-gray-600 px-3 py-1 rounded">
                              <span className="text-gray-300">Sets: {exercise.sets}</span>
                            </div>
                            <div className="bg-gray-600 px-3 py-1 rounded">
                              <span className="text-gray-300">Reps: {exercise.repetitions}</span>
                            </div>
                            {exercise.rest && (
                              <div className="bg-gray-600 px-3 py-1 rounded">
                                <span className="text-gray-300">Rest: {exercise.rest}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className="text-gray-400">No program available</p>
          </div>
        )}
      </div>

      {/* Video Modal */}
      {videoUrl && (
        <div 
          className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center"
          onClick={closeVideo}
        >
          <div className="relative w-full h-auto max-h-[80vh] md:max-w-4xl mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 z-[10000] p-2"
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
            <div className="w-full">
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full rounded-lg"
                  src={videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  style={{ zIndex: 10000 }}
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 