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
      'This full-body block builds strength across squat, hinge, push, and pull patterns with a practical gym split. Volume is high enough for visible progress while still protecting recovery quality between sessions. You should feel stronger on core lifts, steadier under fatigue, and more confident repeating hard training weeks.',
    summary: 'Build noticeable full-body strength with a structure that is simple, hard, and repeatable. Each session trains major movement patterns so progress is visible and trackable.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Keep 1-3 reps in reserve, control each eccentric, and log loads for objective progression. Keep rest periods consistent so performance comparisons are valid across sessions.',
    afterTimeFrame: {
      expectedOutcome: 'Improved movement confidence, stronger main-lift execution, and steadier weekly training rhythm. Most lifters also notice cleaner setup and bracing under fatigue.',
      nextSteps: 'Next week will be tailored from your feedback on this week, including effort, form quality, and recovery response. The follow-up plan may increase, maintain, or reduce load and volume based on how you actually performed.',
    },
    whatNotToDo:
      'Do not rush reps, skip warm-up sets, or push to technical failure on every set. Avoid adding load when setup, bracing, or bar path is inconsistent.',
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
      'This upper-body plan targets shoulders, back, and arms with balanced push-pull stress across the week. It builds visible size while reinforcing shoulder mechanics that hold up under higher training volume. Expect stronger pressing confidence, cleaner pulls, and better upper-body posture under load.',
    summary: 'Build broader shoulders, stronger pulls, and cleaner presses with a balanced upper-body split. The week prioritizes symmetry so size gains do not compromise joint control.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Use moderate-to-challenging loads and keep scapular control on every rep. Match push quality with pull quality and keep neck tension low.',
    afterTimeFrame: {
      expectedOutcome: 'Better upper-body endurance, stronger pull mechanics, and more stable shoulders during pressing. You should also feel less front-shoulder strain in repeated sets.',
      nextSteps: 'Next week will be tailored from your feedback on this week, especially shoulder comfort, pulling balance, and execution quality. The follow-up plan may increase, maintain, or reduce intensity based on your real session response.',
    },
    whatNotToDo: 'Avoid ego loading, painful overhead ranges, and shrug-dominant pressing. Reduce intensity if neck tension or front-shoulder pinching increases across sessions.',
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
      'This lower-body block emphasizes quad strength, hip power, and posterior-chain control in one focused week. Sessions prioritize clean mechanics first, then layer enough overload to drive measurable adaptation. Expect stronger leg output, cleaner depth control, and better lower-body stability under fatigue.',
    summary: 'Build stronger legs and glutes fast with a lower-body block that feels athletic and effective. Sessions are heavy enough to challenge strength while protecting technique quality.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Use controlled tempo, full-foot pressure, and strict knee-hip alignment before increasing load. Treat each set as a quality rep audit, not just a volume target.',
    afterTimeFrame: {
      expectedOutcome: 'Improved lower-body strength endurance, cleaner squat and hinge mechanics, and better force output. Fatigue should feel more local to working muscles with less form collapse.',
      nextSteps: 'Next week will be tailored from your feedback on this week, including movement quality, knee-hip control, and recovery. The follow-up plan may progress, hold, or scale volume depending on how consistently you maintained form.',
    },
    whatNotToDo: 'Avoid uncontrolled depth, collapsed arches, and trunk instability under fatigue. Stop sets early when knee tracking or pelvic control clearly degrades.',
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
    programOverview: 'This home plan blends conditioning and strength endurance using bodyweight and band work in dense sessions. The structure minimizes setup friction while still delivering enough training stress for visible progress. Expect better work capacity, cleaner movement control, and easier routine adherence.',
    summary: 'Get sweaty, strong, and consistent at home with fast-paced sessions that keep form quality high. This week improves capacity without requiring complex setup or machines.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Keep transitions tight, move with intent, and maintain technical quality as breathing rises. Record round completion quality so progression stays performance-based.',
    afterTimeFrame: {
      expectedOutcome: 'Better conditioning base, stronger bodyweight endurance, and more repeatable session output. You should recover faster between rounds by the third session.',
      nextSteps: 'Next week will be tailored from your feedback on this week, including conditioning response, fatigue pattern, and technique consistency. The follow-up plan may adjust density, rest, or exercise selection to match your current capacity.',
    },
    whatNotToDo: 'Avoid sloppy reps, breath-holding, and racing through transitions without control. Pause briefly when technique drops, then resume at a sustainable pace.',
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
    programOverview: 'This core-focused week develops anti-extension control, anti-rotation strength, and trunk endurance with progressive volume. The structure improves force transfer through your torso during lifting, running, and daily movement patterns. Expect a stronger midline, less early fatigue, and more confident bracing under effort.',
    summary: 'Build a stronger and more stable core with structured home sessions that clearly progress. The week improves bracing endurance you can feel during lifting and daily movement.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Use strict breathing, neutral spine control, and stop each set before position quality declines. Prioritize stable rib-pelvis alignment over longer set duration.',
    afterTimeFrame: {
      expectedOutcome: 'Improved trunk stability, stronger anti-rotation control, and reduced early core fatigue. You should notice better posture control during compound lifts.',
      nextSteps: 'Next week will be tailored from your feedback on this week, focusing on bracing quality, trunk control, and fatigue. The follow-up plan may progress, maintain, or simplify core demands based on execution stability.',
    },
    whatNotToDo: 'Avoid compensatory lumbar extension, rushed reps, and excessive neck tension during bracing work. Regress immediately if you cannot keep ribs stacked over pelvis.',
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
    programOverview: 'This glute-and-core split targets posterior-chain strength and pelvic control with focused loading and repeatable structure. It improves hip drive, trunk stiffness, and force transfer for squatting, hinging, and daily movement. Expect stronger hip extension, cleaner posture control, and more stable compound-lift mechanics.',
    summary: 'Grow your glutes and lock in core strength with a posterior-chain biased split. Sessions build hip drive and pelvic control that carry into squats and hinges.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Prioritize hip extension quality, pelvic control, and full lockout before increasing range or load. Keep trunk tension consistent during every hinge and bridge pattern.',
    afterTimeFrame: {
      expectedOutcome: 'Stronger glute engagement, improved pelvic stability, and cleaner posterior-chain coordination. Most users report less low-back takeover during hip extension work.',
      nextSteps: 'Next week will be tailored from your feedback on this week, especially glute engagement, pelvic control, and lumbar compensation. The follow-up plan may adjust hinge volume, loading, and exercise complexity based on control quality.',
    },
    whatNotToDo: 'Avoid lumbar-driven extension, uncontrolled hinging, and rushed lockouts at the top. Lower load if you cannot feel glutes driving the final phase of each rep.',
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
    programOverview: 'This push-pull plan balances pressing and rowing volume to improve upper-body symmetry and shoulder health. It builds muscle while reinforcing mechanics that stay stable under repeated effort and moderate fatigue. Expect cleaner posture, stronger upper-back engagement, and better pressing stability week to week.',
    summary: 'Build a more complete upper body by pairing strong pressing with equal pulling volume. This structure improves aesthetics and shoulder resilience at the same time.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Match push and pull quality each day, and keep shoulder blades controlled through full ranges. Keep one technical reserve rep before form drift in every major set.',
    afterTimeFrame: {
      expectedOutcome: 'Improved upper-body balance, cleaner pressing and pulling mechanics, and lower neck-dominant compensation. Session quality should feel more even between chest and back work.',
      nextSteps: 'Next week will be tailored from your feedback on this week, including shoulder response and push-pull balance quality. The follow-up plan may rebalance volume, keep intensity steady, or progress loading based on your session outcomes.',
    },
    whatNotToDo: 'Avoid overloaded pressing without matched pull volume or scapular control. Scale sets if pressing mechanics drift or rows lose full-range control.',
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
    programOverview: 'This athletic base week combines strength-endurance, trunk control, and quality movement under manageable fatigue. It is designed for repeatable performance improvements instead of random intensity spikes that limit consistency. Expect better pacing, sharper mechanics, and stronger whole-body output across the week.',
    summary: 'Build athletic capacity you can feel in real movement with sessions that reward power plus control. This week improves repeatable output rather than one-off hard efforts.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Use crisp technique, steady pacing, and controlled breathing while keeping movement quality high under fatigue. Track how well form holds in the final third of each workout.',
    afterTimeFrame: {
      expectedOutcome: 'Better work capacity, improved movement repeatability, and stronger fatigue-resistant execution. Expect fewer technique drops when sessions become metabolically demanding.',
      nextSteps: 'Next week will be tailored from your feedback on this week, with emphasis on pacing, coordination, and fatigue resistance. The follow-up plan may change density, rest structure, or exercise complexity according to your performance trend.',
    },
    whatNotToDo: 'Avoid maximal-intensity efforts that degrade movement quality and pacing discipline. Back off when coordination drops, then rebuild density with cleaner reps.',
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
    programOverview: 'This mobility-strength hybrid uses focused prep work to unlock cleaner ranges before loading them with strict strength sets. It converts short-term mobility gains into usable force production and stable movement control. Expect smoother positions, stronger reps, and better end-range confidence under load.',
    summary: 'Improve mobility and build stronger reps by turning better positions into strength output. This week helps you keep new range when load and fatigue increase.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Use mobility prep first, then reinforce improved positions with strict reps and controlled tempo. Treat prep quality as part of performance, not optional filler.',
    afterTimeFrame: {
      expectedOutcome: 'Improved movement quality, stronger end-range control, and better position retention under fatigue. You should feel less compensation when training through deeper ranges.',
      nextSteps: 'Next week will be tailored from your feedback on this week, especially end-range control and movement quality under load. The follow-up plan may progress, maintain, or regress volume depending on whether control stayed consistent.',
    },
    whatNotToDo: 'Avoid skipping prep mobility, forcing painful ranges, or rushing end-range loading. Regress range immediately if compensations appear in the trunk or shoulders.',
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
    programOverview: 'This upper-lower hybrid alternates emphasis days to spread fatigue and preserve high-quality performance. It keeps full-body progress moving without repeatedly overloading one region or movement pattern. Expect balanced strength gains, better session quality, and a sustainable weekly rhythm you can repeat.',
    summary: 'Train hard across upper and lower body without burnout using a clean alternating structure. The split protects performance while keeping total weekly stimulus high.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Alternate upper-lower emphasis and hold the same quality standard across all primary patterns. Use non-consecutive spacing to keep execution quality high each day.',
    afterTimeFrame: {
      expectedOutcome: 'Improved training balance, manageable weekly fatigue, and more consistent session readiness. Most users feel less overlap soreness between major movement days.',
      nextSteps: 'Next week will be tailored from your feedback on this week, including readiness trends across upper and lower sessions. The follow-up plan may redistribute intensity, volume, and recovery spacing to improve consistency.',
    },
    whatNotToDo: 'Avoid turning every day into maximal effort or stacking hard sets without recovery control. Keep one rep-quality reserve on accessory work when fatigue accumulates.',
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
      'This hypertrophy foundation is built for measurable muscle gain with repeatable weekly structure and progression logic. It combines compound tension, accessory volume, and controlled effort to maximize adaptation in 30-45 minute sessions. Expect stronger pumps, clearer progress markers, and visible physique changes over consistent cycles.',
    summary: 'Build visible muscle fast with targeted volume and high-quality reps in efficient 30-45 minute sessions. The week blends compounds and accessories for clear hypertrophy signals.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Keep controlled tempo, stay 1-2 reps from failure on most sets, and log progression each workout. Keep setup and range quality identical before adding load.',
    afterTimeFrame: {
      expectedOutcome: 'Improved muscle pump, stronger technique under fatigue, and better week-to-week lifting confidence. You should see clearer progress markers in both load and rep quality.',
      nextSteps: 'Next week will be tailored from your feedback on this week, including pump quality, rep control, and recovery response. The follow-up plan may progress, maintain, or reduce hypertrophy stress to keep quality high.',
    },
    whatNotToDo: 'Avoid sloppy tempo, ego loading, and taking every set to failure. Stop sets when rep speed collapses or bracing quality clearly drops.',
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
    programOverview: 'This density-focused plan targets strength-endurance across major movement patterns in efficient 30-45 minute sessions. It increases total output per workout without sacrificing movement quality or position control. Expect stronger conditioning under load and more repeatable performance across sets.',
    summary: 'Get stronger and fitter in under 45 minutes with high-density sessions that still prioritize form. The structure builds conditioning without sacrificing lifting mechanics.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Keep rest intervals honest, use moderate reps, and treat each day as a form-first density benchmark. Track whether final sets still match opening-set mechanics.',
    afterTimeFrame: {
      expectedOutcome: 'Higher training density, better repeatable output, and improved conditioning without form breakdown. You should complete similar work with less perceived effort by week end.',
      nextSteps: 'Next week will be tailored from your feedback on this week, especially form retention under density work. The follow-up plan may adjust load, rest, and session structure according to execution quality and recovery.',
    },
    whatNotToDo: 'Avoid sacrificing mechanics or range quality just to move faster between sets. Slow the pace if breathing spikes enough to compromise setup and control.',
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
