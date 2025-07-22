// ------------------------------------------------------------
// Rehab Programs – FULL UPDATE 2025‑05‑31
// ▸ Keeps all 5 programs intact
// ▸ Each ProgramWeek now contains **7 days (0‑6)**
// ▸ Exercise days follow a Mo‑We‑Fr pattern (0, 2, 4)
// ▸ Rest‑day objects match the requested shape and may include
//   light optional drills for mobility/recovery.
// ------------------------------------------------------------

import { ExerciseProgram } from '../../../src/app/types/program';
import { DiagnosisAssistantResponse } from '../../../src/app/types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../src/app/shared/types';

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
  const base = {
    day,
    isRestDay: true,
    duration: 15
  };

  if (day <= 7) {
    // WEEK 1: Foundational mobility and diaphragm control
    return {
      ...base,
      description: 'Rest day. Gentle spinal mobility and diaphragmatic breathing to reduce stiffness.',
      exercises: [
        { exerciseId: 'warmup-9', duration: 300, warmup: true, modification: 'Keep torso tall; rotate only to a comfortable range.' },
        { exerciseId: 'warmup-5', duration: 300, warmup: true, modification: 'Engage core lightly; avoid lumbar pain.' },
        { exerciseId: 'lower-back-1', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Lift only to the point where tension is felt, not pain.' }
      ]
    };
  }

  if (day <= 14) {
    // WEEK 2: Add hip stability and core tension hold
    return {
      ...base,
      description: 'Rest day. Add light glute and core coordination to support spinal alignment.',
      exercises: [
        { exerciseId: 'warmup-5', duration: 300, warmup: true, modification: 'Pelvic tilt with breath coordination.' },
        { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Bodyweight bridge; pause 1s at top.' },
        { exerciseId: 'lower-back-1', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Controlled extension, no pain.' }
      ]
    };
  }

  if (day <= 21) {
    // WEEK 3: Add oblique anti-rotation for control
    return {
      ...base,
      description: 'Rest day. Reinforce deep core and oblique control while maintaining spinal neutrality.',
      exercises: [
        { exerciseId: 'obliques-4', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Slow controlled movement; avoid trunk shifting.' },
        { exerciseId: 'glutes-7', sets: 1, repetitions: 20, restBetweenSets: 45, modification: 'Add 2s pause at top of each rep.' },
        { exerciseId: 'lower-back-1', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Limit range if tension increases.' }
      ]
    };
  }

  // WEEK 4: Breathing under load + trunk endurance
  return {
    ...base,
    description: 'Rest day. Integrate breathing with movement and reinforce core-endurance patterns.',
    exercises: [
      { exerciseId: 'abs-20', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Exhale during lift, keep lumbar spine neutral.' },
      { exerciseId: 'glutes-7', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Hold 1s, avoid hyperextension.' },
      { exerciseId: 'lower-back-1', sets: 2, repetitions: 8, restBetweenSets: 45, modification: 'Light lift, pause, and controlled lower.' }
    ]
  };
};

/* ---------------- Runner's Knee ---------------- */
const createRunnersKneeRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true,
    duration: 15
  };

  if (day <= 7) {
    // WEEK 1: Circulation + basic isometric control
    return {
      ...base,
      description: 'Rest day. Light quad/hip mobility to maintain blood flow without stressing the knee joint.',
      exercises: [
        { exerciseId: 'warmup-3', duration: 300, warmup: true, modification: 'Walk at 5% incline, easy pace, no pain.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Pause 1s at the top; keep pelvis stable.' },
        { exerciseId: 'quads-193', sets: 1, duration: 30, restBetweenSets: 60, modification: 'Hold shallow angle (≤ 60° knee flexion).' }
      ]
    };
  }

  if (day <= 14) {
    // WEEK 2: Add reps and posterior chain balance
    return {
      ...base,
      description: 'Rest day. Add posterior chain support to improve knee control without loading the joint.',
      exercises: [
        { exerciseId: 'warmup-3', duration: 300, warmup: true, modification: 'Walk at incline or light uphill if available.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Controlled tempo, no pelvic tilt.' },
        { exerciseId: 'glutes-7', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Bodyweight glute bridge, pause 1s at top.' }
      ]
    };
  }

  if (day <= 21) {
    // WEEK 3: Add balance challenge + eccentric emphasis
    return {
      ...base,
      description: 'Rest day. Improve balance and hip control while continuing to offload the knee.',
      exercises: [
        { exerciseId: 'warmup-3', duration: 300, warmup: true, modification: 'Maintain steady breathing, easy pace.' },
        { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Pause 1s at top; control descent.' },
        { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Controlled tempo; focus on symmetry.' }
      ]
    };
  }

  // WEEK 4: Reinforce glute patterning and reintroduce wall sit
  return {
    ...base,
    description: 'Rest day. Reinforce posterior support and tolerance for static quad activation.',
    exercises: [
      { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Slow and stable reps.' },
      { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold 1s at top, breathe out on lift.' },
      { exerciseId: 'quads-193', sets: 1, duration: 40, restBetweenSets: 60, modification: 'Wall sit at 45–60°; stop if knee discomfort.' }
    ]
  };
};

/* ---------------- Shoulder Impingement ---------------- */
const createShoulderRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true,
    duration: 15
  };

  if (day <= 7) {
    // WEEK 1: Basic scapular mobility and cuff circulation
    return {
      ...base,
      description: 'Rest day. Scapular mobility and low-load cuff activation for circulation.',
      exercises: [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Small circles → medium; stay below pain threshold.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Use light band; focus on scapular squeeze.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Elbow tucked to side; slow tempo.' }
      ]
    };
  }

  if (day <= 14) {
    // WEEK 2: Slightly increased volume, focus on control
    return {
      ...base,
      description: 'Rest day. Build shoulder control with higher rep scapular and cuff movements.',
      exercises: [
        { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true, modification: 'Controlled, full-range circles.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Pause 1s at full retraction.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Keep band tension consistent throughout.' }
      ]
    };
  }

  if (day <= 21) {
    // WEEK 3: Add shoulder flexion patterning (safe range)
    return {
      ...base,
      description: 'Rest day. Introduce gentle shoulder flexion to promote functional mobility.',
      exercises: [
        { exerciseId: 'shoulders-179', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Banded shoulder flexion; lift only to eye level.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Scapular control; avoid shrugging.' },
        { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Slow, pain-free external rotation.' }
      ]
    };
  }

  // WEEK 4: Reinforce control with higher rep and small load tolerance
  return {
    ...base,
    description: 'Rest day. Strengthen shoulder stabilizers and reinforce safe movement patterns.',
    exercises: [
      { exerciseId: 'shoulders-94', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Perform with tempo: 2s out, 2s back.' },
      { exerciseId: 'shoulders-30', sets: 2, repetitions: 18, restBetweenSets: 45, modification: 'Squeeze at end range, no compensatory shrug.' },
      { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true, modification: 'Finish with smooth scapular circles.' }
    ]
  };
};

/* ---------------- Lateral Ankle Sprain ---------------- */
const createAnkleRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true,
    duration: 15
  };

  if (day <= 7) {
    // WEEK 1: Gentle mobility and circulation
    return {
      ...base,
      description: 'Rest day. Gentle range of motion and calf pump to assist lymph drainage.',
      exercises: [
        { exerciseId: 'warmup-6', duration: 60, warmup: true, modification: 'Light jogging in place, focus on ankle mobility.' },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Both legs; slow up-down, support as needed.' },
        { exerciseId: 'calves-12', sets: 1, repetitions: 8, restBetweenSets: 60, modification: 'Add wall support if unstable.' }
      ]
    };
  }

  if (day <= 14) {
    // WEEK 2: More volume and proprioceptive cueing
    return {
      ...base,
      description: 'Rest day. Increase calf control and begin rebuilding joint awareness.',
      exercises: [
        { exerciseId: 'warmup-6', duration: 90, warmup: true, modification: 'March in place; full-foot contact, quiet landings.' },
        { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Use wall support; pause 1s at top.' },
        { exerciseId: 'calves-6', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Smooth tempo, both legs.' }
      ]
    };
  }

  if (day <= 21) {
    // WEEK 3: Emphasize single-leg control and time-under-tension
    return {
      ...base,
      description: 'Rest day. Reinforce ankle control with unilateral loading and balance prep.',
      exercises: [
        { exerciseId: 'calves-12', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Balance focus; add finger support only if needed.' },
        { exerciseId: 'glutes-44', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Isolate hip abduction; keep pelvis stable.' },
        { exerciseId: 'warmup-6', duration: 60, warmup: true, modification: 'Jog or march in place to finish; no heel strike.' }
      ]
    };
  }

  // WEEK 4: Slight increase in challenge, reinforce stability
  return {
    ...base,
    description: 'Rest day. Improve single-leg stability and ankle control for walking and return to activity.',
    exercises: [
      { exerciseId: 'calves-12', sets: 2, repetitions: 12, restBetweenSets: 60, modification: 'Use slow tempo. Focus on balance.' },
      { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Double-leg raise with strong control.' },
      { exerciseId: 'glutes-44', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Pause 1s at top. Maintain posture.' }
    ]
  };
};

/* ---------------- Tennis Elbow ---------------- */
const createTennisElbowRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true,
    duration: 12
  };

  if (day <= 7) {
    // WEEK 1: Forearm mobility and low-load circulation
    return {
      ...base,
      description: 'Rest day. Low-load wrist mobility and gentle neural glide to reduce elbow tension.',
      exercises: [
        { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 30, modification: 'Rotate through pain-free range only.' },
        { exerciseId: 'warmup-8', sets: 1, repetitions: 20, restBetweenSets: 30, warmup: true },
        { exerciseId: 'biceps-1', sets: 1, repetitions: 12, restBetweenSets: 45, modification: 'Use 0.5 kg or no weight; focus on controlled lowering.' }
      ]
    };
  }

  if (day <= 14) {
    // WEEK 2: Add tempo cue and control
    return {
      ...base,
      description: 'Rest day. Increase control with slightly higher reps and slow eccentric emphasis.',
      exercises: [
        { exerciseId: 'forearms-2', sets: 2, repetitions: 18, restBetweenSets: 30, modification: 'Slow down rotation tempo; keep range pain-free.' },
        { exerciseId: 'biceps-1', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Lower slowly for 3s per rep.' },
        { exerciseId: 'warmup-8', sets: 1, repetitions: 25, restBetweenSets: 30, warmup: true }
      ]
    };
  }

  if (day <= 21) {
    // WEEK 3: Introduce low-volume isometric hold
    return {
      ...base,
      description: 'Rest day. Reinforce tendon loading tolerance with a light isometric hold.',
      exercises: [
        { exerciseId: 'forearms-2', sets: 2, repetitions: 15, restBetweenSets: 30, modification: 'Pause 1s at end range.' },
        { exerciseId: 'forearms-1', sets: 1, duration: 30, restBetweenSets: 45, modification: 'Gentle static wrist extension; stop if painful.' },
        { exerciseId: 'biceps-1', sets: 2, repetitions: 12, restBetweenSets: 45 }
      ]
    };
  }

  // WEEK 4: Add light grip endurance challenge
  return {
    ...base,
    description: 'Rest day. Improve endurance with higher-rep grip work and rotation control.',
    exercises: [
      { exerciseId: 'forearms-2', sets: 2, repetitions: 20, restBetweenSets: 30, modification: 'Smooth, continuous motion through full pain-free range.' },
      { exerciseId: 'forearms-1', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Use very light load or towel grip; controlled tempo.' },
      { exerciseId: 'biceps-1', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Stay relaxed in shoulder; focus on wrist position.' }
    ]
  };
};

/* ---------------- Hamstring Strain ---------------- */
const createHamstringRestDay = (day: number): any => ({
  day,
  description:
    'Rest day. Gentle mobility and circulation work for healing and neural gliding.',
  isRestDay: true,
  duration: 15,
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

/* ---------------- Posture ---------------- */
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
      modification: 'Rotate only to a comfortable range. Don\'t force it.',
    },
  ],
});

/* ---------------- Tech Neck ---------------- */
const createTechNeckRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true,
    duration: 12
  };

  if (day <= 7) {
    // WEEK 1
    return {
      ...base,
      description: 'Rest day. Gentle neck and shoulder mobility to maintain progress without overworking.',
      exercises: [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Small, slow circles. Focus on relaxed shoulders.', warmup: true },
        { exerciseId: 'shoulders-30', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Very light tension. Pause and breathe at the squeeze.' },
        { exerciseId: 'warmup-9', sets: 1, repetitions: 8, restBetweenSets: 30, modification: 'Gentle rotation, keep head neutral.' }
      ]
    };
  }

  if (day <= 14) {
    // WEEK 2
    return {
      ...base,
      description: 'Rest day. Reinforce shoulder control and introduce spinal dissociation for postural support.',
      exercises: [
        { exerciseId: 'warmup-8', sets: 1, repetitions: 15, restBetweenSets: 30, modification: 'Relax shoulders; increase range slightly.', warmup: true },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Control the squeeze; keep neck neutral.' },
        { exerciseId: 'warmup-5', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Pelvic tilt with light core engagement.' }
      ]
    };
  }

  if (day <= 21) {
    // WEEK 3
    return {
      ...base,
      description: 'Rest day. Build scapular control and add flexion patterning without neck strain.',
      exercises: [
        { exerciseId: 'shoulders-179', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Lift only to shoulder height with light band tension.' },
        { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Squeeze shoulder blades together gently.' },
        { exerciseId: 'warmup-9', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Slow and mindful spinal rotation.' }
      ]
    };
  }

  // WEEK 4 (day 22+)
  return {
    ...base,
    description: 'Rest day. Light rotator cuff activation and posture control to reinforce recovery gains.',
    exercises: [
      { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Slow external rotation with elbow tucked to side.' },
      { exerciseId: 'shoulders-30', sets: 2, repetitions: 15, restBetweenSets: 45, modification: 'Add brief pause at full retraction.' },
      { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Keep chest tall, rotate gently.' }
    ]
  };
};

/* ---------------- Plantar Fasciitis ---------------- */
const createPlantarRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true,
    duration: 10
  };

  if (day <= 7) {
    // WEEK 1: Basic mobility and light calf activation
    return {
      ...base,
      description: 'Rest day. Light foot mobility and calf stretches to support healing.',
      exercises: [
        { exerciseId: 'warmup-6', duration: 90, warmup: true, modification: 'March gently in place, focus on foot contact.' },
        { exerciseId: 'calves-6', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Light heel raises, control the descent.' },
        { exerciseId: 'glutes-44', sets: 1, repetitions: 10, restBetweenSets: 30, modification: 'Keep movements slow and controlled.' }
      ]
    };
  }

  if (day <= 14) {
    // WEEK 2: Add volume and reinforce eccentric control
    return {
      ...base,
      description: 'Rest day. Reinforce calf control and introduce light arch stability.',
      exercises: [
        { exerciseId: 'warmup-6', duration: 90, warmup: true, modification: 'March in place with full foot roll-through.' },
        { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Use slow eccentric lowering.' },
        { exerciseId: 'glutes-44', sets: 1, repetitions: 12, restBetweenSets: 30, modification: 'Engage glutes fully; no rotation.' }
      ]
    };
  }

  if (day <= 21) {
    // WEEK 3: Add unilateral balance
    return {
      ...base,
      description: 'Rest day. Challenge ankle control and foot arch through unilateral work.',
      exercises: [
        { exerciseId: 'warmup-6', duration: 90, warmup: true, modification: 'Light jog in place, no heel impact.' },
        { exerciseId: 'calves-12', sets: 1, repetitions: 8, restBetweenSets: 60, modification: 'Single-leg heel raise; use support if needed.' },
        { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 30, modification: 'Pause at top, keep pelvis stable.' }
      ]
    };
  }

  // WEEK 4: Increase control, reinforce strength
  return {
    ...base,
    duration: 12,
    description: 'Rest day. Improve foot strength and maintain calf endurance with controlled loading.',
    exercises: [
      { exerciseId: 'calves-63', sets: 2, repetitions: 10, restBetweenSets: 60, modification: 'Use slow lowering; moderate tempo up.' },
      { exerciseId: 'calves-6', sets: 2, repetitions: 12, restBetweenSets: 45, modification: 'Double-leg raise with longer pause at top.' },
      { exerciseId: 'glutes-44', sets: 2, repetitions: 12, restBetweenSets: 30, modification: 'Slow reps, squeeze glutes at top.' }
    ]
  };
};

/* ---------------- Core Stability ---------------- */
const createCoreRestDay = (day: number): any => {
  const base = {
    day,
    isRestDay: true,
    duration: 12
  };

  if (day <= 7) {
    // WEEK 1: Basic glute and trunk activation
    return {
      ...base,
      description: 'Rest day. Gentle activation for the glutes and trunk to promote circulation and postural control.',
      exercises: [
        { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold 1s at top, focus on breath and core tension.' },
        { exerciseId: 'abs-20', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Slow and controlled; keep lower back in contact with floor.' },
        { exerciseId: 'warmup-9', sets: 1, repetitions: 10, restBetweenSets: 30, warmup: true, modification: 'Rotate gently through comfortable range.' }
      ]
    };
  }

  if (day <= 14) {
    // WEEK 2: Introduce anti-rotation (obliques) and longer hold
    return {
      ...base,
      description: 'Rest day. Light anti-rotation and core control to improve deep stabilizer endurance.',
      exercises: [
        { exerciseId: 'glutes-7', sets: 1, repetitions: 15, restBetweenSets: 45, modification: 'Hold each rep for 2s at top.' },
        { exerciseId: 'obliques-4', sets: 1, repetitions: 8, restBetweenSets: 45, modification: 'Maintain symmetry, slow tempo.' },
        { exerciseId: 'abs-6', sets: 1, duration: 30, restBetweenSets: 30, modification: 'Brace core during each marching movement.', warmup: true }
      ]
    };
  }

  if (day <= 21) {
    // WEEK 3: Add balance & lateral challenge
    return {
      ...base,
      description: 'Rest day. Introduce lateral control and balance to challenge trunk stability.',
      exercises: [
        { exerciseId: 'abs-121', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Slow tempo, avoid wobbling.' },
        { exerciseId: 'glutes-45', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Engage core throughout.' },
        { exerciseId: 'warmup-9', sets: 1, repetitions: 12, restBetweenSets: 30, warmup: true, modification: 'Slow spinal rotation.' }
      ]
    };
  }

  // WEEK 4: More volume on anti-rotation + deep core endurance
  return {
    ...base,
    description: 'Rest day. Reinforce anti-rotation control and increase endurance for deep core.',
    exercises: [
      { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 45, modification: 'Resist rotation throughout full range.' },
      { exerciseId: 'abs-20', sets: 1, repetitions: 10, restBetweenSets: 45, modification: 'Focus on breath and bracing.' },
      { exerciseId: 'abs-6', sets: 1, duration: 40, restBetweenSets: 30, warmup: true, modification: 'Controlled marching, avoid spine movement.' }
    ]
  };
};

export const rehabPrograms: ExerciseProgram[] = [
  // -----------------------------------------------------------------
  // 1. Low‑Back Pain (non‑specific mechanical)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on gentle spinal stabilization and core reactivation for pain relief.',
    summary: 'Gentle spinal stabilization and pain relief with core reactivation',
    timeFrameExplanation:
      'Start with basic spinal control exercises and core activation to reduce pain and establish foundation.',
    afterTimeFrame: {
      expectedOutcome:
        'Reduced daily back pain and improved confidence with basic movements.',
      nextSteps:
        'Progress to Week 2 for hip mobility and targeted glute activation.',
    },
    whatNotToDo:
      'Never push through sharp pain or avoid explosive movements during early healing.',
    createdAt: new Date('2025-05-31T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Relief & Mobility',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createLowBackRestDay(2),
      {
        day: 3,
        description: 'Relief & Mobility',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createLowBackRestDay(4),
      {
        day: 5,
        description: 'Relief & Mobility',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-46', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // WEEK 2
  {
    programOverview:
      'Week 2 introduces hip mobility with targeted glute activation to address muscle imbalances.',
    summary: 'Hip mobility and glute activation for muscle balance',
    timeFrameExplanation:
      'Build foundational strength through progressive loading and eccentric control.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved hip mobility and stronger glute activation patterns.',
      nextSteps:
        'Progress to Week 3 for functional strength and hip hinge patterns.',
    },
    whatNotToDo:
      'Never push through sharp pain or avoid explosive movements during early healing.',
    createdAt: new Date('2025-05-24T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Foundational Strength (progress loads/eccentrics)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 90 },
        ],
      },
      createLowBackRestDay(2),
      {
        day: 3,
        description: 'Foundational Strength (progress loads/eccentrics)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 90 },
        ],
      },
      createLowBackRestDay(4),
      {
        day: 5,
        description: 'Foundational Strength (progress loads/eccentrics)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 2, repetitions: 8, restBetweenSets: 90 },
        ],
      },
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // WEEK 3
  {
    programOverview:
      'Week 3 builds functional strength with squats and side planks that challenge core in multiple planes.',
    summary: 'Functional strength with squats and multi-plane core work',
    timeFrameExplanation:
      'Learn proper hip hinge mechanics while increasing training volume and load.',
    afterTimeFrame: {
      expectedOutcome:
        'Mastered hip hinge patterns and improved core endurance in multiple planes.',
      nextSteps:
        'Progress to Week 4 for complex movement integration and return to activity.',
    },
    whatNotToDo:
      'Never push through sharp pain or avoid explosive movements during early healing.',
    createdAt: new Date('2025-05-17T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Foundational Strength (increase volume/load)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'quads-87', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 90 },
          { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        ],
      },
      createLowBackRestDay(2),
      {
        day: 3,
        description: 'Foundational Strength (increase volume/load)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'quads-87', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 90 },
          { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        ],
      },
      createLowBackRestDay(4),
      {
        day: 5,
        description: 'Foundational Strength (increase volume/load)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'quads-87', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 90 },
          { exerciseId: 'obliques-4', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
        ],
      },
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // WEEK 4
  {
    programOverview:
      'Week 4 integrates complex movement patterns to prepare for real-world lifting demands.',
    summary: 'Complex movement patterns for real-world lifting demands',
    timeFrameExplanation:
      'Advanced loaded hinge patterns and movement integration for return to full activity.',
    afterTimeFrame: {
      expectedOutcome:
        'Substantial reduction in daily back pain and confidence with bending and lifting.',
      nextSteps:
        'Maintain gains with Week 4 exercises 2-3 times weekly and progress to heavier movements.',
    },
    whatNotToDo:
      'Never push through sharp pain or avoid explosive movements during early healing.',
    createdAt: new Date('2025-05-10T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Return‑to‑Activity (introduce loaded hinge)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'quads-87', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 90 },
          { exerciseId: 'lower-back-2', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Combine with 60s diaphragmatic breathing post-set.' },
        ],
      },
      createLowBackRestDay(2),
      {
        day: 3,
        description: 'Return‑to‑Activity (introduce loaded hinge)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'quads-87', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 90 },
          { exerciseId: 'lower-back-2', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Combine with 60s diaphragmatic breathing post-set.' },
        ],
      },
      createLowBackRestDay(4),
      {
        day: 5,
        description: 'Return‑to‑Activity (introduce loaded hinge)',
        isRestDay: false,
        duration: 40,
        exercises: [
          { exerciseId: 'quads-87', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 90 },
          { exerciseId: 'lower-back-2', sets: 2, repetitions: 15, restBetweenSets: 60, modification: 'Combine with 60s diaphragmatic breathing post-set.' },
        ],
      },
      createLowBackRestDay(6),
      createLowBackRestDay(7),
    ],
    targetAreas: ['lower back'],
    bodyParts: ['Lower Back'],
  },

  // -----------------------------------------------------------------
  // 2. Runner's Knee (patellofemoral pain)
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on calming knee irritation and re‑establishing basic control.',
    summary: 'Calming knee irritation with low-impact movements and control',
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
    summary: 'Bodyweight squats and lunges for single-leg loading tolerance',
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
    summary: 'Step-downs and Bulgarian squats for single-leg jogging strength',
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
    summary: 'Gradually increasing running distance with strength maintenance',
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
    summary: 'Pain-free range of motion and scapular control with bands',
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
    summary: 'Building rotator cuff endurance with increased repetitions',
    timeFrameExplanation:
      'The added volume strengthens your shoulder so you can tolerate pulling and pressing soon.',
    afterTimeFrame: {
      expectedOutcome:
        'You should feel steadier with less fatigue during daily tasks.',
      nextSteps:
        'Proceed to Week 3 to introduce light rows and presses if comfortable.',
    },
    whatNotToDo:
      'Don\'t rush overhead work if it provokes discomfort.',
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
    summary: 'Light pulling movements and controlled vertical pressing',
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
    summary: 'Overhead strength work with dumbbells and full-range control',
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
    summary: 'Acute recovery with mobility and swelling control',
    timeFrameExplanation:
      'Use light range-of-motion drills and calf pumps to reduce inflammation. This prepares you for strength work next week.',
    afterTimeFrame: {
      expectedOutcome:
        'Swelling should be decreasing and walking should feel easier with minimal discomfort.',
      nextSteps:
        'If movement feels comfortable, progress to Week 2 to begin rebuilding strength.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you\'ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
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
    summary: 'Strength building for calf and supporting muscles',
    timeFrameExplanation:
      'You will progress loading to build stability while continuing to manage swelling.',
    afterTimeFrame: {
      expectedOutcome:
        'Calf strength and control should improve with little to no swelling after sessions.',
      nextSteps:
        'Move on to Week 3 to challenge your balance and proprioception.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you\'ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
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
    summary: 'Balance and proprioceptive coordination training',
    timeFrameExplanation:
      'Building balance prepares you for the dynamic loading introduced in Week 4.',
    afterTimeFrame: {
      expectedOutcome:
        'You should feel steady standing on one leg and notice better ankle control.',
      nextSteps:
        'If you can balance comfortably, progress to Week 4 and begin light jogging.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you\'ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
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
    summary: 'Return to running and dynamic activity preparation',
    timeFrameExplanation:
      'You will continue strengthening while adding light running to transition back to sport or daily tasks.',
    afterTimeFrame: {
      expectedOutcome:
        'You should be able to jog for around 10 minutes without pain or instability.',
      nextSteps:
        'Gradually build mileage or return to sport, adding plyometrics as tolerated.',
    },
    whatNotToDo:
      'Avoid lateral movements, deep ankle flexion under load, or unstable surfaces until you\'ve completed Week 3. If your ankle swells or becomes painful after a session, scale back the intensity or volume for a few days.',
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
    summary: 'Isometric pain modulation and tolerance building',
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
    summary: 'Eccentric loading for tendon repair and strength',
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
    summary: 'Forearm control and grip strength development',
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
      'Week 4 integrates functional loading so you\'re ready for everyday tasks and sport.',
    summary: 'Functional integration for daily tasks and sport',
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
  // -----------------------------------------------------------------
  // 6. Tech Neck
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on gentle mobility and scapular awareness to reduce immediate tension.',
    summary: 'Mobility and scapular awareness for tension relief',
    timeFrameExplanation:
      'Start with light movements to open the chest and activate supporting muscles around your neck and shoulders.',
    afterTimeFrame: {
      expectedOutcome:
        'Neck and shoulder tension should start decreasing with better postural awareness.',
      nextSteps:
        'If symptoms improve, progress to Week 2 for targeted strengthening work.',
    },
    whatNotToDo:
      'Avoid shrug-based or trap-dominant exercises. Don\'t force end-range neck stretches into pain.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Mobility & Awareness',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30 },
          { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(2),
      {
        day: 3,
        description: 'Mobility & Awareness',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30 },
          { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(4),
      {
        day: 5,
        description: 'Mobility & Awareness',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30 },
          { exerciseId: 'shoulders-94', sets: 2, repetitions: 10, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'upper traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  {
    programOverview:
      'Week 2 adds low-load strength work for the upper back and rotator cuff to build endurance.',
    summary: 'Upper back and rotator cuff strengthening',
    timeFrameExplanation:
      'Targeted strengthening helps support better posture and reduces strain on the neck.',
    afterTimeFrame: {
      expectedOutcome:
        'Your upper back should feel stronger and neck fatigue should be reduced.',
      nextSteps:
        'Continue to Week 3 for higher volume endurance training.',
    },
    whatNotToDo:
      'Avoid shrug-based or trap-dominant exercises. Don\'t force end-range neck stretches into pain.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Scapular Strength & Cuff Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(2),
      {
        day: 3,
        description: 'Scapular Strength & Cuff Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(4),
      {
        day: 5,
        description: 'Scapular Strength & Cuff Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
        ],
      },
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'upper traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  {
    programOverview:
      'Week 3 reinforces postural endurance through higher volume and static holds.',
    summary: 'Postural endurance with higher volume training',
    timeFrameExplanation:
      'Increased training volume builds the endurance needed to maintain good posture throughout the day.',
    afterTimeFrame: {
      expectedOutcome:
        'You should hold good posture longer with less effort and fatigue.',
      nextSteps:
        'Move to Week 4 to integrate these gains into daily movement patterns.',
    },
    whatNotToDo:
      'Avoid shrug-based or trap-dominant exercises. Don\'t force end-range neck stretches into pain.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Postural Endurance & Volume',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createTechNeckRestDay(2),
      {
        day: 3,
        description: 'Postural Endurance & Volume',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createTechNeckRestDay(4),
      {
        day: 5,
        description: 'Postural Endurance & Volume',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 18, restBetweenSets: 60 },
        ],
      },
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'upper traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  {
    programOverview:
      'Week 4 helps you integrate better alignment into everyday movement and work habits.',
    summary: 'Alignment integration and habit formation',
    timeFrameExplanation:
      'Focus on building lasting habits and maintaining your postural improvements in daily life.',
    afterTimeFrame: {
      expectedOutcome:
        'You should feel significantly less neck tension with improved posture awareness throughout the day.',
      nextSteps:
        'Continue one mobility drill daily and train upper back twice weekly for maintenance.',
    },
    whatNotToDo:
      'Avoid shrug-based or trap-dominant exercises. Don\'t force end-range neck stretches into pain.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Integration & Habit Anchoring',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 12, restBetweenSets: 30 },
        ],
      },
      createTechNeckRestDay(2),
      {
        day: 3,
        description: 'Integration & Habit Anchoring',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 12, restBetweenSets: 30 },
        ],
      },
      createTechNeckRestDay(4),
      {
        day: 5,
        description: 'Integration & Habit Anchoring',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 20, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'warmup-9', sets: 2, repetitions: 12, restBetweenSets: 30 },
        ],
      },
      createTechNeckRestDay(6),
      createTechNeckRestDay(7),
    ],
    targetAreas: ['neck', 'upper traps', 'posture'],
    bodyParts: ['Neck', 'Shoulders', 'Upper Back'],
  },

  // -----------------------------------------------------------------
  // 7. Plantar Fasciitis
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on light calf activation and gentle stretching to reduce tension through the foot arch.',
    summary: 'Light calf activation and arch tension relief',
    timeFrameExplanation:
      'Start with gentle exercises to calm inflammation and begin activating supporting muscles.',
    afterTimeFrame: {
      expectedOutcome:
        'Heel pain should start decreasing and morning stiffness should be more manageable.',
      nextSteps:
        'If symptoms improve, progress to Week 2 for eccentric calf loading.',
    },
    whatNotToDo:
      'Avoid barefoot walking on hard floors and don\'t push through sharp heel pain.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Light Load & Arch Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(2),
      {
        day: 3,
        description: 'Light Load & Arch Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(4),
      {
        day: 5,
        description: 'Light Load & Arch Activation',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-6', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },

  {
    programOverview:
      'Week 2 introduces eccentric calf loading and toe activation to stimulate tissue healing.',
    summary: 'Eccentric loading and tissue healing stimulation',
    timeFrameExplanation:
      'Controlled loading helps rebuild strength while promoting plantar fascia recovery.',
    afterTimeFrame: {
      expectedOutcome:
        'Walking should feel easier and calf strength should start improving.',
      nextSteps:
        'Continue to Week 3 for single-leg balance and midfoot strengthening.',
    },
    whatNotToDo:
      'Avoid barefoot walking on hard floors and don\'t push through sharp heel pain.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Eccentric Calf & Toe Control',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(2),
      {
        day: 3,
        description: 'Eccentric Calf & Toe Control',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(4),
      {
        day: 5,
        description: 'Eccentric Calf & Toe Control',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'calves-6', sets: 2, repetitions: 15, restBetweenSets: 45 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },

  {
    programOverview:
      'Week 3 builds single-leg control and midfoot strength to improve stability.',
    summary: 'Single-leg control and midfoot strengthening',
    timeFrameExplanation:
      'Single-leg work challenges the foot and ankle to prepare for dynamic activities.',
    afterTimeFrame: {
      expectedOutcome:
        'Balance should improve and you should feel more stable when walking on uneven surfaces.',
      nextSteps:
        'Progress to Week 4 to increase functional loading and prepare for impact activities.',
    },
    whatNotToDo:
      'Avoid barefoot walking on hard floors and don\'t push through sharp heel pain.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Balance & Midfoot Strength',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(2),
      {
        day: 3,
        description: 'Balance & Midfoot Strength',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(4),
      {
        day: 5,
        description: 'Balance & Midfoot Strength',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },

  {
    programOverview:
      'Week 4 increases functional loading so you can walk or jog pain-free and return to impact activities.',
    summary: 'Functional loading for pain-free walking and impact activities',
    timeFrameExplanation:
      'Progressive loading prepares your foot for the demands of daily movement and sport.',
    afterTimeFrame: {
      expectedOutcome:
        'You should be able to walk briskly and stand for extended periods without heel pain.',
      nextSteps:
        'Keep training calves twice weekly and progress gradually to running or hiking.',
    },
    whatNotToDo:
      'Avoid barefoot walking on hard floors and don\'t push through sharp heel pain.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Function & Return to Impact',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(2),
      {
        day: 3,
        description: 'Function & Return to Impact',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(4),
      {
        day: 5,
        description: 'Function & Return to Impact',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'calves-12', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'calves-63', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-44', sets: 2, repetitions: 15, restBetweenSets: 45 },
        ],
      },
      createPlantarRestDay(6),
      createPlantarRestDay(7),
    ],
    targetAreas: ['foot', 'heel', 'arch'],
    bodyParts: ['Foot', 'Calves'],
  },
  // -----------------------------------------------------------------
  // 8. Hamstring Strain
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on restoring baseline mobility and pain-free isometric hamstring contraction.',
    summary: 'Baseline mobility and pain-free muscle activation',
    timeFrameExplanation:
      'Start with gentle movements to reduce inflammation and begin activating hamstring muscles safely.',
    afterTimeFrame: {
      expectedOutcome:
        'Hamstring tightness should decrease and walking should feel more comfortable.',
      nextSteps:
        'If pain stays manageable, progress to Week 2 for eccentric loading.',
    },
    whatNotToDo:
      'Avoid overstretching and ballistic movements. Stop if sharp pain occurs.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Isometric Activation & Mobility',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createHamstringRestDay(2),
      {
        day: 3,
        description: 'Isometric Activation & Mobility',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createHamstringRestDay(4),
      {
        day: 5,
        description: 'Isometric Activation & Mobility',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'glutes-1', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },

  {
    programOverview:
      'Week 2 introduces eccentric loading to support tendon and fascial healing.',
    summary: 'Eccentric loading for tissue healing and strength',
    timeFrameExplanation:
      'Controlled eccentric movements help rebuild hamstring strength while promoting tissue repair.',
    afterTimeFrame: {
      expectedOutcome:
        'Hamstring strength should start improving and daily activities should feel easier.',
      nextSteps:
        'Continue to Week 3 for single-leg control and hip hinge strengthening.',
    },
    whatNotToDo:
      'Avoid overstretching and ballistic movements. Stop if sharp pain occurs.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Introduce Eccentric Loading',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'hamstrings-34', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 5, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(2),
      {
        day: 3,
        description: 'Introduce Eccentric Loading',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'hamstrings-34', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 5, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(4),
      {
        day: 5,
        description: 'Introduce Eccentric Loading',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'hamstrings-34', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 5, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },

  {
    programOverview:
      'Week 3 integrates single-leg control and trunk-pelvis coordination for functional movement.',
    summary: 'Single-leg control and functional movement integration',
    timeFrameExplanation:
      'Single-leg exercises challenge stability and prepare you for dynamic activities.',
    afterTimeFrame: {
      expectedOutcome:
        'Single-leg movements should feel more controlled and hamstring loading should be comfortable.',
      nextSteps:
        'Progress to Week 4 to begin light running and dynamic movement patterns.',
    },
    whatNotToDo:
      'Avoid overstretching and ballistic movements. Stop if sharp pain occurs.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Single-Leg Control & Hinge Strength',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 6, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(2),
      {
        day: 3,
        description: 'Single-Leg Control & Hinge Strength',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 6, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(4),
      {
        day: 5,
        description: 'Single-Leg Control & Hinge Strength',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-6', duration: 180, warmup: true },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 6, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },

  {
    programOverview:
      'Week 4 returns you to light running and dynamic movement with confidence.',
    summary: 'Return to running and dynamic movement patterns',
    timeFrameExplanation:
      'Progressive jogging and dynamic exercises prepare you for full return to sport and activity.',
    afterTimeFrame: {
      expectedOutcome:
        'You should jog pain-free and tolerate hamstring loading during hip hinge patterns.',
      nextSteps:
        'Begin progressive running intensity and maintain weekly hamstring strengthening.',
    },
    whatNotToDo:
      'Avoid overstretching and ballistic movements. Stop if sharp pain occurs.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Return to Jog & Light Dynamic Work',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'cardio-1', duration: 600, warmup: true },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 8, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(2),
      {
        day: 3,
        description: 'Return to Jog & Light Dynamic Work',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'cardio-1', duration: 600, warmup: true },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 8, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(4),
      {
        day: 5,
        description: 'Return to Jog & Light Dynamic Work',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'cardio-1', duration: 600, warmup: true },
          { exerciseId: 'hamstrings-48', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'glutes-46', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'hamstrings-20', sets: 2, repetitions: 8, restBetweenSets: 90 },
        ],
      },
      createHamstringRestDay(6),
      createHamstringRestDay(7),
    ],
    targetAreas: ['hamstring'],
    bodyParts: ['Hamstring', 'Glutes'],
  },
  // -----------------------------------------------------------------
  // 9. Upper Back & Core Reset (Posture) 
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on gentle spinal mobility and basic postural awareness to counteract forward positioning.',
    summary: 'Comprehensive postural reset with mobility and strengthening',
    timeFrameExplanation:
      'Start with gentle extension exercises and breathing pattern correction for postural improvement.',
    afterTimeFrame: {
      expectedOutcome:
        'Reduced upper back tension and improved postural awareness during daily activities.',
      nextSteps:
        'Progress to Week 2 for targeted pulling movements and posterior chain strengthening.',
    },
    whatNotToDo:
      'Avoid heavy pressing and prolonged slouching during the early stages.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Posture Awareness & Mobility',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true },
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(2),
      {
        day: 3,
        description: 'Posture Awareness & Mobility',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true },
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(4),
      {
        day: 5,
        description: 'Posture Awareness & Mobility',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-9', sets: 2, repetitions: 10, restBetweenSets: 30, warmup: true },
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-30', sets: 2, repetitions: 12, restBetweenSets: 45 },
          { exerciseId: 'upper-back-60', sets: 2, repetitions: 15, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },

  {
    programOverview:
      'Week 2 introduces controlled pulling and shoulder blade activation.',
    summary: 'Controlled pulling and scapular strengthening',
    timeFrameExplanation:
      'Build scapular control and strengthen the muscles that support good posture.',
    afterTimeFrame: {
      expectedOutcome:
        'Better shoulder blade control and reduced upper back tension.',
      nextSteps:
        'Continue to Week 3 for endurance and time-under-tension training.',
    },
    whatNotToDo:
      'Avoid heavy pressing and prolonged slouching during the early stages.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Scapular Control & Pull Strength',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-3', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(2),
      {
        day: 3,
        description: 'Scapular Control & Pull Strength',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-3', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(4),
      {
        day: 5,
        description: 'Scapular Control & Pull Strength',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'warmup-8', sets: 2, repetitions: 15, restBetweenSets: 30, warmup: true },
          { exerciseId: 'shoulders-94', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'upper-back-3', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },

  {
    programOverview:
      'Week 3 adds time-under-tension and stability work for endurance.',
    summary: 'Endurance building with time-under-tension work',
    timeFrameExplanation:
      'Challenge your postural muscles with longer holds and stability exercises.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved postural endurance and strength for maintaining good alignment.',
      nextSteps:
        'Progress to Week 4 for core-integrated posture training.',
    },
    whatNotToDo:
      'Avoid heavy pressing and prolonged slouching during the early stages.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Endurance & Time Under Tension',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'upper-back-8', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(2),
      {
        day: 3,
        description: 'Endurance & Time Under Tension',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'upper-back-8', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(4),
      {
        day: 5,
        description: 'Endurance & Time Under Tension',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'shoulders-78', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'upper-back-8', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },

  {
    programOverview:
      'Week 4 integrates core and full-body posture control for daily function.',
    summary: 'Integrated core and full-body postural control',
    timeFrameExplanation:
      'Combine all elements for comprehensive postural control and strength.',
    afterTimeFrame: {
      expectedOutcome:
        'Visibly better posture and reduced shoulder fatigue during daily activities.',
      nextSteps:
        'Maintain progress with upper back training twice per week and daily mobility.',
    },
    whatNotToDo:
      'Avoid heavy pressing and prolonged slouching during the early stages.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Core-Integrated Posture Training',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(2),
      {
        day: 3,
        description: 'Core-Integrated Posture Training',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(4),
      {
        day: 5,
        description: 'Core-Integrated Posture Training',
        isRestDay: false,
        duration: 30,
        exercises: [
          { exerciseId: 'shoulders-30', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'upper-back-60', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createPostureRestDay(6),
      createPostureRestDay(7),
    ],
    targetAreas: ['posture', 'upper back', 'core'],
    bodyParts: ['Upper Back', 'Shoulders', 'Core'],
  },
  // -----------------------------------------------------------------
  // 10. Core Stability
  // -----------------------------------------------------------------
  {
    programOverview:
      'Week 1 focuses on reactivating your deep core muscles and practicing control.',
    summary: 'Deep core activation and control foundation',
    timeFrameExplanation:
      'Begin with basic core stabilization exercises to build foundational strength.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved core activation and better control in basic positions.',
      nextSteps:
        'Progress to Week 2 for time under tension and movement coordination.',
    },
    whatNotToDo:
      'Avoid high-rep sit-ups and long planks with poor form.',
    createdAt: new Date('2025-06-02T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Activation & Control',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(2),
      {
        day: 3,
        description: 'Activation & Control',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(4),
      {
        day: 5,
        description: 'Activation & Control',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 8, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 30, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },

  {
    programOverview:
      'Week 2 adds time under tension and limb coordination.',
    summary: 'Core endurance with coordinated movement challenges',
    timeFrameExplanation:
      'Challenge your core stability with longer holds and coordinated movements.',
    afterTimeFrame: {
      expectedOutcome:
        'Improved core endurance and better stability during movement.',
      nextSteps:
        'Continue to Week 3 for balance and anti-rotation challenges.',
    },
    whatNotToDo:
      'Avoid high-rep sit-ups and long planks with poor form.',
    createdAt: new Date('2025-05-26T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Time Under Tension & Movement',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 40, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(2),
      {
        day: 3,
        description: 'Time Under Tension & Movement',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 40, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(4),
      {
        day: 5,
        description: 'Time Under Tension & Movement',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-20', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'abs-6', sets: 3, duration: 40, restBetweenSets: 60 },
          { exerciseId: 'glutes-7', sets: 3, repetitions: 15, restBetweenSets: 60 },
          { exerciseId: 'obliques-4', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },

  {
    programOverview:
      'Week 3 incorporates balance, anti-rotation, and lateral core engagement.',
    summary: 'Advanced stability with multi-directional core control',
    timeFrameExplanation:
      'Challenge your core with stability exercises and multi-directional control.',
    afterTimeFrame: {
      expectedOutcome:
        'Better balance and control in challenging positions.',
      nextSteps:
        'Progress to Week 4 for multi-planar core integration.',
    },
    whatNotToDo:
      'Avoid high-rep sit-ups and long planks with poor form.',
    createdAt: new Date('2025-05-19T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Stability & Balance Challenges',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-121', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(2),
      {
        day: 3,
        description: 'Stability & Balance Challenges',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-121', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(4),
      {
        day: 5,
        description: 'Stability & Balance Challenges',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-121', sets: 3, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'glutes-45', sets: 2, repetitions: 10, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },

  {
    programOverview:
      'Week 4 transitions to longer holds and multi-planar control.',
    summary: 'Advanced multi-planar core mastery',
    timeFrameExplanation:
      'Master advanced core stability for preparation to more demanding training.',
    afterTimeFrame: {
      expectedOutcome:
        'Strong, stable core with better posture and movement control.',
      nextSteps:
        'Progress to resistance training or maintain with 1-2 core sessions weekly.',
    },
    whatNotToDo:
      'Avoid high-rep sit-ups and long planks with poor form.',
    createdAt: new Date('2025-05-12T00:00:00Z'),
    days: [
      {
        day: 1,
        description: 'Multi-Planar Core Integration',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-121', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-120', sets: 2, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(2),
      {
        day: 3,
        description: 'Multi-Planar Core Integration',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-121', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-120', sets: 2, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(4),
      {
        day: 5,
        description: 'Multi-Planar Core Integration',
        isRestDay: false,
        duration: 25,
        exercises: [
          { exerciseId: 'abs-121', sets: 3, repetitions: 12, restBetweenSets: 60 },
          { exerciseId: 'abs-120', sets: 2, repetitions: 10, restBetweenSets: 60 },
          { exerciseId: 'obliques-14', sets: 2, repetitions: 12, restBetweenSets: 60 },
        ],
      },
      createCoreRestDay(6),
      createCoreRestDay(7),
    ],
    targetAreas: ['core', 'pelvis', 'low back'],
    bodyParts: ['Core', 'Lower Back', 'Hips'],
  },
];

// URL slug mapping for direct program access - maps to the starting index of each 4-week sequence
export const programSlugs: Record<string, number> = {
  // Low Back: indices 0-3 (4 weeks)
  lowback: 0,
  'low-back': 0,
  'lower-back': 0,
  
  // Runner's Knee: indices 4-7 (4 weeks)
  runnersknee: 4,
  'runners-knee': 4,
  
  // Shoulder: indices 8-11 (4 weeks)
  shoulder: 8,
  'shoulder-impingement': 8,
  
  // Ankle: indices 12-15 (4 weeks)
  ankle: 12,
  'ankle-sprain': 12,
  
  // Tennis Elbow: indices 16-19 (4 weeks)
  'tennis-elbow': 16,
  elbow: 16,
  
  // Tech Neck: indices 20-23 (4 weeks)
  techneck: 20,
  
  // Plantar Fasciitis: indices 24-27 (4 weeks)
  'plantar-fasciitis': 24,
  plantarfasciitis: 24,
  plantar: 24,
  
  // Hamstring: indices 28-31 (4 weeks)
  'hamstring-strain': 28,
  hamstring: 28,
  
  // Upper Back & Core: indices 32-35 (4 weeks)
  'upper-back-core': 32,
  upperbackcore: 32,
  
  // Core Stability: indices 36-39 (4 weeks)
  'core-stability': 36,
  corestability: 36,
};

// Function to get program by URL slug - combines all 4 weeks into a single 28-day program
export const getProgramBySlug = (slug: string): ExerciseProgram | null => {
  const baseIndex = programSlugs[slug.toLowerCase()];
  if (typeof baseIndex !== 'number') return null;
  
  // Get all 4 weeks for this condition
  const week1 = rehabPrograms[baseIndex];
  const week2 = rehabPrograms[baseIndex + 1];
  const week3 = rehabPrograms[baseIndex + 2];
  const week4 = rehabPrograms[baseIndex + 3];
  
  if (!week1 || !week2 || !week3 || !week4) return null;
  
  // Combine all days from all 4 weeks, renumbering them 1-28
  const allDays = [
    // Week 1: days 1-7
    ...week1.days.map((day, index) => ({ ...day, day: index + 1 })),
    // Week 2: days 8-14
    ...week2.days.map((day, index) => ({ ...day, day: index + 8 })),
    // Week 3: days 15-21
    ...week3.days.map((day, index) => ({ ...day, day: index + 15 })),
    // Week 4: days 22-28
    ...week4.days.map((day, index) => ({ ...day, day: index + 22 }))
  ];
  
  // Return the combined program using week1 as the base
  return {
    ...week1,
    days: allDays,
    // Use the most comprehensive overview from week1
    programOverview: week1.programOverview,
    timeFrameExplanation: week1.timeFrameExplanation,
    afterTimeFrame: week1.afterTimeFrame,
    whatNotToDo: week1.whatNotToDo
  };
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
  // Get the 4 separate week programs instead of the combined 28-day program
  const baseIndex = programSlugs[slug.toLowerCase()];
  if (typeof baseIndex !== 'number') return null;
  
  // Get all 4 weeks for this condition as separate programs
  const week1 = rehabPrograms[baseIndex];
  const week2 = rehabPrograms[baseIndex + 1];
  const week3 = rehabPrograms[baseIndex + 2];
  const week4 = rehabPrograms[baseIndex + 3];
  
  if (!week1 || !week2 || !week3 || !week4) return null;

  const today = new Date();
  const normalizedSlug = slug.toLowerCase();

  // Update each week's createdAt to today so dates display correctly
  const updatedWeekPrograms = [
    { ...week1, createdAt: today },
    { ...week2, createdAt: today },
    { ...week3, createdAt: today },
    { ...week4, createdAt: today }
  ];

  // Create specific diagnosis and questionnaire for each program type
  if (normalizedSlug.includes('lowback') || normalizedSlug.includes('low-back') || normalizedSlug.includes('lower-back')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Lower Back Pain',
        painfulAreas: ['Lower Back'],
        informationalInsights: 'Lower back pain is one of the most common musculoskeletal complaints. This program focuses on strengthening core muscles, improving spinal mobility, and addressing postural dysfunction to reduce pain and prevent recurrence.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'posture',
        aggravatingFactors: 'Prolonged sitting, bending forward, lifting',
        relievingFactors: 'Rest, gentle movement, heat therapy',
        priorInjury: 'unknown',
        painPattern: 'activity-dependent',
        painLocation: 'Lower lumbar region',
        painCharacter: 'dull',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy lifting', 'Prolonged sitting', 'High-impact activities'],
        recoveryGoals: ['Reduce pain', 'Improve mobility', 'Strengthen core', 'Prevent future episodes'],
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
      title: 'Lower Back Pain Recovery',
      docId: `recovery-lowback-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('runners') || normalizedSlug.includes('knee')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Patellofemoral Pain Syndrome (Runner\'s Knee)',
        painfulAreas: ['Knee'],
        informationalInsights: 'Runner\'s knee is characterized by pain around or behind the kneecap. This program focuses on strengthening the quadriceps, glutes, and hip muscles while improving flexibility and movement patterns.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: 'Running, stairs, prolonged sitting',
        relievingFactors: 'Rest, ice, gentle stretching',
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Around or behind kneecap',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running', 'Jumping', 'Deep squats'],
        recoveryGoals: ['Reduce knee pain', 'Strengthen supporting muscles', 'Improve movement patterns', 'Return to running'],
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
      title: 'Patellofemoral Pain Syndrome Recovery',
      docId: `recovery-runnersknee-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('shoulder')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Shoulder Impingement Syndrome',
        painfulAreas: ['Shoulder'],
        informationalInsights: 'Shoulder impingement occurs when soft tissues are compressed during shoulder movements. This program focuses on strengthening the rotator cuff, improving posture, and restoring normal shoulder mechanics.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: 'Overhead activities, reaching behind back, sleeping on affected side',
        relievingFactors: 'Rest, avoiding overhead movements, ice',
        priorInjury: 'unknown',
        painPattern: 'activity-dependent',
        painLocation: 'Top and front of shoulder',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Overhead lifting', 'Throwing motions', 'Sleeping on affected side'],
        recoveryGoals: ['Reduce shoulder pain', 'Improve range of motion', 'Strengthen rotator cuff', 'Restore normal function'],
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
      title: 'Shoulder Impingement Recovery',
      docId: `recovery-shoulder-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('ankle')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Ankle Sprain Recovery',
        painfulAreas: ['Ankle'],
        informationalInsights: 'Ankle sprains are common injuries that require proper rehabilitation to prevent re-injury. This program focuses on restoring range of motion, strength, balance, and proprioception.',
        onset: 'acute',
        painScale: 4,
        mechanismOfInjury: 'trauma',
        aggravatingFactors: 'Walking on uneven surfaces, weight bearing, lateral movements',
        relievingFactors: 'Rest, elevation, ice, compression',
        priorInjury: 'unknown',
        painPattern: 'activity-dependent',
        painLocation: 'Lateral ankle',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running', 'Jumping', 'Sports with cutting movements'],
        recoveryGoals: ['Reduce swelling and pain', 'Restore range of motion', 'Improve balance', 'Return to activities'],
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
      title: 'Ankle Sprain Recovery',
      docId: `recovery-ankle-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('tennis') || normalizedSlug.includes('elbow')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Lateral Epicondylitis (Tennis Elbow)',
        painfulAreas: ['Elbow', 'Forearm'],
        informationalInsights: 'Tennis elbow is caused by overuse of the extensor muscles of the forearm. This program focuses on eccentric strengthening, progressive loading, and addressing contributing factors.',
        onset: 'gradual',
        painScale: 5,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: 'Gripping, lifting, computer use, racquet sports',
        relievingFactors: 'Rest, ice, avoiding aggravating activities',
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Lateral elbow',
        painCharacter: 'aching',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy gripping', 'Racquet sports', 'Repetitive wrist extension'],
        recoveryGoals: ['Reduce elbow pain', 'Improve grip strength', 'Return to activities', 'Prevent recurrence'],
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
      title: 'Lateral Epicondylitis Recovery',
      docId: `recovery-tennis-elbow-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('techneck') || normalizedSlug.includes('tech-neck')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Tech Neck (Cervical Strain)',
        painfulAreas: ['Neck', 'Upper Back'],
        informationalInsights: 'Tech neck results from prolonged forward head posture during device use. This program addresses postural dysfunction, strengthens deep neck flexors, and improves upper back mobility.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'posture',
        aggravatingFactors: 'Computer work, phone use, poor posture, stress',
        relievingFactors: 'Posture breaks, gentle stretching, heat',
        priorInjury: 'unknown',
        painPattern: 'constant',
        painLocation: 'Back of neck and upper shoulders',
        painCharacter: 'tight',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Prolonged computer use without breaks', 'Looking down at phone for extended periods'],
        recoveryGoals: ['Reduce neck pain', 'Improve posture', 'Increase mobility', 'Prevent future episodes'],
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
      title: 'Tech Neck (Cervical Strain) Recovery',
      docId: `recovery-techneck-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('plantar')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Plantar Fasciitis',
        painfulAreas: ['Foot'],
        informationalInsights: 'Plantar fasciitis involves inflammation of the plantar fascia, causing heel pain. This program focuses on stretching, strengthening, and addressing biomechanical factors.',
        onset: 'gradual',
        painScale: 6,
        mechanismOfInjury: 'overuse',
        aggravatingFactors: 'First steps in morning, prolonged standing, walking barefoot',
        relievingFactors: 'Rest, ice, supportive footwear, stretching',
        priorInjury: 'no',
        painPattern: 'activity-dependent',
        painLocation: 'Bottom of heel',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Running on hard surfaces', 'Walking barefoot', 'High-impact activities'],
        recoveryGoals: ['Reduce heel pain', 'Improve foot flexibility', 'Strengthen supporting muscles', 'Return to walking/running'],
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
      title: 'Plantar Fasciitis Recovery',
      docId: `recovery-plantar-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('hamstring')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Hamstring Strain',
        painfulAreas: ['Hamstring'],
        informationalInsights: 'Hamstring strains are common in athletes and active individuals. This program focuses on progressive strengthening, flexibility, and functional movement patterns to prevent re-injury.',
        onset: 'acute',
        painScale: 5,
        mechanismOfInjury: 'trauma',
        aggravatingFactors: 'Running, stretching, bending forward',
        relievingFactors: 'Rest, ice, gentle movement',
        priorInjury: 'unknown',
        painPattern: 'activity-dependent',
        painLocation: 'Back of thigh',
        painCharacter: 'sharp',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Sprinting', 'Aggressive stretching', 'High-intensity leg exercises'],
        recoveryGoals: ['Reduce pain and inflammation', 'Restore flexibility', 'Progressive strengthening', 'Return to sport'],
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
      title: 'Hamstring Strain Recovery',
      docId: `recovery-hamstring-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('upper-back') || normalizedSlug.includes('upperback')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Upper Back & Core Dysfunction',
        painfulAreas: ['Upper Back', 'Core'],
        informationalInsights: 'Upper back pain often results from poor posture and weak core muscles. This program strengthens the thoracic spine, improves posture, and builds core stability.',
        onset: 'gradual',
        painScale: 4,
        mechanismOfInjury: 'posture',
        aggravatingFactors: 'Desk work, poor posture, stress, heavy lifting',
        relievingFactors: 'Movement, stretching, posture correction',
        priorInjury: 'unknown',
        painPattern: 'constant',
        painLocation: 'Between shoulder blades',
        painCharacter: 'tight',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Prolonged slouching', 'Heavy overhead lifting', 'Poor lifting mechanics'],
        recoveryGoals: ['Reduce upper back tension', 'Improve posture', 'Strengthen core', 'Increase mobility'],
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
      title: 'Upper Back & Core Dysfunction Recovery',
      docId: `recovery-upperback-${Date.now()}`
    };
  }

  if (normalizedSlug.includes('core')) {
    return {
      programs: updatedWeekPrograms,
      diagnosis: {
        diagnosis: 'Core Instability',
        painfulAreas: ['Core', 'Lower Back'],
        informationalInsights: 'Core instability can lead to lower back pain and poor movement patterns. This program focuses on deep core strengthening, spinal stabilization, and functional movement.',
        onset: 'gradual',
        painScale: 3,
        mechanismOfInjury: 'posture',
        aggravatingFactors: 'Poor posture, weak core muscles, sedentary lifestyle',
        relievingFactors: 'Core strengthening, proper posture, regular movement',
        priorInjury: 'unknown',
        painPattern: 'activity-dependent',
        painLocation: 'Lower back and abdominal region',
        painCharacter: 'dull',
        assessmentComplete: true,
        redFlagsPresent: false,
        avoidActivities: ['Heavy lifting with poor form', 'Prolonged sitting', 'High-impact activities without proper preparation'],
        recoveryGoals: ['Improve core stability', 'Reduce back pain', 'Better movement patterns', 'Injury prevention'],
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
      title: 'Core Instability Recovery',
      docId: `recovery-core-${Date.now()}`
    };
  }

  // Fallback for any unmatched slugs
  return null;
};
