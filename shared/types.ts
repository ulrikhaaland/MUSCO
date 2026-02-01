export interface ExerciseQuestionnaireAnswers {
  // The Age range of the user, e.g. '20-30'
  age: string;
  // The frequency of exercise in the past 12 months, e.g. '1-2 times per week'
  lastYearsExerciseFrequency: string;
  // The frequency of exercise in the coming 12 months, e.g. '2-3 times per week'
  numberOfActivityDays: string;
  // The areas of the body that are generally painful, e.g. ['neck', 'left shoulder']
  generallyPainfulAreas: string[];
  // The modalities of exercise the user prefers, e.g. 'strength'
  exerciseModalities?: string;
  // For 'Both' modality, how to split between cardio and strength
  modalitySplit?: string;
  // Number of days per week dedicated to cardio training
  cardioDays?: number;
  // Number of days per week dedicated to strength training
  strengthDays?: number;
  // The environment of exercise the user has access to, e.g. 'gym'
  exerciseEnvironments: string;
  // The duration of the workout the user prefers, e.g. '30-45 minutes'
  workoutDuration: string;
  targetAreas: string[];
  // Available equipment for the user, e.g. ['dumbbells', 'resistance bands']
  equipment?: string[];
  // User's experience level, e.g. 'beginner', 'intermediate', 'advanced'
  experienceLevel?: string;
  // Weekly frequency of exercise, e.g. '3' (days per week)
  weeklyFrequency?: string;
  // Type of cardio exercise, e.g. 'Running', 'Cycling', 'Rowing'
  cardioType?: string;
  // Preferred cardio environment, e.g. 'Outside', 'Inside', 'Both'
  cardioEnvironment?: string;
  // Whether to include weekend days for exercise, defaults to true
  includeWeekends?: boolean;
  // Any additional information the user wants to provide for program generation
  additionalInfo?: string;
}

export enum ProgramType {
  Exercise = 'exercise',
  Recovery = 'recovery',
  ExerciseAndRecovery = 'exercise_and_recovery'
} 