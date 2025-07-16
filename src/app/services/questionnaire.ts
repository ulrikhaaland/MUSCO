import {
  doc,
  getDoc,
  deleteDoc,
  addDoc,
  collection,
  setDoc,
  serverTimestamp,
  query,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { DiagnosisAssistantResponse } from '../types';
import { ExerciseQuestionnaireAnswers } from '../shared/types';
import { ProgramStatus } from '../types/program';
import { Locale } from '../i18n/translations';
import { getSavedLocalePreference } from '../i18n/utils';

async function generateProgram(
  userId: string,
  programId: string,
  diagnosis: DiagnosisAssistantResponse,
  answers: ExerciseQuestionnaireAnswers,
  assistantId?: string
) {
  try {
    // Get user's language preference
    const userLanguage: Locale = typeof window !== 'undefined' ? getSavedLocalePreference() : 'en';
    
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
          assistantId: assistantId,
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

export const submitQuestionnaire = async (
  userId: string,
  diagnosis: DiagnosisAssistantResponse,
  questionnaire: ExerciseQuestionnaireAnswers,
  assistantId?: string,
  onComplete?: () => void
): Promise<string> => {
  try {
    // Create a sanitized copy of the questionnaire to ensure no undefined values
    const sanitizedQuestionnaire = { ...questionnaire };
    
    // Replace undefined with null for modalitySplit and other potentially undefined fields
    if (sanitizedQuestionnaire.modalitySplit === undefined) {
      sanitizedQuestionnaire.modalitySplit = null;
    }
    
    // Check for any other undefined values and convert them to null
    Object.keys(sanitizedQuestionnaire).forEach(key => {
      if (sanitizedQuestionnaire[key] === undefined) {
        sanitizedQuestionnaire[key] = null;
      }
    });

    // Check if user already has existing programs
    const programsRef = collection(db, `users/${userId}/programs`);
    const existingProgramsQuery = query(programsRef);
    const existingProgramsSnapshot = await getDocs(existingProgramsQuery);
    const hasExistingPrograms = !existingProgramsSnapshot.empty;
    
    console.log(`📊 User has ${existingProgramsSnapshot.size} existing programs when submitting questionnaire`);

    // Use sanitized questionnaire in the Firestore document
    const docRef = await addDoc(programsRef, {
      diagnosis,
      questionnaire: sanitizedQuestionnaire,
      status: ProgramStatus.Generating,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      type: diagnosis.programType,
      active: !hasExistingPrograms, // Only set as active if user has no existing programs
    });

    console.log(`📋 New program created with active status: ${!hasExistingPrograms} (reason: ${hasExistingPrograms ? 'User has existing programs' : 'First program for user'})`);

    // Start program generation
    try {
      await generateProgram(
        userId,
        docRef.id,
        diagnosis,
        sanitizedQuestionnaire,
        assistantId
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
  Object.keys(sanitizedAnswers).forEach(key => {
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
