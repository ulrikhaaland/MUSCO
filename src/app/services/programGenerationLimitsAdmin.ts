import { adminDb } from '../firebase/admin';
import { ProgramType } from '../../../shared/types';
import { getStartOfWeek, getEndOfWeek } from '../utils/dateutils';

/**
 * Disable weekly generation limits in development (localhost)
 */
const DISABLE_WEEKLY_LIMITS = process.env.NODE_ENV === 'development';

/**
 * Weekly program generation limits service (Admin/Server-side version)
 * 
 * Rule: Only ONE program generation (new or follow-up) is allowed per week per program type.
 * A generation week runs Monday 00:00:00 through Saturday 23:59:59.
 * Sunday is treated as the start of the next generation week so users can
 * initiate follow-up programs on Sunday.
 */

export interface WeeklyProgramGenerations {
  [ProgramType.Exercise]?: string;
  [ProgramType.Recovery]?: string;
  [ProgramType.ExerciseAndRecovery]?: string;
}

/**
 * Get the current generation-week's start date as an ISO string (Monday 00:00:00 UTC).
 *
 * On Sundays the generation week rolls forward to the next Monday so that
 * follow-up programs initiated on Sunday are counted toward (and allowed in)
 * the upcoming week rather than blocked by the just-ended week.
 */
export function getCurrentWeekStartISO(): string {
  const now = new Date();
  const isSunday = now.getDay() === 0;

  // On Sunday, shift to next Monday so the limit window is Mon–Sat
  const weekStart = isSunday
    ? getStartOfWeek(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1))
    : getStartOfWeek(now);

  // Convert to UTC for consistent storage
  return new Date(
    Date.UTC(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate())
  ).toISOString();
}

/**
 * Check if a user can generate a program of the given type this week (Admin version)
 * @returns true if generation is allowed, false if weekly limit reached
 */
export async function canGenerateProgramAdmin(
  userId: string,
  programType: ProgramType
): Promise<boolean> {
  if (DISABLE_WEEKLY_LIMITS) {
    return true;
  }

  if (!userId) {
    console.warn('[programGenerationLimitsAdmin] No userId provided');
    return false;
  }

  try {
    const currentWeekStart = getCurrentWeekStartISO();
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
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
        `[programGenerationLimitsAdmin] Weekly limit reached for ${programType}. ` +
        `Last generated: ${lastGeneratedWeek}, Current week: ${currentWeekStart}`
      );
    }

    return canGenerate;
  } catch (error) {
    console.error('[programGenerationLimitsAdmin] Error checking generation limit:', error);
    // On error, allow generation to avoid blocking users
    return true;
  }
}

/**
 * Record that a program of the given type was generated this week (Admin version)
 */
export async function recordProgramGenerationAdmin(
  userId: string,
  programType: ProgramType
): Promise<void> {
  if (!userId) {
    console.warn('[programGenerationLimitsAdmin] No userId provided for recording');
    return;
  }

  try {
    const currentWeekStart = getCurrentWeekStartISO();
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      // Create user document with weekly generations
      await userRef.set({
        weeklyProgramGenerations: {
          [programType]: currentWeekStart,
        },
      });
    } else {
      // Update existing user document
      await userRef.update({
        [`weeklyProgramGenerations.${programType}`]: currentWeekStart,
      });
    }

    console.log(
      `[programGenerationLimitsAdmin] Recorded ${programType} generation for week ${currentWeekStart}`
    );
  } catch (error) {
    console.error('[programGenerationLimitsAdmin] Error recording generation:', error);
    // Don't throw - recording failure shouldn't block the generation
  }
}

/**
 * Get the date when the user can next generate a program of the given type (Admin version)
 * @returns Next Sunday (00:00), or null if generation is allowed now
 */
export async function getNextAllowedGenerationDateAdmin(
  userId: string,
  programType: ProgramType
): Promise<Date | null> {
  if (DISABLE_WEEKLY_LIMITS) {
    return null; // Generation always allowed
  }

  const canGenerate = await canGenerateProgramAdmin(userId, programType);
  
  if (canGenerate) {
    return null; // Generation allowed now
  }

  // Return Sunday 00:00 of the current week (the earliest follow-up day)
  const today = new Date();
  const weekEnd = getEndOfWeek(today);
  const sunday = new Date(weekEnd);
  sunday.setHours(0, 0, 0, 0);

  return sunday;
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



