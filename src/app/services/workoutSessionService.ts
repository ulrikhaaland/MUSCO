import { doc, getDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Mark a specific day as completed in a program week.
 * Writes to the week subcollection document where days are stored.
 */
export async function markDayAsCompleted(
  userId: string,
  programDocId: string,
  dayNumber: number,
  weekId?: string
): Promise<void> {
  // Find the correct week document
  const weekDocRef = weekId
    ? doc(db, `users/${userId}/programs/${programDocId}/weeks/${weekId}`)
    : await findWeekDocWithDay(userId, programDocId, dayNumber);

  if (!weekDocRef) {
    console.warn('[workoutSessionService] Week document not found for day:', dayNumber);
    return;
  }

  const weekDoc = await getDoc(weekDocRef);
  if (!weekDoc.exists()) {
    console.warn('[workoutSessionService] Week doc does not exist:', weekDocRef.path);
    return;
  }

  const weekData = weekDoc.data();
  const days = weekData.days || [];
  const now = new Date().toISOString();

  const updatedDays = days.map((day: { day: number; completed?: boolean; completedAt?: string }) => {
    if (day.day === dayNumber) {
      return { ...day, completed: true, completedAt: now };
    }
    return day;
  });

  await updateDoc(weekDocRef, {
    days: updatedDays,
    updatedAt: now,
  });
}

/**
 * Find the week document that contains a specific day number.
 * Searches both 'weeks' and legacy 'programs' subcollections.
 */
async function findWeekDocWithDay(
  userId: string,
  programDocId: string,
  dayNumber: number
) {
  // Try 'weeks' subcollection first
  let weeksSnapshot = await getDocs(collection(db, `users/${userId}/programs/${programDocId}/weeks`));
  
  // Fall back to legacy 'programs' subcollection
  if (weeksSnapshot.empty) {
    weeksSnapshot = await getDocs(collection(db, `users/${userId}/programs/${programDocId}/programs`));
  }

  for (const weekDoc of weeksSnapshot.docs) {
    const data = weekDoc.data();
    const days = data.days || [];
    if (days.some((d: { day: number }) => d.day === dayNumber)) {
      return weekDoc.ref;
    }
  }

  return null;
}
