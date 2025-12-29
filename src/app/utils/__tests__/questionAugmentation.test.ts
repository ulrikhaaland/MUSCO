import { detectProgramType, augmentQuestion, augmentQuestions, isProgramButton } from '../questionAugmentation';
import { ProgramType } from '../../../../shared/types';

describe('questionAugmentation', () => {
  describe('detectProgramType', () => {
    describe('Recovery programs', () => {
      it('detects "recovery only"', () => {
        const result = detectProgramType('Recovery only');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Recovery);
      });

      it('detects "recovery plan"', () => {
        const result = detectProgramType('I want a recovery plan');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Recovery);
      });

      it('detects "recovery program"', () => {
        const result = detectProgramType('I want a recovery program for my shoulder');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Recovery);
      });

      it('detects "rehab"', () => {
        const result = detectProgramType('I need a rehab plan');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Recovery);
      });

      it('detects Norwegian "kun rehabilitering"', () => {
        const result = detectProgramType('Kun rehabilitering');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Recovery);
      });

      it('detects Norwegian "bare rehabilitering"', () => {
        const result = detectProgramType('Bare rehabilitering');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Recovery);
      });
    });

    describe('Exercise + Recovery programs', () => {
      it('detects "exercise + recovery"', () => {
        const result = detectProgramType('Exercise + recovery');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.ExerciseAndRecovery);
      });

      it('detects "both"', () => {
        const result = detectProgramType('I want both');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.ExerciseAndRecovery);
      });

      it('detects "exercise and recovery" together', () => {
        const result = detectProgramType('I want exercise and recovery');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.ExerciseAndRecovery);
      });

      it('detects Norwegian "trening + rehabilitering"', () => {
        const result = detectProgramType('Trening + rehabilitering');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.ExerciseAndRecovery);
      });
    });

    describe('Exercise programs', () => {
      it('detects "program"', () => {
        const result = detectProgramType('I want a shoulder program');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Exercise);
      });

      it('detects "plan"', () => {
        const result = detectProgramType('I want a 4-week plan');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Exercise);
      });

      it('detects "workout"', () => {
        const result = detectProgramType('Build me a workout');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Exercise);
      });

      it('detects "training plan"', () => {
        const result = detectProgramType('I need a training plan');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Exercise);
      });

      it('detects "4-week core program"', () => {
        const result = detectProgramType('I want the 4-week core program');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Exercise);
      });
    });

    describe('Non-program questions', () => {
      it('does not detect "Show me exercises"', () => {
        const result = detectProgramType('Show me exercises');
        expect(result.isProgram).toBe(false);
      });

      it('does not detect "Explain anatomy"', () => {
        const result = detectProgramType('Explain shoulder anatomy');
        expect(result.isProgram).toBe(false);
      });

      it('does not detect "Find Pain"', () => {
        const result = detectProgramType('Find Pain');
        expect(result.isProgram).toBe(false);
      });

      it('is case-insensitive', () => {
        const result = detectProgramType('I WANT A PROGRAM');
        expect(result.isProgram).toBe(true);
        expect(result.programType).toBe(ProgramType.Exercise);
      });
    });

    describe('Priority order', () => {
      it('prioritizes recovery over exercise when both mentioned', () => {
        const result = detectProgramType('I want a recovery program');
        expect(result.programType).toBe(ProgramType.Recovery);
      });

      it('prioritizes exercise+recovery over exercise-only', () => {
        const result = detectProgramType('I want both exercise and recovery program');
        expect(result.programType).toBe(ProgramType.ExerciseAndRecovery);
      });
    });
  });

  describe('augmentQuestion', () => {
    it('augments exercise program button', () => {
      const question = { question: 'I want a shoulder program', chatMode: 'explore' as const };
      const result = augmentQuestion(question);
      
      expect(result.generate).toBe(true);
      expect(result.programType).toBe(ProgramType.Exercise);
      expect(result.question).toBe('I want a shoulder program');
      expect(result.chatMode).toBe('explore');
    });

    it('augments recovery program button', () => {
      const question = { question: 'I want a recovery plan', chatMode: 'explore' as const };
      const result = augmentQuestion(question);
      
      expect(result.generate).toBe(true);
      expect(result.programType).toBe(ProgramType.Recovery);
    });

    it('does not augment non-program questions', () => {
      const question = { question: 'Show me exercises', chatMode: 'explore' as const };
      const result = augmentQuestion(question);
      
      expect(result.generate).toBeUndefined();
      expect(result.programType).toBeUndefined();
    });

    it('does not re-augment if already has generate field', () => {
      const question = { 
        question: 'I want a program', 
        chatMode: 'explore' as const,
        generate: false, // Explicitly set to false
        programType: ProgramType.Recovery
      };
      const result = augmentQuestion(question);
      
      // Should not override existing fields
      expect(result.generate).toBe(false);
      expect(result.programType).toBe(ProgramType.Recovery);
    });

    it('creates new object (does not mutate)', () => {
      const question = { question: 'I want a program', chatMode: 'explore' as const };
      const result = augmentQuestion(question);
      
      expect(result).not.toBe(question); // Different object reference
      expect((question as Record<string, unknown>).generate).toBeUndefined(); // Original unchanged
    });
  });

  describe('augmentQuestions', () => {
    it('augments array of mixed questions', () => {
      const questions = [
        { question: 'I want a program', chatMode: 'explore' as const },
        { question: 'Show me exercises', chatMode: 'explore' as const },
        { question: 'I want a recovery plan', chatMode: 'explore' as const },
      ];
      
      const result = augmentQuestions(questions);
      
      expect(result[0].generate).toBe(true);
      expect(result[0].programType).toBe(ProgramType.Exercise);
      
      expect(result[1].generate).toBeUndefined();
      
      expect(result[2].generate).toBe(true);
      expect(result[2].programType).toBe(ProgramType.Recovery);
    });

    it('returns new array', () => {
      const questions = [{ question: 'I want a program', chatMode: 'explore' as const }];
      const result = augmentQuestions(questions);
      
      expect(result).not.toBe(questions); // Different array reference
    });
  });

  describe('isProgramButton', () => {
    it('returns true for question with generate:true', () => {
      const question = { 
        question: 'I want a program', 
        chatMode: 'explore' as const,
        generate: true,
        programType: ProgramType.Exercise
      };
      
      expect(isProgramButton(question)).toBe(true);
    });

    it('returns true for question matching program pattern', () => {
      const question = { question: 'I want a program', chatMode: 'explore' as const };
      expect(isProgramButton(question)).toBe(true);
    });

    it('returns false for non-program question', () => {
      const question = { question: 'Show me exercises', chatMode: 'explore' as const };
      expect(isProgramButton(question)).toBe(false);
    });

    it('returns true for recovery variations', () => {
      expect(isProgramButton({ question: 'I want a recovery plan', chatMode: 'explore' as const })).toBe(true);
      expect(isProgramButton({ question: 'I need rehab', chatMode: 'explore' as const })).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('handles empty string', () => {
      const result = detectProgramType('');
      expect(result.isProgram).toBe(false);
    });

    it('handles whitespace', () => {
      const result = detectProgramType('   ');
      expect(result.isProgram).toBe(false);
    });

    it('trims input', () => {
      const result = detectProgramType('  I want a program  ');
      expect(result.isProgram).toBe(true);
    });

    it('handles special characters', () => {
      const result = detectProgramType('I want a 4-week program!');
      expect(result.isProgram).toBe(true);
    });
  });
});

