import React from 'react';
import { Exercise } from '@/app/types/program';

interface ExerciseFeedbackSelectorProps {
  exercises: Exercise[];
  selectedExercises: string[];
  onChange: (selectedExerciseIds: string[]) => void;
  title: string;
  description: string;
}

export function ExerciseFeedbackSelector({
  exercises,
  selectedExercises,
  onChange,
  title,
  description,
}: ExerciseFeedbackSelectorProps) {
  // Handle checkbox change
  const handleCheckboxChange = (exerciseId: string) => {
    const updatedSelection = selectedExercises.includes(exerciseId)
      ? selectedExercises.filter(id => id !== exerciseId)
      : [...selectedExercises, exerciseId];
    
    onChange(updatedSelection);
  };

  // Get a unique identifier for each exercise
  const getExerciseId = (exercise: Exercise): string => {
    return exercise.id || exercise.exerciseId || exercise.name;
  };

  return (
    <div className="space-y-4">
      <h4 className="text-white font-medium">{title}</h4>
      <p className="text-gray-400 text-sm">{description}</p>
      
      <div className="grid grid-cols-1 gap-2 mt-3">
        {exercises.length === 0 ? (
          <p className="text-gray-500 italic">No exercises found from previous workouts</p>
        ) : (
          exercises.map((exercise) => {
            const exerciseId = getExerciseId(exercise);
            return (
              <label 
                key={exerciseId} 
                className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition cursor-pointer ring-1 ring-gray-700/30"
              >
                <div className="flex-1">
                  <div className="font-medium text-white">{exercise.name}</div>
                  {exercise.targetBodyParts && (
                    <div className="text-gray-400 text-sm mt-1">
                      {Array.isArray(exercise.targetBodyParts) 
                        ? exercise.targetBodyParts.join(', ') 
                        : exercise.targetBodyParts}
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-center w-6 h-6 ml-4">
                  <input
                    type="checkbox"
                    checked={selectedExercises.includes(exerciseId)}
                    onChange={() => handleCheckboxChange(exerciseId)}
                    className="h-5 w-5 rounded border-gray-600 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900"
                  />
                </div>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
} 