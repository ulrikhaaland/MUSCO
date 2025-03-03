'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramPage } from '@/app/components/ui/ExerciseProgramPage';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import {
  ProgramStatus,
  Exercise,
  ProgramDay,
  ExerciseProgram,
} from '@/app/types/program';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';
import { ErrorDisplay } from '@/app/components/ui/ErrorDisplay';

export default function ProgramPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();
  const {
    program,
    activeProgram,
    isLoading: userLoading,
    programStatus,
    userPrograms,
  } = useUser();
  const [error, setError] = useState<Error | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<
    string | null
  >(null);
  const [selectedProgram, setSelectedProgram] =
    useState<ExerciseProgram | null>(null);

  const isLoading = authLoading || userLoading;

  // Check for a programId in the URL and set the selected program
  useEffect(() => {
    if (typeof window !== 'undefined' && program && userPrograms) {
      const queryParams = new URLSearchParams(window.location.search);
      const programId = queryParams.get('programId');

      if (programId) {
        // Find the specific program by its createdAt value
        const foundProgram = userPrograms
          .flatMap((up) => up.programs)
          .find((p) => p.createdAt.toString() === programId);

        if (foundProgram) {
          setSelectedProgram(foundProgram);
        } else {
          setSelectedProgram(program); // Fallback to the default program
        }
      } else {
        setSelectedProgram(program); // Fallback to the default program
      }
    } else if (program) {
      setSelectedProgram(program);
    }
  }, [program, userPrograms]);

  // Determine if this is the active program of its type
  const isActiveProgram =
    selectedProgram &&
    activeProgram?.programs.some(
      (p) => p.createdAt === selectedProgram.createdAt
    );

  // Update page title when program loads
  useEffect(() => {
    if (selectedProgram?.title && typeof document !== 'undefined') {
      document.title = `${selectedProgram.title} | MUSCO`;
    } else if (typeof document !== 'undefined') {
      document.title = 'Exercise Program | MUSCO';
    }
  }, [selectedProgram]);

  // Redirect to home if no user or program
  useEffect(() => {
    if (!authLoading && !userLoading) {
      if (!user) {
        router.push('/');
      } else if (
        !userPrograms.length &&
        !program &&
        programStatus !== ProgramStatus.Generating
      ) {
        router.push('/');
      }
    }
  }, [
    user,
    userPrograms,
    program,
    programStatus,
    authLoading,
    userLoading,
    router,
  ]);

  // Update page title with program title
  useEffect(() => {
    if (selectedProgram?.title) {
      document.title = `${selectedProgram.title} | Musco`;
    } else {
      document.title = 'Program | Musco';
    }
  }, [selectedProgram?.title]);

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
    if (selectedProgram) {
      router.push(
        `/program/day/${day.day}?programId=${encodeURIComponent(
          selectedProgram.createdAt.toString()
        )}`
      );
    } else {
      router.push(`/program/day/${day.day}`);
    }
  };

  const handleExerciseVideoClick = async (exercise: Exercise) => {
    try {
      setLoadingVideoExercise(exercise.name);
      // Construct a search query with the exercise name
      const searchQuery = `${exercise.name} exercise tutorial`;

      // Search for videos
      const videoId = await searchYouTubeVideo(searchQuery);

      if (videoId) {
        // Create a YouTube embed URL
        setVideoUrl(`https://www.youtube.com/embed/${videoId}?autoplay=1`);
      } else {
        console.error('No video found for', exercise.name);
      }
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoadingVideoExercise(null);
    }
  };

  const renderVideoModal = () => {
    if (!videoUrl) return null;

    return (
      <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden">
          <iframe
            src={videoUrl}
            className="w-full h-full"
            title="Exercise Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
          <button
            onClick={() => setVideoUrl(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2 rounded-full"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullScreen={true} message="Loading program..." />;
  }

  if (error || authError) {
    return <ErrorDisplay error={error || authError} />;
  }

  if (!selectedProgram && programStatus !== ProgramStatus.Generating) {
    return (
      <LoadingSpinner message="Loading program data..." fullScreen={true} />
    );
  }

  if (programStatus === ProgramStatus.Generating) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-900 p-8">
        <LoadingSpinner 
          message="Creating Your Program" 
          submessage="Please wait while we create your personalized program. This may take a minute..."
          fullScreen={true} 
        />
      </div>
    );
  }

  return (
    <>
      <ExerciseProgramPage
        program={selectedProgram}
        isLoading={isLoading}
        onToggleView={handleToggleView}
        dayName={getDayName}
        onVideoClick={handleExerciseVideoClick}
        loadingVideoExercise={loadingVideoExercise}
        onDaySelect={handleDaySelect}
        isActive={isActiveProgram}
      />
      {renderVideoModal()}
    </>
  );
}
