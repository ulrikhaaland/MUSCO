import { Exercise, ExerciseProgram } from '@/app/types/program';

// Helper function to fetch JSON data
const fetchJson = async (url: string, useNorwegian: boolean = false): Promise<{ exercises: Exercise[] }> => {
  // If Norwegian is requested, modify the URL to use the Norwegian folder
  if (useNorwegian) {
    url = url.replace('/json2/', '/json2_no/');
  }
  
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
const exerciseFiles = (useNorwegian: boolean = false): Record<
  string,
  () => Promise<{ default: { exercises: Exercise[] } }>
> => ({
  Shoulders: async () => {
    // First try to load only musco data
    const muscoData = await fetchJson(
      '/data/exercises/musco/json2/m_shoulders.json',
      useNorwegian
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
      fetchJson('/data/exercises/musco/json2/m_biceps.json', useNorwegian),
      fetchJson('/data/exercises/musco/json2/m_triceps.json', useNorwegian),
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
      '/data/exercises/musco/json2/m_forearms.json',
      useNorwegian
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
      '/data/exercises/musco/json2/m_chest.json',
      useNorwegian
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
      fetchJson('/data/exercises/musco/json2/m_abs.json', useNorwegian),
      fetchJson('/data/exercises/musco/json2/m_obliques.json', useNorwegian),
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
      fetchJson('/data/exercises/musco/json2/m_upper-back.json', useNorwegian),
      fetchJson('/data/exercises/musco/json2/m_lats.json', useNorwegian),
      fetchJson('/data/exercises/musco/json2/m_traps.json', useNorwegian),
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
      '/data/exercises/musco/json2/m_lower-back.json',
      useNorwegian
    );

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
      '/data/exercises/musco/json2/m_glutes.json',
      useNorwegian
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
    const [muscoQuads, muscoHamstrings] = await Promise.all([
      fetchJson('/data/exercises/musco/json2/m_quads.json', useNorwegian),
      fetchJson('/data/exercises/musco/json2/m_hamstrings.json', useNorwegian),
    ]);

    // Combine musco exercises, ensuring arrays exist
    const muscoExercises = [
      ...(muscoQuads.exercises || []),
      ...(muscoHamstrings.exercises || []),
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
      '/data/exercises/musco/json2/m_calves.json',
      useNorwegian
    );
    const muscoExercises = muscoData.exercises || [];

    // Create a map of all musco exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    muscoExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  Warmup: async () => {
    // Load warmup exercises
    const warmupData = await fetchJson(
      '/data/exercises/musco/json2/warmups.json',
      useNorwegian
    );
    const warmupExercises = warmupData.exercises || [];

    // Create a map of all warmup exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    warmupExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
  Cardio: async () => {
    // Load cardio exercises
    const cardioData = await fetchJson(
      '/data/exercises/musco/json2/cardio.json',
      useNorwegian
    );
    const cardioExercises = cardioData.exercises || [];

    // Create a map of all cardio exercises by ID
    const exerciseMap = new Map<string, Exercise>();
    cardioExercises.forEach((exercise) => {
      if (exercise.id) exerciseMap.set(exercise.id, exercise);
    });

    return { default: { exercises: Array.from(exerciseMap.values()) } };
  },
});

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
  // No original files for cardio exercises
};

/**
 * Loads fallback exercises from original json files for specific IDs
 */
async function loadFallbackExercises(missingIds: Set<string>, useNorwegian: boolean = false): Promise<void> {
  if (missingIds.size === 0) return;

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
      continue; // Skip if we don't have a mapping for this prefix
    }

    try {
      const { exercises = [] } = await fetchJson(filePath, useNorwegian);

      let foundCount = 0;

      // Find the exercises with matching IDs and add them to cache
      exercises.forEach((exercise: Exercise) => {
        if (exercise.id && missingIds.has(exercise.id)) {
          // Mark as original exercise
          exerciseCache[exercise.id] = {
            ...exercise,
            isOriginal: true,
          };

          foundCount++;

          // Also cache by exerciseId if available
          if (exercise.exerciseId) {
            exerciseCache[exercise.exerciseId] = {
              ...exercise,
              isOriginal: true,
            };
          }
        }
      });
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
 * @param useNorwegian When true, loads Norwegian exercise data
 */
async function loadExercisesFromJson(
  bodyParts: string[],
  includeOriginals: boolean = true,
  onlyLoadMissingOriginals: boolean = false,
  useNorwegian: boolean = false
): Promise<Exercise[]> {
  const exercises: Exercise[] = [];
  const exerciseFilesMap = exerciseFiles(useNorwegian);

  // First pass: load all musco exercises
  for (const bodyPart of bodyParts) {
    const loader = exerciseFilesMap[bodyPart];
    if (loader) {
      try {
        const {
          default: { exercises: exerciseData },
        } = await loader();

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
    // Create a mapping from body part names to original exercise file paths
    const bodyPartToOriginalFiles: Record<string, string[]> = {
      Shoulders: [originalExerciseFiles.shoulders],
      'Upper Arms': [
        originalExerciseFiles.biceps,
        originalExerciseFiles.triceps,
      ],
      Forearms: [originalExerciseFiles.forearms],
      Chest: [originalExerciseFiles.chest],
      Abdomen: [originalExerciseFiles.abs, originalExerciseFiles.obliques],
      'Upper Back': [
        originalExerciseFiles.upper_back,
        originalExerciseFiles.lats,
        originalExerciseFiles.traps,
      ],
      'Lower Back': [originalExerciseFiles.lower_back],
      Glutes: [originalExerciseFiles.glutes],
      'Upper Legs': [
        originalExerciseFiles.quads,
        originalExerciseFiles.hamstrings,
        originalExerciseFiles.hip_flexors,
        originalExerciseFiles.adductors,
        originalExerciseFiles.abductors,
      ],
      'Lower Legs': [originalExerciseFiles.calves],
      // No original files for Cardio or Warmup
    };

    // Load original exercises for each requested body part
    for (const bodyPart of bodyParts) {
      const filePaths = bodyPartToOriginalFiles[bodyPart] || [];

      for (const filePath of filePaths) {
        if (!filePath) continue;

        try {
          const { exercises: originalExercises = [] } =
            await fetchJson(filePath, useNorwegian);

          const processedExercises = originalExercises.map(
            (data: Exercise) => ({
              ...data,
              bodyPart: data.targetBodyParts?.[0],
              isOriginal: true, // Mark as original for filtering
            })
          );
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
            console.error(
              `Error loading original exercises from ${filePath}:`,
              error
            );
          }
        }
      }
    }
  }

  return exercises;
}

/**
 * Enriches exercises in a program with complete data from the exercise repository
 * @param program The exercise program to enrich
 * @param useNorwegian When true, loads Norwegian exercise data
 */
export const enrichExercisesWithFullData = async (
  program: ExerciseProgram,
  useNorwegian: boolean = false
): Promise<void> => {
  if (!program.days) return;

  // First, collect all unique target areas from the program
  const targetAreas = new Set<string>();
  const missingIds = new Set<string>(); // Track exercise IDs not found in musco files

  // Map lowercase body part names to their proper cased version from exerciseFiles
  const bodyPartMapping: Record<string, string> = {};
  Object.keys(exerciseFiles(useNorwegian)).forEach((key) => {
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

    if (prefix === 'cardio') {
      return 'Cardio';
    }

    // If we can't directly map it, check if any exerciseFiles key contains this prefix
    for (const bodyPart of Object.keys(exerciseFiles(useNorwegian))) {
      if (bodyPart.toLowerCase().includes(prefix)) {
        return bodyPart;
      }
    }

    // As a last resort, try to match it to an exerciseFiles key by checking case-insensitive
    const bodyPartKey = Object.keys(exerciseFiles(useNorwegian)).find(
      (key) => key.toLowerCase() === prefix
    );

    return bodyPartKey || null;
  };

  // Collect all unique body parts from exercise IDs and track missing IDs
  for (const day of program.days) {
    if (day.exercises) {
      day.exercises.forEach((exercise) => {
        // Check for either id or exerciseId
        const exerciseIdentifier = exercise.id || exercise.exerciseId;
        if (exerciseIdentifier) {
          const bodyPart = extractBodyPartFromId(exerciseIdentifier);
          if (bodyPart && Object.keys(exerciseFiles(useNorwegian)).includes(bodyPart)) {
            targetAreas.add(bodyPart);
          }
        }
      });
    }
  }

  // Load all musco exercises for the target areas
  // For enrichment, we only want the musco exercises and potentially missing fallbacks
  await loadExercisesFromJson(Array.from(targetAreas), true, true, useNorwegian);

  // Check which IDs are still missing after loading musco exercises
  for (const day of program.days) {
    if (day.exercises) {
      day.exercises.forEach((exercise) => {
        const exerciseId = exercise.id || exercise.exerciseId;
        if (exerciseId && !exerciseCache[exerciseId]) {
          missingIds.add(exerciseId);
        }
      });
    }
  }

  // If we have missing IDs, load the fallback exercises
  if (missingIds.size > 0) {
    await loadFallbackExercises(missingIds, useNorwegian);
  }

  // Now enrich the exercises using the loaded cache
  for (const day of program.days) {
    if (day.exercises) {
      const enrichedExercises = await Promise.all(
        day.exercises.map(async (exercise) => {
            // Check if exercise can be found by either id or exerciseId
            const exerciseId = exercise.id || exercise.exerciseId;

            if (exerciseId && exerciseCache[exerciseId]) {
              const fullData = exerciseCache[exerciseId];
              // Check if this is a cardio exercise by ID prefix
              const isCardioExercise = exerciseId.startsWith('cardio-');

              return {
                ...fullData,
                ...exercise,
                // Ensure we preserve the program's sets, reps, and duration rather than using template defaults
                // For cardio exercises, we ALWAYS want to keep the duration from the LLM response
                sets: exercise.sets || fullData.sets,
                repetitions: exercise.repetitions || fullData.repetitions,
                // For cardio exercises, prioritize the duration from the LLM response
                duration: isCardioExercise
                  ? exercise.duration
                  : exercise.duration || fullData.duration,
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
                // Check if this is a cardio exercise by ID or name
                const isCardioExercise =
                  (exercise.id && exercise.id.startsWith('cardio-')) ||
                  (matchByName.id && matchByName.id.startsWith('cardio-')) ||
                  exercise.name.toLowerCase().includes('cardio');

                return {
                  ...matchByName,
                  ...exercise,
                  // Ensure we preserve the program's sets, reps, and duration rather than using template defaults
                  sets: exercise.sets || matchByName.sets,
                  repetitions: exercise.repetitions || matchByName.repetitions,
                  // For cardio exercises, prioritize the duration from the LLM response
                  duration: isCardioExercise
                    ? exercise.duration
                    : exercise.duration || matchByName.duration,
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
};

export { exerciseFiles, loadExercisesFromJson };
