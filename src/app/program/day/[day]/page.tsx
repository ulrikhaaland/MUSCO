'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProgramStatus, Exercise, ProgramDay, ExerciseProgram } from '@/app/types/program';
import { ProgramDayComponent } from '@/app/components/ui/ProgramDayComponent';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { storage } from '@/app/firebase/config';
import { preloadExerciseVideos } from '@/app/utils/videoPreloader';

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

function isVimeoUrl(url: string): boolean {
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

export default function DayDetailPage() {
  const router = useRouter();
  const params = useParams();
  const dayParam = params.day as string;
  const dayNumber = parseInt(dayParam);
  
  const { user, loading: authLoading, error: authError } = useAuth();
  const { program, isLoading: userLoading, programStatus, userPrograms } = useUser();
  const [error, setError] = useState<Error | null>(null);
  const [dayData, setDayData] = useState<ProgramDay | null>(null);
  const [dayName, setDayName] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<ExerciseProgram | null>(null);
  const [preloadedVideoUrls, setPreloadedVideoUrls] = useState<{ [key: string]: string }>({});
  const [videosPreloaded, setVideosPreloaded] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(-1);

  const isLoading = authLoading || userLoading;

  // Extract programId from query parameters
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryParams = new URLSearchParams(window.location.search);
      const programId = queryParams.get('programId');
      
      if (programId && userPrograms) {
        // Find the specific program by its createdAt value
        const foundProgram = userPrograms
          .flatMap(up => up.programs)
          .find(p => p.createdAt.toString() === programId);
          
        if (foundProgram) {
          setSelectedProgram(foundProgram);
        } else {
          setSelectedProgram(program); // Fallback to the default program
        }
      } else {
        setSelectedProgram(program); // Fallback to the default program
      }
    }
  }, [program, userPrograms]);

  // Find the day data based on the day number
  useEffect(() => {
    if (selectedProgram?.program && !isNaN(dayNumber)) {
      // Attempt to find the day in the current week
      const currentWeek = selectedProgram.program[0]; // Start with first week
      if (currentWeek) {
        const day = currentWeek.days.find(d => d.day === dayNumber);
        if (day) {
          setDayData(day);
          
          // Set day name
          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          setDayName(days[dayNumber - 1]);
        }
      }
    }
  }, [selectedProgram, dayNumber]);

  // Preload all videos when the day data is first loaded
  useEffect(() => {
    if (dayData?.exercises && !videosPreloaded) {
      console.log(`Starting preload for ${dayData.exercises.length} exercises on ${dayName}`);
      
      try {
        // Preload all videos at once
        preloadExerciseVideos(dayData.exercises)
          .then(() => {
            console.log("All exercise videos preloaded successfully");
            setVideosPreloaded(true);

            // Now prefetch the HTTP URLs and store them for immediate access
            const prefetchHttpUrls = async () => {
              const urlMap: { [key: string]: string } = {};
              for (const exercise of dayData.exercises) {
                if (exercise.videoUrl && exercise.videoUrl.startsWith('gs://')) {
                  try {
                    const storageRef = ref(storage, exercise.videoUrl);
                    const downloadUrl = await getDownloadURL(storageRef);
                    urlMap[exercise.name] = downloadUrl;
                  } catch (error) {
                    console.error(`Error converting Firebase URL for ${exercise.name}:`, error);
                  }
                }
              }
              setPreloadedVideoUrls(urlMap);
              console.log(`Prefetched ${Object.keys(urlMap).length} HTTP URLs for immediate access`);
            };
            
            prefetchHttpUrls().catch(error => {
              console.error("Error prefetching HTTP URLs:", error);
            });
          })
          .catch(error => {
            console.error("Error preloading exercise videos:", error);
          });
      } catch (error) {
        console.error("Error initiating video preload:", error);
      }
    }
  }, [dayData, dayName, videosPreloaded]);

  // Update page title
  useEffect(() => {
    if (dayName && typeof document !== 'undefined') {
      document.title = `${dayName} - Program | MUSCO`;
    } else if (typeof document !== 'undefined') {
      document.title = 'Program Day | MUSCO';
    }
  }, [dayName]);

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

  // Preload Firebase video URL and hint browser to download video content
  const handleExerciseToggle = async (exerciseName: string) => {
    const isCurrentlyExpanded = expandedExercises.includes(exerciseName);

    setExpandedExercises(prev => 
      isCurrentlyExpanded
        ? prev.filter(name => name !== exerciseName)
        : [...prev, exerciseName]
    );

    const linkId = `preload-video-${exerciseName.replace(/\s+/g, '-')}`; // Create a safe ID

    // If expanding
    if (!isCurrentlyExpanded) {
      const exercise = dayData?.exercises.find(ex => ex.name === exerciseName);

      if (exercise?.videoUrl && isFirebaseStorageUrl(exercise.videoUrl) && !preloadedVideoUrls[exerciseName]) {
        try {
          console.log(`Preloading video URL for: ${exerciseName}`);
          const storageRef = ref(storage, exercise.videoUrl);
          const downloadUrl = await getDownloadURL(storageRef);
          setPreloadedVideoUrls(prev => ({ ...prev, [exerciseName]: downloadUrl }));
          console.log(`Preloaded video URL obtained for ${exerciseName}`);

          // Hint the browser to preload the video content
          if (downloadUrl && !document.getElementById(linkId)) {
            const link = document.createElement('link');
            link.id = linkId;
            link.rel = 'preload';
            link.href = downloadUrl;
            link.as = 'video';
            // You might need to specify the video type if known, e.g., link.type = 'video/mp4'
            document.head.appendChild(link);
            console.log(`Added preload link for ${exerciseName}`);
          }
        } catch (preloadError) {
          console.error(`Error preloading Firebase video for ${exerciseName}:`, preloadError);
        }
      }
    } 
    // If collapsing
    else {
      // Remove the preload hint if it exists
      const existingLink = document.getElementById(linkId);
      if (existingLink) {
        document.head.removeChild(existingLink);
        console.log(`Removed preload link for ${exerciseName}`);
      }
    }
  };

  // Ensure preload links are cleaned up on component unmount
  useEffect(() => {
    return () => {
      expandedExercises.forEach(exerciseName => {
        const linkId = `preload-video-${exerciseName.replace(/\s+/g, '-')}`;
        const existingLink = document.getElementById(linkId);
        if (existingLink) {
          document.head.removeChild(existingLink);
          console.log(`Cleaned up preload link on unmount for ${exerciseName}`);
        }
      });
    };
  }, [expandedExercises]); // Dependency array includes expandedExercises

  // Updated to handle Firebase Storage URL fetching and utilize preloaded URLs
  const handleVideoClick = async (exercise: Exercise) => {
    if (loadingVideoExercise === exercise.name) return;

    // Find the index of the exercise in the day's exercises
    const exerciseIndex = dayData?.exercises.findIndex(ex => ex.name === exercise.name) ?? -1;
    setCurrentExerciseIndex(exerciseIndex);

    // --- Check for Preloaded URL First ---
    if (preloadedVideoUrls[exercise.name]) {
      console.log(`Using preloaded URL for ${exercise.name}`);
      setVideoUrl(preloadedVideoUrls[exercise.name]);
      return; // Skip fetching/searching if preloaded URL exists
    }

    // Helper function to search YouTube and update video URL
    const searchYouTubeAndUpdateUrl = async () => {
      setLoadingVideoExercise(exercise.name);
      try {
        const searchQuery = `${exercise.name} proper form`;
        const youtubeUrl = await searchYouTubeVideo(searchQuery);
        if (youtubeUrl) {
          exercise.videoUrl = youtubeUrl;
          setVideoUrl(getVideoEmbedUrl(youtubeUrl));
        } else {
          console.log('No YouTube video found for:', searchQuery);
          setVideoUrl(null);
        }
      } catch (error) {
        console.error('Error fetching YouTube video:', error);
        setVideoUrl(null);
      } finally {
        setLoadingVideoExercise(null);
      }
    };

    // --- Main Logic (if not preloaded) ---
    if (exercise.videoUrl) {
      if (isFirebaseStorageUrl(exercise.videoUrl)) {
        // Fetch Firebase download URL (if not preloaded or preload failed)
        setLoadingVideoExercise(exercise.name);
        try {
          const storageRef = ref(storage, exercise.videoUrl);
          const downloadUrl = await getDownloadURL(storageRef);
          setVideoUrl(downloadUrl);
        } catch (error) {
          console.error('Error fetching Firebase video URL:', error);
          setVideoUrl(null);
        } finally {
          setLoadingVideoExercise(null);
        }
      } else if (isVimeoUrl(exercise.videoUrl)) {
        await searchYouTubeAndUpdateUrl();
      } else {
        setVideoUrl(getVideoEmbedUrl(exercise.videoUrl));
      }
    } else {
      await searchYouTubeAndUpdateUrl();
    }
  };

  const closeVideo = () => setVideoUrl(null);

  // Handle title click to navigate back to program page
  const handleBackClick = () => {
    router.push(`/program`);
  };

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
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-8 z-[10001]">
            {showPreviousButton && (
              <button
                onClick={() => navigateToVideo('prev')}
                className="bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 shadow-lg"
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
                className="bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 shadow-lg"
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

  if (authError) {
    return <ErrorDisplay error={authError} />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (isLoading || !dayData) {
    // We're using the global loader context instead of rendering our own spinner
    return null;
  }

  return (
    <div className="bg-gray-900 min-h-screen z-50 flex flex-col">
      <div className="py-3 px-4 flex items-center justify-center">
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
          />
        </div>
      </div>
      {renderVideoModal()}
    </div>
  );
} 