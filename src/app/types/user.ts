import { User as FirebaseUser } from 'firebase/auth';

export interface UserProfile {
  displayName?: string;
  name?: string;
  photoURL?: string;
  phone?: string;
  height?: string;
  weight?: string;
  gender?: string;
  dateOfBirth?: string;
  
  // Health information
  medicalConditions?: string;
  medications?: string;
  injuries?: string;
  familyHistory?: string;
  fitnessLevel?: string;
  sleepPattern?: string;
  
  // Exercise preferences
  exerciseFrequency?: string;
  exerciseModalities?: string | string[];
  exerciseEnvironments?: string | string[];
  workoutDuration?: string;
  targetAreas?: string[];
  
  // Goals and preferences
  healthGoals?: string[];
  timeAvailability?: string;
  dietaryPreferences?: string[];
  painfulAreas?: string[];
  
  // Metadata
  createdAt?: string;
  updatedAt?: string;
}

export interface ExtendedUser extends FirebaseUser {
  profile?: UserProfile;
}

export type ProfileField = keyof UserProfile; 