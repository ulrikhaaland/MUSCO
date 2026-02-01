'use client';

import { useEffect, useState, Suspense, useMemo } from 'react';
import { useRouter } from 'next/navigation';
// ProgramFeedbackQuestionnaire is preserved but not rendered - using PreFollowupChat instead
// import { ProgramFeedbackQuestionnaire } from '@/app/components/ui/ProgramFeedbackQuestionnaire';
import { PreFollowupChat } from '@/app/components/ui/PreFollowupChat';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { submitProgramFeedback, WeeklyLimitReachedError } from '@/app/services/programFeedbackService';
import { canGenerateProgram, getNextAllowedGenerationDate } from '@/app/services/programGenerationLimits';
import { useTranslation } from '@/app/i18n';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import { WeeklyLimitModal } from '@/app/components/ui/WeeklyLimitModal';
import { ProgramType, Exercise } from '@/app/types/program';
import { PreFollowupFeedback } from '@/app/types/incremental-program';
import { fetchExerciseVideoUrl } from '@/app/utils/videoUtils';
import { VideoModal } from '@/app/components/ui/VideoModal';

function FeedbackPageContent() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user, loading: authLoading } = useAuth();
  const { program, activeProgram, answers, diagnosisData, generateFollowUpProgram, isLoading: userLoading } = useUser();
  
  // Get the latest week from the program - this is what we're generating a follow-up for
  // program is always Week 1, but we need the most recent week for proper follow-up context
  const latestWeekProgram = useMemo(() => {
    if (!activeProgram?.programs || activeProgram.programs.length === 0) {
      return program; // Fallback to program (Week 1) if no programs array
    }
    const latestWeek = activeProgram.programs[activeProgram.programs.length - 1];
    // Add docId and weekId for consistency with the program object structure
    return {
      ...latestWeek,
      docId: activeProgram.docId,
      weekId: latestWeek.docId, // The week's own docId becomes weekId
    };
  }, [activeProgram, program]);

  const [isLoading, setIsLoading] = useState(true);
  const [error] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [weeklyLimitError, setWeeklyLimitError] = useState<{
    programType: ProgramType;
    nextAllowedDate: Date;
  } | null>(null);
  
  // Video modal state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  // Check if user is authenticated and has a program
  useEffect(() => {
    // Wait for auth and user program loading to settle to avoid premature redirect
    if (authLoading || userLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    if (!program) {
      router.push('/program');
      return;
    }

    setIsLoading(false);
  }, [authLoading, userLoading, user, program, router]);

  // Build inline exercises map for PreFollowupChat
  // Map by BOTH name and ID so MessageWithExercises can find them by [[name]] markers
  // Uses latestWeekProgram to show exercises from the most recent week
  const inlineExercises = useMemo(() => {
    const exerciseMap = new Map<string, Exercise>();
    
    if (latestWeekProgram?.days) {
      latestWeekProgram.days.forEach((day) => {
        if (day.exercises) {
          day.exercises.forEach((exercise) => {
            // Add by name (for [[Exercise Name]] lookups in MessageWithExercises)
            if (exercise.name && !exerciseMap.has(exercise.name)) {
              exerciseMap.set(exercise.name, exercise);
            }
            // Also add by ID for backwards compatibility
            const exerciseId = exercise.id || exercise.exerciseId;
            if (exerciseId && !exerciseMap.has(exerciseId)) {
              exerciseMap.set(exerciseId, exercise);
            }
          });
        }
      });
    }
    
    return exerciseMap;
  }, [latestWeekProgram]);

  // Handle exercise video click
  const handleVideoClick = async (exercise: Exercise) => {
    const exerciseId = exercise.name || exercise.id;
    if (loadingVideoExercise === exerciseId) return;

    setLoadingVideoExercise(exerciseId);
    setCurrentExercise(exercise);

    try {
      const url = await fetchExerciseVideoUrl(exercise);
      if (url) {
        setVideoUrl(url);
      }
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoadingVideoExercise(null);
    }
  };

  const handleCloseVideo = () => {
    setVideoUrl(null);
    setCurrentExercise(null);
  };

  // Handle program generation from PreFollowupChat
  const handleGenerateProgram = async (feedback: PreFollowupFeedback) => {
    // Prevent double-clicks
    if (isGenerating) return;
    
    if (!user || !user.uid) {
      console.error(t('exerciseProgram.feedback.error'));
      return;
    }

    // Set generating state immediately to disable button
    setIsGenerating(true);

    // Check weekly limit FIRST (quick check before redirect)
    const programType = diagnosisData?.programType || ProgramType.Exercise;
    const allowed = await canGenerateProgram(user.uid, programType);
    if (!allowed) {
      const nextAllowedDate = await getNextAllowedGenerationDate(user.uid, programType);
      setWeeklyLimitError({
        programType,
        nextAllowedDate: nextAllowedDate || new Date(),
      });
      setIsGenerating(false);
      return;
    }

    // Trigger generation state in UserContext FIRST (sets loading state + navigates to /program)
    generateFollowUpProgram();

    // Submit feedback in background - Firestore snapshot listener will handle updates
    // Pass latestWeekProgram so the follow-up is based on the most recent week's exercises
    submitProgramFeedback(
      user.uid,
      latestWeekProgram,
      diagnosisData,
      answers,
      feedback
    ).then((newProgramId) => {
      console.log(t('exerciseProgram.feedback.success'), newProgramId);
    }).catch((error) => {
      console.error(t('exerciseProgram.feedback.error.generating'), error);
    });
  };

  // Update page title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = `${t('programFeedback.pageTitle')} | BodAI`;
    }
  }, [t]);

  if (isLoading) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">{t('common.loading')}</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-red-400 text-sm">{error}</div>
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">{t('program.noProgramFound')}</div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 h-screen flex flex-col overflow-hidden">
      <NavigationMenu mobileTitle={t('programFeedback.pageTitle')} />
      
      <div className="flex-1 overflow-hidden">
        <PreFollowupChat
          previousProgram={latestWeekProgram}
          diagnosisData={diagnosisData}
          questionnaireData={answers}
          userId={user.uid}
          programId={latestWeekProgram?.docId || program?.docId || `program-${Date.now()}`}
          weekId={latestWeekProgram?.weekId}
          inlineExercises={inlineExercises}
          onGenerateProgram={handleGenerateProgram}
          onVideoClick={handleVideoClick}
          loadingVideoExercise={loadingVideoExercise}
          isGenerating={isGenerating}
        />
      </div>
      
      {/* Exercise video modal */}
      {videoUrl && (
        <VideoModal
          videoUrl={videoUrl}
          onClose={handleCloseVideo}
          exerciseName={currentExercise?.name}
        />
      )}

      {/* Weekly limit modal */}
      {weeklyLimitError && (
        <WeeklyLimitModal
          isOpen={true}
          programType={weeklyLimitError.programType}
          nextAllowedDate={weeklyLimitError.nextAllowedDate}
          onClose={() => {
            setWeeklyLimitError(null);
            router.push('/program');
          }}
        />
      )}
    </div>
  );
}

export default function FeedbackPage() {
  return (
    <Suspense fallback={
      <div className="bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-gray-400 text-sm">Loading...</div>
      </div>
    }>
      <FeedbackPageContent />
    </Suspense>
  );
} 