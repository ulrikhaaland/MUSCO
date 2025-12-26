/**
 * Centralized i18n mapping constants for body parts, dietary preferences, etc.
 * These are used for translation lookups and Norwegian term detection.
 */

/**
 * Norwegian body part translations - maps snake_case keys to Norwegian display values
 */
const NORWEGIAN_BODY_PARTS_BASE: Record<string, string> = {
  upper_back: 'Øvre rygg',
  lower_back: 'Korsrygg',
  middle_back: 'Midtre rygg',
  neck: 'Nakke',
  chest: 'Bryst',
  abdomen: 'Abdomen',
  left_shoulder: 'Venstre skulder',
  right_shoulder: 'Høyre skulder',
  left_upper_arm: 'Venstre overarm',
  right_upper_arm: 'Høyre overarm',
  left_elbow: 'Venstre albue',
  right_elbow: 'Høyre albue',
  left_forearm: 'Venstre underarm',
  right_forearm: 'Høyre underarm',
  left_hand: 'Venstre hånd',
  right_hand: 'Høyre hånd',
  pelvis_and_hip_region: 'Bekken- og hofteregion',
  left_thigh: 'Venstre lår',
  right_thigh: 'Høyre lår',
  left_knee: 'Venstre kne',
  right_knee: 'Høyre kne',
  left_lower_leg: 'Venstre legg',
  right_lower_leg: 'Høyre legg',
  left_foot: 'Venstre fot',
  right_foot: 'Høyre fot',
};

/** Convert snake_case to camelCase */
const toCamelCase = (str: string): string =>
  str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

/** 
 * Norwegian body part translations - supports both snake_case and camelCase lookups
 * Derived from base mapping to avoid duplication
 */
export const NORWEGIAN_BODY_PARTS: Record<string, string> = {
  ...NORWEGIAN_BODY_PARTS_BASE,
  ...Object.fromEntries(
    Object.entries(NORWEGIAN_BODY_PARTS_BASE).map(([key, value]) => [toCamelCase(key), value])
  ),
};

/** Additional Norwegian terms for diet (not body parts) */
const NORWEGIAN_DIET_TERMS = [
  'kjøtteter',
  'lavkarbo',
  'Ingen spesifikk diett',
  'Vegetarianer',
  'Veganer',
  'Pescetarianer',
  'Paleo',
  'Keto',
  'Lavkarbo',
  'Lavfett',
  'Glutenfri',
  'Melkefri',
  'Middelhavskost',
  'Intermitterende fasting',
] as const;

/**
 * All Norwegian terms for language detection - derived from body parts + diet terms
 * Used to determine if a term is already in Norwegian (shouldn't be translated)
 */
export const NORWEGIAN_TERMS = [
  ...new Set(Object.values(NORWEGIAN_BODY_PARTS_BASE)),
  'Upper Back', // English terms that might appear
  'Lower Back',
  ...NORWEGIAN_DIET_TERMS,
] as const;

/**
 * Body part underscore format to translation key mapping
 * Derived from base keys to avoid duplication
 */
export const BODY_PART_TRANSLATION_MAP: Record<string, string> = Object.fromEntries(
  Object.keys(NORWEGIAN_BODY_PARTS_BASE).map((key) => [key, `bodyParts.${toCamelCase(key)}`])
);

/**
 * Dietary preference to translation key mapping
 */
export const DIETARY_TRANSLATION_MAP: Record<string, string> = {
  noSpecificDiet: 'profile.diet.noSpecificDiet',
  vegetarian: 'profile.diet.vegetarian',
  vegan: 'profile.diet.vegan',
  pescatarian: 'profile.diet.pescatarian',
  paleo: 'profile.diet.paleo',
  keto: 'profile.diet.keto',
  carnivore: 'profile.diet.carnivore',
  lowCarb: 'profile.diet.lowCarb',
  lowFat: 'profile.diet.lowFat',
  glutenFree: 'profile.diet.glutenFree',
  dairyFree: 'profile.diet.dairyFree',
  mediterranean: 'profile.diet.mediterranean',
  intermittentFasting: 'profile.diet.intermittentFasting',
};

/**
 * Check if a term is a Norwegian body part or term
 */
export const isNorwegianTerm = (term: string): boolean => {
  return (
    NORWEGIAN_TERMS.includes(term as typeof NORWEGIAN_TERMS[number]) ||
    NORWEGIAN_TERMS.some(
      (norwegian) => term.toLowerCase() === norwegian.toLowerCase()
    )
  );
};

/**
 * Placeholder values that indicate missing/empty data
 */
export const PLACEHOLDER_VALUES = [
  'ingen',
  'none',
  'optional',
  'n/a',
  'null',
  'undefined',
  '-',
] as const;

