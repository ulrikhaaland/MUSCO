import { ExercisesTemplate } from '@/app/types/program';
import { abductorsExercises } from './abductors';
import { absExercises } from './abs';
import { adductorsExercises } from './adductors';
import { bicepsExercises } from './biceps';
import { calvesExercises } from './calves';
import { chestExercises } from './chest';
import { forearmsExercises } from './forearms';
import { glutesExercises } from './glutes';
import { hamstringsExercises } from './hamstrings';
import { hipFlexorsExercises } from './hip-flexors';
import { latsExercises } from './lats';
import { lowerBackExercises } from './lower-back';
import { obliquesExercises } from './obliques';
import { shouldersExercises } from './shoulders';
import { trapsExercises } from './traps';
import { tricepsExercises } from './triceps';
import { upperBackExercises } from './upper-back';


export const allExercises: ExercisesTemplate = [
abductorsExercises,
absExercises,
adductorsExercises,
bicepsExercises,
calvesExercises,
chestExercises,
forearmsExercises,
glutesExercises,
hamstringsExercises,
hipFlexorsExercises,
latsExercises,
lowerBackExercises,
obliquesExercises,
shouldersExercises,
trapsExercises,
tricepsExercises,
upperBackExercises,
];

// Helper function to get exercises for specific body parts
export const getExercisesForBodyParts = (bodyParts: string[]) => {
  return allExercises
    .filter(group => bodyParts.includes(group.bodyPart))
    .flatMap(group => group.exercises);
};

// Helper function to get all exercises as a flat array
export const getAllExercisesFlat = () => {
  return allExercises.flatMap(group => group.exercises);
}; 