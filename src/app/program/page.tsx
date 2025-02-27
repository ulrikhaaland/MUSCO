'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramPage } from '@/app/components/ui/ExerciseProgramPage';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { ProgramStatus, Exercise, ProgramDay } from '@/app/types/program';
import { searchYouTubeVideo } from '@/app/utils/youtube';

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <pre className="text-red-400 text-sm overflow-auto p-4 bg-gray-800 rounded-lg">
          {error.message}
        </pre>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          Go back
        </button>
      </div>
    </div>
  );
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

export default function ProgramPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { program, isLoading: userLoading, programStatus } = useUser();
  const [error, setError] = useState<Error | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);

  const isLoading = authLoading || userLoading;

  // Update page title when program loads
  useEffect(() => {
    if (program?.title && typeof document !== 'undefined') {
      document.title = `${program.title} | MUSCO`;
    } else if (typeof document !== 'undefined') {
      document.title = 'Exercise Program | MUSCO';
    }
  }, [program]);

  // Redirect to home if no user or program
  useEffect(() => {
    if (!authLoading && !userLoading) {
      if (!user) {
        router.push('/');
      } else if (!program && programStatus !== ProgramStatus.Generating) {
        router.push('/');
      }
    }
  }, [user, program, programStatus, authLoading, userLoading, router]);

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

  const handleToggleView = () => {
    router.push('/program/calendar');
  };

  const handleDaySelect = (day: ProgramDay, dayName: string) => {
    router.push(`/program/day/${day.day}`);
  };

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

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (authError) {
    return <ErrorDisplay error={authError} />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!program && programStatus !== ProgramStatus.Generating) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <ExerciseProgramPage
        isLoading={programStatus === ProgramStatus.Generating}
        program={program}
        onToggleView={handleToggleView}
        onVideoClick={handleVideoClick}
        loadingVideoExercise={loadingVideoExercise}
        dayName={getDayName}
        onDaySelect={handleDaySelect}
      />
      {renderVideoModal()}
    </>
  );
} 