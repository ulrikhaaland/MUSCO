import React, { useState } from 'react';
import { Exercise } from '@/app/types/program';

interface ExerciseSelectionPageProps {
  previousExercises: Exercise[];
  onSave: (effectiveExercises: string[], ineffectiveExercises: string[]) => void;
  onCancel: () => void;
  initialStep?: 'effective' | 'ineffective';
  initialEffectiveExercises?: string[];
  initialIneffectiveExercises?: string[];
}

export function ExerciseSelectionPage({
  previousExercises,
  onSave,
  onCancel,
  initialStep = 'effective',
  initialEffectiveExercises = [],
  initialIneffectiveExercises = [],
}: ExerciseSelectionPageProps) {
  const [effectiveExercises, setEffectiveExercises] = useState<string[]>(initialEffectiveExercises);
  const [ineffectiveExercises, setIneffectiveExercises] = useState<string[]>(initialIneffectiveExercises);
  const [currentStep, _setCurrentStep] = useState<'effective' | 'ineffective'>(initialStep);

  // Get a unique identifier for each exercise
  const getExerciseId = (exercise: Exercise): string => {
    return exercise.id || exercise.exerciseId || exercise.name;
  };

  // Handle checkbox change for effective exercises
  const handleEffectiveChange = (exerciseId: string) => {
    setEffectiveExercises(prev => 
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
    
    // If selecting an effective exercise, remove it from ineffective (if it's there)
    if (!effectiveExercises.includes(exerciseId) && ineffectiveExercises.includes(exerciseId)) {
      setIneffectiveExercises(prev => prev.filter(id => id !== exerciseId));
    }
  };

  // Handle checkbox change for ineffective exercises
  const handleIneffectiveChange = (exerciseId: string) => {
    setIneffectiveExercises(prev => 
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
    
    // If selecting an ineffective exercise, remove it from effective (if it's there)
    if (!ineffectiveExercises.includes(exerciseId) && effectiveExercises.includes(exerciseId)) {
      setEffectiveExercises(prev => prev.filter(id => id !== exerciseId));
    }
  };

  const handleNext = () => {
    // Always save the current selection and return to the feedback form
    onSave(effectiveExercises, ineffectiveExercises);
  };

  const handleBack = () => {
    // Always cancel and return to the feedback form
    onCancel();
  };

  return (
    <div className="bg-gray-900 min-h-screen text-white relative pb-20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            {currentStep === 'effective' 
              ? 'Select Your Most Effective Exercises' 
              : 'Select Exercises You\u2019d Prefer Less Of'}
          </h1>
          <p className="text-gray-400 mt-2">
            {currentStep === 'effective'
              ? 'Choose exercises from your previous program that gave you the best results'
              : 'Choose exercises from your previous program that you found less enjoyable or effective'}
          </p>
        </div>

        {/* Progress Indicator - Only show the current step indicator */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className="w-3 h-3 rounded-full bg-indigo-500"></div>
          </div>
        </div>
        
        {/* Exercise List */}
        <div className="space-y-2 mb-8">
          {previousExercises.length === 0 ? (
            <p className="text-center text-gray-500 italic">No exercises found from previous workouts</p>
          ) : (
            // Filter out effective exercises when on the ineffective step
            previousExercises
              .filter(exercise => {
                // If we're on the ineffective step, filter out exercises already marked as effective
                if (currentStep === 'ineffective') {
                  const exerciseId = getExerciseId(exercise);
                  return !effectiveExercises.includes(exerciseId);
                }
                // Show all exercises on the effective step
                return true;
              })
              .map((exercise) => {
                const exerciseId = getExerciseId(exercise);
                const isSelected = currentStep === 'effective' 
                  ? effectiveExercises.includes(exerciseId)
                  : ineffectiveExercises.includes(exerciseId);
                
                return (
                  <label 
                    key={exerciseId} 
                    className={`flex items-center justify-between p-4 rounded-lg transition cursor-pointer ring-1 
                      ${isSelected 
                        ? 'bg-indigo-900/40 ring-indigo-500/70 shadow-sm shadow-indigo-900/30' 
                        : 'bg-gray-800/50 hover:bg-gray-800 ring-gray-700/30'}`}
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
                    <div className={`flex items-center justify-center w-6 h-6 ml-4 rounded-full ${isSelected ? 'bg-indigo-500' : 'bg-gray-700'}`}>
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => currentStep === 'effective' 
                          ? handleEffectiveChange(exerciseId) 
                          : handleIneffectiveChange(exerciseId)
                        }
                        className="h-5 w-5 opacity-0 absolute"
                      />
                      {isSelected && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </label>
                );
              })
          )}
        </div>
      </div>

      {/* Fixed Navigation Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-3 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 