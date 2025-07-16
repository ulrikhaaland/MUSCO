'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramPage } from '@/app/components/ui/ExerciseProgramPage';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { useLoader } from '@/app/context/LoaderContext';
import AddToHomescreen from '@/app/components/ui/AddToHomescreen';
import { logAnalyticsEvent } from '../utils/analytics';
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
  } = useUser();
  const { showLoader, hideLoader, isLoading: loaderLoading } = useLoader();
  const [error, setError] = useState<Error | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<
    string | null
  >(null);
  const [selectedProgram, setSelectedProgram] =
    useState<ExerciseProgram | null>(null);
  const [isOverviewVisible, setIsOverviewVisible] = useState(false);

  const isLoading = (authLoading || userLoading) && !program;

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
      hideLoader();
    }
  }, [isLoading, selectedProgram, programStatus, t, authLoading]);

  // Update page title when program data changes
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (selectedProgram?.title) {
        document.title = `${selectedProgram.title} | BodAI`;
      } else {
        document.title = t('program.defaultPageTitle');
      }
    }
  }, [selectedProgram?.title, t]);

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

  const handleDaySelect = (day: ProgramDay, dayName: string) => {
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
                paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
                paddingTop: '25px',
                height: 0
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
                  border: 'none'
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
        isCustomProgram={!!selectedProgram && !activeProgram}
        onOverviewVisibilityChange={(visible) => setIsOverviewVisible(visible)}
      />
      {renderVideoModal()}
      {!isOverviewVisible && <AddToHomescreen />}
    </>
  );
}
