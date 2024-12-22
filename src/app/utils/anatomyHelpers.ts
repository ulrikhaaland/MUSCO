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

  console.log('Trying to match part:', {
    objectId: part.objectId,
    neutralId,
    name,
    description
  });

  // First check if the part's ID exactly matches any group's ids (ignoring gender)
  for (const [groupKey, group] of Object.entries(bodyPartGroups)) {
    if (group.ids.some(id => getNeutralId(id) === neutralId)) {
      console.log(`Found exact ID match in group: ${groupKey}`);
      return group;
    }
  }

  // If no exact ID match, check if the part's name contains any group's keywords
  // but make sure to match the most specific group first
  let bestMatch: { group: BodyPartGroup; matchCount: number; groupKey: string } | null = null;

  for (const [groupKey, group] of Object.entries(bodyPartGroups)) {
    const matchCount = group.keywords.reduce((count, keyword) => {
      const keywordLower = keyword.toLowerCase();
      if (name.includes(keywordLower) || description.includes(keywordLower)) {
        console.log(`Keyword match in group ${groupKey}: ${keywordLower}`);
        count++;
      }
      return count;
    }, 0);

    // If this group has more keyword matches than our current best match,
    // or if it's the first match we've found, use it
    if (matchCount > 0 && (!bestMatch || matchCount > bestMatch.matchCount)) {
      console.log(`New best match: ${groupKey} with ${matchCount} matches`);
      bestMatch = { group, matchCount, groupKey };
    }
  }

  if (bestMatch) {
    console.log(`Final match: ${bestMatch.groupKey}`);
  } else {
    console.log('No match found');
  }

  return bestMatch ? bestMatch.group : null;
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