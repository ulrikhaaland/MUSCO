'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ProgramStatus, Exercise, ProgramDay, ExerciseProgram } from '@/app/types/program';
import { ProgramDayComponent } from '@/app/components/ui/ProgramDayComponent';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { LoadingSpinner } from '@/app/components/ui/LoadingSpinner';

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

  const handleExerciseToggle = (exerciseName: string) => {
    setExpandedExercises(prev => 
      prev.includes(exerciseName) 
        ? prev.filter(name => name !== exerciseName)
        : [...prev, exerciseName]
    );
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

  // Handle title click to navigate back to program page
  const handleTitleClick = () => {
    if (selectedProgram) {
      // Check if we have a programId in the URL
      const queryParams = new URLSearchParams(window.location.search);
      const programId = queryParams.get('programId');
      
      if (programId) {
        // Navigate to the specific program with its ID
        router.push(`/program?programId=${encodeURIComponent(programId)}`);
      } else {
        // Default navigation to the program page
        router.push('/program');
      }
    } else {
      router.push('/program');
    }
  };

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

  if (!selectedProgram || !dayData) {
    return <LoadingSpinner />;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <div className="py-3 px-4 flex items-center justify-center">
        <h1 className="text-app-title text-center">{dayName}</h1>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 pb-32 max-w-4xl mx-auto safe-scroll-container">
          <ProgramDayComponent
            day={dayData}
            dayName={dayName}
            onVideoClick={handleVideoClick}
            loadingVideoExercise={loadingVideoExercise}
            expandedExercises={expandedExercises}
            onExerciseToggle={handleExerciseToggle}
            programTitle={selectedProgram?.title || 'Exercise Program'}
            onTitleClick={handleTitleClick}
          />
        </div>
      </div>
      {renderVideoModal()}
    </div>
  );
} 