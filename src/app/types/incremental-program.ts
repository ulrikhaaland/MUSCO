import { ProgramDay, Exercise, AfterTimeFrame } from './program';
import { DiagnosisAssistantResponse } from '../types';
import { ExerciseQuestionnaireAnswers } from '../../../shared/types';

/**
 * Weekly plan entry - describes what type of day each day should be
 */
export interface WeeklyPlanDay {
  day: number;
  dayType: 'strength' | 'cardio' | 'rest';
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
  isRestDay: boolean;
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
