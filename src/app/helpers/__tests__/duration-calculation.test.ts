import { describe, it, expect } from '@jest/globals';
import { calculateExerciseDuration, calculateDayDuration } from '../duration-calculation';

describe('Duration Calculation Tests', () => {
  describe('calculateExerciseDuration', () => {
    describe('Timed exercises (warmups, cardio)', () => {
      it('should return duration for warmup exercises', () => {
        const warmupExercise = {
          exerciseId: 'warmup-6',
          duration: 300,
          warmup: true
        };
        
        expect(calculateExerciseDuration(warmupExercise)).toBe(300);
      });

      it('should return duration for cardio exercises', () => {
        const cardioExercise = {
          exerciseId: 'warmup-3',
          duration: 180,
          warmup: true
        };
        
        expect(calculateExerciseDuration(cardioExercise)).toBe(180);
      });
    });

    describe('Sets and repetitions exercises', () => {
      it('should calculate duration for 3 sets × 10 reps with 60s rest', () => {
        const exercise = {
          exerciseId: 'abs-20',
          sets: 3,
          repetitions: 10,
          restBetweenSets: 60
        };
        
        // Expected calculation:
        // Exercise time: 3 sets × (10 reps × 5 seconds) = 150 seconds
        // Rest time: (3-1) × 60 = 120 seconds
        // Total: 150 + 120 = 270 seconds
        expect(calculateExerciseDuration(exercise)).toBe(270);
      });

      it('should calculate duration for 2 sets × 15 reps with 45s rest', () => {
        const exercise = {
          exerciseId: 'glutes-44',
          sets: 2,
          repetitions: 15,
          restBetweenSets: 45
        };
        
        // Expected calculation:
        // Exercise time: 2 sets × (15 reps × 5 seconds) = 150 seconds
        // Rest time: (2-1) × 45 = 45 seconds
        // Total: 150 + 45 = 195 seconds
        expect(calculateExerciseDuration(exercise)).toBe(195);
      });

      it('should calculate duration for 1 set × 8 reps with no rest', () => {
        const exercise = {
          exerciseId: 'abs-46',
          sets: 1,
          repetitions: 8,
          restBetweenSets: 60
        };
        
        // Expected calculation:
        // Exercise time: 1 set × (8 reps × 5 seconds) = 40 seconds
        // Rest time: (1-1) × 60 = 0 seconds
        // Total: 40 + 0 = 40 seconds
        expect(calculateExerciseDuration(exercise)).toBe(40);
      });

      it('should handle exercises without restBetweenSets', () => {
        const exercise = {
          exerciseId: 'test-exercise',
          sets: 2,
          repetitions: 12
        };
        
        // Expected calculation:
        // Exercise time: 2 sets × (12 reps × 5 seconds) = 120 seconds
        // Rest time: 0 (no restBetweenSets)
        // Total: 120 + 0 = 120 seconds
        expect(calculateExerciseDuration(exercise)).toBe(120);
      });
    });

    describe('Isometric holds (sets and duration)', () => {
      it('should calculate duration for isometric holds', () => {
        const exercise = {
          exerciseId: 'abs-6',
          sets: 3,
          duration: 30,
          restBetweenSets: 60
        };
        
        // Expected calculation:
        // Hold time: 3 sets × 30 seconds = 90 seconds
        // Rest time: (3-1) × 60 = 120 seconds
        // Total: 90 + 120 = 210 seconds
        expect(calculateExerciseDuration(exercise)).toBe(210);
      });

      it('should calculate duration for single isometric hold', () => {
        const exercise = {
          exerciseId: 'quads-193',
          sets: 1,
          duration: 40,
          restBetweenSets: 60
        };
        
        // Expected calculation:
        // Hold time: 1 set × 40 seconds = 40 seconds
        // Rest time: (1-1) × 60 = 0 seconds
        // Total: 40 + 0 = 40 seconds
        expect(calculateExerciseDuration(exercise)).toBe(40);
      });
    });

    describe('Edge cases', () => {
      it('should return 60 for empty exercise (default fallback)', () => {
        expect(calculateExerciseDuration({})).toBe(60);
      });

      it('should return 60 for exercise with only exerciseId (default fallback)', () => {
        const exercise = { exerciseId: 'test' };
        expect(calculateExerciseDuration(exercise)).toBe(60);
      });
    });
  });

  describe('calculateDayDuration', () => {
    it('should calculate total duration for a day with multiple exercises', () => {
      const exercises = [
        {
          exerciseId: 'warmup-6',
          duration: 300,
          warmup: true
        },
        {
          exerciseId: 'abs-20',
          sets: 3,
          repetitions: 10,
          restBetweenSets: 60
        },
        {
          exerciseId: 'glutes-7',
          sets: 2,
          repetitions: 12,
          restBetweenSets: 60
        }
      ];
      
      // Expected calculation:
      // Warmup: 300 seconds
      // Abs: 270 seconds (3×10×5 + 2×60)
      // Glutes: 180 seconds (2×12×5 + 1×60)
      // Total: 300 + 270 + 180 = 750 seconds = 12.5 minutes → 13 minutes
      expect(calculateDayDuration(exercises)).toBe(13);
    });

    it('should handle empty exercise array', () => {
      expect(calculateDayDuration([])).toBe(0);
    });

    it('should handle null/undefined exercises', () => {
      expect(calculateDayDuration(null as any)).toBe(0);
      expect(calculateDayDuration(undefined as any)).toBe(0);
    });

    it('should round up to nearest minute', () => {
      const exercises = [
        {
          exerciseId: 'test',
          sets: 1,
          repetitions: 10,
          restBetweenSets: 0
        }
      ];
      
      // 1 set × 10 reps × 5 seconds = 50 seconds = 0.83 minutes → 1 minute
      expect(calculateDayDuration(exercises)).toBe(1);
    });

    it('should handle mixed exercise types', () => {
      const exercises = [
        {
          exerciseId: 'warmup-6',
          duration: 180,
          warmup: true
        },
        {
          exerciseId: 'forearms-1',
          sets: 5,
          duration: 45,
          restBetweenSets: 60
        }
      ];
      
      // Expected calculation:
      // Warmup: 180 seconds
      // Forearms: 5×45 + 4×60 = 225 + 240 = 465 seconds
      // Total: 180 + 465 = 645 seconds = 10.75 minutes → 11 minutes
      expect(calculateDayDuration(exercises)).toBe(11);
    });
  });

  describe('Real-world examples from recovery programs', () => {
    it('should calculate Low Back Week 1 Day 1 duration', () => {
      const exercises = [
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 }
      ];
      
      // Expected calculation:
      // Abs-20: 3×8×5 + 2×60 = 120 + 120 = 240 seconds
      // Abs-6: 3×30 + 2×60 = 90 + 120 = 210 seconds
      // Glutes-7: 2×12×5 + 1×60 = 120 + 60 = 180 seconds
      // Abs-46: 2×10×5 + 1×60 = 100 + 60 = 160 seconds
      // Total: 240 + 210 + 180 + 160 = 790 seconds = 13.17 minutes → 14 minutes
      expect(calculateDayDuration(exercises)).toBe(14);
    });

    it('should calculate Runner\'s Knee Week 1 Day 1 duration', () => {
      const exercises = [
        { exerciseId: 'warmup-6', duration: 300, warmup: true },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'quads-193', sets: 3, duration: 30, restBetweenSets: 60 },
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 }
      ];
      
      // Expected calculation:
      // Warmup: 300 seconds
      // Glutes-44: 3×15×5 + 2×60 = 225 + 120 = 345 seconds
      // Glutes-45: 3×10×5 + 2×60 = 150 + 120 = 270 seconds
      // Quads-193: 3×30 + 2×60 = 90 + 120 = 210 seconds
      // Quads-190: 3×12×5 + 2×60 = 180 + 120 = 300 seconds
      // Total: 300 + 345 + 270 + 210 + 300 = 1425 seconds = 23.75 minutes → 24 minutes
      expect(calculateDayDuration(exercises)).toBe(24);
    });

    it('should calculate Shoulder Week 1 Day 1 duration', () => {
      const exercises = [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 }
      ];
      
      // Expected calculation:
      // Warmup-8: 2×20×5 + 1×30 = 200 + 30 = 230 seconds
      // Shoulders-30: 2×15×5 + 1×45 = 150 + 45 = 195 seconds
      // Shoulders-94: 3×12×5 + 2×60 = 180 + 120 = 300 seconds
      // Shoulders-179: 3×12×5 + 2×60 = 180 + 120 = 300 seconds
      // Shoulders-78: 3×15×5 + 2×60 = 225 + 120 = 345 seconds
      // Total: 230 + 195 + 300 + 300 + 345 = 1370 seconds = 22.83 minutes → 23 minutes
      expect(calculateDayDuration(exercises)).toBe(23);
    });
  });
}); 