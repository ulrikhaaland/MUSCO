import { describe, it, expect } from '@jest/globals';
import {
  programSlugs,
  rehabPrograms,
  getProgramBySlug,
  getAvailableSlugs,
  getUserProgramBySlug,
} from '../../../../public/data/programs/recovery';

// Source of truth: program indices for each single-week program in rehabPrograms
const expectedStartIndexByCanonicalSlug: Record<string, number> = {
  'shin-splints': 0,
  'lower-back': 1,
  'runners-knee': 2,
  shoulder: 3,
  'ankle-sprain': 4,
  'tennis-elbow': 5,
  techneck: 6,
  'plantar-fasciitis': 7,
  hamstring: 8,
  'upper-back-core': 9,
  'core-stability': 10,
};

// Synonyms that should map to the same start index as their canonical slug
const synonyms: Array<[string, string]> = [
  ['lowback', 'lower-back'],
  ['low-back', 'lower-back'],
  ['runnersknee', 'runners-knee'],
  ['shoulder-impingement', 'shoulder'],
  ['elbow', 'tennis-elbow'],
  ['plantarfasciitis', 'plantar-fasciitis'],
  ['plantar', 'plantar-fasciitis'],
  ['upperbackcore', 'upper-back-core'],
  ['corestability', 'core-stability'],
];

describe('Recovery program slug mapping', () => {
  it('maps canonical slugs to correct program indices', () => {
    for (const [slug, expectedIndex] of Object.entries(
      expectedStartIndexByCanonicalSlug
    )) {
      expect(programSlugs[slug]).toBe(expectedIndex);

      // Ensure the program exists at the mapped index
      expect(rehabPrograms[expectedIndex]).toBeTruthy();
      expect(Array.isArray(rehabPrograms[expectedIndex].days)).toBe(true);

      // Single-week program should have 7 days
      const program = getProgramBySlug(slug);
      expect(program).toBeTruthy();
      expect(program!.days.length).toBe(7);
    }
  });

  it('ensures synonyms resolve to the same start index as their canonical slug', () => {
    for (const [synonym, canonical] of synonyms) {
      expect(programSlugs[synonym]).toBe(programSlugs[canonical]);
    }
  });

  it('exposes all slugs and returns user program metadata consistently', () => {
    const all = getAvailableSlugs();
    // At minimum we should include all keys from programSlugs
    for (const slug of Object.keys(programSlugs)) {
      expect(all).toContain(slug);

      const up = getUserProgramBySlug(slug);
      expect(up).toBeTruthy();
      // Single-week program for each recovery plan
      expect(up!.programs.length).toBe(1);
    }
  });

  it('keeps week-1 programs free of machine-dependent warmup/cardio IDs', () => {
    const disallowedExerciseIds = new Set([
      'warmup-1',
      'warmup-2',
      'warmup-3',
      'warmup-10',
      'warmup-11',
      'cardio-3',
      'cardio-4',
      'cardio-5',
      'cardio-6',
      'cardio-7',
      'cardio-8',
      'cardio-9',
      'cardio-10',
      'cardio-11',
      'cardio-12',
    ]);

    for (const slug of Object.keys(programSlugs)) {
      const up = getUserProgramBySlug(slug);
      expect(up).toBeTruthy();
      const week1 = up!.programs[0];
      expect(week1).toBeTruthy();

      for (const day of week1.days) {
        const exercises = day.exercises || [];
        for (const exercise of exercises) {
          expect(disallowedExerciseIds.has(exercise.exerciseId)).toBe(false);
        }
      }
    }
  });

  it('uses no-equipment forearm IDs in tennis-elbow week 1', () => {
    const up = getUserProgramBySlug('tennis-elbow');
    expect(up).toBeTruthy();
    const week1 = up!.programs[0];
    const exerciseIds = new Set(
      week1.days.flatMap((day) => (day.exercises || []).map((exercise) => exercise.exerciseId))
    );

    expect(exerciseIds.has('forearms-3')).toBe(true);
    expect(exerciseIds.has('forearms-4')).toBe(true);
    expect(exerciseIds.has('forearms-1')).toBe(false);
    expect(exerciseIds.has('forearms-2')).toBe(false);
  });
});
