import {
  TARGET_BODY_PARTS,
  EQUIPMENT_ACCESS,
  WORKOUT_DURATIONS,
  AGE_RANGES,
  EXERCISE_FREQUENCY_OPTIONS,
  PLANNED_EXERCISE_FREQUENCY_OPTIONS,
  EXERCISE_MODALITIES,
  PAIN_BODY_PARTS,
  ExerciseEnvironment,
  EXERCISE_ENVIRONMENTS,
  BODY_REGIONS,
  CARDIO_TYPES,
  CARDIO_ENVIRONMENTS
} from '../types/program';

/**
 * Translates a body part string using the translation function
 * @param bodyPart The body part to translate
 * @param t Translation function
 * @returns Translated body part name
 */
export function translateBodyPart(bodyPart: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.bodyPart.${bodyPart.toLowerCase().replace(/\s+/g, '_')}`;
  const translation = t(translationKey);
  
  // If translation exists and is not the same as the key, return it
  if (translation !== translationKey) {
    return translation;
  }
  
  return bodyPart;
}

/**
 * Translates an equipment access option
 * @param equipment The equipment access option to translate
 * @param t Translation function
 * @returns Translated equipment access name
 */
export function translateEquipment(equipment: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.equipment.${equipment.toLowerCase().replace(/\s+/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return equipment;
}

/**
 * Translates an equipment description
 * @param equipment The equipment to get the translated description for
 * @param t Translation function
 * @returns Translated equipment description
 */
export function translateEquipmentDescription(equipment: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.equipmentDesc.${equipment.toLowerCase().replace(/\s+/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  // Fallback to the original description
  const originalDesc = EXERCISE_ENVIRONMENTS.find(env => env.name === equipment)?.description;
  return originalDesc || '';
}

/**
 * Translates a workout duration option
 * @param duration The workout duration to translate
 * @param t Translation function
 * @returns Translated workout duration
 */
export function translateWorkoutDuration(duration: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.duration.${duration.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return duration;
}

/**
 * Translates an age range option
 * @param ageRange The age range to translate
 * @param t Translation function
 * @returns Translated age range
 */
export function translateAgeRange(ageRange: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.ageRange.${ageRange.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return ageRange;
}

/**
 * Translates an exercise frequency option
 * @param frequency The exercise frequency to translate
 * @param t Translation function
 * @returns Translated exercise frequency
 */
export function translateExerciseFrequency(frequency: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.frequency.${frequency.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return frequency;
}

/**
 * Translates a planned exercise frequency option
 * @param frequency The planned exercise frequency to translate
 * @param t Translation function
 * @returns Translated planned exercise frequency
 */
export function translatePlannedExerciseFrequency(frequency: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.plannedFrequency.${frequency.toLowerCase().replace(/\s+/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return frequency;
}

/**
 * Translates an exercise modality option
 * @param modality The modality to translate
 * @param t Translation function
 * @returns Translated exercise modality
 */
export function translateExerciseModality(modality: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.modality.${modality.toLowerCase()}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return modality;
}

/**
 * Translates a pain body part
 * @param bodyPart The pain body part to translate
 * @param t Translation function
 * @returns Translated pain body part
 */
export function translatePainBodyPart(bodyPart: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.painBodyPart.${bodyPart.toLowerCase().replace(/\s+/g, '_').replace(/&/g, 'and')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return bodyPart;
}

/**
 * Translates a body region
 * @param region The body region to translate
 * @param t Translation function
 * @returns Translated body region
 */
export function translateBodyRegion(region: string, t: (key: string, options?: any) => string): string {
  const translationKey = `profile.bodyRegions.${region.toLowerCase().replace(/\s+/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) { 
    return translation;
  }
  
  return region;
}

/**
 * Get translated array of target body parts
 * @param t Translation function
 * @returns Array of translated target body parts
 */
export function getTranslatedTargetBodyParts(t: (key: string, options?: any) => string): string[] {
  return TARGET_BODY_PARTS.map(part => translateBodyPart(part, t));
}

/**
 * Get translated array of equipment access options
 * @param t Translation function
 * @returns Array of translated equipment access options
 */
export function getTranslatedEquipmentAccess(t: (key: string, options?: any) => string): string[] {
  return EQUIPMENT_ACCESS.map(equipment => translateEquipment(equipment, t));
}

/**
 * Get translated array of exercise environments
 * @param t Translation function
 * @returns Array of translated exercise environments
 */
export function getTranslatedExerciseEnvironments(t: (key: string, options?: any) => string): ExerciseEnvironment[] {
  return EXERCISE_ENVIRONMENTS.map(env => ({
    name: translateEquipment(env.name, t),
    description: translateEquipmentDescription(env.name, t)
  }));
}

/**
 * Get translated array of workout durations
 * @param t Translation function
 * @returns Array of translated workout durations
 */
export function getTranslatedWorkoutDurations(t: (key: string, options?: any) => string): string[] {
  return WORKOUT_DURATIONS.map(duration => translateWorkoutDuration(duration, t));
}

/**
 * Get translated array of age ranges
 * @param t Translation function
 * @returns Array of translated age ranges
 */
export function getTranslatedAgeRanges(t: (key: string, options?: any) => string): string[] {
  return AGE_RANGES.map(ageRange => translateAgeRange(ageRange, t));
}

/**
 * Get translated array of exercise frequency options
 * @param t Translation function
 * @returns Array of translated exercise frequency options
 */
export function getTranslatedExerciseFrequencyOptions(t: (key: string, options?: any) => string): string[] {
  return EXERCISE_FREQUENCY_OPTIONS.map(frequency => translateExerciseFrequency(frequency, t));
}

/**
 * Get translated array of planned exercise frequency options
 * @param t Translation function
 * @returns Array of translated planned exercise frequency options
 */
export function getTranslatedPlannedExerciseFrequencyOptions(t: (key: string, options?: any) => string): string[] {
  return PLANNED_EXERCISE_FREQUENCY_OPTIONS.map(frequency => 
    translatePlannedExerciseFrequency(frequency, t)
  );
}

/**
 * Get translated array of exercise modalities
 * @param t Translation function
 * @returns Array of translated exercise modalities
 */
export function getTranslatedExerciseModalities(t: (key: string, options?: any) => string): string[] {
  return EXERCISE_MODALITIES.map(modality => translateExerciseModality(modality, t));
}

/**
 * Get translated array of pain body parts
 * @param t Translation function
 * @returns Array of translated pain body parts
 */
export function getTranslatedPainBodyParts(t: (key: string, options?: any) => string): string[] {
  return PAIN_BODY_PARTS.map(part => translatePainBodyPart(part, t));
} 

/**
 * Get translated array of body regions
 * @param t Translation function
 * @returns Array of translated body regions
 */
export function getTranslatedBodyRegions(t: (key: string, options?: any) => string): string[] {
  return BODY_REGIONS.map(region => translateBodyRegion(region, t));
}

/**
 * Translates a cardio type
 * @param cardioType The cardio type to translate
 * @param t Translation function
 * @returns Translated cardio type
 */
export function translateCardioType(cardioType: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.cardioType.${cardioType.toLowerCase().replace(/\s+/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return cardioType;
}

/**
 * Translates a cardio environment
 * @param environment The cardio environment to translate
 * @param t Translation function
 * @returns Translated cardio environment
 */
export function translateCardioEnvironment(environment: string, t: (key: string, options?: any) => string): string {
  const translationKey = `program.cardioEnvironment.${environment.toLowerCase().replace(/\s+/g, '_')}`;
  const translation = t(translationKey);
  
  if (translation !== translationKey) {
    return translation;
  }
  
  return environment;
}

/**
 * Get translated array of cardio types
 * @param t Translation function
 * @returns Array of translated cardio types
 */
export function getTranslatedCardioTypes(t: (key: string, options?: any) => string): string[] {
  return CARDIO_TYPES.map(type => translateCardioType(type, t));
}

/**
 * Get translated array of cardio environments
 * @param t Translation function
 * @returns Array of translated cardio environments
 */
export function getTranslatedCardioEnvironments(t: (key: string, options?: any) => string): string[] {
  return CARDIO_ENVIRONMENTS.map(env => translateCardioEnvironment(env, t));
}