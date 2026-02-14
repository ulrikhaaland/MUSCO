import { BodyPartGroup, bodyPartGroups } from '../config/bodyPartGroups';
import { AnatomyPart } from '../types/human';
import {
  getNeutralId as sharedGetNeutralId,
  getGenderedId as sharedGetGenderedId,
  idsMatch as sharedIdsMatch,
  findGroupKeyById,
  createSelectionMap as sharedCreateSelectionMap,
} from '@shared/anatomy/anatomy_helpers';

// Helper function to convert an ID to its gender-neutral form
export function getNeutralId(id: string): string {
  return sharedGetNeutralId(id);
}

// Helper function to add gender prefix to an ID
export function getGenderedId(id: string, gender: 'male' | 'female'): string {
  return sharedGetGenderedId(id, gender);
}

// Helper function to check if two IDs match, ignoring gender
export function idsMatch(id1: string, id2: string): boolean {
  return sharedIdsMatch(id1, id2);
}

// Helper function to check if a part belongs to a group
export function getPartGroup(id: string): BodyPartGroup | null {
  const groupKey = findGroupKeyById(id);
  return groupKey ? bodyPartGroups[groupKey] : null;
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
  return sharedCreateSelectionMap(ids, gender, select);
}
