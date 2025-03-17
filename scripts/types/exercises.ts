/**
 * Type definitions for exercise data
 */

export interface Exercise {
  id: string;
  name: string;
  description: string;
  targetBodyParts: string[];
  exerciseType: string[];
  difficulty: string;
  equipment: string[];
  steps: string[];
  tips: string[];
  contraindications: string[];
  muscles: string[];
  alternatives: string[];
  // Optional properties for repetition ranges
  repetitions?: number;
  sets?: number;
  restBetweenSets?: number;
  duration?: number;
  // Additional metadata
  videoUrl?: string;
  imageUrl?: string;
  viewCount?: number;
  popularity?: string;
  forceType?: string;
  mechanics?: string;
}

export interface ExerciseGroup {
  bodyPart: string;
  exercises: Exercise[];
} 