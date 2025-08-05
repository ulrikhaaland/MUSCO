import { getAvailableSlugs, getProgramBySlug } from '../../../../public/data/programs/recovery';
import { getStartOfWeek, addDays } from '../dateutils';

/**
 * Pure helper that mirrors the logic used in submitProgramFeedback → API payload
 * and in openai-server when deciding the createdAt of a follow-up week.
 */
export function computeDesiredCreatedAt(
  previousCreatedAtIso: string | null,
  now: Date
): string {
  const currentWeekStart = getStartOfWeek(now);

  if (previousCreatedAtIso) {
    const prevWeekStart = getStartOfWeek(new Date(previousCreatedAtIso));
    const candidate = addDays(prevWeekStart, 7);
    const chosen = candidate < currentWeekStart ? currentWeekStart : candidate;
    return new Date(Date.UTC(chosen.getFullYear(), chosen.getMonth(), chosen.getDate())).toISOString();
  }

  return new Date(Date.UTC(currentWeekStart.getFullYear(), currentWeekStart.getMonth(), currentWeekStart.getDate())).toISOString();
}

describe('Follow-up program createdAt calculation (using mock programs)', () => {
  const [firstSlug] = getAvailableSlugs();
  // Load a mock program just to verify we can read data from the recovery set
  // (Not strictly needed for the calculations, but ensures path stays valid)
  beforeAll(() => {
    expect(getProgramBySlug(firstSlug)).toBeTruthy();
  });

  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('no previous program ⇒ current calendar week', () => {
    const now = new Date('2025-08-04T10:00:00Z'); // Monday 4 Aug 2025
    jest.setSystemTime(now);

    const resultIso = computeDesiredCreatedAt(null, new Date());
    expect(resultIso.startsWith('2025-08-04')).toBe(true);
  });

  it('previous program already this week ⇒ next week', () => {
    const now = new Date('2025-08-04T10:00:00Z');
    jest.setSystemTime(now);

    const prevIso = '2025-08-04T00:00:00Z'; // Monday current week
    const resultIso = computeDesiredCreatedAt(prevIso, new Date());
    expect(resultIso.startsWith('2025-08-11')).toBe(true); // Monday next week
  });

  it('user delays two weeks ⇒ falls back to current week', () => {
    const now = new Date('2025-08-18T10:00:00Z'); // Monday two weeks later
    jest.setSystemTime(now);

    const prevIso = '2025-08-04T00:00:00Z';
    const resultIso = computeDesiredCreatedAt(prevIso, new Date());
    expect(resultIso.startsWith('2025-08-18')).toBe(true); // Monday current week
  });

  it('previous program four weeks ago ⇒ still current week', () => {
    const now = new Date('2025-09-01T10:00:00Z'); // Mon 1 Sep 2025
    jest.setSystemTime(now);

    const prevIso = '2025-08-04T00:00:00Z'; // Four weeks earlier
    const resultIso = computeDesiredCreatedAt(prevIso, new Date());
    expect(resultIso.startsWith('2025-09-01')).toBe(true);
  });

  it('previous program one week ago ⇒ current week (no duplicate)', () => {
    const now = new Date('2025-08-18T10:00:00Z'); // Mon 18 Aug 2025
    jest.setSystemTime(now);

    const prevIso = '2025-08-11T00:00:00Z';
    const resultIso = computeDesiredCreatedAt(prevIso, new Date());
    expect(resultIso.startsWith('2025-08-18')).toBe(true);
  });

  it('previous program in the future (data error) ⇒ schedules week after that', () => {
    const now = new Date('2025-08-04T10:00:00Z');
    jest.setSystemTime(now);

    const prevIso = '2025-08-18T00:00:00Z'; // future
    const resultIso = computeDesiredCreatedAt(prevIso, new Date());
    expect(resultIso.startsWith('2025-08-25')).toBe(true); // week after future prev
  });
});
