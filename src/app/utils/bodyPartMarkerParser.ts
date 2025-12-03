/**
 * Parser for inline body part markers {{Body Part Name}}
 * Extracts body part names from message text
 * Uses double curly braces to differentiate from exercise markers [[]]
 */

import { bodyPartGroups, BodyPartGroup } from '@/app/config/bodyPartGroups';
import { AnatomyPart } from '@/app/types/human';

export interface BodyPartMarker {
  name: string;
  startIndex: number;
  endIndex: number;
  fullMatch: string;
}

/**
 * Extracts all {{Body Part Name}} markers from text
 * Returns array of markers with positions
 */
export function extractBodyPartMarkers(text: string): BodyPartMarker[] {
  const markers: BodyPartMarker[] = [];
  const regex = /\{\{([^}]+)\}\}/g;
  let match;

  while ((match = regex.exec(text)) !== null) {
    markers.push({
      name: match[1].trim(),
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      fullMatch: match[0],
    });
  }

  return markers;
}

/**
 * Finds a group by name
 * Returns the BodyPartGroup if found
 */
export function findGroupByName(name: string): BodyPartGroup | undefined {
  const normalizedSearch = name.toLowerCase().trim();
  
  for (const group of Object.values(bodyPartGroups)) {
    const normalizedGroupName = group.name.toLowerCase().trim();
    if (normalizedGroupName === normalizedSearch) {
      return group;
    }
  }
  
  return undefined;
}

/**
 * Finds a body part by name from bodyPartGroups config
 * Returns the full AnatomyPart object and its parent group for selection on 3D model
 * Searches ALL body parts with fuzzy matching
 */
export function findBodyPartByName(name: string): { part: AnatomyPart; group: BodyPartGroup } | undefined {
  const normalizedSearch = name.toLowerCase().trim();
  
  // Search all body part groups to find the matching part
  for (const group of Object.values(bodyPartGroups)) {
    for (const part of group.parts) {
      const normalizedPartName = part.name.toLowerCase().trim();
      if (normalizedPartName === normalizedSearch ||
          normalizedPartName.includes(normalizedSearch) ||
          normalizedSearch.includes(normalizedPartName)) {
        return { part, group };
      }
    }
  }
  
  return undefined;
}

