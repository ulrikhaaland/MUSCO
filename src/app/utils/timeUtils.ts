/**
 * Time formatting utilities
 */

/**
 * Format seconds to a human-readable duration string
 * - 0-59 seconds: shows as "Xs" (e.g., "30s")
 * - 60+ seconds: shows as "X min" or "X min Ys" (e.g., "1 min", "1 min 30s")
 * 
 * @param seconds Total seconds
 * @returns Formatted duration string
 */
export function formatDuration(seconds: number): string {
  if (seconds <= 0) return '0s';
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes === 0) {
    return `${seconds}s`;
  }
  
  if (remainingSeconds === 0) {
    return `${minutes} min`;
  }
  
  return `${minutes} min ${remainingSeconds}s`;
}

/**
 * Format seconds to rest time display (same as formatDuration but explicit for rest periods)
 * 
 * @param seconds Rest time in seconds
 * @returns Formatted rest time string
 */
export function formatRestTime(seconds: number): string {
  return formatDuration(seconds);
}

/**
 * Format minutes to a human-readable duration string
 * - Shows as "X min" or "X min Y sec" for partial minutes
 * 
 * @param minutes Total minutes (can be fractional)
 * @returns Formatted duration string
 */
export function formatMinutes(minutes: number): string {
  if (minutes <= 0) return '0 min';
  
  const wholeMinutes = Math.floor(minutes);
  const remainingSeconds = Math.round((minutes - wholeMinutes) * 60);
  
  if (remainingSeconds === 0) {
    return `${wholeMinutes} min`;
  }
  
  return `${wholeMinutes} min ${remainingSeconds} sec`;
}


