import { ProgramType, ExerciseQuestionnaireAnswers } from '../shared/types';
import { DiagnosisAssistantResponse } from '../types';

export enum ProgramStatus {
  Generating = 'generating',
  Done = 'done',
  Error = 'error',
}

// Body parts for target areas
export const BODY_REGIONS = ['Full Body', 'Upper Body', 'Lower Body'] as const;

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

export const LOWER_BODY_PARTS = ['Glutes', 'Upper Legs', 'Lower Legs'] as const;

// Equipment access options
export const EQUIPMENT_ACCESS = [
  'Large Gym',
  'Small Gym',
  'Garage Gym',
  'At Home',
  'Bodyweight Only',
] as const;

export const EQUIPMENT_DESCRIPTIONS = {
  'Large Gym':
    'Full-service fitness facility with extensive equipment including cardio machines, weight machines, free weights, and specialized training areas',
  'Small Gym': 'Compact public gym with limited equipment',
  'Garage Gym': 'Barbells, squat rack, dumbells and more',
  'At Home': 'Limited equipment such as dumbells, bands, pull-up bars etc.',
  'Bodyweight Only': 'Work out anywhere without gym equipment',
} as const;

// Exercise environment type and data
export interface ExerciseEnvironment {
  name: string;
  description: string;
}

export const EXERCISE_ENVIRONMENTS: ExerciseEnvironment[] = [
  {
    name: 'Large Gym',
    description:
      'Full-service fitness facility with extensive equipment including cardio machines, weight machines, free weights, and specialized training areas',
  },
  {
    name: 'Small Gym',
    description: 'Compact public gym with limited equipment',
  },
  {
    name: 'Garage Gym',
    description: 'Barbells, squat rack, dumbells and more',
  },
  {
    name: 'At Home',
    description: 'Limited equipment such as dumbells, bands, pull-up bars etc.',
  },
  {
    name: 'Bodyweight Only',
    description: 'Work out anywhere without gym equipment',
  },
] as const;

export type ExerciseEnvironmentName =
  (typeof EXERCISE_ENVIRONMENTS)[number]['name'];

// Workout duration options
export const WORKOUT_DURATIONS = [
  '15-30 minutes',
  '30-45 minutes',
  '45-60 minutes',
  '60-90 minutes',
  'More than 90 minutes',
] as const;

export type WorkoutDuration = (typeof WORKOUT_DURATIONS)[number];

// Age range options
export const AGE_RANGES = [
  'Under 20',
  '20-30',
  '30-40',
  '40-50',
  '50-60',
  '60-70',
  '70 or above',
] as const;

export type AgeRange = (typeof AGE_RANGES)[number];

// Exercise frequency options
export const EXERCISE_FREQUENCY_OPTIONS = [
  '0',
  '1-2 times per week',
  '2-3 times per week',
  '4-5 times per week',
  'Every day',
] as const;

export type ExerciseFrequency = (typeof EXERCISE_FREQUENCY_OPTIONS)[number];

// Planned exercise frequency options
export const PLANNED_EXERCISE_FREQUENCY_OPTIONS = [
  '1 day per week',
  '2 days per week',
  '3 days per week',
  '4 days per week',
  '5 days per week',
  '6 days per week',
  'Every day',
] as const;

export type PlannedExerciseFrequency =
  (typeof PLANNED_EXERCISE_FREQUENCY_OPTIONS)[number];

// Exercise modality options
export const EXERCISE_MODALITIES = ['Cardio', 'Strength', 'Both'] as const;

export type ExerciseModality = (typeof EXERCISE_MODALITIES)[number];

// Pain body parts options (for detailed assessment)
export const PAIN_BODY_PARTS = [
  'Neck',
  'Left Shoulder',
  'Right Shoulder',
  'Left Upper Arm',
  'Right Upper Arm',
  'Left Elbow',
  'Right Elbow',
  'Left Forearm',
  'Right Forearm',
  'Left Hand',
  'Right Hand',
  'Chest',
  'Torso',
  'Upper Back',
  'Middle Back',
  'Lower Back',
  'Pelvis & Hip Region',
  'Right Thigh',
  'Left Thigh',
  'Left Knee',
  'Right Knee',
  'Left Lower Leg',
  'Right Lower Leg',
  'Left Foot',
  'Right Foot',
] as const;

export type PainBodyPart = (typeof PAIN_BODY_PARTS)[number];

export type BodyRegion = 'Full Body' | 'Upper Body' | 'Lower Body' | 'Custom';

// Utility function to determine the body region from a list of body parts
export function getBodyRegionFromParts(bodyParts: string[]): BodyRegion {
  if (!bodyParts || bodyParts.length === 0) return 'Custom';

  // Check if it's a full body workout (all body parts are included)
  if (
    TARGET_BODY_PARTS.every((part) => bodyParts.includes(part)) &&
    bodyParts.length === TARGET_BODY_PARTS.length
  ) {
    return 'Full Body';
  }

  // Check if it's an upper body workout
  if (
    UPPER_BODY_PARTS.every((part) => bodyParts.includes(part)) &&
    bodyParts.length === UPPER_BODY_PARTS.length
  ) {
    return 'Upper Body';
  }

  // Check if it's a lower body workout
  if (
    LOWER_BODY_PARTS.every((part) => bodyParts.includes(part)) &&
    bodyParts.length === LOWER_BODY_PARTS.length
  ) {
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
  exerciseId?: string;
  id?: string;
  imageUrl?: string;
  steps?: string[];
  tips?: string[];
  contraindications?: string[];
  muscles?: string[];
  equipment?: string[];
  difficulty?: string;
  targetBodyParts?: string[];
  bodyPart?: string;
  exerciseType?: string[] | string;
  alternatives?: string[];
  viewCount?: number;
  popularity?: string;
  forceType?: string;
  mechanics?: string;
  restBetweenSets?: number;
}

// Helper function to get bodyPart from an Exercise
export function getBodyPart(exercise: Exercise): string | undefined {
  return exercise.bodyPart || exercise.targetBodyParts?.[0];
}

export interface ExerciseGroup {
  bodyPart: TargetBodyPart;
  exercises: Exercise[];
}

export type ExercisesTemplate = ExerciseGroup[];

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
  docId?: string;
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

export type TargetBodyPart = (typeof TARGET_BODY_PARTS)[number];

// Define exercise types/categories
export type ExerciseType =
  | 'strength'
  | 'flexibility'
  | 'mobility'
  | 'stability'
  | 'balance'
  | 'core'
  | 'posture'
  | 'endurance'
  | 'coordination'
  | 'relaxation';
