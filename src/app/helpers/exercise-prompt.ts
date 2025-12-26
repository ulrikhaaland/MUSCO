import { ExerciseQuestionnaireAnswers } from '../../../shared/types';
import { Exercise, TARGET_BODY_PARTS } from '@/app/types/program';
import { loadServerExercises } from '@/app/services/server-exercises';

/**
 * Helper function to determine if user should get interval training
 * based on their fitness level and exercise history
 */
export function shouldIncludeIntervals(
  userInfo: ExerciseQuestionnaireAnswers
): boolean {
  // Only include intervals for users with some exercise experience
  const lowExperienceLevels = [
    'No exercise in the past year',
    'Less than once a month',
  ];

  // Check if user has a low experience level
  const hasLowExperience = lowExperienceLevels.some((level) =>
    userInfo.lastYearsExerciseFrequency.includes(level)
  );

  // Don't include intervals for beginners
  if (hasLowExperience) {
    return false;
  }

  // Check age - be more conservative with older age groups
  const isOlderAgeGroup =
    userInfo.age.includes('60') || userInfo.age.includes('70');

  // For older age groups with limited experience, avoid intervals
  if (
    isOlderAgeGroup &&
    userInfo.lastYearsExerciseFrequency.includes('1-2 times')
  ) {
    return false;
  }

  // Include intervals for everyone else
  return true;
}

/**
 * Utility function to prepare exercises prompt for the LLM
 * @param userInfo User questionnaire data
 * @param removedExerciseIds Optional list of exercise IDs to exclude
 * @param includeEquipment Whether to include equipment info in prompt
 * @param language Language code ('en' or 'nb') - defaults to 'en'
 */
export async function prepareExercisesPrompt(
  userInfo: ExerciseQuestionnaireAnswers,
  removedExerciseIds?: string[],
  includeEquipment: boolean = false,
  language: string = 'en'
): Promise<{
  exercisesPrompt: string;
  exerciseCount: number;
}> {
  const useNorwegian = language === 'nb';
  console.log(`[prepareExercisesPrompt] language=${language}, useNorwegian=${useNorwegian}`);
  const targetAreas = userInfo.targetAreas;
  const equipment = [...(userInfo.equipment || [])];
  const exerciseEnvironment = userInfo.exerciseEnvironments || 'gym';
  const exerciseModalities = userInfo.exerciseModalities || '';

  // When in Large Gym environment, ensure all standard equipment is available
  if (exerciseEnvironment === 'Large Gym') {
    const standardGymEquipment = [
      'treadmill', 
      'exercise bike', 
      'stationary bike', 
      'rowing machine', 
      'elliptical',
      'jump rope'
    ];
    
    // Add standard equipment if not already in the list
    standardGymEquipment.forEach(item => {
      if (!equipment.some(eq => eq.toLowerCase() === item.toLowerCase())) {
        equipment.push(item);
      }
    });
  }
  
  // Normalize equipment names for consistent matching
  const normalizedEquipment = equipment.map(eq => eq.toLowerCase());
  
  // Add bodyweight as a fallback option
  equipment.push('bodyweight');

  // Prepare body parts to load - only include warmups for strength training
  const isCardioOnly = exerciseModalities.toLowerCase() === 'cardio';
  
  // If targetAreas is empty (e.g., recovery programs), load ALL body parts
  // This ensures we have exercises to filter by equipment
  // Filter out 'Neck' as there are no neck exercises in the database
  const loadableBodyParts = TARGET_BODY_PARTS.filter(bp => bp !== 'Neck');
  const bodyPartsToLoad = targetAreas.length > 0 
    ? targetAreas.filter(bp => bp !== 'Neck') 
    : [...loadableBodyParts];
  console.log(`[prepareExercisesPrompt] targetAreas=${targetAreas.length > 0 ? targetAreas.join(',') : '(empty, using all loadable body parts)'}`);
  
  // Only include warmups if we're doing strength training or have body parts to load (not cardio-only)
  if (!isCardioOnly && (bodyPartsToLoad.length > 0 || exerciseModalities.toLowerCase().includes('strength') || exerciseModalities.toLowerCase().includes('both'))) {
    bodyPartsToLoad.push('Warmup');
  }

  // Keep cardio separate so we can load it without equipment filtering
  // Check for 'Both' or 'Cardio' in any case
  const needsCardio = exerciseModalities.toLowerCase().includes('cardio') || 
                     exerciseModalities.toLowerCase().includes('both');

  // Special handling for TRX/Suspension Trainer equipment
  const hasTRX = normalizedEquipment.some(eq => 
    eq === 'trx' || eq.includes('suspension') || eq.includes('trx')
  );
  
  // Special handling for Kettlebell equipment
  const hasKettlebell = normalizedEquipment.some(eq =>
    eq.includes('kettle') || eq === 'kb'
  );

  // Load strength and warmup exercises with equipment filtering
  let availableExercises: Exercise[] = [];
  if (bodyPartsToLoad.length > 0) {
    if (exerciseEnvironment.toLowerCase() === 'custom') {
      availableExercises = await loadServerExercises({
        bodyParts: bodyPartsToLoad,
        includeOriginals: false,
        onlyLoadMissingOriginals: true,
        equipment: equipment,
        includeBodyweightWarmups: true, // Include bodyweight warmups for custom environment
        useNorwegian,
      });
    } else {
      availableExercises = await loadServerExercises({
        bodyParts: bodyPartsToLoad,
        includeOriginals: false,
        onlyLoadMissingOriginals: true,
        includeBodyweightWarmups: false, // Don't include bodyweight warmups for non-custom environments
        useNorwegian,
      });
    }
  }
  console.log(`[prepareExercisesPrompt] After loadServerExercises: ${availableExercises.length} exercises for bodyParts=${bodyPartsToLoad.join(',')}`);

  // Load cardio exercises separately without equipment filtering if needed
  let cardioExercises: Exercise[] = [];
  if (needsCardio) {
    cardioExercises = await loadServerExercises({
      bodyParts: ['Cardio'],
      includeOriginals: false,
      onlyLoadMissingOriginals: true,
      // No equipment filtering for cardio - we'll handle that manually
      useNorwegian,
    });
  }

  // If TRX was selected, look for additional exercises that can use TRX
  let trxExercises: Exercise[] = [];
  if (hasTRX) {
    // For TRX, we need special handling to include exercises that can use TRX
    // Load specifically from Upper Legs, Upper Back, and Core where TRX exercises are common
    const trxTargetBodyParts = ['Upper Legs', 'Upper Back', 'Core', 'Lower Body'];
    
    // Load all potential TRX exercises without equipment filtering first
    trxExercises = await loadServerExercises({
      bodyParts: trxTargetBodyParts,
      includeOriginals: false,
      onlyLoadMissingOriginals: true,
      useNorwegian,
    });
    
    // Filter to only include exercises that mention TRX/Suspension or Pistol Squat
    trxExercises = trxExercises.filter(ex => {
      // Normalize names and equipment for case-insensitive matching
      const exerciseName = ex.name?.toLowerCase() || '';
      const exerciseEquipment = (ex.equipment || []).map(eq => eq.toLowerCase());
      
      // Specific exercises we want to include for TRX
      const keyExercises = ['pistol squat', 'inverted row'];
      const hasTrxKeyExercise = keyExercises.some(key => exerciseName.includes(key));
      
      // Check equipment list for TRX
      const hasTrxEquipment = exerciseEquipment.some(eq => 
        eq.includes('trx') || eq.includes('suspension')
      );
      
      return hasTrxEquipment || hasTrxKeyExercise;
    });
  }

  // If Kettlebell was selected, look for additional kettlebell exercises
  let kettlebellExercises: Exercise[] = [];
  if (hasKettlebell) {
    // Load specifically from areas where kettlebell exercises are common
    const kettlebellTargetBodyParts = ['Upper Legs', 'Shoulders', 'Core', 'Lower Body'];
    
    // Load potential kettlebell exercises
    kettlebellExercises = await loadServerExercises({
      bodyParts: kettlebellTargetBodyParts,
      includeOriginals: false,
      onlyLoadMissingOriginals: true,
      useNorwegian,
    });
    
    // Filter to only include exercises that can use kettlebells
    kettlebellExercises = kettlebellExercises.filter(ex => {
      const exerciseEquipment = (ex.equipment || []).map(eq => eq.toLowerCase());
      
      // Check equipment list for kettlebell
      return exerciseEquipment.some(eq => 
        eq.includes('kettlebell') || eq.includes('kettle bell')
      );
    });
  }

  // Combine all exercise arrays
  availableExercises = [...availableExercises, ...cardioExercises, ...trxExercises, ...kettlebellExercises];
  console.log(`[prepareExercisesPrompt] After combining: ${availableExercises.length} total (cardio=${cardioExercises.length}, trx=${trxExercises.length}, kb=${kettlebellExercises.length})`);

  // If removedExerciseIds are provided, filter them out from availableExercises
  if (removedExerciseIds && removedExerciseIds.length > 0) {
    const removedIdsSet = new Set(removedExerciseIds);
    availableExercises = availableExercises.filter((ex) => {
      const id = ex.id || ex.exerciseId || ex.name; // Use a consistent way to get ID
      return !removedIdsSet.has(id);
    });
  }

  // Separate warmup exercises from other exercises
  const warmupExercises = availableExercises.filter(
    (ex) => ex.bodyPart === 'Warmup'
  );

  // Filter cardio exercises based on user preferences if modalities includes cardio
  let filteredCardioExercises: Exercise[] = [];
  if (needsCardio) {
    // Get all cardio exercises first
    const allCardioExercises = availableExercises.filter(
      (ex) => ex.bodyPart === 'Cardio'
    );

    // Apply filters based on user preferences
    if (userInfo.cardioType && allCardioExercises.length > 0) {
      // Extract the cardio type from userInfo (Running, Cycling, Rowing)
      const cardioType = userInfo.cardioType.toLowerCase();

      // Extract the cardio environment preference
      const cardioEnvironment = userInfo.cardioEnvironment?.toLowerCase() || '';

      // Get user's equipment
      const userEquipment = userInfo.equipment || [];
      const userEquipmentLowerCase = userEquipment.map((item) =>
        item.toLowerCase()
      );

      // Calculate user's fitness level based on questionnaire answers
      // This affects whether we include interval training
      const includeIntervals = shouldIncludeIntervals(userInfo);

      // Filter cardio exercises based on type, environment, and training style
      filteredCardioExercises = allCardioExercises.filter((ex) => {
        const name = ex.name?.toLowerCase() || '';
        const environment = (ex as any).environment?.toLowerCase() || '';
        const exerciseEquipment = (ex.equipment || []).map((item) =>
          item.toLowerCase()
        );

        // Check if exercise is interval-based (contains "interval" in name)
        const isIntervalExercise =
          name.includes('interval') || name.includes('4x4');

        // If user's fitness level doesn't support intervals, skip interval exercises
        if (isIntervalExercise && !includeIntervals) {
          return false;
        }

        // Check if the exercise name contains the selected cardio type
        // Include both English and Norwegian terms for matching
        const matchesType =
          (cardioType.includes('running') && 
            (name.includes('running') || name.includes('run') || name.includes('jog') ||
             name.includes('løping') || name.includes('løp'))) ||
          (cardioType.includes('cycling') &&
            (name.includes('cycling') || name.includes('bike') ||
             name.includes('sykling') || name.includes('sykkel'))) ||
          (cardioType.includes('rowing') && 
            (name.includes('rowing') || name.includes('row') ||
             name.includes('roing')));
        
        // If no specific type is selected, include all cardio types
        // Otherwise strictly enforce the cardio type match
        if (cardioType !== '' && !matchesType) {
          return false;
        }

        // Check if the exercise environment matches the selected environment
        // For "Both" or "Inside and Outside", include both indoor and outdoor exercises
        const matchesEnvironment =
          cardioEnvironment === 'both' ||
          cardioEnvironment.includes('inside and outside') ||
          cardioEnvironment === ''
            ? true
            : cardioEnvironment.includes('inside')
              ? environment.includes('indoor')
              : cardioEnvironment.includes('outside')
                ? environment.includes('outdoor')
                : true; // If no specific environment, include all

        // Check if user has the required equipment for this exercise
        let hasRequiredEquipment = true;
        
        // Skip equipment checking for cardio exercises in Custom mode to allow more flexibility
        // Users should be able to do indoor cardio even without specific equipment
        const skipCardioEquipmentCheck = true; // Allow cardio exercises regardless of equipment
        
        // Skip equipment checking for Large Gym or empty exerciseEnvironment - assume all necessary equipment is available
        // Only check equipment requirements for Custom environments (but skip for cardio)
        if (exerciseEnvironment === 'Custom' && environment.includes('indoor') && !skipCardioEquipmentCheck) {
          // Get the required equipment for this exercise (if any)
          if (exerciseEquipment.length > 0) {
            // Check specific equipment needs based on equipment array, not just names
            const needsTreadmill = exerciseEquipment.some((eq) =>
              eq.includes('treadmill')
            );
            const needsBike = exerciseEquipment.some(
              (eq) => eq.includes('bike') || eq.includes('cycling')
            );
            const needsRower = exerciseEquipment.some(
              (eq) => eq.includes('rowing') || eq.includes('rower')
            );
            const needsElliptical = exerciseEquipment.some((eq) =>
              eq.includes('elliptical')
            );
            const needsJumpRope = exerciseEquipment.some((eq) =>
              eq.includes('jump rope')
            );

            // Check if user has the required equipment
            if (
              needsTreadmill &&
              !userEquipmentLowerCase.some((item) => item.includes('treadmill'))
            ) {
              hasRequiredEquipment = false;
            } else if (
              needsBike &&
              !userEquipmentLowerCase.some(
                (item) =>
                  item.includes('exercise bike') ||
                  item.includes('stationary bike')
              )
            ) {
              hasRequiredEquipment = false;
            } else if (
              needsRower &&
              !userEquipmentLowerCase.some((item) =>
                item.includes('rowing machine')
              )
            ) {
              hasRequiredEquipment = false;
            } else if (
              needsElliptical &&
              !userEquipmentLowerCase.some((item) =>
                item.includes('elliptical')
              )
            ) {
              hasRequiredEquipment = false;
            } else if (
              needsJumpRope &&
              !userEquipmentLowerCase.some((item) => item.includes('jump rope'))
            ) {
              hasRequiredEquipment = false;
            }
          }
        }

        // Ensure cardio type filtering takes priority - check type first, then environment & equipment
        return matchesType && matchesEnvironment && hasRequiredEquipment;
      });
    } else {
      // If no specific preferences, include all cardio exercises
      filteredCardioExercises = allCardioExercises;
    }
  }

  // Filter other exercises (not warmups or cardio)
  const otherExercises = availableExercises.filter(
    (ex) => ex.bodyPart !== 'Warmup' && ex.bodyPart !== 'Cardio'
  );

  // Format exercises by body part for the LLM
  const exercisesByBodyPart: Record<string, Exercise[]> = {};

  // Add 'Warmup' as the first category if we have warmup exercises
  if (warmupExercises.length > 0) {
    exercisesByBodyPart['Warmup'] = warmupExercises;
  }

  // Always add 'Cardio' category if we need cardio, even if there are no exercises (for test assertions)
  if (needsCardio) {
    exercisesByBodyPart['Cardio'] = filteredCardioExercises;
  }

  // Group the remaining exercises by body part
  otherExercises.forEach((exercise) => {
    const bodyPart =
      exercise.bodyPart || exercise.targetBodyParts?.[0] || 'Other';

    if (!exercisesByBodyPart[bodyPart]) {
      exercisesByBodyPart[bodyPart] = [];
    }

    exercisesByBodyPart[bodyPart].push(exercise);
  });

  let totalExerciseCount = 0;
  Object.entries(exercisesByBodyPart).forEach(([_bodyPartKey, exercises]) => {
    totalExerciseCount += exercises.length;
  });
  console.log(`[prepareExercisesPrompt] Final count by bodyPart:`, Object.entries(exercisesByBodyPart).map(([k, v]) => `${k}:${v.length}`).join(', '));

  // Format exercises as JSON for the prompt
  let exercisesPrompt = '\n\nEXERCISE DATABASE:\n';

  // Format each body part and its exercises
  Object.entries(exercisesByBodyPart).forEach(([bodyPart, exercises]) => {
    // Build the bodyPart section header
    exercisesPrompt += `{\n  "bodyPart": "${bodyPart}",\n  "exercises": [\n`;

    // Add each exercise with necessary fields
    exercises.forEach((exercise, index) => {
      exercisesPrompt += `    {\n`;
      exercisesPrompt += `      "id": "${exercise.id || exercise.exerciseId}",\n`;
      exercisesPrompt += `      "name": "${exercise.name || ''}",\n`;
      exercisesPrompt += `      "difficulty": "${exercise.difficulty || 'beginner'}",\n`;

      // Include equipment information when includeEquipment is true or for special equipment
      if (includeEquipment || 
          (exercise.equipment && 
          (exercise.equipment.some(eq => 
            eq.toLowerCase().includes('trx') || eq.toLowerCase().includes('suspension')
          ) ||
          exercise.equipment.some(eq =>
            eq.toLowerCase().includes('kettlebell') || eq.toLowerCase().includes('kettle bell')
          )))
      ) {
        exercisesPrompt += `      "equipment": ${JSON.stringify(exercise.equipment || [])},\n`;
      }

      // If it's a warmup exercise, explicitly add the category
      if (bodyPart === 'Warmup') {
        exercisesPrompt += `      "category": "Warmup",\n`;
      }

      // Close the exercise object
      exercisesPrompt += `    }${index < exercises.length - 1 ? ',' : ''}\n`;
    });

    // Close the exercises array
    exercisesPrompt += `  ]\n},\n`;
  });

  // Return the formatted exercises prompt
  return {
    exercisesPrompt,
    exerciseCount: totalExerciseCount
  };
}
