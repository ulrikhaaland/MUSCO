import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Mark a specific day as completed in a program
 * Called when user finishes a workout session
 */
export async function markDayAsCompleted(
  userId: string,
  programDocId: string,
  dayNumber: number
): Promise<void> {
  const programRef = doc(db, `users/${userId}/programs/${programDocId}`);
  const programDoc = await getDoc(programRef);
  
  if (!programDoc.exists()) {
    console.warn('[workoutSessionService] Program not found:', programDocId);
    return;
  }

  const programData = programDoc.data();
  const days = programData.days || [];
  const now = new Date().toISOString();

  // Find and update the specific day
  const updatedDays = days.map((day: { day: number; completed?: boolean; completedAt?: string }) => {
    if (day.day === dayNumber) {
      return { 
        ...day, 
        completed: true, 
        completedAt: now 
      };
    }
    return day;
  });

  await updateDoc(programRef, {
    days: updatedDays,
    updatedAt: now,
  });
}

/**
 * Get the completion status of a specific day
 */
export async function getDayCompletionStatus(
  userId: string,
  programDocId: string,
  dayNumber: number
): Promise<{ completed: boolean; completedAt?: string }> {
  const programRef = doc(db, `users/${userId}/programs/${programDocId}`);
  const programDoc = await getDoc(programRef);
  
  if (!programDoc.exists()) {
    return { completed: false };
  }

  const programData = programDoc.data();
  const days = programData.days || [];
  const day = days.find((d: { day: number }) => d.day === dayNumber);

  if (!day) {
    return { completed: false };
  }

  return {
    completed: day.completed ?? false,
    completedAt: day.completedAt,
  };
}
