'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ExerciseProgramPage } from '@/app/components/ui/ExerciseProgramPage';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
// Global loader removed
import AddToHomescreen from '@/app/components/ui/AddToHomescreen';
import { logAnalyticsEvent } from '../utils/analytics';
import {
  Exercise,
  ProgramDay,
  ExerciseProgram,
} from '@/app/types/program';
// import { ProgramType } from '../../../shared/types';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import { ErrorDisplay } from '@/app/components/ui/ErrorDisplay';
import { useTranslation } from '@/app/i18n';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';

function ProgramPageContent({
  isCustomProgram,
}: {
  isCustomProgram?: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { loading: authLoading, error: authError } = useAuth();
  const {
    program,
    activeProgram,
    isLoading: userLoading,
    programStatus: _programStatus,
    userPrograms,
    selectProgram,
    generatingDay,
    generatedDays,
  } = useUser();
  const [error] = useState<Error | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<
    string | null
  >(null);
  const [selectedProgram, setSelectedProgram] =
    useState<ExerciseProgram | null>(null);
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);
  const [hasProcessedUrlParam, setHasProcessedUrlParam] = useState(false);

  const isLoading = (authLoading || userLoading) && !program;
  const forceShimmer =
    searchParams.get('shimmer') === '1' ||
    searchParams.get('shimmer') === 'true' ||
    process.env.NEXT_PUBLIC_FORCE_SHIMMER === '1' ||
    process.env.NEXT_PUBLIC_FORCE_SHIMMER === 'true';

  // Handle program selection based on URL params (only once)
  useEffect(() => {
    const programId = searchParams.get('id');

    if (programId && userPrograms.length > 0 && !hasProcessedUrlParam) {
      // Look up program by ID from URL parameter
      const programIndex = userPrograms.findIndex((p) => p.docId === programId);

      if (programIndex !== -1) {
        console.log(
          '📱 Loading program by ID:',
          userPrograms[programIndex].title
        );
        selectProgram(programIndex);
        setHasProcessedUrlParam(true);
        return;
      } else {
        console.warn('📱 Program not found for ID:', programId);
        setHasProcessedUrlParam(true);
      }
    }

    // Reset flag when URL changes to a different program ID
    if (programId && hasProcessedUrlParam) {
      const currentActiveId = activeProgram?.docId;
      if (currentActiveId !== programId) {
        setHasProcessedUrlParam(false);
      }
    }
  }, [
    searchParams,
    userPrograms,
    hasProcessedUrlParam,
    selectProgram,
    activeProgram?.docId,
  ]);

  // Separate effect for setting the selected program from UserContext
  useEffect(() => {
    if (program && !searchParams.get('id')) {
      console.log('📱 Using default program:', activeProgram?.title);
      setSelectedProgram(program);
    } else if (program && hasProcessedUrlParam) {
      // Update selected program after URL-based selection has been processed
      setSelectedProgram(program);
    }
  }, [program, activeProgram?.title, searchParams, hasProcessedUrlParam]);

  // Global loader removed; rely on local shimmers/spinners

  // Update page title when program data changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (activeProgram?.title) {
        document.title = `${activeProgram.title} | BodAI`;
      } else {
        document.title = t('program.defaultPageTitle');
      }
    }
  }, [activeProgram?.title, t]);

  // Effect to change theme color when video modal is open
  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Get the theme-color meta tag
      const metaThemeColor = document.querySelector('meta[name=theme-color]');

      if (metaThemeColor) {
        if (videoUrl) {
          // Set to black when video modal is open
          metaThemeColor.setAttribute('content', '#000000');
          // Also add a class to the body
          document.body.classList.add('video-modal-open');
        } else {
          // Restore original dark gray when closed
          metaThemeColor.setAttribute('content', '#111827');
          // Remove the class
          document.body.classList.remove('video-modal-open');
        }
      }
    }

    // Cleanup on component unmount
    return () => {
      if (typeof document !== 'undefined') {
        const metaThemeColor = document.querySelector('meta[name=theme-color]');
        if (metaThemeColor) {
          metaThemeColor.setAttribute('content', '#111827');
        }
        document.body.classList.remove('video-modal-open');
      }
    };
  }, [videoUrl]);

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
    logAnalyticsEvent('open_calendar');
    router.push('/program/calendar');
  };

  const handleDaySelect = (day: ProgramDay) => {
    if (selectedProgram) {
      logAnalyticsEvent('open_program_day', { day: day.day });
      router.push(
        `/program/day/${day.day}?programId=${encodeURIComponent(
          selectedProgram.createdAt.toString()
        )}`
      );
    } else {
      logAnalyticsEvent('open_program_day', { day: day.day });
      router.push(`/program/day/${day.day}`);
    }
  };

  const handleExerciseVideoClick = async (exercise: Exercise) => {
    try {
      logAnalyticsEvent('open_exercise_video', { exercise: exercise.name });
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

    // Use a modified YouTube URL that forces the native controls with autoplay
    const enhancedVideoUrl = videoUrl.includes('?')
      ? `${videoUrl}&playsinline=1&controls=1&enablejsapi=1&modestbranding=1&showinfo=0&iv_load_policy=3&autoplay=1&mute=0`
      : `${videoUrl}?playsinline=1&controls=1&enablejsapi=1&modestbranding=1&showinfo=0&iv_load_policy=3&autoplay=1&mute=0`;

    return (
      <>
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="w-full h-full max-w-3xl max-h-[60vh] mx-4"
              style={{
                position: 'relative',
                paddingBottom: '56.25%' /* 16:9 Aspect Ratio */,
                paddingTop: '25px',
                height: 0,
              }}
            >
              <iframe
                src={enhancedVideoUrl}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  border: 'none',
                }}
                title={t('program.exerciseVideoTitle')}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                loading="lazy"
              ></iframe>
            </div>
          </div>
          <button
            onClick={() => setVideoUrl(null)}
            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full z-10"
            aria-label="Close video"
            style={{ touchAction: 'manipulation' }}
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
      </>
    );
  };

  if (error || authError) {
    return <ErrorDisplay error={error || authError} />;
  }



  // Only force shimmer for testing - during generation we use per-day shimmers
  const shouldShimmer = forceShimmer;

  const mobileTitle = selectedProgram?.title || activeProgram?.title || t('program.defaultPageTitle');

  return (
    <div className="flex flex-col flex-1 bg-gray-900 text-white">
      <NavigationMenu mobileTitle={mobileTitle} />
      <ExerciseProgramPage
        program={selectedProgram}
        title={activeProgram?.title}
        type={activeProgram?.type}
        timeFrame={activeProgram?.timeFrame}
        isLoading={!forceShimmer && isLoading && !shouldShimmer}
        shimmer={shouldShimmer}
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
        isCustomProgram={isCustomProgram}
        generatingDay={generatingDay}
        generatedDays={generatedDays}
        onOverviewVisibilityChange={(visible) => setIsOverviewVisible(visible)}
      />
      {renderVideoModal()}
      {!isOverviewVisible && <AddToHomescreen />}
    </div>
  );
}

export default function ProgramPage({
  isCustomProgram,
}: {
  isCustomProgram?: boolean;
}) {
  return (
    <Suspense fallback={null}>
      <ProgramPageContent isCustomProgram={isCustomProgram} />
    </Suspense>
  );
}
