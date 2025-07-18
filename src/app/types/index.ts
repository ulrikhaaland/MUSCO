import { ProgramType } from '../shared/types';
import { AnatomyPart } from './human';

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
  hasError?: boolean; // Flag to indicate if the message streaming was interrupted
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
  language?: string; // User's preferred language (en/nb)
  diagnosisAssistantResponse?: DiagnosisAssistantResponse; // Current diagnostic information
}

export interface Question {
  title?: string;
  question: string;
  generate?: boolean;
  asked?: boolean;
  diagnosis?: string;
  programType?: ProgramType;
  meta?: string;
}

export interface DiagnosisAssistantResponse {
  // The diagnosis of the user, e.g. 'neck strain'
  diagnosis: string | null;
  // The areas of the body that are painful, e.g. ['neck', 'left shoulder']
  painfulAreas: string[];
  // Informational insights about the user's condition
  informationalInsights: string | null;
  // When symptoms began (acute / gradual / unknown)
  onset: string | null;
  // Pain intensity on scale of 0-10
  painScale: number | null;
  // How the issue developed (trauma / overuse / posture / unknown)
  mechanismOfInjury: string | null;
  // What makes symptoms worse
  aggravatingFactors: string | null;
  // What makes symptoms better
  relievingFactors: string | null;
  // Previous similar issues (yes/no)
  priorInjury: string | null;
  // How the pain occurs (constant, intermittent, activity-dependent)
  painPattern: string | null;
  // Specific area within the selected body part
  painLocation: string | null;
  // Type of pain (sharp, dull, achy, burning, etc.)
  painCharacter: string | null;
  // Whether assessment is complete
  assessmentComplete: boolean;
  // Whether red flags are present
  redFlagsPresent: boolean;
  // The activities the user should avoid, e.g. ['running', 'lifting weights']
  avoidActivities: string[];
  // The goals of the user, e.g. ['reduce pain', 'improve mobility']
  recoveryGoals: string[];
  // The time frame of the user's recovery, or exercise program, e.g. '4-6 weeks'
  // after this time frame, the program will be completed, and the user needs check in and get a new program
  timeFrame: string;
  // The follow-up questions to ask the user, e.g. ['Do you have any pain in your neck?', 'Do you have any pain in your shoulder?']
  followUpQuestions: Question[];
  // The type of program the user is getting, e.g. 'exercise' or 'recovery'
  programType: ProgramType;
  // The areas of the body that are targeted by the program, e.g. ['neck', 'left shoulder']
  targetAreas: string[];
}
