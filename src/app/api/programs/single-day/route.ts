import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/firebase/admin';
import { loadServerExercises } from '@/app/services/server-exercises';
import { STRENGTH_EQUIPMENT, CARDIO_EQUIPMENT, Exercise } from '@/app/types/program';
import { normalizeEquipmentName } from '@/app/features/gym/equipmentAliases';
import { SingleDayProgramRequest, SingleDayProgramResult, Gym } from '@/app/features/gym/types';
import { getSingleDaySystemPrompt, callSingleDayLLM } from '@/app/features/gym/llm';
import { validateAndRepair, mapDurationToTargetMinutes, countBandForMinutes } from '@/app/features/gym/validator';
import { buildFallbackPlan } from '@/app/features/gym/fallback';


const rlMap: Map<string, { count: number; start: number }> = new Map();
function rateLimit(key: string, limit = 20, windowMs = 60_000) {
  const now = Date.now();
  const e = rlMap.get(key);
  if (!e || now - e.start > windowMs) {
    rlMap.set(key, { count: 1, start: now });
    return true;
  }
  e.count += 1;
  return e.count <= limit;
}

export async function POST(req: NextRequest) {
  try {

    const body = (await req.json()) as SingleDayProgramRequest;
    const ip = req.headers.get('x-forwarded-for') || 'ip';
    const key = `${ip}|${body?.gymSlug || ''}`;
    if (!rateLimit(key, 30, 60_000)) {
      return NextResponse.json({ error: 'rate_limited' }, { status: 429 });
    }
    if (!body?.gymSlug || !body?.modality || !body?.experience || !body?.duration) {
      return NextResponse.json({ error: 'bad_request' }, { status: 400 });
    }

    const gymSnap = await adminDb.collection('gyms').where('slug', '==', body.gymSlug).limit(1).get();
    if (gymSnap.empty) return NextResponse.json({ error: 'not_found' }, { status: 404 });
    const gym = { id: gymSnap.docs[0].id, ...(gymSnap.docs[0].data() as Gym) } as Gym;

    const normalizedEquipment = (gym.equipment || []).map((e) => normalizeEquipmentName(String(e)));

    const includeBodyweightWarmups = normalizedEquipment.includes('Bodyweight');
    const allEquipForFilter = normalizedEquipment.filter(Boolean);

    const exercises: Exercise[] = await loadServerExercises({
      bodyParts: ['Shoulders','Upper Arms','Forearms','Chest','Abdomen','Upper Back','Lower Back','Glutes','Upper Legs','Lower Legs','Warmup','Cardio'],
      equipment: allEquipForFilter,
      includeBodyweightWarmups,
    });

    // Build available exercises mapping for LLM
    const availableForLlm = exercises
      .filter((e) => e.exerciseId)
      .map((e) => ({
        exerciseId: e.exerciseId!,
        difficulty: e.difficulty ?? null,
        popularity: e.popularity ?? null,
        viewCount: e.viewCount ?? null,
        contraindications: e.contraindications ?? [],
        targetBodyParts: e.targetBodyParts ?? [],
        equipment: e.equipment ?? [],
        type: e.exerciseType ?? [],
      }));

    const systemPrompt = getSingleDaySystemPrompt();
    const llmInput = {
      diagnosisData: {},
      userInfo: {
        exerciseModalities: body.modality.toLowerCase(),
        workoutDuration: body.duration,
        experience: body.experience,
      },
      gym: { name: gym.name, slug: gym.slug },
      locale: body.locale ?? 'en',
      availableExercises: availableForLlm,
    };

    const raw = await callSingleDayLLM({ systemPrompt, input: llmInput });

    const target = mapDurationToTargetMinutes(body.duration);
    const band = countBandForMinutes(target);
    const availableIds = new Set(availableForLlm.map((e) => e.exerciseId));

    const result = await validateAndRepair(
      raw,
      {
        modality: body.modality,
        targetMinutes: target,
        exerciseCountBand: band,
        availableExerciseIds: availableIds,
      },
      async (errors, prev) => {
        const repairPrompt = `${systemPrompt}\n\nVALIDATION_ERRORS= ${errors}\n\nPREVIOUS_JSON= ${prev}\nReturn corrected JSON ONLY.`;
        return await callSingleDayLLM({ systemPrompt: repairPrompt, input: llmInput });
      }
    ).catch(() => null);

    const final: SingleDayProgramResult = result || buildFallbackPlan(body, gym, exercises);

    return NextResponse.json(final);
  } catch (e) {
    console.error('single-day route error', e);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}


