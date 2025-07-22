/**
 * Date utility functions for the application
 */

/**
 * Get the Monday of the current week
 * @returns Date object representing Monday of the current week at 00:00:00.000
 */
export function getCurrentWeekMonday(): Date {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
  
  // Calculate days to subtract to get to current week's Monday
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // If Sunday (0), subtract 6 days, otherwise subtract (dayOfWeek - 1)
  
  const currentMonday = new Date(today);
  currentMonday.setDate(today.getDate() - daysToSubtract);
  
  // Set to start of day (00:00:00.000)
  currentMonday.setHours(0, 0, 0, 0);
  
  return currentMonday;
}

/**
 * Get the Monday of the next week
 * @returns Date object representing Monday of the next week at 00:00:00.000
 */
export function getNextMonday(): Date {
  const currentMonday = getCurrentWeekMonday();
  const nextMonday = new Date(currentMonday);
  nextMonday.setDate(currentMonday.getDate() + 7); // Add 7 days to get next Monday
  return nextMonday;
}

/**
 * Get the Monday of the current week in a specific timezone
 * @param timeZone IANA timezone identifier (e.g., 'Europe/Oslo', 'America/New_York')
 * @returns Date object representing Monday of the current week in the specified timezone
 */
export function getCurrentWeekMondayInTimezone(timeZone: string): Date {
  const today = new Date();
  
  // Get today's date in the specified timezone
  const todayInTZ = new Date(today.toLocaleString('en-US', { timeZone }));
  const dayOfWeek = todayInTZ.getDay();
  
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  
  const mondayInTZ = new Date(todayInTZ);
  mondayInTZ.setDate(todayInTZ.getDate() - daysToSubtract);
  mondayInTZ.setHours(0, 0, 0, 0);
  
  return mondayInTZ;
}

/**
 * Get the start of the week (Monday) for a given date
 * @param date The date to find the start of week for
 * @returns Date object representing Monday of that week
 */
export function getStartOfWeek(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0 is Sunday, 1 is Monday, etc.

  // Calculate days to subtract to get to Monday
  // For Sunday (0), subtract 6 days to get to previous Monday
  // For Monday (1), subtract 0 days
  // For Tuesday (2), subtract 1 day, etc.
  const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  result.setDate(result.getDate() - daysToSubtract);

  // Set to start of day (00:00:00.000)
  result.setHours(0, 0, 0, 0);

  return result;
}

/**
 * Get the end of the week (Sunday) for a given date
 * @param date The date to find the end of week for
 * @returns Date object representing Sunday of that week at 23:59:59.999
 */
export function getEndOfWeek(date: Date): Date {
  const result = new Date(date);
  const dayOfWeek = result.getDay(); // 0 is Sunday, 1 is Monday, etc.

  if (dayOfWeek === 0) {
    // Already Sunday - set to end of day
    result.setHours(23, 59, 59, 999);
    return result;
  }

  // Add days until we reach Sunday (day 0)
  const daysUntilSunday = 7 - dayOfWeek;
  result.setDate(result.getDate() + daysUntilSunday);

  // Set to end of day (23:59:59.999)
  result.setHours(23, 59, 59, 999);

  return result;
}

/**
 * Get ISO week number for a given date
 * @param date The date to get the week number for
 * @returns The ISO week number
 */
export function getWeekNumber(date: Date): number {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 4 - (d.getDay() || 7));
  const yearStart = new Date(d.getFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/**
 * Check if a date falls within a week range (inclusive)
 * @param date The date to check
 * @param weekStart Start of the week (Monday)
 * @param weekEnd End of the week (Sunday)
 * @returns Boolean indicating if the date is within the week range
 */
export function isDateInWeek(date: Date, weekStart: Date, weekEnd: Date): boolean {
  const timeToCheck = date.getTime();
  const startTime = weekStart.getTime();
  const endTime = weekEnd.getTime();
  
  return timeToCheck >= startTime && timeToCheck <= endTime;
}

/**
 * Create a UTC date from local date components (timezone-safe)
 * @param year Full year (e.g., 2025)
 * @param month Month (0-11, where 0 = January)
 * @param date Day of month (1-31)
 * @param hours Hours (0-23), defaults to 0
 * @param minutes Minutes (0-59), defaults to 0
 * @param seconds Seconds (0-59), defaults to 0
 * @param milliseconds Milliseconds (0-999), defaults to 0
 * @returns Date object in UTC
 */
export function createUTCDate(
  year: number, 
  month: number, 
  date: number, 
  hours: number = 0, 
  minutes: number = 0, 
  seconds: number = 0, 
  milliseconds: number = 0
): Date {
  return new Date(Date.UTC(year, month, date, hours, minutes, seconds, milliseconds));
}

/**
 * Get the day of week as a number where Monday = 1, Sunday = 7
 * @param date The date to get the day of week for
 * @returns Day of week (1 = Monday, 7 = Sunday)
 */
export function getDayOfWeekMondayFirst(date: Date): number {
  return date.getDay() === 0 ? 7 : date.getDay();
}

/**
 * Add weeks to a date
 * @param date The base date
 * @param weeks Number of weeks to add (can be negative to subtract)
 * @returns New date with weeks added
 */
export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + (weeks * 7));
  return result;
}

/**
 * Add days to a date
 * @param date The base date
 * @param days Number of days to add (can be negative to subtract)
 * @returns New date with days added
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(date.getDate() + days);
  return result;
} 