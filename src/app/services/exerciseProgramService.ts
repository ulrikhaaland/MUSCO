import { Exercise, ExerciseProgram } from '@/app/types/program';

// Helper function to fetch JSON data
const fetchJson = async (url: string): Promise<{ exercises: Exercise[] }> => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      // Don't log error if file just not found (404), common for optional musco files
      if (response.status !== 404) {
        console.error(
          `Failed to fetch ${url}: ${response.status} ${response.statusText}`
        );
      }
      return { exercises: [] }; // Return empty structure on fetch error
    }
    // Assuming the JSON file's top-level structure is { exercises: [...] }
    const data = await response.json();
    // Ensure data has the exercises property, even if empty
    return data && Array.isArray(data.exercises) ? data : { exercises: [] };
  } catch (error) {
    console.error(`Error fetching or parsing ${url}:`, error);
    return { exercises: [] }; // Return empty structure on other errors
  }
};

// Map of body parts to their JSON file paths (using fetch)
const exerciseFiles: Record<
  string,
  () => Promise<{ default: { exercises: Exercise[] } }>
> = {
  Shoulders: async () => {
    // First try to load only musco data
    const muscoData = await fetchJson(
      '/data/exercises/musco/json2/m_shoulders.json'
    );
    const muscoExercises = muscoData.exercises || [];

    // Create a map of all musco exercises by ID for quick lookup
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  'Upper Arms': async () => {
    // Load only musco data
    const [muscoBiceps, muscoTriceps] = await Promise.all([
        fetchJson('/data/exercises/musco/json2/m_biceps.json'),
        fetchJson('/data/exercises/musco/json2/m_triceps.json'),
    ]);
    const muscoExercises = [
      ...(muscoBiceps.exercises || []),
      ...(muscoTriceps.exercises || []),
    ];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  Forearms: async () => {
    // Load only musco data
    const muscoData = await fetchJson(
      '/data/exercises/musco/json2/m_forearms.json'
    );
    const muscoExercises = muscoData.exercises || [];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  Chest: async () => {
    // Load only musco data
    const muscoData = await fetchJson(
      '/data/exercises/musco/json2/m_chest.json'
    );
    const muscoExercises = muscoData.exercises || [];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  Abdomen: async () => {
    // Load only musco data
    const [muscoAbs, muscoObliques] = await Promise.all([
      fetchJson('/data/exercises/musco/json2/m_abs.json'),
      fetchJson('/data/exercises/musco/json2/m_obliques.json'),
    ]);
    const muscoExercises = [
      ...(muscoAbs.exercises || []),
      ...(muscoObliques.exercises || []),
    ];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  'Upper Back': async () => {
    // Load only musco data
    const [muscoUpperBack, muscoLats, muscoTraps] = await Promise.all([
      fetchJson('/data/exercises/musco/json2/m_upper-back.json'),
      fetchJson('/data/exercises/musco/json2/m_lats.json'),
      fetchJson('/data/exercises/musco/json2/m_traps.json'),
    ]);
     const muscoExercises = [
       ...(muscoUpperBack.exercises || []),
       ...(muscoLats.exercises || []),
      ...(muscoTraps.exercises || []),
    ];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  'Lower Back': async () => {
    // Load only musco data
    const muscoData = await fetchJson(
      '/data/exercises/musco/json2/m_lower-back.json'
    );
    console.log(`Lower Back file result:`, 
      muscoData ? `Found data structure` : 'No data', 
      `Exercises array length: ${muscoData?.exercises?.length || 0}`
    );
    
    if (muscoData?.exercises?.length === 0) {
      console.log('The m_lower-back.json file exists but contains no exercises or has wrong format');
    }
    
    const muscoExercises = muscoData.exercises || [];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  Glutes: async () => {
    // Load only musco data
    const muscoData = await fetchJson(
      '/data/exercises/musco/json2/m_glutes.json'
    );
    const muscoExercises = muscoData.exercises || [];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  'Upper Legs': async () => {
    // Load only musco data
    const [
      muscoQuads,
      muscoHamstrings,
      muscoHipFlexors,
      muscoAdductors,
      muscoAbductors,
    ] = await Promise.all([
      fetchJson('/data/exercises/musco/json2/m_quads.json'),
      fetchJson('/data/exercises/musco/json2/m_hamstrings.json'),
      fetchJson('/data/exercises/musco/json2/m_hip_flexors.json'),
      fetchJson('/data/exercises/musco/json2/m_adductors.json'),
      fetchJson('/data/exercises/musco/json2/m_abductors.json'),
    ]);

    // Combine musco exercises, ensuring arrays exist
    const muscoExercises = [
      ...(muscoQuads.exercises || []),
      ...(muscoHamstrings.exercises || []),
      ...(muscoHipFlexors.exercises || []),
      ...(muscoAdductors.exercises || []),
      ...(muscoAbductors.exercises || []),
    ];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  'Lower Legs': async () => {
    // Load only musco data
    const muscoData = await fetchJson(
      '/data/exercises/musco/json2/m_calves.json'
    );
    const muscoExercises = muscoData.exercises || [];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
};

// Cache for loaded exercises
const exerciseCache: Record<string, Exercise> = {};

// Map to track file paths for original exercises
const originalExerciseFiles: Record<string, string> = {
  shoulders: '/data/exercises/json/shoulders.json',
  biceps: '/data/exercises/json/biceps.json',
  triceps: '/data/exercises/json/triceps.json',
  forearms: '/data/exercises/json/forearms.json',
  chest: '/data/exercises/json/chest.json',
  abs: '/data/exercises/json/abs.json',
  obliques: '/data/exercises/json/obliques.json',
  upper_back: '/data/exercises/json/upper_back.json',
  lats: '/data/exercises/json/lats.json',
  traps: '/data/exercises/json/traps.json',
  lower_back: '/data/exercises/json/lower_back.json',
  glutes: '/data/exercises/json/glutes.json',
  quads: '/data/exercises/json/quads.json',
  hamstrings: '/data/exercises/json/hamstrings.json',
  hip_flexors: '/data/exercises/json/hip_flexors.json',
  adductors: '/data/exercises/json/adductors.json',
  abductors: '/data/exercises/json/abductors.json',
  calves: '/data/exercises/json/calves.json',
};

/**
 * Loads fallback exercises from original json files for specific IDs
 */
async function loadFallbackExercises(missingIds: Set<string>): Promise<void> {
  if (missingIds.size === 0) return;
  
  console.log(`Loading ${missingIds.size} fallback exercises from original files...`);

  // Group missing IDs by their prefix to determine which files to load
  const idsByPrefix: Record<string, string[]> = {};
  missingIds.forEach((id) => {
    // Handle special cases with hyphens in the prefix
    let prefix;
    if (id.startsWith('lower-back')) {
      prefix = 'lower_back';
    } else if (id.startsWith('upper-back')) {
      prefix = 'upper_back';
    } else if (id.startsWith('hip-flexors') || id.startsWith('hip_flexors')) {
      prefix = 'hip_flexors';
    } else {
      // Standard case: extract prefix (e.g., 'shoulders', 'biceps', etc.)
      prefix = id.split('-')[0];
    }
    
    if (!idsByPrefix[prefix]) idsByPrefix[prefix] = [];
    idsByPrefix[prefix].push(id);
  });

  // Load exercises from each needed file
  for (const [prefix, ids] of Object.entries(idsByPrefix)) {
    const filePath = originalExerciseFiles[prefix];
    if (!filePath) {
      console.log(`No file mapping found for prefix: ${prefix}`);
      continue; // Skip if we don't have a mapping for this prefix
    }

    console.log(`Loading ${ids.length} missing exercises with prefix '${prefix}' from ${filePath}`);
    
    try {
      const { exercises = [] } = await fetchJson(filePath);
      
      let foundCount = 0;
      
      // Find the exercises with matching IDs and add them to cache
      exercises.forEach((exercise: Exercise) => {
        if (exercise.id && missingIds.has(exercise.id)) {
          // Mark as original exercise
          exerciseCache[exercise.id] = {
            ...exercise,
            isOriginal: true
          };
          
          foundCount++;

          // Also cache by exerciseId if available
          if (exercise.exerciseId) {
            exerciseCache[exercise.exerciseId] = {
              ...exercise,
              isOriginal: true
            };
          }
        }
      });
      
      console.log(`Found ${foundCount} of ${ids.length} missing exercises in ${filePath}`);
    } catch (error) {
      console.error(
        `Error loading fallback exercises from ${filePath}:`,
        error
      );
    }
  }
}

/**
 * Loads exercises from JSON files fetched from public directory
 * Prioritizes musco exercises and only loads non-musco as fallback when needed
 * @param bodyParts Array of body part names to load
 * @param includeOriginals When true, loads original exercises too (needed for toggle feature)
 * @param onlyLoadMissingOriginals When true, only loads original exercises that weren't found in Musco files
 */
async function loadExercisesFromJson(
  bodyParts: string[],
  includeOriginals: boolean = true,
  onlyLoadMissingOriginals: boolean = false
): Promise<Exercise[]> {
  const exercises: Exercise[] = [];

  console.log(`Loading exercises for ${bodyParts.join(', ')}, includeOriginals: ${includeOriginals}, onlyLoadMissingOriginals: ${onlyLoadMissingOriginals}`);

  // First pass: load all musco exercises
  for (const bodyPart of bodyParts) {
    const loader = exerciseFiles[bodyPart];
    if (loader) {
      try {
        const {
          default: { exercises: exerciseData },
        } = await loader();
        console.log(`Loaded ${exerciseData.length} Musco exercises for ${bodyPart}`);
        
        const processedExercises = exerciseData.map((data) => ({
          ...data,
          bodyPart: data.targetBodyParts?.[0],
          isOriginal: false, // Mark explicitly as non-original (Musco)
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

  // If requested, load original exercises too for the toggle feature
  // But if onlyLoadMissingOriginals is true, we'll handle them later
  if (includeOriginals && !onlyLoadMissingOriginals) {
    console.log('Loading original exercises...');
    
    // Create a mapping from body part names to original exercise file paths
    const bodyPartToOriginalFiles: Record<string, string[]> = {
      'Shoulders': [originalExerciseFiles.shoulders],
      'Upper Arms': [originalExerciseFiles.biceps, originalExerciseFiles.triceps],
      'Forearms': [originalExerciseFiles.forearms],
      'Chest': [originalExerciseFiles.chest],
      'Abdomen': [originalExerciseFiles.abs, originalExerciseFiles.obliques],
      'Upper Back': [originalExerciseFiles.upper_back, originalExerciseFiles.lats, originalExerciseFiles.traps],
      'Lower Back': [originalExerciseFiles.lower_back],
      'Glutes': [originalExerciseFiles.glutes],
      'Upper Legs': [
        originalExerciseFiles.quads,
        originalExerciseFiles.hamstrings,
        originalExerciseFiles.hip_flexors,
        originalExerciseFiles.adductors,
        originalExerciseFiles.abductors
      ],
      'Lower Legs': [originalExerciseFiles.calves]
    };

    // Load original exercises for each requested body part
    for (const bodyPart of bodyParts) {
      const filePaths = bodyPartToOriginalFiles[bodyPart] || [];
      console.log(`Loading original exercises for ${bodyPart} from ${filePaths.length} files`);
      
      for (const filePath of filePaths) {
        if (!filePath) continue;
        
        try {
          const { exercises: originalExercises = [] } = await fetchJson(filePath);
          console.log(`Loaded ${originalExercises.length} original exercises from ${filePath}`);
          
          const processedExercises = originalExercises.map((data: Exercise) => ({
            ...data,
            bodyPart: data.targetBodyParts?.[0],
            isOriginal: true, // Mark as original for filtering
          }));
          exercises.push(...processedExercises);
          
          // Cache these too
          processedExercises.forEach((exercise: Exercise) => {
            if (exercise.id && !exerciseCache[exercise.id]) {
              exerciseCache[exercise.id] = exercise;
            }
            if (exercise.exerciseId && !exerciseCache[exercise.exerciseId]) {
              exerciseCache[exercise.exerciseId] = exercise;
            }
          });
        } catch (error) {
          // Ignore 404 errors for original files
          if (!(error instanceof Response && error.status === 404)) {
            console.error(`Error loading original exercises from ${filePath}:`, error);
          }
        }
      }
    }
  }
   
  const muscoCount = exercises.filter(ex => ex.isOriginal === false).length;
  const originalCount = exercises.filter(ex => ex.isOriginal === true).length;
  const untaggedCount = exercises.length - muscoCount - originalCount;
  
  console.log(`Loaded ${exercises.length} total exercises: ${muscoCount} Musco, ${originalCount} original, ${untaggedCount} untagged`);

  return exercises;
}

/**
 * Enriches exercises in a program with complete data from the exercise repository
 */
export const enrichExercisesWithFullData = async (
  program: ExerciseProgram
): Promise<void> => {
  if (!program.program) return;

  // First, collect all unique target areas from the program
  const targetAreas = new Set<string>();
  const missingIds = new Set<string>(); // Track exercise IDs not found in musco files

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

  // Collect all unique body parts from exercise IDs and track missing IDs
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

  // Load all musco exercises for the target areas
  // For enrichment, we only want the musco exercises and potentially missing fallbacks
  await loadExercisesFromJson(Array.from(targetAreas), true, true);

  // Check which IDs are still missing after loading musco exercises
  for (const week of program.program) {
    for (const day of week.days) {
      if (day.exercises) {
        day.exercises.forEach((exercise) => {
          const exerciseId = exercise.id || exercise.exerciseId;
          if (exerciseId && !exerciseCache[exerciseId]) {
            missingIds.add(exerciseId);
            console.log(`Missing exercise ID: ${exerciseId}`);
          }
        });
      }
    }
  }

  // If we have missing IDs, load the fallback exercises
  if (missingIds.size > 0) {
    console.log(
      `Found ${missingIds.size} missing exercise IDs, loading fallback exercises`
    );
    await loadFallbackExercises(missingIds);
  }

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

export { exerciseFiles, loadExercisesFromJson };
