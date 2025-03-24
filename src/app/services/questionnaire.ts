import { doc, getDoc, deleteDoc, addDoc, collection, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DiagnosisAssistantResponse } from '../types';
import { ExerciseQuestionnaireAnswers } from '../shared/types';
import { ProgramStatus } from '../types/program';

async function generateProgram(userId: string, programId: string, diagnosis: DiagnosisAssistantResponse, answers: ExerciseQuestionnaireAnswers, assistantId?: string) {
  try {
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

export async function submitQuestionnaire(
  userId: string,
  diagnosis: DiagnosisAssistantResponse,
  answers: ExerciseQuestionnaireAnswers,
  onProgramDocAdded?: () => void,
  assistantId?: string
) {
  // Create a new document in the programs collection
  const programsRef = collection(db, `users/${userId}/programs`);
  const programDoc = await addDoc(programsRef, {
    diagnosis,
    questionnaire: answers,
    createdAt: new Date().toISOString(),
    status: ProgramStatus.Generating,
    type: diagnosis.programType || 'exercise',
    active: true,
  });
  
  if (onProgramDocAdded) {
    onProgramDocAdded();
  }

  // Start program generation
  try {
    await generateProgram(userId, programDoc.id, diagnosis, answers, assistantId);
  } catch (error) {
    console.error('Error starting program generation:', error);
    // Update status to error if generation fails to start
    await setDoc(doc(db, `users/${userId}/programs/${programDoc.id}`), {
      status: ProgramStatus.Error,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    throw error;
  }

  return programDoc.id;
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
  const tempDocRef = doc(db, 'pendingQuestionnaires', email.toLowerCase());
  await setDoc(tempDocRef, {
    diagnosis,
    answers,
    createdAt: new Date().toISOString(),
    email: email.toLowerCase(),
  });
} 