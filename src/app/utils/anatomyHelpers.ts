import { AnatomyPart } from '../types/anatomy';
import { BodyPartGroup, bodyPartGroups } from '../config/bodyPartGroups';

// Helper function to convert an ID to its gender-neutral form
export function getNeutralId(id: string): string {
  return id.replace(/human_19_(male|female)_/, '');
}

// Helper function to add gender prefix to an ID
export function getGenderedId(id: string, gender: 'male' | 'female'): string {
  // If ID already has a gender prefix, remove it first
  const neutralId = getNeutralId(id);
  return `human_19_${gender}_${neutralId}`;
}

// Helper function to check if two IDs match, ignoring gender
export function idsMatch(id1: string, id2: string): boolean {
  return getNeutralId(id1) === getNeutralId(id2);
}

// Helper function to check if a part belongs to a group
export function getPartGroup(id: string): BodyPartGroup | null {
  const neutralId = getNeutralId(id);

  // First check if the part's ID matches any group's ids (ignoring gender)
  for (const [groupKey, group] of Object.entries(bodyPartGroups)) {
    // Check both regular ids and selectIds
    const allGroupIds = [...(group.parts.map((part) => part.objectId) || []), ...(group.selectIds || [])];
    if (allGroupIds.some(id => getNeutralId(id) === neutralId)) {
      return group;
    }
  }

  return null;
}

// Helper function to get the selection IDs for a group
export function getGroupSelectionIds(group: BodyPartGroup): string[] {
  // If selectIds are specified, use those
  if (group.selectIds && group.selectIds.length > 0) {
    return group.selectIds;
  }
  // Otherwise fall back to regular ids
  return group.parts.map((part) => part.objectId);
}

// Helper function to get all parts in a group
export function getGroupParts(group: BodyPartGroup, objects: AnatomyPart[]): string[] {
  // Always use selectIds if available
  if (group.selectIds && group.selectIds.length > 0) {
    return objects
      .filter(obj => 
        group.selectIds!.some(id => 
          getNeutralId(id) === getNeutralId(obj.objectId)
        )
      )
      .map(obj => obj.objectId);
  }

  // Fall back to regular ids if no selectIds
  return objects
    .filter(obj => 
      group.parts.some(part => 
        getNeutralId(part.objectId) === getNeutralId(obj.objectId)
      )
    )
    .map(obj => obj.objectId);
}

// Helper function to create a selection map for the BioDigital API
export function createSelectionMap(ids: string[], gender: 'male' | 'female', select: boolean = true): { [key: string]: boolean } {
  return ids.reduce((map: { [key: string]: boolean }, id) => {
    map[getGenderedId(id, gender)] = select;
    return map;
  }, {});
} 