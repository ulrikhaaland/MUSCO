/**
 * Calculates the delta between two selection maps for efficient Human API updates.
 * Only returns keys whose boolean values have changed.
 * 
 * @param prev - Previous selection state
 * @param next - New selection state
 * @returns Delta map containing only changed keys
 */
export function diffSelect(
  prev: Record<string, boolean>,
  next: Record<string, boolean>
): Record<string, boolean> {
  const delta: Record<string, boolean> = {};

  // Check for new/changed keys in next
  for (const k in next) {
    if (prev[k] !== next[k]) {
      delta[k] = next[k];
    }
  }

  // Check for removed keys (keys in prev but not in next)
  for (const k in prev) {
    if (!(k in next)) {
      delta[k] = false; // Mark as deselected
    }
  }

  return delta;
} 