'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ProgramFeedbackQuestionnaire } from '@/app/components/ui/ProgramFeedbackQuestionnaire';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { submitProgramFeedback } from '@/app/services/programFeedbackService';
import { ProgramFeedback } from '@/app/components/ui/ProgramFeedbackQuestionnaire';
import { useTranslation } from '@/app/i18n';
import { Exercise } from '@/app/types/program';

// Helper function to get next Monday's date
function getNextMonday(d: Date): Date {
  const result = new Date(d);
  const day = result.getDay();
  const diff = day === 0 ? 1 : 8 - day; // if Sunday (0), add 1 day, otherwise add days until next Monday
  result.setDate(result.getDate() + diff);
  return result;
}

function FeedbackPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { program, answers, diagnosisData, generateFollowUpProgram } = useUser();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated and has a program
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!program) {
      router.push('/program');
      return;
    }

    setIsLoading(false);
  }, [user, program, router]);

  // Extract all unique exercises from the program
  const getAllProgramExercises = (): Exercise[] => {
    if (!program) return [];

    const uniqueExercises = new Map<string, Exercise>();

    // Process exercises from the current program
    if (program?.days) {
      program.days.forEach((day) => {
        if (day.exercises) {
          day.exercises.forEach((exercise) => {
            const exerciseId =
              exercise.id || exercise.exerciseId || exercise.name;
            if (exerciseId && !uniqueExercises.has(exerciseId)) {
              uniqueExercises.set(exerciseId, exercise);
            }
          });
        }
      });
    }

    return Array.from(uniqueExercises.values());
  };

  // Function to handle feedback submission and program generation
  const handleFeedbackSubmit = async (feedback: ProgramFeedback) => {
    if (!user || !user.uid) {
      console.error(t('exerciseProgram.feedback.error'));
      return Promise.reject(new Error(t('exerciseProgram.feedback.error')));
    }

    try {
      // For custom 4-week programs, use the entire program since it's already structured correctly
      // For regular programs, use the program as-is
      const programForFeedback = program;

      // Submit feedback and generate new program
      const newProgramId = await submitProgramFeedback(
        user.uid,
        programForFeedback,
        diagnosisData,
        answers,
        feedback
      );

      console.log(t('exerciseProgram.feedback.success'), newProgramId);

      // Redirect to refresh program view
      generateFollowUpProgram();

      return Promise.resolve();
    } catch (error) {
      console.error(t('exerciseProgram.feedback.error.generating'), error);
      return Promise.reject(error);
    }
  };

  const handleFeedbackCancel = () => {
    router.push('/program');
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
    <div className="bg-gray-900 min-h-screen">
      <ProgramFeedbackQuestionnaire
        onSubmit={handleFeedbackSubmit}
        onCancel={handleFeedbackCancel}
        nextWeekDate={getNextMonday(new Date())}
        isFeedbackDay={true}
        previousExercises={getAllProgramExercises()}
        isFutureWeek={true} // We only allow access to this page when eligible
        nextProgramDate={null}
      />
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