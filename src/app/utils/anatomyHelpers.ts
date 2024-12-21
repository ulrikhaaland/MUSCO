import { AnatomyPart } from '../types/anatomy';
import { BodyPartGroup } from '../config/bodyPartGroups';

// Helper function to convert an ID to its gender-neutral form
export function getNeutralId(id: string): string {
  return id.replace(/human_19_(male|female)_/, '');
}

// Helper function to check if two IDs match, ignoring gender
export function idsMatch(id1: string, id2: string): boolean {
  return getNeutralId(id1) === getNeutralId(id2);
}

// Helper function to check if a part belongs to a group
export function getPartGroup(part: AnatomyPart, bodyPartGroups: { [key: string]: BodyPartGroup }): BodyPartGroup | null {
  const name = part.name?.toLowerCase() || '';
  const description = part.description?.toLowerCase() || '';
  const neutralId = getNeutralId(part.objectId);

  // First check if the part's ID matches any group's ids (ignoring gender)
  for (const [_, group] of Object.entries(bodyPartGroups)) {
    if (group.ids.some(id => getNeutralId(id) === neutralId)) {
      return group;
    }
  }

  // Then check keywords
  for (const [_, group] of Object.entries(bodyPartGroups)) {
    if (group.keywords.some(keyword => 
      name.includes(keyword.toLowerCase()) || 
      description.includes(keyword.toLowerCase())
    )) {
      return group;
    }
  }

  return null;
}

// Helper function to get all parts in a group
export function getGroupParts(group: BodyPartGroup, objects: AnatomyPart[]): string[] {
  // If we have explicit IDs for this group, find matching parts (accounting for gender)
  if (group.ids.length > 0) {
    return objects
      .filter(obj => 
        group.ids.some(id => 
          getNeutralId(id) === getNeutralId(obj.objectId)
        )
      )
      .map(obj => obj.objectId);
  }

  // Otherwise fall back to keyword matching
  return objects
    .filter(obj => {
      const name = obj.name?.toLowerCase() || '';
      const description = obj.description?.toLowerCase() || '';
      return group.keywords.some(keyword => 
        name.includes(keyword.toLowerCase()) || 
        description.includes(keyword.toLowerCase())
      );
    })
    .map(obj => obj.objectId);
}

// Helper function to create a selection map for the BioDigital API
export function createSelectionMap(ids: string[]): { [key: string]: boolean } {
  return ids.reduce((map: { [key: string]: boolean }, id) => {
    map[id] = true;
    return map;
  }, {});
} 