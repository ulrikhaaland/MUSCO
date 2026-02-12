// @ts-nocheck
import { ProgramType } from '../../../shared/types';

const formatWorkoutDescription = (description: string): string => {
  const cleaned = (description || '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');
  if (!cleaned) return 'Focus: Full-body training. Keep tempo controlled and leave 1-2 reps in reserve.';
  if (cleaned.toLowerCase().startsWith('focus:')) {
    return `${cleaned}. Keep tempo controlled and leave 1-2 reps in reserve.`;
  }
  return `Focus: ${cleaned}. Keep tempo controlled and leave 1-2 reps in reserve.`;
};

const formatRestDescription = (description: string): string => {
  const cleaned = (description || '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');
  if (!cleaned) return 'Rest day. Optional light mobility and easy walking.';
  if (cleaned.toLowerCase().startsWith('rest day')) return `${cleaned}.`;
  return `Rest day. ${cleaned}.`;
};

const isWarmupExerciseRef = (exercise: any): boolean => {
  if (!exercise) return false;
  if (exercise.warmup === true) return true;
  const exerciseId =
    typeof exercise.exerciseId === 'string' ? exercise.exerciseId : '';
  return exerciseId.startsWith('warmup-');
};

const isFinisherExerciseRef = (exercise: any): boolean => {
  if (!exercise) return false;
  if (exercise.warmup === true) return false;
  const exerciseId =
    typeof exercise.exerciseId === 'string' ? exercise.exerciseId : '';
  return exerciseId.startsWith('cardio-');
};

const orderWorkoutExercisesCanonical = (exercises: any[]): any[] => {
  if (!Array.isArray(exercises) || exercises.length === 0) return exercises;
  const warmups = exercises.filter(isWarmupExerciseRef);
  const finishers = exercises.filter(isFinisherExerciseRef);
  const primaryAndAccessory = exercises.filter(
    (exercise) => !isWarmupExerciseRef(exercise) && !isFinisherExerciseRef(exercise)
  );
  return [...warmups, ...primaryAndAccessory, ...finishers];
};

const createWorkoutDay = (
  day: number,
  description: string,
  exercises: any[],
  duration: number = 35
) => ({
  description:
    description.includes('Progression rule:')
      ? formatWorkoutDescription(description)
      : formatWorkoutDescription(
          `${description}. Progression rule: progress load 2-5% in a later session only if all sets hit target reps with clean form and about 1-2 reps in reserve.`
        ),
  day,
  dayType: 'strength',
  exercises: orderWorkoutExercisesCanonical(exercises),
  duration,
});

const createRestDay = (
  day: number,
  description: string = 'Rest day. Optional light mobility and easy walking.',
) => ({
  day,
  description: formatRestDescription(description),
  dayType: 'rest',
  exercises: [
    { exerciseId: 'warmup-8', sets: 1, repetitions: 15, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
    { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
  ],
  duration: 15,
  isRestDay: true,
});

const estimateExerciseDurationSeconds = (exercise: any): number => {
  if (!exercise) return 0;

  const setupBufferSeconds = isWarmupExercise(exercise) ? 45 : 90;

  if (exercise.sets && exercise.duration) {
    const holdSecondsPerSet = Number(exercise.duration) * 60;
    const totalHoldTime = Number(exercise.sets) * holdSecondsPerSet;
    const restTime = exercise.restBetweenSets
      ? (Number(exercise.sets) - 1) * Number(exercise.restBetweenSets)
      : 0;
    return totalHoldTime + restTime + setupBufferSeconds;
  }

  if (exercise.duration) {
    return Number(exercise.duration) * 60 + setupBufferSeconds;
  }

  if (exercise.sets && exercise.repetitions) {
    const timePerRepSeconds = 8;
    const perSetTime = Number(exercise.repetitions) * timePerRepSeconds;
    const totalWorkTime = Number(exercise.sets) * perSetTime;
    const restTime = exercise.restBetweenSets
      ? (Number(exercise.sets) - 1) * Number(exercise.restBetweenSets)
      : 0;
    return totalWorkTime + restTime + setupBufferSeconds;
  }

  return 60 + setupBufferSeconds;
};

const estimateWorkoutDayMinutes = (day: any): number => {
  const exercises = Array.isArray(day?.exercises) ? day.exercises : [];
  const baselineSessionOverheadSeconds = 180;
  const totalSeconds = exercises.reduce((sum: number, exercise: any) => {
    return sum + estimateExerciseDurationSeconds(exercise);
  }, baselineSessionOverheadSeconds);
  return Math.ceil(totalSeconds / 60);
};

const isWarmupExercise = (exercise: any): boolean => {
  if (!exercise) return false;
  if (exercise.warmup === true) return true;
  const id = typeof exercise.exerciseId === 'string' ? exercise.exerciseId : '';
  return id.startsWith('warmup-');
};

const validateExerciseProgramDurations = (programs: any[]): void => {
  const MIN_MINUTES = 30;
  const MAX_MINUTES = 45;
  const violations: string[] = [];

  for (const program of programs) {
    const slug = program?.slug || program?.title || 'unknown-program';
    for (const day of program?.days || []) {
      if (day?.isRestDay || day?.dayType === 'rest') continue;
      const estimatedMinutes = estimateWorkoutDayMinutes(day);
      if (estimatedMinutes < MIN_MINUTES || estimatedMinutes > MAX_MINUTES) {
        violations.push(
          `${slug} day ${day?.day}: estimated ${estimatedMinutes} min (target ${MIN_MINUTES}-${MAX_MINUTES})`
        );
      }
    }
  }

  if (violations.length > 0) {
    throw new Error(
      `Custom exercise duration validation failed:\\n${violations.join('\\n')}`
    );
  }
};

const MAX_COPY_SENTENCE_WORDS = 34;
const BANNED_VAGUE_PHRASES = ['etc', 'and so on', 'things', 'stuff'];
const SUMMARY_OUTCOME_REGEX =
  /\b(build|improve|increase|maximize|grow|boost|unlock|train|get)\b/i;

const splitSentences = (value: string): string[] =>
  value
    .split(/[.!?]+/g)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

const countWords = (value: string): number =>
  value
    .trim()
    .split(/\s+/g)
    .filter(Boolean).length;

const validateCopyBlock = (
  value: string,
  label: string,
  context: string,
  errors: string[]
) => {
  const normalized = (value || '').trim();
  if (!normalized) {
    errors.push(`${context}: ${label} is empty`);
    return;
  }

  const lower = normalized.toLowerCase();
  for (const phrase of BANNED_VAGUE_PHRASES) {
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const phraseRegex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (phraseRegex.test(lower)) {
      errors.push(`${context}: ${label} contains vague phrase "${phrase}"`);
    }
  }

  for (const sentence of splitSentences(normalized)) {
    const words = countWords(sentence);
    if (words > MAX_COPY_SENTENCE_WORDS) {
      errors.push(
        `${context}: ${label} has long sentence (${words} words, max ${MAX_COPY_SENTENCE_WORDS})`
      );
      break;
    }
  }
};

const validateExerciseCopyQuality = (programs: any[]): void => {
  const errors: string[] = [];

  for (const program of programs) {
    const context = `exercise program "${program.slug || 'unknown'}"`;

    validateCopyBlock(program.summary, 'summary', context, errors);
    validateCopyBlock(program.programOverview, 'programOverview', context, errors);
    validateCopyBlock(program.timeFrameExplanation, 'timeFrameExplanation', context, errors);

    if (!SUMMARY_OUTCOME_REGEX.test(program.summary || '')) {
      errors.push(`${context}: summary must be outcome-oriented (missing key outcome verb)`);
    }

    if (!(program.timeFrameExplanation || '').includes('Train 3 non-consecutive sessions this week')) {
      errors.push(
        `${context}: timeFrameExplanation must include "Train 3 non-consecutive sessions this week"`
      );
    }
  }

  if (errors.length > 0) {
    throw new Error(`Custom exercise copy QA failed:\\n${errors.join('\\n')}`);
  }
};

const exerciseProgramTemplates = [
  {
    slug: 'full-body-strength',
    title: 'Full-Body Strength Accelerator',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['full body', 'strength'],
    bodyParts: ['Upper Body', 'Lower Body', 'Core'],
    programOverview:
      'A high-return full-body week built around foundational push, pull, squat, and hinge patterns. You get enough volume to drive visible progress while keeping recovery manageable and execution quality high.',
    summary: 'Build noticeable full-body strength in one week with a structure that is simple, hard, and repeatable.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Keep 1-3 reps in reserve, use controlled tempo, and track loads for progression decisions.',
    afterTimeFrame: {
      expectedOutcome: 'Improved movement confidence and consistent week-to-week training rhythm.',
      nextSteps: 'Progress load slightly or add one set to your primary movements when performance is stable.',
    },
    whatNotToDo:
      'Do not rush reps, skip warm-up sets, or push to technical failure on every set.',
    days: [
      createWorkoutDay(1, 'Full Body A', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'quads-5', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Brace on each rep and keep pelvis stable throughout' },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Full Body B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
      ], 38),
      createRestDay(4),
      createWorkoutDay(5, 'Full Body C', [
        { exerciseId: 'cardio-13', duration: 8, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Pull with upper-back control and keep neck relaxed' },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 36),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'upper-body-build',
    title: 'Upper Body Blueprint',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['upper body', 'strength'],
    bodyParts: ['Shoulders', 'Upper Back', 'Arms'],
    programOverview:
      'An upper-body focused week designed to add size and pressing-pulling strength without sacrificing shoulder mechanics. Volume is high enough to drive adaptation, but balanced to keep joints happy.',
    summary: 'Build broader shoulders, stronger pulls, and cleaner presses with a high-appeal upper-body split.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Use moderate-to-challenging loads, keep shoulder blades controlled, and avoid shrug-dominant effort.',
    afterTimeFrame: {
      expectedOutcome: 'Better upper-body endurance and more stable shoulder mechanics.',
      nextSteps: 'Progress reps or load slightly while preserving form quality.',
    },
    whatNotToDo: 'Avoid ego loading and painful overhead ranges.',
    days: [
      createWorkoutDay(1, 'Upper Push + Pull', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 15, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Pull with upper-back control and keep neck relaxed' },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Upper Volume', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'upper-back-3', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'shoulders-1', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Press with stable ribs and avoid shrugging into the neck' },
        { exerciseId: 'biceps-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control curl tempo and keep elbows fixed at your sides' },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Upper Mixed', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'upper-back-8', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Maintain scapular control and pause briefly at peak contraction' },
        { exerciseId: 'triceps-4', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Lock in upper-arm position and extend with full control' },
      ], 36),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'lower-body-strength',
    title: 'Leg Power Protocol',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['lower body', 'strength'],
    bodyParts: ['Glutes', 'Upper Legs', 'Lower Legs'],
    programOverview:
      'A lower-body dominant week built to grow stronger legs, more powerful glutes, and better squat-hinge mechanics. Sessions combine heavy-enough work with clean execution for fast carryover.',
    summary: 'Build stronger legs and glutes fast with a lower-body block that feels athletic and effective.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Use controlled tempo, full-foot pressure, and clean knee-hip alignment before increasing load.',
    afterTimeFrame: {
      expectedOutcome: 'Improved lower-body strength endurance and movement control.',
      nextSteps: 'Progress by adding load or one additional set to the main lift.',
    },
    whatNotToDo: 'Avoid uncontrolled depth and poor trunk stability under fatigue.',
    days: [
      createWorkoutDay(1, 'Lower A', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Drive knees in line with toes and keep torso position stable' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 42),
      createRestDay(2),
      createWorkoutDay(3, 'Lower B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'calves-10', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Use strict single-leg control and stop before balance breaks down' },
      ], 38),
      createRestDay(4),
      createWorkoutDay(5, 'Lower C', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true , modification: 'Open ankle range gently and keep movement pain-free and smooth' },
        { exerciseId: 'quads-5', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
      ], 40),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'bodyweight-conditioning',
    title: 'Home Shred Circuit',
    exerciseEnvironment: 'Custom',
    equipment: ['bodyweight', 'resistance_bands'],
    targetAreas: ['conditioning', 'full body'],
    bodyParts: ['Upper Body', 'Lower Body', 'Core'],
    programOverview: 'A bodyweight-and-band week that blends conditioning and strength endurance in short, efficient sessions.',
    summary: 'Get sweaty, strong, and consistent at home with fast-paced sessions that still keep form quality high.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Keep transitions tight, move with intent, and maintain form quality as fatigue climbs.',
    afterTimeFrame: {
      expectedOutcome: 'Better conditioning base and work capacity.',
      nextSteps: 'Increase rounds or reduce rest intervals when session quality remains high.',
    },
    whatNotToDo: 'Avoid sloppy reps and breath-holding during circuits.',
    days: [
      createWorkoutDay(1, 'Circuit A', [
        { exerciseId: 'cardio-13', duration: 8, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-190', sets: 4, repetitions: 15, restBetweenSets: 45 , modification: 'Keep knee tracking clean and maintain even pressure through both feet' },
        { exerciseId: 'abs-20', sets: 4, repetitions: 10, restBetweenSets: 45 , modification: 'Brace on each rep and keep pelvis stable throughout' },
        { exerciseId: 'glutes-7', sets: 4, repetitions: 15, restBetweenSets: 45 , modification: 'Pause at top and finish each rep with full hip extension control' },
      ], 35),
      createRestDay(2),
      createWorkoutDay(3, 'Circuit B', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'upper-back-60', sets: 4, repetitions: 12, restBetweenSets: 45 , modification: 'Use strict band tension and keep posture stacked' },
        { exerciseId: 'abs-6', sets: 4, duration: 0.5, restBetweenSets: 45 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
        { exerciseId: 'calves-6', sets: 4, repetitions: 15, restBetweenSets: 45 , modification: 'Control both upward and downward phases with no bouncing' },
      ], 36),
      createRestDay(4),
      createWorkoutDay(5, 'Circuit C', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 12, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'glutes-44', sets: 4, repetitions: 15, restBetweenSets: 45 , modification: 'Maintain pelvis level and avoid trunk compensation' },
        { exerciseId: 'quads-190', sets: 4, repetitions: 12, restBetweenSets: 45 , modification: 'Keep knee tracking clean and maintain even pressure through both feet' },
        { exerciseId: 'abs-20', sets: 4, repetitions: 10, restBetweenSets: 45 , modification: 'Brace on each rep and keep pelvis stable throughout' },
      ], 35),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'core-endurance',
    title: 'Core Command Home',
    exerciseEnvironment: 'Custom',
    equipment: ['bodyweight', 'resistance_bands'],
    targetAreas: ['core', 'endurance'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
    programOverview: 'A core-first week focused on anti-extension, anti-rotation, and trunk endurance to build a stronger midline.',
    summary: 'Build a visibly stronger, more stable core with structured home sessions that actually progress.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Use strict breathing and form control, and stop each set before technique drops.',
    afterTimeFrame: {
      expectedOutcome: 'Improved trunk stability and reduced early core fatigue.',
      nextSteps: 'Add longer holds or more unilateral challenges when control remains consistent.',
    },
    whatNotToDo: 'Avoid compensatory lumbar extension and rushed reps.',
    days: [
      createWorkoutDay(1, 'Core A', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'abs-20', sets: 4, repetitions: 10, restBetweenSets: 60 , modification: 'Brace on each rep and keep pelvis stable throughout' },
        { exerciseId: 'abs-6', sets: 4, duration: 0.67, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep anti-rotation tension while moving slowly and cleanly' },
      ], 38),
      createRestDay(2),
      createWorkoutDay(3, 'Core B', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'abs-121', sets: 4, repetitions: 10, restBetweenSets: 60 , modification: 'Drive through controlled anti-rotation and avoid trunk sway' },
        { exerciseId: 'obliques-14', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use controlled side-chain engagement with stable breathing' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Pause at top and finish each rep with full hip extension control' },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Core C', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'abs-120', sets: 4, repetitions: 10, restBetweenSets: 60 , modification: 'Control the lowering phase and keep low back position stable' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Brace on each rep and keep pelvis stable throughout' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
      ], 37),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'glute-core-build',
    title: 'Glute & Core Forge',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['glutes', 'core'],
    bodyParts: ['Glutes', 'Core', 'Lower Back'],
    programOverview: 'A focused week to build stronger glutes and tighter core control for better power transfer and posture.',
    summary: 'Grow your glutes and lock in core strength with a high-value posterior-chain biased split.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Prioritize hip extension quality and trunk control before increasing range or load.',
    afterTimeFrame: {
      expectedOutcome: 'Stronger glute engagement and improved pelvic stability.',
      nextSteps: 'Add unilateral progression or additional posterior-chain volume.',
    },
    whatNotToDo: 'Avoid lumbar-driven extension and uncontrolled hinging.',
    days: [
      createWorkoutDay(1, 'Glute Core A', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 15, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 10, restBetweenSets: 60 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 36),
      createRestDay(2),
      createWorkoutDay(3, 'Glute Core B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
        { exerciseId: 'calves-1', sets: 2, repetitions: 12, restBetweenSets: 45 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Glute Core C', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true , modification: 'Open ankle range gently and keep movement pain-free and smooth' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use strict lateral control and keep tension through glutes' },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 38),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'push-pull-balance',
    title: 'Push-Pull Mastery',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['upper body', 'balance'],
    bodyParts: ['Shoulders', 'Upper Back', 'Core'],
    programOverview: 'A balanced push-pull week designed to improve upper-body symmetry, shoulder function, and visual development.',
    summary: 'Build a more complete upper body by pairing strong pressing with equally strong pulling volume.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Match push and pull quality each day and keep effort out of the neck.',
    afterTimeFrame: {
      expectedOutcome: 'Improved upper-body balance and cleaner pressing/pulling mechanics.',
      nextSteps: 'Increase load progression while maintaining push-pull parity.',
    },
    whatNotToDo: 'Avoid overloaded pressing without matching pull volume.',
    days: [
      createWorkoutDay(1, 'Push Pull A', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Pull with upper-back control and keep neck relaxed' },
      ], 38),
      createRestDay(2),
      createWorkoutDay(3, 'Push Pull B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'upper-back-3', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.5, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
        { exerciseId: 'biceps-10', sets: 2, repetitions: 12, restBetweenSets: 45 , modification: 'Control curl tempo and keep elbows fixed at your sides' },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Push Pull C', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'shoulders-10', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-1', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Press with stable ribs and avoid shrugging into the neck' },
      ], 36),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'athletic-performance',
    title: 'Athletic Base Builder',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['athletic', 'conditioning'],
    bodyParts: ['Full Body', 'Core'],
    programOverview: 'An athletic base week combining strength-endurance, trunk control, and repeatable movement quality under fatigue.',
    summary: 'Build athletic capacity you can feel in real movement with sessions that reward power plus control.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Use crisp technique and steady pacing while keeping movement quality high under fatigue.',
    afterTimeFrame: {
      expectedOutcome: 'Better work capacity and improved movement repeatability.',
      nextSteps: 'Increase density gradually or add progression to unilateral work.',
    },
    whatNotToDo: 'Avoid maximal-intensity efforts that degrade movement quality.',
    days: [
      createWorkoutDay(1, 'Athletic A', [
        { exerciseId: 'cardio-13', duration: 8, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Drive knees in line with toes and keep torso position stable' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Athletic B', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'obliques-2', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Rotate with control from trunk and keep hips stable' },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Athletic C', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'calves-1', sets: 4, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
        { exerciseId: 'abs-103', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Move slowly with full trunk control and avoid momentum' },
      ], 38),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'mobility-strength',
    title: 'Mobility x Strength Flow',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['mobility', 'strength'],
    bodyParts: ['Upper Body', 'Lower Body', 'Core'],
    programOverview: 'A hybrid week blending mobility prep with strict strength sets so better positions become stronger positions.',
    summary: 'Improve mobility and build stronger reps by turning better positions into better strength output.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Use mobility prep first, then reinforce positions with strict reps and controlled tempo.',
    afterTimeFrame: {
      expectedOutcome: 'Improved movement quality with stronger end-range control.',
      nextSteps: 'Increase working sets while keeping mobility prep consistent.',
    },
    whatNotToDo: 'Avoid skipping warmup mobility and forcing painful ranges.',
    days: [
      createWorkoutDay(1, 'Mobility Strength A', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true , modification: 'Open ankle range gently and keep movement pain-free and smooth' },
        { exerciseId: 'quads-5', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
      ], 38),
      createRestDay(2),
      createWorkoutDay(3, 'Mobility Strength B', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Brace on each rep and keep pelvis stable throughout' },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Mobility Strength C', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 36),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'upper-lower-hybrid',
    title: 'Upper-Lower Fusion',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['hybrid', 'strength'],
    bodyParts: ['Upper Body', 'Lower Body'],
    programOverview: 'A hybrid week that alternates upper and lower emphasis while maintaining full-body balance and recovery flow.',
    summary: 'Train hard across upper and lower body without burnout using a clean alternating structure.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Alternate upper-lower emphasis and keep quality high across all movement patterns.',
    afterTimeFrame: {
      expectedOutcome: 'Improved training balance and manageable weekly fatigue.',
      nextSteps: 'Progress intensity by day while preserving recovery spacing.',
    },
    whatNotToDo: 'Avoid turning every day into maximal effort.',
    days: [
      createWorkoutDay(1, 'Upper Emphasis', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'biceps-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control curl tempo and keep elbows fixed at your sides' },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Lower Emphasis', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Drive knees in line with toes and keep torso position stable' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Hybrid Full Body', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Pull with upper-back control and keep neck relaxed' },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
        { exerciseId: 'calves-1', sets: 2, repetitions: 12, restBetweenSets: 45 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 38),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'muscle-growth-foundation',
    title: 'Muscle Growth Accelerator',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['hypertrophy', 'strength'],
    bodyParts: ['Chest', 'Back', 'Legs', 'Shoulders'],
    programOverview:
      'A gym-based hypertrophy foundation built to maximize muscle gain with repeatable structure and progressive overload.',
    summary: 'Build visible muscle fast with targeted volume, high-quality reps, and efficient 30-45 minute sessions.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Keep controlled tempo, stay 1-2 reps from failure on most sets, and track progression each workout.',
    afterTimeFrame: {
      expectedOutcome: 'Improved muscle pump, better lifting confidence, and stronger week-to-week performance.',
      nextSteps: 'Progress one variable at a time: load, reps, or one extra set on your first two exercises.',
    },
    whatNotToDo: 'Avoid sloppy tempo, ego loading, and pushing every set to failure.',
    days: [
      createWorkoutDay(1, 'Hypertrophy A', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'chest-7', sets: 4, repetitions: 8, restBetweenSets: 90 , modification: 'Press with stable shoulder position and controlled lowering' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-1', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Press with stable ribs and avoid shrugging into the neck' },
        { exerciseId: 'biceps-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control curl tempo and keep elbows fixed at your sides' },
      ], 42),
      createRestDay(2),
      createWorkoutDay(3, 'Hypertrophy B', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'quads-5', sets: 4, repetitions: 12, restBetweenSets: 90 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 10, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 44),
      createRestDay(4),
      createWorkoutDay(5, 'Hypertrophy C', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'upper-back-3', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'triceps-4', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Lock in upper-arm position and extend with full control' },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 40),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'strength-endurance-30-45',
    title: 'Power Density 45',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['strength endurance'],
    bodyParts: ['Upper Body', 'Lower Body', 'Core'],
    programOverview: 'A dense 30-45 minute plan targeting strength-endurance across core movement patterns.',
    summary: 'Get stronger and fitter in under 45 minutes with high-density sessions that still prioritize form.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Keep rest times honest, use moderate reps, and treat each day as a form-first benchmark.',
    afterTimeFrame: {
      expectedOutcome: 'Higher training density and improved repeatable output.',
      nextSteps: 'Either increase load modestly or reduce rest slightly when execution remains clean.',
    },
    whatNotToDo: 'Avoid sacrificing mechanics just to move faster.',
    days: [
      createWorkoutDay(1, 'Density A', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-5', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'abs-107', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 35),
      createRestDay(2),
      createWorkoutDay(3, 'Density B', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 15, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'abs-103', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Move slowly with full trunk control and avoid momentum' },
      ], 37),
      createRestDay(4),
      createWorkoutDay(5, 'Density C', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'calves-1', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 40),
      createRestDay(6),
      createRestDay(7),
    ],
  },
];

validateExerciseCopyQuality(exerciseProgramTemplates);

const builtExercisePrograms: any[] = exerciseProgramTemplates.map((template) => ({
  ...template,
  createdAt: new Date('2025-06-02T00:00:00Z'),
}));

validateExerciseProgramDurations(builtExercisePrograms);

export const exercisePrograms: any[] = builtExercisePrograms;

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
