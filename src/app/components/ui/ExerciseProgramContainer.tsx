import { useState, useEffect } from 'react';
import { ExerciseProgramPage } from './ExerciseProgramPage';
import { ExerciseProgramCalendar } from './ExerciseProgramCalendar';
import { ProgramDayComponent } from './ProgramDayComponent';
import { TopBar } from './TopBar';
import { searchYouTubeVideo } from '@/app/utils/youtube';
import { ProgramType } from '@/app/shared/types';
import { Exercise, ExerciseProgram, ProgramDay } from '@/app/types/program';

interface ExerciseProgramContainerProps {
  onBack?: () => void;
  isLoading: boolean;
  program: ExerciseProgram;
}

interface DetailedDayViewProps {
  day: ProgramDay;
  dayName: string;
  onBack: () => void;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise: string | null;
}

function getYouTubeEmbedUrl(url: string): string {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);

  if (match && match[2].length === 11) {
    return `https://www.youtube.com/embed/${match[2]}`;
  }
  return url;
}

function DetailedDayView({ day, dayName, onBack, onVideoClick, loadingVideoExercise }: DetailedDayViewProps) {
  const [expandedExercises, setExpandedExercises] = useState<string[]>([]);

  const handleExerciseToggle = (exerciseName: string) => {
    setExpandedExercises(prev => 
      prev.includes(exerciseName) 
        ? prev.filter(name => name !== exerciseName)
        : [...prev, exerciseName]
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 z-50 flex flex-col">
      <TopBar onBack={onBack} className="flex-shrink-0" />
      <div className="flex-1 overflow-hidden">
        <div className="h-full overflow-y-auto px-4 pb-32 max-w-4xl mx-auto">
          <ProgramDayComponent
            day={day}
            dayName={dayName}
            onVideoClick={onVideoClick}
            loadingVideoExercise={loadingVideoExercise}
            expandedExercises={expandedExercises}
            onExerciseToggle={handleExerciseToggle}
          />
        </div>
      </div>
    </div>
  );
}

export function ExerciseProgramContainer({
  onBack,
  isLoading,
  program,
}: ExerciseProgramContainerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);
  const [processedProgram, setProcessedProgram] = useState<ExerciseProgram | undefined>(program);
  const [selectedDetailDay, setSelectedDetailDay] = useState<ProgramDay | null>(null);
  const [selectedDetailDayName, setSelectedDetailDayName] = useState<string>('');

  // Get current day's program on initial load
  useEffect(() => {
    if (!program?.program?.[0]?.days) return;

    const currentDate = new Date();
    const currentDayOfWeek = currentDate.getDay() || 7; // Convert Sunday (0) to 7
    const currentWeek = program.program[0]; // Always use first week

    if (currentWeek) {
      const currentDay = currentWeek.days.find(d => d.day === currentDayOfWeek);
      if (currentDay) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        setSelectedDetailDay(currentDay);
        setSelectedDetailDayName(days[currentDayOfWeek - 1]);
      }
    }
  }, [program]);

  // Process program to handle single week
  useEffect(() => {
    if (!program) return;
    setProcessedProgram(program);
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

  const handleDaySelect = (day: ProgramDay, dayName: string) => {
    setSelectedDetailDay(day);
    setSelectedDetailDayName(dayName);
  };

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
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      {selectedDetailDay ? (
        <DetailedDayView
          day={selectedDetailDay}
          dayName={selectedDetailDayName}
          onBack={() => setSelectedDetailDay(null)}
          onVideoClick={handleVideoClick}
          loadingVideoExercise={loadingVideoExercise}
        />
      ) : showCalendar ? (
        <ExerciseProgramCalendar
          program={processedProgram}
          onToggleView={() => setShowCalendar(false)}
          dayName={getDayName}
          onDaySelect={handleDaySelect}
        />
      ) : (
        <ExerciseProgramPage
          isLoading={isLoading}
          program={processedProgram}
          onToggleView={() => setShowCalendar(true)}
          onVideoClick={handleVideoClick}
          loadingVideoExercise={loadingVideoExercise}
          dayName={getDayName}
          onDaySelect={handleDaySelect}
        />
      )}
      {renderVideoModal()}
    </div>
  );
}
