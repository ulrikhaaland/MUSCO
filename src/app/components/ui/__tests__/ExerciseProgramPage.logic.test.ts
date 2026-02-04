/**
 * Tests for ExerciseProgramPage logic
 * 
 * These tests verify the correct behavior of:
 * 1. isViewingGeneratingWeek - determines if we're viewing a week being generated
 * 2. hasDayData - checks if a day has actual exercise content
 * 3. Day tab display states - spinner, day type, or placeholder
 * 4. effectiveGeneratedDays/effectiveGeneratingDay - derived state based on viewing context
 * 5. Week selection logic - determines which week to select on load
 * 6. Placeholder week logic - when to show the "next week" tab
 */

import {
  isViewingGeneratingWeek,
  hasDayData,
  getDayTabDisplayState,
  getEffectiveGenerationState,
  isDateInWeekRange,
  findCurrentWeekIndex,
  determineInitialWeekSelection,
  shouldShowPlaceholderWeek,
  getDisplayedWeekNumber,
  getWeekDateRangeString,
  type WeekProgramInfo,
} from '../ExerciseProgramPage.loadingUtils';
import type { ProgramDay } from '@/app/types/program';

describe('ExerciseProgramPage Loading States', () => {
  describe('isViewingGeneratingWeek', () => {
    it('returns true when generatingWeekId matches selectedWeekId', () => {
      const result = isViewingGeneratingWeek({
        generatingWeekId: 'week_6',
        selectedWeekId: 'week_6',
        generatingDay: 2,
        hasMultipleWeeks: true,
        selectedWeek: 3,
        totalWeeks: 3,
        selectedWeekData: { days: [] },
      });
      expect(result).toBe(true);
    });

    it('returns false when generatingWeekId and selectedWeekId are different and both defined', () => {
      const result = isViewingGeneratingWeek({
        generatingWeekId: 'week_6',
        selectedWeekId: 'week_4',
        generatingDay: 2,
        hasMultipleWeeks: true,
        selectedWeek: 2,
        totalWeeks: 3,
        selectedWeekData: { days: [] },
      });
      expect(result).toBe(false);
    });

    it('returns true when viewing shimmer week (no weekId) that is latest week with incomplete data', () => {
      // Shimmer week has no weekId, but is the latest week being generated
      const result = isViewingGeneratingWeek({
        generatingWeekId: 'week_6', // Firebase has started generating
        selectedWeekId: undefined, // Shimmer week has no weekId
        generatingDay: 1,
        hasMultipleWeeks: true,
        selectedWeek: 3, // Viewing 3rd week
        totalWeeks: 3, // Total 3 weeks (including shimmer)
        selectedWeekData: {
          days: [
            { day: 1, exercises: [] },
            { day: 2, exercises: [] },
            { day: 3, exercises: [] },
            { day: 4, exercises: [] },
            { day: 5, exercises: [] },
            { day: 6, exercises: [] },
            { day: 7, exercises: [] },
          ] as ProgramDay[],
        },
      });
      expect(result).toBe(true);
    });

    it('returns true for single-week program when generatingDay is set', () => {
      const result = isViewingGeneratingWeek({
        generatingWeekId: null,
        selectedWeekId: undefined,
        generatingDay: 3,
        hasMultipleWeeks: false,
        selectedWeek: 1,
        totalWeeks: 1,
        selectedWeekData: { days: [] },
      });
      expect(result).toBe(true);
    });

    it('returns false for single-week program when not generating', () => {
      const result = isViewingGeneratingWeek({
        generatingWeekId: null,
        selectedWeekId: undefined,
        generatingDay: null,
        hasMultipleWeeks: false,
        selectedWeek: 1,
        totalWeeks: 1,
        selectedWeekData: { days: [] },
      });
      expect(result).toBe(false);
    });

    it('returns true when latest week has less than 7 days with content', () => {
      const result = isViewingGeneratingWeek({
        generatingWeekId: null,
        selectedWeekId: undefined,
        generatingDay: null,
        hasMultipleWeeks: true,
        selectedWeek: 3,
        totalWeeks: 3,
        selectedWeekData: {
          days: [
            { day: 1, exercises: [{ id: '1', name: 'Test' }] },
            { day: 2, exercises: [{ id: '2', name: 'Test' }] },
            { day: 3, exercises: [] }, // No content
            { day: 4, exercises: [] },
            { day: 5, exercises: [] },
            { day: 6, exercises: [] },
            { day: 7, exercises: [] },
          ] as unknown as ProgramDay[],
        },
      });
      expect(result).toBe(true);
    });

    it('returns false when all 7 days have content', () => {
      const daysWithContent = [1, 2, 3, 4, 5, 6, 7].map(day => ({
        day,
        exercises: [{ id: `ex_${day}`, name: `Exercise ${day}` }],
      })) as unknown as ProgramDay[];

      const result = isViewingGeneratingWeek({
        generatingWeekId: null,
        selectedWeekId: undefined,
        generatingDay: null,
        hasMultipleWeeks: true,
        selectedWeek: 3,
        totalWeeks: 3,
        selectedWeekData: { days: daysWithContent },
      });
      expect(result).toBe(false);
    });

    it('returns false when viewing a previous week (not latest)', () => {
      const result = isViewingGeneratingWeek({
        generatingWeekId: 'week_6',
        selectedWeekId: 'week_4',
        generatingDay: 2,
        hasMultipleWeeks: true,
        selectedWeek: 2, // Viewing week 2
        totalWeeks: 3, // But week 3 is generating
        selectedWeekData: { days: [] },
      });
      expect(result).toBe(false);
    });
  });

  describe('hasDayData', () => {
    it('returns false for undefined day', () => {
      expect(hasDayData(undefined)).toBe(false);
    });

    it('returns false for null day', () => {
      expect(hasDayData(null as unknown as ProgramDay)).toBe(false);
    });

    it('returns false when exercises is not an array', () => {
      const day = { day: 1, exercises: null } as unknown as ProgramDay;
      expect(hasDayData(day)).toBe(false);
    });

    it('returns false when exercises array is empty', () => {
      const day = { day: 1, exercises: [] } as ProgramDay;
      expect(hasDayData(day)).toBe(false);
    });

    it('returns true when exercises array has items', () => {
      const day = {
        day: 1,
        exercises: [{ id: '1', name: 'Push Up' }],
      } as unknown as ProgramDay;
      expect(hasDayData(day)).toBe(true);
    });
  });

  describe('getDayTabDisplayState', () => {
    it('returns "generating" when isDayGenerating is true', () => {
      const result = getDayTabDisplayState({
        isDayGenerating: true,
        isDayGenerated: false,
      });
      expect(result).toBe('generating');
    });

    it('returns "generated" when isDayGenerated is true', () => {
      const result = getDayTabDisplayState({
        isDayGenerating: false,
        isDayGenerated: true,
      });
      expect(result).toBe('generated');
    });

    it('returns "pending" when neither generating nor generated', () => {
      const result = getDayTabDisplayState({
        isDayGenerating: false,
        isDayGenerated: false,
      });
      expect(result).toBe('pending');
    });

    it('returns "generating" when both are true (generating takes priority)', () => {
      const result = getDayTabDisplayState({
        isDayGenerating: true,
        isDayGenerated: true,
      });
      expect(result).toBe('generating');
    });
  });

  describe('getEffectiveGenerationState', () => {
    it('returns actual generatedDays when viewing generating week', () => {
      const result = getEffectiveGenerationState({
        isViewingGeneratingWeek: true,
        generatedDays: [1, 2, 3],
        generatingDay: 4,
      });
      expect(result.effectiveGeneratedDays).toEqual([1, 2, 3]);
      expect(result.effectiveGeneratingDay).toBe(4);
    });

    it('returns all days as generated when not viewing generating week', () => {
      const result = getEffectiveGenerationState({
        isViewingGeneratingWeek: false,
        generatedDays: [1, 2, 3],
        generatingDay: 4,
      });
      expect(result.effectiveGeneratedDays).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(result.effectiveGeneratingDay).toBeNull();
    });

    it('returns empty array for generatedDays when viewing generating week with no progress', () => {
      const result = getEffectiveGenerationState({
        isViewingGeneratingWeek: true,
        generatedDays: [],
        generatingDay: 0,
      });
      expect(result.effectiveGeneratedDays).toEqual([]);
      expect(result.effectiveGeneratingDay).toBe(0);
    });
  });
});

describe('Integration: Loading state scenarios', () => {
  describe('Follow-up generation flow', () => {
    it('scenario: generation just started (shimmer week, no Firebase data yet)', () => {
      // User clicks "Start Feedback Process", shimmer week is added
      const isViewing = isViewingGeneratingWeek({
        generatingWeekId: null, // Firebase hasn't created week yet
        selectedWeekId: undefined, // Shimmer week has no weekId
        generatingDay: 0, // Set to 0 to indicate starting
        hasMultipleWeeks: true,
        selectedWeek: 3,
        totalWeeks: 3,
        selectedWeekData: {
          days: [1, 2, 3, 4, 5, 6, 7].map(day => ({
            day,
            exercises: [], // All empty
          })) as ProgramDay[],
        },
      });

      expect(isViewing).toBe(true);

      const { effectiveGeneratedDays, effectiveGeneratingDay } = getEffectiveGenerationState({
        isViewingGeneratingWeek: isViewing,
        generatedDays: [],
        generatingDay: 0,
      });

      expect(effectiveGeneratedDays).toEqual([]);
      expect(effectiveGeneratingDay).toBe(0);

      // All days should show "pending" state
      for (let day = 1; day <= 7; day++) {
        const state = getDayTabDisplayState({
          isDayGenerating: effectiveGeneratingDay === day,
          isDayGenerated: effectiveGeneratedDays.includes(day),
        });
        expect(state).toBe('pending');
      }
    });

    it('scenario: day 1 generated, day 2 generating', () => {
      const isViewing = isViewingGeneratingWeek({
        generatingWeekId: 'week_6',
        selectedWeekId: 'week_6',
        generatingDay: 2,
        hasMultipleWeeks: true,
        selectedWeek: 3,
        totalWeeks: 3,
        selectedWeekData: {
          days: [
            { day: 1, exercises: [{ id: '1', name: 'Push Up' }] },
            { day: 2, exercises: [] },
            { day: 3, exercises: [] },
            { day: 4, exercises: [] },
            { day: 5, exercises: [] },
            { day: 6, exercises: [] },
            { day: 7, exercises: [] },
          ] as unknown as ProgramDay[],
        },
      });

      expect(isViewing).toBe(true);

      const { effectiveGeneratedDays, effectiveGeneratingDay } = getEffectiveGenerationState({
        isViewingGeneratingWeek: isViewing,
        generatedDays: [1],
        generatingDay: 2,
      });

      // Day 1: generated
      expect(getDayTabDisplayState({
        isDayGenerating: effectiveGeneratingDay === 1,
        isDayGenerated: effectiveGeneratedDays.includes(1),
      })).toBe('generated');

      // Day 2: generating
      expect(getDayTabDisplayState({
        isDayGenerating: effectiveGeneratingDay === 2,
        isDayGenerated: effectiveGeneratedDays.includes(2),
      })).toBe('generating');

      // Days 3-7: pending
      for (let day = 3; day <= 7; day++) {
        expect(getDayTabDisplayState({
          isDayGenerating: effectiveGeneratingDay === day,
          isDayGenerated: effectiveGeneratedDays.includes(day),
        })).toBe('pending');
      }
    });

    it('scenario: viewing previous week while new week is generating', () => {
      // User clicked on Week 4 tab while Week 6 is generating
      const isViewing = isViewingGeneratingWeek({
        generatingWeekId: 'week_6',
        selectedWeekId: 'week_4',
        generatingDay: 3,
        hasMultipleWeeks: true,
        selectedWeek: 2, // Viewing week 2 in the array
        totalWeeks: 3,
        selectedWeekData: {
          days: [1, 2, 3, 4, 5, 6, 7].map(day => ({
            day,
            exercises: [{ id: `ex_${day}`, name: `Exercise ${day}` }],
          })) as unknown as ProgramDay[],
        },
      });

      // Should NOT be viewing generating week
      expect(isViewing).toBe(false);

      const { effectiveGeneratedDays, effectiveGeneratingDay } = getEffectiveGenerationState({
        isViewingGeneratingWeek: isViewing,
        generatedDays: [1, 2],
        generatingDay: 3,
      });

      // All days should appear as generated (it's a completed week)
      expect(effectiveGeneratedDays).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(effectiveGeneratingDay).toBeNull();

      // All days show "generated" state
      for (let day = 1; day <= 7; day++) {
        expect(getDayTabDisplayState({
          isDayGenerating: effectiveGeneratingDay === day,
          isDayGenerated: effectiveGeneratedDays.includes(day),
        })).toBe('generated');
      }
    });

    it('scenario: generation complete, all days have content', () => {
      const daysWithContent = [1, 2, 3, 4, 5, 6, 7].map(day => ({
        day,
        exercises: [{ id: `ex_${day}`, name: `Exercise ${day}` }],
      })) as unknown as ProgramDay[];

      const isViewing = isViewingGeneratingWeek({
        generatingWeekId: null, // Generation complete
        selectedWeekId: 'week_6',
        generatingDay: null,
        hasMultipleWeeks: true,
        selectedWeek: 3,
        totalWeeks: 3,
        selectedWeekData: { days: daysWithContent },
      });

      expect(isViewing).toBe(false);

      const { effectiveGeneratedDays, effectiveGeneratingDay } = getEffectiveGenerationState({
        isViewingGeneratingWeek: isViewing,
        generatedDays: [1, 2, 3, 4, 5, 6, 7],
        generatingDay: null,
      });

      expect(effectiveGeneratedDays).toEqual([1, 2, 3, 4, 5, 6, 7]);
      expect(effectiveGeneratingDay).toBeNull();
    });
  });
});

// ============================================================================
// Week Selection Logic Tests
// ============================================================================

describe('Week Selection Logic', () => {
  // Helper to create a date at the start of a specific week
  const createWeekDate = (year: number, month: number, day: number) => new Date(year, month, day);

  describe('isDateInWeekRange', () => {
    it('returns true when date is within week range', () => {
      // Week starting Monday Jan 13, 2025
      const weekStart = createWeekDate(2025, 0, 13);
      const dateInWeek = createWeekDate(2025, 0, 15); // Wednesday
      
      expect(isDateInWeekRange(dateInWeek, weekStart)).toBe(true);
    });

    it('returns true for Monday (start of week)', () => {
      const weekStart = createWeekDate(2025, 0, 13);
      expect(isDateInWeekRange(weekStart, weekStart)).toBe(true);
    });

    it('returns true for Sunday (end of week)', () => {
      const weekStart = createWeekDate(2025, 0, 13);
      const sunday = createWeekDate(2025, 0, 19);
      
      expect(isDateInWeekRange(sunday, weekStart)).toBe(true);
    });

    it('returns false for date before week', () => {
      const weekStart = createWeekDate(2025, 0, 13);
      const beforeWeek = createWeekDate(2025, 0, 12); // Sunday before
      
      expect(isDateInWeekRange(beforeWeek, weekStart)).toBe(false);
    });

    it('returns false for date after week', () => {
      const weekStart = createWeekDate(2025, 0, 13);
      const afterWeek = createWeekDate(2025, 0, 20); // Monday after
      
      expect(isDateInWeekRange(afterWeek, weekStart)).toBe(false);
    });
  });

  describe('findCurrentWeekIndex', () => {
    const programs: WeekProgramInfo[] = [
      { createdAt: createWeekDate(2025, 0, 6) },  // Week 1: Jan 6-12
      { createdAt: createWeekDate(2025, 0, 13) }, // Week 2: Jan 13-19
      { createdAt: createWeekDate(2025, 0, 20) }, // Week 3: Jan 20-26
    ];

    it('returns correct index when date falls in first week', () => {
      const currentDate = createWeekDate(2025, 0, 8); // Wednesday of week 1
      expect(findCurrentWeekIndex(currentDate, programs)).toBe(0);
    });

    it('returns correct index when date falls in middle week', () => {
      const currentDate = createWeekDate(2025, 0, 15); // Wednesday of week 2
      expect(findCurrentWeekIndex(currentDate, programs)).toBe(1);
    });

    it('returns correct index when date falls in last week', () => {
      const currentDate = createWeekDate(2025, 0, 22); // Wednesday of week 3
      expect(findCurrentWeekIndex(currentDate, programs)).toBe(2);
    });

    it('returns -1 when date is before all weeks', () => {
      const currentDate = createWeekDate(2025, 0, 1);
      expect(findCurrentWeekIndex(currentDate, programs)).toBe(-1);
    });

    it('returns -1 when date is after all weeks', () => {
      const currentDate = createWeekDate(2025, 0, 28);
      expect(findCurrentWeekIndex(currentDate, programs)).toBe(-1);
    });

    it('returns -1 for empty programs array', () => {
      const currentDate = createWeekDate(2025, 0, 15);
      expect(findCurrentWeekIndex(currentDate, [])).toBe(-1);
    });
  });

  describe('determineInitialWeekSelection', () => {
    const programs: WeekProgramInfo[] = [
      { createdAt: createWeekDate(2025, 0, 6) },  // Week 1: Jan 6-12
      { createdAt: createWeekDate(2025, 0, 13) }, // Week 2: Jan 13-19
    ];

    it('selects the generating week when isGenerating is true', () => {
      const result = determineInitialWeekSelection({
        currentDate: createWeekDate(2025, 0, 8),
        currentDayOfWeek: 3, // Wednesday
        programs,
        isCustomProgram: false,
        isGenerating: true,
      });

      expect(result.weekToSelect).toBe(2); // Last week (generating)
      expect(result.dayToSelect).toBe(1); // Monday
    });

    it('selects week 1 for custom programs', () => {
      const result = determineInitialWeekSelection({
        currentDate: createWeekDate(2025, 0, 15),
        currentDayOfWeek: 3,
        programs,
        isCustomProgram: true,
        isGenerating: false,
      });

      expect(result.weekToSelect).toBe(1);
      expect(result.dayToSelect).toBe(3);
    });

    it('selects the week containing current date', () => {
      const result = determineInitialWeekSelection({
        currentDate: createWeekDate(2025, 0, 15), // Wednesday of week 2
        currentDayOfWeek: 3,
        programs,
        isCustomProgram: false,
        isGenerating: false,
      });

      expect(result.weekToSelect).toBe(2);
      expect(result.dayToSelect).toBe(3);
    });

    it('selects placeholder week when current date is after all weeks', () => {
      const result = determineInitialWeekSelection({
        currentDate: createWeekDate(2025, 0, 22), // After all weeks
        currentDayOfWeek: 3,
        programs,
        isCustomProgram: false,
        isGenerating: false,
      });

      expect(result.weekToSelect).toBe(3); // programs.length + 1 (placeholder)
      expect(result.dayToSelect).toBe(3);
    });

    it('selects first week when current date is before all weeks', () => {
      const result = determineInitialWeekSelection({
        currentDate: createWeekDate(2025, 0, 1), // Before all weeks
        currentDayOfWeek: 3,
        programs,
        isCustomProgram: false,
        isGenerating: false,
      });

      expect(result.weekToSelect).toBe(1);
      expect(result.dayToSelect).toBe(3);
    });

    it('handles empty programs array', () => {
      const result = determineInitialWeekSelection({
        currentDate: createWeekDate(2025, 0, 15),
        currentDayOfWeek: 3,
        programs: [],
        isCustomProgram: false,
        isGenerating: false,
      });

      expect(result.weekToSelect).toBe(1);
      expect(result.dayToSelect).toBe(3);
    });
  });

  describe('shouldShowPlaceholderWeek', () => {
    it('returns true when has programs, not custom, not generating', () => {
      expect(shouldShowPlaceholderWeek({
        programsCount: 2,
        isCustomProgram: false,
        isGenerating: false,
      })).toBe(true);
    });

    it('returns false when no programs', () => {
      expect(shouldShowPlaceholderWeek({
        programsCount: 0,
        isCustomProgram: false,
        isGenerating: false,
      })).toBe(false);
    });

    it('returns false for custom programs', () => {
      expect(shouldShowPlaceholderWeek({
        programsCount: 2,
        isCustomProgram: true,
        isGenerating: false,
      })).toBe(false);
    });

    it('returns false when generating', () => {
      expect(shouldShowPlaceholderWeek({
        programsCount: 2,
        isCustomProgram: false,
        isGenerating: true,
      })).toBe(false);
    });
  });

  describe('getDisplayedWeekNumber', () => {
    const programs: WeekProgramInfo[] = [
      { createdAt: createWeekDate(2025, 0, 6) },  // Week 2 (of the year)
      { createdAt: createWeekDate(2025, 0, 13) }, // Week 3 (of the year)
    ];

    it('returns week number based on createdAt for existing weeks', () => {
      const weekNum = getDisplayedWeekNumber({
        weekIndex: 0,
        programs,
        isPlaceholder: false,
        currentDate: createWeekDate(2025, 0, 15),
      });

      // Week 2 of year 2025 starts Jan 6
      expect(weekNum).toBe(2);
    });

    it('calculates placeholder week number correctly', () => {
      const weekNum = getDisplayedWeekNumber({
        weekIndex: 2, // Beyond existing programs
        programs,
        isPlaceholder: true,
        currentDate: createWeekDate(2025, 0, 22), // In week 4
      });

      // Should be week 4 (next week after week 3)
      expect(weekNum).toBe(4);
    });

    it('uses fallback when no createdAt', () => {
      const weekNum = getDisplayedWeekNumber({
        weekIndex: 0,
        programs: [{ weekId: 'week_1' }], // No createdAt
        isPlaceholder: false,
        currentDate: createWeekDate(2025, 0, 15),
        fallbackWeekNumber: 5,
      });

      expect(weekNum).toBe(5);
    });
  });

  describe('getWeekDateRangeString', () => {
    const mockGetMonthAbbrev = (date: Date) => {
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return months[date.getMonth()];
    };

    it('returns correct format when week is within same month', () => {
      // Week of Jan 13-19, 2025
      const result = getWeekDateRangeString(
        createWeekDate(2025, 0, 13),
        mockGetMonthAbbrev
      );
      expect(result).toBe('Jan 13-19');
    });

    it('returns correct format when week spans two months', () => {
      // Week of Jan 27 - Feb 2, 2025
      const result = getWeekDateRangeString(
        createWeekDate(2025, 0, 27),
        mockGetMonthAbbrev
      );
      expect(result).toBe('Jan 27-Feb 2');
    });
  });
});

describe('Integration: Week selection scenarios', () => {
  const createWeekDate = (year: number, month: number, day: number) => new Date(year, month, day);

  it('scenario: user returns after completing one week, should see feedback prompt', () => {
    // User completed week 1 (Jan 6-12), current date is Jan 20 (after week 1)
    const programs: WeekProgramInfo[] = [
      { createdAt: createWeekDate(2025, 0, 6), weekId: 'week_1' },
    ];

    const result = determineInitialWeekSelection({
      currentDate: createWeekDate(2025, 0, 20), // After week 1
      currentDayOfWeek: 1, // Monday
      programs,
      isCustomProgram: false,
      isGenerating: false,
    });

    // Should select placeholder week (week 2) to show feedback prompt
    expect(result.weekToSelect).toBe(2);
    
    // Placeholder should be shown
    expect(shouldShowPlaceholderWeek({
      programsCount: 1,
      isCustomProgram: false,
      isGenerating: false,
    })).toBe(true);
  });

  it('scenario: user is mid-week in their current program', () => {
    const programs: WeekProgramInfo[] = [
      { createdAt: createWeekDate(2025, 0, 6), weekId: 'week_1' },
      { createdAt: createWeekDate(2025, 0, 13), weekId: 'week_2' },
    ];

    const result = determineInitialWeekSelection({
      currentDate: createWeekDate(2025, 0, 15), // Wednesday of week 2
      currentDayOfWeek: 3,
      programs,
      isCustomProgram: false,
      isGenerating: false,
    });

    // Should select current week (week 2)
    expect(result.weekToSelect).toBe(2);
    expect(result.dayToSelect).toBe(3); // Wednesday
  });

  it('scenario: follow-up generation in progress', () => {
    const programs: WeekProgramInfo[] = [
      { createdAt: createWeekDate(2025, 0, 6), weekId: 'week_1' },
      { createdAt: createWeekDate(2025, 0, 13), weekId: 'week_2' }, // Generating
    ];

    const result = determineInitialWeekSelection({
      currentDate: createWeekDate(2025, 0, 15),
      currentDayOfWeek: 3,
      programs,
      isCustomProgram: false,
      isGenerating: true,
    });

    // Should select the generating week
    expect(result.weekToSelect).toBe(2);
    expect(result.dayToSelect).toBe(1); // Monday during generation
    
    // Placeholder should NOT be shown during generation
    expect(shouldShowPlaceholderWeek({
      programsCount: 2,
      isCustomProgram: false,
      isGenerating: true,
    })).toBe(false);
  });
});
