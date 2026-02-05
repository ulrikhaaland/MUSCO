import { doc, getDoc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { ProgramType } from '../../../shared/types';
import { getStartOfWeek } from '../utils/dateutils';

/**
 * Disable weekly generation limits on localhost (for development only, not tests)
 */
const DISABLE_WEEKLY_LIMITS =
  typeof window !== 'undefined' &&
  window.location.hostname === 'localhost' &&
  !process.env.JEST_WORKER_ID;

/**
 * Weekly program generation limits service
 * 
 * Rule: Only ONE program generation (new or follow-up) is allowed per week per program type.
 * A week starts on Monday 00:00:00 and ends Sunday 23:59:59.
 */

export interface WeeklyProgramGenerations {
  [ProgramType.Exercise]?: string;
  [ProgramType.Recovery]?: string;
  [ProgramType.ExerciseAndRecovery]?: string;
}

/**
 * Get the current week's start date as an ISO string (Monday 00:00:00 UTC)
 */
export function getCurrentWeekStartISO(): string {
  const weekStart = getStartOfWeek(new Date());
  // Convert to UTC for consistent storage
  return new Date(
    Date.UTC(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
  ).toISOString();
}

/**
 * Check if a user can generate a program of the given type this week
 * @returns true if generation is allowed, false if weekly limit reached
 */
export async function canGenerateProgram(
  userId: string,
  programType: ProgramType
): Promise<boolean> {
  if (DISABLE_WEEKLY_LIMITS) {
    return true;
  }

  if (!userId) {
    console.warn('[programGenerationLimits] No userId provided');
    return false;
  }

  try {
    const currentWeekStart = getCurrentWeekStartISO();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // New user, no limits yet
      return true;
    }

    const generations: WeeklyProgramGenerations =
      userDoc.data()?.weeklyProgramGenerations || {};
    const lastGeneratedWeek = generations[programType];

    // Allow if no record for this type, or if the recorded week differs from current week
    const canGenerate = !lastGeneratedWeek || lastGeneratedWeek !== currentWeekStart;

    if (!canGenerate) {
      console.log(
        `[programGenerationLimits] Weekly limit reached for ${programType}. ` +
        `Last generated: ${lastGeneratedWeek}, Current week: ${currentWeekStart}`
      );
    }

    return canGenerate;
  } catch (error) {
    console.error('[programGenerationLimits] Error checking generation limit:', error);
    // On error, allow generation to avoid blocking users
    return true;
  }
}

/**
 * Record that a program of the given type was generated this week
 */
export async function recordProgramGeneration(
  userId: string,
  programType: ProgramType
): Promise<void> {
  if (!userId) {
    console.warn('[programGenerationLimits] No userId provided for recording');
    return;
  }

  try {
    const currentWeekStart = getCurrentWeekStartISO();
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) {
      // Create user document with weekly generations
      await setDoc(userRef, {
        weeklyProgramGenerations: {
          [programType]: currentWeekStart,
        },
      });
    } else {
      // Update existing user document
      await updateDoc(userRef, {
        [`weeklyProgramGenerations.${programType}`]: currentWeekStart,
      });
    }

    console.log(
      `[programGenerationLimits] Recorded ${programType} generation for week ${currentWeekStart}`
    );
  } catch (error) {
    console.error('[programGenerationLimits] Error recording generation:', error);
    // Don't throw - recording failure shouldn't block the generation
  }
}

/**
 * Get the date when the user can next generate a program of the given type
 * @returns Date of next Monday, or null if generation is allowed now
 */
export async function getNextAllowedGenerationDate(
  userId: string,
  programType: ProgramType
): Promise<Date | null> {
  if (DISABLE_WEEKLY_LIMITS) {
    return null; // Generation always allowed
  }

  const canGenerate = await canGenerateProgram(userId, programType);
  
  if (canGenerate) {
    return null; // Generation allowed now
  }

  // Return next Monday
  const today = new Date();
  const currentWeekStart = getStartOfWeek(today);
  const nextMonday = new Date(currentWeekStart);
  nextMonday.setDate(nextMonday.getDate() + 7);
  
  return nextMonday;
}

/**
 * Get all program types that can still be generated this week
 */
export async function getAvailableProgramTypes(
  userId: string
): Promise<ProgramType[]> {
  const allTypes = [
    ProgramType.Exercise,
    ProgramType.Recovery,
    ProgramType.ExerciseAndRecovery,
  ];

  if (DISABLE_WEEKLY_LIMITS) {
    return allTypes; // All types available
  }

  const results = await Promise.all(
    allTypes.map(async (type) => ({
      type,
      canGenerate: await canGenerateProgram(userId, type),
    }))
  );

  return results.filter((r) => r.canGenerate).map((r) => r.type);
}

/**
 * Error class for weekly limit reached
 */
export class WeeklyLimitReachedError extends Error {
  public readonly programType: ProgramType;
  public readonly nextAllowedDate: Date;

  constructor(programType: ProgramType, nextAllowedDate: Date) {
    super(`Weekly generation limit reached for ${programType}`);
    this.name = 'WeeklyLimitReachedError';
    this.programType = programType;
    this.nextAllowedDate = nextAllowedDate;
  }
}



