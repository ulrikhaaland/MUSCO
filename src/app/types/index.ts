import { BodyPartGroup } from '../config/bodyPartGroups';
import { AnatomyPart } from './anatomy';

export type Gender = 'male' | 'female';

export interface PopupOption {
  id: string;
  label: string;
  description?: string;
}

export interface BodyPart {
  id: string;
  name: string;
  description: string;
  position: {
    x: number;
    y: number;
    z: number;
  };
}

// OpenAI API response types
export interface OpenAIMessage {
  id: string;
  content: string | Array<{ text: { value: string } }>;
  role: 'user' | 'assistant' | 'system';
  created_at: number;
}

// Our application's message type
export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

export interface ExerciseProgram {
  id: string;
  title: string;
  description: string;
  targetBodyPart: string;
  exercises: Exercise[];
  frequency: number;
  duration: number;
}

export interface Exercise {
  id: string;
  name: string;
  description: string;
  sets: number;
  reps: number;
  restTime: number;
  videoUrl?: string;
  imageUrl?: string;
}

export interface UserPreferences {
  gender: Gender;
  age?: number;
  fitnessLevel?: 'beginner' | 'intermediate' | 'advanced';
  exerciseFrequency?: number;
  bodyParts?: AnatomyPart[];
}

export interface AssistantThread {
  id: string;
  messages: ChatMessage[];
  status: 'active' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatPayload {
  message: string;
  userPreferences?: UserPreferences;
  selectedBodyPart?: AnatomyPart;
  selectedBodyGroupName: string;
  bodyPartsInSelectedGroup: string[];
  previousQuestions?: Question[];
}

export interface Question {
  title: string;
  question: string;
  generate?: boolean;
  asked?: boolean;
  diagnosis?: string;
}

export interface DiagnosisAssistantResponse {
  diagnosis: string | null;
  painfulAreas: string[];
  avoidActivities: string[];
  recoveryGoals: string[];
  timeFrame: string;
  followUpQuestions: Question[];
  selectedQuestion?: Question;
}
