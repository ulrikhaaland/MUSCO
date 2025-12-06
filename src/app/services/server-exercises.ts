// This file contains server-only code for loading exercise data
import { promises as fs } from 'fs';
import path from 'path';
import { Exercise } from '@/app/types/program';

// Extend Exercise type to include category property for warmup exercises
interface EnhancedExercise extends Exercise {
  category?: string;
}

// Define options interface for loadServerExercises
export interface LoadExercisesOptions {
  bodyParts: string[];
  includeOriginals?: boolean;
  onlyLoadMissingOriginals?: boolean;
  equipment?: string[];
  includeBodyweightWarmups?: boolean;
  /** When true, loads Norwegian exercise data from json2_no folder */
  useNorwegian?: boolean;
}

/**
 * Load exercise data from JSON files on the server
 * This can only be called from server components or API routes
 */
export async function loadServerExercises(
  options: LoadExercisesOptions
): Promise<Exercise[]> {
  const {
    bodyParts,
    includeOriginals = true,
    onlyLoadMissingOriginals = false,
    equipment,
    includeBodyweightWarmups = false,
    useNorwegian = false,
  } = options;

  const exercises: Exercise[] = [];

  // Use Norwegian folder (json2_no) when useNorwegian is true, otherwise use English (json2)
  const muscoFolder = useNorwegian ? 'json2_no' : 'json2';
  console.log(`[loadServerExercises] useNorwegian=${useNorwegian}, muscoFolder=${muscoFolder}, bodyParts=${bodyParts.join(',')}`);

  // Map of body parts to their JSON file paths
  // When useNorwegian is true, ONLY load from json2_no (Norwegian exercises)
  // When useNorwegian is false, load from both json2 (musco) and json (original English)
  const exerciseFilePaths: Record<string, string[]> = useNorwegian
    ? {
        // Norwegian: Only load from json2_no folder
        Shoulders: [`data/exercises/musco/${muscoFolder}/m_shoulders.json`],
        'Upper Arms': [
          `data/exercises/musco/${muscoFolder}/m_biceps.json`,
          `data/exercises/musco/${muscoFolder}/m_triceps.json`,
        ],
        Forearms: [`data/exercises/musco/${muscoFolder}/m_forearms.json`],
        Chest: [`data/exercises/musco/${muscoFolder}/m_chest.json`],
        Abdomen: [
          `data/exercises/musco/${muscoFolder}/m_abs.json`,
          `data/exercises/musco/${muscoFolder}/m_obliques.json`,
        ],
        'Upper Back': [
          `data/exercises/musco/${muscoFolder}/m_upper-back.json`,
          `data/exercises/musco/${muscoFolder}/m_lats.json`,
          `data/exercises/musco/${muscoFolder}/m_traps.json`,
        ],
        'Lower Back': [`data/exercises/musco/${muscoFolder}/m_lower-back.json`],
        Glutes: [`data/exercises/musco/${muscoFolder}/m_glutes.json`],
        'Upper Legs': [
          `data/exercises/musco/${muscoFolder}/m_quads.json`,
          `data/exercises/musco/${muscoFolder}/m_hamstrings.json`,
        ],
        'Lower Legs': [`data/exercises/musco/${muscoFolder}/m_calves.json`],
        Warmup: [`data/exercises/musco/${muscoFolder}/warmups.json`],
        Cardio: [`data/exercises/musco/${muscoFolder}/cardio.json`],
      }
    : {
        // English: Load from both musco/json2 and original json
        Shoulders: [`data/exercises/musco/${muscoFolder}/m_shoulders.json`, 'data/exercises/json/shoulders.json'],
        'Upper Arms': [
          `data/exercises/musco/${muscoFolder}/m_biceps.json`,
          `data/exercises/musco/${muscoFolder}/m_triceps.json`,
          'data/exercises/json/biceps.json',
          'data/exercises/json/triceps.json',
        ],
        Forearms: [`data/exercises/musco/${muscoFolder}/m_forearms.json`, 'data/exercises/json/forearms.json'],
        Chest: [`data/exercises/musco/${muscoFolder}/m_chest.json`, 'data/exercises/json/chest.json'],
        Abdomen: [
          `data/exercises/musco/${muscoFolder}/m_abs.json`,
          `data/exercises/musco/${muscoFolder}/m_obliques.json`,
          'data/exercises/json/abs.json',
          'data/exercises/json/obliques.json',
        ],
        'Upper Back': [
          `data/exercises/musco/${muscoFolder}/m_upper-back.json`,
          `data/exercises/musco/${muscoFolder}/m_lats.json`,
          `data/exercises/musco/${muscoFolder}/m_traps.json`,
          'data/exercises/json/upper_back.json',
          'data/exercises/json/lats.json',
          'data/exercises/json/traps.json',
        ],
        'Lower Back': [`data/exercises/musco/${muscoFolder}/m_lower-back.json`, 'data/exercises/json/lower_back.json'],
        Glutes: [`data/exercises/musco/${muscoFolder}/m_glutes.json`, 'data/exercises/json/glutes.json'],
        'Upper Legs': [
          `data/exercises/musco/${muscoFolder}/m_quads.json`,
          `data/exercises/musco/${muscoFolder}/m_hamstrings.json`,
          `data/exercises/musco/${muscoFolder}/m_hip_flexors.json`,
          `data/exercises/musco/${muscoFolder}/m_adductors.json`,
          `data/exercises/musco/${muscoFolder}/m_abductors.json`,
          'data/exercises/json/quads.json',
          'data/exercises/json/hamstrings.json',
          'data/exercises/json/hip_flexors.json',
          'data/exercises/json/adductors.json',
          'data/exercises/json/abductors.json',
        ],
        'Lower Legs': [`data/exercises/musco/${muscoFolder}/m_calves.json`, 'data/exercises/json/calves.json'],
        Warmup: [`data/exercises/musco/${muscoFolder}/warmups.json`],
        Cardio: [`data/exercises/musco/${muscoFolder}/cardio.json`],
      };

  // Original exercise files paths
  const originalExerciseFilePaths: Record<string, string> = {
    shoulders: 'data/exercises/json/shoulders.json',
    biceps: 'data/exercises/json/biceps.json',
    triceps: 'data/exercises/json/triceps.json',
    forearms: 'data/exercises/json/forearms.json',
    chest: 'data/exercises/json/chest.json',
    abs: 'data/exercises/json/abs.json',
    obliques: 'data/exercises/json/obliques.json',
    upper_back: 'data/exercises/json/upper_back.json',
    lats: 'data/exercises/json/lats.json',
    traps: 'data/exercises/json/traps.json',
    lower_back: 'data/exercises/json/lower_back.json',
    glutes: 'data/exercises/json/glutes.json',
    quads: 'data/exercises/json/quads.json',
    hamstrings: 'data/exercises/json/hamstrings.json',
    hip_flexors: 'data/exercises/json/hip_flexors.json',
    adductors: 'data/exercises/json/adductors.json',
    abductors: 'data/exercises/json/abductors.json',
    calves: 'data/exercises/json/calves.json',
  };

  // Helper function to read JSON file from filesystem
  const readJsonFile = async (
    filePath: string
  ): Promise<{ exercises: Exercise[] | EnhancedExercise[] }> => {
    try {
      // Convert to absolute path in public directory
      const fullPath = path.join(process.cwd(), 'public', filePath);

      // Read file
      const fileContent = await fs.readFile(fullPath, 'utf-8');
      const data = JSON.parse(fileContent);

      const result = data && Array.isArray(data.exercises) ? data : { exercises: [] };
      console.log(`[readJsonFile] ${filePath} -> ${result.exercises.length} exercises`);
      return result;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        console.error(`[SERVER] Error reading file ${filePath}:`, error);
      } else {
        console.log(`[readJsonFile] ${filePath} -> NOT FOUND`);
      }
      return { exercises: [] };
    }
  };

  // Map to track which body parts to original files
  const bodyPartToOriginalFiles: Record<string, string[]> = {
    Shoulders: [originalExerciseFilePaths.shoulders],
    'Upper Arms': [
      originalExerciseFilePaths.biceps,
      originalExerciseFilePaths.triceps,
    ],
    Forearms: [originalExerciseFilePaths.forearms],
    Chest: [originalExerciseFilePaths.chest],
    Abdomen: [
      originalExerciseFilePaths.abs,
      originalExerciseFilePaths.obliques,
    ],
    'Upper Back': [
      originalExerciseFilePaths.upper_back,
      originalExerciseFilePaths.lats,
      originalExerciseFilePaths.traps,
    ],
    'Lower Back': [originalExerciseFilePaths.lower_back],
    Glutes: [originalExerciseFilePaths.glutes],
    'Upper Legs': [
      originalExerciseFilePaths.quads,
      originalExerciseFilePaths.hamstrings,
      originalExerciseFilePaths.hip_flexors,
      originalExerciseFilePaths.adductors,
      originalExerciseFilePaths.abductors,
    ],
    'Lower Legs': [originalExerciseFilePaths.calves],
    // No original files for Cardio as it's a new category
  };

  // Create a local copy of bodyParts that we can modify
  const targetBodyParts = [...bodyParts];

  // Always include warmups
  if (!targetBodyParts.includes('Warmup')) {
    targetBodyParts.push('Warmup');
  }

  // Load exercises for each body part
  for (const bodyPart of targetBodyParts) {
    const filePaths = exerciseFilePaths[bodyPart] || [];

    if (filePaths.length === 0) {
      continue;
    }

    // Process each file path listed for this body part (order does not matter)
    for (const filePath of filePaths) {
      const { exercises: exerciseData = [] } = await readJsonFile(filePath);

      // Need to cast to array since we're extending the type
      const dataArray = exerciseData as (Exercise | EnhancedExercise)[];

      let processedExercises = dataArray.map((data) => {
        // For warmup exercises, preserve the bodyPart as "Warmup"
        // For cardio exercises, preserve the bodyPart as "Cardio"
        const preservedBodyPart =
          bodyPart === 'Warmup'
            ? 'Warmup'
            : bodyPart === 'Cardio'
              ? 'Cardio'
              : data.targetBodyParts?.[0] || bodyPart;

        return {
          ...data,
          bodyPart: preservedBodyPart,
          isOriginal: false, // Musco exercises
        };
      });

      // Filter exercises by equipment if specified
      if (equipment && equipment.length > 0) {
        processedExercises = processedExercises.filter(
          (exercise) =>
            exercise.equipment &&
            exercise.equipment.some((item) =>
              equipment.some((eq) =>
                item.toLowerCase().includes(eq.toLowerCase())
              )
            )
        );
      }

      // Special handling for warmups - filter out bodyweight warmups if not explicitly requested
      if (bodyPart === 'Warmup' && !includeBodyweightWarmups) {
        processedExercises = processedExercises.filter(
          (exercise) =>
            // Keep only non-bodyweight warmups (equipment that is not just bodyweight)
            exercise.equipment &&
            !(
              exercise.equipment.length === 1 &&
              exercise.equipment[0].toLowerCase() === 'bodyweight'
            )
        );
      }

      // For warmups, we may need to add bodyweight exercises even when filtering by equipment
      if (
        bodyPart === 'Warmup' &&
        equipment &&
        equipment.length > 0 &&
        includeBodyweightWarmups
      ) {
        // Get bodyweight-only warmups regardless of equipment
        const bodyweightWarmups = dataArray
          .filter(
            (exercise) =>
              exercise.equipment &&
              exercise.equipment.length === 1 &&
              exercise.equipment[0].toLowerCase() === 'bodyweight'
          )
          .map((data) => ({
            ...data,
            bodyPart: data.targetBodyParts?.[0] || bodyPart,
            isOriginal: false,
          }));

        // Make sure we don't have duplicates
        const existingIds = new Set(processedExercises.map((ex) => ex.id));
        const uniqueBodyweightWarmups = bodyweightWarmups.filter(
          (ex) => !existingIds.has(ex.id)
        );

        // Add bodyweight warmups to our processed exercises
        processedExercises = [
          ...processedExercises,
          ...uniqueBodyweightWarmups,
        ];
      }

      exercises.push(...processedExercises);
    }

    // Load original exercises if requested (and not warmups or cardio)
    if (
      bodyPart !== 'Warmup' &&
      bodyPart !== 'Cardio' &&
      includeOriginals &&
      !onlyLoadMissingOriginals
    ) {
      const originalFiles = bodyPartToOriginalFiles[bodyPart] || [];

      for (const filePath of originalFiles) {
        const { exercises: originalExercises = [] } =
          await readJsonFile(filePath);

        const dataArray = originalExercises as Exercise[];

        const processedExercises = dataArray.map((data) => ({
          ...data,
          bodyPart: data.targetBodyParts?.[0] || bodyPart,
          isOriginal: true, // Mark as original
        }));

        // Filter by equipment if specified
        const filteredExercises =
          equipment && equipment.length > 0
            ? processedExercises.filter(
                (exercise) =>
                  exercise.equipment &&
                  exercise.equipment.some((item) =>
                    equipment.some((eq) =>
                      item.toLowerCase().includes(eq.toLowerCase())
                    )
                  )
              )
            : processedExercises;

        exercises.push(...filteredExercises);
      }
    }
  }

  console.log(`[loadServerExercises] TOTAL: ${exercises.length} exercises loaded`);
  return exercises;
}
