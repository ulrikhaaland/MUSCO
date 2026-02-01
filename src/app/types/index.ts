import { ProgramType } from '../../../shared/types';
import { AnatomyPart } from './human';
import { UserProfile } from './user';

// Re-export ProgramType for convenience
export type { ProgramType };

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
  // Added for rate limiting context
  userId?: string;
  isSubscriber?: boolean;
  // UI hints for assistants
  maxFollowUpOptions?: number; // prefer N follow-ups (mobile e.g. 3, desktop e.g. 6)
  // Optional: prior message history for chat-completions fast path
  messages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  // User profile for health context injection
  userProfile?: UserProfile;
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
  selectBodyGroup?: string; // When set, clicking this follow-up selects the body group on the 3D model
  selectBodyPart?: string;  // When set, clicking this follow-up selects a specific body part on the 3D model
  multiSelect?: boolean;    // When true, allow selecting multiple options before sending
  value?: string;           // Internal value (e.g., day number) separate from display title
}

export interface DiagnosisAssistantResponse {
  /* Running summary of collected information */
  summary: string | null; // Updated on each turn with a concise summary of what's been learned
  
  /* Body part selection (for diagnosis without pre-selected part) */
  selectedBodyGroup: string | null; // e.g., "Neck", "Shoulders", "Back"
  selectedBodyPart: string | null; // e.g., "Left shoulder", "Lower back"
  
  /* 7-Q core + optional fields */
  informationalInsights: string | null;
  painfulAreas: string | null;
  onset: string | null; // Free text: "suddenly", "gradually", "over time", etc.
  painLocation: string | null;
  painScale: number | null; // 0-10
  painCharacter: string | null; // Free text: "sharp", "dull", "aching", "burning", etc.
  aggravatingFactors: string | null; // Free text, comma-separated if multiple
  relievingFactors: string | null; // Free text, comma-separated if multiple
  painPattern: string | null; // Free text: "constant", "intermittent", "comes and goes", etc.
  priorInjury: string | null; // Free text: "yes", "no", or description
  mechanismOfInjury: string | null; // Free text: description of how injury occurred

  /* state flags */
  assessmentComplete: boolean;
  redFlagsPresent: boolean;

  /* program scaffolding */
  diagnosis: string | null;
  timeFrame: string | null;
  avoidActivities: string | null;
  targetAreas: string | null;
  /* UI */
  followUpQuestions: Question[];
  // The type of program the user is getting, e.g. 'exercise' or 'recovery'
  programType: ProgramType;
  switchToDiagnosis?: boolean;
}
