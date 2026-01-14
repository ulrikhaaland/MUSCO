import { ProgramDay, Exercise, AfterTimeFrame, DayType } from './program';
import { DiagnosisAssistantResponse } from '../types';
import { ExerciseQuestionnaireAnswers } from '../../../shared/types';

/**
 * Weekly plan entry - describes what type of day each day should be
 */
export interface WeeklyPlanDay {
  day: number;
  dayType: 'strength' | 'cardio' | 'recovery' | 'rest';
  intensity: 'high' | 'moderate' | 'low';
  focus: string;
}

/**
 * Response from generating program metadata only (no exercises)
 */
export interface ProgramMetadataResponse {
  title: string;
  programOverview: string;
  summary: string;
  whatNotToDo: string;
  afterTimeFrame: AfterTimeFrame;
  weeklyPlan: WeeklyPlanDay[];
}

/**
 * Response from generating a single day (days 1-7)
 */
export interface SingleDayResponse {
  day: number;
  dayType: DayType;
  description: string;
  exercises: Exercise[];
  duration: number;
}

/**
 * Partial program state during incremental generation
 */
export interface PartialProgram {
  // Program metadata
  title: string;
  programOverview: string;
  summary: string;
  whatNotToDo: string;
  afterTimeFrame: AfterTimeFrame;
  targetAreas: string[];
  bodyParts: string[];
  createdAt: Date;
  
  // Generated days (grows as each day is generated)
  days: ProgramDay[];
  
  // Generation status
  generatingDay: number | null; // Which day is currently being generated (1-7)
  isComplete: boolean; // All 7 days have been generated
}

/**
 * Request payload for generating program metadata only
 */
export interface GenerateMetadataRequest {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  userId?: string;
  programId?: string;
  language?: string;
}

/**
 * Request payload for generating a single day (1-7)
 */
export interface GenerateSingleDayRequest {
  dayNumber: number;
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  previousDays: ProgramDay[];
  programMetadata?: {
    title: string;
    programOverview: string;
    weeklyPlan?: WeeklyPlanDay[];
  };
  userId?: string;
  programId?: string;
  language?: string;
}

/**
 * Status for incremental program generation
 */
export enum IncrementalProgramStatus {
  Idle = 'idle',
  GeneratingMetadata = 'generating_metadata',
  GeneratingDay = 'generating_day',
  Complete = 'complete',
  Error = 'error',
}

/**
 * State for tracking incremental program generation in the UI
 */
export interface IncrementalGenerationState {
  status: IncrementalProgramStatus;
  currentDay: number; // 0 = metadata, 1-7 = generating/completed that day
  partialProgram: PartialProgram | null;
  error: string | null;
}

// ----------------------
// Follow-Up Program Types
// ----------------------

/**
 * Cleaned program feedback with normalized exercise IDs
 */
export interface CleanedProgramFeedback {
  preferredExercises: string[];
  removedExercises: string[];
  replacedExercises: string[];
  addedExercises: { id: string; name: string }[];
}

// ----------------------
// Pre-Followup Chat Types
// ----------------------

/**
 * Intensity feedback for a specific exercise from the previous program
 */
export interface ExerciseIntensityFeedback {
  exerciseId: string;
  feedback: 'too_easy' | 'just_right' | 'too_hard' | 'skipped';
}

/**
 * Workout completion status for a specific day
 */
export interface DayCompletionStatus {
  day: number;
  completed: boolean;
}

/**
 * Adjustment preference for next week's program based on completion feedback
 */
export type AdjustmentDirection = 'increase' | 'decrease' | 'maintain';

/**
 * What aspects of the program to adjust
 */
export interface ProgramAdjustments {
  /** Adjust number of workout days */
  days?: AdjustmentDirection;
  /** Adjust workout duration */
  duration?: AdjustmentDirection;
  /** Adjust number of sets per exercise */
  sets?: AdjustmentDirection;
  /** Adjust number of reps per set */
  reps?: AdjustmentDirection;
  /** Adjust rest time between sets */
  restTime?: AdjustmentDirection;
}

/**
 * Structured updates collected during the pre-followup chat conversation
 */
export interface PreFollowupStructuredUpdates {
  /** Overall feeling about the program (captured from initial response) */
  overallFeeling?: 'great' | 'good' | 'okay' | 'difficult' | 'too_hard';
  /** Overall intensity preference for next program */
  overallIntensity?: 'increase' | 'maintain' | 'decrease';
  /** Change in number of activity days per week */
  numberOfActivityDays?: number;
  /** Specific days user wants to work out (e.g., [1, 3, 5] for Mon/Wed/Fri) */
  preferredWorkoutDays?: number[];
  /** New workout duration preference */
  workoutDuration?: string;
  /** New injuries or pain areas reported */
  newInjuries?: string[];
  /** Previously painful areas that have improved */
  resolvedInjuries?: string[];
  /** Overall pain level change from previous week */
  painLevelChange?: 'better' | 'same' | 'worse';
  /** Whether all workouts were completed */
  allWorkoutsCompleted?: boolean;
  /** Per-day completion status (only set if user didn't complete all) */
  dayCompletionStatus?: DayCompletionStatus[];
  /** Adjustments to apply to next week's program based on completion feedback */
  programAdjustments?: ProgramAdjustments;
  /** LLM-generated summary of what was learned (semantic, not raw text) */
  feedbackSummary?: string;
}

/**
 * Complete feedback from the pre-followup conversational chat.
 * This is passed to generateFollowUpExerciseProgram to inform program generation.
 */
export interface PreFollowupFeedback {
  /** Structured updates for diagnosis and questionnaire data */
  structuredUpdates?: PreFollowupStructuredUpdates;
  /** Per-exercise intensity feedback */
  exerciseIntensity?: ExerciseIntensityFeedback[];
  /** Overall intensity preference for next program */
  overallIntensity?: 'increase' | 'maintain' | 'decrease';
  /** Free-form conversational feedback (summarized) */
  conversationalFeedback: string;
  /** Legacy exercise feedback from ProgramFeedbackQuestionnaire (optional, for compatibility) */
  exerciseFeedback?: CleanedProgramFeedback;
  /** Full chat messages from the pre-followup conversation for LLM processing */
  chatMessages?: Array<{ role: string; content: string }>;
}

/**
 * Request payload for generating follow-up program metadata only
 */
export interface GenerateFollowUpMetadataRequest {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  feedback: CleanedProgramFeedback;
  previousProgram?: {
    title?: string;
    days?: ProgramDay[];
    createdAt?: Date | string;
  };
  language?: string;
}

/**
 * Request payload for generating a single day in follow-up program
 */
export interface GenerateFollowUpSingleDayRequest {
  dayNumber: number;
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  feedback: CleanedProgramFeedback;
  previousDays: SingleDayResponse[];
  weeklyPlan: WeeklyPlanDay[];
  language?: string;
}
