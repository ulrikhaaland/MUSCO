import { useState, useEffect } from 'react';
import { ExerciseProgramPage } from './ExerciseProgramPage';
import { ExerciseProgramCalendar } from './ExerciseProgramCalendar';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import type { Exercise, ExerciseProgram } from './ExerciseProgramPage';
import { ProgramType } from '@/app/shared/types';

interface ExerciseProgramContainerProps {
  onBack: () => void;
  isLoading: boolean;
  program?: ExerciseProgram;
  programType: ProgramType;
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export function ExerciseProgramContainer({
  onBack,
  isLoading,
  program,
  programType,
}: ExerciseProgramContainerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);
  const [processedProgram, setProcessedProgram] = useState<ExerciseProgram | undefined>(program);

  // Function to parse timeframe string and get number of weeks
  const parseTimeFrame = (timeFrame: string): number => {
    const match = timeFrame.match(/(\d+)\s*weeks?/i);
    return match ? parseInt(match[1], 10) : 1;
  };

  // Process program to duplicate weeks if needed
  useEffect(() => {
    if (!program) return;

    const targetWeeks = parseTimeFrame(program.timeFrame || '1 week');
    const currentWeeks = program.program.length;

    if (currentWeeks < targetWeeks) {
      let duplicatedWeeks;
      
      if (currentWeeks === 1) {
        // If there's only one week, duplicate it for all weeks
        const firstWeek = program.program[0];
        duplicatedWeeks = Array.from({ length: targetWeeks }, (_, index) => ({
          ...firstWeek,
          week: index + 1,
        }));
      } else {
        // If there are multiple weeks but we need more, keep existing weeks and duplicate the last week
        const lastWeek = program.program[currentWeeks - 1];
        duplicatedWeeks = [
          ...program.program,
          ...Array.from({ length: targetWeeks - currentWeeks }, (_, index) => ({
            ...lastWeek,
            week: currentWeeks + index + 1,
          }))
        ];
      }

      setProcessedProgram({
        ...program,
        program: duplicatedWeeks,
      });
    } else {
      setProcessedProgram(program);
    }
  }, [program]);

  const handleVideoClick = async (exercise: Exercise) => {
    if (loadingVideoExercise === exercise.name) return;

    if (exercise.videoUrl) {
      setVideoUrl(getYouTubeEmbedUrl(exercise.videoUrl));
      return;
    }

    setLoadingVideoExercise(exercise.name);
    try {
      const searchQuery = `${exercise.name} proper form`;
      const videoUrl = await searchYouTubeVideo(searchQuery);
      if (videoUrl) {
        exercise.videoUrl = videoUrl;
        setVideoUrl(getYouTubeEmbedUrl(videoUrl));
      }
    } catch (error) {
      console.error('Error fetching video:', error);
    } finally {
      setLoadingVideoExercise(null);
    }
  };

  const closeVideo = () => setVideoUrl(null);

  // Loading and error states
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

  // Render video modal
  const renderVideoModal = () => {
    if (!videoUrl) return null;

    return (
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
    );
  };

  return (
    <>
      {showCalendar ? (
        <ExerciseProgramCalendar
          program={processedProgram}
          onBack={onBack}
          onToggleView={() => setShowCalendar(false)}
          showCalendarView={showCalendar}
          onVideoClick={handleVideoClick}
          loadingVideoExercise={loadingVideoExercise}
        />
      ) : (
        <ExerciseProgramPage
          onBack={onBack}
          isLoading={isLoading}
          program={processedProgram}
          programType={programType}
          onToggleView={() => setShowCalendar(true)}
          onVideoClick={handleVideoClick}
          loadingVideoExercise={loadingVideoExercise}
        />
      )}
      {renderVideoModal()}
    </>
  );
} 