'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramPage } from '@/app/components/ui/ExerciseProgramPage';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { useLoader } from '@/app/context/LoaderContext';
import AddToHomescreen from '@/app/components/ui/AddToHomescreen';
import {
  ProgramStatus,
  Exercise,
  ProgramDay,
  ExerciseProgram,
} from '@/app/types/program';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import { ErrorDisplay } from '@/app/components/ui/ErrorDisplay';
import { useTranslation } from '@/app/i18n';

export default function ProgramPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading, error: authError } = useAuth();
  const {
    program,
    activeProgram,
    isLoading: userLoading,
    programStatus,
    userPrograms,
    setIsLoading: setUserLoading,
  } = useUser();
  const { showLoader, hideLoader, isLoading: loaderLoading } = useLoader();
  const [error, setError] = useState<Error | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<
    string | null
  >(null);
  const [selectedProgram, setSelectedProgram] =
    useState<ExerciseProgram | null>(null);
  const [isOverviewVisible, setIsOverviewVisible] = useState(true);

  const isLoading = authLoading || userLoading || loaderLoading;

  // Always use the combined program with all weeks
  useEffect(() => {
    if (program) {
      setSelectedProgram(program);
    }
  }, [program]);

  // Control the loader visibility based on loading states
  useEffect(() => {
    if (programStatus === ProgramStatus.Generating) {
      showLoader(t('program.creating'), t('program.waitMessage'));
    } else if (isLoading) {
      if (!selectedProgram) {
        showLoader(t('program.loadingData'));
      } else {
        showLoader(t('program.loading'));
      }
    } else {
      // Content is ready, hide the loader
      hideLoader();
    }
  }, [isLoading, selectedProgram, programStatus, t]);

  // Update page title when program loads
  useEffect(() => {
    if (selectedProgram?.title && typeof document !== 'undefined') {
      document.title = `${selectedProgram.title} | bodAI`;
    } else if (typeof document !== 'undefined') {
      document.title = t('program.pageTitle');
    }
  }, [selectedProgram, t]);

  // Redirect to home if no user or program
  useEffect(() => {
    if (!isLoading) {
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
      document.title = t('program.defaultPageTitle');
    }
  }, [selectedProgram?.title, t]);

  // Add a new useEffect to set isLoading false when program page loads
  useEffect(() => {
    // Set UserContext's isLoading to false once the program page is mounted
    if (setUserLoading && !authLoading) {
      // Small delay to ensure the page is fully rendered
      const timer = setTimeout(() => {
        setUserLoading(false);
      }, 200);

      return () => clearTimeout(timer);
    }
  }, [setUserLoading, authLoading]);

  const getDayName = (dayOfWeek: number): string => {
    const days = [
      t('days.monday'),
      t('days.tuesday'),
      t('days.wednesday'),
      t('days.thursday'),
      t('days.friday'),
      t('days.saturday'),
      t('days.sunday'),
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
            title={t('program.exerciseVideoTitle')}
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

  if (error || authError) {
    return <ErrorDisplay error={error || authError} />;
  }

  // We don't need these loader returns anymore as loader visibility is managed by effect
  // Instead, let's render nothing if we're loading
  if (
    isLoading ||
    !selectedProgram ||
    programStatus === ProgramStatus.Generating
  ) {
    return null;
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
        isActive={
          selectedProgram &&
          userPrograms.some(
            (up) =>
              up.active &&
              up.programs.some((p) => p.createdAt === selectedProgram.createdAt)
          )
        }
        onOverviewVisibilityChange={(visible) => setIsOverviewVisible(visible)}
      />
      {renderVideoModal()}
      {!isOverviewVisible && <AddToHomescreen />}
    </>
  );
}
