'use client';

import { useState, useEffect, useRef, useMemo, Suspense, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProgramStatus, Exercise, ProgramDay, ExerciseProgram } from '@/app/types/program';
import { ProgramDayComponent } from '@/app/components/ui/ProgramDayComponent';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { useSelectedDay } from '@/app/context/SelectedDayContext';
import { ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/firebase/config';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { logAnalyticsEvent } from '../../../utils/analytics';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import { getDayFullName, getStartOfWeek } from '@/app/utils/dateutils';
import { markDayAsCompleted } from '@/app/services/workoutSessionService';

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

function isYouTubeUrl(url: string): boolean {
  const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  return youtubeRegExp.test(url);
}

function _isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com') || url.includes('player.vimeo.com');
}

function isFirebaseStorageUrl(url: string): boolean {
  return url.startsWith('gs://');
}

function getVideoEmbedUrl(url: string): string {
  // YouTube URL handling
  const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const youtubeMatch = url.match(youtubeRegExp);

  if (youtubeMatch && youtubeMatch[2].length === 11) {
    return `https://www.youtube.com/embed/${youtubeMatch[2]}`;
  }
  
  // For non-YouTube URLs (including potential direct video links, etc.), return as is.
  // Firebase download URLs will already be HTTPS.
  return url;
}

function DayDetailPageContent() {
  // Use a persistent ID to avoid duplicate render issues
  const _componentId = useRef(`day-page-${Date.now()}`);
  
  // Router and params - get these first
  const router = useRouter();
  const params = useParams();
  const dayParam = params.day as string;
  const dayNumber = parseInt(dayParam);
  
  // Access context data
  const { user, error: authError } = useAuth();
  const { program, programStatus, userPrograms, activeProgram, markDayCompleteInMemory } = useUser();
  const { selectedDayData } = useSelectedDay();
  const { t } = useTranslation();
  
  // Check if we have cached data for this specific day (instant render)
  const hasCachedData = selectedDayData && selectedDayData.day.day === dayNumber;
  
  // Component state - initialize from cached data if available for instant render
  const [error, setError] = useState<Error | null>(null);
  const [dayData, setDayData] = useState<ProgramDay | null>(
    hasCachedData ? selectedDayData.day : null
  );
  const [dayName, setDayName] = useState(
    hasCachedData ? selectedDayData.dayName : ''
  );
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ExerciseProgram | null>(
    hasCachedData ? { ...selectedDayData.program, title: selectedDayData.programTitle } : null
  );
  const [preloadedVideoUrls, setPreloadedVideoUrls] = useState<{ [key: string]: string }>({});
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(-1);
  const [_dataLoaded, setDataLoaded] = useState(hasCachedData);

  // Log analytics when page loads with cached data
  useEffect(() => {
    if (hasCachedData) {
      logAnalyticsEvent('view_program_day', { day: dayNumber });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load data effect - only needed if no cached data (fallback for direct URL access)
  useEffect(() => {
    // Skip if we already have cached data
    if (hasCachedData) return;
    
    let mounted = true;
    
    const loadProgramData = async () => {
      try {
        // Skip processing if component unmounted
        if (!mounted) return;
        
        // 1. Determine which program to use
        let programToUse = program;
        let programTitle = activeProgram?.title || 'Exercise Program';
        
        if (typeof window !== 'undefined' && userPrograms) {
          const queryParams = new URLSearchParams(window.location.search);
          const programId = queryParams.get('programId');
          
          if (programId) {
            // Find the UserProgram that contains the specific program by its createdAt value
            const foundUserProgram = userPrograms.find(up => 
              up.programs.some(p => p.createdAt.toString() === programId)
            );
            
            if (foundUserProgram) {
              // Get the specific ExerciseProgram
              const foundProgram = foundUserProgram.programs.find(p => 
                p.createdAt.toString() === programId
              );
              
              if (foundProgram) {
                programToUse = foundProgram;
                programTitle = foundUserProgram.title; // Preserve the title from UserProgram
              }
            }
          }
        }
        
        // Skip further processing if component unmounted
        if (!mounted) return;
        
        // 2. Set the selected program immediately with the preserved title
        setSelectedProgram(programToUse ? { ...programToUse, title: programTitle } : null);
        
        // 3. Find the day data if program is available
        if (programToUse?.days && !isNaN(dayNumber)) {
          const day = programToUse.days.find(d => d.day === dayNumber);
          if (day) {
            // Skip if component unmounted
            if (!mounted) return;
            
            // 4. Set day data and name at the same time
            setDayData(day);
            setDayName(getDayFullName(dayNumber, t));

            // 5. Mark data as loaded
            setDataLoaded(true);
            logAnalyticsEvent('view_program_day', { day: dayNumber });
          }
        }
      } catch (err) {
        console.error('Error loading program data:', err);
        if (mounted) {
          setError(err instanceof Error ? err : new Error('Failed to load program data'));
        }
      }
    };
    
    loadProgramData();
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [program, userPrograms, dayNumber, hasCachedData]);

  // Loader removed

  // Update page title
  useEffect(() => {
    if (dayName && typeof document !== 'undefined') {
      document.title = `${dayName} - Program | BodAI`;
    } else if (typeof document !== 'undefined') {
      document.title = 'Program Day | BodAI';
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayName]);

  // Preload video URLs when day data is available
  useEffect(() => {
    if (!dayData?.exercises) return;
    
    const preloadVideos = async () => {
      const urlCache: { [key: string]: string } = {};
      const preloadLinks: HTMLLinkElement[] = [];
      
      for (const exercise of dayData.exercises) {
        if (!exercise.videoUrl || !exercise.name) continue;
        
        try {
          let downloadUrl: string;
          
          if (isFirebaseStorageUrl(exercise.videoUrl)) {
            const storageRef = ref(storage, exercise.videoUrl);
            downloadUrl = await getDownloadURL(storageRef);
          } else if (isYouTubeUrl(exercise.videoUrl)) {
            // YouTube URLs don't need preloading - they're iframes
            continue;
          } else {
            downloadUrl = exercise.videoUrl;
          }
          
          urlCache[exercise.name] = downloadUrl;
          
          // Add preload link hint for the video file
          if (typeof document !== 'undefined') {
            const linkId = `preload-video-${exercise.name.replace(/\s+/g, '-')}`;
            if (!document.getElementById(linkId)) {
              const link = document.createElement('link');
              link.id = linkId;
              link.rel = 'preload';
              link.as = 'video';
              link.href = downloadUrl;
              link.crossOrigin = 'anonymous';
              document.head.appendChild(link);
              preloadLinks.push(link);
            }
          }
        } catch {
          // Silent fail for preloading - will fetch on demand
        }
      }
      
      if (Object.keys(urlCache).length > 0) {
        setPreloadedVideoUrls(prev => ({ ...prev, ...urlCache }));
      }
    };
    
    preloadVideos();
    
    // Cleanup preload links on unmount
    return () => {
      if (typeof document !== 'undefined') {
        dayData.exercises.forEach(exercise => {
          if (!exercise.name) return;
          const linkId = `preload-video-${exercise.name.replace(/\s+/g, '-')}`;
          const link = document.getElementById(linkId);
          if (link) {
            document.head.removeChild(link);
          }
        });
      }
    };
  }, [dayData]);

  // Redirect only if there is no program available (allow guest access for custom programs)
  useEffect(() => {
    if (!program && programStatus !== ProgramStatus.Generating) {
      router.push('/program');
    }
  }, [program, programStatus, router]);

  // Inject one-time global style for modal scroll lock
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const styleId = 'video-modal-scroll-lock';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `body.video-modal-open { overflow: hidden !important; touch-action: none; }`;
        document.head.appendChild(style);
      }
    }
  }, []);

  // Simplified exercise toggle without preloading
  const handleExerciseToggle = (exerciseName: string) => {
    const isCurrentlyExpanded = expandedExercises.includes(exerciseName);
    setExpandedExercises(prev => 
      isCurrentlyExpanded
        ? prev.filter(name => name !== exerciseName)
        : [...prev, exerciseName]
    );
  };

  // Handle video clicks with simpler implementation
  const handleVideoClick = async (exercise: Exercise) => {
    if (loadingVideoExercise === exercise.name) return;

    logAnalyticsEvent('open_exercise_video', { exercise: exercise.name });

    // Find the index of the exercise in the day's exercises
    const exerciseIndex = dayData?.exercises.findIndex(ex => ex.name === exercise.name) ?? -1;
    setCurrentExerciseIndex(exerciseIndex);

    // --- Check for Preloaded URL First ---
    if (preloadedVideoUrls[exercise.name]) {
      setVideoUrl(preloadedVideoUrls[exercise.name]);
      return;
    }

    setLoadingVideoExercise(exercise.name);
    
    try {
      if (exercise.videoUrl) {
        if (isFirebaseStorageUrl(exercise.videoUrl)) {
          // Fetch Firebase download URL
          const storageRef = ref(storage, exercise.videoUrl);
          const downloadUrl = await getDownloadURL(storageRef);
          setVideoUrl(downloadUrl);
        } else {
          setVideoUrl(getVideoEmbedUrl(exercise.videoUrl));
        }
      } else {
        // Search YouTube
        const searchQuery = `${exercise.name} proper form`;
        const youtubeUrl = await searchYouTubeVideo(searchQuery);
        if (youtubeUrl) {
          exercise.videoUrl = youtubeUrl;
          setVideoUrl(getVideoEmbedUrl(youtubeUrl));
        } else {
          setVideoUrl(null);
        }
      }
    } catch (error) {
      console.error('Error fetching video:', error);
      setVideoUrl(null);
    } finally {
      setLoadingVideoExercise(null);
    }
  };

  const closeVideo = () => setVideoUrl(null);

  // Handle title click to navigate back to program page
  const handleBackClick = () => {
    router.push(`/program`);
  };

  // Handle workout completion - mark day as done in Firebase and update local + context state
  const handleWorkoutComplete = useCallback(async () => {
    if (!user?.uid || !activeProgram?.docId || !dayData) return;
    
    try {
      await markDayAsCompleted(user.uid, activeProgram.docId, dayData.day, selectedProgram?.weekId);
      logAnalyticsEvent('workout_completed', { day: dayData.day });
      // Update local state so the UI reflects completion immediately
      setDayData(prev => prev ? { ...prev, completed: true, completedAt: new Date() } : prev);
      // Update context so other pages (program overview, calendar) also reflect it
      markDayCompleteInMemory(dayData.day, true);
    } catch (err) {
      console.error('Failed to mark day as completed:', err);
    }
  }, [user?.uid, activeProgram?.docId, dayData, markDayCompleteInMemory]);

  // Handle workout restart - reset completion in local + context state
  const handleWorkoutRestart = useCallback(() => {
    if (!dayData) return;
    setDayData(prev => prev ? { ...prev, completed: false, completedAt: undefined } : prev);
    markDayCompleteInMemory(dayData.day, false);
  }, [dayData, markDayCompleteInMemory]);

  // Handle marking a missed past day as completed (without doing the workout)
  const handleMarkComplete = useCallback(async () => {
    if (!user?.uid || !activeProgram?.docId || !dayData) return;
    try {
      await markDayAsCompleted(user.uid, activeProgram.docId, dayData.day, selectedProgram?.weekId);
      setDayData(prev => prev ? { ...prev, completed: true, completedAt: new Date() } : prev);
      markDayCompleteInMemory(dayData.day, true);
    } catch (err) {
      console.error('Failed to mark day as completed:', err);
    }
  }, [user?.uid, activeProgram?.docId, dayData, selectedProgram?.weekId, markDayCompleteInMemory]);

  // Determine if this day is in the past
  // Only show completion status for signed-in users
  const isPastDay = useMemo(() => {
    if (!user?.uid || !selectedProgram?.createdAt || !dayData) return false;
    const programStart = selectedProgram.createdAt instanceof Date 
      ? selectedProgram.createdAt 
      : new Date(selectedProgram.createdAt);
    const weekStart = getStartOfWeek(programStart);
    const dayDate = new Date(weekStart);
    dayDate.setDate(dayDate.getDate() + (dayData.day - 1));
    dayDate.setHours(23, 59, 59, 999);

    return new Date() > dayDate;
  }, [user?.uid, selectedProgram?.createdAt, dayData]);

  // Hide navigation menu when video is open
  useEffect(() => {
    if (videoUrl) {
      // Hide navigation menu by adding a class to the body
      document.body.classList.add('video-modal-open');
      
      return () => {
        // Remove the class when component unmounts or video closes
        document.body.classList.remove('video-modal-open');
      };
    }
  }, [videoUrl]);

  const navigateToVideo = async (direction: 'next' | 'prev') => {
    if (!dayData?.exercises || currentExerciseIndex === -1) return;

    logAnalyticsEvent('navigate_video', { direction });
    
    const totalExercises = dayData.exercises.length;
    let newIndex: number;
    
    if (direction === 'next') {
      // Don't loop, just move to the next if not at the end
      if (currentExerciseIndex < totalExercises - 1) {
        newIndex = currentExerciseIndex + 1;
      } else {
        return; // Already at the last video, do nothing
      }
    } else {
      // Don't loop, just move to the previous if not at the beginning
      if (currentExerciseIndex > 0) {
        newIndex = currentExerciseIndex - 1;
      } else {
        return; // Already at the first video, do nothing
      }
    }
    
    // Set the new index
    setCurrentExerciseIndex(newIndex);
    
    // Get the new exercise and load its video
    const nextExercise = dayData.exercises[newIndex];
    await handleVideoClick(nextExercise);
  };

  const renderVideoModal = () => {
    if (!videoUrl) return null;

    const hasMultipleVideos = dayData?.exercises && dayData.exercises.length > 1;
    const showPreviousButton = hasMultipleVideos && currentExerciseIndex > 0;
    const showNextButton = hasMultipleVideos && currentExerciseIndex < (dayData?.exercises.length ?? 0) - 1;

    return (
      <div
        className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[10000]"
        onClick={closeVideo}
      >
        <div
          className="relative w-full h-full flex items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Navigation buttons */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-8 z-[10001] pointer-events-none">
            {showPreviousButton && (
              <button
                onClick={() => navigateToVideo('prev')}
                className="bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 shadow-lg pointer-events-auto"
                aria-label="Previous video"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            
            {!showPreviousButton && <div></div>} {/* Empty div to maintain flex justify-between */}
            
            {showNextButton && (
              <button
                onClick={() => navigateToVideo('next')}
                className="bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 shadow-lg pointer-events-auto"
                aria-label="Next video"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
          
          <button
            onClick={closeVideo}
            className="absolute top-16 right-6 bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 z-[10001] shadow-lg"
            aria-label="Close video"
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
          
          {/* Exercise name display */}
          {currentExerciseIndex !== -1 && dayData?.exercises && (
            <div className="absolute top-4 left-0 right-0 text-center">
              <h2 className="text-xl md:text-2xl font-bold text-white/90 px-4">
                {dayData.exercises[currentExerciseIndex].name}
                {dayData.exercises.length > 1 && (
                  <span className="text-white/60 text-sm ml-2">
                    {currentExerciseIndex + 1} / {dayData.exercises.length}
                  </span>
                )}
              </h2>
            </div>
          )}
          
          {videoUrl && videoUrl.includes('firebasestorage.googleapis.com') ? (
            <div className="w-full h-full flex items-center justify-center">
              <video
                className="max-h-full max-w-full h-full object-contain"
                src={videoUrl}
                controls
                autoPlay
                playsInline
              ></video>
            </div>
          ) : videoUrl && isYouTubeUrl(videoUrl) ? (
            <div className="w-full max-w-4xl mx-4 rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  title="Exercise Video"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          ) : videoUrl ? (
            <div className="w-full h-full flex items-center justify-center">
              <video
                className="max-h-full max-w-full h-full object-contain"
                src={videoUrl}
                controls
                autoPlay
                playsInline
              ></video>
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  // Handle errors
  if (authError) {
    return <ErrorDisplay error={authError} />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  // Return loading UI if no data yet
  if (!dayData) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading program day...</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 min-h-screen z-50 flex flex-col">
      <NavigationMenu mobileTitle={dayName || t('program.defaultPageTitle')} />
      <div className="py-3 px-4 items-center justify-center hidden md:flex">
        <h1 className="text-app-title text-center">{dayName}</h1>
      </div>
      <div className="flex-1">
        <div className="px-4 max-w-4xl mx-auto">
          <ProgramDayComponent
            day={dayData}
            dayName={dayName}
            onVideoClick={handleVideoClick}
            loadingVideoExercise={loadingVideoExercise}
            expandedExercises={expandedExercises}
            onExerciseToggle={handleExerciseToggle}
            programTitle={selectedProgram?.title || 'Exercise Program'}
            onTitleClick={handleBackClick}
            onWorkoutComplete={handleWorkoutComplete}
            onWorkoutRestart={handleWorkoutRestart}
            onMarkComplete={handleMarkComplete}
            isPastDay={isPastDay}
            hideWorkoutFAB={!user}
          />
        </div>
      </div>
      {renderVideoModal()}
    </div>
  );
}

export default function DayDetailPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading program day...</div>
      </div>
    }>
      <DayDetailPageContent />
    </Suspense>
  );
} 