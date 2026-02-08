import { ProgramType } from '../../../../shared/types';

// Mock Firebase Admin
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockUpdate = jest.fn();
const mockDocRef = {
  get: mockGet,
  set: mockSet,
  update: mockUpdate,
};
const mockDoc = jest.fn().mockReturnValue(mockDocRef);
const mockCollection = jest.fn().mockReturnValue({ doc: mockDoc });

jest.mock('../../firebase/admin', () => ({
  adminDb: {
    collection: (...args: any[]) => mockCollection(...args),
  },
}));

// Import after mocking
import {
  canGenerateProgramAdmin,
  recordProgramGenerationAdmin,
  getNextAllowedGenerationDateAdmin,
  getCurrentWeekStartISO,
  WeeklyLimitReachedError,
} from '../programGenerationLimitsAdmin';

describe('programGenerationLimitsAdmin', () => {
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
      
      expect(result).toBe('2024-12-23T00:00:00.000Z');
    });
  });

  describe('canGenerateProgramAdmin', () => {
    it('returns true for new user (no document)', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      const result = await canGenerateProgramAdmin('user123', ProgramType.Exercise);

      expect(result).toBe(true);
      expect(mockCollection).toHaveBeenCalledWith('users');
      expect(mockDoc).toHaveBeenCalledWith('user123');
    });

    it('returns true when no weeklyProgramGenerations field', async () => {
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({
          // No weeklyProgramGenerations
        }),
      });

      const result = await canGenerateProgramAdmin('user123', ProgramType.Exercise);

      expect(result).toBe(true);
    });

    it('returns false when program type was generated this week', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const currentWeekStart = '2024-12-23T00:00:00.000Z';
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: currentWeekStart,
          },
        }),
      });

      const result = await canGenerateProgramAdmin('user123', ProgramType.Exercise);

      expect(result).toBe(false);
    });

    it('returns true when program was generated last week', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const lastWeekStart = '2024-12-16T00:00:00.000Z';
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: lastWeekStart,
          },
        }),
      });

      const result = await canGenerateProgramAdmin('user123', ProgramType.Exercise);

      expect(result).toBe(true);
    });

    it('returns false without userId', async () => {
      const result = await canGenerateProgramAdmin('', ProgramType.Exercise);

      expect(result).toBe(false);
    });

    it('returns true on Firebase error (fail-open)', async () => {
      mockGet.mockRejectedValue(new Error('Firebase error'));

      const result = await canGenerateProgramAdmin('user123', ProgramType.Exercise);

      expect(result).toBe(true);
    });
  });

  describe('recordProgramGenerationAdmin', () => {
    it('creates user document if it does not exist', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      
      mockGet.mockResolvedValue({
        exists: false,
      });

      await recordProgramGenerationAdmin('user123', ProgramType.Exercise);

      expect(mockSet).toHaveBeenCalledWith({
        weeklyProgramGenerations: {
          [ProgramType.Exercise]: '2024-12-23T00:00:00.000Z',
        },
      });
    });

    it('updates existing user document', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({}),
      });

      await recordProgramGenerationAdmin('user123', ProgramType.Recovery);

      expect(mockUpdate).toHaveBeenCalledWith({
        [`weeklyProgramGenerations.${ProgramType.Recovery}`]: '2024-12-23T00:00:00.000Z',
      });
    });

    it('does not throw on Firebase error', async () => {
      mockGet.mockRejectedValue(new Error('Firebase error'));

      await expect(
        recordProgramGenerationAdmin('user123', ProgramType.Exercise)
      ).resolves.toBeUndefined();
    });

    it('skips without userId', async () => {
      await recordProgramGenerationAdmin('', ProgramType.Exercise);

      expect(mockCollection).not.toHaveBeenCalled();
    });
  });

  describe('getNextAllowedGenerationDateAdmin', () => {
    it('returns null when generation is allowed', async () => {
      mockGet.mockResolvedValue({
        exists: false,
      });

      const result = await getNextAllowedGenerationDateAdmin('user123', ProgramType.Exercise);

      expect(result).toBeNull();
    });

    it('returns Sunday of current week when limit is reached', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const currentWeekStart = '2024-12-23T00:00:00.000Z';
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: currentWeekStart,
          },
        }),
      });

      const result = await getNextAllowedGenerationDateAdmin('user123', ProgramType.Exercise);

      expect(result).not.toBeNull();
      // Sunday of current week is Dec 29, 2024 at 00:00
      expect(result!.getDate()).toBe(29);
      expect(result!.getMonth()).toBe(11);
      expect(result!.getFullYear()).toBe(2024);
      expect(result!.getHours()).toBe(0);
    });
  });

  describe('WeeklyLimitReachedError', () => {
    it('has correct properties', () => {
      const nextDate = new Date('2024-12-30T00:00:00Z');
      const error = new WeeklyLimitReachedError(ProgramType.Exercise, nextDate);

      expect(error.name).toBe('WeeklyLimitReachedError');
      expect(error.programType).toBe(ProgramType.Exercise);
      expect(error.nextAllowedDate).toEqual(nextDate);
    });
  });

  describe('Integration-like scenarios', () => {
    it('allows generating different program types in same week', async () => {
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      const currentWeekStart = '2024-12-23T00:00:00.000Z';
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: currentWeekStart,
          },
        }),
      });

      const canExercise = await canGenerateProgramAdmin('user123', ProgramType.Exercise);
      const canRecovery = await canGenerateProgramAdmin('user123', ProgramType.Recovery);

      expect(canExercise).toBe(false);
      expect(canRecovery).toBe(true);
    });

    it('resets all types on new week', async () => {
      // Previous week's data
      const lastWeekStart = '2024-12-16T00:00:00.000Z';
      
      // Now it's a new week
      jest.setSystemTime(new Date('2024-12-25T14:30:00Z'));
      
      mockGet.mockResolvedValue({
        exists: true,
        data: () => ({
          weeklyProgramGenerations: {
            [ProgramType.Exercise]: lastWeekStart,
            [ProgramType.Recovery]: lastWeekStart,
            [ProgramType.ExerciseAndRecovery]: lastWeekStart,
          },
        }),
      });

      const canExercise = await canGenerateProgramAdmin('user123', ProgramType.Exercise);
      const canRecovery = await canGenerateProgramAdmin('user123', ProgramType.Recovery);
      const canBoth = await canGenerateProgramAdmin('user123', ProgramType.ExerciseAndRecovery);

      expect(canExercise).toBe(true);
      expect(canRecovery).toBe(true);
      expect(canBoth).toBe(true);
    });
  });
});



