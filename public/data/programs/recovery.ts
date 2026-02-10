// @ts-nocheck
// ------------------------------------------------------------
// Recovery Custom Programs
// ▸ Single-week templates only (7 days each)
// ▸ Exercise days typically follow a Mo‑We‑Fr pattern
// ▸ Rest‑day objects can include optional mobility/recovery drills
// ------------------------------------------------------------

import { ExerciseProgram } from '../../../src/app/types/program';
import { DiagnosisAssistantResponse } from '../../../src/app/types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../shared/types';

// Locale-aware helpers (descriptions only)
// We intentionally only localize ProgramDay.description strings per request.
// Diagnosis, questionnaire and other metadata remain unchanged.
export const localizeProgramDayDescriptions = (
  program: ExerciseProgram,
  locale: 'en' | 'nb'
): ExerciseProgram => {
  if (locale !== 'nb') return program;

  // Minimal phrase mapping for common workout day descriptions
  const dayTitleMap: Record<string, string> = {
    "Reset & Brace (dead bug + plank). Exhale to brace; stop if symptoms travel or spike >3/10.": "Reset og buktrykk (dead bug + planke). Pust ut for å spenne; stopp hvis symptomer stråler eller øker >3/10.",
    "Glutes + Spine Stability (bridge + bird dog). Quiet trunk; move from hips/shoulders, not the low back.": "Sete + ryggstabilitet (seteløft + bird dog). Rolig overkropp; beveg fra hofter/skuldre, ikke korsrygg.",
    "Repeat & Build Confidence. Same-day should feel easier; next morning should be stable or better.": "Gjenta og bygg trygghet. Det skal føles lettere samme dag; neste morgen stabilt eller bedre.",
    "Zone 2 + Calf Strength (easy). Slow reps; pain stays ≤3/10 during and the next morning.": "Zone 2 + leggstyrke (lett). Rolige reps; smerte ≤3/10 underveis og neste morgen.",
    "Calf Capacity + Zone 2 (easy). Keep cadence smooth; stop if pain climbs above 3/10.": "Leggkapasitet + Zone 2 (lett). Jevn frekvens; stopp hvis smerte går over 3/10.",
    "Symptom Calm + Hip Activation. Keep knee tracking over mid-foot and pain ≤3/10.": "Ro ned symptomer + hofteaktivering. Hold kneet over midtfoten og smerte ≤3/10.",
    "Hip Control + Quad Isometrics. Slow reps, no knee collapse inward.": "Hoftekontroll + isometrisk lår. Rolige reps, unngå at kneet faller innover.",
    "Build Tolerance (same pattern, slightly more work). Next morning should be stable or better.": "Bygg toleranse (samme mønster, litt mer arbeid). Neste morgen skal være stabil eller bedre.",
    "Restore Motion + Scap Control. Smooth reps; stay below pinch range.": "Gjenopprett bevegelse + skulderbladkontroll. Rolige reps; hold deg under klypegrensen.",
    "Cuff Endurance + Flexion Control. Keep ribs down; avoid shrugging.": "Cuff-utholdenhet + fleksjonskontroll. Hold ribbeina nede; unngå å trekke skuldrene opp.",
    "Build Shoulder Tolerance (same pattern, slightly more volume). Next day should feel stable or better.": "Bygg skuldertoleranse (samme mønster, litt mer volum). Neste dag skal være stabil eller bedre.",
    "Calm Swelling + Restore Motion. Keep steps quiet and pain ≤3/10.": "Demp hevelse + gjenopprett bevegelse. Hold stegene rolige og smerte ≤3/10.",
    "Ankle Mobility + Calf Pump. Slow tempo, full-foot contact.": "Ankelmobilitet + leggpumpe. Rolig tempo, full fotkontakt.",
    "Build Confidence in Stance. Repeat pattern; next day should be stable or better.": "Bygg trygghet i standfase. Gjenta mønster; neste dag skal være stabil eller bedre.",
    "Settle Tendon Irritability + Isometric Relief. Keep grip light and pain ≤3/10.": "Demp senesmerte + isometrisk lindring. Hold lett grep og smerte ≤3/10.",
    "Forearm Control + Slow Rotation. Move smoothly; no sharp or radiating pain.": "Underarmskontroll + rolig rotasjon. Beveg rolig; ingen skarp eller utstrålende smerte.",
    "Build Daily-Use Tolerance. Repeat pattern with slightly longer holds if stable next day.": "Bygg toleranse for hverdagsbruk. Gjenta mønsteret med litt lengre hold hvis neste dag er stabil.",
    "Reset Posture + Mobility. Keep jaw relaxed and shoulders away from ears.": "Nullstill holdning + mobilitet. Hold kjeven avslappet og skuldrene ned fra ørene.",
    "Scapular Endurance + Neck Calm. Slow pulls; avoid neck tension compensation.": "Skulderbladutholdenhet + ro i nakken. Rolige trekk; unngå kompensasjon med nakken.",
    "Build Desk-Day Tolerance. Repeat pattern with slightly more control and hold quality.": "Bygg toleranse for kontordag. Gjenta mønsteret med litt mer kontroll og kvalitet i holdene.",
    "Calm Heel Pain + Restore Foot Motion. Keep load sub-symptomatic and controlled.": "Demp hælsmerte + gjenopprett fotbevegelse. Hold belastningen kontrollert og under symptomgrense.",
    "Calf-Arch Control + Gentle Capacity. Slow tempo; no sharp heel pain.": "Legg-/fotbuekontroll + skånsom kapasitet. Rolig tempo; ingen skarp hælsmerte.",
    "Build First-Step Confidence. Repeat pattern with slightly more time under tension.": "Bygg trygghet i de første stegene. Gjenta mønsteret med litt mer tid under spenning.",
    "Calm Hamstring Irritability + Gentle Activation. Keep stride short and pain ≤3/10.": "Demp hamstring-irritasjon + skånsom aktivering. Hold stegene korte og smerte ≤3/10.",
    "Posterior Chain Control. Slow hinge patterning without stretch pain.": "Baksidekjede-kontroll. Rolig hoftebøy-mønster uten strekksmerte.",
    "Build Walking Confidence. Repeat pattern with slightly more control and tolerance.": "Bygg trygghet i gange. Gjenta mønsteret med litt mer kontroll og toleranse.",
    "Posture Reset + Thoracic Mobility. Keep ribs stacked and shoulders down.": "Holdningsreset + brystryggmobilitet. Hold ribbeina stable og skuldrene nede.",
    "Scapular Endurance + Core Support. Slow pulls; avoid neck compensation.": "Skulderbladutholdenhet + kjernestøtte. Rolige trekk; unngå nakkekompensasjon.",
    "Build Upright Tolerance. Repeat pattern with slightly more time under tension.": "Bygg toleranse i oppreist holdning. Gjenta mønsteret med litt mer tid under spenning.",
    "Deep Core Reset. Slow bracing with neutral spine and controlled breathing.": "Dyp kjerne-reset. Rolig buktrykk med nøytral rygg og kontrollert pust.",
    "Core Control + Limb Coordination. Keep pelvis stable and movement quiet.": "Kjernekontroll + koordinasjon med armer/bein. Hold bekkenet stabilt og bevegelsen rolig.",
    "Build Trunk Endurance. Repeat pattern with slightly longer quality holds.": "Bygg kjerneutholdenhet. Gjenta mønsteret med litt lengre kvalitets-hold.",
  };

  // Rest day description mappings across all programs/weeks
  const restDayMap: Record<string, string> = {
    "Rest day. Gentle spinal mobility and diaphragmatic breathing to reduce stiffness.": "Hviledag. Skånsom ryggmobilitet og diafragmapust for å redusere stivhet.",
    "Rest day. Light quad/hip mobility to maintain blood flow without stressing the knee joint.": "Hviledag. Lett mobilitet for lår/hofte for blodsirkulasjon uten knestress.",
    "Rest day. Scapular mobility and low-load cuff activation for circulation.": "Hviledag. Skulderbladmobilitet og lett rotatorcuff-aktivering for sirkulasjon.",
    "Rest day. Gentle range of motion and calf pump to assist lymph drainage.": "Hviledag. Skånsomt bevegelsesutslag og leggpumpe for lymfedrenasje.",
    "Rest day. Low-load wrist mobility and gentle neural glide to reduce elbow tension.": "Hviledag. Lett håndleddmobilitet og skånsom nerveglidning for mindre albuetensjon.",
    "Rest day. Light rotator cuff activation and posture control to reinforce recovery gains.": "Hviledag. Lett rotatorcuff-aktivering og holdningskontroll for varig effekt.",
    "Rest day. Light foot mobility and calf stretches to support healing.": "Hviledag. Lett fotmobilitet og leggstrekk for å støtte tilheling.",
    "Rest day. Optional easy 5–10 min marching in place; gentle calf stretch if pain‑free.": "Hviledag. Valgfritt: 5–10 min rolig marsj på stedet; lett leggstrekk hvis smertefritt.",
    "Rest day. Avoid impact; optional easy 5–10 min marching in place if fully pain‑free.": "Hviledag. Unngå støt; valgfritt: 5–10 min rolig marsj på stedet hvis helt smertefritt.",
    "Rest day. Gentle activation for the glutes and trunk to promote circulation and postural control.": "Hviledag. Skånsom aktivering av sete og kjerne for sirkulasjon og holdningskontroll.",
  };

  const getDescriptionBase = (value?: string): string => {
    if (!value) return '';
    return value
      .split(' Guidance:')[0]
      .split(' Optional recovery:')[0]
      .trim();
  };

  const updatedDays = program.days.map((d) => {
    const original = d.description?.trim();
    const baseDescription = getDescriptionBase(original);
    if (d.isRestDay) {
      const mappedRest =
        (baseDescription && restDayMap[baseDescription]) || 'Hviledag';
      return { ...d, description: mappedRest };
    }
    const mapped =
      (baseDescription && dayTitleMap[baseDescription]) || d.description;
    return { ...d, description: mapped };
  });

  return {
    ...program,
    days: updatedDays,
    summary: program.summary,
    programOverview: program.programOverview,
    timeFrameExplanation: program.timeFrameExplanation,
    afterTimeFrame: {
      expectedOutcome: program.afterTimeFrame.expectedOutcome,
      nextSteps: program.afterTimeFrame.nextSteps,
    },
    whatNotToDo: program.whatNotToDo,
  };
};

// Duration helpers for recovery programs
// NOTE: In recovery.ts we treat `exercise.duration` as MINUTES (not seconds).
// `restBetweenSets` remains in seconds.
const calculateRecoveryExerciseDurationSeconds = (exercise: any): number => {
  if (!exercise) return 0;

  if (exercise.sets && exercise.duration) {
    const holdSecondsPerSet = Number(exercise.duration) * 60;
    const totalHoldTime = exercise.sets * holdSecondsPerSet;
    const restTime = exercise.restBetweenSets
      ? (exercise.sets - 1) * exercise.restBetweenSets
      : 0;
    return totalHoldTime + restTime;
  }

  if (exercise.duration) {
    return Number(exercise.duration) * 60;
  }

  if (exercise.sets && exercise.repetitions) {
    const timePerRepSeconds = 5;
    const exerciseTimePerSet = exercise.repetitions * timePerRepSeconds;
    const totalExerciseTime = exercise.sets * exerciseTimePerSet;
    const restTime = exercise.restBetweenSets
      ? (exercise.sets - 1) * exercise.restBetweenSets
      : 0;
    return totalExerciseTime + restTime;
  }

  return 60;
};

const calculateRecoveryDayDuration = (exercises: any[]): number => {
  if (!exercises || exercises.length === 0) return 0;
  const totalSeconds = exercises.reduce((total, exercise) => {
    return total + calculateRecoveryExerciseDurationSeconds(exercise);
  }, 0);
  return Math.ceil(totalSeconds / 60);
};

const isWarmupExerciseRef = (exercise: any): boolean => {
  if (!exercise) return false;
  if (exercise.warmup === true) return true;
  const exerciseId =
    typeof exercise.exerciseId === 'string' ? exercise.exerciseId : '';
  return exerciseId.startsWith('warmup-');
};

const orderWarmupsFirst = (exercises: any[]): any[] => {
  if (!Array.isArray(exercises) || exercises.length === 0) return exercises;
  const warmups = exercises.filter(isWarmupExerciseRef);
  const nonWarmups = exercises.filter((ex) => !isWarmupExerciseRef(ex));
  return [...warmups, ...nonWarmups];
};

// Helper function to create workout days with computed durations
const createWorkoutDay = (day: number, description: string, exercises: any[]) => {
  const orderedExercises = orderWarmupsFirst(exercises);
  return {
    day,
    description,
    dayType: 'strength' as const,
    exercises: orderedExercises,
    duration: calculateRecoveryDayDuration(orderedExercises),
  };
};

// ------------------------------------------------------------
// Rest‑Day Templates for BodAI Rehab Programs
// Generated: 2025‑05‑31
// ------------------------------------------------------------
// Each helper returns a ProgramDay object that fits the interfaces you
// provided (`ProgramDay`, `Exercise`, etc.) and marks the day as a rest
// day (`isRestDay: true`).
// Feel free to swap, remove, or add optional drills – they're low‑load,
// body‑part‑specific mobility / activation moves that shouldn't exceed
// RPE 3‑4.
// ------------------------------------------------------------

/* ---------------- Low‑Back Pain ---------------- */
const createLowBackRestDay = (day: number): any => {
  const exercises = [
    { exerciseId: 'warmup-9', duration: 5, warmup: true, modification: 'Keep abdomen tall; rotate only to a comfortable range.' },
    { exerciseId: 'warmup-5', duration: 5, warmup: true, modification: 'Engage core lightly; avoid lumbar pain.' },
    { exerciseId: 'lower-back-4', sets: 2, repetitions: 6, restBetweenSets: 30, modification: 'Slow, controlled crossover. Keep ribs down; stop before pinching.' },
    { exerciseId: 'abs-102', sets: 1, repetitions: 6, restBetweenSets: 45, modification: 'Reach long; keep hips level. Move only as far as you can stay neutral.' },
  ];
  return { day, isRestDay: true, description: 'Rest day. Gentle spinal mobility and diaphragmatic breathing to reduce stiffness.', exercises, duration: calculateRecoveryDayDuration(exercises) };
};

/* ---------------- Runner's Knee ---------------- */
const createRunnersKneeRestDay = (day: number): any => {
  const exercises = [
    { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy marching pace; keep steps quiet and pain-free.' },
    { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Pause 1s at the top; keep pelvis stable.' },
    { exerciseId: 'quads-193', sets: 1, duration: 0.5, restBetweenSets: 60, modification: 'Hold shallow angle (≤ 60° knee flexion).' },
  ];
  return { day, isRestDay: true, description: 'Rest day. Light quad/hip mobility to maintain blood flow without stressing the knee joint.', exercises, duration: calculateRecoveryDayDuration(exercises) };
};

/* ---------------- Shoulder Impingement ---------------- */
const createShoulderRestDay = (day: number): any => {
  const exercises = [
    { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Small circles → medium; stay below pain threshold.' },
    { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Use light band; focus on scapular squeeze.' },
    { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Elbow tucked to side; slow tempo.' },
  ];
  return { day, isRestDay: true, description: 'Rest day. Scapular mobility and low-load cuff activation for circulation.', exercises, duration: calculateRecoveryDayDuration(exercises) };
};

/* ---------------- Lateral Ankle Sprain ---------------- */
const createAnkleRestDay = (day: number): any => {
  const exercises = [
    { exerciseId: 'calves-13', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Rock gently into dorsiflexion; stay in pain-free range.' },
    { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Both legs; slow up-down, support as needed.' },
    { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Easy marching pace for circulation; no impact.' },
  ];
  return { day, isRestDay: true, description: 'Rest day. Gentle range of motion and calf pump to assist lymph drainage.', exercises, duration: calculateRecoveryDayDuration(exercises) };
};

/* ---------------- Tennis Elbow ---------------- */
const createTennisElbowRestDay = (day: number): any => {
  const exercises = [
    { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Relax shoulders and neck; easy circles only.' },
    { exerciseId: 'forearms-4', sets: 2, repetitions: 12, restBetweenSets: 30, modification: 'Support forearm on thigh/table and rotate only in pain-free range.' },
    { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Gentle isometric hold with forearm supported on thigh/table.' },
  ];
  return { day, isRestDay: true, description: 'Rest day. Low-load wrist mobility and gentle neural glide to reduce elbow tension.', exercises, duration: calculateRecoveryDayDuration(exercises) };
};

/* ---------------- Hamstring Strain ---------------- */
const createHamstringRestDay = (day: number): any => {
  const exercises = [
    {
      exerciseId: 'cardio-13',
      duration: 2,
      warmup: true,
      modification: 'Easy march for circulation; keep steps short and controlled.',
    },
    {
      exerciseId: 'glutes-7',
      sets: 1,
      repetitions: 15,
      restBetweenSets: 45,
      modification: 'Bodyweight bridge; pause at top for 1 second.',
    },
    {
      exerciseId: 'hamstrings-48',
      sets: 1,
      repetitions: 8,
      restBetweenSets: 45,
      modification: 'Use no added weight. Control the descent.',
    },
  ];
  
  return {
    day,
    description:
      'Rest day. Gentle mobility and circulation work for healing and neural gliding.',
    isRestDay: true,
    duration: calculateRecoveryDayDuration(exercises),
    exercises,
  };
};

/* ---------------- Posture ---------------- */
const createPostureRestDay = (day: number): any => {
  const exercises = [
    {
      exerciseId: 'warmup-8',
      sets: 1,
      repetitions: 20,
      restBetweenSets: 30,
      modification: 'Slow, smooth shoulder circles. Pause at the back.',
      warmup: true,
    },
    {
      exerciseId: 'shoulders-30',
      sets: 1,
      repetitions: 15,
      restBetweenSets: 45,
      modification: 'Light tension band. Focus on posture and breath.',
    },
    {
      exerciseId: 'warmup-9',
      sets: 1,
      repetitions: 12,
      restBetweenSets: 30,
      modification: 'Rotate only to a comfortable range. Don\'t force it.',
    },
  ];
  
  return {
    day,
    isRestDay: true,
    duration: calculateRecoveryDayDuration(exercises),
    description:
      'Rest day. Gentle thoracic mobility and postural activation to maintain upright awareness.',
    exercises,
  };
};

/* ---------------- Tech Neck ---------------- */
const createTechNeckRestDay = (day: number): any => {
  const exercises = [
    { exerciseId: 'warmup-8', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Small, slow circles. Focus on relaxed shoulders.', warmup: true },
    { exerciseId: 'shoulders-30', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Very light tension. Pause and breathe at the squeeze.' },
    { exerciseId: 'warmup-9', sets: 1, repetitions: 8, restBetweenSets: 30, modification: 'Gentle rotation, keep head neutral.' },
  ];
  return {
    day,
    isRestDay: true,
    description: 'Rest day. Light rotator cuff activation and posture control to reinforce recovery gains.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises),
  };
};

/* ---------------- Plantar Fasciitis ---------------- */
const createPlantarRestDay = (day: number): any => {
  const exercises = [
    { exerciseId: 'calves-13', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Rock gently into ankle mobility; stay below heel-pain threshold.' },
    { exerciseId: 'calves-6', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Light heel raises, control the descent.' },
    { exerciseId: 'cardio-13', duration: 2, warmup: true, modification: 'Easy marching for circulation; keep steps quiet and controlled.' },
  ];
  return {
    day,
    isRestDay: true,
    description: 'Rest day. Light foot mobility and calf stretches to support healing.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises),
  };
};

/* ---------------- Core Stability ---------------- */
const createCoreRestDay = (day: number): any => {
  const exercises = [
    { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold 1s at top, focus on breath and core tension.' },
    { exerciseId: 'abs-20', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Slow and controlled; keep lower back in contact with floor.' },
    { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Rotate gently through comfortable range.' },
  ];
  return {
    day,
    isRestDay: true,
    description: 'Rest day. Gentle activation for the glutes and trunk to promote circulation and postural control.',
    exercises,
    duration: calculateRecoveryDayDuration(exercises),
  };
};

const rehabProgramsAllWeeks: ExerciseProgram[] = [
  {
    programOverview:
      'Shin splints often flare when impact volume ramps faster than your lower leg can adapt. This week we dial down running/jumping to calm the tibia while keeping you active with low-impact cardio. You’ll build gentle calf/ankle capacity and blood flow so walking and stairs feel easier. Use pain (during + next morning) as your guide—steady or improving is the goal.',
    summary:
      'Calm shin pain and rebuild a pain-free running base while keeping your conditioning high.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week and add 15–25 minutes of low-impact cardio at home (marching in place). Add gentle ankle mobility and light tibialis work to reduce stress on the shin with each step. Keep impact exposure to short, flat walks only if symptoms stay ≤3/10 and do not worsen the next day. Prioritize supportive shoes and a slightly higher cadence/shorter stride on any walks.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower shin tenderness to touch, and normal walking/stairs feel easier the next day. You should tolerate light calf work without a symptom spike.',
      nextSteps:
        'Next week adds slow eccentrics and short cadence-focused walks to start rebuilding impact tolerance. If mornings stay calm, we’ll gradually increase walk time before any jogging.',
    },
    whatNotToDo:
      'Avoid running, jumping, hills, and hard surfaces this week—especially when sore or fatigued. Don’t push through sharp or increasing tibial pain; if symptoms worsen the next morning, reduce volume.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(
        1,
        'Zone 2 + Calf Strength (easy). Slow reps; pain stays ≤3/10 during and the next morning.',
        [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Start with controlled ankle rocks before loading calf reps.' },
        { exerciseId: 'cardio-13', duration: 20, warmup: true, modification: 'Keep an easy marching pace and quiet steps throughout.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 45, modification: 'Use both legs, slow tempo, and full-foot pressure.' },
        { exerciseId: 'calves-9', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Use light band tension; stop if tibial tenderness rises.' },
        ],
      ),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Gentle ankle mobility and light calf pumps to reduce tibial irritation.',
        exercises: [
          { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Keep range gentle and pain-managed.' },
          { exerciseId: 'calves-9', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Light tibialis work with smooth control.' },
          { exerciseId: 'calves-6', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Easy calf pump, no bouncing.' },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Keep range gentle and pain-managed.' },
          { exerciseId: 'calves-9', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Light tibialis work with smooth control.' },
          { exerciseId: 'calves-6', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Easy calf pump, no bouncing.' },
        ]),
      },
      createWorkoutDay(
        3,
        'Calf Capacity + Zone 2 (easy). Keep cadence smooth; stop if pain climbs above 3/10.',
        [
        { exerciseId: 'cardio-13', duration: 15, warmup: true, modification: 'Steady low-impact march only; keep breathing relaxed.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 20, restBetweenSets: 45, modification: 'Higher reps with strict control and no pain spikes.' },
        { exerciseId: 'calves-9', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Maintain smooth dorsiflexion with light band resistance.' },
        ],
      ),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Optional easy 5–10 min marching in place; gentle calf stretch if pain‑free.',
        exercises: [
          { exerciseId: 'cardio-13', duration: 6, warmup: true, modification: 'Easy marching only; keep steps quiet and pain-managed.' },
          { exerciseId: 'calves-13', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Gentle ankle mobility within comfortable range.' },
          { exerciseId: 'calves-6', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Light calf raises with controlled tempo.' },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'cardio-13', duration: 6, warmup: true, modification: 'Easy marching only; keep steps quiet and pain-managed.' },
          { exerciseId: 'calves-13', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Gentle ankle mobility within comfortable range.' },
          { exerciseId: 'calves-6', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Light calf raises with controlled tempo.' },
        ]),
      },
      createWorkoutDay(
        5,
        'Zone 2 + Calf Strength (easy). Slow reps; pain stays ≤3/10 during and the next morning.',
        [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Open ankle range first, then transition into calf loading.' },
        { exerciseId: 'cardio-13', duration: 20, warmup: true, modification: 'Use a consistent easy pace; no jogging or impact.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 45, modification: 'Control both the lift and lowering phase.' },
        { exerciseId: 'calves-9', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Keep tension light and movement smooth.' },
        ],
      ),
      {
        day: 6,
        isRestDay: true,
        description: 'Rest day. Gentle foot intrinsic activation (toe spread) and ankle circles.',
        exercises: [
          { exerciseId: 'calves-13', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Small controlled ankle rocks; no forcing end range.' },
          { exerciseId: 'calves-9', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Light band tension; smooth dorsiflexion reps.' },
          { exerciseId: 'cardio-13', duration: 4, warmup: true, modification: 'Easy in-place march for circulation.' },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'calves-13', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Small controlled ankle rocks; no forcing end range.' },
          { exerciseId: 'calves-9', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Light band tension; smooth dorsiflexion reps.' },
          { exerciseId: 'cardio-13', duration: 4, warmup: true, modification: 'Easy in-place march for circulation.' },
        ]),
      },
      {
        day: 7,
        isRestDay: true,
        description: 'Rest day. Avoid impact; optional easy 5–10 min marching in place if fully pain‑free.',
        exercises: [
          { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Optional light march only if symptoms are calm.' },
          { exerciseId: 'calves-13', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Gentle ankle mobility to stay loose.' },
          { exerciseId: 'calves-6', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Stop if tenderness increases.' },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Optional light march only if symptoms are calm.' },
          { exerciseId: 'calves-13', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Gentle ankle mobility to stay loose.' },
          { exerciseId: 'calves-6', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Stop if tenderness increases.' },
        ]),
      },
    ],
    targetAreas: ['shin'],
    bodyParts: ['Shin', 'Calves'],
  },

  {
    programOverview:
      'This week is about calming flare-ups and making your back feel predictable again. You’ll practice “neutral spine” (a comfortable middle range), then layer in breathing + bracing so your trunk stays steady during sitting, standing up, and light bending. We pair that with gentle glute work so your hips share the load. The goal is to finish each session feeling looser and more confident—not exhausted.',
    summary:
      'Calm low-back flare-ups and rebuild confident daily movement with controlled core and glute work.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week. Keep pain ≤3/10 during training and the next morning. Use slow reps, breathe out as you brace, and stop the set if you cannot keep ribs stacked over pelvis. On rest days, optional 10–20 minutes of easy walking is fine if symptoms stay stable.',
    afterTimeFrame: {
      expectedOutcome:
        'Less morning stiffness, and day-to-day movements (getting up from a chair, rolling in bed, light bending) feel easier and more controlled. You should feel more “steady” through your trunk during the exercises.',
      nextSteps:
        'If symptoms are stable or improving, the next week adds hip-hinge patterning and slow posterior-chain loading so you can lift and bend with confidence—without losing your brace.',
    },
    whatNotToDo:
      'Avoid breath-holding, repeated end-range flexion/extension, and “testing” heavy lifts. Don’t push through sharp pain or new numbness/tingling; if symptoms travel down the leg or worsen the next morning, scale volume down. Seek care promptly for red flags (progressive weakness, saddle numbness, bowel/bladder changes).',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Reset & Brace (dead bug + plank). Exhale to brace; stop if symptoms travel or spike >3/10.', [
        { exerciseId: 'warmup-5', duration: 3, warmup: true, modification: 'Find neutral spine; slow breath in/out.' },
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Low back stays heavy on the floor; move slow.' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.5, restBetweenSets: 60, modification: 'Shorten lever (knees down) if you feel the back.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 10, restBetweenSets: 60, modification: 'Pause 1s at top; ribs down; no back arch.' },
      ]),
      createLowBackRestDay(2),
      createWorkoutDay(3, 'Glutes + Spine Stability (bridge + bird dog). Quiet trunk; move from hips/shoulders, not the low back.', [
        { exerciseId: 'warmup-5', duration: 3, warmup: true, modification: 'Reset pelvis position before you load.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Keep shins vertical; squeeze glutes, not low back.' },
        { exerciseId: 'abs-102', sets: 3, repetitions: 6, restBetweenSets: 45, modification: 'Slow reach; keep hips level and ribs down.' },
        { exerciseId: 'abs-11', sets: 2, duration: 0.5, restBetweenSets: 60, modification: 'Hold steady; breathe slowly; keep hips stacked.' },
      ]),
      createLowBackRestDay(4),
      createWorkoutDay(5, 'Repeat & Build Confidence. Same-day should feel easier; next morning should be stable or better.', [
        { exerciseId: 'warmup-5', duration: 2, warmup: true, modification: 'Find neutral; gentle brace on exhale.' },
        { exerciseId: 'warmup-9', duration: 2, warmup: true, modification: 'Comfortable range only; breathe slow. Skip if rotation irritates symptoms.' },
        { exerciseId: 'abs-20', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Keep low back heavy; slow tempo.' },
        { exerciseId: 'abs-6', sets: 2, duration: 0.5, restBetweenSets: 60, modification: 'Shorten lever (knees down) if you feel the back.' },
        { exerciseId: 'abs-102', sets: 2, repetitions: 6, restBetweenSets: 45, modification: 'Stay level; stop if you feel back “pinch”.' },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Pause at top; no back arch.' },
      ]),
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  {
    programOverview:
      'Week 1 calms patellofemoral irritation by reducing compressive knee stress while building hip and quad support. You will use glute-med activation, controlled bodyweight squats, and short wall-sit holds to improve tracking and tolerance without overload. The target outcome is smoother sit-to-stand and stair function with less front-of-knee pain.',
    summary:
      'Reduce knee pain and rebuild stable squat-and-stair mechanics with controlled lower-body loading.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week with pain kept at or below 3/10 during exercise and the next morning. Use slow tempo and keep the knee aligned over the mid-foot on every squat and hold. Optional easy walking is fine if symptoms remain stable.',
    afterTimeFrame: {
      expectedOutcome:
        'Less front-of-knee sensitivity and easier stairs, chair rises, and short walks at low load.',
      nextSteps:
        'Next week adds controlled lunge and step patterns if pain remains stable (≤3/10) with no next-day flare.',
    },
    whatNotToDo:
      'Avoid downhill running, deep painful knee flexion, jumping/plyometrics, and high-volume stairs this week. Stop if pain becomes sharp, catching, or clearly worse the next morning.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Symptom Calm + Hip Activation. Keep knee tracking over mid-foot and pain ≤3/10.', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy march in place; no bouncing.' },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Keep pelvis stacked; controlled lift and lower.' },
        { exerciseId: 'quads-193', sets: 3, duration: 0.5, restBetweenSets: 60, modification: 'Use shallow knee angle and pain-free hold range.' },
        { exerciseId: 'quads-190', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Sit back slightly and keep knee in line with toes.' },
      ]),
      createRunnersKneeRestDay(2),
      createWorkoutDay(3, 'Hip Control + Quad Isometrics. Slow reps, no knee collapse inward.', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Steady pace; keep steps quiet.' },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Pause briefly at top; avoid trunk sway.' },
        { exerciseId: 'glutes-45', sets: 2, repetitions: 8, restBetweenSets: 60, modification: 'Short ROM is fine; prioritize alignment and control.' },
        { exerciseId: 'quads-193', sets: 3, duration: 0.5, restBetweenSets: 60, modification: 'Maintain even pressure through both feet.' },
        { exerciseId: 'quads-190', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Control descent; no pain spike on ascent.' },
      ]),
      createRunnersKneeRestDay(4),
      createWorkoutDay(5, 'Build Tolerance (same pattern, slightly more work). Next morning should be stable or better.', [
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy march; stay relaxed through shoulders and hips.' },
        { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Smooth tempo; keep knee and foot pointing forward.' },
        { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Use support if needed; avoid knee cave.' },
        { exerciseId: 'quads-193', sets: 3, duration: 0.67, restBetweenSets: 60, modification: 'Slightly longer hold only if pain remains ≤3/10.' },
        { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Controlled reps; stop 1-2 reps before form loss.' },
      ]),
      createRunnersKneeRestDay(6),
      createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },

  {
    programOverview:
      'Week 1 focuses on calming shoulder irritation and restoring predictable, pain-managed motion. You will train scapular control, rotator-cuff endurance, and light flexion patterning with bands so overhead movement feels smoother without forcing range. The goal is less pinching with daily reaching and better shoulder control under low load.',
    summary:
      'Restore smoother shoulder motion and rebuild overhead confidence with cuff-first control work.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week, staying at or below 3/10 pain during training and the next morning. Keep ribs stacked and avoid shrugging as you raise the arm. Use smooth tempo and stop each set if compensation starts (neck tension, lumbar arch, or shoulder hiking).',
    afterTimeFrame: {
      expectedOutcome:
        'Less painful arc/pinching and easier shoulder elevation in a comfortable range with improved control.',
      nextSteps:
        'If symptoms stay stable, next week increases cuff/scapular volume and progresses controlled shoulder flexion.',
    },
    whatNotToDo:
      'Do not force overhead range, shrug into pain, or do heavy pressing this week. Avoid sharp anterior shoulder pain, catching, or night-pain escalation after sessions; reduce range/volume if symptoms increase next day.',
    createdAt: new Date('2025-05-29T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Restore Motion + Scap Control. Smooth reps; stay below pinch range.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Small to medium circles; pain-free range only.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, warmup: true, modification: 'Light band and steady scapular squeeze.' },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 10, restBetweenSets: 60, modification: 'Elbow tucked; rotate without trunk twist.' },
        { exerciseId: 'shoulders-179', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Raise only to comfortable range; ribs stay down.' },
        { exerciseId: 'shoulders-78', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Pull to eye level; avoid upper-trap shrug.' },
      ]),
      createShoulderRestDay(2),
      createWorkoutDay(3, 'Cuff Endurance + Flexion Control. Keep ribs down; avoid shrugging.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Smooth circles; no pinch zone.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: 'Control scapular retraction; do not arch low back.' },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60, modification: '2-second out / 2-second back tempo.' },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 10, restBetweenSets: 60, modification: 'Pain-free arc only; slow lowering.' },
        { exerciseId: 'shoulders-78', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Elbows high enough for rear delt/cuff, not neck tension.' },
      ]),
      createShoulderRestDay(4),
      createWorkoutDay(5, 'Build Shoulder Tolerance (same pattern, slightly more volume). Next day should feel stable or better.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Smooth circles; keep shoulders down away from ears.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: 'Steady retraction; no trunk sway.' },
        { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Controlled external rotation with consistent band tension.' },
        { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Increase only if no next-day symptom spike.' },
        { exerciseId: 'shoulders-78', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Stop before compensating with neck or low back.' },
      ]),
      createShoulderRestDay(6),
      createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  {
    programOverview:
      'Week 1 focuses on calming swelling and restoring safe ankle motion after a lateral sprain. You will use gentle ankle mobility, low-impact circulation work, and controlled calf pumping to improve tolerance for walking and stairs without provoking symptoms. The goal is to feel more stable under bodyweight by the end of the week.',
    summary:
      'Reduce swelling and rebuild ankle stability so walking feels steady, controlled, and reliable.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week and keep pain at or below 3/10 during exercise and the next morning. Use slow, controlled reps and keep movements pain-managed. Optional easy walking is fine on rest days if swelling and pain remain stable.',
    afterTimeFrame: {
      expectedOutcome:
        'Less swelling and stiffness, with more comfortable walking and easier stair negotiation at low speed.',
      nextSteps:
        'Next week progresses calf strength and introduces more single-leg control if symptoms stay stable.',
    },
    whatNotToDo:
      'Avoid cutting, jumping, unstable surfaces, and forced end-range dorsiflexion this week. Stop and reduce volume if swelling spikes, gait worsens, or pain increases the next morning.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Calm Swelling + Restore Motion. Keep steps quiet and pain ≤3/10.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Rock slowly; stop before pinch at front of ankle.' },
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy marching pace for circulation, no bounce.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Even loading through both feet; controlled rise/lower.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Keep pelvis stable; help ankle control through hip support.' },
      ]),
      createAnkleRestDay(2),
      createWorkoutDay(3, 'Ankle Mobility + Calf Pump. Slow tempo, full-foot contact.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Increase range slightly only if pain stays low.' },
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Quiet steps; symmetrical loading left/right.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Pause briefly at top; no sharp pain on lowering.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Slow reps; avoid trunk sway.' },
      ]),
      createAnkleRestDay(4),
      createWorkoutDay(5, 'Build Confidence in Stance. Repeat pattern; next day should be stable or better.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Controlled mobility; no forcing end range.' },
        { exerciseId: 'cardio-13', duration: 5, warmup: true, modification: 'Easy march with full-foot roll through.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Smooth tempo; stop before form loss.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Slightly higher volume if no next-day symptom spike.' },
      ]),
      createAnkleRestDay(6),
      createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  {
    programOverview:
      'Week 1 aims to calm tendon irritability at the outside of the elbow while restoring tolerance to light daily gripping and typing. You will use pain-managed isometric wrist loading and controlled forearm rotation to reduce sensitivity and begin rebuilding tendon capacity. Sessions should feel controlled and leave symptoms stable or improved the next morning.',
    summary:
      'Settle elbow pain and rebuild pain-managed grip strength for typing, lifting, and daily tasks.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week and keep pain at or below 3/10 during exercise and the next morning. Use very light load (or a household object) and support your forearm on a thigh or table if a bench is not available. Prioritize smooth tempo and stop before sharp or radiating pain.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower resting elbow pain and improved tolerance to light grip, mouse/keyboard use, and daily hand tasks.',
      nextSteps:
        'If symptoms remain stable, next week introduces more slow eccentrics and modest volume progression.',
    },
    whatNotToDo:
      'Avoid high-force gripping, heavy carries, repetitive wrist extension under fatigue, and jerky movement. Reduce volume if morning pain clearly worsens, and stop if symptoms become sharp, radiating, or neurologic.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Settle Tendon Irritability + Isometric Relief. Keep grip light and pain ≤3/10.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Relax shoulder/neck before forearm loading.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 12, restBetweenSets: 45, warmup: true, modification: 'Support forearm on thigh/table and move in pain-free arc.' },
        { exerciseId: 'forearms-3', sets: 4, duration: 0.5, restBetweenSets: 60, modification: 'Light isometric hold; keep wrist neutral and steady.' },
      ]),
      createTennisElbowRestDay(2),
      createWorkoutDay(3, 'Forearm Control + Slow Rotation. Move smoothly; no sharp or radiating pain.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Keep shoulder relaxed and posture tall.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: '2-second rotation each way; no end-range forcing.' },
        { exerciseId: 'forearms-3', sets: 4, duration: 0.67, restBetweenSets: 60, modification: 'Slightly longer hold only if symptoms stay calm.' },
      ]),
      createTennisElbowRestDay(4),
      createWorkoutDay(5, 'Build Daily-Use Tolerance. Repeat pattern with slightly longer holds if stable next day.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Easy circles; no shoulder tension.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: 'Controlled rotation under light load.' },
        { exerciseId: 'forearms-3', sets: 5, duration: 0.67, restBetweenSets: 60, modification: 'Maintain neutral wrist and light grip pressure.' },
      ]),
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    programOverview:
      'Week 1 focuses on reducing neck and upper-back tension by improving scapular control and postural endurance. You will combine gentle mobility with low-load band work so the shoulders and mid-back share more of the workload during desk time. The goal is to feel less neck tightness and better sitting tolerance without forcing painful ranges.',
    summary:
      'Reduce neck tension and build desk-day posture endurance with targeted upper-back control.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week and keep pain at or below 3/10 during and the next morning. Prioritize slow reps, relaxed jaw and breathing, and shoulders staying down away from ears. Stop or regress if you feel pinching, headache aggravation, or heavy neck compensation.',
    afterTimeFrame: {
      expectedOutcome:
        'Less neck tightness/stiffness and improved ability to sit upright with less fatigue during screen work.',
      nextSteps:
        'If symptoms remain stable, next week increases upper-back row volume and cuff endurance.',
    },
    whatNotToDo:
      'Avoid shrug-dominant lifting, forced end-range neck stretching, and painful movement ranges. Reduce session volume if symptoms clearly worsen the next day or if headaches are aggravated.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Reset Posture + Mobility. Keep jaw relaxed and shoulders away from ears.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Small circles first, then medium range if symptom-free.' },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 8, restBetweenSets: 30, warmup: true, modification: 'Gentle trunk rotation, chest tall, no neck cranking.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Light band tension; slow scapular squeeze.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 8, restBetweenSets: 45, modification: 'Elbow tucked; rotate without neck or trunk compensation.' },
      ]),
      createTechNeckRestDay(2),
      createWorkoutDay(3, 'Scapular Endurance + Neck Calm. Slow pulls; avoid neck tension compensation.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Controlled circles; keep shoulders depressed.' },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Move from trunk; keep chin neutral.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Pause at squeeze; avoid rib flare.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: '2-second out / 2-second back tempo.' },
      ]),
      createTechNeckRestDay(4),
      createWorkoutDay(5, 'Build Desk-Day Tolerance. Repeat pattern with slightly more control and hold quality.', [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Smooth circles, no shrugging.' },
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Comfortable range only; breathe steadily.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Light to moderate band tension with strict form.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Hold end position briefly if no symptom increase.' },
      ]),
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  {
    programOverview:
      'Week 1 aims to reduce heel irritability and morning first-step pain by restoring gentle ankle-foot motion and controlled calf loading. You will use low-impact circulation work, calf pumps, and hip support work to improve tissue tolerance without flare-ups. The target is steadier walking comfort and less “sharp” heel sensitivity at the start of the day.',
    summary:
      'Reduce first-step heel pain and rebuild foot-calf tolerance for more comfortable daily walking.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week and keep pain at or below 3/10 during and the next morning. Use slow tempo and avoid sharp heel pain, especially in first-step movements. Supportive footwear and reduced barefoot time on hard floors are key this week.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower morning heel pain with easier first steps, and better tolerance for short walks at comfortable pace.',
      nextSteps:
        'If symptoms remain stable, next week introduces more eccentric calf emphasis and arch-control progressions.',
    },
    whatNotToDo:
      'Avoid barefoot walking on hard floors, sudden volume spikes, and forcing through sharp plantar heel pain. If next-morning pain spikes, reduce session volume and total standing/walking exposure.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Calm Heel Pain + Restore Foot Motion. Keep load sub-symptomatic and controlled.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Gentle ankle-rock mobility, pain-managed range only.' },
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Easy march in place; soft, quiet steps.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Slow lift and controlled lowering, no bounce.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Stable pelvis to support foot loading mechanics.' },
      ]),
      createPlantarRestDay(2),
      createWorkoutDay(3, 'Calf-Arch Control + Gentle Capacity. Slow tempo; no sharp heel pain.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Increase range slightly only if pain stays low.' },
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Maintain relaxed cadence and even foot contact.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Pause briefly at top; control full descent.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'No trunk sway; smooth controlled reps.' },
      ]),
      createPlantarRestDay(4),
      createWorkoutDay(5, 'Build First-Step Confidence. Repeat pattern with slightly more time under tension.', [
        { exerciseId: 'calves-13', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Smooth mobility; avoid forcing end range.' },
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Easy march for circulation, avoid hard forefoot strike.' },
        { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Keep tempo strict; stop before heel pain sharpens.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Slightly higher volume if next-day pain remains stable.' },
      ]),
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },

  {
    programOverview:
      'Week 1 focuses on calming hamstring irritability and restoring confident movement in walking and light hinging. You will use low-impact circulation, glute bridge work, and controlled short-range hinge patterns to load the posterior chain without provoking stretch pain. The aim is smoother daily movement with less guarding and less next-day tightness.',
    summary:
      'Calm hamstring irritation and rebuild confident hinge and stride mechanics without symptom spikes.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week with pain at or below 3/10 during and the next morning. Keep stride length short and avoid aggressive stretching. Use slow hinge tempo and stop before sharp pulling pain, cramping, or loss of control.',
    afterTimeFrame: {
      expectedOutcome:
        'Less hamstring tightness/guarding with easier walking and more comfortable low-load hip hinge patterns.',
      nextSteps:
        'If symptoms stay stable, next week progresses controlled eccentric hamstring loading and single-leg tolerance.',
    },
    whatNotToDo:
      'Avoid overstretching, sprinting, and ballistic movement this week. Do not push through sharp pain or cramping; reduce volume if next-day soreness clearly spikes.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Calm Hamstring Irritability + Gentle Activation. Keep stride short and pain ≤3/10.', [
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Easy marching to warm tissue; no bounce or long stride.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Pause 1 second at top without low-back arching.' },
        { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 60, modification: 'Bodyweight only; very short range and slow descent.' },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Pain-free range only; prioritize control over depth.' },
      ]),
      createHamstringRestDay(2),
      createWorkoutDay(3, 'Posterior Chain Control. Slow hinge patterning without stretch pain.', [
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Steady march; keep pelvis level and relaxed.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Smooth ascent/descent and full-foot contact.' },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Increase range slightly only if pain remains low.' },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Slow patterning; avoid pulling sensation at end range.' },
      ]),
      createHamstringRestDay(4),
      createWorkoutDay(5, 'Build Walking Confidence. Repeat pattern with slightly more control and tolerance.', [
        { exerciseId: 'cardio-13', duration: 3, warmup: true, modification: 'Short, quiet steps; stop if pain rises.' },
        { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60, modification: 'Slightly more volume if next-day symptoms are stable.' },
        { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Strict bodyweight control; no sudden stretch at bottom.' },
        { exerciseId: 'glutes-1', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Keep tempo slow and pain-managed.' },
      ]),
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },

  {
    programOverview:
      'Week 1 focuses on reducing upper-back and shoulder fatigue by improving thoracic mobility, scapular positioning, and core-assisted posture control. You will combine gentle movement prep with low-load band pulling so your mid-back does more work and your neck does less. The target is better tolerance to upright sitting and standing without stiffness buildup.',
    summary:
      'Improve posture endurance and upper-back strength so upright positions feel easier and more natural.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week with pain at or below 3/10 during and the next morning. Keep ribs stacked over pelvis, avoid shrugging, and use smooth controlled pulling tempo. Optional walking and short movement breaks during desk work will support progress.',
    afterTimeFrame: {
      expectedOutcome:
        'Reduced upper-back/shoulder tension with better awareness and tolerance of upright posture in daily tasks.',
      nextSteps:
        'If symptoms are stable, next week increases pulling volume and posterior-chain support work.',
    },
    whatNotToDo:
      'Avoid heavy pressing, prolonged static slouching, and forcing end-range extension. Reduce volume if neck/shoulder symptoms spike the next day.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Posture Reset + Thoracic Mobility. Keep ribs stacked and shoulders down.', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 8, restBetweenSets: 30, warmup: true, modification: 'Gentle trunk rotation; avoid lumbar over-twist.' },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Small circles first, then medium range.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Light band; controlled scapular squeeze.' },
        { exerciseId: 'upper-back-60', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Tall posture, elbows track smoothly.' },
      ]),
      createPostureRestDay(2),
      createWorkoutDay(3, 'Scapular Endurance + Core Support. Slow pulls; avoid neck compensation.', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Move from thoracic spine with relaxed neck.' },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Smooth circles without shrugging.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Pause briefly at retraction; ribs down.' },
        { exerciseId: 'upper-back-60', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Steady row tempo; avoid low-back sway.' },
      ]),
      createPostureRestDay(4),
      createWorkoutDay(5, 'Build Upright Tolerance. Repeat pattern with slightly more time under tension.', [
        { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Comfortable range only; breathe steadily.' },
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Keep shoulders away from ears.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Maintain consistent band tension and form.' },
        { exerciseId: 'upper-back-60', sets: 3, repetitions: 12, restBetweenSets: 60, modification: 'Slight volume increase only if next-day symptoms are stable.' },
      ]),
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },

  {
    programOverview:
      'Week 1 rebuilds deep core control so your trunk stays stable during basic movement and daily tasks. You will combine low-load bracing, anti-extension work, and glute support to improve pelvic control without over-fatiguing the back or hip flexors. The goal is quality reps and predictable control, not high intensity.',
    summary:
      'Build deep core endurance so everyday movement feels steadier, stronger, and more controlled.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week with pain at or below 3/10 during and the next morning. Exhale to brace on each rep, keep neutral spine, and stop sets when form quality drops. Prioritize controlled breathing and posture over extra reps.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved core recruitment with better control in plank/brace positions and easier trunk stability in daily movement.',
      nextSteps:
        'If control is consistent, next week adds more time under tension and limb coordination demands.',
    },
    whatNotToDo:
      'Avoid high-rep sit-ups, long planks with poor form, and breath-holding under effort. If low-back symptoms increase the next morning, reduce hold time and total volume.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Deep Core Reset. Slow bracing with neutral spine and controlled breathing.', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Low back stays in contact; exhale on limb movement.' },
        { exerciseId: 'abs-6', sets: 2, duration: 0.5, restBetweenSets: 60, modification: 'Use knees-down version if you lose spinal control.' },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Hold 1 second at top with ribs down.' },
      ]),
      createCoreRestDay(2),
      createWorkoutDay(3, 'Core Control + Limb Coordination. Keep pelvis stable and movement quiet.', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60, modification: 'Slow alternating pattern; no trunk rocking.' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.5, restBetweenSets: 60, modification: 'Brace continuously and keep breathing steady.' },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Maintain pelvis level through full rep.' },
      ]),
      createCoreRestDay(4),
      createWorkoutDay(5, 'Build Trunk Endurance. Repeat pattern with slightly longer quality holds.', [
        { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60, modification: 'Increase reps only if form remains clean.' },
        { exerciseId: 'abs-6', sets: 3, duration: 0.67, restBetweenSets: 60, modification: 'Slightly longer hold, stop before shaking or lumbar sag.' },
        { exerciseId: 'glutes-7', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Controlled tempo with steady breath pattern.' },
      ]),
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },

  {
    programOverview:
      'Week 1 focuses on calming wrist irritation from repetitive daily loading while restoring forearm control and grip tolerance. You will use gentle mobility, low-load isometrics, and controlled rotation so typing, lifting light objects, and household tasks feel easier without flare-ups.',
    summary:
      'Calm wrist irritation and rebuild resilient forearm control for typing, lifting, and daily use.',
    timeFrameExplanation:
      'Train 3 non-consecutive sessions this week and keep pain at or below 3/10 during exercise and the next morning. Use light resistance and controlled tempo. Keep the wrist in neutral when possible and stop if pain becomes sharp or radiates.',
    afterTimeFrame: {
      expectedOutcome:
        'Lower wrist sensitivity at rest and better tolerance to typing, carrying light items, and daily hand use.',
      nextSteps:
        'If symptoms remain stable, next week can introduce slightly longer isometric holds and gradual load progression for grip and extension tolerance.',
    },
    whatNotToDo:
      'Avoid high-force gripping, fast loaded wrist extension, and repetitive end-range wrist positions under fatigue. Reduce volume if symptoms are clearly worse the next morning.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      createWorkoutDay(1, 'Wrist Calm + Forearm Activation. Light load, neutral wrist, pain ≤3/10.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Gentle shoulder-arm prep before wrist loading.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 12, restBetweenSets: 45, warmup: true, modification: 'Rotate only through pain-free range with forearm supported.' },
        { exerciseId: 'forearms-3', sets: 4, duration: 0.5, restBetweenSets: 60, modification: 'Neutral wrist isometric hold with light grip pressure.' },
      ]),
      {
        day: 2,
        isRestDay: true,
        description: 'Rest day. Optional gentle wrist circles and easy grip open/close drills.',
        exercises: [
          { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Easy shoulder and arm circles to reduce upper-limb tension.' },
          { exerciseId: 'forearms-4', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Supported forearm rotation in pain-free range only.' },
          { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Light isometric hold with neutral wrist.' },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Easy shoulder and arm circles to reduce upper-limb tension.' },
          { exerciseId: 'forearms-4', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Supported forearm rotation in pain-free range only.' },
          { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Light isometric hold with neutral wrist.' },
        ]),
      },
      createWorkoutDay(3, 'Forearm Rotation + Isometric Capacity. Smooth tempo; avoid sharp pain.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Keep shoulders relaxed and elbow close to body.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: 'Slow tempo both directions; avoid end-range forcing.' },
        { exerciseId: 'forearms-3', sets: 4, duration: 0.67, restBetweenSets: 60, modification: 'Slightly longer hold while keeping symptoms stable.' },
      ]),
      {
        day: 4,
        isRestDay: true,
        description: 'Rest day. Keep wrist neutral during desk work; add short movement breaks.',
        exercises: [
          { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Relax shoulder and forearm before loading.' },
          { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Comfortable isometric hold; keep grip light.' },
          { exerciseId: 'forearms-4', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Slow and controlled pronation/supination.' },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Relax shoulder and forearm before loading.' },
          { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Comfortable isometric hold; keep grip light.' },
          { exerciseId: 'forearms-4', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Slow and controlled pronation/supination.' },
        ]),
      },
      createWorkoutDay(5, 'Build Daily-Use Tolerance. Repeat pattern with slightly longer quality holds.', [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Use this as a reset before forearm work.' },
        { exerciseId: 'forearms-4', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true, modification: 'Controlled rotation with steady breathing.' },
        { exerciseId: 'forearms-3', sets: 5, duration: 0.67, restBetweenSets: 60, modification: 'Build hold tolerance gradually, stop before fatigue compensation.' },
      ]),
      {
        day: 6,
        isRestDay: true,
        description: 'Rest day. Optional 5–10 min light forearm mobility if symptoms stay calm.',
        exercises: [
          { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Easy circulation-focused arm movement.' },
          { exerciseId: 'forearms-4', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Pain-managed rotation with full control.' },
          { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Stop early if symptoms increase.' },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Easy circulation-focused arm movement.' },
          { exerciseId: 'forearms-4', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Pain-managed rotation with full control.' },
          { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Stop early if symptoms increase.' },
        ]),
      },
      {
        day: 7,
        isRestDay: true,
        description: 'Rest day. Avoid long static wrist positions; keep load light.',
        exercises: [
          { exerciseId: 'warmup-8', sets: 1, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Short gentle mobility break to reduce stiffness.' },
          { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Submax neutral-wrist hold only.' },
          { exerciseId: 'forearms-4', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Controlled range, no forcing end positions.' },
        ],
        duration: calculateRecoveryDayDuration([
          { exerciseId: 'warmup-8', sets: 1, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Short gentle mobility break to reduce stiffness.' },
          { exerciseId: 'forearms-3', sets: 1, duration: 0.5, restBetweenSets: 45, modification: 'Submax neutral-wrist hold only.' },
          { exerciseId: 'forearms-4', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Controlled range, no forcing end positions.' },
        ]),
      },
    ],
    targetAreas: ['wrist', 'forearm'],
    bodyParts: ['Wrist', 'Forearm'],
  }
];

// Recovery custom programs are single-week templates. Next weeks are generated
// dynamically based on user feedback.
export const rehabPrograms: ExerciseProgram[] = rehabProgramsAllWeeks;

// URL slug mapping for direct program access - maps to the single-week program index
export const programSlugs: Record<string, number> = {
  'shin-splints': 0,
  // Low Back
  lowback: 1,
  'low-back': 1,
  'lower-back': 1,
  
  // Runner's Knee
  runnersknee: 2,
  'runners-knee': 2,
  
  // Shoulder
  shoulder: 3,
  'shoulder-impingement': 3,
  
  // Ankle
  ankle: 4,
  'ankle-sprain': 4,
  
  // Tennis Elbow
  'tennis-elbow': 5,
  elbow: 5,
  
  // Tech Neck
  techneck: 6,
  
  // Plantar Fasciitis
  'plantar-fasciitis': 7,
  plantarfasciitis: 7,
  plantar: 7,
  
  // Hamstring
  'hamstring-strain': 8,
  hamstring: 8,
  
  // Upper Back & Core
  'upper-back-core': 9,
  upperbackcore: 9,
  
  // Core Stability
  'core-stability': 10,
  corestability: 10,

  // Wrist Pain
  'wrist-pain': 11,
  wrist: 11,
  wristpain: 11,
};

// Function to get program by URL slug - returns the single-week program
export const getProgramBySlug = (slug: string): ExerciseProgram | null => {
  const baseIndex = programSlugs[slug.toLowerCase()];
  if (typeof baseIndex !== 'number') return null;

  return rehabPrograms[baseIndex] ?? null;
};

// Function to get all available program slugs
export const getAvailableSlugs = (): string[] => {
  return Object.keys(programSlugs);
};

// Create tailored UserProgram objects for each recovery program
export const getUserProgramBySlug = (slug: string): {
  programs: ExerciseProgram[];
  diagnosis: DiagnosisAssistantResponse;
  questionnaire: ExerciseQuestionnaireAnswers;
  active: boolean;
  createdAt: string;
  updatedAt: Date;
  type: ProgramType;
  timeFrame: string;
  title: string;
  docId: string;
} | null => {
  const normalizeUserProgram = (userProgram: any) => ({
    ...userProgram,
    timeFrame: '1 week',
    diagnosis: { ...userProgram.diagnosis, timeFrame: '1 week' },
    isCustomProgram: true, // Mark as predefined custom/recovery program
  });

  const baseIndex = programSlugs[slug.toLowerCase()];
  if (typeof baseIndex !== 'number') return null;
  
  const week1 = rehabPrograms[baseIndex];
  if (!week1) return null;

  const today = new Date();
  const normalizedSlug = slug.toLowerCase();

  // Update the program's createdAt to today so dates display correctly
  const updatedWeekPrograms = [{ ...week1, createdAt: today }];

  // Create specific diagnosis and questionnaire for each program type
  if (normalizedSlug.includes('lowback') || normalizedSlug.includes('low-back') || normalizedSlug.includes('lower-back')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Lower Back Pain',
        painfulAreas: ['Lower Back'],
        informationalInsights: 'Lower back pain is one of the most common musculoskeletal complaints. This program focuses on strengthening core muscles, improving spinal mobility, and addressing postural dysfunction to reduce pain and prevent recurrence.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'posture',
        aggravatingFactors: ['Prolonged sitting', 'Bending forward', 'Lifting'],
        relievingFactors: ['Rest', 'Gentle movement', 'Heat therapy'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lower lumbar region',
        painCharacter: 'dull',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy lifting', 'Prolonged sitting', 'High-impact activities'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Lower Back', 'Core']
      },
      questionnaire: {
        age: '30-40',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Lower Back'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Lower Back', 'Core'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Back Relief Blueprint',
      docId: `recovery-lowback-${Date.now()}`
    });
  }

  if (
    normalizedSlug.includes('shin') ||
    normalizedSlug.includes('shin-splints') ||
    normalizedSlug.includes('mtss')
  ) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Medial Tibial Stress Syndrome (Shin Splints)',
        painfulAreas: ['Shin'],
        informationalInsights:
          'Shin splints arise from repetitive tibial loading. This plan deloads impact, restores calf/foot capacity, and re‑introduces running with cadence and surface control.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Running', 'Hard surfaces', 'Rapid mileage increase'],
        relievingFactors: ['Impact deload', 'Soft surfaces', 'Eccentric calf work'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Medial tibia',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Downhill running', 'Sprints', 'Hard-surface mileage spikes'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Shin', 'Calves', 'Foot']
      },
      questionnaire: {
        age: '20-40',
        lastYearsExerciseFrequency: '2-3 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Shin'],
        exerciseEnvironments: 'both',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Shin', 'Calves', 'Foot'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'stationary_bike']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Run Without Shin Pain',
      docId: `recovery-shin-splints-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('runners') || normalizedSlug.includes('knee')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Patellofemoral Pain Syndrome (Runner\'s Knee)',
        painfulAreas: ['Knee'],
        informationalInsights: 'Runner\'s knee is characterized by pain around or behind the kneecap. This program focuses on strengthening the quadriceps, glutes, and hip muscles while improving flexibility and movement patterns.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Running', 'Stairs', 'Prolonged sitting'],
        relievingFactors: ['Rest', 'Ice', 'Gentle stretching'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Around or behind kneecap',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running', 'Jumping', 'Deep squats'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Knee', 'Quadriceps', 'Glutes']
      },
      questionnaire: {
        age: '25-35',
        lastYearsExerciseFrequency: '3-4 times per week',
        numberOfActivityDays: '4',
        generallyPainfulAreas: ['Knee'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '30-45 minutes',
        targetAreas: ['Knee', 'Quadriceps', 'Glutes'],
        experienceLevel: 'intermediate',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Knee Comeback Plan',
      docId: `recovery-runnersknee-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('shoulder')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Shoulder Impingement Syndrome',
        painfulAreas: ['Shoulder'],
        informationalInsights: 'Shoulder impingement occurs when soft tissues are compressed during shoulder movements. This program focuses on strengthening the rotator cuff, improving posture, and restoring normal shoulder mechanics.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Overhead activities', 'Reaching behind back', 'Sleeping on affected side'],
        relievingFactors: ['Rest', 'Avoiding overhead movements', 'Ice'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Top and front of shoulder',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Overhead lifting', 'Throwing motions', 'Sleeping on affected side'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Shoulder', 'Rotator Cuff']
      },
      questionnaire: {
        age: '35-45',
        lastYearsExerciseFrequency: '2-3 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Shoulder'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '25-35 minutes',
        targetAreas: ['Shoulder', 'Rotator Cuff'],
        experienceLevel: 'beginner',
        equipment: ['resistance_bands', 'light_weights']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Shoulder Freedom Plan',
      docId: `recovery-shoulder-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('ankle')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Ankle Sprain Recovery',
        painfulAreas: ['Ankle'],
        informationalInsights: 'Ankle sprains are common injuries that require proper rehabilitation to prevent re-injury. This program focuses on restoring range of motion, strength, balance, and proprioception.',
        onset: 'acute',
        painScale: 4,
        mechanismOfInjury: 'trauma',
        aggravatingFactors: ['Walking on uneven surfaces', 'Weight bearing', 'Lateral movements'],
        relievingFactors: ['Rest', 'Elevation', 'Ice', 'Compression'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lateral ankle',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running', 'Jumping', 'Sports with cutting movements'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Ankle', 'Calf']
      },
      questionnaire: {
        age: '20-30',
        lastYearsExerciseFrequency: '3-4 times per week',
        numberOfActivityDays: '4',
        generallyPainfulAreas: ['Ankle'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Ankle', 'Calf'],
        experienceLevel: 'intermediate',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Ankle Stability Reset',
      docId: `recovery-ankle-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('tennis') || normalizedSlug.includes('elbow')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Lateral Epicondylitis (Tennis Elbow)',
        painfulAreas: ['Elbow', 'Forearm'],
        informationalInsights: 'Tennis elbow is caused by overuse of the extensor muscles of the forearm. This program focuses on eccentric strengthening, progressive loading, and addressing contributing factors.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Gripping', 'Lifting', 'Computer use', 'Racquet sports'],
        relievingFactors: ['Rest', 'Ice', 'Avoiding aggravating activities'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lateral elbow',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy gripping', 'Racquet sports', 'Repetitive wrist extension'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Elbow', 'Forearm', 'Wrist']
      },
      questionnaire: {
        age: '35-50',
        lastYearsExerciseFrequency: '2-3 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Elbow', 'Forearm'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Elbow', 'Forearm', 'Wrist'],
        experienceLevel: 'beginner',
        equipment: ['light_weights', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Elbow Strength Reset',
      docId: `recovery-tennis-elbow-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('techneck') || normalizedSlug.includes('tech-neck')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Tech Neck (Cervical Strain)',
        painfulAreas: ['Neck', 'Upper Back'],
        informationalInsights: 'Tech neck results from prolonged forward head posture during device use. This program addresses postural dysfunction, strengthens deep neck flexors, and improves upper back mobility.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'posture',
        aggravatingFactors: ['Computer work', 'Phone use', 'Poor posture', 'Stress'],
        relievingFactors: ['Posture breaks', 'Gentle stretching', 'Heat'],
        priorInjury: 'no',
        painPattern: 'constant',
        painLocation: 'Back of neck and upper shoulders',
        painCharacter: 'tight',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Prolonged computer use without breaks', 'Looking down at phone for extended periods'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Neck', 'Upper Back', 'Shoulders']
      },
      questionnaire: {
        age: '25-40',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Neck', 'Upper Back'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '15-25 minutes',
        targetAreas: ['Neck', 'Upper Back', 'Shoulders'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Neck Reset Routine',
      docId: `recovery-techneck-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('plantar')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Plantar Fasciitis',
        painfulAreas: ['Foot'],
        informationalInsights: 'Plantar fasciitis involves inflammation of the plantar fascia, causing heel pain. This program focuses on stretching, strengthening, and addressing biomechanical factors.',
        onset: 'gradual',
        painScale: 6,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['First steps in morning', 'Prolonged standing', 'Walking barefoot'],
        relievingFactors: ['Rest', 'Ice', 'Supportive footwear', 'Stretching'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Bottom of heel',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running on hard surfaces', 'Walking barefoot', 'High-impact activities'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Foot', 'Calf', 'Ankle']
      },
      questionnaire: {
        age: '40-55',
        lastYearsExerciseFrequency: '2-3 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Foot'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '15-25 minutes',
        targetAreas: ['Foot', 'Calf', 'Ankle'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'tennis_ball']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Heel Pain Reset',
      docId: `recovery-plantar-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('hamstring')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Hamstring Strain',
        painfulAreas: ['Hamstring'],
        informationalInsights: 'Hamstring strains are common in athletes and active individuals. This program focuses on progressive strengthening, flexibility, and functional movement patterns to prevent re-injury.',
        onset: 'acute',
        painScale: 5,
        mechanismOfInjury: 'trauma',
        aggravatingFactors: ['Running', 'Stretching', 'Bending forward'],
        relievingFactors: ['Rest', 'Ice', 'Gentle movement'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Back of thigh',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Sprinting', 'Aggressive stretching', 'High-intensity leg exercises'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Hamstring', 'Glutes']
      },
      questionnaire: {
        age: '20-35',
        lastYearsExerciseFrequency: '4-5 times per week',
        numberOfActivityDays: '5',
        generallyPainfulAreas: ['Hamstring'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '30-40 minutes',
        targetAreas: ['Hamstring', 'Glutes'],
        experienceLevel: 'intermediate',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Hamstring Rebuild Plan',
      docId: `recovery-hamstring-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('wrist')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Wrist Overuse Pain',
        painfulAreas: ['Wrist', 'Forearm'],
        informationalInsights:
          'Wrist overuse pain often responds well to load management and gradual forearm strength progression. This plan calms irritation while restoring grip and wrist tolerance.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: ['Typing', 'Mouse use', 'Gripping', 'Wrist extension under load'],
        relievingFactors: ['Relative rest', 'Load reduction', 'Gentle mobility'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Wrist and forearm',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy gripping', 'Fast loaded wrist extension', 'Repetitive painful wrist positions'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Wrist', 'Forearm']
      },
      questionnaire: {
        age: '25-45',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Wrist', 'Forearm'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '15-25 minutes',
        targetAreas: ['Wrist', 'Forearm'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'light_weights', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Wrist Relief Reset',
      docId: `recovery-wrist-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('upper-back') || normalizedSlug.includes('upperback')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Upper Back & Core Dysfunction',
        painfulAreas: ['Upper Back', 'Core'],
        informationalInsights: 'Upper back pain often results from poor posture and weak core muscles. This program strengthens the thoracic spine, improves posture, and builds core stability.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'posture',
        aggravatingFactors: ['Desk work', 'Poor posture', 'Stress', 'Heavy lifting'],
        relievingFactors: ['Movement', 'Stretching', 'Posture correction'],
        priorInjury: 'no',
        painPattern: 'constant',
        painLocation: 'Between shoulder blades',
        painCharacter: 'tight',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Prolonged slouching', 'Heavy overhead lifting', 'Poor lifting mechanics'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Upper Back', 'Core', 'Shoulders']
      },
      questionnaire: {
        age: '30-45',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Upper Back'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '25-35 minutes',
        targetAreas: ['Upper Back', 'Core', 'Shoulders'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight', 'resistance_bands']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Posture Power Reset',
      docId: `recovery-upperback-${Date.now()}`
    });
  }

  if (normalizedSlug.includes('core')) {
    return normalizeUserProgram({
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Core Instability',
        painfulAreas: ['Core', 'Lower Back'],
        informationalInsights: 'Core instability can lead to lower back pain and poor movement patterns. This program focuses on deep core strengthening, spinal stabilization, and functional movement.',
        onset: 'gradual',
        painScale: 3,
        mechanismOfInjury: 'posture',
        aggravatingFactors: ['Poor posture', 'Weak core muscles', 'Sedentary lifestyle'],
        relievingFactors: ['Core strengthening', 'Proper posture', 'Regular movement'],
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lower back and abdominal region',
        painCharacter: 'dull',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy lifting with poor form', 'Prolonged sitting', 'High-impact activities without proper preparation'],
        timeFrame: '4 weeks',
        followUpQuestions: [],
        programType: ProgramType.Recovery,
        targetAreas: ['Core', 'Lower Back']
      },
      questionnaire: {
        age: '25-40',
        lastYearsExerciseFrequency: '1-2 times per week',
        numberOfActivityDays: '3',
        generallyPainfulAreas: ['Core', 'Lower Back'],
        exerciseEnvironments: 'at_home',
        workoutDuration: '20-30 minutes',
        targetAreas: ['Core', 'Lower Back'],
        experienceLevel: 'beginner',
        equipment: ['bodyweight']
      },
      active: true,
      createdAt: today.toISOString(),
      updatedAt: today,
      type: ProgramType.Recovery,
      timeFrame: '4 weeks',
      title: 'Core Control Reset',
      docId: `recovery-core-${Date.now()}`
    });
  }

  // Fallback for any unmatched slugs
  return null;
};
