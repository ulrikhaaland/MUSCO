export interface ExerciseQuestionnaireAnswers {
  // The Age range of the user, e.g. '20-30'
  age: string;
  // The frequency of exercise in the past 12 months, e.g. '1-2 times per week'
  lastYearsExerciseFrequency: string;
  // The frequency of exercise in the coming 12 months, e.g. '2-3 times per week'
  thisYearsPlannedExerciseFrequency: string;
  // The areas of the body that are generally painful, e.g. ['neck', 'left shoulder']
  generallyPainfulAreas: string[];
  // The modalities of exercise the user prefers, e.g. 'strength'
  exerciseModalities?: string;
  // The environment of exercise the user has access to, e.g. 'gym'
  exerciseEnvironments: string;
  // The duration of the workout the user prefers, e.g. '30-45 minutes'
  workoutDuration: string;
  targetAreas: string[];
}

export enum ProgramType {
  Exercise = 'exercise',
  Recovery = 'recovery'
} 