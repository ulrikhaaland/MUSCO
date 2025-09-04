import {
  Exercise,
  ProgramDay,
  WorkoutDuration,
  ExerciseModality,
  TargetBodyPart,
  STRENGTH_EQUIPMENT,
  CARDIO_EQUIPMENT,
  WORKOUT_DURATIONS,
  EXERCISE_MODALITIES,
} from '@/app/types/program';

export type EquipmentName =
  | (typeof STRENGTH_EQUIPMENT)[number]
  | (typeof CARDIO_EQUIPMENT)[number]
  | 'Bodyweight';

export interface GymBrand { color?: string; logoUrl?: string; }

export interface Gym {
  id: string;
  ownerId: string;
  name: string;
  slug: string;
  brand?: GymBrand;
  equipment: EquipmentName[];
  token?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SingleDayProgramRequest {
  gymSlug: string;
  modality: ExerciseModality;
  experience: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: WorkoutDuration;
  locale?: 'en' | 'nb';
}

export interface SingleDayProgramResult {
  gym: Pick<Gym, 'name' | 'slug' | 'brand'>;
  title: string;
  sessionOverview: string;
  summary: string;
  whatNotToDo: string;
  day: {
    isRestDay: false;
    description: string;
    exercises: Array<{
      exerciseId: string;
      warmup?: true;
      modification?: string;
      precaution?: string;
      duration?: number;
    }>;
    duration: number;
  };
}

export type { Exercise, ProgramDay, WorkoutDuration, ExerciseModality, TargetBodyPart };





