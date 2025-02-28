import { ProgramType, ExerciseQuestionnaireAnswers } from "../shared/types";
import { DiagnosisAssistantResponse } from "../types";

export enum ProgramStatus {
  Generating = 'generating',
  Done = 'done',
  Error = 'error'
}

// Body part groupings
export const TARGET_BODY_PARTS = [
  'Neck',
  'Shoulders',
  'Upper Arms',
  'Forearms',
  'Chest',
  'Abdomen',
  'Upper Back',
  'Lower Back',
  'Glutes',
  'Upper Legs',
  'Lower Legs',
] as const;

export const UPPER_BODY_PARTS = [
  'Neck',
  'Shoulders',
  'Upper Arms',
  'Forearms',
  'Chest',
  'Abdomen',
  'Upper Back',
  'Lower Back',
] as const;

export const LOWER_BODY_PARTS = [
  'Glutes',
  'Upper Legs',
  'Lower Legs',
] as const;

export type BodyRegion = 'Full Body' | 'Upper Body' | 'Lower Body' | 'Custom';

// Utility function to determine the body region from a list of body parts
export function getBodyRegionFromParts(bodyParts: string[]): BodyRegion {
  if (!bodyParts || bodyParts.length === 0) return 'Custom';
  
  // Check if it's a full body workout (all body parts are included)
  if (TARGET_BODY_PARTS.every(part => bodyParts.includes(part)) && 
      bodyParts.length === TARGET_BODY_PARTS.length) {
    return 'Full Body';
  }
  
  // Check if it's an upper body workout
  if (UPPER_BODY_PARTS.every(part => bodyParts.includes(part)) && 
      bodyParts.length === UPPER_BODY_PARTS.length) {
    return 'Upper Body';
  }
  
  // Check if it's a lower body workout
  if (LOWER_BODY_PARTS.every(part => bodyParts.includes(part)) && 
      bodyParts.length === LOWER_BODY_PARTS.length) {
    return 'Lower Body';
  }
  
  return 'Custom';
}

export interface Exercise {
  name: string;
  description: string;
  sets?: number;
  repetitions?: number;
  rest?: number;
  modification?: string;
  videoUrl?: string;
  duration?: number;
  precaution?: string;
  warmup?: boolean;
  instructions?: string;
  bodyPart: string;
}

export interface ProgramDay {
  day: number;
  description: string;
  exercises: Exercise[];
  isRestDay: boolean;
  duration?: number;
}

export interface ProgramWeek {
  week: number;
  differenceReason?: string;
  days: ProgramDay[];
}

export interface AfterTimeFrame {
  expectedOutcome: string;
  nextSteps: string;
}

export interface ExerciseProgram {
  programOverview: string;
  title: string;
  timeFrame: string;
  timeFrameExplanation: string;
  afterTimeFrame: AfterTimeFrame;
  whatNotToDo: string;
  program: ProgramWeek[];
  type: ProgramType;
  createdAt: Date;
  targetAreas: string[];
  bodyParts: string[];
}

export interface UserProgram {
  programs: ExerciseProgram[];
  diagnosis: DiagnosisAssistantResponse;
  questionnaire: ExerciseQuestionnaireAnswers;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  type: ProgramType;
} 