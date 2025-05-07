'use client';

import { useState, useEffect, useRef, ComponentType, RefAttributes } from 'react';
import { Exercise } from '@/app/types/program';
import { exerciseFiles, loadExercisesFromJson } from '@/app/services/exerciseProgramService';
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet';
import type { BottomSheetProps } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import ExerciseCard from './ExerciseCard';

interface ExerciseSelectionBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
  onSelectExercise: (exercise: Exercise) => void;
  existingExercises?: Exercise[];
}

// Use BottomSheet directly with proper typing
const BottomSheetBase = BottomSheet as ComponentType<
  BottomSheetProps & RefAttributes<BottomSheetRef>
>;

// Map between our display categories and bodyParts used in loadExercisesFromJson
const categoryToBodyPartMap: Record<string, string> = {
  'Abs': 'Abdomen',
  'Cardio': 'Cardio',
  'Chest': 'Chest',
  'Forearms': 'Forearms',
  'Glutes': 'Glutes',
  'Upper Legs': 'Upper Legs',
  'Lower Legs': 'Lower Legs',
  'Lower Back': 'Lower Back',
  'Shoulders': 'Shoulders',
  'Upper Arms': 'Upper Arms',
  'Upper Back': 'Upper Back'
};

// A mapping to handle legacy category names
const legacyCategoryMap: Record<string, string> = {
  'Hamstrings': 'Upper Legs',
  'Quads': 'Upper Legs',
  'Obliques': 'Abs',
  'Biceps': 'Upper Arms',
  'Triceps': 'Upper Arms',
  'Lats': 'Upper Back',
  'Traps': 'Upper Back',
  'Core': 'Abs',
  'Calves': 'Lower Legs'
};

export default function ExerciseSelectionBottomSheet({
  isOpen,
  onClose,
  category,
  onSelectExercise,
  existingExercises = [],
}: ExerciseSelectionBottomSheetProps) {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const sheetRef = useRef<BottomSheetRef>(null);

  // Load exercises for the specific category
  useEffect(() => {
    const loadCategoryExercises = async () => {
      try {
        setIsLoading(true);
        
        // Check if this is a legacy category that needs to be mapped
        const effectiveCategory = legacyCategoryMap[category] || category;
        
        // Get the bodyPart that corresponds to this category for loading
        const bodyPart = categoryToBodyPartMap[effectiveCategory];
        console.log(`Looking for exercises for category: ${category}, effective category: ${effectiveCategory}, mapped to body part: ${bodyPart}`);
        
        if (!bodyPart) {
          console.error(`No mapping found for category: ${category}`);
          setExercises([]);
          setIsLoading(false);
          return;
        }
        
        // Load all exercises for this body part
        // For Lower Legs, also search for Calves to ensure we find all relevant exercises
        const searchBodyParts = [bodyPart];
        if (bodyPart === 'Lower Legs') {
          console.log('Adding "Calves" to search terms for Lower Legs exercises');
          searchBodyParts.push('Calves');
        }
        
        const allExercises = await loadExercisesFromJson(searchBodyParts, true, false);
        console.log(`Loaded ${allExercises.length} exercises for body part: ${bodyPart}`);
        
        // Filter to include only Musco exercises
        const muscoExercises = allExercises.filter(ex => 
          ex.videoUrl?.includes('musco-dc111.firebasestorage.app') || 
          (ex.isOriginal === false) ||
          ex.id?.startsWith('m_') || 
          ex.videoUrl?.includes('/musco/') ||
          ex.id?.includes('musco')
        );
        
        console.log(`Filtered to ${muscoExercises.length} Musco exercises`);
        
        // Further filter to match the exact category and exclude existing exercises
        const categoryExercises = muscoExercises.filter(ex => {
          const exerciseId = ex.id || ex.exerciseId || ex.name;

          // First check if exercise already exists in the list
          const alreadyExists = existingExercises.some(existingEx => {
            const existingId = existingEx.id || existingEx.exerciseId || existingEx.name;
            return existingId === exerciseId || existingEx.name === ex.name;
          });

          // Skip if the exercise already exists
          if (alreadyExists) {
            return false;
          }

          // Then check if it belongs to the target category
          // Check ID patterns
          if (ex.id) {
            if ((category === 'Abs' || category === 'Core') && (ex.id.startsWith('abs-') || ex.id.includes('abs') || ex.id.includes('core'))) return true;
            if ((category === 'Upper Arms' || category === 'Biceps') && (ex.id.startsWith('biceps-') || ex.id.includes('biceps'))) return true;
            if ((category === 'Upper Arms' || category === 'Triceps') && (ex.id.startsWith('triceps-') || ex.id.includes('triceps'))) return true;
            if (category === 'Shoulders' && (ex.id.startsWith('shoulders-') || ex.id.includes('shoulder'))) return true;
            if ((category === 'Abs' || category === 'Obliques') && (ex.id.startsWith('obliques-') || ex.id.includes('obliques'))) return true;
            if (category === 'Glutes' && (ex.id.startsWith('glutes-') || ex.id.includes('glutes'))) return true;
            if ((category === 'Upper Legs' || category === 'Hamstrings') && (ex.id.startsWith('hamstrings-') || ex.id.includes('hamstrings'))) return true;
            if ((category === 'Upper Legs' || category === 'Quads') && (ex.id.startsWith('quads-') || ex.id.includes('quads'))) return true;
            if ((category === 'Lower Legs' || category === 'Calves') && (ex.id.startsWith('calves-') || ex.id.includes('calves'))) return true;
            if (category === 'Chest' && (ex.id.startsWith('chest-') || ex.id.includes('chest'))) return true;
            if (category === 'Forearms' && (ex.id.startsWith('forearms-') || ex.id.includes('forearm'))) return true;
            if ((category === 'Upper Back' || category === 'Lats') && (ex.id.startsWith('lats-') || ex.id.includes('lats'))) return true;
            if ((category === 'Upper Back' || category === 'Traps') && (ex.id.startsWith('traps-') || ex.id.includes('traps'))) return true;
            if (category === 'Upper Back' && (ex.id.startsWith('upper-back-') || ex.id.includes('upper_back') || ex.id.includes('upper-back'))) return true;
            if (category === 'Lower Back' && (ex.id.startsWith('lower-back-') || ex.id.includes('lower_back') || ex.id.includes('lower-back'))) return true;
            if (category === 'Cardio' && (ex.id.startsWith('cardio-') || ex.id.includes('cardio'))) return true;
          }
          
          // Check muscles array
          if (ex.muscles?.length) {
            if ((category === 'Abs' || category === 'Core') && (ex.muscles.includes('Abs') || ex.muscles.includes('Core'))) return true;
            if ((category === 'Upper Arms' || category === 'Biceps') && ex.muscles.includes('Biceps')) return true;
            if ((category === 'Upper Arms' || category === 'Triceps') && ex.muscles.includes('Triceps')) return true;
            if (category === 'Shoulders' && ex.muscles.includes('Shoulders')) return true;
            if ((category === 'Abs' || category === 'Obliques') && ex.muscles.includes('Obliques')) return true;
            if (category === 'Glutes' && ex.muscles.includes('Glutes')) return true;
            if ((category === 'Upper Legs' || category === 'Hamstrings') && ex.muscles.includes('Hamstrings')) return true;
            if ((category === 'Upper Legs' || category === 'Quads') && ex.muscles.includes('Quads')) return true;
            if ((category === 'Lower Legs' || category === 'Calves') && ex.muscles.includes('Calves')) return true;
            if (category === 'Chest' && ex.muscles.includes('Chest')) return true;
            if (category === 'Forearms' && ex.muscles.includes('Forearms')) return true;
            if ((category === 'Upper Back' || category === 'Lats') && ex.muscles.includes('Lats')) return true;
            if ((category === 'Upper Back' || category === 'Traps') && ex.muscles.includes('Traps')) return true;
            if (category === 'Upper Back' && ex.muscles.includes('Upper Back')) return true;
            if (category === 'Lower Back' && ex.muscles.includes('Lower Back')) return true;
          }
          
          // Check targetBodyParts array
          if (ex.targetBodyParts?.length) {
            if ((category === 'Abs' || category === 'Core') && (ex.targetBodyParts.includes('Abs') || ex.targetBodyParts.includes('Core'))) return true;
            if ((category === 'Upper Arms' || category === 'Biceps') && ex.targetBodyParts.includes('Biceps')) return true;
            if ((category === 'Upper Arms' || category === 'Triceps') && ex.targetBodyParts.includes('Triceps')) return true;
            if (category === 'Shoulders' && ex.targetBodyParts.includes('Shoulders')) return true;
            if ((category === 'Abs' || category === 'Obliques') && ex.targetBodyParts.includes('Obliques')) return true;
            if (category === 'Glutes' && ex.targetBodyParts.includes('Glutes')) return true;
            if ((category === 'Upper Legs' || category === 'Hamstrings') && ex.targetBodyParts.includes('Hamstrings')) return true;
            if ((category === 'Upper Legs' || category === 'Quads') && ex.targetBodyParts.includes('Quads')) return true;
            if ((category === 'Lower Legs' || category === 'Calves') && ex.targetBodyParts.includes('Calves')) return true;
            if (category === 'Chest' && ex.targetBodyParts.includes('Chest')) return true;
            if (category === 'Forearms' && ex.targetBodyParts.includes('Forearms')) return true;
            if ((category === 'Upper Back' || category === 'Lats') && ex.targetBodyParts.includes('Lats')) return true;
            if ((category === 'Upper Back' || category === 'Traps') && ex.targetBodyParts.includes('Traps')) return true;
            if (category === 'Upper Back' && ex.targetBodyParts.includes('Upper Back')) return true;
            if (category === 'Lower Back' && ex.targetBodyParts.includes('Lower Back')) return true;
            if (category === 'Cardio' && ex.targetBodyParts.includes('Cardio')) return true;
          }
          
          // Check bodyPart string
          if (ex.bodyPart) {
            if (category === ex.bodyPart) return true;
          }
          
          return false;
        });
        
        console.log(`Further filtered to ${categoryExercises.length} exercises specific to ${category}`);
        setExercises(categoryExercises);
      } catch (error) {
        console.error('Failed to load exercises for category:', category, error);
        setExercises([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isOpen) {
      loadCategoryExercises();
    }
  }, [isOpen, category, existingExercises]);

  // Filter exercises based on search query
  const filteredExercises = exercises.filter(ex => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      ex.name?.toLowerCase().includes(query) ||
      ex.bodyPart?.toLowerCase().includes(query) ||
      ex.targetBodyParts?.some(part => part.toLowerCase().includes(query))
    );
  });

  return (
    <BottomSheetBase
      open={isOpen}
      onDismiss={onClose}
      ref={sheetRef}
      snapPoints={({ maxHeight }) => [maxHeight * 0.9]}
      defaultSnap={({ maxHeight }) => maxHeight * 0.9}
      expandOnContentDrag={false}
      className="z-50 !bg-gray-900"
      header={
        <div className="px-4 pt-4 pb-2 !bg-gray-900 border-b border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-white">Select {category} Exercise</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search input */}
          <div className="relative w-full mb-4">
            <input
              type="search"
              className="w-full p-3 pl-10 text-sm text-white border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={`Search ${category} exercises...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>
      }
    >
      <div className="px-4 py-4 !bg-gray-900 min-h-[300px]">
        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredExercises.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">
              {searchQuery 
                ? `No ${category} exercises found matching "${searchQuery}"` 
                : `No ${category} exercises available`
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.id || exercise.name}
                className="bg-gray-800/70 rounded-lg p-4 cursor-pointer hover:bg-gray-800 transition-colors"
                onClick={() => onSelectExercise(exercise)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-white font-medium">{exercise.name}</h4>
                    {exercise.targetBodyParts && exercise.targetBodyParts.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {Array.isArray(exercise.targetBodyParts) 
                          ? exercise.targetBodyParts.map(part => (
                              <span key={part} className="inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                                {part}
                              </span>
                            ))
                          : <span className="inline-block px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded">
                              {exercise.targetBodyParts}
                            </span>
                        }
                      </div>
                    )}
                  </div>
                  <svg className="w-6 h-6 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BottomSheetBase>
  );
} 