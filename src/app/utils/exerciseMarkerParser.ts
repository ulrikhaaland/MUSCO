/**
 * Parser for inline exercise markers [[Exercise Name]]
 * Extracts exercise names from message text
 */

export interface ExerciseMarker {
  name: string;
  startIndex: number;
  endIndex: number;
  fullMatch: string;
}

/**
 * Extracts all [[Exercise Name]] markers from text
 * Returns array of markers with positions
 */
export function extractExerciseMarkers(text: string): ExerciseMarker[] {
  const markers: ExerciseMarker[] = [];
  const regex = /\[\[([^\]]+)\]\]/g;
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
 * Gets unique exercise names from text (deduplicated)
 */
export function getUniqueExerciseNames(text: string): string[] {
  const markers = extractExerciseMarkers(text);
  const uniqueNames = new Set(markers.map(m => m.name));
  return Array.from(uniqueNames);
}

/**
 * Checks if text contains any exercise markers
 */
export function hasExerciseMarkers(text: string): boolean {
  return /\[\[([^\]]+)\]\]/.test(text);
}

