import { z } from 'zod';
import { SingleDayProgramResultSchema } from './schemas';

export type RepairContext = {
  modality: 'Cardio' | 'Strength' | 'Both';
  targetMinutes: number;
  exerciseCountBand: { min: number; max?: number };
  availableExerciseIds: Set<string>;
};

export async function validateAndRepair(
  llmJson: string,
  context: RepairContext,
  repairFn?: (errors: string, prevJson: string) => Promise<string>
) {
  // First parse attempt
  let parsed: unknown;
  try {
    parsed = JSON.parse(llmJson);
  } catch (e: any) {
    if (!repairFn) throw new Error('invalid_json');
    const repaired = await repairFn(`JSON parse error: ${e?.message || String(e)}`, llmJson);
    parsed = safeParseJson(repaired);
  }

  // Try schema
  const check = SingleDayProgramResultSchema.safeParse(parsed);
  if (!check.success) {
    if (!repairFn) throw new Error('schema_invalid');
    const issues = flattenIssues(check.error);
    const repaired = await repairFn(issues, JSON.stringify(parsed));
    const repairedObj = safeParseJson(repaired);
    const final = SingleDayProgramResultSchema.parse(repairedObj);
    enforceBusinessRules(final, context);
    return final;
  }

  enforceBusinessRules(check.data, context);
  return check.data;
}

function safeParseJson(s: string) {
  try { return JSON.parse(s); } catch { throw new Error('repair_invalid_json'); }
}

function flattenIssues(err: z.ZodError): string {
  return err.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
}

export function enforceBusinessRules(result: any, ctx: RepairContext) {
  const t = ctx.targetMinutes;
  const low = Math.floor(t * 0.9);
  const high = Math.ceil(t * 1.1);
  if (result.day.duration < low || result.day.duration > high) {
    throw new Error(`duration_out_of_band target=${t} actual=${result.day.duration}`);
  }

  const count = (result.day.exercises || []).length;
  const { min, max } = ctx.exerciseCountBand;
  if (count < min || (typeof max === 'number' && count > max)) {
    throw new Error(`exercise_count_out_of_band min=${min} max=${max ?? '∞'} count=${count}`);
  }

  // Warmup rule
  const hasWarmups = result.day.exercises.filter((e: any) => String(e.exerciseId).startsWith('warmup-'));
  if (ctx.modality === 'Cardio') {
    if (hasWarmups.length > 0) throw new Error('no_warmup_for_cardio');
  } else {
    if (hasWarmups.length !== 1 || result.day.exercises[0].exerciseId !== hasWarmups[0]?.exerciseId) {
      throw new Error('warmup_first_and_single_required');
    }
  }

  // Cardio duration rule
  for (const ex of result.day.exercises) {
    if (String(ex.exerciseId).startsWith('cardio-') && (typeof ex.duration !== 'number' || ex.duration <= 0)) {
      throw new Error('cardio_items_require_duration');
    }
  }

  // Equipment/availability rule: ensure all exerciseIds are in available
  for (const ex of result.day.exercises) {
    if (!ctx.availableExerciseIds.has(String(ex.exerciseId))) {
      throw new Error(`unknown_exerciseId ${ex.exerciseId}`);
    }
  }
}

export function mapDurationToTargetMinutes(d: string): number {
  switch (d) {
    case '15-30 minutes': return 25;
    case '30-45 minutes': return 40;
    case '45-60 minutes': return 55;
    case '60-90 minutes': return 75;
    case 'More than 90 minutes': return 90;
    default: return 40;
  }
}

export function countBandForMinutes(m: number): { min: number; max?: number } {
  if (m <= 25) return { min: 4, max: 6 };
  if (m <= 40) return { min: 6, max: 8 };
  if (m <= 55) return { min: 8, max: 10 };
  if (m <= 75) return { min: 10, max: 12 };
  return { min: 12 };
}





