// AUTO-GENERATED helper logic shared across web and Flutter.
// Run: node scripts/convert_body_parts.js

import { bodyPartGroups } from './body_part_groups';

export type SharedGender = 'male' | 'female';

export function getNeutralId(id: string): string {
  return id.replace(/human_19_(male|female)_/, '');
}

export function getGenderedId(id: string, gender: SharedGender): string {
  const neutralId = getNeutralId(id);
  return `human_19_${gender}_${neutralId}`;
}

export function idsMatch(id1: string, id2: string): boolean {
  return getNeutralId(id1) === getNeutralId(id2);
}

export function findGroupKeyById(id: string): string | null {
  const neutralId = getNeutralId(id);
  for (const [groupKey, group] of Object.entries(bodyPartGroups)) {
    const allGroupIds = [...group.parts.map((part) => part.objectId), ...group.selectIds];
    if (allGroupIds.some((gid) => getNeutralId(gid) === neutralId)) {
      return groupKey;
    }
  }
  return null;
}

export function createSelectionMap(
  ids: string[],
  gender: SharedGender,
  select: boolean = true
): Record<string, boolean> {
  const out: Record<string, boolean> = {};
  for (const id of ids) {
    out[getGenderedId(id, gender)] = select;
  }
  return out;
}
