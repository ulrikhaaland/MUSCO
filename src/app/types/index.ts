import { ProgramType } from '../components/ui/ExerciseQuestionnaire';
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
  // The diagnosis of the user, e.g. 'neck strain'
  diagnosis: string | null;
  // The areas of the body that are painful, e.g. ['neck', 'left shoulder']
  painfulAreas: string[];
  // The activities the user should avoid, e.g. ['running', 'lifting weights']
  avoidActivities: string[];
  // The goals of the user, e.g. ['reduce pain', 'improve mobility']
  recoveryGoals: string[];
  // The time frame of the user's recovery, or exercise program, e.g. '4-6 weeks'
  // after this time frame, the program will be completed, and the user needs check in and get a new program
  timeFrame: string;
  // The follow-up questions to ask the user, e.g. ['Do you have any pain in your neck?', 'Do you have any pain in your shoulder?']
  followUpQuestions: Question[];
  // The selected question from the follow-up questions, e.g. 'Do you have any pain in your neck?'
  selectedQuestion?: Question;
  // The type of program the user is getting, e.g. 'exercise' or 'recovery'
  programType: ProgramType;
  // The areas of the body that are targeted by the program, e.g. ['neck', 'left shoulder']
  // only used for exercise programs, not recovery programs
  // targetAreas: string[];
  // Whether the program is progressive, e.g. true or false
  progressive?: boolean;
}
