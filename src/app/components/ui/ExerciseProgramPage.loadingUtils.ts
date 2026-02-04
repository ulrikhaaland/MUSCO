/**
 * Utility functions for ExerciseProgramPage logic
 * 
 * Extracted to enable unit testing of the loading state and week selection behavior
 */

import type { ProgramDay, ExerciseProgram } from '@/app/types/program';
import { getStartOfWeek, getEndOfWeek, addDays, getWeekNumber } from '@/app/utils/dateutils';

/**
 * Parameters for determining if viewing the generating week
 */
export interface IsViewingGeneratingWeekParams {
  /** The weekId of the week being generated (from Firebase) */
  generatingWeekId: string | null;
  /** The weekId of the currently selected/viewed week */
  selectedWeekId: string | undefined;
  /** The day number currently being generated (1-7), or 0 for metadata, or null if not generating */
  generatingDay: number | null;
  /** Whether the program has multiple weeks */
  hasMultipleWeeks: boolean;
  /** The 1-based index of the selected week */
  selectedWeek: number;
  /** Total number of weeks in the program */
  totalWeeks: number;
  /** The data for the selected week */
  selectedWeekData: { days: ProgramDay[] } | null;
}

/**
 * Determines if the user is viewing the week that is currently being generated.
 * 
 * This handles several scenarios:
 * 1. Active generation where generatingWeekId matches selectedWeekId
 * 2. Shimmer week (no weekId yet) that is the latest week with incomplete data
 * 3. Single-week programs during initial generation
 */
export function isViewingGeneratingWeek(params: IsViewingGeneratingWeekParams): boolean {
  const {
    generatingWeekId,
    selectedWeekId,
    generatingDay,
    hasMultipleWeeks,
    selectedWeek,
    totalWeeks,
    selectedWeekData,
  } = params;

  // If we have a generatingWeekId, use precise comparison
  if (generatingWeekId && selectedWeekId) {
    return selectedWeekId === generatingWeekId;
  }

  // Fallback for initial generation (no weekId yet) or single-week programs
  if (!hasMultipleWeeks) {
    return generatingDay !== null && selectedWeek === 1;
  }

  // If generatingWeekId is set but selected week has a DIFFERENT weekId, don't show loading
  // Note: If selectedWeekId is undefined (shimmer week), we should NOT return false here
  // because the shimmer week IS the generating week (just hasn't been replaced yet)
  if (generatingWeekId && selectedWeekId && selectedWeekId !== generatingWeekId) {
    return false;
  }

  // Fallback: check if latest week has incomplete data
  // This covers: shimmer week (no weekId yet), or when generation context hasn't synced
  const isViewingLatestWeek = selectedWeek === totalWeeks;
  if (isViewingLatestWeek && selectedWeekData) {
    const daysWithContent = selectedWeekData.days.filter(
      (d) => d && d.exercises && d.exercises.length > 0
    ).length;
    return daysWithContent < 7;
  }

  return false;
}

/**
 * Checks if a program day has actual exercise content.
 * 
 * This is used to determine if a day has been generated and populated,
 * not just if it exists as a placeholder.
 */
export function hasDayData(day: ProgramDay | undefined | null): boolean {
  return !!day && Array.isArray(day.exercises) && day.exercises.length > 0;
}

/**
 * Determines the display state for a day tab
 */
export type DayTabDisplayState = 'generating' | 'generated' | 'pending';

export interface GetDayTabDisplayStateParams {
  /** Whether this specific day is currently being generated */
  isDayGenerating: boolean;
  /** Whether this day has been generated (has content) */
  isDayGenerated: boolean;
}

/**
 * Returns the display state for a day tab:
 * - 'generating': Show spinner (this day is currently being generated)
 * - 'generated': Show day type label (this day is complete)
 * - 'pending': Show placeholder "—" (this day hasn't been generated yet)
 */
export function getDayTabDisplayState(params: GetDayTabDisplayStateParams): DayTabDisplayState {
  const { isDayGenerating, isDayGenerated } = params;

  if (isDayGenerating) {
    return 'generating';
  }

  if (isDayGenerated) {
    return 'generated';
  }

  return 'pending';
}

/**
 * Parameters for computing effective generation state
 */
export interface GetEffectiveGenerationStateParams {
  /** Whether we're viewing the generating week */
  isViewingGeneratingWeek: boolean;
  /** Array of day numbers that have been generated (from context) */
  generatedDays: number[];
  /** The day currently being generated, or null */
  generatingDay: number | null;
}

/**
 * Result of effective generation state computation
 */
export interface EffectiveGenerationState {
  /** Days to treat as generated for display purposes */
  effectiveGeneratedDays: number[];
  /** Day currently generating, or null if not applicable */
  effectiveGeneratingDay: number | null;
}

/**
 * Computes the effective generation state for display.
 * 
 * When viewing the generating week, use the actual generation state.
 * When viewing a previous (completed) week, treat all days as generated.
 */
export function getEffectiveGenerationState(
  params: GetEffectiveGenerationStateParams
): EffectiveGenerationState {
  const { isViewingGeneratingWeek, generatedDays, generatingDay } = params;

  if (isViewingGeneratingWeek) {
    return {
      effectiveGeneratedDays: generatedDays,
      effectiveGeneratingDay: generatingDay,
    };
  }

  // For previous weeks (not currently generating), treat all days as generated
  return {
    effectiveGeneratedDays: [1, 2, 3, 4, 5, 6, 7],
    effectiveGeneratingDay: null,
  };
}

// ============================================================================
// Week Selection Logic
// ============================================================================

/**
 * Simplified week program type for week selection calculations
 */
export interface WeekProgramInfo {
  createdAt?: Date | string | null;
  weekId?: string;
}

/**
 * Result of initial week selection calculation
 */
export interface WeekSelectionResult {
  weekToSelect: number;
  dayToSelect: number;
}

/**
 * Checks if a date falls within a week's date range (Monday to Sunday).
 */
export function isDateInWeekRange(date: Date, weekCreatedAt: Date | string): boolean {
  const weekStart = getStartOfWeek(new Date(weekCreatedAt));
  const weekEnd = getEndOfWeek(weekStart);
  return date >= weekStart && date <= weekEnd;
}

/**
 * Finds which week index (0-based) the current date falls into.
 * Returns -1 if no matching week is found.
 */
export function findCurrentWeekIndex(
  currentDate: Date,
  programs: WeekProgramInfo[]
): number {
  for (let i = 0; i < programs.length; i++) {
    const weekProgram = programs[i];
    if (weekProgram.createdAt && isDateInWeekRange(currentDate, weekProgram.createdAt)) {
      return i;
    }
  }
  return -1;
}

/**
 * Parameters for determining initial week selection
 */
export interface DetermineInitialWeekSelectionParams {
  currentDate: Date;
  currentDayOfWeek: number; // 1 = Monday, 7 = Sunday
  programs: WeekProgramInfo[];
  isCustomProgram: boolean;
  isGenerating: boolean;
}

/**
 * Determines which week and day should be initially selected when the program loads.
 * 
 * Priority:
 * 1. If generating, select the generating week (last week) with Monday
 * 2. If current date falls within a week's range, select that week
 * 3. If current date is before all weeks, select first week
 * 4. If current date is after all weeks, select placeholder week (for follow-up)
 */
export function determineInitialWeekSelection(
  params: DetermineInitialWeekSelectionParams
): WeekSelectionResult {
  const { currentDate, currentDayOfWeek, programs, isCustomProgram, isGenerating } = params;

  // During generation, always select the last (generating) week
  if (isGenerating && programs.length > 0) {
    return {
      weekToSelect: programs.length,
      dayToSelect: 1, // Monday
    };
  }

  // For custom programs, always start with week 1
  if (isCustomProgram) {
    return {
      weekToSelect: 1,
      dayToSelect: currentDayOfWeek,
    };
  }

  // No programs = default to week 1
  if (programs.length === 0) {
    return {
      weekToSelect: 1,
      dayToSelect: currentDayOfWeek,
    };
  }

  // Find which week we're currently in based on dates
  const matchingWeekIndex = findCurrentWeekIndex(currentDate, programs);
  
  if (matchingWeekIndex >= 0) {
    return {
      weekToSelect: matchingWeekIndex + 1, // 1-based
      dayToSelect: currentDayOfWeek,
    };
  }

  // No matching week found - determine if we're before or after the program
  const firstWeek = programs[0];
  const lastWeek = programs[programs.length - 1];

  if (firstWeek.createdAt && currentDate < getStartOfWeek(new Date(firstWeek.createdAt))) {
    // Before program starts - select first week
    return {
      weekToSelect: 1,
      dayToSelect: currentDayOfWeek,
    };
  }

  if (lastWeek.createdAt) {
    const lastWeekEnd = getEndOfWeek(new Date(lastWeek.createdAt));
    if (currentDate > lastWeekEnd) {
      // After last week ends - select placeholder week (programs.length + 1)
      // This triggers the "Start Feedback Process" card
      return {
        weekToSelect: programs.length + 1,
        dayToSelect: currentDayOfWeek,
      };
    }
  }

  // Fallback - select last existing week
  return {
    weekToSelect: programs.length,
    dayToSelect: currentDayOfWeek,
  };
}

/**
 * Determines if a placeholder week tab should be shown.
 * Placeholder week is shown when:
 * 1. User has at least one completed week
 * 2. Not a custom program
 * 3. Not currently generating
 */
export function shouldShowPlaceholderWeek(params: {
  programsCount: number;
  isCustomProgram: boolean;
  isGenerating: boolean;
}): boolean {
  const { programsCount, isCustomProgram, isGenerating } = params;
  return programsCount > 0 && !isCustomProgram && !isGenerating;
}

/**
 * Calculates the week number to display for a given week tab.
 * 
 * For existing weeks: uses getWeekNumber based on createdAt
 * For placeholder weeks: calculates the next calendar week after the last existing week
 */
export function getDisplayedWeekNumber(params: {
  weekIndex: number; // 0-based index
  programs: WeekProgramInfo[];
  isPlaceholder: boolean;
  currentDate: Date;
  fallbackWeekNumber?: number;
}): number {
  const { weekIndex, programs, isPlaceholder, currentDate, fallbackWeekNumber } = params;

  if (!isPlaceholder && weekIndex < programs.length) {
    // Existing week - use its createdAt to calculate week number
    const weekProgram = programs[weekIndex];
    if (weekProgram.createdAt) {
      return getWeekNumber(new Date(weekProgram.createdAt));
    }
    return fallbackWeekNumber ?? (weekIndex + 1);
  }

  if (isPlaceholder && programs.length > 0) {
    // Placeholder week - calculate next week after last existing week
    const lastWeek = programs[programs.length - 1];
    if (lastWeek.createdAt) {
      const lastWeekStart = getStartOfWeek(new Date(lastWeek.createdAt));
      const currentWeekStart = getStartOfWeek(currentDate);
      
      // Find the next week that's at or after the current week
      let placeholderStart = addDays(lastWeekStart, 7);
      while (placeholderStart < currentWeekStart) {
        placeholderStart = addDays(placeholderStart, 7);
      }
      
      return getWeekNumber(placeholderStart);
    }
  }

  // Fallback
  return fallbackWeekNumber ?? (weekIndex + 1);
}

/**
 * Calculates the date range string for a week (e.g., "Jan 12-18")
 */
export function getWeekDateRangeString(
  weekCreatedAt: Date | string,
  getMonthAbbrev: (date: Date) => string
): string {
  const weekStart = getStartOfWeek(new Date(weekCreatedAt));
  const weekEnd = getEndOfWeek(weekStart);
  
  const startMonth = getMonthAbbrev(weekStart);
  const endMonth = getMonthAbbrev(weekEnd);
  
  const startDay = weekStart.getDate();
  const endDay = weekEnd.getDate();
  
  if (startMonth === endMonth) {
    return `${startMonth} ${startDay}-${endDay}`;
  }
  return `${startMonth} ${startDay}-${endMonth} ${endDay}`;
}
