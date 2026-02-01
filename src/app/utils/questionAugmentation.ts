/**
 * Question Augmentation Utility
 * 
 * Detects program generation buttons and augments them with proper fields.
 * Used by both backend (stream-parser) and frontend (fallback detection).
 */

import { Question } from '../types';
import { ProgramType } from '../../../shared/types';

export interface AugmentedQuestion extends Question {
  generate?: boolean;
  programType?: ProgramType;
}

/**
 * Detects if a question text indicates a program generation request
 * and returns the appropriate program type.
 */
export function detectProgramType(questionText: string): {
  isProgram: boolean;
  programType?: ProgramType;
} {
  // Safety check for undefined/null questionText
  if (!questionText) {
    return { isProgram: false };
  }
  const qLower = questionText.toLowerCase().trim();
  
  // Check in priority order: combined > recovery-only > exercise-only
  
  // 1. Detect combined exercise + recovery programs (highest priority)
  const isExerciseAndRecovery = 
    (qLower.includes('exercise') && qLower.includes('recovery')) ||
    (qLower.includes('trening') && qLower.includes('rehabilitering')) ||
    qLower.includes('exercise + recovery') ||
    qLower.includes('both');
  
  if (isExerciseAndRecovery) {
    return { isProgram: true, programType: ProgramType.ExerciseAndRecovery };
  }
  
  // 2. Detect recovery-only programs
  const isRecoveryOnly = 
    qLower.includes('recovery only') || 
    qLower.includes('recovery plan') ||
    qLower.includes('recovery program') ||
    qLower.includes('rehab') ||
    qLower.includes('kun rehabilitering') ||
    qLower.includes('bare rehabilitering');
  
  if (isRecoveryOnly) {
    return { isProgram: true, programType: ProgramType.Recovery };
  }
  
  // 3. Detect exercise-only programs (must mention program/plan/workout)
  const isExerciseOnly = 
    qLower.includes('program') ||
    qLower.includes('plan') ||
    qLower.includes('workout') ||
    qLower.includes('training plan');
  
  if (isExerciseOnly) {
    return { isProgram: true, programType: ProgramType.Exercise };
  }
  
  return { isProgram: false };
}

/**
 * Augments a question with generate:true and programType if it's a program button.
 * Returns a new object (doesn't mutate).
 */
export function augmentQuestion(question: Question): AugmentedQuestion {
  // If already has generate field, don't re-augment
  if ((question as any).generate !== undefined) {
    return question;
  }
  
  // Use question.question if available, fallback to title (prompt allows omitting question when redundant)
  const questionText = question.question || (question as any).title || '';
  const detection = detectProgramType(questionText);
  
  if (detection.isProgram && detection.programType) {
    return {
      ...question,
      generate: true,
      programType: detection.programType,
    };
  }
  
  return question;
}

/**
 * Augments an array of questions.
 * Returns a new array with augmented questions.
 */
export function augmentQuestions(questions: Question[]): AugmentedQuestion[] {
  return questions.map(augmentQuestion);
}

/**
 * Checks if a question is a program generation button (for UI logic).
 * Used to determine if button should remain clickable after first click.
 */
export function isProgramButton(question: Question): boolean {
  // Check explicit field
  if ((question as any).generate === true) {
    return true;
  }
  
  // Check by text pattern (fallback for cached questions)
  const detection = detectProgramType(question.question);
  return detection.isProgram;
}

