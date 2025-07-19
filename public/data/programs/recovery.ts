// ------------------------------------------------------------
// Rehab Programs – FULL UPDATE 2025‑05‑31
// ▸ Keeps all 5 programs intact
// ▸ Each ProgramWeek now contains **7 days (0‑6)**
// ▸ Exercise days follow a Mo‑We‑Fr pattern (0, 2, 4)
// ▸ Rest‑day objects match the requested shape and may include
//   light optional drills for mobility/recovery.
// ------------------------------------------------------------

import { ExerciseProgram } from '@/app/types/program';

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
const createLowBackRestDay = (day: number): any => ({
  day,
  description:
    'Rest day. Gentle spinal mobility and diaphragmatic breathing to reduce stiffness.',
  isRestDay: true,
  duration: 15,
  exercises: [
    {
      exerciseId: 'warmup-9', // Stående Rotasjon av Overkropp
      duration: 300, // 5 minutes in seconds
      modification: 'Keep torso tall; rotate only to a comfortable range.',
      warmup: true,
    },
    {
      exerciseId: 'warmup-5', // Bekkentilt
      duration: 300, // 5 minutes in seconds
      modification: 'Engage core lightly; avoid lumbar pain.',
      warmup: true,
    },
    {
      exerciseId: 'lower-back-1', // Superman-løft (very low reps)
      sets: 1,
      repetitions: 8,
      restBetweenSets: 45,
      modification: 'Lift only to the point where tension is felt, not pain.',
    },
  ],
});

/* ---------------- Runner's Knee ---------------- */
const createRunnersKneeRestDay = (day: number): any => ({
  day,
  description:
    'Rest day. Light quad/hip mobility to maintain blood flow without stressing the knee joint.',
  isRestDay: true,
  duration: 15,
  exercises: [
    {
      exerciseId: 'warmup-3', // Treadmill Walk
      duration: 300, // 5 minutes in seconds
      modification: 'Walk at 5 % incline, easy pace, no pain.',
      warmup: true,
    },
    {
      exerciseId: 'glutes-44', // Liggende Hofteabduksjon
      sets: 2,
      repetitions: 12,
      restBetweenSets: 45,
      modification: 'Pause 1 s at the top; keep pelvis stable.',
    },
    {
      exerciseId: 'quads-193', // Veggsitt (isometric, short)
      sets: 1,
      duration: 30,
      restBetweenSets: 60,
      modification: 'Hold shallow angle (≤ 60° knee flexion).',
    },
  ],
});

/* ---------------- Shoulder Impingement ---------------- */
const createShoulderRestDay = (day: number): any => ({
  day,
  description:
    'Rest day. Scapular mobility and low‑load cuff activation for circulation.',
  isRestDay: true,
  duration: 15,
  exercises: [
    {
      exerciseId: 'warmup-8', // Armsirkler
      sets: 2,
      repetitions: 15,
      restBetweenSets: 30,
      modification: 'Small circles → medium; stay below pain threshold.',
      warmup: true,
    },
    {
      exerciseId: 'shoulders-30', // Bånd Pull‑Apart
      sets: 2,
      repetitions: 12,
      restBetweenSets: 45,
      modification: 'Use light band; focus on scapular squeeze.',
    },
    {
      exerciseId: 'shoulders-94', // Enarms Bånd Utadrotasjon
      sets: 2,
      repetitions: 10,
      restBetweenSets: 45,
      modification: 'Elbow tucked to side; slow tempo.',
    },
  ],
});

/* ---------------- Lateral Ankle Sprain ---------------- */
const createAnkleRestDay = (day: number): any => ({
  day,
  description:
    'Rest day. Gentle range of motion and calf pump to assist lymph drainage.',
  isRestDay: true,
  duration: 15,
  exercises: [
    {
      exerciseId: 'warmup-6', // Jogging in Place (home-friendly)
      duration: 60, // 1 minute in seconds
      modification: 'Light jogging in place, focus on ankle mobility.',
      warmup: true,
    },
    {
      exerciseId: 'calves-6', // Stående Tåhev BW
      sets: 2,
      repetitions: 12,
      restBetweenSets: 45,
      modification: 'Both legs; slow up‑down, support as needed.',
    },
    {
      exerciseId: 'calves-12', // Ettbens Tåhev (optional balance)
      sets: 1,
      repetitions: 8,
      restBetweenSets: 60,
      modification: 'Add wall support if unstable.',
    },
  ],
});

/* ---------------- Tennis Elbow ---------------- */
const createTennisElbowRestDay = (day: number): any => ({
  day,
  description:
    'Rest day. Low‑load wrist mobility and gentle neural glide to reduce elbow tension.',
  isRestDay: true,
  duration: 12,
  exercises: [
    {
      exerciseId: 'forearms-2', // Manual Håndleddsrotasjon
      sets: 2,
      repetitions: 15,
      restBetweenSets: 30,
      modification: 'Rotate through pain‑free range only.',
    },
    {
      exerciseId: 'warmup-8', // Armsirkler (open kinetic‑chain circulation)
      sets: 1,
      repetitions: 20,
      restBetweenSets: 30,
      warmup: true,
    },
    {
      exerciseId: 'biceps-1', // Stående Hammercurl (very light)
      sets: 1,
      repetitions: 12,
      restBetweenSets: 45,
      modification: 'Use 0.5 kg or no weight; focus on controlled lowering.',
    },
  ],
});

export const rehabPrograms: ExerciseProgram[] = [
  // -----------------------------------------------------------------
  // 1. Low‑Back Pain (non‑specific mechanical)
  // -----------------------------------------------------------------
  {
    programOverview:
      'This evidence-based 4‑week lower back rehabilitation program systematically addresses the root causes of mechanical low‑back pain through progressive therapeutic exercise. You\'ll begin with gentle spinal stabilization using dead bugs and bird dogs to reactivate deep core muscles, then advance through targeted glute strengthening with bridges and clamshells, and finally master hip hinge patterns with goblet squats and Romanian deadlifts. Each 20-30 minute session is precisely structured to reduce pain while building the muscular foundation needed to prevent future episodes, with active recovery days featuring targeted stretches and mobility work.',
    timeFrameExplanation:
      'Week 1 establishes spinal control and pain relief through dead bug variations, bird dog holds, and gentle pelvic tilts that reactivate your deep core stabilizers without aggravating sensitive tissues. Week 2 introduces hip mobility with hip flexor stretches and targeted glute activation through clamshells and single-leg bridges to address common muscle imbalances contributing to back pain. Week 3 builds functional strength with goblet squats, Romanian deadlifts, and side planks that teach proper hip hinge mechanics while challenging your core in multiple planes. Week 4 integrates complex movement patterns like sumo deadlifts and Turkish get-ups that prepare your body for real-world lifting demands and dynamic activities.',
    afterTimeFrame: {
      expectedOutcome:
        'You\'ll experience substantial reduction in daily back pain (targeting 0-2/10 pain levels), dramatically improved confidence when bending and lifting objects, and enhanced core endurance for prolonged sitting or standing activities. Your hip flexors will demonstrate improved mobility, glutes will be significantly stronger and more reactive during movement, and you\'ll have mastered the fundamental hip hinge pattern essential for safe lifting mechanics. Most importantly, you\'ll possess a comprehensive toolkit of therapeutic exercises proven to maintain spinal health and prevent future pain episodes.',
      nextSteps:
        'Maintain your therapeutic gains by performing the Week 4 exercise routine 2-3 times weekly as your baseline maintenance program. Gradually progress to heavier deadlift variations and loaded carries as tolerated, while incorporating cardiovascular activities like walking or swimming for overall spinal health. Implement regular movement breaks every 30-45 minutes during prolonged sitting, and use the rest day mobility exercises as your permanent daily movement routine. Consider advancing to sport-specific training or general strength programming once you can perform all Week 4 exercises pain-free with perfect form.',
    },
    whatNotToDo:
      'Never push through sharp, shooting, or worsening pain—this may indicate nerve involvement requiring immediate medical evaluation. Avoid explosive movements, heavy bilateral lifting above 50% body weight, or prolonged forward bending for the first 2 weeks while inflammatory processes resolve. Don\'t skip the rest day mobility work as it prevents stiffness and maintains progress between training sessions. Resist prolonged sitting without movement breaks, avoid sleeping positions that increase morning stiffness, and don\'t abandon the program early when pain decreases—completing all 4 weeks builds resilience against future episodes. Most critically, avoid loaded spinal flexion exercises like sit-ups or aggressive rotational movements when pain exceeds 2/10.',

    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Relief & Mobility',
        'Foundational Strength (progress loads/eccentrics)',
        'Foundational Strength (increase volume/load)',
        'Return‑to‑Activity (introduce loaded hinge)',
      ];

      const sessionExercises = (
        [
          [
            {
              exerciseId: 'warmup-9',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'warmup-5',
              sets: 1,
              repetitions: 15,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'abs-6', // Plank first
              sets: 3,
              duration: 30,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'abs-20', // Dead Bug
              sets: 3,
              repetitions: 8,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-7',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-1',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'hamstrings-48',
              sets: 3,
              repetitions: 8,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'lower-back-2',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 60,
              modification:
                'Combine with 60s diaphragmatic breathing post-set.',
            },
          ],
          [
            {
              exerciseId: 'warmup-9',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'warmup-5',
              sets: 1,
              repetitions: 20,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'abs-6',
              sets: 3,
              duration: 40,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'abs-20',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-7',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-1',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'hamstrings-48',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'lower-back-2',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 60,
              modification:
                'Combine with 60s diaphragmatic breathing post-set.',
            },
          ],
          [
            {
              exerciseId: 'warmup-9',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'warmup-5',
              sets: 1,
              repetitions: 20,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'abs-6',
              sets: 3,
              duration: 45,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'abs-20',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-46', // switch to single-leg hip thrust
              sets: 3,
              repetitions: 8,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-1',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'hamstrings-48',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 90, // extended rest for higher intensity
            },
            {
              exerciseId: 'lower-back-2',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 60,
              modification:
                'Combine with 60s diaphragmatic breathing post-set.',
            },
          ],
        ] as const
      )[weekIdx];

      const trainingDay = (dayNumber: number) => ({
        day: dayNumber,
        description: weekTitles[weekIdx],
        isRestDay: false,
        duration: 40,
        exercises: sessionExercises,
      });

      const daysArr = [
        trainingDay(1),
        createLowBackRestDay(2),
        trainingDay(3),
        createLowBackRestDay(4),
        trainingDay(5),
        createLowBackRestDay(6),
        createLowBackRestDay(7),
      ];

      return {
        createdAt: new Date(`2025-05-${31 - weekIdx * 7}T00:00:00Z`),
        days: daysArr,
      };
    }),
    createdAt: new Date('2025-05-31T00:00:00Z'),
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // -----------------------------------------------------------------
  // 2. Runner's Knee (patellofemoral pain)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on calming irritation and re‑establishing basic knee control. You\'ll use low‑impact movements and hip activation drills while inflammation settles.',
    timeFrameExplanation:
      'Back off painful loading and practice gentle range‑of‑motion plus glute activation. This sets the stage for controlled loading next week.',
    afterTimeFrame: {
      expectedOutcome:
        'Pain levels should start decreasing and stairs will feel easier.',
      nextSteps:
        'If discomfort stays below 3/10, move on to controlled bodyweight loading in Week 2.',
    },
    whatNotToDo:
      'Avoid downhill running or deep knee bends. Do not push through sharp pain.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'De‑load & Control',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-193', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(2),
      {
        day: 3,
        description: 'De‑load & Control',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-193', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(4),
      {
        day: 5,
        description: 'De‑load & Control',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-193', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'quads-190', sets: 3, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(6),
      createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },
  {
    programOverview:
      'Week 2 introduces bodyweight squats and lunges to build tolerance for single‑leg loading and improve alignment.',
    timeFrameExplanation:
      'With pain calming down, you\'ll progress to controlled movements focusing on hip stability and proper knee tracking.',
    afterTimeFrame: {
      expectedOutcome:
        'Single‑leg work should feel smoother and squats more comfortable.',
      nextSteps:
        'Continue to keep pain under control so jogging can be added in Week 3.',
    },
    whatNotToDo:
      'Hold off on running or weighted squats if discomfort persists.',
    createdAt: new Date('2025-05-24T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Controlled Loading (add single‑leg)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-190', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(2),
      {
        day: 3,
        description: 'Controlled Loading (add single‑leg)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-190', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(4),
      {
        day: 5,
        description: 'Controlled Loading (add single‑leg)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-190', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(6),
      createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },
  {
    programOverview:
      'Week 3 adds step‑downs and Bulgarian split squats to build single‑leg strength for jogging.',
    timeFrameExplanation:
      'These movements improve eccentric control and hip stability so you can tolerate gentle running.',
    afterTimeFrame: {
      expectedOutcome:
        'Bulgarian split squats and step‑downs should be comfortable with minimal soreness.',
      nextSteps:
        'Begin short jog intervals during Week 4 while keeping pain below 3/10.',
    },
    whatNotToDo:
      'Avoid sudden mileage increases or high‑impact drills this week.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Return‑to‑Run (introduce Bulgarians)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-186', sets: 3, repetitions: 8, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(2),
      {
        day: 3,
        description: 'Return‑to‑Run (introduce Bulgarians)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-186', sets: 3, repetitions: 8, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(4),
      {
        day: 5,
        description: 'Return‑to‑Run (introduce Bulgarians)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-186', sets: 3, repetitions: 8, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(6),
      createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },
  {
    programOverview:
      'Week 4 gradually increases running distance while maintaining single‑leg strength work to keep the knee resilient.',
    timeFrameExplanation:
      'Extend your jog intervals and monitor knee response. Strength sessions remain to reinforce control.',
    afterTimeFrame: {
      expectedOutcome:
        'You should comfortably jog for about 20 minutes without pain.',
      nextSteps:
        'Keep building mileage by roughly 10 % per week and progress to normal training loads.',
    },
    whatNotToDo:
      'Avoid sudden spikes in distance or speed that cause knee soreness.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Return‑to‑Run (progress mileage)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-186', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(2),
      {
        day: 3,
        description: 'Return‑to‑Run (progress mileage)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-186', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(4),
      {
        day: 5,
        description: 'Return‑to‑Run (progress mileage)',
        isRestDay: false,
        duration: 35,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'glutes-44', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-28', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'quads-186', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createRunnersKneeRestDay(6),
      createRunnersKneeRestDay(7),
    ],
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },

  // -----------------------------------------------------------------
  // 3. Shoulder Impingement / Rotator‑Cuff Pain
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on restoring pain‑free range of motion and scapular control using gentle band work.',
    timeFrameExplanation:
      'Reduce impingement symptoms and build basic stability so you can increase endurance next week.',
    afterTimeFrame: {
      expectedOutcome:
        'Pinching should decrease and you should lift your arm more comfortably.',
      nextSteps:
        'If pain stays below 2/10, advance to Week 2 for higher‑rep cuff work.',
    },
    whatNotToDo:
      'Avoid sharp pain and heavy overhead lifting.',
    createdAt: new Date('2025-05-29T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Pain‑Free Range & Control',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(2),
      {
        day: 3,
        description: 'Pain‑Free Range & Control',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(4),
      {
        day: 5,
        description: 'Pain‑Free Range & Control',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(6),
      createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  {
    programOverview:
      'Week 2 builds rotator cuff endurance with more repetitions and longer holds while keeping movements pain free.',
    timeFrameExplanation:
      'The added volume strengthens your shoulder so you can tolerate pulling and pressing soon.',
    afterTimeFrame: {
      expectedOutcome:
        'You should feel steadier with less fatigue during daily tasks.',
      nextSteps:
        'Proceed to Week 3 to introduce light rows and presses if comfortable.',
    },
    whatNotToDo:
      'Don’t rush overhead work if it provokes discomfort.',
    createdAt: new Date('2025-05-22T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Build Cuff Endurance',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(2),
      {
        day: 3,
        description: 'Build Cuff Endurance',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(4),
      {
        day: 5,
        description: 'Build Cuff Endurance',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(6),
      createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  {
    programOverview:
      'Week 3 introduces light pulling movements and vertical pressing within a comfortable range.',
    timeFrameExplanation:
      'These exercises start rebuilding strength and coordination for overhead activities.',
    afterTimeFrame: {
      expectedOutcome:
        'Light rows and presses should feel controlled with minimal irritation.',
      nextSteps:
        'Increase resistance slightly in Week 4 if pain free.',
    },
    whatNotToDo:
      'Avoid heavy or fast overhead pressing.',
    createdAt: new Date('2025-05-15T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Add Pulling & Light Press',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
          { exerciseId: 'shoulders-5', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(2),
      {
        day: 3,
        description: 'Add Pulling & Light Press',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
          { exerciseId: 'shoulders-5', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(4),
      {
        day: 5,
        description: 'Add Pulling & Light Press',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
          { exerciseId: 'shoulders-5', sets: 3, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(6),
      createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  {
    programOverview:
      'Week 4 transitions you to overhead strength work with dumbbells and full-range control.',
    timeFrameExplanation:
      'We slightly increase resistance to prepare you for regular training or sport.',
    afterTimeFrame: {
      expectedOutcome:
        'You should have full pain-free motion and confidence pressing light weights overhead.',
      nextSteps:
        'Maintain rotator cuff work weekly and continue progressive loading.',
    },
    whatNotToDo:
      'Do not ignore pain or push too quickly into heavy loads.',
    createdAt: new Date('2025-05-08T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Overhead Strength Transition',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
          { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(2),
      {
        day: 3,
        description: 'Overhead Strength Transition',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
          { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(4),
      {
        day: 5,
        description: 'Overhead Strength Transition',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-179', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 18, restBetweenSets: 60 },
          { exerciseId: 'shoulders-5', sets: 3, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createShoulderRestDay(6),
      createShoulderRestDay(7),
    ],
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  // -----------------------------------------------------------------
  // 4. Lateral Ankle Sprain (grade I–II)
  // -----------------------------------------------------------------

  {
    programOverview:
      'Week 1 focuses on gentle mobility and swelling control to restore pain-free motion.',
    timeFrameExplanation:
      'Use light range-of-motion drills and calf pumps to reduce inflammation. This prepares you for strength work next week.',
    afterTimeFrame: {
      expectedOutcome:
        'Swelling should be decreasing and walking should feel easier with minimal discomfort.',
      nextSteps:
        'If movement feels comfortable, progress to Week 2 to begin rebuilding strength.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you’ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Acute Recovery (mobility & swelling)',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(2),
      {
        day: 3,
        description: 'Acute Recovery (mobility & swelling)',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(4),
      {
        day: 5,
        description: 'Acute Recovery (mobility & swelling)',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(6),
      createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  {
    programOverview:
      'Week 2 introduces more strength work for the calf and supporting muscles.',
    timeFrameExplanation:
      'You will progress loading to build stability while continuing to manage swelling.',
    afterTimeFrame: {
      expectedOutcome:
        'Calf strength and control should improve with little to no swelling after sessions.',
      nextSteps:
        'Move on to Week 3 to challenge your balance and proprioception.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you’ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
    createdAt: new Date('2025-05-24T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Strength Return (calf & glute)',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(2),
      {
        day: 3,
        description: 'Strength Return (calf & glute)',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(4),
      {
        day: 5,
        description: 'Strength Return (calf & glute)',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(6),
      createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  {
    programOverview:
      'Week 3 adds single-leg balance and proprioceptive drills to improve coordination.',
    timeFrameExplanation:
      'Building balance prepares you for the dynamic loading introduced in Week 4.',
    afterTimeFrame: {
      expectedOutcome:
        'You should feel steady standing on one leg and notice better ankle control.',
      nextSteps:
        'If you can balance comfortably, progress to Week 4 and begin light jogging.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you’ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Balance & Proprioception',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(2),
      {
        day: 3,
        description: 'Balance & Proprioception',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(4),
      {
        day: 5,
        description: 'Balance & Proprioception',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 300, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(6),
      createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  {
    programOverview:
      'Week 4 reintroduces jogging and dynamic movements to prepare for full activity.',
    timeFrameExplanation:
      'You will continue strengthening while adding light running to transition back to sport or daily tasks.',
    afterTimeFrame: {
      expectedOutcome:
        'You should be able to jog for around 10 minutes without pain or instability.',
      nextSteps:
        'Gradually build mileage or return to sport, adding plyometrics as tolerated.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you’ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Return to Jog & Dynamic Loading',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(2),
      {
        day: 3,
        description: 'Return to Jog & Dynamic Loading',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(4),
      {
        day: 5,
        description: 'Return to Jog & Dynamic Loading',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createAnkleRestDay(6),
      createAnkleRestDay(7),
    ],
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  // -----------------------------------------------------------------
  // 5. Tennis Elbow (lateral epicondylitis)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 introduces isometric pain modulation to calm symptoms and build tolerance to light loading.',
    timeFrameExplanation:
      'Use pain‑free holds and gentle mobility to stimulate healing without aggravating the tendon.',
    afterTimeFrame: {
      expectedOutcome:
        'Pain should start easing and light gripping will feel less irritating.',
      nextSteps:
        'If discomfort stays below 3/10, progress to Week 2 for controlled eccentric work.',
    },
    whatNotToDo:
      'Avoid jerky or fast-loaded movements, especially wrist extension or gripping under fatigue. If pain spikes above 3/10 or lingers into the next day, reduce your load or reps. Stop any exercise that causes sharp, radiating pain down the arm.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Isometric Pain Modulation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'forearms-1', sets: 5, duration: 45, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(2),
      {
        day: 3,
        description: 'Isometric Pain Modulation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'forearms-1', sets: 5, duration: 45, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(4),
      {
        day: 5,
        description: 'Isometric Pain Modulation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'forearms-1', sets: 5, duration: 45, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    programOverview:
      'Week 2 introduces slow eccentric loading to promote tendon repair and strength.',
    timeFrameExplanation:
      'Controlled lowering exercises build resilience while keeping intensity moderate.',
    afterTimeFrame: {
      expectedOutcome:
        'Forearm soreness should diminish and daily tasks become easier.',
      nextSteps:
        'Move on to Week 3 to add rotation and grip‑focused drills.',
    },
    whatNotToDo:
      'Avoid jerky or fast-loaded movements, especially wrist extension or gripping under fatigue. If pain spikes above 3/10 or lingers into the next day, reduce your load or reps. Stop any exercise that causes sharp, radiating pain down the arm.',
    createdAt: new Date('2025-05-24T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Introduce Eccentric Loading',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(2),
      {
        day: 3,
        description: 'Introduce Eccentric Loading',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(4),
      {
        day: 5,
        description: 'Introduce Eccentric Loading',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 45, warmup: true },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    programOverview:
      'Week 3 builds forearm control and grip strength through rotation and endurance work.',
    timeFrameExplanation:
      'These movements enhance coordination and prepare you for functional tasks.',
    afterTimeFrame: {
      expectedOutcome:
        'Rotation drills and grip exercises should feel smoother with better stamina.',
      nextSteps:
        'Advance to Week 4 to integrate compound loading for daily activities.',
    },
    whatNotToDo:
      'Avoid jerky or fast-loaded movements, especially wrist extension or gripping under fatigue. If pain spikes above 3/10 or lingers into the next day, reduce your load or reps. Stop any exercise that causes sharp, radiating pain down the arm.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Forearm Control + Grip Strength',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(2),
      {
        day: 3,
        description: 'Forearm Control + Grip Strength',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(4),
      {
        day: 5,
        description: 'Forearm Control + Grip Strength',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    programOverview:
      'Week 4 integrates functional loading so you’re ready for everyday tasks and sport.',
    timeFrameExplanation:
      'Compound movements and carries reinforce strength gains made in the previous weeks.',
    afterTimeFrame: {
      expectedOutcome:
        'You should grip, lift, or type pain‑free with confident wrist extension.',
      nextSteps:
        'Transition to progressive strength work or sport‑specific training as tolerated.',
    },
    whatNotToDo:
      'Avoid jerky or fast-loaded movements, especially wrist extension or gripping under fatigue. If pain spikes above 3/10 or lingers into the next day, reduce your load or reps. Stop any exercise that causes sharp, radiating pain down the arm.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Functional Loading & Carryover',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(2),
      {
        day: 3,
        description: 'Functional Loading & Carryover',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(4),
      {
        day: 5,
        description: 'Functional Loading & Carryover',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'forearms-2', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'forearms-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'biceps-1', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createTennisElbowRestDay(6),
      createTennisElbowRestDay(7),
    ],
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    programOverview:
      'This 4‑week program helps you relieve neck and upper trapezius tension caused by prolonged screen time, forward head posture, or stress. You’ll train three days per week using short, focused sessions that target posture, shoulder control, and deep neck flexor endurance. Active recovery days keep your upper spine mobile and relaxed without adding load.',
    timeFrameExplanation:
      'In Week 1, you’ll start with gentle mobility and scapular control drills to open the chest and activate supporting muscles. Week 2 adds low-load strength work for the upper back and rotator cuff. In Week 3, you’ll reinforce postural endurance through higher volume and static holds. Week 4 helps you integrate better alignment into everyday movement.',
    afterTimeFrame: {
      expectedOutcome:
        'By the end of the plan, you should feel significantly less neck and shoulder tension, better upright posture, and improved awareness of head and scapular positioning during work or daily life.',
      nextSteps:
        'To maintain your progress, continue using one mobility drill per day and train your upper back at least twice per week. For strength gains, transition to resistance bands, cables, or dumbbells using rows and face pulls.',
    },
    whatNotToDo:
      'Avoid shrug-based or trap-dominant exercises (like upright rows or heavy shoulder shrugs), and don’t force end-range neck stretches into pain. If you feel numbness, dizziness, or radiating pain down the arms, stop immediately and consult a medical professional.',
    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Mobility & Awareness',
        'Scapular Strength & Cuff Activation',
        'Postural Endurance & Volume',
        'Integration & Habit Anchoring',
      ];

      const sessionExercises = (
        [
          [
            {
              exerciseId: 'warmup-8',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-30',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 45,
            },
            {
              exerciseId: 'warmup-9',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 30,
            },
            {
              exerciseId: 'shoulders-94',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 45,
            },
          ],
          [
            {
              exerciseId: 'warmup-8',
              sets: 2,
              repetitions: 20,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-30',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 45,
            },
            {
              exerciseId: 'upper-back-60',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-94',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 45,
            },
          ],
          [
            {
              exerciseId: 'warmup-8',
              sets: 2,
              repetitions: 20,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-78',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'obliques-4',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'upper-back-60',
              sets: 3,
              repetitions: 18,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'warmup-8',
              sets: 2,
              repetitions: 20,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-30',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 45,
            },
            {
              exerciseId: 'shoulders-94',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 45,
            },
            {
              exerciseId: 'warmup-9',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 30,
            },
          ],
        ] as const
      )[weekIdx];

      const trainingDay = (dayNumber: number) => ({
        day: dayNumber,
        description: weekTitles[weekIdx],
        isRestDay: false,
        duration: 25,
        exercises: sessionExercises,
      });

      const createTechNeckRestDay = (day: number): any => ({
        day,
        isRestDay: true,
        duration: 15,
        description:
          'Rest day. Gentle shoulder and neck mobility to reduce tension and improve circulation.',
        exercises: [
          {
            exerciseId: 'warmup-8', // Armsirkler
            sets: 1,
            repetitions: 20,
            restBetweenSets: 30,
            modification: 'Use small-to-large circles, slow pace.',
            warmup: true,
          },
          {
            exerciseId: 'shoulders-30', // Band pull-apart
            sets: 1,
            repetitions: 15,
            restBetweenSets: 45,
            modification: 'Focus on posture, don’t shrug shoulders.',
          },
          {
            exerciseId: 'warmup-9', // Rotasjon av Overkropp
            sets: 1,
            repetitions: 12,
            restBetweenSets: 30,
            modification: 'Move slowly; stop short of discomfort.',
          },
        ],
      });

      const daysArr = [
        trainingDay(1),
        createTechNeckRestDay(2),
        trainingDay(3),
        createTechNeckRestDay(4),
        trainingDay(5),
        createTechNeckRestDay(6),
        createTechNeckRestDay(7),
      ];

      return {
        createdAt: new Date(`2025-06-${2 - weekIdx * 7}T00:00:00Z`),
        days: daysArr,
      };
    }),

    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['neck', 'upper traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },
  {
    programOverview:
      'This 4‑week plantar fasciitis program is designed to relieve heel pain, rebuild arch control, and improve your foot’s ability to absorb impact. You’ll train three days per week with progressive sessions targeting the calves, ankle stability, and plantar tissue load tolerance. On rest days, you’ll perform low-intensity mobility work and foot drills to promote healing without overloading the plantar fascia.',
    timeFrameExplanation:
      'In Week 1, you’ll focus on light calf activation and gentle stretching to reduce tension through the foot arch. Week 2 introduces eccentric calf loading and toe activation. Week 3 builds on single-leg control and midfoot strength. By Week 4, you’ll increase functional loading so you can walk or jog pain-free and prepare for a return to daily movement or sport.',
    afterTimeFrame: {
      expectedOutcome:
        'By the end of the plan, you should be able to walk briskly and stand for extended periods without heel pain. You’ll also have stronger foot control and better load distribution when moving.',
      nextSteps:
        'Keep training your calves and toes twice per week, and use arch-strengthening drills regularly. If you’re returning to running or hiking, progress gradually with surface variety and pacing, and avoid sudden increases in mileage.',
    },
    whatNotToDo:
      'Avoid barefoot walking on hard floors early in the program, and don’t push through sharp or stabbing heel pain. Limit long static stretches of the plantar fascia—loading is better than passive pulling. If pain spikes above 3/10 for over 24 hours, reduce intensity.',
    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Light Load & Arch Activation',
        'Eccentric Calf & Toe Control',
        'Balance & Midfoot Strength',
        'Function & Return to Impact',
      ];

      const sessionExercises = (
        [
          [
            { exerciseId: 'warmup-6', duration: 180, warmup: true },
            {
              exerciseId: 'calves-6',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-44',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
            },
            // Add: towel curls or toe splay (custom exercise integration placeholder)
          ],
          [
            { exerciseId: 'warmup-6', duration: 180, warmup: true },
            {
              exerciseId: 'calves-63',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'calves-6',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
            },
            {
              exerciseId: 'glutes-44',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 180, warmup: true },
            {
              exerciseId: 'calves-12',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'calves-63',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-44',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 180, warmup: true },
            {
              exerciseId: 'calves-12',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'calves-63',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-44',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
            },
          ],
        ] as const
      )[weekIdx];

      const trainingDay = (dayNumber: number) => ({
        day: dayNumber,
        description: weekTitles[weekIdx],
        isRestDay: false,
        duration: 25,
        exercises: sessionExercises,
      });

      const createPlantarRestDay = (day: number): any => ({
        day,
        isRestDay: true,
        duration: 12,
        description:
          'Rest day. Light ankle mobility and foot circulation work to promote healing without stress.',
        exercises: [
          {
            exerciseId: 'warmup-6',
            duration: 60,
            warmup: true,
            modification: 'Jog lightly in place or march slowly for 60 sec.',
          },
          {
            exerciseId: 'calves-6',
            sets: 1,
            repetitions: 15,
            restBetweenSets: 45,
            modification:
              'Both legs together, full heel raise and slow return.',
          },
          {
            exerciseId: 'calves-12',
            sets: 1,
            repetitions: 8,
            restBetweenSets: 60,
            modification: 'Use wall or chair support for balance.',
          },
        ],
      });

      const daysArr = [
        trainingDay(1),
        createPlantarRestDay(2),
        trainingDay(3),
        createPlantarRestDay(4),
        trainingDay(5),
        createPlantarRestDay(6),
        createPlantarRestDay(7),
      ];

      return {
        createdAt: new Date(`2025-06-${2 - weekIdx * 7}T00:00:00Z`),
        days: daysArr,
      };
    }),

    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },
  {
    programOverview:
      'This 4‑week program helps you safely recover from a mild to moderate hamstring strain and rebuild strength, control, and running tolerance. Each session uses progressive isometric, eccentric, and functional movements tailored for hamstring healing. You’ll train three days per week, with rest days focused on circulation and neural mobility to accelerate tissue repair without risking re-injury.',
    timeFrameExplanation:
      'In Week 1, you’ll restore baseline mobility and pain-free isometric contraction. Week 2 adds eccentric loading to support tendon and fascial healing. Week 3 integrates single-leg control and trunk-pelvis coordination. By Week 4, you’ll return to light running and dynamic movement with confidence.',
    afterTimeFrame: {
      expectedOutcome:
        'You should be able to jog without pain, tolerate hamstring loading during hip hinge and lunge patterns, and perform eccentric hamstring work (e.g. Nordic curls) with good control.',
      nextSteps:
        'You can now increase running intensity, begin sprint drills, or return to dynamic sports. Maintain weekly hamstring strength (especially eccentric-focused) to reduce reinjury risk. Sprint progression and agility work are appropriate if pain-free.',
    },
    whatNotToDo:
      'Avoid overstretching, ballistic hamstring drills, and rapid acceleration or sprinting during the first three weeks. If sharp pain occurs mid-exercise, stop and scale back. Pain above 3/10 the next day means the load may be too high.',
    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Isometric Activation & Mobility',
        'Introduce Eccentric Loading',
        'Single-Leg Control & Hinge Strength',
        'Return to Jog & Light Dynamic Work',
      ];

      const sessionExercises = (
        [
          [
            { exerciseId: 'warmup-6', duration: 180, warmup: true },
            {
              exerciseId: 'glutes-7',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'hamstrings-48',
              sets: 3,
              repetitions: 8,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-1',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 60,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 180, warmup: true },
            {
              exerciseId: 'hamstrings-34',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-7',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'hamstrings-20',
              sets: 2,
              repetitions: 5,
              restBetweenSets: 90,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 180, warmup: true },
            {
              exerciseId: 'hamstrings-48',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-46',
              sets: 3,
              repetitions: 8,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'hamstrings-20',
              sets: 2,
              repetitions: 6,
              restBetweenSets: 90,
            },
          ],
          [
            { exerciseId: 'cardio-1', duration: 600, warmup: true }, // 10 min jog
            {
              exerciseId: 'hamstrings-48',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-46',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'hamstrings-20',
              sets: 2,
              repetitions: 8,
              restBetweenSets: 90,
            },
          ],
        ] as const
      )[weekIdx];

      const trainingDay = (dayNumber: number) => ({
        day: dayNumber,
        description: weekTitles[weekIdx],
        isRestDay: false,
        duration: 30,
        exercises: sessionExercises,
      });

      const createHamstringRestDay = (day: number): any => ({
        day,
        isRestDay: true,
        duration: 15,
        description:
          'Rest day. Gentle mobility and circulation work for healing and neural gliding.',
        exercises: [
          {
            exerciseId: 'warmup-6',
            duration: 90,
            warmup: true,
            modification: 'March in place or jog lightly with relaxed form.',
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
        ],
      });

      const daysArr = [
        trainingDay(1),
        createHamstringRestDay(2),
        trainingDay(3),
        createHamstringRestDay(4),
        trainingDay(5),
        createHamstringRestDay(6),
        createHamstringRestDay(7),
      ];

      return {
        createdAt: new Date(`2025-06-${2 - weekIdx * 7}T00:00:00Z`),
        days: daysArr,
      };
    }),

    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },
  {
    programOverview:
      'This 4‑week program helps you correct poor posture, reduce rounded shoulders, and build a stronger upper back and core. You’ll train three times per week with targeted exercises to open the chest, activate scapular stabilizers, and reinforce spinal alignment. On rest days, you’ll focus on mobility and low-load control to keep your posture improving without overtraining.',


    timeFrameExplanation:
      'In Week 1, you’ll work on posture awareness and mobility of the thoracic spine and shoulders. Week 2 introduces controlled pulling and shoulder blade activation. Week 3 adds time-under-tension and stability work for endurance. Week 4 integrates core and full-body posture control, helping you sit, stand, and move upright with less effort.',

    afterTimeFrame: {
      expectedOutcome:
        'You should notice visibly better posture, reduced shoulder fatigue or tightness, and more control during sitting, walking, or standing. You’ll feel more open through your chest and stronger in your upper back.',
      nextSteps:
        'To maintain your progress, keep training your upper back twice per week and do short mobility drills daily. Add resistance (bands, cables, dumbbells) to continue strengthening your scapular and thoracic support systems.',
    },

    whatNotToDo:
      'Avoid heavy pressing, prolonged slouching, or overhead work that causes fatigue before Week 3. If you feel numbness, pinching, or neck pain, stop and regress to lighter scapular drills.',

    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Posture Awareness & Mobility',
        'Scapular Control & Pull Strength',
        'Endurance & Time Under Tension',
        'Core-Integrated Posture Training',
      ];

      const sessionExercises = (
        [
          [
            {
              exerciseId: 'warmup-9',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'warmup-8',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-30',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 45,
            },
            {
              exerciseId: 'upper-back-60',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'warmup-8',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 30,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-94',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'upper-back-3',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'obliques-4',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'shoulders-78',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'upper-back-8',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'obliques-14',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'shoulders-30',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'upper-back-60',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'obliques-4',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 60,
            },
          ],
        ] as const
      )[weekIdx];

      const trainingDay = (dayNumber: number) => ({
        day: dayNumber,
        description: weekTitles[weekIdx],
        isRestDay: false,
        duration: 30,
        exercises: sessionExercises,
      });

      const createPostureRestDay = (day: number): any => ({
        day,
        isRestDay: true,
        duration: 15,
        description:
          'Rest day. Gentle thoracic mobility and postural activation to maintain upright awareness.',
        exercises: [
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
            modification: 'Rotate only to a comfortable range. Don’t force it.',
          },
        ],
      });

      const daysArr = [
        trainingDay(1),
        createPostureRestDay(2),
        trainingDay(3),
        createPostureRestDay(4),
        trainingDay(5),
        createPostureRestDay(6),
        createPostureRestDay(7),
      ];

      return {
        createdAt: new Date(`2025-06-${2 - weekIdx * 7}T00:00:00Z`),
        days: daysArr,
      };
    }),

    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },
  {
    programOverview:
      'This 4‑week beginner core program helps you activate and strengthen the deep muscles that stabilize your spine and pelvis. It’s ideal if you’ve had back pain, feel unstable during exercise, or want to build a strong foundation before lifting heavier. You’ll train three times per week using low-impact, bodyweight-based exercises. Rest days include light movement to promote recovery and reinforce motor control.',


    timeFrameExplanation:
      'In Week 1, you’ll focus on reactivating your deep core muscles and practicing control in simple positions. Week 2 adds time under tension and limb coordination. In Week 3, you’ll incorporate balance, anti-rotation, and lateral core engagement. Week 4 transitions to longer holds and multi-planar control to prepare you for more advanced training.',

    afterTimeFrame: {
      expectedOutcome:
        'You should feel more stable and supported in your core, with better posture, easier balance, and improved control during daily movements. If you’ve had back pain, your baseline tolerance should also improve.',
      nextSteps:
        'You can move into progressive resistance training, Pilates, or heavier compound lifts. Keep at least 1–2 core sessions per week for maintenance, especially if you sit for long periods or train regularly.',
    },

    whatNotToDo:
      'Avoid high-rep sit-ups, weighted spinal flexion, or long planks with poor form. If you feel pain in your back, hips, or neck during an exercise, stop and regress. Focus on control over intensity.',

    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Activation & Control',
        'Time Under Tension & Movement',
        'Stability & Balance Challenges',
        'Multi-Planar Core Integration',
      ];

      const sessionExercises = (
        [
          [
            {
              exerciseId: 'abs-20',
              sets: 3,
              repetitions: 8,
              restBetweenSets: 60,
            }, // Dead Bug
            { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 }, // Plank
            {
              exerciseId: 'glutes-7',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 60,
            }, // Setebro
          ],
          [
            {
              exerciseId: 'abs-20',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            { exerciseId: 'abs-6', sets: 3, duration: 40, restBetweenSets: 60 },
            {
              exerciseId: 'glutes-7',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'obliques-4',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'abs-121',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            }, // Spiderman plank
            {
              exerciseId: 'obliques-14',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 60,
            }, // Sideplanke rotasjon
            {
              exerciseId: 'glutes-45',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'abs-121',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'abs-120',
              sets: 2,
              repetitions: 10,
              restBetweenSets: 60,
            }, // Planke til Push-up
            {
              exerciseId: 'obliques-14',
              sets: 2,
              repetitions: 12,
              restBetweenSets: 60,
            },
          ],
        ] as const
      )[weekIdx];

      const trainingDay = (dayNumber: number) => ({
        day: dayNumber,
        description: weekTitles[weekIdx],
        isRestDay: false,
        duration: 25,
        exercises: sessionExercises,
      });

      const createCoreRestDay = (day: number): any => ({
        day,
        isRestDay: true,
        duration: 12,
        description:
          'Rest day. Light activation to promote blood flow and reinforce core engagement.',
        exercises: [
          {
            exerciseId: 'glutes-7',
            sets: 1,
            repetitions: 15,
            restBetweenSets: 45,
            modification: 'Hold 1s at top, focus on breath and core tension.',
          },
          {
            exerciseId: 'abs-20',
            sets: 1,
            repetitions: 8,
            restBetweenSets: 45,
            modification: 'Slow, controlled movement; keep lower back flat.',
          },
          {
            exerciseId: 'warmup-9',
            sets: 1,
            repetitions: 10,
            restBetweenSets: 30,
            modification: 'Rotate gently through comfortable range.',
          },
        ],
      });

      const daysArr = [
        trainingDay(1),
        createCoreRestDay(2),
        trainingDay(3),
        createCoreRestDay(4),
        trainingDay(5),
        createCoreRestDay(6),
        createCoreRestDay(7),
      ];

      return {
        createdAt: new Date(`2025-06-${2 - weekIdx * 7}T00:00:00Z`),
        days: daysArr,
      };
    }),

    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },
];

// URL slug mapping for direct program access
export const programSlugs: Record<string, number> = {
  runnersknee: 1,
  'runners-knee': 1,
  lowback: 0,
  'low-back': 0,
  'lower-back': 0,
  shoulder: 5,
  'shoulder-impingement': 5,
  ankle: 9,
  'ankle-sprain': 9,
  'tennis-elbow': 13,
  elbow: 13,
  techneck: 17,
  'plantar-fasciitis': 18,
  plantarfasciitis: 18,
  plantar: 18,
  'hamstring-strain': 19,
  hamstring: 19,
  'upper-back-core': 20,
  upperbackcore: 20,
  'core-stability': 21,
  corestability: 21,
};

// Function to get program by URL slug
export const getProgramBySlug = (slug: string): ExerciseProgram | null => {
  const index = programSlugs[slug.toLowerCase()];
  if (typeof index !== 'number') return null;
  return rehabPrograms[index] || null;
};

// Function to get all available program slugs
export const getAvailableSlugs = (): string[] => {
  return Object.keys(programSlugs);
};
