// @ts-nocheck
import { ProgramType } from '../../../shared/types';

const createWorkoutDay = (
  day: number,
  description: string,
  exercises: any[],
  duration: number = 35
) => ({
  day,
  description,
  dayType: 'strength',
  exercises,
  duration,
});

const createRestDay = (
  day: number,
  description: string = 'Rest day. Optional light mobility and easy walking.',
) => ({
  day,
  description,
  dayType: 'rest',
  exercises: [
    { exerciseId: 'warmup-8', sets: 1, repetitions: 15, restBetweenSets: 30, warmup: true },
    { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
  ],
  duration: 15,
  isRestDay: true,
});

const GYM_FILLER_EXERCISES = [
  { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
  { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
  { exerciseId: 'shoulders-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
  { exerciseId: 'upper-back-4', sets: 3, repetitions: 10, restBetweenSets: 75 },
  { exerciseId: 'biceps-10', sets: 3, repetitions: 12, restBetweenSets: 60 },
  { exerciseId: 'triceps-4', sets: 3, repetitions: 12, restBetweenSets: 60 },
];

const HOME_FILLER_EXERCISES = [
  { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
  { exerciseId: 'glutes-7', sets: 3, repetitions: 12, restBetweenSets: 60 },
  { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
  { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
  { exerciseId: 'upper-back-60', sets: 3, repetitions: 12, restBetweenSets: 60 },
];

const MIN_EXERCISES_30_45 = 6;

const ensureWorkoutDensity = (program: any) => {
  const isHomeProgram = program.exerciseEnvironment === 'Custom';
  const fillers = isHomeProgram ? HOME_FILLER_EXERCISES : GYM_FILLER_EXERCISES;

  return {
    ...program,
    days: (program.days || []).map((day: any) => {
      if (day?.isRestDay || !Array.isArray(day?.exercises)) return day;
      if (day.exercises.length >= MIN_EXERCISES_30_45) return day;

      const existingIds = new Set(day.exercises.map((exercise: any) => exercise.exerciseId));
      const extras: any[] = [];

      for (const filler of fillers) {
        if (!existingIds.has(filler.exerciseId)) {
          extras.push(filler);
          existingIds.add(filler.exerciseId);
        }
        if (day.exercises.length + extras.length >= MIN_EXERCISES_30_45) break;
      }

      return {
        ...day,
        exercises: [...day.exercises, ...extras],
      };
    }),
  };
};

const exerciseProgramTemplates = [
  {
    slug: 'full-body-strength',
    title: 'Total Strength Reset',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['full body', 'strength'],
    bodyParts: ['Upper Body', 'Lower Body', 'Core'],
    programOverview:
      'A balanced full-body starter plan focused on core lifts and movement quality. It builds baseline strength and consistency across push, pull, squat, and hinge patterns.',
    summary: 'Build full-body strength fast with a clean, high-impact weekly structure.',
    timeFrameExplanation:
      'Train three non-consecutive days this week. Keep 1-3 reps in reserve on most sets and focus on clean tempo and stable positions.',
    afterTimeFrame: {
      expectedOutcome: 'Improved movement confidence and consistent week-to-week training rhythm.',
      nextSteps: 'Progress load slightly next week or add one set to your primary movements.',
    },
    whatNotToDo:
      'Do not rush reps, skip warm-up sets, or push to technical failure on every set.',
    days: [
      createWorkoutDay(1, 'Full Body A', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'quads-5', sets: 4, repetitions: 10, restBetweenSets: 75 },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Full Body B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 },
      ], 38),
      createRestDay(4),
      createWorkoutDay(5, 'Full Body C', [
        { exerciseId: 'cardio-13', duration: 8, warmup: true },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ], 36),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'upper-body-build',
    title: 'Upper Body Armor',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['upper body', 'strength'],
    bodyParts: ['Shoulders', 'Upper Back', 'Arms'],
    programOverview:
      'An upper-body focused week to build pulling and pressing capacity while maintaining shoulder health.',
    summary: 'Add visible upper-body strength while keeping shoulders stable and pain-free.',
    timeFrameExplanation:
      'Use moderate loads and controlled reps. Keep shoulder positioning clean and avoid shrug-dominant patterns.',
    afterTimeFrame: {
      expectedOutcome: 'Better upper-body endurance and more stable shoulder mechanics.',
      nextSteps: 'Progress reps or load slightly while preserving form quality.',
    },
    whatNotToDo: 'Avoid ego loading and painful overhead ranges.',
    days: [
      createWorkoutDay(1, 'Upper Push + Pull', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Upper Volume', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'upper-back-3', sets: 4, repetitions: 10, restBetweenSets: 75 },
        { exerciseId: 'shoulders-1', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'biceps-10', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Upper Mixed', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-8', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'triceps-4', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 36),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'lower-body-strength',
    title: 'Leg Power Builder',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['lower body', 'strength'],
    bodyParts: ['Glutes', 'Upper Legs', 'Lower Legs'],
    programOverview:
      'A lower-body focused week centered on squat, hinge, glute, and calf strength development.',
    summary: 'Drive stronger legs and glutes with progressive lower-body sessions.',
    timeFrameExplanation:
      'Use controlled tempo and full-foot pressure. Prioritize knee and hip alignment through every rep.',
    afterTimeFrame: {
      expectedOutcome: 'Improved lower-body strength endurance and movement control.',
      nextSteps: 'Progress by adding load or one additional set to the main lift.',
    },
    whatNotToDo: 'Avoid uncontrolled depth and poor trunk stability under fatigue.',
    days: [
      createWorkoutDay(1, 'Lower A', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ], 42),
      createRestDay(2),
      createWorkoutDay(3, 'Lower B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'calves-10', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 38),
      createRestDay(4),
      createWorkoutDay(5, 'Lower C', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true },
        { exerciseId: 'quads-5', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 },
      ], 40),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'bodyweight-conditioning',
    title: 'Home Burn Circuit',
    exerciseEnvironment: 'Custom',
    equipment: ['bodyweight', 'resistance_bands'],
    targetAreas: ['conditioning', 'full body'],
    bodyParts: ['Upper Body', 'Lower Body', 'Core'],
    programOverview: 'A bodyweight-only week blending strength endurance and light conditioning.',
    summary: 'High-value at-home conditioning that boosts fitness with zero gym setup.',
    timeFrameExplanation:
      'Keep transitions smooth and maintain clean movement quality under light fatigue.',
    afterTimeFrame: {
      expectedOutcome: 'Better conditioning base and work capacity.',
      nextSteps: 'Increase rounds or reduce rest intervals next week.',
    },
    whatNotToDo: 'Avoid sloppy reps and breath-holding during circuits.',
    days: [
      createWorkoutDay(1, 'Circuit A', [
        { exerciseId: 'cardio-13', duration: 8, warmup: true },
        { exerciseId: 'quads-190', sets: 4, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'abs-20', sets: 4, repetitions: 10, restBetweenSets: 45 },
        { exerciseId: 'glutes-7', sets: 4, repetitions: 15, restBetweenSets: 45 },
      ], 35),
      createRestDay(2),
      createWorkoutDay(3, 'Circuit B', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'upper-back-60', sets: 4, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'abs-6', sets: 4, duration: 0.5, restBetweenSets: 45 },
        { exerciseId: 'calves-6', sets: 4, repetitions: 15, restBetweenSets: 45 },
      ], 36),
      createRestDay(4),
      createWorkoutDay(5, 'Circuit C', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 12, restBetweenSets: 30, warmup: true },
        { exerciseId: 'glutes-44', sets: 4, repetitions: 15, restBetweenSets: 45 },
        { exerciseId: 'quads-190', sets: 4, repetitions: 12, restBetweenSets: 45 },
        { exerciseId: 'abs-20', sets: 4, repetitions: 10, restBetweenSets: 45 },
      ], 35),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'core-endurance',
    title: 'Core Engine Home',
    exerciseEnvironment: 'Custom',
    equipment: ['bodyweight', 'resistance_bands'],
    targetAreas: ['core', 'endurance'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
    programOverview: 'A core-focused week emphasizing anti-extension, anti-rotation, and trunk endurance.',
    summary: 'Build core endurance at home for better stability, posture, and control.',
    timeFrameExplanation: 'Use strict form and breathing mechanics across every hold and rep.',
    afterTimeFrame: {
      expectedOutcome: 'Improved trunk stability and reduced early core fatigue.',
      nextSteps: 'Add longer holds or more unilateral challenges next week.',
    },
    whatNotToDo: 'Avoid compensatory lumbar extension and rushed reps.',
    days: [
      createWorkoutDay(1, 'Core A', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'abs-20', sets: 4, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 4, duration: 0.67, restBetweenSets: 60 },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 38),
      createRestDay(2),
      createWorkoutDay(3, 'Core B', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true },
        { exerciseId: 'abs-121', sets: 4, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'obliques-14', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Core C', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'abs-120', sets: 4, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 },
      ], 37),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'glute-core-build',
    title: 'Glute Core Sculpt',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['glutes', 'core'],
    bodyParts: ['Glutes', 'Core', 'Lower Back'],
    programOverview: 'A focused week to improve glute strength and core control for better movement efficiency.',
    summary: 'Shape stronger glutes and a tighter core with focused strength progressions.',
    timeFrameExplanation: 'Prioritize hip extension quality and trunk control over load speed.',
    afterTimeFrame: {
      expectedOutcome: 'Stronger glute engagement and improved pelvic stability.',
      nextSteps: 'Add unilateral progression or additional posterior-chain volume.',
    },
    whatNotToDo: 'Avoid lumbar-driven extension and uncontrolled hinging.',
    days: [
      createWorkoutDay(1, 'Glute Core A', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 36),
      createRestDay(2),
      createWorkoutDay(3, 'Glute Core B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 10, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Glute Core C', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 38),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'push-pull-balance',
    title: 'Push Pull Precision',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['upper body', 'balance'],
    bodyParts: ['Shoulders', 'Upper Back', 'Core'],
    programOverview: 'A balanced push/pull week for shoulder function and upper-body symmetry.',
    summary: 'Train push and pull balance to look stronger and move cleaner.',
    timeFrameExplanation: 'Keep shoulder blades controlled and avoid neck-dominant effort.',
    afterTimeFrame: {
      expectedOutcome: 'Improved upper-body balance and cleaner pressing/pulling mechanics.',
      nextSteps: 'Increase load progression while maintaining push-pull parity.',
    },
    whatNotToDo: 'Avoid overloaded pressing without matching pull volume.',
    days: [
      createWorkoutDay(1, 'Push Pull A', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 38),
      createRestDay(2),
      createWorkoutDay(3, 'Push Pull B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'upper-back-3', sets: 4, repetitions: 10, restBetweenSets: 75 },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-6', sets: 3, duration: 0.5, restBetweenSets: 60 },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Push Pull C', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true },
        { exerciseId: 'shoulders-10', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 36),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'athletic-performance',
    title: 'Athlete Base Camp',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['athletic', 'conditioning'],
    bodyParts: ['Full Body', 'Core'],
    programOverview: 'An athletic base week combining strength-endurance, core control, and movement quality.',
    summary: 'Build an athletic base with smarter intensity and repeatable performance.',
    timeFrameExplanation: 'Use crisp technique and steady pacing. Keep quality high as fatigue rises.',
    afterTimeFrame: {
      expectedOutcome: 'Better work capacity and improved movement repeatability.',
      nextSteps: 'Increase density gradually or add progression to unilateral work.',
    },
    whatNotToDo: 'Avoid maximal-intensity efforts that degrade movement quality.',
    days: [
      createWorkoutDay(1, 'Athletic A', [
        { exerciseId: 'cardio-13', duration: 8, warmup: true },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Athletic B', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'obliques-2', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Athletic C', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-1', sets: 4, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'abs-103', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 38),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'mobility-strength',
    title: 'Move Stronger',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['mobility', 'strength'],
    bodyParts: ['Upper Body', 'Lower Body', 'Core'],
    programOverview: 'A blend of strength work and mobility-focused prep to improve movement efficiency.',
    summary: 'Unlock better positions, then turn them into real-world strength.',
    timeFrameExplanation: 'Use mobility prep to improve positions, then reinforce with strict-strength reps.',
    afterTimeFrame: {
      expectedOutcome: 'Improved movement quality with stronger end-range control.',
      nextSteps: 'Increase working sets while keeping mobility prep consistent.',
    },
    whatNotToDo: 'Avoid skipping warmup mobility and forcing painful ranges.',
    days: [
      createWorkoutDay(1, 'Mobility Strength A', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true },
        { exerciseId: 'quads-5', sets: 4, repetitions: 10, restBetweenSets: 75 },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 38),
      createRestDay(2),
      createWorkoutDay(3, 'Mobility Strength B', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Mobility Strength C', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 36),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'upper-lower-hybrid',
    title: 'Hybrid Strength Flow',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['hybrid', 'strength'],
    bodyParts: ['Upper Body', 'Lower Body'],
    programOverview: 'A hybrid week alternating upper and lower emphasis while keeping full-body balance.',
    summary: 'Alternate upper and lower focus for balanced strength without burnout.',
    timeFrameExplanation: 'Alternate emphasis days and keep movement quality high across all patterns.',
    afterTimeFrame: {
      expectedOutcome: 'Improved training balance and manageable weekly fatigue.',
      nextSteps: 'Progress intensity by day while preserving recovery spacing.',
    },
    whatNotToDo: 'Avoid turning every day into maximal effort.',
    days: [
      createWorkoutDay(1, 'Upper Emphasis', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'biceps-10', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Lower Emphasis', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Hybrid Full Body', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 38),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'muscle-growth-foundation',
    title: 'Muscle Growth Launch',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['hypertrophy', 'strength'],
    bodyParts: ['Chest', 'Back', 'Legs', 'Shoulders'],
    programOverview:
      'A gym-based hypertrophy foundation built to grow muscle with repeatable weekly structure and controlled progression.',
    summary: 'Build visible muscle with smart volume, clean technique, and consistent 30-45 minute sessions.',
    timeFrameExplanation:
      'Train three non-consecutive days with controlled tempo and moderate effort. Stay 1-2 reps from failure on most sets to keep quality high and recovery smooth.',
    afterTimeFrame: {
      expectedOutcome: 'Improved muscle pump, better lifting confidence, and stronger week-to-week performance.',
      nextSteps: 'Progress one variable next week: load, reps, or one extra set on your first two exercises.',
    },
    whatNotToDo: 'Avoid sloppy tempo, ego loading, and pushing every set to failure.',
    days: [
      createWorkoutDay(1, 'Hypertrophy A', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'chest-7', sets: 4, repetitions: 8, restBetweenSets: 90 },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 10, restBetweenSets: 75 },
        { exerciseId: 'shoulders-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'biceps-10', sets: 3, repetitions: 12, restBetweenSets: 60 },
      ], 42),
      createRestDay(2),
      createWorkoutDay(3, 'Hypertrophy B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'quads-5', sets: 4, repetitions: 12, restBetweenSets: 90 },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 90 },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 10, restBetweenSets: 75 },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ], 44),
      createRestDay(4),
      createWorkoutDay(5, 'Hypertrophy C', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 10, restBetweenSets: 75 },
        { exerciseId: 'upper-back-3', sets: 4, repetitions: 8, restBetweenSets: 90 },
        { exerciseId: 'triceps-4', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 40),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'strength-endurance-30-45',
    title: 'Power in 45',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['strength endurance'],
    bodyParts: ['Upper Body', 'Lower Body', 'Core'],
    programOverview: 'A 30-45 minute program targeting strength-endurance across major movement patterns.',
    summary: 'Maximize strength-endurance in a focused 30-45 minute training window.',
    timeFrameExplanation: 'Keep rest times honest and use moderate reps with clean movement quality.',
    afterTimeFrame: {
      expectedOutcome: 'Higher training density and improved repeatable output.',
      nextSteps: 'Either increase load modestly or reduce rest slightly next week.',
    },
    whatNotToDo: 'Avoid sacrificing mechanics just to move faster.',
    days: [
      createWorkoutDay(1, 'Density A', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true },
        { exerciseId: 'quads-5', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 35),
      createRestDay(2),
      createWorkoutDay(3, 'Density B', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 15, restBetweenSets: 60 },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'abs-103', sets: 3, repetitions: 10, restBetweenSets: 60 },
      ], 37),
      createRestDay(4),
      createWorkoutDay(5, 'Density C', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
      ], 40),
      createRestDay(6),
      createRestDay(7),
    ],
  },
];

export const exercisePrograms: any[] = exerciseProgramTemplates.map((template) =>
  ensureWorkoutDensity({
    ...template,
    createdAt: new Date('2025-06-02T00:00:00Z'),
  })
);

export const exerciseProgramSlugs: Record<string, number> = exerciseProgramTemplates.reduce(
  (acc, template, index) => {
    acc[template.slug] = index;
    return acc;
  },
  {} as Record<string, number>
);

export const getAvailableExerciseSlugs = (): string[] => Object.keys(exerciseProgramSlugs);

export const getExerciseProgramBySlug = (slug: string) => {
  const index = exerciseProgramSlugs[slug.toLowerCase()];
  if (typeof index !== 'number') return null;
  return exercisePrograms[index] || null;
};

export const getExerciseUserProgramBySlug = (slug: string) => {
  const program = getExerciseProgramBySlug(slug);
  if (!program) return null;

  const today = new Date();
  const title = program.title || 'Custom Exercise Program';

  return {
    programs: [{ ...program, createdAt: today }],
    diagnosis: {
      summary: 'Custom exercise program selected.',
      selectedBodyGroup: null,
      selectedBodyPart: null,
      informationalInsights: 'A predefined custom exercise program for general training goals.',
      painfulAreas: null,
      onset: null,
      painLocation: null,
      painScale: null,
      painCharacter: null,
      aggravatingFactors: null,
      relievingFactors: null,
      painPattern: null,
      priorInjury: null,
      mechanismOfInjury: null,
      assessmentComplete: true,
      redFlagsPresent: false,
      diagnosis: title,
      timeFrame: '1 week',
      avoidActivities: null,
      targetAreas: (program.targetAreas || []).join(', '),
      followUpQuestions: [],
      programType: ProgramType.Exercise,
    },
    questionnaire: {
      age: '25-40',
      lastYearsExerciseFrequency: '2-3 times per week',
      numberOfActivityDays: '3',
      generallyPainfulAreas: [],
      exerciseEnvironments: program.exerciseEnvironment || 'Large Gym',
      workoutDuration: '30-45 minutes',
      targetAreas: program.targetAreas || [],
      experienceLevel: 'beginner',
      equipment: program.equipment || [
        'barbell',
        'dumbbells',
        'cable_machine',
        'machine',
        'bench',
        'bodyweight',
      ],
    },
    active: true,
    createdAt: today.toISOString(),
    updatedAt: today,
    type: ProgramType.Exercise,
    timeFrame: '1 week',
    title,
    docId: `custom-exercise-${slug}-${Date.now()}`,
  };
};
