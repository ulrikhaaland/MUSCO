/**
 * Centralized i18n mapping constants for dietary preferences.
 * Body parts should use the i18n translation system directly with keys like "bodyParts.Left Hand"
 */

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
