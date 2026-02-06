import {
  ExerciseQuestionnaireAnswers,
  ProgramType,
} from '@shared/types';
import { DiagnosisAssistantResponse } from '../types';

// Re-export for use throughout the app
export { ProgramType };

export enum ProgramStatus {
  Generating = 'generating',
  Done = 'done',
  Error = 'error',
}

// Body parts for target areas
export const BODY_REGIONS = ['Full Body', 'Upper Body', 'Lower Body'] as const;

// Body part groups (for diagnosis flow - group → specific part)
export const BODY_PART_GROUPS = [
  'Neck',
  'Shoulders',
  'Arms',
  'Chest',
  'Abdomen',
  'Back',
  'Hips & Glutes',
  'Legs',
] as const;

export type BodyPartGroupName = (typeof BODY_PART_GROUPS)[number];

// Specific parts within each group (for diagnosis narrowing)
export const SPECIFIC_BODY_PARTS: Record<BodyPartGroupName, readonly string[]> =
  {
    Neck: ['Front of neck', 'Side of neck', 'Back of neck'],
    Shoulders: ['Left shoulder', 'Right shoulder', 'Both shoulders'],
    Arms: [
      'Left upper arm',
      'Right upper arm',
      'Left elbow',
      'Right elbow',
      'Left forearm',
      'Right forearm',
    ],
    Chest: ['Upper chest', 'Lower chest', 'Entire chest'],
    Abdomen: ['Upper abdomen', 'Lower abdomen', 'Side of abdomen'],
    Back: ['Upper back', 'Middle back', 'Lower back'],
    'Hips & Glutes': ['Left hip', 'Right hip', 'Glutes'],
    Legs: [
      'Left thigh',
      'Right thigh',
      'Left knee',
      'Right knee',
      'Left lower leg',
      'Right lower leg',
      'Left foot',
      'Right foot',
    ],
  } as const;

// Body part groupings (for program generation - existing functionality)
// Note: Neck is included for completeness but we don't have neck exercises yet
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

// Selectable body parts (parts we actually have exercises for - excludes Neck)
export const SELECTABLE_BODY_PARTS = [
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

// Selectable upper body parts (excludes Neck)
export const SELECTABLE_UPPER_BODY_PARTS = [
  'Shoulders',
  'Upper Arms',
  'Forearms',
  'Chest',
  'Abdomen',
  'Upper Back',
  'Lower Back',
] as const;

export const LOWER_BODY_PARTS = ['Glutes', 'Upper Legs', 'Lower Legs'] as const;

// Body region type for detection
export type BodyRegionType = 'fullBody' | 'upperBody' | 'lowerBody' | 'custom';

/**
 * Detects body region from an array of target areas.
 * Uses SELECTABLE_ constants (without Neck) for detection since we don't have neck exercises.
 * This function is used by both ExerciseQuestionnaire and programs page for consistent detection.
 */
export function detectBodyRegion(targetAreas: string[]): BodyRegionType {
  if (!targetAreas || targetAreas.length === 0) return 'custom';
  
  // Filter out 'Neck' from the target areas for comparison (in case it's included)
  const areasWithoutNeck = targetAreas.filter(area => area !== 'Neck');
  
  // Check if it's Full Body (all selectable body parts)
  const isFullBody = SELECTABLE_BODY_PARTS.length === areasWithoutNeck.length &&
    SELECTABLE_BODY_PARTS.every(part => areasWithoutNeck.includes(part));
  if (isFullBody) return 'fullBody';
  
  // Check if it's Upper Body (all selectable upper body parts)
  const isUpperBody = SELECTABLE_UPPER_BODY_PARTS.length === areasWithoutNeck.length &&
    SELECTABLE_UPPER_BODY_PARTS.every(part => areasWithoutNeck.includes(part));
  if (isUpperBody) return 'upperBody';
  
  // Check if it's Lower Body (all lower body parts - no neck in this group anyway)
  const isLowerBody = LOWER_BODY_PARTS.length === areasWithoutNeck.length &&
    LOWER_BODY_PARTS.every(part => areasWithoutNeck.includes(part));
  if (isLowerBody) return 'lowerBody';
  
  return 'custom';
}

/**
 * Gets the body parts array for a given region.
 * Returns SELECTABLE_ variants (without Neck) since we don't have neck exercises.
 */
export function getBodyPartsForRegion(region: BodyRegionType): readonly string[] {
  switch (region) {
    case 'fullBody':
      return SELECTABLE_BODY_PARTS;
    case 'upperBody':
      return SELECTABLE_UPPER_BODY_PARTS;
    case 'lowerBody':
      return LOWER_BODY_PARTS;
    default:
      return [];
  }
}

// Equipment access options
export const EQUIPMENT_ACCESS = ['Large Gym', 'Custom'] as const;

export const EQUIPMENT_DESCRIPTIONS = {
  'Large Gym':
    'Full-service fitness facility with extensive equipment including cardio machines, weight machines, free weights, and specialized training areas',
  Custom:
    'Customize your own environment by selecting specific equipment you have access to',
} as const;

// Equipment options by category
export const STRENGTH_EQUIPMENT = [
  'Dumbbell',
  'Barbell',
  'Cable',
  'Bands',
  'Bench',
  'TRX',
  'Kettle Bell',
] as const;

export const CARDIO_EQUIPMENT = [
  'Treadmill',
  'Exercise Bike',
  'Rowing Machine',
  'Elliptical',
  'Jump Rope',
] as const;

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
    name: 'Custom',
    description:
      'Customize your own environment by selecting specific equipment you have access to',
  },
] as const;

export type ExerciseEnvironmentName =
  (typeof EXERCISE_ENVIRONMENTS)[number]['name'];

// Workout duration options for exercise programs
export const WORKOUT_DURATIONS = [
  '15-30 minutes',
  '30-45 minutes',
  '45-60 minutes',
  '60-90 minutes',
  'More than 90 minutes',
] as const;

export type WorkoutDuration = (typeof WORKOUT_DURATIONS)[number];

// Workout duration options for recovery programs (shorter durations)
export const RECOVERY_WORKOUT_DURATIONS = [
  '15 minutes',
  '30 minutes',
  '45 minutes',
] as const;

export type RecoveryWorkoutDuration = (typeof RECOVERY_WORKOUT_DURATIONS)[number];

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

/**
 * Exercise modality options for program generation
 * NOTE: For profile display with descriptions, use PROFILE_EXERCISE_MODALITIES
 * from @/app/profile/constants/profileOptions.ts
 */
export const EXERCISE_MODALITIES = ['Cardio', 'Strength', 'Both'] as const;

export type ExerciseModality = (typeof EXERCISE_MODALITIES)[number];

// Body group names - exact match with bodyPartGroups.ts config (source of truth)
// These are the 3D model selectable regions and canonical body part identifiers
export const BODY_GROUP_NAMES = [
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
  'Abdomen',
  'Upper & Middle Back',
  'Lower Back, Pelvis & Hip Region',
  'Glutes',
  'Right Thigh',
  'Left Thigh',
  'Left Knee',
  'Right Knee',
  'Left Lower Leg',
  'Right Lower Leg',
  'Left Foot',
  'Right Foot',
] as const;

export type BodyGroupName = (typeof BODY_GROUP_NAMES)[number];

// Norwegian translations for body groups (matches bodyPart.group.* keys in nb.ts)
export const BODY_GROUP_NAMES_NB: Record<BodyGroupName, string> = {
  'Neck': 'Nakke',
  'Left Shoulder': 'Venstre skulder',
  'Right Shoulder': 'Høyre skulder',
  'Left Upper Arm': 'Venstre overarm',
  'Right Upper Arm': 'Høyre overarm',
  'Left Elbow': 'Venstre albue',
  'Right Elbow': 'Høyre albue',
  'Left Forearm': 'Venstre underarm',
  'Right Forearm': 'Høyre underarm',
  'Left Hand': 'Venstre hånd',
  'Right Hand': 'Høyre hånd',
  'Chest': 'Bryst',
  'Abdomen': 'Mage',
  'Upper & Middle Back': 'Øvre og midtre rygg',
  'Lower Back, Pelvis & Hip Region': 'Korsrygg, bekken og hofteregion',
  'Glutes': 'Setemuskulatur',
  'Right Thigh': 'Høyre lår',
  'Left Thigh': 'Venstre lår',
  'Left Knee': 'Venstre kne',
  'Right Knee': 'Høyre kne',
  'Left Lower Leg': 'Venstre legg',
  'Right Lower Leg': 'Høyre legg',
  'Left Foot': 'Venstre fot',
  'Right Foot': 'Høyre fot',
};

// Alias for backward compatibility - prefer BODY_GROUP_NAMES for new code
export const PAIN_BODY_PARTS = BODY_GROUP_NAMES;
export type PainBodyPart = BodyGroupName;

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
  type?: string;
  alternatives?: string[];
  viewCount?: number;
  popularity?: string;
  forceType?: string;
  mechanics?: string;
  restBetweenSets?: number;
  isOriginal?: boolean;
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

/**
 * Day type for workout programs
 */
export type DayType = 'strength' | 'cardio' | 'recovery' | 'rest';

export interface ProgramDay {
  day: number;
  description: string;
  exercises: Exercise[];
  dayType: DayType;
  duration?: number;
  /** Whether this day's workout was completed by the user */
  completed?: boolean;
  /** When this day's workout was marked as completed */
  completedAt?: Date;
  // Legacy fields - kept for backward compatibility with existing data
  /** @deprecated Use dayType instead */
  isRestDay?: boolean;
  /** @deprecated Use dayType instead */
  isCardioDay?: boolean;
  /** @deprecated Use dayType instead */
  isRecoveryDay?: boolean;
}

/**
 * Get the dayType from a ProgramDay, handling legacy boolean fields
 * Use this when reading data that might be in the old format
 */
export function getDayType(day: ProgramDay): DayType {
  // If dayType is already set, use it
  if (day.dayType) {
    return day.dayType;
  }
  // Convert legacy boolean flags to dayType
  if (day.isRestDay) {
    return 'rest';
  }
  if (day.isCardioDay) {
    return 'cardio';
  }
  if (day.isRecoveryDay) {
    return 'recovery';
  }
  // Default to strength (when all flags are false/undefined)
  return 'strength';
}

export interface AfterTimeFrame {
  expectedOutcome: string;
  nextSteps: string;
}

export interface ExerciseProgram {
  programOverview: string;
  summary: string;
  timeFrameExplanation: string;
  afterTimeFrame: AfterTimeFrame;
  whatNotToDo: string;
  days: ProgramDay[];
  createdAt: Date;
  targetAreas: string[];
  bodyParts: string[];
  docId?: string;
  weekId?: string; // Week document ID (for feedback storage)
  title?: string;
}

export interface UserProgram {
  programs: ExerciseProgram[];
  diagnosis: DiagnosisAssistantResponse;
  questionnaire: ExerciseQuestionnaireAnswers;
  createdAt: string;
  updatedAt: Date;
  type: ProgramType;
  timeFrame?: string;
  title: string;
  isCustomProgram?: boolean; // True for predefined recovery programs (not AI-generated)
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

// Add the cardio types and environments constants
export const CARDIO_TYPES = ['Running', 'Cycling', 'Rowing', 'Incline Walking'] as const;

export const CARDIO_ENVIRONMENTS = ['Outside', 'Inside', 'Both'] as const;
