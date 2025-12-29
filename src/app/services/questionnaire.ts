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
  canGenerateProgram,
  WeeklyLimitReachedError,
  getNextAllowedGenerationDate,
} from './programGenerationLimits';

// Re-export for consumers
export { WeeklyLimitReachedError } from './programGenerationLimits';

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
 * Submit questionnaire and trigger program generation.
 * 
 * Generation happens in a single API call that:
 * 1. Generates metadata
 * 2. Generates all 7 days sequentially
 * 3. Saves each day to Firebase immediately (progress preserved even if interrupted)
 * 
 * The frontend's onSnapshot listener in UserContext will update the UI
 * in real-time as each day is saved to Firebase.
 * 
 * If the user refreshes the page, the UserContext will detect the incomplete
 * program and call resume_generation to continue from where it left off.
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

  // Get user's language preference
  const language: Locale =
    typeof window !== 'undefined' ? getSavedLocalePreference() : 'en';

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
    language,
    generatingDay: 0, // 0 = generating metadata
    days: [],
  });

  console.log(`[incremental] Program document created: ${docRef.id}`);

  // Start full program generation in a single API call
  // The API saves each day to Firebase immediately, so the onSnapshot listener
  // will update the UI in real-time. If this request fails or times out,
  // the progress is preserved and can be resumed.
  fetch('/api/programs/generate-incremental', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'generate_full_program',
      userId,
      programId: docRef.id,
      diagnosisData: diagnosis,
      userInfo: sanitizedQuestionnaire,
      language,
    }),
  }).then(async (response) => {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Generation failed');
    }
    console.log(`[incremental] Full program generation completed for ${docRef.id}`);
  }).catch((error) => {
    // Don't call onError here - the program might be partially complete
    // The resume logic will handle continuing generation on page load
    console.error(`[incremental] Generation error (will resume on page load):`, error);
  });

  return docRef.id;
}

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
