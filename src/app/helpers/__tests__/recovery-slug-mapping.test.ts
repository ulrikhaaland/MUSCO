import { describe, it, expect } from '@jest/globals';
import {
  programSlugs,
  rehabPrograms,
  getProgramBySlug,
  getAvailableSlugs,
  getUserProgramBySlug,
} from '../../../../public/data/programs/recovery';

// Source of truth: start indices for each 4-week condition block in rehabPrograms
const expectedStartIndexByCanonicalSlug: Record<string, number> = {
  'shin-splints': 0,
  'lower-back': 4,
  'runners-knee': 8,
  shoulder: 12,
  'ankle-sprain': 16,
  'tennis-elbow': 20,
  techneck: 24,
  'plantar-fasciitis': 28,
  hamstring: 32,
  'upper-back-core': 36,
  'core-stability': 40,
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
  it('maps canonical slugs to correct 4-week start indices', () => {
    for (const [slug, expectedIndex] of Object.entries(
      expectedStartIndexByCanonicalSlug
    )) {
      expect(programSlugs[slug]).toBe(expectedIndex);

      // Ensure all 4 weeks exist for that index range
      for (let i = 0; i < 4; i++) {
        expect(rehabPrograms[expectedIndex + i]).toBeTruthy();
        expect(Array.isArray(rehabPrograms[expectedIndex + i].days)).toBe(true);
      }

      // Combined program should have 28 days
      const combined = getProgramBySlug(slug);
      expect(combined).toBeTruthy();
      expect(combined!.days.length).toBe(28);
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
      // 4 week programs for each recovery plan
      expect(up!.programs.length).toBe(4);
    }
  });
});


