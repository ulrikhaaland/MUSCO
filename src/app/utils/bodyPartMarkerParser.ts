/**
 * Parser for inline body part markers {{Body Part Name}}
 * Extracts body part names from message text
 * Uses double curly braces to differentiate from exercise markers [[]]
 */

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
 * Gets unique body part names from text (deduplicated)
 */
export function getUniqueBodyPartNames(text: string): string[] {
  const markers = extractBodyPartMarkers(text);
  const uniqueNames = new Set(markers.map(m => m.name));
  return Array.from(uniqueNames);
}

/**
 * Checks if text contains any body part markers
 */
export function hasBodyPartMarkers(text: string): boolean {
  return /\{\{([^}]+)\}\}/.test(text);
}

