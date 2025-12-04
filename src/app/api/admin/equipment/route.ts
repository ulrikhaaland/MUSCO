import { NextRequest, NextResponse } from 'next/server';
import { loadServerExercises } from '@/app/services/server-exercises';
import { normalizeEquipmentName } from '@/app/features/gym/equipmentAliases';

type EquipmentEntry = { name: string; count: number };
let cached: EquipmentEntry[] | null = null;

async function computeEquipment(): Promise<EquipmentEntry[]> {
  if (cached) return cached;
  const bodyParts = ['Shoulders','Upper Arms','Forearms','Chest','Abdomen','Upper Back','Lower Back','Glutes','Upper Legs','Lower Legs','Warmup','Cardio'];
  const exercises = await loadServerExercises({ bodyParts, includeBodyweightWarmups: true });
  const count: Map<string, number> = new Map();
  for (const ex of exercises) {
    const list = ex.equipment || [];
    for (const item of list) {
      const norm = normalizeEquipmentName(String(item));
      if (!norm) continue;
      count.set(norm, (count.get(norm) || 0) + 1);
    }
  }
  // Exclude items we don't want
  const EXCLUDE = new Set<string>(['Bodyweight', 'Other']);
  const pairEntries: [string, number][] = Array.from(count.entries())
    .filter(([name]) => !EXCLUDE.has(name));
  // Sort by frequency desc, then alpha
  pairEntries.sort((a, b) => (b[1] - a[1]) || a[0].localeCompare(b[0]));
  cached = pairEntries.map(([name, cnt]) => ({ name, count: cnt }));
  return cached;
}

export async function GET(_req: NextRequest) {
  const items = await computeEquipment();
  return NextResponse.json({ equipment: items });
}


