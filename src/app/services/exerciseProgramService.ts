import { fetchExercisesForBodyParts } from './exerciseTemplateService';
import { Exercise, ExerciseProgram } from '@/app/types/program';
import { ExerciseQuestionnaireAnswers } from '@/app/shared/types';

// Map of body parts to their JSON file paths
const exerciseFiles: Record<
  string,
  () => Promise<{ default: { exercises: Exercise[] } }>
> = {
  Shoulders: async () => {
    // Load both sources and combine them
    const muscoExercises: Exercise[] = [];
    try {
      const muscoData = await import('@/app/data/exercises/musco/json2/m_shoulders.json');
      // Use exercises directly without mapping since they have the same structure
      muscoExercises.push(...muscoData.default.exercises);
    } catch (error) {
      // Silently continue if musco file not found
    }

    // Always load original data
    const originalData = await import('@/app/data/exercises/json/shoulders.json');
    const originalExercises = originalData.default.exercises;

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  'Upper Arms': async () => {
    const muscoExercises: Exercise[] = [];
    try {
      const muscoBiceps = await import('@/app/data/exercises/musco/json2/m_biceps.json').catch(() => ({ default: { exercises: [] } }));
      const muscoTriceps = await import('@/app/data/exercises/musco/json2/m_triceps.json').catch(() => ({ default: { exercises: [] } }));
      
      // Use exercises directly without mapping
      muscoExercises.push(...muscoBiceps.default.exercises, ...muscoTriceps.default.exercises);
    } catch (error) {
      // Silently continue if musco files not found
    }

    // Always load original data
    const [biceps, triceps] = await Promise.all([
      import('@/app/data/exercises/json/biceps.json'),
      import('@/app/data/exercises/json/triceps.json'),
    ]);
    const originalExercises = [...biceps.default.exercises, ...triceps.default.exercises];

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  Forearms: async () => {
    const muscoExercises: Exercise[] = [];
    try {
      const muscoData = await import('@/app/data/exercises/musco/json2/m_forearms.json');
      // Use exercises directly without mapping
      muscoExercises.push(...muscoData.default.exercises);
    } catch (error) {
      // Silently continue if musco file not found
    }

    // Always load original data
    const originalData = await import('@/app/data/exercises/json/forearms.json');
    const originalExercises = originalData.default.exercises;

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  Chest: async () => {
    const muscoExercises: Exercise[] = [];
    try {
      const muscoData = await import('@/app/data/exercises/musco/json2/m_chest.json');
      // Use exercises directly without mapping
      muscoExercises.push(...muscoData.default.exercises);
    } catch (error) {
      // Silently continue if musco file not found
    }

    // Always load original data
    const originalData = await import('@/app/data/exercises/json/chest.json');
    const originalExercises = originalData.default.exercises;

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  Abdomen: async () => {
    const muscoExercises: Exercise[] = [];
    try {
      const muscoAbs = await import('@/app/data/exercises/musco/json2/m_abs.json').catch(() => ({ default: { exercises: [] } }));
      const muscoObliques = await import('@/app/data/exercises/musco/json2/m_obliques.json').catch(() => ({ default: { exercises: [] } }));
      
      // Use exercises directly without mapping
      muscoExercises.push(...muscoAbs.default.exercises, ...muscoObliques.default.exercises);
    } catch (error) {
      // Silently continue if musco files not found
    }

    // Always load original data
    const [abs, obliques] = await Promise.all([
      import('@/app/data/exercises/json/abs.json'),
      import('@/app/data/exercises/json/obliques.json'),
    ]);
    const originalExercises = [...abs.default.exercises, ...obliques.default.exercises];

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  'Upper Back': async () => {
    const muscoExercises: Exercise[] = [];
    try {
      const muscoUpperBack = await import('@/app/data/exercises/musco/json2/m_upper-back.json').catch(() => ({ default: { exercises: [] } }));
      const muscoLats = await import('@/app/data/exercises/musco/json2/m_lats.json').catch(() => ({ default: { exercises: [] } }));
      const muscoTraps = await import('@/app/data/exercises/musco/json2/m_traps.json').catch(() => ({ default: { exercises: [] } }));
      
      // Use exercises directly without mapping
      muscoExercises.push(
        ...muscoUpperBack.default.exercises, 
        ...muscoLats.default.exercises, 
        ...muscoTraps.default.exercises
      );
    } catch (error) {
      // Silently continue if musco files not found
    }

    // Always load original data
    const [upperBack, lats, traps] = await Promise.all([
      import('@/app/data/exercises/json/upper_back.json'),
      import('@/app/data/exercises/json/lats.json'),
      import('@/app/data/exercises/json/traps.json'),
    ]);
    const originalExercises = [...upperBack.default.exercises, ...lats.default.exercises, ...traps.default.exercises];

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  'Lower Back': async () => {
    const muscoExercises: Exercise[] = [];
    try {
      const muscoData = await import('@/app/data/exercises/musco/json2/m_lower-back.json');
      // Use exercises directly without mapping
      muscoExercises.push(...muscoData.default.exercises);
    } catch (error) {
      // Silently continue if musco file not found
    }

    // Always load original data
    const originalData = await import('@/app/data/exercises/json/lower_back.json');
    const originalExercises = originalData.default.exercises;

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  Glutes: async () => {
    const muscoExercises: Exercise[] = [];
    try {
      const muscoData = await import('@/app/data/exercises/musco/json2/m_glutes.json');
      // Use exercises directly without mapping
      muscoExercises.push(...muscoData.default.exercises);
    } catch (error) {
      // Silently continue if musco file not found
    }

    // Always load original data
    const originalData = await import('@/app/data/exercises/json/glutes.json');
    const originalExercises = originalData.default.exercises;

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  'Upper Legs': async () => {
    const muscoExercises: Exercise[] = [];
    try {
      // Safely import each file, using empty exercises array if import fails
      const safeImport = async (path: string) => {
        try {
          return await import(path);
        } catch {
          return { default: { exercises: [] } };
        }
      };
      
      const muscoQuads = await safeImport('@/app/data/exercises/musco/json2/m_quads.json');
      const muscoHamstrings = await safeImport('@/app/data/exercises/musco/json2/m_hamstrings.json');
      const muscoHipFlexors = await safeImport('@/app/data/exercises/musco/json2/m_hip_flexors.json');
      const muscoAdductors = await safeImport('@/app/data/exercises/musco/json2/m_adductors.json');
      const muscoAbductors = await safeImport('@/app/data/exercises/musco/json2/m_abductors.json');
      
      // Use exercises directly without mapping
      muscoExercises.push(
        ...muscoQuads.default.exercises,
        ...muscoHamstrings.default.exercises,
        ...muscoHipFlexors.default.exercises,
        ...muscoAdductors.default.exercises,
        ...muscoAbductors.default.exercises
      );
    } catch (error) {
      // Silently continue if musco files not found
    }

    // Always load original data
    const [quads, hamstrings, hipFlexors, adductors, abductors] = await Promise.all([
      import('@/app/data/exercises/json/quads.json'),
      import('@/app/data/exercises/json/hamstrings.json'),
      import('@/app/data/exercises/json/hip_flexors.json'),
      import('@/app/data/exercises/json/adductors.json'),
      import('@/app/data/exercises/json/abductors.json'),
    ]);
    const originalExercises = [
      ...quads.default.exercises,
      ...hamstrings.default.exercises,
      ...hipFlexors.default.exercises,
      ...adductors.default.exercises,
      ...abductors.default.exercises
    ];

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
  'Lower Legs': async () => {
    const muscoExercises: Exercise[] = [];
    try {
      const muscoData = await import('@/app/data/exercises/musco/json2/m_calves.json');
      // Use exercises directly without mapping
      muscoExercises.push(...muscoData.default.exercises);
    } catch (error) {
      // Silently continue if musco file not found
    }

    // Always load original data
    const originalData = await import('@/app/data/exercises/json/calves.json');
    const originalExercises = originalData.default.exercises;

    // Combine exercises, avoiding duplicates by ID
    const exerciseMap = new Map<string, Exercise>();
    
    // Add musco exercises first (they take priority)
    muscoExercises.forEach(exercise => {
      if (exercise.id) {
        exerciseMap.set(exercise.id, exercise);
      }
    });
    
    // Add original exercises that don't conflict with musco ones
    originalExercises.forEach(exercise => {
      if (exercise.id && !exerciseMap.has(exercise.id)) {
        exerciseMap.set(exercise.id, exercise);
      }
    });

    return {
      default: {
        exercises: Array.from(exerciseMap.values()),
      },
    };
  },
};

// Cache for loaded exercises
const exerciseCache: Record<string, Exercise> = {};

/**
 * Loads exercises from local JSON files
 */
async function loadExercisesFromJson(bodyParts: string[]): Promise<Exercise[]> {
  const exercises: Exercise[] = [];

  for (const bodyPart of bodyParts) {
    const loader = exerciseFiles[bodyPart];
    if (loader) {
      try {
        const {
          default: { exercises: exerciseData },
        } = await loader();
        const processedExercises = exerciseData.map((data) => ({
          ...data,
          bodyPart: data.targetBodyParts?.[0],
        }));
        exercises.push(...processedExercises);

        // Cache exercises by ID - handle both id and exerciseId properties
        processedExercises.forEach((exercise) => {
          if (exercise.id) {
            exerciseCache[exercise.id] = exercise;
          }
          // Also cache using exerciseId if available
          if (exercise.exerciseId) {
            exerciseCache[exercise.exerciseId] = exercise;
          }
        });
      } catch (error) {
        console.error(`Error loading exercises for ${bodyPart}:`, error);
      }
    }
  }

  return exercises;
}

// Since we'll be deleting exercises.ts, we'll create a temporary interface for types returned by fetchExercisesForBodyParts
interface TemplateExercise {
  id?: string;
  name?: string;
  description?: string;
  targetBodyParts?: string[];
  exerciseType?: string | string[];
  difficulty?: string;
  equipment?: string[];
  steps?: string[];
  imageUrl?: string;
  videoUrl?: string;
  tips?: string[];
  contraindications?: string[];
  alternatives?: string[];
  muscles?: string[];
  duration?: number;
  repetitions?: number;
  sets?: number;
  restBetweenSets?: number;
  viewCount?: number;
  popularity?: string;
  forceType?: string;
  mechanics?: string;
}

/**
 * Prepares exercise data to be sent to the LLM for program generation
 * @param bodyParts Array of target body parts for the program
 * @param userInfo Optional user information for filtering exercises
 * @returns A formatted string containing exercises for the LLM to choose from
 */
export const prepareExercisesForLLM = async (
  bodyParts: string[],
  userInfo?: ExerciseQuestionnaireAnswers
): Promise<string> => {
  try {
    // Determine filters based on user information
    const filters: {
      equipment?: string[];
      difficulty?: string[];
      maxExercisesPerBodyPart?: number;
      exerciseType?: string[];
    } = {
      maxExercisesPerBodyPart: 15, // Default to 15 exercises per body part
    };

    // Apply user-specific filters if available
    if (userInfo) {
      // Filter by available equipment
      if (userInfo.equipment && userInfo.equipment.length > 0) {
        filters.equipment = userInfo.equipment;
      }

      // Filter by experience level/difficulty
      if (userInfo.experienceLevel) {
        switch (userInfo.experienceLevel.toLowerCase()) {
          case 'beginner':
            filters.difficulty = ['beginner'];
            break;
          case 'intermediate':
            filters.difficulty = ['beginner', 'intermediate'];
            break;
          case 'advanced':
            filters.difficulty = ['intermediate', 'advanced'];
            break;
          default:
            // Include all difficulty levels
            break;
        }
      }

      // Adjust max exercises based on weekly frequency to ensure variety
      if (userInfo.weeklyFrequency) {
        const frequency = parseInt(userInfo.weeklyFrequency);
        if (frequency <= 2) {
          filters.maxExercisesPerBodyPart = 10; // Fewer options for less frequent training
        } else if (frequency >= 5) {
          filters.maxExercisesPerBodyPart = 20; // More options for frequent training
        }
      }
    }

    // Fetch exercises for the specified body parts with filters
    const templateExercises = await fetchExercisesForBodyParts(
      bodyParts,
      filters
    );

    // Group exercises by body part
    const exercisesByBodyPart: Record<string, Exercise[]> = {};

    for (const templateExercise of templateExercises) {
      const exercise =
        convertTemplateExerciseToProgramExercise(templateExercise);
      for (const bodyPart of exercise.targetBodyParts || []) {
        if (!exercisesByBodyPart[bodyPart]) {
          exercisesByBodyPart[bodyPart] = [];
        }
        exercisesByBodyPart[bodyPart].push(exercise);
      }
    }

    // Format the exercises for the LLM - using a more concise format
    let exercisePrompt = 'AVAILABLE EXERCISES BY BODY PART:\n\n';

    for (const bodyPart of Object.keys(exercisesByBodyPart)) {
      exercisePrompt += `${bodyPart.toUpperCase()}:\n`;

      // Sort exercises by type for better organization
      const exercisesByType: Record<string, Exercise[]> = {};
      exercisesByBodyPart[bodyPart].forEach((exercise) => {
        const types = Array.isArray(exercise.exerciseType)
          ? exercise.exerciseType
          : [exercise.exerciseType];

        for (const type of types) {
          if (!type) continue;
          const formattedType = formatExerciseType(type);
          if (!exercisesByType[formattedType]) {
            exercisesByType[formattedType] = [];
          }
          exercisesByType[formattedType].push(exercise);
        }
      });

      // Add exercises by type with minimal but essential information
      for (const type of Object.keys(exercisesByType)) {
        exercisePrompt += `\n${formatExerciseType(type)} EXERCISES:\n`;

        // Sort exercises by popularity and view count within each type
        const sortedExercises = [...exercisesByType[type]].sort((a, b) => {
          // First sort by popularity
          const popularityOrder = { high: 3, medium: 2, low: 1, unknown: 0 };
          const popA =
            popularityOrder[
              (a.popularity || 'unknown') as keyof typeof popularityOrder
            ];
          const popB =
            popularityOrder[
              (b.popularity || 'unknown') as keyof typeof popularityOrder
            ];

          if (popB !== popA) return popB - popA;

          // Then by view count
          return (b.viewCount || 0) - (a.viewCount || 0);
        });

        sortedExercises.forEach((exercise, index) => {
          // More concise format to reduce token count while preserving essential info
          const popularityLabel = exercise.popularity
            ? `[Popularity: ${exercise.popularity.toUpperCase()}]`
            : '';

          exercisePrompt += `${index + 1}. ${exercise.name} (${
            exercise.id || exercise.exerciseId
          }) ${popularityLabel}: ${exercise.description.substring(0, 100)}${
            exercise.description.length > 100 ? '...' : ''
          }\n`;
        });

        exercisePrompt += '\n';
      }
    }

    // Add a section with detailed information about selected exercises
    exercisePrompt += '\nDETAILED EXERCISE INFORMATION (Reference by ID):\n\n';

    // Create a set of unique exercise IDs
    const uniqueExercises = new Set<Exercise>();
    Object.values(exercisesByBodyPart).forEach((exerciseList) => {
      exerciseList.forEach((exercise) => uniqueExercises.add(exercise));
    });

    // Sort detailed exercises by popularity for emphasis
    const sortedDetailedExercises = Array.from(uniqueExercises).sort((a, b) => {
      const popularityOrder = { high: 3, medium: 2, low: 1, unknown: 0 };
      const popA =
        popularityOrder[
          (a.popularity || 'unknown') as keyof typeof popularityOrder
        ];
      const popB =
        popularityOrder[
          (b.popularity || 'unknown') as keyof typeof popularityOrder
        ];

      if (popB !== popA) return popB - popA;

      return (b.viewCount || 0) - (a.viewCount || 0);
    });

    // Add detailed information for each unique exercise
    sortedDetailedExercises.forEach((exercise) => {
      const exerciseId = exercise.id || exercise.exerciseId;
      if (!exerciseId) return;

      const popularityInfo = exercise.popularity
        ? `Popularity: ${exercise.popularity.toUpperCase()}`
        : '';
      const viewCountInfo = exercise.viewCount
        ? `Views: ${exercise.viewCount.toLocaleString()}`
        : '';

      exercisePrompt += `ID: ${exerciseId}\n`;
      exercisePrompt += `Name: ${exercise.name}\n`;
      if (popularityInfo || viewCountInfo) {
        exercisePrompt += `${popularityInfo}${
          popularityInfo && viewCountInfo ? ' | ' : ''
        }${viewCountInfo}\n`;
      }
      exercisePrompt += `Description: ${exercise.description.substring(
        0,
        150
      )}...\n`; // Truncate long descriptions
      exercisePrompt += `Muscles: ${exercise.muscles.join(', ')}\n`;

      // Only include contraindications if they exist
      if (exercise.contraindications && exercise.contraindications.length > 0) {
        exercisePrompt += `Contraindications: ${exercise.contraindications.join(
          ', '
        )}\n`;
      }

      exercisePrompt += '\n';
    });

    // Add a reminder about prioritizing popular exercises
    exercisePrompt +=
      'IMPORTANT: When creating the exercise program, prioritize exercises with HIGH and MEDIUM popularity ratings as they are more familiar to users and have better instructional resources available. Only use LOW popularity exercises when they specifically address unique user needs.\n\n';

    return exercisePrompt;
  } catch (error) {
    console.error('Error preparing exercises for LLM:', error);
    throw error;
  }
};

/**
 * Helper function to format exercise type name
 * @param type The exercise type
 * @returns A formatted type name
 */
const formatExerciseType = (type: string): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

/**
 * Converts a template exercise to a program exercise
 */
const convertTemplateExerciseToProgramExercise = (
  templateExercise: TemplateExercise
): Exercise => {
  return {
    name: templateExercise.name,
    description: templateExercise.description,
    sets: templateExercise.sets,
    repetitions: templateExercise.repetitions,
    rest: templateExercise.restBetweenSets,
    videoUrl: templateExercise.videoUrl,
    duration: templateExercise.duration,
    imageUrl: templateExercise.imageUrl,
    steps: templateExercise.steps,
    tips: templateExercise.tips,
    contraindications: templateExercise.contraindications,
    muscles: templateExercise.muscles,
    equipment: templateExercise.equipment,
    difficulty: templateExercise.difficulty,
    targetBodyParts: templateExercise.targetBodyParts,
    exerciseType: templateExercise.exerciseType,
    alternatives: templateExercise.alternatives,
    viewCount: templateExercise.viewCount,
    popularity: templateExercise.popularity,
    forceType: templateExercise.forceType,
    mechanics: templateExercise.mechanics,
    id: templateExercise.id,
  };
};

/**
 * Enhances an LLM prompt with exercise template data
 * @param originalPrompt The original prompt for the LLM
 * @param bodyParts Array of target body parts for the program
 * @param userInfo Optional user information for filtering exercises
 * @returns The enhanced prompt with exercise templates
 */
export const enhancePromptWithExerciseTemplates = async (
  originalPrompt: string,
  bodyParts: string[],
  userInfo?: ExerciseQuestionnaireAnswers
): Promise<string> => {
  try {
    // Get formatted exercises with user-specific filtering
    const exerciseTemplateData = await prepareExercisesForLLM(
      bodyParts,
      userInfo
    );

    // Insert the template data into the prompt
    // Look for a marker in the original prompt or append at the end
    if (originalPrompt.includes('{{EXERCISES}}')) {
      return originalPrompt.replace('{{EXERCISES}}', exerciseTemplateData);
    } else {
      return `${originalPrompt}\n\nPlease select exercises from the following list to create the program. Include exercise IDs in your response so they can be properly referenced:\n\n${exerciseTemplateData}`;
    }
  } catch (error) {
    console.error('Error enhancing prompt with exercise templates:', error);
    throw error;
  }
};

/**
 * Enriches exercises in a program with complete data from the exercise repository
 */
export const enrichExercisesWithFullData = async (
  program: ExerciseProgram
): Promise<void> => {
  if (!program.program) return;

  // First, collect all unique target areas from the program
  const targetAreas = new Set<string>();

  // Map lowercase body part names to their proper cased version from exerciseFiles
  const bodyPartMapping: Record<string, string> = {};
  Object.keys(exerciseFiles).forEach((key) => {
    bodyPartMapping[key.toLowerCase()] = key;
  });

  // Helper function to extract body part from ID (e.g., 'biceps-1' -> 'Upper Arms')
  const extractBodyPartFromId = (id: string): string | null => {
    if (!id) return null;

    // Special case for upper-back which contains a hyphen in its prefix
    if (id.startsWith('upper-back-')) {
      return 'Upper Back';
    }

    const prefix = id.split('-')[0].toLowerCase();

    // Map individual muscle files to their parent body parts in exerciseFiles
    if (prefix === 'biceps' || prefix === 'triceps') {
      return 'Upper Arms';
    }

    if (prefix === 'abs' || prefix === 'obliques') {
      return 'Abdomen';
    }

    if (prefix === 'upper_back' || prefix === 'lats' || prefix === 'traps') {
      return 'Upper Back';
    }

    if (
      prefix === 'quads' ||
      prefix === 'hamstrings' ||
      prefix === 'hip_flexors' ||
      prefix === 'adductors' ||
      prefix === 'abductors'
    ) {
      return 'Upper Legs';
    }

    if (prefix === 'calves') {
      return 'Lower Legs';
    }

    if (prefix === 'shoulders') {
      return 'Shoulders';
    }

    if (prefix === 'chest') {
      return 'Chest';
    }

    if (prefix === 'forearms') {
      return 'Forearms';
    }

    if (prefix === 'lower_back') {
      return 'Lower Back';
    }

    if (prefix === 'glutes') {
      return 'Glutes';
    }

    // If we can't directly map it, check if any exerciseFiles key contains this prefix
    for (const bodyPart of Object.keys(exerciseFiles)) {
      if (bodyPart.toLowerCase().includes(prefix)) {
        return bodyPart;
      }
    }

    // As a last resort, try to match it to an exerciseFiles key by checking case-insensitive
    const bodyPartKey = Object.keys(exerciseFiles).find(
      (key) => key.toLowerCase() === prefix
    );

    return bodyPartKey || null;
  };

  // Collect all unique body parts from exercise IDs
  for (const week of program.program) {
    for (const day of week.days) {
      if (day.exercises) {
        day.exercises.forEach((exercise) => {
          // Check for either id or exerciseId
          const exerciseIdentifier = exercise.id || exercise.exerciseId;
          if (exerciseIdentifier) {
            const bodyPart = extractBodyPartFromId(exerciseIdentifier);
            if (bodyPart && Object.keys(exerciseFiles).includes(bodyPart)) {
              targetAreas.add(bodyPart);
            }
          }
        });
      }
    }
  }

  // Load all exercises for the target areas
  await loadExercisesFromJson(Array.from(targetAreas));

  // Now enrich the exercises using the loaded cache
  for (const week of program.program) {
    for (const day of week.days) {
      if (day.exercises) {
        const enrichedExercises = await Promise.all(
          day.exercises.map(async (exercise) => {
            // Check if exercise can be found by either id or exerciseId
            const exerciseId = exercise.id || exercise.exerciseId;

            if (exerciseId && exerciseCache[exerciseId]) {
              const fullData = exerciseCache[exerciseId];
              return {
                ...fullData,
                ...exercise,
                // Ensure we preserve the program's sets, reps, and duration rather than using template defaults
                sets: exercise.sets || fullData.sets,
                repetitions: exercise.repetitions || fullData.repetitions,
                duration: exercise.duration || fullData.duration,
                bodyPart: exercise.bodyPart || fullData.targetBodyParts?.[0],
              };
            }

            // If we don't find the exercise by ID, try harder by looking at name (case-insensitive)
            if (exercise.name) {
              const matchByName = Object.values(exerciseCache).find(
                (cached) =>
                  cached.name?.toLowerCase() === exercise.name?.toLowerCase()
              );

              if (matchByName) {
                return {
                  ...matchByName,
                  ...exercise,
                  // Ensure we preserve the program's sets, reps, and duration rather than using template defaults
                  sets: exercise.sets || matchByName.sets,
                  repetitions: exercise.repetitions || matchByName.repetitions,
                  duration: exercise.duration || matchByName.duration,
                  id: matchByName.id, // Ensure we keep the ID from the cache
                  exerciseId: matchByName.exerciseId, // Also keep exerciseId if available
                  bodyPart:
                    exercise.bodyPart || matchByName.targetBodyParts?.[0],
                };
              }
            }

            // If still not found, return the original with minimal processing
            return {
              ...exercise,
              bodyPart: exercise.targetBodyParts?.[0],
            };
          })
        );
        day.exercises = enrichedExercises;
      }
    }
  }
};
