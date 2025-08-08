import { ProgramType } from '../../../shared/types';
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
  mode?: 'diagnosis' | 'explore'; // chat mode
}

export interface Question {
  title?: string;
  question: string;
  generate?: boolean;
  asked?: boolean;
  diagnosis?: string;
  programType?: ProgramType;
  chatMode?: 'diagnosis' | 'explore';
  meta?: string;
}

export interface DiagnosisAssistantResponse {
  /* 7-Q core + optional fields */
  informationalInsights: string | null;
  painfulAreas: string[];
  onset: 'acute' | 'gradual' | 'unknown' | null;
  painLocation: string | null;
  painScale: number | null; // 0-10
  painCharacter: string | null;
  aggravatingFactors: string[]; // array
  relievingFactors: string[]; // array
  painPattern: 'constant' | 'intermittent' | 'activity-dependent' | null;
  priorInjury?: 'yes' | 'no' | null;
  mechanismOfInjury?: 'trauma' | 'overuse' | 'posture' | 'unknown' | null;

  /* state flags */
  assessmentComplete: boolean;
  redFlagsPresent: boolean;

  /* program scaffolding */
  diagnosis: string | null;
  timeFrame: string | null; // null until set
  avoidActivities: string[];
  targetAreas: string[];
  /* UI */
  followUpQuestions: Question[];
  // The type of program the user is getting, e.g. 'exercise' or 'recovery'
  programType: ProgramType;
  switchToDiagnosis?: boolean;
}
