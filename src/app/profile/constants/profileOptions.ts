/**
 * Profile page constants and option generators
 */

export interface FitnessLevel {
  name: string;
  description: string;
}

/**
 * Profile-specific exercise modality with description
 * NOTE: This is different from EXERCISE_MODALITIES in @/app/types/program.ts
 * which is used for program generation. This is for profile display.
 */
export interface ProfileExerciseModality {
  name: string;
  description: (t: (key: string) => string) => string;
}

// Fitness levels with descriptions
export const getFitnessLevels = (t: (key: string) => string): FitnessLevel[] => [
  {
    name: t('profile.beginner.name'),
    description: t('profile.beginner.desc'),
  },
  {
    name: t('profile.intermediate.name'),
    description: t('profile.intermediate.desc'),
  },
  {
    name: t('profile.advanced.name'),
    description: t('profile.advanced.desc'),
  },
  {
    name: t('profile.elite.name'),
    description: t('profile.elite.desc'),
  },
];

/**
 * Profile-specific exercise modalities with descriptions for display
 * NOTE: Different from EXERCISE_MODALITIES in @/app/types/program.ts
 * Program uses: ['Cardio', 'Strength', 'Both']
 * Profile uses: ['strength', 'cardio', 'recovery'] with descriptions
 */
export const PROFILE_EXERCISE_MODALITIES: ProfileExerciseModality[] = [
  {
    name: 'strength',
    description: (t) => t('profile.modality.strength.description'),
  },
  {
    name: 'cardio',
    description: (t) => t('profile.modality.cardio.description'),
  },
  {
    name: 'recovery',
    description: (t) => t('profile.modality.recovery.description'),
  },
];

// Health goals options
export const getHealthGoalsOptions = (t: (key: string) => string): string[] => [
  t('profile.goals.weightLoss'),
  t('profile.goals.muscleGain'),
  t('profile.goals.improvedFitness'),
  t('profile.goals.strengthDevelopment'),
  t('profile.goals.injuryRecovery'),
  t('profile.goals.painReduction'),
  t('profile.goals.betterMobility'),
  t('profile.goals.sportsPerformance'),
  t('profile.goals.generalWellness'),
  t('profile.goals.stressReduction'),
  t('profile.goals.betterSleep'),
  t('profile.goals.improvedPosture'),
];

// Dietary preference options
export const getDietaryPreferencesOptions = (t: (key: string) => string): string[] => [
  t('profile.diet.vegetarian'),
  t('profile.diet.vegan'),
  t('profile.diet.pescatarian'),
  t('profile.diet.paleo'),
  t('profile.diet.keto'),
  t('profile.diet.carnivore'),
  t('profile.diet.lowCarb'),
  t('profile.diet.lowFat'),
  t('profile.diet.glutenFree'),
  t('profile.diet.dairyFree'),
  t('profile.diet.mediterranean'),
  t('profile.diet.intermittentFasting'),
];

// CSS styles for smooth section transitions
export const sectionContentStyle = {
  transition: 'max-height 0.3s ease, opacity 0.3s ease, padding 0.3s ease',
  overflow: 'hidden',
  opacity: 1,
  animation: 'fadeIn 0.3s ease-in-out',
};

// Fade-in animation keyframes
export const fadeInAnimation = `
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

