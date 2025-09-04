import { SingleDayProgramRequest, SingleDayProgramResult, Gym } from './types';
import { Exercise } from '@/app/types/program';
import { mapDurationToTargetMinutes, countBandForMinutes } from './validator';

function seededRandom(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return () => {
    h += 0x6D2B79F5;
    let t = Math.imul(h ^ (h >>> 15), 1 | h);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(arr: T[], n: number, rng: () => number): T[] {
  const a = [...arr];
  const out: T[] = [];
  while (a.length && out.length < n) {
    const idx = Math.floor(rng() * a.length);
    out.push(a.splice(idx, 1)[0]);
  }
  return out;
}

export function buildFallbackPlan(
  req: SingleDayProgramRequest,
  gym: Gym,
  availableExercises: Exercise[]
): SingleDayProgramResult {
  const target = mapDurationToTargetMinutes(req.duration);
  const band = countBandForMinutes(target);
  const rng = seededRandom(`${gym.slug}|${req.modality}|${req.experience}|${req.duration}`);

  const id = (ex: Exercise) => ex.exerciseId || ex.id || '';
  const warmups = availableExercises.filter((e) => String(id(e)).startsWith('warmup-'));
  const cardio = availableExercises.filter((e) => String(id(e)).startsWith('cardio-'));
  const strength = availableExercises.filter(
    (e) => !String(id(e)).startsWith('warmup-') && !String(id(e)).startsWith('cardio-')
  );

  const exOut: Array<{ exerciseId: string; warmup?: true; duration?: number }> = [];

  if (req.modality !== 'Cardio') {
    const w = pick(warmups, 1, rng)[0];
    if (w) exOut.push({ exerciseId: id(w), warmup: true });
  }

  if (req.modality === 'Cardio' || req.modality === 'Both') {
    const c = pick(cardio, 1, rng)[0];
    if (c) exOut.push({ exerciseId: id(c), duration: target - 5 });
  }

  if (req.modality !== 'Cardio') {
    const main = pick(strength, Math.max(band.min - exOut.length, 3), rng);
    for (const m of main) exOut.push({ exerciseId: id(m) });
  }

  while (exOut.length < band.min) {
    const extra = pick(strength, 1, rng)[0] || pick(cardio, 1, rng)[0];
    if (!extra) break;
    const isCardio = String(id(extra)).startsWith('cardio-');
    exOut.push({ exerciseId: id(extra), ...(isCardio ? { duration: 5 } : {}) });
  }

  const localeNb = (req.locale || 'en') === 'nb';
  const title = localeNb ? `Dagens økt – ${gym.name}` : `Today’s session – ${gym.name}`;
  const sessionOverview = localeNb
    ? 'Strukturerte øvelser tilpasset utstyret i ditt treningssenter.'
    : 'Structured session tailored to your gym equipment.';
  const summary = localeNb ? 'Kort og effektiv økt.' : 'Short and effective session.';
  const whatNotToDo = localeNb
    ? 'Hold god teknikk; stopp ved smerte over 2/10.'
    : 'Maintain good form; stop if pain > 2/10.';

  return {
    gym: { name: gym.name, slug: gym.slug, brand: gym.brand },
    title,
    sessionOverview,
    summary,
    whatNotToDo,
    day: {
      isRestDay: false as const,
      description: localeNb
        ? 'Fokus på trygg progresjon med enkel oppvarming og hoveddel.'
        : 'Focus on safe progression with simple warm-up and main work.',
      exercises: exOut,
      duration: target,
    },
  };
}





