import { ProgramType } from '../../../../shared/types';

// Mock Firebase
const mockGetDoc = jest.fn();
const mockUpdateDoc = jest.fn();
const mockSetDoc = jest.fn();
const mockDoc = jest.fn();

jest.mock('firebase/firestore', () => ({
  doc: (...args: any[]) => mockDoc(...args),
  getDoc: (...args: any[]) => mockGetDoc(...args),
  updateDoc: (...args: any[]) => mockUpdateDoc(...args),
  setDoc: (...args: any[]) => mockSetDoc(...args),
}));

jest.mock('../../firebase/config', () => ({
  db: {},
}));

// Import after mocking
import {
  canGenerateProgram,
  recordProgramGeneration,
  getNextAllowedGenerationDate,
  getAvailableProgramTypes,
  getCurrentWeekStartISO,
  WeeklyLimitReachedError,
} from '../programGenerationLimits';

describe('programGenerationLimits', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('getCurrentWeekStartISO', () => {
    it('returns Monday 00:00:00 UTC for the current week', () => {
      // Wednesday, Dec 25, 2024
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      
      const result = getCurrentWeekStartISO();
      
      // Should be Monday Dec 23, 2024 at 00:00:00 UTC
      expect(result).toBe('2024-12-23T00:00:00.000Z');
    });

    it('handles Sunday correctly (rolls forward to next Monday)', () => {
      // Sunday, Dec 29, 2024
      jest.setSystemTime(new Date('2024-12-29T10:00:00Z'));
      
      const result = getCurrentWeekStartISO();
      
      // Sunday is treated as next generation week → Monday Dec 30, 2024
      expect(result).toBe('2024-12-30T00:00:00.000Z');
    });

    it('handles Monday correctly (stays on Monday)', () => {
      // Monday, Dec 23, 2024
      jest.setSystemTime(new Date('2024-12-23T10:00:00Z'));
      
      const result = getCurrentWeekStartISO();
      
      expect(result).toBe('2024-12-23T00:00:00.000Z');
    });
  });

  describe('canGenerateProgram', () => {
    it('returns true for new user (no document)', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      expect(result).toBe(true);
    });

    it('returns true when user has no weeklyProgramGenerations field', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          // No weeklyProgramGenerations field
        }),
      });

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      expect(result).toBe(true);
    });

    it('returns true when no record for this program type', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            // Only recovery recorded, not exercise
            [ProgramType.Recovery]: '2024-12-23T00:00:00.000Z',
          },
        }),
      });

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      expect(result).toBe(true);
    });

    it('returns false when program type was generated this week', async () => {
      // Wednesday, Dec 25, 2024
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const currentWeekStart = '2024-12-23T00:00:00.000Z'; // Monday
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: currentWeekStart,
          },
        }),
      });

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      expect(result).toBe(false);
    });

    it('returns true when program was generated last week (new week started)', async () => {
      // Wednesday, Dec 25, 2024
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const lastWeekStart = '2024-12-16T00:00:00.000Z'; // Previous Monday
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: lastWeekStart,
          },
        }),
      });

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      expect(result).toBe(true);
    });

    it('returns false without userId', async () => {
      const result = await canGenerateProgram('', ProgramType.Exercise);

      expect(result).toBe(false);
    });

    it('returns true on Firebase error (fail-open)', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockRejectedValue(new Error('Firebase error'));

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      // Should fail open to avoid blocking users
      expect(result).toBe(true);
    });
  });

  describe('recordProgramGeneration', () => {
    it('creates user document if it does not exist', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      await recordProgramGeneration('user123', ProgramType.Exercise);

      expect(mockSetDoc).toHaveBeenCalledWith('userRef', {
        weeklyProgramGenerations: {
          [ProgramType.Exercise]: '2024-12-23T00:00:00.000Z',
        },
      });
    });

    it('updates existing user document', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({}),
      });

      await recordProgramGeneration('user123', ProgramType.Recovery);

      expect(mockUpdateDoc).toHaveBeenCalledWith('userRef', {
        [`weeklyProgramGenerations.${ProgramType.Recovery}`]: '2024-12-23T00:00:00.000Z',
      });
    });

    it('does not throw on Firebase error', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockRejectedValue(new Error('Firebase error'));

      // Should not throw
      await expect(
        recordProgramGeneration('user123', ProgramType.Exercise)
      ).resolves.toBeUndefined();
    });
  });

  describe('getNextAllowedGenerationDate', () => {
    it('returns null when generation is allowed', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await getNextAllowedGenerationDate('user123', ProgramType.Exercise);

      expect(result).toBeNull();
    });

    it('returns Sunday of current week when limit is reached', async () => {
      // Wednesday, Dec 25, 2024
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const currentWeekStart = '2024-12-23T00:00:00.000Z';
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: currentWeekStart,
          },
        }),
      });

      const result = await getNextAllowedGenerationDate('user123', ProgramType.Exercise);

      expect(result).not.toBeNull();
      // Sunday of current week is Dec 29, 2024 at 00:00
      expect(result!.getDate()).toBe(29);
      expect(result!.getMonth()).toBe(11); // December
      expect(result!.getFullYear()).toBe(2024);
      expect(result!.getHours()).toBe(0);
    });
  });

  describe('getAvailableProgramTypes', () => {
    it('returns all types for new user', async () => {
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => false,
      });

      const result = await getAvailableProgramTypes('user123');

      expect(result).toContain(ProgramType.Exercise);
      expect(result).toContain(ProgramType.Recovery);
      expect(result).toContain(ProgramType.ExerciseAndRecovery);
      expect(result).toHaveLength(3);
    });

    it('excludes types that have been generated this week', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const currentWeekStart = '2024-12-23T00:00:00.000Z';
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: currentWeekStart,
            [ProgramType.Recovery]: currentWeekStart,
          },
        }),
      });

      const result = await getAvailableProgramTypes('user123');

      expect(result).not.toContain(ProgramType.Exercise);
      expect(result).not.toContain(ProgramType.Recovery);
      expect(result).toContain(ProgramType.ExerciseAndRecovery);
      expect(result).toHaveLength(1);
    });
  });

  describe('WeeklyLimitReachedError', () => {
    it('has correct properties', () => {
      const nextDate = new Date('2024-12-30T00:00:00Z');
      const error = new WeeklyLimitReachedError(ProgramType.Exercise, nextDate);

      expect(error.name).toBe('WeeklyLimitReachedError');
      expect(error.programType).toBe(ProgramType.Exercise);
      expect(error.nextAllowedDate).toEqual(nextDate);
      expect(error.message).toContain('exercise');
    });

    it('is instanceof Error', () => {
      const error = new WeeklyLimitReachedError(ProgramType.Recovery, new Date());

      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Week boundary tests', () => {
    it('Sunday rolls forward to next Monday for generation week', async () => {
      // Sunday afternoon → generation week is next Monday
      jest.setSystemTime(new Date('2024-12-29T12:00:00Z'));
      const sundayWeekStart = getCurrentWeekStartISO();
      expect(sundayWeekStart).toBe('2024-12-30T00:00:00.000Z');

      // Monday afternoon → stays on that Monday
      jest.setSystemTime(new Date('2024-12-30T12:00:00Z'));
      const mondayWeekStart = getCurrentWeekStartISO();
      expect(mondayWeekStart).toBe('2024-12-30T00:00:00.000Z');
    });

    it('allows generation on new week even if generated on previous week', async () => {
      // Generated on Friday Dec 27
      const generatedWeek = '2024-12-23T00:00:00.000Z'; // Week of Dec 23
      
      // Now it's Monday Dec 30 (new week)
      jest.setSystemTime(new Date('2024-12-30T10:00:00Z'));
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: generatedWeek,
          },
        }),
      });

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      expect(result).toBe(true);
    });

    it('allows generation on Sunday even if generated earlier the same Mon-Sun week', async () => {
      // Generated on Wednesday Dec 25 → stored as week of Dec 23
      const generatedWeek = '2024-12-23T00:00:00.000Z';

      // Now it's Sunday Dec 29 → generation week rolls to Dec 30
      jest.setSystemTime(new Date('2024-12-29T08:00:00Z'));

      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: generatedWeek,
          },
        }),
      });

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      // Should be allowed because Sunday counts as next generation week
      expect(result).toBe(true);
    });

    it('still blocks on Saturday if generated earlier the same week', async () => {
      // Generated on Wednesday Dec 25 → stored as week of Dec 23
      const generatedWeek = '2024-12-23T00:00:00.000Z';

      // Now it's Saturday Dec 28 → still same generation week
      jest.setSystemTime(new Date('2024-12-28T20:00:00Z'));

      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: generatedWeek,
          },
        }),
      });

      const result = await canGenerateProgram('user123', ProgramType.Exercise);

      expect(result).toBe(false);
    });
  });

  describe('Multiple program types', () => {
    it('tracks each program type independently', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const currentWeekStart = '2024-12-23T00:00:00.000Z';
      
      mockDoc.mockReturnValue('userRef');
      mockGetDoc.mockResolvedValue({
        exists: () => true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: currentWeekStart,
            // Recovery not generated yet
          },
        }),
      });

      const canExercise = await canGenerateProgram('user123', ProgramType.Exercise);
      const canRecovery = await canGenerateProgram('user123', ProgramType.Recovery);
      const canBoth = await canGenerateProgram('user123', ProgramType.ExerciseAndRecovery);

      expect(canExercise).toBe(false);
      expect(canRecovery).toBe(true);
      expect(canBoth).toBe(true);
    });
  });
});

