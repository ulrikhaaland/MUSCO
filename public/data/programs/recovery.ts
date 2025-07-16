// ------------------------------------------------------------
// Rehab Programs – FULL UPDATE 2025‑05‑31
// ▸ Keeps all 5 programs intact
// ▸ Each ProgramWeek now contains **7 days (0‑6)**
// ▸ Exercise days follow a Mo‑We‑Fr pattern (0, 2, 4)
// ▸ Rest‑day objects match the requested shape and may include
//   light optional drills for mobility/recovery.
// ------------------------------------------------------------

import { ProgramType } from '@/app/shared/types';
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
    title: 'Low‑Back Pain Relief & Strength',
    timeFrame: '4 weeks',
    programOverview:
      'This 4‑week program is designed to help you recover from non‑specific mechanical low‑back pain through targeted movement, strength, and control. You’ll follow a structured plan with three sessions per week, starting with pain relief and gentle core activation. As you progress, the focus shifts to hip and glute strength, and finally to hinge mechanics that support real-world movements like bending, lifting, and sitting. Active recovery and mobility work are built into your rest days to support healing without overloading your back.',
    timeFrameExplanation:
      'In Week 1, you’ll focus on regaining spinal mobility and reactivating your deep core muscles. Weeks 2 and 3 are about building endurance in your trunk and glutes—key for long-term support and pain reduction. By Week 4, you’ll begin integrating hip-hinge patterns and functional strength to prepare for everyday activities and a return to more dynamic movement.',
    afterTimeFrame: {
      expectedOutcome:
        'By the end of the program, you should be able to sit, walk, bend, and lift light loads with minimal or no discomfort (pain ≤ 1/10). Your core and hips will feel stronger and more stable, and you’ll have more control over your movement.',
      nextSteps:
        'From here, you can move into a general strength plan or a sport‑specific progression. Start adding resistance to your hinge and squat movements, and consider integrating light carries, sled pushes, or step-ups to keep building resilience and capacity.',
    },
    whatNotToDo:
      'Avoid exercises that involve loaded spinal flexion (like sit-ups or toes-to-bar) or deep rotation when your pain is above 2/10. Try not to stay in one position—especially sitting—for more than 30–45 minutes without a short movement break. If your symptoms worsen or start to radiate down your leg, reach out to a qualified health provider before continuing.',

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
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-05-${31 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),
    type: ProgramType.Recovery,
    createdAt: new Date('2025-05-31T00:00:00Z'),
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // -----------------------------------------------------------------
  // 2. Runner's Knee (patellofemoral pain)
  // -----------------------------------------------------------------
  {
    title: "Runner's Knee Rehab Roadmap",
    timeFrame: '4 weeks',
    programOverview:
      'This 4‑week rehab plan is designed to help you recover from runner’s knee (patellofemoral pain syndrome) by building balanced strength and improving movement control. You’ll train three days per week with a focus on quad endurance, hip stability, and progressive single-leg loading. Each session is short and manageable, with optional low-impact drills on rest days to support recovery and keep your body moving.',
    timeFrameExplanation:
      'In Week 1, you’ll back off painful loading and start activating key support muscles around your hips and knees. Week 2 introduces controlled loading through bodyweight squats and lunges. In Weeks 3 and 4, you’ll add single-leg strength and gradually reintroduce jogging so you can return to running with more confidence and less pain.',
    afterTimeFrame: {
      expectedOutcome:
        'By the end of Week 4, you should be able to jog for 20 minutes without pain and perform squats, step-downs, or stairs with control and confidence.',
      nextSteps:
        'If things feel good, you can start increasing your running distance and intensity by ~10 % per week. Consider adding plyometric drills (like skips and bounding) or progressing to sport‑specific exercises if you’re returning to competition or trail running.',
    },
    whatNotToDo:
      'Avoid downhill running, deep knee bends under load, or anything that spikes your pain above 3/10. If pain persists for more than 24 hours after activity, scale back slightly and allow more recovery between sessions.',
    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'De‑load & Control',
        'Controlled Loading (add single‑leg)',
        'Return‑to‑Run (introduce Bulgarians)',
        'Return‑to‑Run (progress mileage)',
      ];

      const sessionExercises = (
        [
          [
            { exerciseId: 'warmup-6', duration: 300, warmup: true },
            {
              exerciseId: 'glutes-44',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-45',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'quads-193',
              sets: 3,
              duration: 30,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'quads-190',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 300, warmup: true },
            {
              exerciseId: 'glutes-44',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-45',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'quads-190',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'quads-28',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 300, warmup: true },
            {
              exerciseId: 'glutes-44',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-45',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'quads-28',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'quads-186',
              sets: 3,
              repetitions: 8,
              restBetweenSets: 60,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 300, warmup: true },
            {
              exerciseId: 'glutes-44',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'glutes-45',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'quads-28',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'quads-186',
              sets: 3,
              repetitions: 10,
              restBetweenSets: 60,
            },
          ],
        ] as const
      )[weekIdx];

      const trainingDay = (dayNumber: number) => ({
        day: dayNumber,
        description: weekTitles[weekIdx],
        isRestDay: false,
        duration: 35,
        exercises: sessionExercises,
      });

      const daysArr = [
        trainingDay(1),
        createRunnersKneeRestDay(2),
        trainingDay(3),
        createRunnersKneeRestDay(4),
        trainingDay(5),
        createRunnersKneeRestDay(6),
        createRunnersKneeRestDay(7),
      ];

      return {
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-05-${31 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-05-30T00:00:00Z'),
    targetAreas: ['knee'],
    bodyParts: ['Knee'],
  },

  // -----------------------------------------------------------------
  // 3. Shoulder Impingement / Rotator‑Cuff Pain
  // -----------------------------------------------------------------
  {
    title: 'Shoulder Impingement Rehab',
    timeFrame: '4 weeks',
    programOverview:
      'This 4‑week shoulder rehab program is designed to help you recover from shoulder impingement and rotator cuff pain by restoring control, stability, and strength. You’ll train three days per week with focused, low-load exercises that reinforce healthy shoulder movement. The plan gradually introduces overhead activity as your symptoms improve. Recovery days are included to support circulation, promote mobility, and maintain progress without overuse.',
    timeFrameExplanation:
      'Weeks 1 and 2 are focused on restoring pain-free range of motion, scapular control, and rotator cuff activation using bands and bodyweight. In Week 3, you’ll start integrating light pulling movements and vertical pressing as tolerated. By Week 4, the program helps you transition to overhead strength training with dumbbells, so you can confidently return to lifting, training, or throwing.',
    afterTimeFrame: {
      expectedOutcome:
        'By the end of the program, you should have full pain-free range of motion in your shoulder and be able to press light weights (e.g. 5 kg dumbbells) overhead without discomfort.',
      nextSteps:
        'You’re ready to build overhead strength through progressive loading. If your goals include return to sport or high-rep work (e.g. CrossFit, tennis, volleyball), continue training with a focus on external rotation strength, overhead stability, and eccentric control.',
    },
    whatNotToDo:
      'Avoid pushing into sharp or pinching pain, especially at end ranges of shoulder flexion or internal rotation. Skip overhead barbell movements and dips during the first 3 weeks. If your pain increases or spreads down the arm, ease off and consider consulting a physio.',

    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Pain‑Free Range & Control',
        'Build Cuff Endurance',
        'Add Pulling & Light Press',
        'Overhead Strength Transition',
      ];

      const sessionExercises = (
        [
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
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-94',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-179',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-78',
              sets: 3,
              repetitions: 15,
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
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-94',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-179',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-78',
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
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-94',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-179',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-78',
              sets: 3,
              repetitions: 18,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-5',
              sets: 3,
              repetitions: 10,
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
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
              warmup: true,
            },
            {
              exerciseId: 'shoulders-94',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-179',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-78',
              sets: 3,
              repetitions: 18,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'shoulders-5',
              sets: 3,
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

      const daysArr = [
        trainingDay(1),
        createShoulderRestDay(2),
        trainingDay(3),
        createShoulderRestDay(4),
        trainingDay(5),
        createShoulderRestDay(6),
        createShoulderRestDay(7),
      ];

      return {
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-05-${31 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-05-29T00:00:00Z'),
    targetAreas: ['shoulder'],
    bodyParts: ['Shoulder'],
  },

  // -----------------------------------------------------------------
  // 4. Lateral Ankle Sprain (grade I–II)
  // -----------------------------------------------------------------

  {
    title: 'Ankle‑Sprain Rehab Roadmap',
    timeFrame: '4 weeks',
    programOverview:
      'This 4‑week program helps you recover from a mild to moderate lateral ankle sprain by restoring range of motion, rebuilding calf strength, and improving balance and stability. You’ll train three times per week with short, progressive sessions that evolve from basic mobility to dynamic control. On rest days, you’ll use light drills to reduce swelling, promote healing, and keep your ankle moving safely.',
    timeFrameExplanation:
      'In Week 1, you’ll focus on gentle mobility and swelling control with basic movement and light calf work. Week 2 introduces more strength work and targets the muscles that stabilize your ankle. In Week 3, you’ll add single-leg balance and proprioceptive drills to improve coordination. By Week 4, you’ll begin reintroducing jogging and dynamic movement to prepare for return to sport or daily activities.',
    afterTimeFrame: {
      expectedOutcome:
        'By the end of this program, you should be able to walk, balance on one leg with your eyes closed, and jog for 10 minutes without pain or instability.',
      nextSteps:
        'From here, you can progress into jumping and cutting drills, trail running, or light sport-specific training. If you’re returning to competitive athletics, make sure to add plyometrics and change-of-direction work under guidance.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you’ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Acute Recovery (mobility & swelling)',
        'Strength Return (calf & glute)',
        'Balance & Proprioception',
        'Return to Jog & Dynamic Loading',
      ];

      const sessionExercises = (
        [
          [
            { exerciseId: 'warmup-6', duration: 300, warmup: true },
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
              restBetweenSets: 60,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 300, warmup: true },
            {
              exerciseId: 'calves-6',
              sets: 3,
              repetitions: 15,
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
              restBetweenSets: 60,
            },
          ],
          [
            { exerciseId: 'warmup-6', duration: 300, warmup: true },
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
              restBetweenSets: 60,
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

      const daysArr = [
        trainingDay(1),
        createAnkleRestDay(2),
        trainingDay(3),
        createAnkleRestDay(4),
        trainingDay(5),
        createAnkleRestDay(6),
        createAnkleRestDay(7),
      ];

      return {
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-05-${31 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-05-28T00:00:00Z'),
    targetAreas: ['ankle'],
    bodyParts: ['Ankle'],
  },

  // -----------------------------------------------------------------
  // 5. Tennis Elbow (lateral epicondylitis)
  // -----------------------------------------------------------------
  {
    title: 'Tennis Elbow 4‑Week Fix',
    timeFrame: '4 weeks',
    programOverview:
      'This 4‑week program helps you recover from lateral epicondylitis (tennis elbow) by reducing pain, reintroducing movement, and rebuilding strength in your wrist, forearm, and grip. You’ll train three times per week using short, progressive sessions. Each workout is designed to improve tendon health without flaring symptoms. On rest days, you’ll perform light mobility work to keep the area moving and support tissue healing.',
    timeFrameExplanation:
      'In Week 1, you’ll begin with isometric holds to manage pain and restore a tolerance to light loading. Week 2 adds slow, controlled eccentric exercises to stimulate tendon repair. Week 3 brings in forearm rotation and grip-focused drills to address function. By Week 4, you’ll integrate compound forearm loading and build readiness for everyday lifting, typing, and training.',
    afterTimeFrame: {
      expectedOutcome:
        'By the end of the program, you should be able to grip, lift, or type without discomfort, and perform wrist extension movements with minimal to no pain.',
      nextSteps:
        'Start integrating progressive loading with dumbbells, resistance bands, or cables. If you’re returning to sports like tennis or climbing, add controlled plyometric and impact drills. For desk work, include grip endurance and postural correction in your long-term routine.',
    },
    whatNotToDo:
      'Avoid jerky or fast-loaded movements, especially wrist extension or gripping under fatigue. If pain spikes above 3/10 or lingers into the next day, reduce your load or reps. Stop any exercise that causes sharp, radiating pain down the arm.',
    program: [1, 2, 3, 4].map((wk) => {
      const weekIdx = wk - 1;
      const weekTitles = [
        'Isometric Pain Modulation',
        'Introduce Eccentric Loading',
        'Forearm Control + Grip Strength',
        'Functional Loading & Carryover',
      ];

      const sessionExercises = (
        [
          [
            {
              exerciseId: 'forearms-2',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
              warmup: true,
            },
            {
              exerciseId: 'forearms-1',
              sets: 5,
              duration: 45,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'forearms-2',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 45,
              warmup: true,
            },
            {
              exerciseId: 'forearms-1',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'forearms-2',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 45,
            },
            {
              exerciseId: 'forearms-1',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'biceps-1',
              sets: 2,
              repetitions: 15,
              restBetweenSets: 60,
            },
          ],
          [
            {
              exerciseId: 'forearms-2',
              sets: 3,
              repetitions: 12,
              restBetweenSets: 45,
            },
            {
              exerciseId: 'forearms-1',
              sets: 3,
              repetitions: 15,
              restBetweenSets: 60,
            },
            {
              exerciseId: 'biceps-1',
              sets: 2,
              repetitions: 15,
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

      const daysArr = [
        trainingDay(1),
        createTennisElbowRestDay(2),
        trainingDay(3),
        createTennisElbowRestDay(4),
        trainingDay(5),
        createTennisElbowRestDay(6),
        createTennisElbowRestDay(7),
      ];

      return {
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-05-${31 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-05-27T00:00:00Z'),
    targetAreas: ['elbow'],
    bodyParts: ['Elbow'],
  },

  {
    title: 'Tech Neck Rehab',
    programOverview:
      'This 4‑week program helps you relieve neck and upper trapezius tension caused by prolonged screen time, forward head posture, or stress. You’ll train three days per week using short, focused sessions that target posture, shoulder control, and deep neck flexor endurance. Active recovery days keep your upper spine mobile and relaxed without adding load.',
    timeFrame: '4 weeks',
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
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-06-${2 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['neck', 'upper traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },
  {
    title: 'Plantar Fasciitis Rehab',
    programOverview:
      'This 4‑week plantar fasciitis program is designed to relieve heel pain, rebuild arch control, and improve your foot’s ability to absorb impact. You’ll train three days per week with progressive sessions targeting the calves, ankle stability, and plantar tissue load tolerance. On rest days, you’ll perform low-intensity mobility work and foot drills to promote healing without overloading the plantar fascia.',
    timeFrame: '4 weeks',
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
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-06-${2 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },
  {
    title: 'Hamstring Strain: Return-to-Run Plan',
    programOverview:
      'This 4‑week program helps you safely recover from a mild to moderate hamstring strain and rebuild strength, control, and running tolerance. Each session uses progressive isometric, eccentric, and functional movements tailored for hamstring healing. You’ll train three days per week, with rest days focused on circulation and neural mobility to accelerate tissue repair without risking re-injury.',
    timeFrame: '4 weeks',
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
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-06-${2 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },
  {
    title: '4‑Week Upper Back & Core Reset',
    programOverview:
      'This 4‑week program helps you correct poor posture, reduce rounded shoulders, and build a stronger upper back and core. You’ll train three times per week with targeted exercises to open the chest, activate scapular stabilizers, and reinforce spinal alignment. On rest days, you’ll focus on mobility and low-load control to keep your posture improving without overtraining.',

    timeFrame: '4 weeks',

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
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-06-${2 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },
  {
    title: 'Core Stability Starter Plan',
    programOverview:
      'This 4‑week beginner core program helps you activate and strengthen the deep muscles that stabilize your spine and pelvis. It’s ideal if you’ve had back pain, feel unstable during exercise, or want to build a strong foundation before lifting heavier. You’ll train three times per week using low-impact, bodyweight-based exercises. Rest days include light movement to promote recovery and reinforce motor control.',

    timeFrame: '4 weeks',

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
        week: wk,
        differenceReason: weekTitles[weekIdx],
        createdAt: `2025-06-${2 - weekIdx * 7}T00:00:00Z`,
        days: daysArr,
      };
    }),

    type: ProgramType.Recovery,
    createdAt: new Date('2025-06-02T00:00:00Z'),
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },
];

// URL slug mapping for direct program access
export const programSlugs: Record<string, string> = {
  runnersknee: "Runner's Knee Rehab Roadmap",
  'runners-knee': "Runner's Knee Rehab Roadmap",
  lowback: 'Low‑Back Pain Relief & Strength',
  'low-back': 'Low‑Back Pain Relief & Strength',
  'lower-back': 'Low‑Back Pain Relief & Strength',
  shoulder: 'Shoulder Impingement Rehab',
  'shoulder-impingement': 'Shoulder Impingement Rehab',
  ankle: 'Ankle‑Sprain Rehab Roadmap',
  'ankle-sprain': 'Ankle‑Sprain Rehab Roadmap',
  'tennis-elbow': 'Tennis Elbow 4‑Week Fix',
  elbow: 'Tennis Elbow 4‑Week Fix',
  techneck: 'Tech Neck Rehab',
  'plantar-fasciitis': 'Plantar Fasciitis Rehab',
  plantarfasciitis: 'Plantar Fasciitis Rehab',
  plantar: 'Plantar Fasciitis Rehab',
  'hamstring-strain': 'Hamstring Strain: Return-to-Run Plan',
  hamstring: 'Hamstring Strain: Return-to-Run Plan',
  'upper-back-core': '4‑Week Upper Back & Core Reset',
  upperbackcore: '4‑Week Upper Back & Core Reset',
  'core-stability': 'Core Stability Starter Plan',
  corestability: 'Core Stability Starter Plan',
};

// Function to get program by URL slug
export const getProgramBySlug = (slug: string): ExerciseProgram | null => {
  const programTitle = programSlugs[slug.toLowerCase()];
  if (!programTitle) return null;

  return (
    rehabPrograms.find((program) => program.title === programTitle) || null
  );
};

// Function to get all available program slugs
export const getAvailableSlugs = (): string[] => {
  return Object.keys(programSlugs);
};
