import { ProgramType, ExerciseQuestionnaireAnswers } from "../shared/types";
import { DiagnosisAssistantResponse } from "../types";

export enum ProgramStatus {
  Generating = 'generating',
  Done = 'done',
  Error = 'error'
}

export interface Exercise {
  name: string;
  description: string;
  sets?: number;
  repetitions?: number;
  rest?: number;
  modification?: string;
  videoUrl?: string;
  duration?: string;
  precaution?: string;
  warmup?: boolean;
  instructions?: string;
}

export interface ProgramDay {
  day: number;
  description: string;
  exercises: Exercise[];
  isRestDay: boolean;
  duration?: string;
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
  timeFrame: string;
  timeFrameExplanation: string;
  afterTimeFrame: AfterTimeFrame;
  whatNotToDo: string;
  program: ProgramWeek[];
  type: ProgramType;
  createdAt: Date;
  targetAreas: string[];
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