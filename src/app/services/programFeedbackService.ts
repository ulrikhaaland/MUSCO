import {
  doc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { DiagnosisAssistantResponse } from '@/app/types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../shared/types';
import { ProgramStatus, ExerciseProgram } from '@/app/types/program';
import { ProgramFeedback } from '../components/ui/ProgramFeedbackQuestionnaire';
import { Locale } from '../i18n/translations';
import { getSavedLocalePreference } from '../i18n/utils';
import { getStartOfWeek, addDays } from '@/app/utils/dateutils';
import {
  canGenerateProgram,
  WeeklyLimitReachedError,
  getNextAllowedGenerationDate,
} from './programGenerationLimits';

// Re-export for consumers
export { WeeklyLimitReachedError } from './programGenerationLimits';

// Extended ExerciseQuestionnaireAnswers to include feedback fields
interface _FeedbackEnhancedQuestionnaire extends ExerciseQuestionnaireAnswers {
  // Updated to only include fields we're using
  feedbackRemovedExercises?: string[];
  feedbackReplacedExercises?: string[];
}

// Extended ExerciseProgram interface to include feedback-related properties
interface ProgramWithFeedbackData extends ExerciseProgram {
  questionnaire?: ExerciseQuestionnaireAnswers;
  diagnosis?: Partial<DiagnosisAssistantResponse>;
  docId?: string; // The ID of the program document
}

/**
 * Submits feedback for a completed program and generates a new program week for the next week
 * @param userId The user ID for whom to generate the next program
 * @param currentProgram The current program to build upon
 * @param feedback The user's feedback on the current program
 * @param assistantId Optional assistant ID for the follow-up program generation
 * @returns The ID of the program document
 */
export const submitProgramFeedback = async (
  userId: string,
  currentProgram: ProgramWithFeedbackData,
  diagnosisData: DiagnosisAssistantResponse,
  exerciseQuestionnaireData: ExerciseQuestionnaireAnswers,
  feedback: ProgramFeedback
): Promise<string> => {
  try {
    // Get program type for limit checking
    const programType = diagnosisData.programType || ProgramType.Exercise;

    // Check weekly generation limit for follow-up programs
    const canGenerate = await canGenerateProgram(userId, programType);
    if (!canGenerate) {
      const nextAllowedDate = await getNextAllowedGenerationDate(userId, programType);
      throw new WeeklyLimitReachedError(programType, nextAllowedDate || new Date());
    }

    // Instead of creating a new program, add a follow-up week to the existing program
    // Get the programId from the current program
    const programId = currentProgram.docId || '';

    if (!programId) {
      throw new Error("Current program doesn't have an ID");
    }

    // Set the program status to generating while we create the follow-up
    const programRef = doc(db, `users/${userId}/programs/${programId}`);

    await updateDoc(programRef, {
      status: ProgramStatus.Generating,
      updatedAt: new Date().toISOString(),
    });

    try {
      // Get user's language preference
      const userLanguage: Locale =
        typeof window !== 'undefined' ? getSavedLocalePreference() : 'en';

      // Call the API to generate a follow-up program
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'generate_follow_up_program',
          payload: {
            diagnosisData: diagnosisData,
            userInfo: exerciseQuestionnaireData,
            feedback: feedback,
            userId: userId,
            programId: programId,
            previousProgram: currentProgram || null, // Pass the program data
            desiredCreatedAt: (() => {
              const currentWeekStart = getStartOfWeek(new Date());
              const prevWeekStart = currentProgram.createdAt ? getStartOfWeek(new Date(currentProgram.createdAt)) : null;
              const candidate = prevWeekStart ? addDays(prevWeekStart, 7) : currentWeekStart;
              const desired = candidate < currentWeekStart ? currentWeekStart : candidate;
              return new Date(Date.UTC(desired.getFullYear(), desired.getMonth(), desired.getDate())).toISOString();
            })(),
            language: userLanguage, // Pass the user's language preference
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate follow-up program');
      }

      const result = await response.json();
      console.log('Follow-up program generated successfully', result);

      // Note: Weekly generation limit is recorded in openai-server.ts
      // when the follow-up program is fully generated

      return programId; // Return the existing program ID
    } catch (error) {
      // If there's an error, update the program status back to Done
      await updateDoc(programRef, {
        status: ProgramStatus.Done,
        updatedAt: new Date().toISOString(),
      });
      throw error;
    }
  } catch (error) {
    console.error('Error submitting program feedback:', error);
    throw error;
  }
};
