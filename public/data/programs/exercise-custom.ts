// @ts-nocheck
import { ProgramType } from '../../../shared/types';

const normalizeDescription = (description: string, fallback: string): string => {
  const cleaned = (description || '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, '');
  if (!cleaned) return `${fallback}.`;
  const lower = cleaned.toLowerCase();
  const looksLikeExerciseList =
    cleaned.includes('+') ||
    cleaned.includes(':') ||
    /\b(squat|hinge|row|press|pull|core|glute|upper|lower|hypertrophy|density|conditioning)\b/i.test(
      lower
    );

  if (!looksLikeExerciseList) return `${cleaned}.`;

  if (/(conditioning|density|capacity|athletic|circuit)/i.test(lower)) {
    return 'Conditioning-focused session with controlled pacing and clean transitions. Keep breathing steady and reduce speed before technique drops.';
  }

  if (/(core|anti-rotation|anti-extension|trunk)/i.test(lower)) {
    return 'Core-focused session emphasizing trunk stability and controlled breathing. Stop each set when rib-to-pelvis alignment or spinal control drifts.';
  }

  if (/(upper|push|pull|press|row|shoulder|arm)/i.test(lower)) {
    return 'Upper-body strength session with balanced pressing and pulling volume. Keep shoulder control steady and leave 1-2 reps in reserve on each working set.';
  }

  if (/(lower|squat|hinge|leg|glute|posterior|hamstring|quad)/i.test(lower)) {
    return 'Lower-body strength session focused on stable knee and hip mechanics. Prioritize controlled tempo and stop before balance or alignment breaks down.';
  }

  return 'Full-body strength session with controlled effort and repeatable technique. Keep quality consistent across all working sets and avoid training to technical failure.';
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
  description: normalizeDescription(description, 'Full-body training session'),
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

const localizedDayDescriptionsBySlugDayNb: Record<string, Record<number, string>> = {
  'full-body-strength': {
    1: 'Helkroppsøkt med jevn belastning på store muskelgrupper. Bygg kvalitet først og øk belastning senere kun når alle sett er stabile.',
    2: 'Hviledag med lett mobilitet for hofter og brystrygg, samt rolig gange for sirkulasjon.',
    3: 'Styrkeøkt med fokus på kontrollert kraftutvikling og stabil kjerne. Hold tempoet kontrollert og stopp før teknikken faller.',
    4: 'Hviledag med skulderkontroll og lett pusteøvelse for å være klar til neste økt.',
    5: 'Styrkeøkt for baksidekjede og stabilitet under moderat volum. Prioriter rene repetisjoner fremfor ekstra vekt.',
    6: 'Hviledag med kort restitusjonsøkt og lav total belastning.',
    7: 'Hviledag med rolig aktivitet og fokus på søvn, væske og restitusjon.',
  },
  'upper-body-build': {
    1: 'Overkroppsøkt med brystpress, skulderpress og roing i balansert fordeling. Hold skulderbladkontroll i hele utslaget.',
    2: 'Hviledag med lett bryst- og skuldermobilitet uten smerteprovokasjon.',
    3: 'Overkroppsøkt med bryst, lats og skuldervolum. Behold teknisk reserve i alle hovedsett.',
    4: 'Hviledag med rolig aktiv restitusjon og lav nakkebelastning.',
    5: 'Overkroppsøkt med variert belastning og stabil utførelse. Jobb jevnt uten å stresse tempo.',
    6: 'Hviledag med lett tøyning av bryst og rolig scapula-aktivering.',
    7: 'Hviledag med fokus på restitusjon før neste treningsuke.',
  },
  'lower-body-strength': {
    1: 'Underkroppsøkt med fokus på styrke og kontroll i hele bevegelsen. Hold fottrykk jevnt og knelinje stabil i hver repetisjon.',
    2: 'Hviledag med lett ankel- og hoftemobilitet for å redusere stivhet.',
    3: 'Underkroppsøkt med hamstring- og baksidefokus. Øk bare belastning når tempo og kontroll er jevne.',
    4: 'Hviledag med rolig gange og lav mekanisk belastning.',
    5: 'Underkroppsøkt med lår og baksidekjede under kapasitetsfokus. Prioriter teknisk kvalitet foran volumjag.',
    6: 'Hviledag med lett sirkulasjonsarbeid og korte bevegelsespauser.',
    7: 'Hviledag med restitusjon og forberedelse til ny belastning.',
  },
  'bodyweight-conditioning': {
    1: 'Sirkeløkt med høy puls og kontrollert arbeidsflyt. Hold flyten uten å ofre teknisk presisjon.',
    2: 'Hviledag med rolig mobilitet og lett gåtur for å senke stivhet.',
    3: 'Sirkeløkt med fokus på stabilitet og utholdenhet under puls. Styr intensiteten med pust og teknisk kontroll.',
    4: 'Hviledag med lett bevegelse og fokus på å hente seg inn.',
    5: 'Sirkeløkt med tett arbeidsstruktur og jevn kvalitet. Bevar kvalitet når trettheten stiger.',
    6: 'Hviledag med aktiv restitusjon i lavt tempo.',
    7: 'Hviledag med rolig aktivitet og søvnprioritering.',
  },
  'core-endurance': {
    1: 'Kjerneøkt med fokus på stabilitet og kontrollert spenning. Hold ribbein og bekken stabile i alle sett.',
    2: 'Hviledag med lett thorakal mobilitet og rolig pustearbeid.',
    3: 'Kjerneøkt med kontroll under dynamisk belastning. Stopp før du mister nøytral rygg.',
    4: 'Hviledag med korte mobilitetspauser og lett gange.',
    5: 'Kjerneøkt med utholdenhet og sideveis stabilitet. Prioriter kontroll fremfor ekstra repetisjoner.',
    6: 'Hviledag med lavintensiv aktivering av kjerne og hofter.',
    7: 'Hviledag med restitusjon og minimalt stress på korsryggen.',
  },
  'glute-core-build': {
    1: 'Sete- og kjerneøkt med fokus på stabil kraftutvikling. Hold bekkenet stabilt gjennom hele økten.',
    2: 'Hviledag med lett hofteåpning og skånsom kjernemobilitet.',
    3: 'Sete- og kjerneøkt med kontrollert belastning i baksidekjeden. Unngå korsryggdominans i lockout.',
    4: 'Hviledag med rolig aktivitet og fokus på god bevegelseskvalitet.',
    5: 'Sete- og kjerneøkt med volumfokus og stabil utførelse. Øk kun når formen er stabil.',
    6: 'Hviledag med lett mobilitet for hofter og ankler.',
    7: 'Hviledag med restitusjon og klargjøring til neste syklus.',
  },
  'push-pull-balance': {
    1: 'Overkroppsøkt med brystpress, skulderpress og roing for symmetrisk belastning. Match kvalitet i press og roing rep for rep.',
    2: 'Hviledag med skuldermobilitet og lett postural aktivering.',
    3: 'Overkroppsøkt med pullups, roing og teknisk volum. Hold nakkespenn lavt i hele økten.',
    4: 'Hviledag med lav belastning og lett sirkulasjon.',
    5: 'Overkroppsøkt med armhevinger, skulderpress og roing. Prioriter jevn mekanikk fremfor høy hastighet.',
    6: 'Hviledag med lett bevegelse og fokus på skulderkomfort.',
    7: 'Hviledag med restitusjon og kvalitetsforberedelse til ny uke.',
  },
  'athletic-performance': {
    1: 'Atletisk økt med kraft, kontroll og jevn arbeidsrytme. Hold teknikken skarp når pulsen øker.',
    2: 'Hviledag med lett mobilitet og rolig aerob aktivitet.',
    3: 'Atletisk økt med koordinasjon og tempo under belastning. Behold rytme og kontroll i siste del av økten.',
    4: 'Hviledag med lavintensiv restitusjon og bevegelsesflyt.',
    5: 'Atletisk økt med helkroppsoutput og stabil kjernekontroll. Skaler innsatsen før teknikken bryter sammen.',
    6: 'Hviledag med lett sirkulasjon og korte mobilitetspauser.',
    7: 'Hviledag med fokus på søvn og energirestitusjon.',
  },
  'mobility-strength': {
    1: 'Mobilitet- og styrkeøkt med fokus på bedre posisjon før belastning. Bruk den nye bevegeligheten aktivt i styrkesettene.',
    2: 'Hviledag med lett mobilitet for ankler, hofter og brystrygg.',
    3: 'Mobilitet- og styrkeøkt med kontrollert belastning i forbedret posisjon. Hold kvalitet i endeposisjoner.',
    4: 'Hviledag med rolig restitusjon og lav mekanisk belastning.',
    5: 'Mobilitet- og styrkeøkt med kontrollert progresjon i utslag og tempo. Regress ved kompensasjon.',
    6: 'Hviledag med myk bevegelse og lett aktivering.',
    7: 'Hviledag med restitusjon og forberedelse til ny treningsuke.',
  },
  'upper-lower-hybrid': {
    1: 'Overkroppsfokus med press, roing og nedtrekk i balansert fordeling. Hold stabil utførelse på alle arbeidssett.',
    2: 'Hviledag med lett skuldermobilitet og rolig gange.',
    3: 'Underkroppsfokus med kapasitet og kontroll i hele bevegelsen. Kontroller linjer og tempo før eventuell progresjon.',
    4: 'Hviledag med aktiv restitusjon og lav total belastning.',
    5: 'Hybrid helkroppsøkt med kapasitetsfokus og jevn kvalitet. Oppretthold kvalitet selv med akkumulert fatigue.',
    6: 'Hviledag med lett mobilitet og sirkulasjon.',
    7: 'Hviledag med full restitusjon før neste blokk.',
  },
  'muscle-growth-foundation': {
    1: 'Hypertrofiøkt med overkroppsfokus og høy spenningskvalitet. Hold kontrollert eksentrisk fase for bedre spenningskvalitet.',
    2: 'Hviledag med lett mobilitet og rolig aktivitet for restitusjon.',
    3: 'Hypertrofiøkt med underkroppsfokus og jevn teknisk utførelse. Jakt kvalitet i repetisjoner, ikke bare totalmengde.',
    4: 'Hviledag med lavintensiv bevegelse og muskulær avspenning.',
    5: 'Hypertrofiøkt med blandet overkroppsvolum og stabil kjerne. Avslutt sett før teknisk kollaps.',
    6: 'Hviledag med lett mobilitet for områder med høy belastning.',
    7: 'Hviledag med fokus på søvn, ernæring og restitusjon.',
  },
  'strength-endurance-30-45': {
    1: 'Tetthetsøkt med korte pauser og jevn arbeidskvalitet. Hold formkvalitet gjennom hele økten.',
    2: 'Hviledag med lett mobilitet og rolig gange for sirkulasjon.',
    3: 'Tetthetsøkt med kontrollert belastning og stabil teknikk. Juster tempo før teknikken glipper.',
    4: 'Hviledag med aktiv restitusjon i lav intensitet.',
    5: 'Tetthetsøkt med kapasitetsfokus og jevn utførelse. Bevar jevn utførelse i siste arbeidssett.',
    6: 'Hviledag med lett bevegelighet og avspenning.',
    7: 'Hviledag med restitusjon og forberedelse til ny uke.',
  },
};

const localizedExerciseModificationsNb: Record<string, string> = {
  'Brace on each rep and keep pelvis stable throughout':
    'Spenn kjernen i hver repetisjon og hold bekkenet stabilt gjennom hele settet',
  'Control both upward and downward phases with no bouncing':
    'Kontroller både opp- og nedfasen uten å sprette',
  'Control curl tempo and keep elbows fixed at your sides':
    'Kontroller tempoet i curlen og hold albuene stabile inntil kroppen',
  'Control pressing path and keep shoulder blades set':
    'Kontroller pressebanen og hold skulderbladene stabile',
  'Control the eccentric phase and avoid jerky hinge motion':
    'Kontroller den eksentriske fasen og unngå rykkete hengselbevegelse',
  'Control the lowering phase and keep low back position stable':
    'Kontroller senkefasen og hold korsryggen stabil',
  'Drive knees in line with toes and keep torso position stable':
    'Før knærne i linje med tærne og hold overkroppen stabil',
  'Drive through controlled anti-rotation and avoid trunk sway':
    'Jobb med kontrollert antirotasjon og unngå sideveis sva i overkroppen',
  'Hinge from hips with controlled tempo and no lumbar overextension':
    'Hengsle fra hoftene med kontrollert tempo og uten overekstensjon i korsryggen',
  'Hold strong midline tension and keep breathing steady during the set':
    'Hold god kjernespenning og pust jevnt gjennom settet',
  'Keep anti-rotation tension while moving slowly and cleanly':
    'Behold antirotasjonsspenning mens du beveger deg rolig og kontrollert',
  'Keep chest tall and squeeze shoulder blades through each rep':
    'Hold brystet oppe og klem skulderbladene sammen i hver repetisjon',
  'Keep knee tracking clean and maintain even pressure through both feet':
    'Hold knesporet stabilt og jevnt trykk gjennom begge føtter',
  'Keep pace easy and rhythmic to raise temperature without early fatigue':
    'Hold et rolig, jevnt tempo for å bli varm uten tidlig utmattelse',
  'Keep ribs stacked over pelvis and maintain clean tempo':
    'Hold ribbeina stablet over bekkenet og bevar kontrollert tempo',
  'Lock in upper-arm position and extend with full control':
    'Hold overarmen stabil og strekk ut med full kontroll',
  'Maintain pelvis level and avoid trunk compensation':
    'Hold bekkenet i vater og unngå kompensasjon i overkroppen',
  'Maintain scapular control and pause briefly at peak contraction':
    'Hold kontroll på skulderbladene og ta en kort pause på toppen',
  'Move slowly with full trunk control and avoid momentum':
    'Beveg deg rolig med full kontroll i overkroppen og unngå momentum',
  'Open ankle range gently and keep movement pain-free and smooth':
    'Åpne ankelutslaget skånsomt og hold bevegelsen smertefri og jevn',
  'Pause at top and finish each rep with full hip extension control':
    'Ta en pause på toppen og avslutt hver repetisjon med kontrollert hofteekstensjon',
  'Prep shoulders with smooth circles and relaxed breathing before main work':
    'Forbered skuldrene med rolige sirkler og avslappet pust før hoveddelen',
  'Raise with controlled tempo and avoid shrugging into the neck':
    'Løft med kontrollert tempo og unngå å trekke skuldrene opp i nakken',
  'Press with stable shoulder position and controlled lowering':
    'Press med stabil skulderposisjon og kontrollert senkefase',
  'Raise with steady lateral control and keep neck relaxed':
    'Løft med jevn sideveis kontroll og hold nakken avslappet',
  'Rotate with control from trunk and keep hips stable':
    'Roter kontrollert fra overkroppen og hold hoftene stabile',
  'Row with controlled elbow path and no torso swinging':
    'Ro med kontrollert albuebane uten å svinge overkroppen',
  'Use controlled depth and strong bracing through each squat rep':
    'Bruk kontrollert dybde og godt buktrykk i hver knebøyrepetisjon',
  'Use controlled side-chain engagement with stable breathing':
    'Bruk kontrollert aktivering i sidekjeden med jevn pust',
  'Use controlled trunk rotation to prepare core and spine without forcing range':
    'Bruk kontrollert rotasjon i overkroppen for å forberede kjerne og rygg uten å tvinge utslag',
  'Use full-foot pressure and pause briefly at the top of each rep':
    'Bruk trykk gjennom hele foten og ta en kort pause på toppen av hver repetisjon',
  'Use smooth tempo and avoid compensating with low back extension':
    'Bruk jevnt tempo og unngå å kompensere med korsryggsekstensjon',
  'Use strict band tension and keep posture stacked':
    'Hold jevn strikkspenning og stabil oppreist holdning',
  'Use strict lateral control and keep tension through glutes':
    'Hold streng sideveis kontroll og kontinuerlig spenning i setet',
  'Use strict single-leg control and stop before balance breaks down':
    'Bruk streng kontroll på ett bein og stopp før balansen bryter sammen',
};

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
    if (!SUMMARY_OUTCOME_REGEX.test(program.summary || '')) {
      errors.push(`${context}: summary must be outcome-oriented (missing key outcome verb)`);
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
      createWorkoutDay(1, 'Squat + Row Strength Base', [
        { exerciseId: 'warmup-2', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-5', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-5', sets: 2, repetitions: 8, restBetweenSets: 75 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'abs-20', sets: 2, repetitions: 10, restBetweenSets: 60 , modification: 'Brace on each rep and keep pelvis stable throughout' },
      ], 44),
      createRestDay(2),
      createWorkoutDay(3, 'Hinge + Glute Strength Base', [
        { exerciseId: 'warmup-2', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'glutes-8', sets: 2, repetitions: 10, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'abs-6', sets: 2, duration: 0.5, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
      ], 38),
      createRestDay(4),
      createWorkoutDay(5, 'Squat + Pull Reinforcement', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-1', sets: 3, repetitions: 10, restBetweenSets: 90 , modification: 'Drive knees in line with toes and keep torso position stable' },
        { exerciseId: 'upper-back-3', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'hamstrings-5', sets: 2, repetitions: 8, restBetweenSets: 90 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-16', sets: 2, repetitions: 10, restBetweenSets: 60 , modification: 'Raise with steady lateral control and keep neck relaxed' },
      ], 44),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'upper-body-build',
    title: 'Upper Body Blueprint',
    exerciseEnvironment: 'Large Gym',
    targetAreas: ['upper body', 'strength'],
    bodyParts: ['Chest', 'Shoulders', 'Upper Back', 'Arms'],
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
      createWorkoutDay(1, 'Upper Press + Pull', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'chest-1', sets: 3, repetitions: 10, restBetweenSets: 75 , modification: 'Press with stable shoulder position and controlled lowering' },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 12, restBetweenSets: 75 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Raise with steady lateral control and keep neck relaxed' },
      ], 43),
      createRestDay(2),
      createWorkoutDay(3, 'Upper Volume + Vertical Pull', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'chest-3', sets: 3, repetitions: 10, restBetweenSets: 75 , modification: 'Press with stable shoulder position and controlled lowering' },
        { exerciseId: 'lats-1', sets: 3, repetitions: 10, restBetweenSets: 75 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'upper-back-3', sets: 3, repetitions: 10, restBetweenSets: 75 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'shoulders-1', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Raise with controlled tempo and avoid shrugging into the neck' },
      ], 38),
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
      createWorkoutDay(1, 'Squat + Glute Strength', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Drive knees in line with toes and keep torso position stable' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 42),
      createRestDay(2),
      createWorkoutDay(3, 'Hamstring + Hinge Control', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'hamstrings-20', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Control the lowering phase and keep low back position stable' },
        { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Use strict single-leg control and stop before balance breaks down' },
      ], 38),
      createRestDay(4),
      createWorkoutDay(5, 'Leg Capacity + Posterior Chain', [
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true , modification: 'Open ankle range gently and keep movement pain-free and smooth' },
        { exerciseId: 'quads-5', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'quads-4', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control both upward and downward phases with no bouncing' },
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
      createWorkoutDay(1, 'Conditioning Circuit: Lower Body + Core', [
        { exerciseId: 'cardio-13', duration: 8, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-190', sets: 4, repetitions: 15, restBetweenSets: 45 , modification: 'Keep knee tracking clean and maintain even pressure through both feet' },
        { exerciseId: 'abs-20', sets: 4, repetitions: 10, restBetweenSets: 45 , modification: 'Brace on each rep and keep pelvis stable throughout' },
        { exerciseId: 'glutes-7', sets: 4, repetitions: 15, restBetweenSets: 45 , modification: 'Pause at top and finish each rep with full hip extension control' },
      ], 35),
      createRestDay(2),
      createWorkoutDay(3, 'Conditioning Circuit: Pull + Core Stability', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'upper-back-60', sets: 4, repetitions: 12, restBetweenSets: 45 , modification: 'Use strict band tension and keep posture stacked' },
        { exerciseId: 'abs-6', sets: 4, duration: 0.5, restBetweenSets: 45 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
        { exerciseId: 'calves-6', sets: 4, repetitions: 15, restBetweenSets: 45 , modification: 'Control both upward and downward phases with no bouncing' },
      ], 36),
      createRestDay(4),
      createWorkoutDay(5, 'Conditioning Circuit: Glute + Core Endurance', [
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
      createWorkoutDay(1, 'Core Stability: Anti-Extension Focus', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'abs-20', sets: 4, repetitions: 10, restBetweenSets: 60 , modification: 'Brace on each rep and keep pelvis stable throughout' },
        { exerciseId: 'abs-6', sets: 4, duration: 0.67, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep anti-rotation tension while moving slowly and cleanly' },
      ], 38),
      createRestDay(2),
      createWorkoutDay(3, 'Core Stability: Anti-Rotation Focus', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'abs-121', sets: 4, repetitions: 10, restBetweenSets: 60 , modification: 'Drive through controlled anti-rotation and avoid trunk sway' },
        { exerciseId: 'obliques-14', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use controlled side-chain engagement with stable breathing' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Pause at top and finish each rep with full hip extension control' },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Core Stability: Endurance + Lateral Focus', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'abs-120', sets: 4, repetitions: 10, restBetweenSets: 60 , modification: 'Control the lowering phase and keep low back position stable' },
        { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Use controlled side-chain engagement with stable breathing' },
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
      createWorkoutDay(1, 'Glute Core Stability: Anti-Extension Focus', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 15, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 10, restBetweenSets: 60 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 36),
      createRestDay(2),
      createWorkoutDay(3, 'Glute Core Stability: Anti-Rotation Focus', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Glute Core Stability: Endurance Focus', [
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true , modification: 'Open ankle range gently and keep movement pain-free and smooth' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'glutes-46', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use strict lateral control and keep tension through glutes' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
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
    bodyParts: ['Chest', 'Shoulders', 'Upper Back', 'Core'],
    programOverview: 'This push-pull plan balances pressing and rowing volume to improve upper-body symmetry and shoulder health. It builds muscle while reinforcing mechanics that stay stable under repeated effort and moderate fatigue. Expect cleaner posture, stronger upper-back engagement, and better pressing stability week to week.',
    summary: 'Build a more complete upper body by pairing strong pressing with equal pulling volume. This structure improves aesthetics and shoulder resilience at the same time.',
    timeFrameExplanation: 'Train 3 non-consecutive sessions this week. Match push and pull quality each day, and keep shoulder blades controlled through full ranges. Keep one technical reserve rep before form drift in every major set.',
    afterTimeFrame: {
      expectedOutcome: 'Improved upper-body balance, cleaner pressing and pulling mechanics, and lower neck-dominant compensation. Session quality should feel more even between chest and back work.',
      nextSteps: 'Next week will be tailored from your feedback on this week, including shoulder response and push-pull balance quality. The follow-up plan may rebalance volume, keep intensity steady, or progress loading based on your session outcomes.',
    },
    whatNotToDo: 'Avoid overloaded pressing without matched pull volume or scapular control. Scale sets if pressing mechanics drift or rows lose full-range control.',
    days: [
      createWorkoutDay(1, 'Push-Pull Balance: Symmetry Focus', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'chest-7', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Press with stable shoulder position and controlled lowering' },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Raise with steady lateral control and keep neck relaxed' },
      ], 39),
      createRestDay(2),
      createWorkoutDay(3, 'Push-Pull Balance: Vertical Pull + Technical Volume', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'lats-6', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'upper-back-3', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.5, restBetweenSets: 60 , modification: 'Hold strong midline tension and keep breathing steady during the set' },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Push-Pull Balance: Mixed Output', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'chest-18', sets: 3, repetitions: 15, restBetweenSets: 45 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-1', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Raise with controlled tempo and avoid shrugging into the neck' },
      ], 43),
      createRestDay(6),
      createRestDay(7),
    ],
  },
  {
    slug: 'athletic-performance',
    title: 'Athletic Capacity: Coordination + Power Builder',
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
      createWorkoutDay(1, 'Athletic Capacity: Power + Control', [
        { exerciseId: 'cardio-13', duration: 8, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Drive knees in line with toes and keep torso position stable' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 40),
      createRestDay(2),
      createWorkoutDay(3, 'Athletic Capacity: Coordination + Press', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'hamstrings-5', sets: 4, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'obliques-14', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Rotate with control from trunk and keep hips stable' },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Athletic Capacity: Posterior Chain + Trunk', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'quads-28', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Keep knee tracking clean and maintain even pressure through both feet' },
        { exerciseId: 'calves-6', sets: 4, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
        { exerciseId: 'abs-119', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Move slowly with full trunk control and avoid momentum' },
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
      createWorkoutDay(1, 'Mobility-Strength: Lower Range Control', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true , modification: 'Open ankle range gently and keep movement pain-free and smooth' },
        { exerciseId: 'quads-5', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'upper-back-4', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
      ], 38),
      createRestDay(2),
      createWorkoutDay(3, 'Mobility-Strength: Hinge + Press Integration', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'glutes-8', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Brace on each rep and keep pelvis stable throughout' },
      ], 40),
      createRestDay(4),
      createWorkoutDay(5, 'Mobility-Strength: End-Range Control', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
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
        { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'lats-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Maintain scapular control and pause briefly at peak contraction' },
        { exerciseId: 'biceps-10', sets: 2, repetitions: 12, restBetweenSets: 60 , modification: 'Control curl tempo and keep elbows fixed at your sides' },
      ], 43),
      createRestDay(2),
      createWorkoutDay(3, 'Lower Emphasis', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-1', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Drive knees in line with toes and keep torso position stable' },
        { exerciseId: 'hamstrings-20', sets: 4, repetitions: 12, restBetweenSets: 75 , modification: 'Control the lowering phase and keep low back position stable' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 42),
      createRestDay(4),
      createWorkoutDay(5, 'Hybrid Full Body', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-16', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Raise with steady lateral control and keep neck relaxed' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
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
      createWorkoutDay(1, 'Hypertrophy Focus: Upper Body Base', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'chest-7', sets: 4, repetitions: 8, restBetweenSets: 90 , modification: 'Press with stable shoulder position and controlled lowering' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'shoulders-1', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Raise with controlled tempo and avoid shrugging into the neck' },
        { exerciseId: 'biceps-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Control curl tempo and keep elbows fixed at your sides' },
      ], 42),
      createRestDay(2),
      createWorkoutDay(3, 'Hypertrophy Focus: Lower Body Base', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'quads-5', sets: 4, repetitions: 12, restBetweenSets: 90 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'hamstrings-20', sets: 3, repetitions: 10, restBetweenSets: 75 , modification: 'Control the lowering phase and keep low back position stable' },
        { exerciseId: 'glutes-8', sets: 3, repetitions: 10, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 44),
      createRestDay(4),
      createWorkoutDay(5, 'Hypertrophy Focus: Shoulders + Arms + Core', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 10, restBetweenSets: 75 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'upper-back-3', sets: 3, repetitions: 8, restBetweenSets: 90 , modification: 'Keep chest tall and squeeze shoulder blades through each rep' },
        { exerciseId: 'triceps-4', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Lock in upper-arm position and extend with full control' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
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
      createWorkoutDay(1, 'Density Block: Squat + Row Benchmark', [
        { exerciseId: 'cardio-13', duration: 6, warmup: true , modification: 'Keep pace easy and rhythmic to raise temperature without early fatigue' },
        { exerciseId: 'quads-5', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Use controlled depth and strong bracing through each squat rep' },
        { exerciseId: 'upper-back-4', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Row with controlled elbow path and no torso swinging' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Keep ribs stacked over pelvis and maintain clean tempo' },
      ], 35),
      createRestDay(2),
      createWorkoutDay(3, 'Density Block: Hinge + Press Benchmark', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true , modification: 'Prep shoulders with smooth circles and relaxed breathing before main work' },
        { exerciseId: 'hamstrings-2', sets: 4, repetitions: 8, restBetweenSets: 75 , modification: 'Hinge from hips with controlled tempo and no lumbar overextension' },
        { exerciseId: 'shoulders-5', sets: 4, repetitions: 12, restBetweenSets: 60 , modification: 'Control pressing path and keep shoulder blades set' },
        { exerciseId: 'abs-119', sets: 3, repetitions: 10, restBetweenSets: 60 , modification: 'Move slowly with full trunk control and avoid momentum' },
      ], 37),
      createRestDay(4),
      createWorkoutDay(5, 'Density Block: Posterior Chain Benchmark', [
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true , modification: 'Use controlled trunk rotation to prepare core and spine without forcing range' },
        { exerciseId: 'hamstrings-5', sets: 3, repetitions: 8, restBetweenSets: 75 , modification: 'Control the eccentric phase and avoid jerky hinge motion' },
        { exerciseId: 'shoulders-10', sets: 3, repetitions: 12, restBetweenSets: 60 , modification: 'Use smooth tempo and avoid compensating with low back extension' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 , modification: 'Use full-foot pressure and pause briefly at the top of each rep' },
      ], 40),
      createRestDay(6),
      createRestDay(7),
    ],
  },
];

validateExerciseCopyQuality(exerciseProgramTemplates);

const builtExercisePrograms: any[] = exerciseProgramTemplates.map((template) => ({
  ...template,
  timeFrameExplanation: '',
  createdAt: new Date('2025-06-02T00:00:00Z'),
}));

export const localizeExerciseProgramContent = (
  program: any,
  locale: 'en' | 'nb'
): any => {
  if (locale !== 'nb' || !program?.slug) return program;

  const overviewMapBySlug: Record<
    string,
    {
      title: string;
      summary: string;
      programOverview: string;
      timeFrameExplanation: string;
      whatNotToDo: string;
      expectedOutcome: string;
      nextSteps: string;
    }
  > = {
    'full-body-strength': {
      title: 'Helkropp Styrkeløft',
      summary:
        'Bygg merkbar helkroppsstyrke med en struktur som er enkel, tøff og lett å gjenta. Hver økt trener hovedmønstre slik at fremgang blir tydelig og målbar.',
      programOverview:
        'Denne helkroppsuken bygger styrke i knebøy, hoftebøy, press og trekk med en praktisk gymsplitt. Volumet er høyt nok for synlig fremgang, men kontrollert nok til å bevare restitusjonskvalitet mellom øktene. Du skal kjenne bedre kontroll i hovedløft, jevnere utførelse under fatigue og høyere treningstrygghet uke for uke.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Hold 1–3 repetisjoner i reserve, kontroller den eksentriske fasen, og logg belastning slik at progresjon styres av data. Hold pausene jevne for bedre sammenligning mellom økter.',
      whatNotToDo:
        'Unngå å stresse repetisjoner, hoppe over oppvarmingssett eller presse til teknisk failure i hvert sett. Ikke øk belastning når oppsett, buktrykk eller bevegelsesbane er ustabil.',
      expectedOutcome:
        'Bedre bevegelsestillit, sterkere utførelse i hovedløft og jevnere ukerytme i treningen. Mange opplever også renere oppsett og bedre buktrykk under fatigue.',
      nextSteps:
        'Neste uke tilpasses ut fra opplevd innsats, teknisk kvalitet og restitusjonsrespons denne uken. Oppfølgingsplanen kan øke, holde eller redusere belastning og volum basert på faktisk respons.',
    },
    'upper-body-build': {
      title: 'Overkropp Blueprint',
      summary:
        'Bygg bredere skuldre, sterkere trekk og renere press med en balansert overkroppssplitt. Uken prioriterer symmetri slik at muskelvekst ikke går på bekostning av leddkontroll.',
      programOverview:
        'Denne overkroppsplanen trener skuldre, rygg og armer med balansert press- og trekkbelastning gjennom uken. Den bygger synlig muskelmasse samtidig som skuldermekanikken holdes stabil under høyere treningsvolum. Forvent bedre pressetillit, sterkere trekk og mer robust overkroppskontroll under belastning.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Bruk moderat til utfordrende belastning og hold skulderbladkontroll i hver repetisjon. Match kvalitet i press og trekk, og hold nakkespenn lav.',
      whatNotToDo:
        'Unngå ego-belastning, smertefulle overhead-utslag og shrug-dominert pressing. Reduser intensitet hvis nakkespenn eller fremre skulderirritasjon øker mellom øktene.',
      expectedOutcome:
        'Bedre overkroppsutholdenhet, sterkere trekkmekanikk og mer stabile skuldre i pressing. Du bør også kjenne mindre irritasjon foran i skulderen ved gjentatt arbeid.',
      nextSteps:
        'Neste uke tilpasses ut fra skulderkomfort, trekkbalanse og utførelseskvalitet denne uken. Oppfølgingsplanen kan øke, holde eller redusere intensitet basert på faktisk øktrespons.',
    },
    'lower-body-strength': {
      title: 'Leg Power Protokoll',
      summary:
        'Bygg sterkere bein og sete raskt med en underkroppsblokk som føles atletisk og effektiv. Øktene er tunge nok til fremgang, men holder teknisk kvalitet i fokus.',
      programOverview:
        'Denne underkroppsblokken vektlegger lårstyrke, hoftekraft og kontroll i baksidekjeden i én strukturert uke. Øktene prioriterer først ren teknikk, og legger deretter på nok belastning til målbar tilpasning. Forvent sterkere kraftutvikling i beina, bedre dybdekontroll og mer stabil utførelse under fatigue.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Bruk kontrollert tempo, fullt fottrykk og tydelig kne-hofte-linje før du øker belastning. Se hvert sett som en kvalitetskontroll, ikke bare et volumkrav.',
      whatNotToDo:
        'Unngå ukontrollert dybde, kollaps i fotbuen og svak trunkstabilitet under fatigue. Avslutt sett tidlig når knesporing eller bekkenkontroll faller tydelig.',
      expectedOutcome:
        'Bedre styrkeutholdenhet i underkroppen, renere knebøy-/hinge-mekanikk og høyere kraftutvikling. Fatigue skal i større grad kjennes lokalt i muskulaturen med mindre formkollaps.',
      nextSteps:
        'Neste uke tilpasses ut fra bevegelseskvalitet, kne-hoftekontroll og restitusjonsrespons denne uken. Oppfølgingsplanen kan progresseres, holdes eller skaleres avhengig av teknisk stabilitet.',
    },
    'bodyweight-conditioning': {
      title: 'Hjemme Shred Sirkel',
      summary:
        'Bli svett, sterk og konsekvent hjemme med effektive økter som fortsatt holder høy teknisk kvalitet. Uken bygger kapasitet uten komplisert oppsett.',
      programOverview:
        'Denne hjemmeplanen kombinerer kondisjon og styrkeutholdenhet med kroppsvekt og strikk i tette økter. Strukturen minimerer friksjon i oppstart, men gir nok treningsstress til synlig fremgang. Forvent bedre arbeidskapasitet, renere bevegelseskontroll og enklere etterlevelse av rutinen.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Hold overgangene korte, beveg med tydelig intensjon, og bevar teknisk kvalitet selv når pusten stiger. Følg med på runde-kvalitet slik at progresjon styres av utførelse.',
      whatNotToDo:
        'Unngå slurvete repetisjoner, pustestopp og å haste mellom øvelser uten kontroll. Ta korte pauser når teknikken faller, og fortsett i et tempo du kan holde kvalitet i.',
      expectedOutcome:
        'Bedre kondisjonsbase, sterkere kroppsvektsutholdenhet og mer repeterbar øktkvalitet. Du bør kjenne raskere restitusjon mellom runder mot slutten av uken.',
      nextSteps:
        'Neste uke tilpasses ut fra kondisjonsrespons, fatigueprofil og teknisk konsistens denne uken. Oppfølgingsplanen kan justere tetthet, pauser eller øvelsesvalg etter kapasitet.',
    },
    'core-endurance': {
      title: 'Kjernekontroll Hjemme',
      summary:
        'Bygg en sterkere og mer stabil kjerne med strukturerte hjemmeøkter som faktisk progredierer. Uken forbedrer buktrykksutholdenhet du merker i både trening og hverdag.',
      programOverview:
        'Denne kjerneuken bygger anti-ekstensjonskontroll, anti-rotasjonsstyrke og trunkutholdenhet med tydelig progresjonsstruktur. Opplegget forbedrer kraftoverføring gjennom overkroppen i løft, løping og daglig bevegelse. Forvent sterkere midtlinje, mindre tidlig fatigue og tryggere buktrykk under belastning.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Bruk kontrollert pust, nøytral rygg og stopp hvert sett før posisjonskvaliteten faller. Prioriter ribbein-bekken-kontroll fremfor å forlenge sett.',
      whatNotToDo:
        'Unngå kompensatorisk sva i korsrygg, hastede repetisjoner og unødig nakkespenn i kjernearbeid. Regresser umiddelbart hvis du ikke klarer å holde ribbein stablet over bekken.',
      expectedOutcome:
        'Bedre trunkstabilitet, sterkere anti-rotasjonskontroll og mindre tidlig fatigue i kjernen. Du bør merke bedre holdningskontroll også i sammensatte løft.',
      nextSteps:
        'Neste uke tilpasses ut fra buktrykkskvalitet, trunkkontroll og fatigue-respons denne uken. Oppfølgingsplanen kan øke, holde eller forenkle kjernekrav basert på utførelsesstabilitet.',
    },
    'glute-core-build': {
      title: 'Sete & Kjerne Forge',
      summary:
        'Bygg setemuskulatur og solid kjerne med en baksidekjede-fokusert splitt. Øktene styrker hoftekraft og bekkenkontroll som overføres til knebøy og hinge.',
      programOverview:
        'Denne sete- og kjerneplanen målretter baksidekjedestyrke og bekkenkontroll med fokusert belastning og repeterbar struktur. Den forbedrer hofteekstensjon, trunkstivhet og kraftoverføring i både trening og daglig aktivitet. Forvent sterkere hoftearbeid, renere holdningskontroll og mer stabile løftemekanikker.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Prioriter kvalitet i hofteekstensjon, bekkenkontroll og full lockout før du øker utslag eller belastning. Hold jevn trunkspenning i alle hinge- og bridge-varianter.',
      whatNotToDo:
        'Unngå korsryggdrevet ekstensjon, ukontrollert hinging og hastede lockouts på toppen. Skaler belastning ned hvis du mister tydelig seteaktivering i sluttfasen av repetisjonene.',
      expectedOutcome:
        'Sterkere seteaktivering, bedre bekkenstabilitet og renere koordinasjon i baksidekjeden. De fleste kjenner mindre korsryggovertak i hofteekstensjonsarbeid.',
      nextSteps:
        'Neste uke tilpasses ut fra seteaktivering, bekkenkontroll og graden av korsryggkompensasjon denne uken. Oppfølgingsplanen kan justere volum, belastning og kompleksitet etter kontrollkvalitet.',
    },
    'push-pull-balance': {
      title: 'Press-Trekk Mestring',
      summary:
        'Bygg en mer komplett overkropp ved å balansere sterk pressing med like sterk trekkvolum. Strukturen forbedrer både estetikk og skulderrobusthet.',
      programOverview:
        'Denne press-trekk-planen balanserer press- og rovolum for bedre overkroppssymmetri og skulderhelse. Den bygger muskelmasse samtidig som mekanikken holdes stabil under repetert innsats og moderat fatigue. Forvent renere holdning, sterkere øvre ryggkontakt og bedre pressestabilitet uke for uke.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Match kvaliteten i press og trekk hver dag, og hold skulderbladene kontrollert gjennom hele utslaget. Behold minst én teknisk reserve-repetisjon før formdrift.',
      whatNotToDo:
        'Unngå tung pressing uten tilsvarende trekkvolum eller skulderbladkontroll. Skaler sett når pressteknikk driver eller ro-arbeid mister full bevegelseskontroll.',
      expectedOutcome:
        'Bedre overkroppsbalanse, renere press/trekk-mekanikk og mindre nakkedominert kompensasjon. Øktkvaliteten bør føles jevnere mellom bryst- og ryggarbeid.',
      nextSteps:
        'Neste uke tilpasses ut fra skulderrespons og kvalitet i press-versus-trekk denne uken. Oppfølgingsplanen kan rebalansere volum, holde intensitet eller progrediere belastning etter øktutfall.',
    },
    'athletic-performance': {
      title: 'Atletisk Basebygger',
      summary:
        'Bygg atletisk kapasitet du merker i reell bevegelse med økter som kombinerer kraft og kontroll. Uken prioriterer repeterbar ytelse fremfor enkeltstående hardøkter.',
      programOverview:
        'Denne atletiske basisuken kombinerer styrkeutholdenhet, trunkkontroll og bevegelseskvalitet under håndterbar fatigue. Opplegget er laget for jevn prestasjonsforbedring fremfor tilfeldige intensitetstopper som bryter kontinuitet. Forvent bedre pacing, skarpere teknikk og sterkere helkroppsoutput gjennom uken.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Bruk presis teknikk, jevn pacing og kontrollert pust, og hold bevegelseskvaliteten høy også når fatigue øker. Følg med på form i siste tredel av øktene.',
      whatNotToDo:
        'Unngå maksintensitet som bryter bevegelseskvalitet eller pacing-disciplin. Skaler ned når koordinasjonen faller, og bygg tetthet videre med renere repetisjoner.',
      expectedOutcome:
        'Bedre arbeidskapasitet, mer repeterbar bevegelseskvalitet og sterkere utførelse under fatigue. Du bør oppleve færre tekniske dropp i metabolsk krevende økter.',
      nextSteps:
        'Neste uke tilpasses ut fra pacing, koordinasjon og fatigue-resistens denne uken. Oppfølgingsplanen kan justere tetthet, pauser og kompleksitet etter prestasjonstrend.',
    },
    'mobility-strength': {
      title: 'Mobilitet x Styrke',
      summary:
        'Forbedre mobilitet og bygg sterkere repetisjoner ved å omsette bedre posisjoner til faktisk styrke. Uken hjelper deg å beholde utslag når belastning og fatigue øker.',
      programOverview:
        'Denne mobilitet-styrke-hybriden bruker målrettet forberedelse for å åpne renere utslag før de belastes med strenge styrkesett. Den gjør kortsiktige mobilitetsgevinster om til anvendbar kraft og stabil bevegelseskontroll. Forvent jevnere posisjoner, sterkere repetisjoner og tryggere kontroll i ytterstilling under belastning.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Utfør mobilitetsforberedelse først, og forsterk deretter forbedret posisjon med strenge repetisjoner i kontrollert tempo. Se forberedelsen som del av prestasjonen, ikke som fyll.',
      whatNotToDo:
        'Unngå å hoppe over forberedende mobilitet, tvinge smertefulle utslag eller haste belastning i ytterstilling. Regresser utslag med én gang hvis trunk- eller skulderkompensasjon øker.',
      expectedOutcome:
        'Bedre bevegelseskvalitet, sterkere kontroll i ytterstilling og bedre posisjonsbevaring under fatigue. Du bør kjenne mindre kompensasjon i dypere arbeidsutslag.',
      nextSteps:
        'Neste uke tilpasses ut fra kontroll i ytterstilling og bevegelseskvalitet under belastning denne uken. Oppfølgingsplanen kan øke, holde eller regressere volum avhengig av stabilitet.',
    },
    'upper-lower-hybrid': {
      title: 'Over-Under Hybrid',
      summary:
        'Tren hardt for både over- og underkropp uten å brenne ut med en tydelig alternerende struktur. Splittet beskytter ytelse og holder ukentlig stimuli høy.',
      programOverview:
        'Denne over-under-hybriden alternerer fokusdager for å spre fatigue og bevare høy øktkvalitet. Den holder helkroppsfremgang i gang uten å overbelaste samme region eller mønster gjentatte ganger. Forvent mer balansert styrkeutvikling, bedre øktkvalitet og en ukerytme du kan gjenta over tid.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Alterner over- og underkroppsfokus, og hold samme kvalitetskrav i alle hovedmønstre. Ikke-konsekutive økter skal brukes aktivt for å bevare utførelse.',
      whatNotToDo:
        'Unngå å gjøre hver økt maksimal eller stable harde sett uten kontroll på restitusjon. Hold minst én kvalitetsrepetisjon i reserve på tilleggsarbeid når fatigue bygger seg opp.',
      expectedOutcome:
        'Bedre treningsbalanse, håndterbar ukesfatigue og mer stabil øktberedskap. Mange opplever også mindre overlappende stølhet mellom tunge dager.',
      nextSteps:
        'Neste uke tilpasses ut fra beredskapstrender mellom over- og underkroppsdager denne uken. Oppfølgingsplanen kan redistribuere intensitet, volum og restitusjonsspacing for bedre konsistens.',
    },
    'muscle-growth-foundation': {
      title: 'Muskelvekst Akselerator',
      summary:
        'Bygg synlig muskelmasse raskt med målrettet volum og høy repetisjonskvalitet i effektive 30–45-minuttersøkter. Uken kombinerer baseøvelser og tilleggsarbeid for tydelig hypertrofisignal.',
      programOverview:
        'Dette hypertrofigrunnlaget er laget for målbar muskelvekst med repeterbar ukestruktur og tydelig progresjonslogikk. Planen kombinerer compoundspenning, tilleggsvolum og kontrollert innsats for maksimal tilpasning i effektive økter. Forvent bedre pump, klarere fremgangsmarkører og mer synlige endringer med jevn gjennomføring.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Hold kontrollert tempo, stopp 1–2 repetisjoner før failure i de fleste sett, og logg progresjon hver økt. Bevar likt oppsett og utslagskvalitet før du øker belastning.',
      whatNotToDo:
        'Unngå slurvete tempo, ego-belastning og å kjøre hvert sett til failure. Avslutt sett når repetisjonshastighet kollapser eller buktrykkskvalitet faller tydelig.',
      expectedOutcome:
        'Bedre muskelpump, sterkere teknikk under fatigue og høyere løftetillit uke til uke. Du bør se tydeligere fremgang i både belastning og repetisjonskvalitet.',
      nextSteps:
        'Neste uke tilpasses ut fra pumpkvalitet, rep-kontroll og restitusjonsrespons denne uken. Oppfølgingsplanen kan øke, holde eller redusere hypertrofistress for å bevare kvalitet.',
    },
    'strength-endurance-30-45': {
      title: 'Power Tetthet 45',
      summary:
        'Bli sterkere og bedre trent på under 45 minutter med økter som bygger tetthet uten å miste form. Strukturen forbedrer kondisjon samtidig som løftemekanikk bevares.',
      programOverview:
        'Denne tetthetsfokuserte planen trener styrkeutholdenhet i store bevegelsesmønstre i effektive 30–45-minuttersøkter. Den øker total output per økt uten å ofre bevegelseskvalitet eller posisjonskontroll. Forvent sterkere kondisjon under belastning og mer repeterbar prestasjon på tvers av sett.',
      timeFrameExplanation:
        'Tren 3 økter med hviledager mellom denne uken. Hold pausetidene ærlige, bruk moderate repetisjonsområder, og se hver økt som en formførst tetthetsbenchmark. Følg med på om siste sett holder samme kvalitet som de første.',
      whatNotToDo:
        'Unngå å ofre mekanikk eller utslagskvalitet bare for høyere tempo mellom sett. Senk farten hvis pust eller fatigue gjør oppsett og kontroll dårligere.',
      expectedOutcome:
        'Høyere treningstetthet, bedre repeterbar output og bedre kondisjon uten formkollaps. Mange fullfører tilsvarende arbeid med lavere opplevd belastning ved ukeslutt.',
      nextSteps:
        'Neste uke tilpasses ut fra tetthetskvalitet og formbevaring denne uken. Oppfølgingsplanen kan justere belastning, pauser og øktstruktur basert på utførelse og restitusjon.',
    },
  };

  const localized = overviewMapBySlug[program.slug];
  if (!localized) return program;

  const dayDescriptions = localizedDayDescriptionsBySlugDayNb[program.slug] || {};
  const localizedDays = (program.days || []).map((day: any) => {
    const description = dayDescriptions[day?.day];
    const localizedExercises = (day?.exercises || []).map((exercise: any) => {
      const localizedModification = localizedExerciseModificationsNb[exercise?.modification || ''];
      return localizedModification
        ? { ...exercise, modification: localizedModification }
        : exercise;
    });
    if (!description) return { ...day, exercises: localizedExercises };
    return {
      ...day,
      description,
      exercises: localizedExercises,
    };
  });

  return {
    ...program,
    title: localized.title,
    summary: localized.summary,
    programOverview: localized.programOverview,
    timeFrameExplanation: '',
    whatNotToDo: localized.whatNotToDo,
    afterTimeFrame: {
      ...program.afterTimeFrame,
      expectedOutcome: localized.expectedOutcome,
      nextSteps: localized.nextSteps,
    },
    days: localizedDays,
  };
};

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
