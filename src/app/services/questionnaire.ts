import {
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  collection,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DiagnosisAssistantResponse } from '../types';
import { ExerciseQuestionnaireAnswers } from '../../../shared/types';
import { ExerciseProgram, ProgramDay, ProgramStatus } from '../types/program';
import { Locale } from '../i18n/translations';
import { getSavedLocalePreference } from '../i18n/utils';
import { PartialProgram } from '../types/incremental-program';
import {
  generateProgramIncrementally,
  IncrementalProgramCallbacks,
} from './incrementalProgramService';
import {
  canGenerateProgram,
  WeeklyLimitReachedError,
  getNextAllowedGenerationDate,
} from './programGenerationLimits';

// Re-export for consumers
export { WeeklyLimitReachedError } from './programGenerationLimits';

/**
 * Legacy function - generates entire program at once
 * @deprecated Use generateProgramIncrementally instead
 */
async function generateProgram(
  userId: string,
  programId: string,
  diagnosis: DiagnosisAssistantResponse,
  answers: ExerciseQuestionnaireAnswers
) {
  try {
    // Get user's language preference
    const userLanguage: Locale =
      typeof window !== 'undefined' ? getSavedLocalePreference() : 'en';

    const response = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'generate_exercise_program',
        payload: {
          diagnosisData: diagnosis,
          userInfo: answers,
          userId: userId,
          programId: programId,
          language: userLanguage, // Pass the user's language preference
        },
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate program');
    }

    return response.json();
  } catch (error) {
    console.error('Error generating program:', error);
    throw error;
  }
}

/**
 * Callbacks for incremental program generation with UI updates
 */
export interface IncrementalGenerationCallbacks {
  onMetadataReady?: (partialProgram: PartialProgram) => void;
  onDayGenerated?: (day: ProgramDay, dayNumber: number, partialProgram: PartialProgram) => void;
  onComplete?: (program: ExerciseProgram) => void;
  onError?: (error: Error) => void;
}

/**
 * Submit questionnaire and generate program incrementally (day by day)
 */
export const submitQuestionnaireIncremental = async (
  userId: string,
  diagnosis: DiagnosisAssistantResponse,
  questionnaire: ExerciseQuestionnaireAnswers,
  callbacks?: IncrementalGenerationCallbacks
): Promise<string> => {
  const programType = diagnosis.programType;

  // Check weekly generation limit
  const canGenerate = await canGenerateProgram(userId, programType);
  if (!canGenerate) {
    const nextAllowedDate = await getNextAllowedGenerationDate(userId, programType);
    const error = new WeeklyLimitReachedError(programType, nextAllowedDate || new Date());
    callbacks?.onError?.(error);
    throw error;
  }

  // Create sanitized copy of questionnaire
  const sanitizedQuestionnaire = { ...questionnaire };
  Object.keys(sanitizedQuestionnaire).forEach((key) => {
    if (sanitizedQuestionnaire[key] === undefined) {
      sanitizedQuestionnaire[key] = null;
    }
  });

  const programsRef = collection(db, `users/${userId}/programs`);

  // Create the program document
  const docRef = await addDoc(programsRef, {
    diagnosis,
    questionnaire: sanitizedQuestionnaire,
    status: ProgramStatus.Generating,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    type: programType,
  });

  console.log(`[incremental] Program document created: ${docRef.id}`);

  // Note: Weekly generation limit is recorded in generate-incremental/route.ts
  // when the program is fully generated (day 7 saved), not here

  // Start incremental generation
  const incrementalCallbacks: IncrementalProgramCallbacks = {
    onMetadataReady: callbacks?.onMetadataReady,
    onDayGenerated: callbacks?.onDayGenerated,
    onComplete: callbacks?.onComplete,
    onError: (error) => {
      callbacks?.onError?.(error);
    },
  };

  // Don't await - let generation happen in background
  generateProgramIncrementally(
    diagnosis,
    sanitizedQuestionnaire,
    incrementalCallbacks,
    {
      userId,
      programId: docRef.id,
    }
  ).catch((error) => {
    console.error('[incremental] Background generation error:', error);
    callbacks?.onError?.(error);
  });

  return docRef.id;
}

export const submitQuestionnaire = async (
  userId: string,
  diagnosis: DiagnosisAssistantResponse,
  questionnaire: ExerciseQuestionnaireAnswers,
  onComplete?: () => void
): Promise<string> => {
  try {
    const programType = diagnosis.programType;

    // Check weekly generation limit
    const canGenerate = await canGenerateProgram(userId, programType);
    if (!canGenerate) {
      const nextAllowedDate = await getNextAllowedGenerationDate(userId, programType);
      throw new WeeklyLimitReachedError(programType, nextAllowedDate || new Date());
    }

    // Create a sanitized copy of the questionnaire to ensure no undefined values
    const sanitizedQuestionnaire = { ...questionnaire };

    // Replace undefined with null for modalitySplit and other potentially undefined fields
    if (sanitizedQuestionnaire.modalitySplit === undefined) {
      sanitizedQuestionnaire.modalitySplit = null;
    }

    // Check for any other undefined values and convert them to null
    Object.keys(sanitizedQuestionnaire).forEach((key) => {
      if (sanitizedQuestionnaire[key] === undefined) {
        sanitizedQuestionnaire[key] = null;
      }
    });

    const programsRef = collection(db, `users/${userId}/programs`);

    // Create the program document
    const docRef = await addDoc(programsRef, {
      diagnosis,
      questionnaire: sanitizedQuestionnaire,
      status: ProgramStatus.Generating,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: programType,
    });

    console.log(`📋 New ${programType} program created: ${docRef.id}`);

    // Note: Weekly generation limit is recorded in the API when the program
    // is fully generated, not here (to handle generation failures)

    // Start program generation
    try {
      await generateProgram(
        userId,
        docRef.id,
        diagnosis,
        sanitizedQuestionnaire
      );
    } catch (error) {
      console.error('Error starting program generation:', error);
      // Still return the program ID even if generation failed
    }

    // Call the onComplete callback if provided
    if (onComplete) {
      onComplete();
    }

    console.log(`Program created with ID: ${docRef.id}`);
    return docRef.id;
  } catch (error) {
    console.error('Error submitting questionnaire:', error);
    throw error;
  }
};

export async function getPendingQuestionnaire(email: string) {
  const pendingDocRef = doc(db, 'pendingQuestionnaires', email.toLowerCase());
  const pendingDoc = await getDoc(pendingDocRef);

  if (!pendingDoc.exists()) {
    return null;
  }

  return pendingDoc.data();
}

export async function deletePendingQuestionnaire(email: string) {
  const pendingDocRef = doc(db, 'pendingQuestionnaires', email.toLowerCase());
  await deleteDoc(pendingDocRef);
}

export async function storePendingQuestionnaire(
  email: string,
  diagnosis: DiagnosisAssistantResponse,
  answers: ExerciseQuestionnaireAnswers
) {
  // Create a sanitized copy of the answers to ensure no undefined values
  const sanitizedAnswers = { ...answers };

  // Replace undefined with null for modalitySplit and other potentially undefined fields
  if (sanitizedAnswers.modalitySplit === undefined) {
    sanitizedAnswers.modalitySplit = null;
  }

  // Check for any other undefined values and convert them to null
  Object.keys(sanitizedAnswers).forEach((key) => {
    if (sanitizedAnswers[key] === undefined) {
      sanitizedAnswers[key] = null;
    }
  });

  const tempDocRef = doc(db, 'pendingQuestionnaires', email.toLowerCase());
  await setDoc(tempDocRef, {
    diagnosis,
    answers: sanitizedAnswers,
    createdAt: new Date().toISOString(),
    email: email.toLowerCase(),
  });
}
