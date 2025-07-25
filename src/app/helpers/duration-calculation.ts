// Duration calculation utilities for exercise programs

export const calculateExerciseDuration = (exercise: any): number => {
  // For exercises with sets and duration (isometric holds) - check this first
  if (exercise.sets && exercise.duration) {
    const totalHoldTime = exercise.sets * exercise.duration;
    const restTime = exercise.restBetweenSets ? (exercise.sets - 1) * exercise.restBetweenSets : 0;
    return totalHoldTime + restTime;
  }
  
  // For exercises with duration (timed exercises like cardio, warmups)
  if (exercise.duration) {
    return exercise.duration;
  }
  
  // For exercises with sets and repetitions
  if (exercise.sets && exercise.repetitions) {
    // Calculate time per set: 5 seconds per rep
    const timePerRep = 5;
    const exerciseTimePerSet = exercise.repetitions * timePerRep;
    const totalExerciseTime = exercise.sets * exerciseTimePerSet;
    
    // Add rest time between sets (excluding the last set)
    const restTime = exercise.restBetweenSets ? (exercise.sets - 1) * exercise.restBetweenSets : 0;
    
    return totalExerciseTime + restTime;
  }
  
  // Default fallback
  return 60;
};

export const calculateDayDuration = (exercises: any[]): number => {
  if (!exercises || exercises.length === 0) return 0;
  
  const totalSeconds = exercises.reduce((total, exercise) => {
    return total + calculateExerciseDuration(exercise);
  }, 0);
  
  // Convert to minutes and round up
  return Math.ceil(totalSeconds / 60);
}; 