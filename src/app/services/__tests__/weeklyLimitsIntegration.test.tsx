/**
 * Integration tests for Weekly Generation Limits
 * 
 * Tests the service functions and their interactions to ensure
 * the weekly limit logic works correctly across different scenarios.
 */

import { ProgramType } from '../../../../shared/types';

// ============================================================================
// Mocks Setup
// ============================================================================

// Mock Firebase
const mockGetDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  setDoc: jest.fn(),
  updateDoc: jest.fn(),
}));

jest.mock('../../firebase/config', () => ({
  db: {},
}));

// Import after mocks
import {
  canGenerateProgram,
  getAvailableProgramTypes,
  getNextAllowedGenerationDate,
  getCurrentWeekStartISO,
  WeeklyLimitReachedError,
} from '../programGenerationLimits';

// ============================================================================
// Helper Functions
// ============================================================================

function setupMockForWeeklyLimits(
  generatedTypes: ProgramType[] = [],
  weekStart: string = '2024-12-23T00:00:00.000Z'
) {
  const weeklyProgramGenerations: Record<string, string> = {};
  generatedTypes.forEach((type) => {
    weeklyProgramGenerations[type] = weekStart;
  });

  mockDoc.mockReturnValue('userRef');
  mockGetDoc.mockResolvedValue({
    exists: () => generatedTypes.length > 0,
    data: () => ({
      weeklyProgramGenerations,
    }),
  });
}

function setupMockForNoLimits() {
  mockDoc.mockReturnValue('userRef');
  mockGetDoc.mockResolvedValue({
    exists: () => false,
  });
}

// ============================================================================
// Tests
// ============================================================================

describe('Weekly Limits Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    // Set to Wednesday Dec 25, 2024
    jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCurrentWeekStartISO', () => {
    it('returns Monday for mid-week dates', () => {
      // Wednesday Dec 25, 2024
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      expect(getCurrentWeekStartISO()).toBe('2024-12-23T00:00:00.000Z');
    });

    it('returns same Monday for Monday dates', () => {
      // Monday Dec 23, 2024
      jest.setSystemTime(new Date('2024-12-23T08:00:00Z'));
      expect(getCurrentWeekStartISO()).toBe('2024-12-23T00:00:00.000Z');
    });

    it('returns previous Monday for Sunday dates', () => {
      // Sunday Dec 29, 2024
      jest.setSystemTime(new Date('2024-12-29T20:00:00Z'));
      expect(getCurrentWeekStartISO()).toBe('2024-12-23T00:00:00.000Z');
    });

    it('handles year transitions correctly', () => {
      // Wednesday Jan 1, 2025
      jest.setSystemTime(new Date('2025-01-01T12:00:00Z'));
      // Monday Dec 30, 2024
      expect(getCurrentWeekStartISO()).toBe('2024-12-30T00:00:00.000Z');
    });
  });

  describe('canGenerateProgram - Core Logic', () => {
    it('allows all types for new user', async () => {
      setupMockForNoLimits();

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      const canRecovery = await canGenerateProgram('user123', ProgramType.Recovery);
      const canBoth = await canGenerateProgram('user123', ProgramType.ExerciseAndRecovery);

      expect(canExercise).toBe(true);
      expect(canRecovery).toBe(true);
      expect(canBoth).toBe(true);
    });

    it('blocks only the type that was generated this week', async () => {
      setupMockForWeeklyLimits([ProgramType.Exercise]);

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      const canRecovery = await canGenerateProgram('user123', ProgramType.Recovery);
      const canBoth = await canGenerateProgram('user123', ProgramType.ExerciseAndRecovery);

      expect(canExercise).toBe(false);
      expect(canRecovery).toBe(true);
      expect(canBoth).toBe(true);
    });

    it('blocks multiple types when multiple generated this week', async () => {
      setupMockForWeeklyLimits([ProgramType.Exercise, ProgramType.Recovery]);

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      const canRecovery = await canGenerateProgram('user123', ProgramType.Recovery);
      const canBoth = await canGenerateProgram('user123', ProgramType.ExerciseAndRecovery);

      expect(canExercise).toBe(false);
      expect(canRecovery).toBe(false);
      expect(canBoth).toBe(true);
    });

    it('blocks all types when all generated this week', async () => {
      setupMockForWeeklyLimits([
        ProgramType.Exercise,
        ProgramType.Recovery,
        ProgramType.ExerciseAndRecovery,
      ]);

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      const canRecovery = await canGenerateProgram('user123', ProgramType.Recovery);
      const canBoth = await canGenerateProgram('user123', ProgramType.ExerciseAndRecovery);

      expect(canExercise).toBe(false);
      expect(canRecovery).toBe(false);
      expect(canBoth).toBe(false);
    });
  });

  describe('getAvailableProgramTypes', () => {
    it('returns all 3 types for new user', async () => {
      setupMockForNoLimits();

      const available = await getAvailableProgramTypes('user123');

      expect(available).toHaveLength(3);
      expect(available).toContain(ProgramType.Exercise);
      expect(available).toContain(ProgramType.Recovery);
      expect(available).toContain(ProgramType.ExerciseAndRecovery);
    });

    it('returns 2 types when 1 is locked', async () => {
      setupMockForWeeklyLimits([ProgramType.Exercise]);

      const available = await getAvailableProgramTypes('user123');

      expect(available).toHaveLength(2);
      expect(available).not.toContain(ProgramType.Exercise);
      expect(available).toContain(ProgramType.Recovery);
      expect(available).toContain(ProgramType.ExerciseAndRecovery);
    });

    it('returns 1 type when 2 are locked', async () => {
      setupMockForWeeklyLimits([ProgramType.Exercise, ProgramType.Recovery]);

      const available = await getAvailableProgramTypes('user123');

      expect(available).toHaveLength(1);
      expect(available).toContain(ProgramType.ExerciseAndRecovery);
    });

    it('returns empty array when all types are locked', async () => {
      setupMockForWeeklyLimits([
        ProgramType.Exercise,
        ProgramType.Recovery,
        ProgramType.ExerciseAndRecovery,
      ]);

      const available = await getAvailableProgramTypes('user123');

      expect(available).toHaveLength(0);
    });
  });

  describe('getNextAllowedGenerationDate', () => {
    it('returns null when generation is allowed', async () => {
      setupMockForNoLimits();

      const nextDate = await getNextAllowedGenerationDate('user123', ProgramType.Exercise);

      expect(nextDate).toBeNull();
    });

    it('returns next Monday when limit is reached', async () => {
      // Current: Wednesday Dec 25, 2024
      setupMockForWeeklyLimits([ProgramType.Exercise]);

      const nextDate = await getNextAllowedGenerationDate('user123', ProgramType.Exercise);

      expect(nextDate).not.toBeNull();
      // Next Monday is Dec 30, 2024
      expect(nextDate!.getFullYear()).toBe(2024);
      expect(nextDate!.getMonth()).toBe(11); // December
      expect(nextDate!.getDate()).toBe(30);
    });

    it('returns correct Monday across year boundary', async () => {
      // Current: Wednesday Jan 1, 2025
      jest.setSystemTime(new Date('2025-01-01T12:00:00Z'));
      // Week started Dec 30, 2024
      setupMockForWeeklyLimits([ProgramType.Exercise], '2024-12-30T00:00:00.000Z');

      const nextDate = await getNextAllowedGenerationDate('user123', ProgramType.Exercise);

      expect(nextDate).not.toBeNull();
      // Next Monday is Jan 6, 2025
      expect(nextDate!.getFullYear()).toBe(2025);
      expect(nextDate!.getMonth()).toBe(0); // January
      expect(nextDate!.getDate()).toBe(6);
    });
  });

  describe('Week Reset Behavior', () => {
    it('allows generation on new week even if generated last week', async () => {
      // Current: Wednesday Dec 25, 2024 (week of Dec 23)
      // Generated: Week of Dec 16
      const lastWeekStart = '2024-12-16T00:00:00.000Z';
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: lastWeekStart,
            [ProgramType.Recovery]: lastWeekStart,
            [ProgramType.ExerciseAndRecovery]: lastWeekStart,
          },
        }),
      });

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      const canRecovery = await canGenerateProgram('user123', ProgramType.Recovery);
      const canBoth = await canGenerateProgram('user123', ProgramType.ExerciseAndRecovery);

      expect(canExercise).toBe(true);
      expect(canRecovery).toBe(true);
      expect(canBoth).toBe(true);
    });

    it('transitions correctly at week boundary - Sunday afternoon', async () => {
      // Sunday Dec 29, 2024 at 14:00 UTC - still week of Dec 23
      jest.setSystemTime(new Date('2024-12-29T14:00:00Z'));
      
      // Verify we're in the right week
      expect(getCurrentWeekStartISO()).toBe('2024-12-23T00:00:00.000Z');
      
      // Generated this week (Dec 23)
      setupMockForWeeklyLimits([ProgramType.Exercise], '2024-12-23T00:00:00.000Z');

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      expect(canExercise).toBe(false);
    });

    it('transitions correctly at week boundary - Monday morning', async () => {
      // Monday Dec 30, 2024 at 00:00 UTC - new week
      jest.setSystemTime(new Date('2024-12-30T00:00:00Z'));
      
      // Generated last week (Dec 23)
      setupMockForWeeklyLimits([ProgramType.Exercise], '2024-12-23T00:00:00.000Z');

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      expect(canExercise).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('fails open when Firebase errors (allows generation)', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockRejectedValue(new Error('Firebase error'));

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);

      expect(canExercise).toBe(true);
    });

    it('returns false when userId is empty', async () => {
      const canExercise = await canGenerateProgram('', ProgramType.Exercise);

      expect(canExercise).toBe(false);
    });

    it('returns empty array for getAvailableProgramTypes when userId is empty', async () => {
      // Note: This actually returns all types because each canGenerateProgram returns false
      // but the implementation filters for true results
      const available = await getAvailableProgramTypes('');

      // Empty userId returns false, so no types are available
      expect(available).toHaveLength(0);
    });
  });

  describe('WeeklyLimitReachedError', () => {
    it('contains correct program type', () => {
      const error = new WeeklyLimitReachedError(
        ProgramType.Exercise,
        new Date('2024-12-30T00:00:00Z')
      );

      expect(error.programType).toBe(ProgramType.Exercise);
    });

    it('contains correct next allowed date', () => {
      const nextDate = new Date('2024-12-30T00:00:00Z');
      const error = new WeeklyLimitReachedError(ProgramType.Recovery, nextDate);

      expect(error.nextAllowedDate).toEqual(nextDate);
    });

    it('has descriptive message', () => {
      const error = new WeeklyLimitReachedError(
        ProgramType.ExerciseAndRecovery,
        new Date()
      );

      expect(error.message).toContain('exercise_and_recovery');
      expect(error.message.toLowerCase()).toContain('limit');
    });

    it('is instance of Error', () => {
      const error = new WeeklyLimitReachedError(ProgramType.Exercise, new Date());

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Full User Flow Simulation', () => {
    it('tracks generation across a full week', async () => {
      // Day 1 (Monday): Fresh start, all types available
      jest.setSystemTime(new Date('2024-12-23T10:00:00Z'));
      setupMockForNoLimits();
      
      let available = await getAvailableProgramTypes('user123');
      expect(available).toHaveLength(3);

      // Day 1: User generates Exercise
      setupMockForWeeklyLimits([ProgramType.Exercise], '2024-12-23T00:00:00.000Z');
      
      available = await getAvailableProgramTypes('user123');
      expect(available).toHaveLength(2);
      expect(available).not.toContain(ProgramType.Exercise);

      // Day 3 (Wednesday): User generates Recovery
      jest.setSystemTime(new Date('2024-12-25T14:00:00Z'));
      setupMockForWeeklyLimits(
        [ProgramType.Exercise, ProgramType.Recovery],
        '2024-12-23T00:00:00.000Z'
      );
      
      available = await getAvailableProgramTypes('user123');
      expect(available).toHaveLength(1);
      expect(available).toContain(ProgramType.ExerciseAndRecovery);

      // Day 5 (Friday): User generates ExerciseAndRecovery - all locked
      jest.setSystemTime(new Date('2024-12-27T16:00:00Z'));
      setupMockForWeeklyLimits(
        [ProgramType.Exercise, ProgramType.Recovery, ProgramType.ExerciseAndRecovery],
        '2024-12-23T00:00:00.000Z'
      );
      
      available = await getAvailableProgramTypes('user123');
      expect(available).toHaveLength(0);

      // Verify next allowed date is Monday Dec 30
      const nextDate = await getNextAllowedGenerationDate('user123', ProgramType.Exercise);
      expect(nextDate?.getDate()).toBe(30);

      // Day 8 (Next Monday): All types available again
      jest.setSystemTime(new Date('2024-12-30T09:00:00Z'));
      // Data still shows last week's generations but they're now outdated
      
      available = await getAvailableProgramTypes('user123');
      expect(available).toHaveLength(3);
    });

    it('handles multiple users independently', async () => {
      // User A has generated Exercise this week
      const userAData = {
        weeklyProgramGenerations: {
          [ProgramType.Exercise]: '2024-12-23T00:00:00.000Z',
        },
      };

      // User B has generated Recovery this week
      const userBData = {
        weeklyProgramGenerations: {
          [ProgramType.Recovery]: '2024-12-23T00:00:00.000Z',
        },
      };

      // Test User A
      mockDoc.mockReturnValue('userRefA');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => userAData,
      });

      const userAAvailable = await getAvailableProgramTypes('userA');
      expect(userAAvailable).not.toContain(ProgramType.Exercise);
      expect(userAAvailable).toContain(ProgramType.Recovery);

      // Test User B
      mockDoc.mockReturnValue('userRefB');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => userBData,
      });

      const userBAvailable = await getAvailableProgramTypes('userB');
      expect(userBAvailable).toContain(ProgramType.Exercise);
      expect(userBAvailable).not.toContain(ProgramType.Recovery);
    });
  });

  describe('Edge Cases', () => {
    it('handles user with empty weeklyProgramGenerations object', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {},
        }),
      });

      const available = await getAvailableProgramTypes('user123');
      expect(available).toHaveLength(3);
    });

    it('handles user with null weeklyProgramGenerations', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: null,
        }),
      });

      const available = await getAvailableProgramTypes('user123');
      expect(available).toHaveLength(3);
    });

    it('handles malformed date strings gracefully', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: 'invalid-date',
          },
        }),
      });

      // Should not throw, and since the date comparison will fail,
      // it should allow generation
      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      expect(canExercise).toBe(true);
    });
  });
});
