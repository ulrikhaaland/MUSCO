'use client';

import { useState, useRef, useEffect } from 'react';
import { Exercise } from '@/app/types/program';
import { ExerciseFeedbackSelector } from './ExerciseFeedbackSelector';
import { exerciseFiles, loadExercisesFromJson } from '@/app/services/exerciseProgramService';

// Extend the Exercise type to include additional properties
interface ExtendedExercise extends Exercise {
  isReplacement?: boolean;
  replacingExerciseId?: string;
}

interface ProgramFeedbackQuestionnaireProps {
  onSubmit: (feedback: ProgramFeedback) => Promise<void>;
  onCancel: () => void;
  nextWeekDate: Date;
  isFeedbackDay: boolean;
  previousExercises: Exercise[];
  onAddExercise?: (category: string, exercise: Exercise) => void;
}

export interface ProgramFeedback {
  preferredExercises?: string[];
  removedExercises?: string[];
  replacedExercises?: string[];
  addedExercises?: Exercise[];
}

export function ProgramFeedbackQuestionnaire({
  onSubmit,
  onCancel,
  nextWeekDate,
  isFeedbackDay,
  previousExercises = [],
  onAddExercise,
}: ProgramFeedbackQuestionnaireProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const [replacedExercises, setReplacedExercises] = useState<string[]>([]);
  const [removedExercises, setRemovedExercises] = useState<string[]>([]);
  const [addedExercises, setAddedExercises] = useState<ExtendedExercise[]>([]);
  const [alternativeExercises, setAlternativeExercises] = useState<Record<string, Exercise[]>>({});
  const [loadingAlternatives, setLoadingAlternatives] = useState(false);
  const [replacementMap, setReplacementMap] = useState<Record<string, Exercise>>({});
  const [usedAlternativeIds, setUsedAlternativeIds] = useState<Set<string>>(new Set());
  
  // Load all alternative exercises for the current exercises
  useEffect(() => {
    const loadAllAlternatives = async () => {
      setLoadingAlternatives(true);
      const allAlternatives: Record<string, Exercise[]> = {};
      
      // Get all body parts needed for loading
      const categoryToBodyPartMap: Record<string, string> = {
        'Abs': 'Abdomen',
        'Biceps': 'Upper Arms',
        'Calves': 'Lower Legs',
        'Chest': 'Chest',
        'Forearms': 'Forearms',
        'Glutes': 'Glutes',
        'Hamstrings': 'Upper Legs',
        'Lats': 'Upper Back',
        'Lower Back': 'Lower Back',
        'Obliques': 'Abdomen',
        'Quads': 'Upper Legs',
        'Shoulders': 'Shoulders',
        'Traps': 'Upper Back',
        'Triceps': 'Upper Arms',
        'Upper Back': 'Upper Back'
      };
      
      // Create a set of all required body parts for loading
      const bodyPartsToLoad = new Set<string>();
      
      // Get unique body parts from all exercises
      previousExercises.forEach(exercise => {
        if (exercise.bodyPart && categoryToBodyPartMap[exercise.bodyPart]) {
          bodyPartsToLoad.add(categoryToBodyPartMap[exercise.bodyPart]);
        }
      });
      
      // Load all exercises for these body parts
      if (bodyPartsToLoad.size > 0) {
        const allExercises = await loadExercisesFromJson(Array.from(bodyPartsToLoad), true, false);
        
        // Filter to include only Musco exercises
        const muscoExercises = allExercises.filter(ex => 
          ex.videoUrl?.includes('musco-dc111.firebasestorage.app') || 
          (ex.isOriginal === false) ||
          ex.id?.startsWith('m_') || 
          ex.videoUrl?.includes('/musco/') ||
          ex.id?.includes('musco')
        );
        
        // Group them by category for easier access
        const exercisesByCategory: Record<string, Exercise[]> = {};
        
        muscoExercises.forEach(exercise => {
          if (exercise.bodyPart) {
            if (!exercisesByCategory[exercise.bodyPart]) {
              exercisesByCategory[exercise.bodyPart] = [];
            }
            exercisesByCategory[exercise.bodyPart].push(exercise);
          }
        });
        
        setAlternativeExercises(exercisesByCategory);
      }
      
      setLoadingAlternatives(false);
    };
    
    loadAllAlternatives();
  }, [previousExercises]);

  // Default handler for adding exercises
  const handleAddExercise = (category: string, exercise?: Exercise) => {
    if (exercise) {
      const exerciseId = exercise.id || exercise.exerciseId || exercise.name;
      console.log(`Adding exercise: ${exercise.name} to category: ${category}`);
      
      // Check if this exercise is already used as a replacement
      const isAlreadyReplacement = Object.values(replacementMap).some(ex => {
        const replacementId = ex.id || ex.exerciseId || ex.name;
        return replacementId === exerciseId;
      });
      
      if (isAlreadyReplacement) {
        console.log(`Cannot add exercise: ${exercise.name} because it's already used as a replacement`);
        alert(`This exercise is already being used as a replacement for another exercise. Please remove the replacement first if you want to add it as a new exercise.`);
        return;
      }
      
      // Add to local state
      setAddedExercises(prev => [...prev, exercise as ExtendedExercise]);
      
      // Add to used alternatives to prevent using it as a replacement elsewhere
      setUsedAlternativeIds(prev => {
        const newSet = new Set(prev);
        newSet.add(exerciseId);
        return newSet;
      });
      
      // Call parent handler if available
      if (onAddExercise) {
        onAddExercise(category, exercise);
      }
    } else {
      console.log(`Opening exercise selection for category: ${category}`);
    }
  };

  // Find an available alternative exercise
  const findAvailableAlternative = (exercise: Exercise): Exercise | null => {
    if (!exercise.alternatives || exercise.alternatives.length === 0) {
      return null;
    }
    
    // Get the category's exercises
    const category = exercise.bodyPart || 'Other';
    const categoryExercises = alternativeExercises[category] || [];
    
    if (categoryExercises.length === 0) {
      return null;
    }
    
    // Create a set of existing exercise IDs
    const existingIds = new Set<string>();
    previousExercises.forEach(ex => {
      existingIds.add(ex.id || ex.exerciseId || ex.name);
    });
    addedExercises.forEach(ex => {
      existingIds.add(ex.id || ex.exerciseId || ex.name);
    });
    
    // Find an alternative that's not already in the list and not already used as a replacement
    for (const alternativeId of exercise.alternatives) {
      // Skip if this alternative is already used as a replacement for another exercise
      if (usedAlternativeIds.has(alternativeId)) {
        continue;
      }
      
      // Don't use if it's been removed or already exists
      if (removedExercises.includes(alternativeId) || existingIds.has(alternativeId)) {
        continue;
      }
      
      // Find the alternative exercise
      const alternative = categoryExercises.find(ex => {
        const exId = ex.id || ex.exerciseId || ex.name;
        return exId === alternativeId;
      });
      
      if (alternative) {
        return alternative;
      }
    }
    
    return null;
  };

  const handleReplaceExercise = (exerciseId: string) => {
    // First check if this is a newly added exercise
    const isAddedExercise = addedExercises.some(
      ex => (ex.id || ex.exerciseId || ex.name) === exerciseId
    );

    if (isAddedExercise) {
      // Don't allow replacing newly added exercises - just show a message
      console.log(`Cannot replace a newly added exercise: ${exerciseId}`);
      alert('You cannot replace an exercise you just added. Remove it instead if needed.');
      return;
    }
    
    // Find the original exercise
    const exercise = previousExercises.find(ex => {
      const exId = ex.id || ex.exerciseId || ex.name;
      return exId === exerciseId;
    });
    
    if (!exercise) {
      console.error(`Cannot find exercise with ID: ${exerciseId}`);
      return;
    }
    
    // Try to find an available alternative
    const alternative = findAvailableAlternative(exercise);
    
    if (alternative) {
      const alternativeId = alternative.id || alternative.exerciseId || alternative.name;
      
      // Check if this alternative has already been added as a new exercise
      const isAlreadyAdded = addedExercises.some(ex => {
        const addedId = ex.id || ex.exerciseId || ex.name;
        return addedId === alternativeId;
      });
      
      if (isAlreadyAdded) {
        console.log(`Cannot use ${alternative.name} as replacement because it's already added as a new exercise`);
        alert(`Cannot use this exercise as a replacement because you've already added it as a new exercise. Please try another alternative or remove the added exercise first.`);
        return;
      }
      
      console.log(`Replacing ${exercise.name} with ${alternative.name}`);
      
      // Add the exercise to the replacedExercises list
      if (!replacedExercises.includes(exerciseId)) {
        setReplacedExercises(prev => [...prev, exerciseId]);
      }
      
      // Update the replacement map
      setReplacementMap(prev => ({
        ...prev,
        [exerciseId]: {
          ...alternative,
          isReplacement: true,
          replacingExerciseId: exerciseId
        } as ExtendedExercise
      }));
      
      // Mark this alternative as used
      setUsedAlternativeIds(prev => {
        const newSet = new Set(prev);
        newSet.add(alternativeId);
        return newSet;
      });
      
      // If exercise was previously removed, un-remove it
      if (removedExercises.includes(exerciseId)) {
        setRemovedExercises(prev => prev.filter(id => id !== exerciseId));
      }
    } else {
      // No alternatives available
      console.log(`No available alternatives for: ${exercise.name}`);
      alert(`No available alternatives for this exercise: ${exercise.name}`);
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    // First check if this is a newly added exercise by looking it up in the addedExercises array
    const isAddedExercise = addedExercises.some(
      ex => (ex.id || ex.exerciseId || ex.name) === exerciseId
    );

    if (isAddedExercise) {
      // If it's a newly added exercise, just remove it from the addedExercises array
      setAddedExercises(prev => prev.filter(
        ex => (ex.id || ex.exerciseId || ex.name) !== exerciseId
      ));
      console.log(`Removed newly added exercise: ${exerciseId}`);
    } else {
      // Check if this is a replacement exercise
      const isReplacementExercise = Object.values(replacementMap).some(
        ex => (ex.id || ex.exerciseId || ex.name) === exerciseId
      );
      
      if (isReplacementExercise) {
        // Find the original exercise ID this was replacing
        const originalId = Object.entries(replacementMap).find(
          ([_, ex]) => (ex.id || ex.exerciseId || ex.name) === exerciseId
        )?.[0];
        
        if (originalId) {
          // Remove the replacement exercise from used alternatives
          setUsedAlternativeIds(prev => {
            const newSet = new Set(prev);
            newSet.delete(exerciseId);
            return newSet;
          });
          
          // Remove from replaced exercises
          setReplacedExercises(prev => prev.filter(id => id !== originalId));
          
          // Remove from replacement map
          setReplacementMap(prev => {
            const newMap = {...prev};
            delete newMap[originalId];
            return newMap;
          });
          
          // Add the original exercise to the removed list
          if (!removedExercises.includes(originalId)) {
            setRemovedExercises(prev => [...prev, originalId]);
            console.log(`Removed original exercise: ${originalId} after removing its replacement: ${exerciseId}`);
          }
        }
      } else {
        // If it's an original exercise, mark it for removal
        if (!removedExercises.includes(exerciseId)) {
          setRemovedExercises(prev => [...prev, exerciseId]);
        }
        
        // If exercise was previously replaced, un-replace it
        if (replacedExercises.includes(exerciseId)) {
          // If this was replaced, we need to free up the alternative that was used
          const replacementExercise = replacementMap[exerciseId];
          if (replacementExercise) {
            const replacementId = replacementExercise.id || replacementExercise.exerciseId || replacementExercise.name;
            
            // Remove from used alternatives set
            setUsedAlternativeIds(prev => {
              const newSet = new Set(prev);
              newSet.delete(replacementId);
              return newSet;
            });
          }
          
          setReplacedExercises(prev => prev.filter(id => id !== exerciseId));
          
          // Also remove from replacement map
          setReplacementMap(prev => {
            const newMap = {...prev};
            delete newMap[exerciseId];
            return newMap;
          });
        }
      }
    }
  };

  // Revert a replacement back to the original exercise
  const handleRevertReplacement = (originalExerciseId: string) => {
    // Get the exercise that was used as a replacement
    const replacementExercise = replacementMap[originalExerciseId];
    if (replacementExercise) {
      // Get its ID
      const replacementId = replacementExercise.id || replacementExercise.exerciseId || replacementExercise.name;
      
      // Remove it from the used alternatives
      setUsedAlternativeIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(replacementId);
        return newSet;
      });
    }
    
    // Remove the exercise from the replacedExercises list
    setReplacedExercises(prev => prev.filter(id => id !== originalExerciseId));
    
    // Remove the replacement from the replacement map
    setReplacementMap(prev => {
      const newMap = {...prev};
      delete newMap[originalExerciseId];
      return newMap;
    });
    
    console.log(`Reverted replacement for exercise: ${originalExerciseId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        preferredExercises: [],
        removedExercises: removedExercises,
        replacedExercises: replacedExercises,
        addedExercises: addedExercises
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if an exercise has available alternatives
  const hasAvailableAlternatives = (exerciseId: string): boolean => {
    // Find the original exercise
    const exercise = previousExercises.find(ex => {
      const exId = ex.id || ex.exerciseId || ex.name;
      return exId === exerciseId;
    });
    
    // If exercise not found or has no alternatives, return false
    if (!exercise || !exercise.alternatives || exercise.alternatives.length === 0) {
      return false;
    }
    
    // Check if at least one alternative is available
    return findAvailableAlternative(exercise) !== null;
  };

  // If it's not the feedback day, render the Coming Soon card
  if (!isFeedbackDay) {
    const formattedDate = nextWeekDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });

    return (
      <div className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 p-8">
        <div className="flex flex-col items-center justify-center text-center space-y-4">
          <svg
            className="w-12 h-12 text-indigo-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-app-title text-white">Coming Soon</h3>
          <p className="text-gray-300">
            Your next week&apos;s program will be available on {formattedDate}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative pb-20 pt-8 px-4">
      <div className="space-y-6">
        <div className="text-center mb-8">
          <h3 className="text-app-title text-white">
            Your Previous Exercises
          </h3>
          <p className="text-gray-300 mt-2">
            Browse through exercises from your previous workout program. Use the buttons to mark exercises for replacement or removal.
          </p>
        </div>

        {/* Exercise List */}
        <ExerciseFeedbackSelector
          exercises={previousExercises}
          title="Exercises from Your Previous Program"
          description="Filter by body part to find specific exercises. Click the buttons to mark exercises for replacement or removal."
          onReplaceExercise={handleReplaceExercise}
          onRemoveExercise={handleRemoveExercise}
          onRevertReplacement={handleRevertReplacement}
          onAddExercise={handleAddExercise}
          addedExercises={addedExercises}
          removedExercises={removedExercises}
          replacedExercises={replacedExercises}
          replacementMap={replacementMap}
          hasAlternatives={hasAvailableAlternatives}
          loadingAlternatives={loadingAlternatives}
        />
      </div>

      {/* Fixed Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-gray-800/95 backdrop-blur-sm border-t border-gray-700/50 shadow-lg">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 rounded-xl bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors duration-200"
          >
            Back
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleSubmit(e);
            }}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Generating Program...
              </>
            ) : (
              "Generate Next Week's Program"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
