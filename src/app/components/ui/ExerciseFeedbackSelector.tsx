import React, { useState, useMemo, useEffect } from 'react';
import { Exercise } from '@/app/types/program';
import BodyPartFilter from './BodyPartFilter';
import Chip from './Chip';
import ExerciseSelectionBottomSheet from './ExerciseSelectionBottomSheet';

// Extend the Exercise type to include our custom property
interface ExtendedExercise extends Exercise {
  isNewlyAdded?: boolean;
  isReplacement?: boolean;
  originalExerciseId?: string;
  replacingExerciseId?: string;
  // Position properties
  order?: number;
  dayIndex?: number;
  blockIndex?: number;
  position?: number;
}

interface ExerciseFeedbackSelectorProps {
  exercises: Exercise[];
  title: string;
  description: string;
  onReplaceExercise?: (exerciseId: string) => void;
  onRemoveExercise?: (exerciseId: string) => void;
  onRevertReplacement?: (originalExerciseId: string) => void;
  onAddExercise?: (category: string, exercise: Exercise) => void;
  addedExercises?: Exercise[];
  removedExercises?: string[]; // Array of removed exercise IDs
  replacedExercises?: string[]; // Array of replaced exercise IDs
  replacementMap?: Record<string, Exercise>; // Map of original exercise ID to replacement exercise
  hasAlternatives?: (exerciseId: string) => boolean; // Function to check if an exercise has alternatives
  loadingAlternatives?: boolean; // Flag indicating if alternatives are being loaded
}

export function ExerciseFeedbackSelector({
  exercises,
  title,
  description,
  onReplaceExercise,
  onRemoveExercise,
  onRevertReplacement,
  onAddExercise,
  addedExercises = [],
  removedExercises = [],
  replacedExercises = [],
  replacementMap = {},
  hasAlternatives = () => true, // Default to true if not provided
  loadingAlternatives = false,
}: ExerciseFeedbackSelectorProps) {
  // State to track removed body parts for filtering
  const [removedBodyParts, setRemovedBodyParts] = useState<string[]>([]);
  // State to track expanded categories
  const [expandedCategories, setExpandedCategories] = useState<{ [key: string]: boolean }>({});
  // State for exercise selection bottom sheet
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);

  // Get a unique identifier for each exercise
  const getExerciseId = (exercise: Exercise): string => {
    return exercise.id || exercise.exerciseId || exercise.name;
  };

  // Get all unique body parts from exercises
  const allBodyParts = useMemo(() => {
    const bodyParts = new Set<string>();
    exercises.forEach(exercise => {
      if (exercise.targetBodyParts) {
        if (Array.isArray(exercise.targetBodyParts)) {
          exercise.targetBodyParts.forEach(part => bodyParts.add(part));
        } else {
          bodyParts.add(exercise.targetBodyParts);
        }
      } else if (exercise.bodyPart) {
        bodyParts.add(exercise.bodyPart);
      }
    });
    return Array.from(bodyParts).sort();
  }, [exercises]);

  // Modified to replace exercises with their replacements
  const displayExercises = useMemo(() => {
    // Legacy category mapping
    const legacyCategoryMap: Record<string, string> = {
      'Hamstrings': 'Upper Legs',
      'Quads': 'Upper Legs',
      'Obliques': 'Abs',
      'Biceps': 'Upper Arms',
      'Triceps': 'Upper Arms',
      'Lats': 'Upper Back',
      'Traps': 'Upper Back',
      'Calves': 'Lower Legs',
      'Core': 'Abs'
    };
    
    // First filter out completely removed exercises and exercises that have been replaced
    const filteredExercises = exercises.filter(exercise => {
      const exerciseId = getExerciseId(exercise);
      return !removedExercises.includes(exerciseId) && !replacedExercises.includes(exerciseId);
    });
    
    // Now get all original exercises that have replacements and add the replacement exercises
    const replacementsToAdd = replacedExercises
      .filter(id => replacementMap[id]) // Filter to only include ones with valid replacements
      .map(id => {
        const originalExercise = exercises.find(ex => getExerciseId(ex) === id);
        if (!originalExercise) return null;
        
        // Create the replacement exercise
        const replacement = {
          ...replacementMap[id],
          originalExerciseId: id,
          isReplacement: true
        } as ExtendedExercise;
        
        // Map legacy bodyPart to consolidated category if needed
        if (replacement.bodyPart && legacyCategoryMap[replacement.bodyPart]) {
          replacement.bodyPart = legacyCategoryMap[replacement.bodyPart];
        }
        
        // Copy position properties if they exist
        // Using type assertion to avoid TypeScript errors
        const originalAny = originalExercise as any;
        if ('order' in originalAny) replacement.order = originalAny.order;
        if ('dayIndex' in originalAny) replacement.dayIndex = originalAny.dayIndex;
        if ('blockIndex' in originalAny) replacement.blockIndex = originalAny.blockIndex;
        if ('position' in originalAny) replacement.position = originalAny.position;
        
        return replacement;
      })
      .filter(Boolean) as ExtendedExercise[]; // Filter out any null values
    
    // Convert legacy bodyPart categories to consolidated categories
    const remappedExercises = filteredExercises.map(exercise => {
      const remapped = { ...exercise } as ExtendedExercise;
      if (remapped.bodyPart && legacyCategoryMap[remapped.bodyPart]) {
        remapped.bodyPart = legacyCategoryMap[remapped.bodyPart];
      }
      return remapped;
    });
    
    // Combine filtered original exercises with replacements
    return [...remappedExercises, ...replacementsToAdd];
  }, [exercises, removedExercises, replacedExercises, replacementMap]);

  // Filter exercises based on removed body parts
  const filteredExercises = useMemo(() => {
    if (removedBodyParts.length === 0) return displayExercises;
    
    return displayExercises.filter(exercise => {
      // Check if the exercise has any body parts that are not removed
      if (exercise.targetBodyParts) {
        if (Array.isArray(exercise.targetBodyParts)) {
          // If any target body part is not in the removed list, show the exercise
          return exercise.targetBodyParts.some(part => !removedBodyParts.includes(part));
        } else {
          // If the single target body part is not removed, show the exercise
          return !removedBodyParts.includes(exercise.targetBodyParts);
        }
      } else if (exercise.bodyPart) {
        // If the body part is not removed, show the exercise
        return !removedBodyParts.includes(exercise.bodyPart);
      }
      
      // If the exercise has no body part, always show it
      return true;
    });
  }, [displayExercises, removedBodyParts]);

  // Ensure legacy categories don't appear in the UI
  useEffect(() => {
    // Legacy categories that should be mapped to consolidated categories
    const legacyCategories = [
      'Hamstrings', 'Quads', 'Obliques', 'Biceps', 'Triceps', 
      'Lats', 'Traps', 'Calves', 'Core', 'Other'
    ];
    
    // Force clean up any expanded legacy categories
    const updatedExpandedCategories = { ...expandedCategories };
    let hasChanges = false;
    
    legacyCategories.forEach(legacyCategory => {
      if (updatedExpandedCategories[legacyCategory] !== undefined) {
        delete updatedExpandedCategories[legacyCategory];
        hasChanges = true;
      }
    });
    
    if (hasChanges) {
      setExpandedCategories(updatedExpandedCategories);
    }
  }, [expandedCategories]);

  // Group exercises by body part
  const exercisesByCategory = useMemo(() => {
    const grouped: { [key: string]: ExtendedExercise[] } = {};
    
    // Legacy category mapping for consistency
    const legacyCategoryMap: Record<string, string> = {
      'Hamstrings': 'Upper Legs',
      'Quads': 'Upper Legs',
      'Obliques': 'Abs',
      'Biceps': 'Upper Arms',
      'Triceps': 'Upper Arms',
      'Lats': 'Upper Back',
      'Traps': 'Upper Back',
      'Calves': 'Lower Legs',
      'Core': 'Abs',
      'Other': '' // Map 'Other' to empty string to skip it
    };
    
    // Initialize all expanded categories on first load
    if (Object.keys(expandedCategories).length === 0) {
      const initialExpanded: { [key: string]: boolean } = {};
      allBodyParts.forEach(part => {
        initialExpanded[part] = false; // Start with all categories collapsed
      });
      setExpandedCategories(initialExpanded);
    }
    
    // Group original and replacement exercises by body part
    filteredExercises.forEach(exercise => {
      let category = exercise.bodyPart || '';
      
      // Skip exercises with no category or 'Other' category
      if (!category) return;
      
      // Map legacy categories to consolidated ones
      if (legacyCategoryMap[category]) {
        // If mapped to empty string, skip this exercise
        if (legacyCategoryMap[category] === '') return;
        category = legacyCategoryMap[category];
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      grouped[category].push(exercise as ExtendedExercise);
    });
    
    // Keep track of all exercise IDs already in the grouped object
    const existingExerciseIds = new Set<string>();
    Object.values(grouped).forEach(exercises => {
      exercises.forEach(exercise => {
        existingExerciseIds.add(getExerciseId(exercise));
      });
    });
    
    // Add newly added exercises to their categories, but only if they don't already exist
    addedExercises.forEach(exercise => {
      // Skip if this is a replacement exercise (handled by replacementMap)
      if ((exercise as ExtendedExercise).isReplacement) {
        return;
      }
      
      const exerciseId = getExerciseId(exercise);
      
      // Skip if this exercise ID already exists in the grouped object
      if (existingExerciseIds.has(exerciseId)) {
        return;
      }
      
      let category = exercise.bodyPart || '';
      
      // Skip exercises with no category or 'Other' category
      if (!category) return;
      
      // Map legacy categories to consolidated ones
      if (legacyCategoryMap[category]) {
        // If mapped to empty string, skip this exercise
        if (legacyCategoryMap[category] === '') return;
        category = legacyCategoryMap[category];
      }
      
      if (!grouped[category]) {
        grouped[category] = [];
      }
      
      // Add to the end of the array (bottom of the list)
      grouped[category].push({
        ...exercise,
        isNewlyAdded: true
      } as ExtendedExercise);
      
      // Add to the set of existing IDs to prevent duplicates
      existingExerciseIds.add(exerciseId);
    });
    
    // Sort exercises within each category by name
    Object.keys(grouped).forEach(category => {
      grouped[category].sort((a, b) => {
        // Keep newly added exercises at the bottom
        if (a.isNewlyAdded && !b.isNewlyAdded) return 1;
        if (!a.isNewlyAdded && b.isNewlyAdded) return -1;
        
        // Sort by name otherwise
        return a.name.localeCompare(b.name);
      });
    });
    
    return grouped;
  }, [filteredExercises, allBodyParts, expandedCategories, addedExercises]);

  // Handle body part filter changes
  const handleBodyPartFilterChange = (newRemovedBodyParts: string[]) => {
    setRemovedBodyParts(newRemovedBodyParts);
  };

  // Handle replace button click
  const handleReplaceClick = (exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onReplaceExercise) {
      onReplaceExercise(exerciseId);
    }
  };

  // Handle remove button click
  const handleRemoveClick = (exerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemoveExercise) {
      onRemoveExercise(exerciseId);
    }
  };

  // Handle revert replacement button click
  const handleRevertClick = (originalExerciseId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRevertReplacement) {
      onRevertReplacement(originalExerciseId);
    }
  };

  // Toggle category expanded/collapsed state
  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  // Get all exercise categories
  const allCategories = useMemo(() => {
    // Standard list of all exercise categories
    const standardCategories = [
      'Abs', 'Cardio', 'Chest', 'Forearms', 'Glutes', 
      'Lower Back', 'Lower Legs', 'Shoulders', 'Upper Arms', 'Upper Back', 
      'Upper Legs'
    ];
    
    // Legacy categories that should be mapped to consolidated categories
    const legacyCategories = [
      'Hamstrings', 'Quads', 'Obliques', 'Biceps', 'Triceps', 
      'Lats', 'Traps', 'Calves', 'Core', 'Other'
    ];
    
    // Add any additional categories from exercises that might not be in the standard list
    const categoriesFromExercises = new Set<string>();
    exercises.forEach(exercise => {
      if (exercise.bodyPart) {
        // Skip legacy categories
        if (!legacyCategories.includes(exercise.bodyPart)) {
          categoriesFromExercises.add(exercise.bodyPart);
        }
      }
      // Don't add 'Other' category anymore
    });
    
    addedExercises.forEach(exercise => {
      if (exercise.bodyPart) {
        // Skip legacy categories
        if (!legacyCategories.includes(exercise.bodyPart)) {
          categoriesFromExercises.add(exercise.bodyPart);
        }
      }
      // Don't add 'Other' category anymore
    });
    
    // Combine standard categories with any additional categories found
    const allCats = new Set([...standardCategories, ...categoriesFromExercises]);
    return Array.from(allCats).sort();
  }, [exercises, addedExercises]);

  // Initialize all expanded categories on first load
  useEffect(() => {
    if (Object.keys(expandedCategories).length === 0) {
      const initialExpanded: { [key: string]: boolean } = {};
      allCategories.forEach(category => {
        initialExpanded[category] = false; // Start with all categories collapsed
      });
      setExpandedCategories(initialExpanded);
    }
  }, [allCategories, expandedCategories]);

  // Expand all categories
  const expandAllCategories = () => {
    const expanded: { [key: string]: boolean } = {};
    allCategories.forEach(category => {
      expanded[category] = true;
    });
    setExpandedCategories(expanded);
  };

  // Collapse all categories
  const collapseAllCategories = () => {
    const collapsed: { [key: string]: boolean } = {};
    allCategories.forEach(category => {
      collapsed[category] = false;
    });
    setExpandedCategories(collapsed);
  };

  // Handle opening the bottom sheet for adding exercises
  const handleOpenBottomSheet = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Check if category is valid
    const validCategories = [
      'Abs', 'Cardio', 'Chest', 'Forearms', 'Glutes',
      'Lower Back', 'Lower Legs', 'Shoulders', 'Upper Arms', 'Upper Back',
      'Upper Legs', 'Calves'
    ];
    
    if (!validCategories.includes(category)) {
      console.warn(`Category "${category}" is not supported for exercise selection`);
      alert(`Adding exercises for ${category} is not supported yet.`);
      return;
    }
    
    // Map legacy categories to their consolidated equivalents
    let effectiveCategory = category;
    if (category === 'Quads' || category === 'Hamstrings') {
      console.log(`Mapping legacy category ${category} to Upper Legs for exercise selection`);
      effectiveCategory = 'Upper Legs';
    } else if (category === 'Obliques' || category === 'Core') {
      console.log(`Mapping legacy category ${category} to Abs for exercise selection`);
      effectiveCategory = 'Abs';
    } else if (category === 'Biceps' || category === 'Triceps') {
      console.log(`Mapping legacy category ${category} to Upper Arms for exercise selection`);
      effectiveCategory = 'Upper Arms';
    } else if (category === 'Traps' || category === 'Lats') {
      console.log(`Mapping legacy category ${category} to Upper Back for exercise selection`);
      effectiveCategory = 'Upper Back';
    } else if (category === 'Calves') {
      console.log(`Mapping legacy category Calves to Lower Legs for exercise selection`);
      effectiveCategory = 'Lower Legs';
    }
    
    setSelectedCategory(effectiveCategory);
    setIsBottomSheetOpen(true);
  };

  // Handle exercise selection from bottom sheet
  const handleSelectExercise = (exercise: Exercise) => {
    console.log(`Selected exercise: ${exercise.name} for category: ${selectedCategory}`);
    // Pass the selected exercise to the parent handler
    if (onAddExercise && selectedCategory) {
      onAddExercise(selectedCategory, exercise);
    }
    setIsBottomSheetOpen(false);
  };

  // Handle closing the bottom sheet
  const handleCloseBottomSheet = () => {
    setIsBottomSheetOpen(false);
    setSelectedCategory(null);
  };

  // Get all exercises from both original and added exercises
  const allExistingExercises = useMemo(() => {
    return [...exercises, ...addedExercises];
  }, [exercises, addedExercises]);

  return (
    <div className="bg-gray-800/50 rounded-xl overflow-hidden shadow-lg ring-1 ring-gray-700/50">
      {/* Card Header */}
      <div className="w-full px-8 py-6 flex flex-col gap-2">
        <h4 className="text-white font-medium text-lg">{title}</h4>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>

      {/* Body Part Filter */}
      {allBodyParts.length > 0 && (
        <div className="px-8">
          <BodyPartFilter 
            bodyParts={allBodyParts} 
            onFilterChange={handleBodyPartFilterChange}
            initialRemovedBodyParts={removedBodyParts}
          />
        </div>
      )}

      {/* Expand/Collapse All Controls */}
      <div className="px-8 pt-4 pb-2 flex justify-end space-x-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            expandAllCategories();
          }}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Expand All
        </button>
        <span className="text-gray-500">|</span>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            collapseAllCategories();
          }}
          className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Collapse All
        </button>
      </div>

      {/* Card Content */}
      <div className="px-8 pb-8 space-y-6">
        {filteredExercises.length === 0 && addedExercises.length === 0 ? (
          <div className="bg-gray-900/50 rounded-xl overflow-hidden ring-1 ring-gray-700/30 p-4">
            <p className="text-gray-500 italic">No exercises found with the current filters</p>
          </div>
        ) : (
          allCategories.map(category => (
            <div key={category} className="bg-gray-850/30 rounded-xl overflow-hidden ring-1 ring-gray-700/30">
              {/* Category Header */}
              <button 
                className="w-full p-4 flex items-center justify-between bg-gray-900/70 hover:bg-gray-900/90 transition-colors text-left"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleCategory(category);
                }}
              >
                <div className="flex items-center">
                  <h3 className="text-white font-medium">{category}</h3>
                  <span className="ml-2 text-gray-400 text-sm">
                    ({(exercisesByCategory[category] || []).length} exercises)
                  </span>
                </div>
                <svg
                  className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
                    expandedCategories[category] ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              
              {/* Category Content */}
              {expandedCategories[category] && (
                <div className="grid grid-cols-1 gap-6 p-4">
                  {/* Show exercises if there are any for this category */}
                  {(exercisesByCategory[category] || []).map((exercise) => {
                    const exerciseId = getExerciseId(exercise);
                    const isNewlyAdded = exercise.isNewlyAdded;
                    const isReplacement = (exercise as ExtendedExercise).isReplacement;
                    const originalExerciseId = (exercise as ExtendedExercise).originalExerciseId;
                    
                    // Create unique key for this exercise card
                    const uniqueKey = isReplacement 
                      ? `replacement-${originalExerciseId}-${exerciseId}`
                      : exerciseId;
                    
                    return (
                      <div 
                        key={uniqueKey} 
                        className={`relative group 
                          ${isNewlyAdded ? 'border-l-4 border-green-500 pl-2' : ''}
                          ${isReplacement ? 'border-l-4 border-blue-500 pl-2' : ''}
                        `}
                      >
                        <div className={`p-5 ${
                          isNewlyAdded 
                            ? 'bg-gray-900/70' 
                            : isReplacement
                              ? 'bg-gray-900/60 border border-blue-500/20'
                              : 'bg-gray-900/50'
                          } rounded-xl overflow-hidden ring-1 ring-gray-700/30`}
                        >
                          <div>
                            <div className="flex flex-wrap items-start gap-2 mb-1">
                              <h3 className="font-medium text-white break-words flex-1">
                                {exercise.name}
                                {isNewlyAdded && (
                                  <span className="ml-2 bg-green-500/20 text-green-400 text-xs px-2 py-0.5 rounded">New</span>
                                )}
                                {isReplacement && (
                                  <span className="ml-2 bg-blue-500/20 text-blue-400 text-xs px-2 py-0.5 rounded">Replacement</span>
                                )}
                              </h3>
                              {exercise.bodyPart && (
                                <Chip
                                  size="md"
                                  backgroundColor={exercise.warmup ? 'bg-amber-600' : ''}
                                >
                                  {exercise.bodyPart}
                                </Chip>
                              )}
                            </div>
                            
                            {/* Target body parts */}
                            {(exercise.targetBodyParts && !exercise.bodyPart) && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {Array.isArray(exercise.targetBodyParts) 
                                  ? exercise.targetBodyParts.map(part => (
                                      <Chip key={part} size="sm">{part}</Chip>
                                    ))
                                  : <Chip size="sm">{exercise.targetBodyParts}</Chip>
                                }
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Action buttons - always visible */}
                        <div 
                          className="absolute right-0 top-1/2 transform -translate-y-1/2 flex flex-col gap-2"
                          style={{ right: '-12px' }}
                        >
                          {/* Revert button - only show for replacement exercises */}
                          {isReplacement && originalExerciseId && onRevertReplacement && (
                            <button 
                              onClick={(e) => handleRevertClick(originalExerciseId, e)}
                              className="w-8 h-8 flex items-center justify-center bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
                              title="Revert to original exercise"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                              </svg>
                            </button>
                          )}
                          
                          {/* Replace button - only show if exercise has alternatives */}
                          {!isNewlyAdded && !isReplacement && hasAlternatives(exerciseId) && !loadingAlternatives && (
                            <button 
                              onClick={(e) => handleReplaceClick(exerciseId, e)}
                              className="w-8 h-8 flex items-center justify-center bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
                              title="Replace exercise"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                              </svg>
                            </button>
                          )}
                          
                          {/* Remove button */}
                          <button 
                            onClick={(e) => handleRemoveClick(exerciseId, e)}
                            className="w-8 h-8 flex items-center justify-center bg-red-600 hover:bg-red-500 text-white rounded-full shadow-lg transition-transform duration-200 hover:scale-110"
                            title="Remove exercise"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  
                  {/* Empty state if no exercises */}
                  {(!exercisesByCategory[category] || exercisesByCategory[category].length === 0) && (
                    <div className="p-3 bg-gray-900/30 rounded-xl text-gray-400 text-center italic">
                      No exercises in this category
                    </div>
                  )}
                  
                  {/* Add Exercise Button */}
                  <button
                    onClick={(e) => handleOpenBottomSheet(category, e)}
                    className="w-full p-3 mt-2 bg-gray-900/30 hover:bg-gray-900/50 text-indigo-400 rounded-xl border border-dashed border-gray-700/50 flex items-center justify-center transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add {category} Exercise
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Exercise Selection Bottom Sheet */}
      {isBottomSheetOpen && selectedCategory && (
        <ExerciseSelectionBottomSheet
          isOpen={isBottomSheetOpen}
          onClose={handleCloseBottomSheet}
          category={selectedCategory}
          onSelectExercise={handleSelectExercise}
          existingExercises={allExistingExercises}
        />
      )}
    </div>
  );
} 