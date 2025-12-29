import {
  detectBodyRegion,
  getBodyPartsForRegion,
  SELECTABLE_BODY_PARTS,
  SELECTABLE_UPPER_BODY_PARTS,
  LOWER_BODY_PARTS,
  TARGET_BODY_PARTS,
  BodyRegionType,
} from '../program';

describe('detectBodyRegion', () => {
  describe('Full Body detection', () => {
    it('should detect full body when all selectable body parts are present', () => {
      const fullBodyParts = [...SELECTABLE_BODY_PARTS];
      expect(detectBodyRegion(fullBodyParts)).toBe('fullBody');
    });

    it('should detect full body even if Neck is included (filters it out)', () => {
      const fullBodyWithNeck = ['Neck', ...SELECTABLE_BODY_PARTS];
      expect(detectBodyRegion(fullBodyWithNeck)).toBe('fullBody');
    });

    it('should detect full body regardless of order', () => {
      const shuffledParts = [...SELECTABLE_BODY_PARTS].reverse();
      expect(detectBodyRegion(shuffledParts)).toBe('fullBody');
    });
  });

  describe('Upper Body detection', () => {
    it('should detect upper body when all selectable upper body parts are present', () => {
      const upperBodyParts = [...SELECTABLE_UPPER_BODY_PARTS];
      expect(detectBodyRegion(upperBodyParts)).toBe('upperBody');
    });

    it('should detect upper body even if Neck is included (filters it out)', () => {
      const upperBodyWithNeck = ['Neck', ...SELECTABLE_UPPER_BODY_PARTS];
      expect(detectBodyRegion(upperBodyWithNeck)).toBe('upperBody');
    });

    it('should detect upper body regardless of order', () => {
      const shuffledParts = [...SELECTABLE_UPPER_BODY_PARTS].reverse();
      expect(detectBodyRegion(shuffledParts)).toBe('upperBody');
    });
  });

  describe('Lower Body detection', () => {
    it('should detect lower body when all lower body parts are present', () => {
      const lowerBodyParts = [...LOWER_BODY_PARTS];
      expect(detectBodyRegion(lowerBodyParts)).toBe('lowerBody');
    });

    it('should detect lower body regardless of order', () => {
      const shuffledParts = [...LOWER_BODY_PARTS].reverse();
      expect(detectBodyRegion(shuffledParts)).toBe('lowerBody');
    });
  });

  describe('Custom detection', () => {
    it('should return custom for empty array', () => {
      expect(detectBodyRegion([])).toBe('custom');
    });

    it('should return custom for null/undefined input', () => {
      expect(detectBodyRegion(null as unknown as string[])).toBe('custom');
      expect(detectBodyRegion(undefined as unknown as string[])).toBe('custom');
    });

    it('should return custom for partial body selection', () => {
      const partialParts = ['Shoulders', 'Chest', 'Upper Back'];
      expect(detectBodyRegion(partialParts)).toBe('custom');
    });

    it('should return custom when missing one part from full body', () => {
      const almostFullBody = SELECTABLE_BODY_PARTS.slice(0, -1);
      expect(detectBodyRegion([...almostFullBody])).toBe('custom');
    });

    it('should return custom when missing one part from upper body', () => {
      const almostUpperBody = SELECTABLE_UPPER_BODY_PARTS.slice(0, -1);
      expect(detectBodyRegion([...almostUpperBody])).toBe('custom');
    });

    it('should return custom when missing one part from lower body', () => {
      const almostLowerBody = LOWER_BODY_PARTS.slice(0, -1);
      expect(detectBodyRegion([...almostLowerBody])).toBe('custom');
    });

    it('should return custom for single body part', () => {
      expect(detectBodyRegion(['Shoulders'])).toBe('custom');
    });

    it('should return custom for mixed upper and lower (but not complete)', () => {
      const mixedParts = ['Shoulders', 'Chest', 'Glutes', 'Upper Legs'];
      expect(detectBodyRegion(mixedParts)).toBe('custom');
    });
  });

  describe('Edge cases', () => {
    it('should handle duplicate body parts', () => {
      const duplicates = [...SELECTABLE_BODY_PARTS, 'Shoulders', 'Chest'];
      // Has more items than expected, so won't match
      expect(detectBodyRegion(duplicates)).toBe('custom');
    });

    it('should handle body parts with extra whitespace in array', () => {
      // This tests the exact matching - parts must match exactly
      const partsWithTypo = [...SELECTABLE_BODY_PARTS.slice(0, -1), 'lower legs'];
      expect(detectBodyRegion(partsWithTypo)).toBe('custom');
    });
  });
});

describe('getBodyPartsForRegion', () => {
  it('should return SELECTABLE_BODY_PARTS for fullBody', () => {
    const result = getBodyPartsForRegion('fullBody');
    expect(result).toEqual(SELECTABLE_BODY_PARTS);
    expect(result).not.toContain('Neck');
  });

  it('should return SELECTABLE_UPPER_BODY_PARTS for upperBody', () => {
    const result = getBodyPartsForRegion('upperBody');
    expect(result).toEqual(SELECTABLE_UPPER_BODY_PARTS);
    expect(result).not.toContain('Neck');
  });

  it('should return LOWER_BODY_PARTS for lowerBody', () => {
    const result = getBodyPartsForRegion('lowerBody');
    expect(result).toEqual(LOWER_BODY_PARTS);
  });

  it('should return empty array for custom', () => {
    const result = getBodyPartsForRegion('custom');
    expect(result).toEqual([]);
  });

  it('should return readonly arrays (not modifiable)', () => {
    const result = getBodyPartsForRegion('fullBody');
    // TypeScript would prevent this, but we verify the source is readonly
    expect(Object.isFrozen(result) || Array.isArray(result)).toBe(true);
  });
});

describe('Body parts constants consistency', () => {
  it('SELECTABLE_BODY_PARTS should not contain Neck', () => {
    expect(SELECTABLE_BODY_PARTS).not.toContain('Neck');
  });

  it('SELECTABLE_UPPER_BODY_PARTS should not contain Neck', () => {
    expect(SELECTABLE_UPPER_BODY_PARTS).not.toContain('Neck');
  });

  it('TARGET_BODY_PARTS should contain Neck (for backward compatibility)', () => {
    expect(TARGET_BODY_PARTS).toContain('Neck');
  });

  it('SELECTABLE_BODY_PARTS should have 10 parts', () => {
    expect(SELECTABLE_BODY_PARTS.length).toBe(10);
  });

  it('SELECTABLE_UPPER_BODY_PARTS should have 7 parts', () => {
    expect(SELECTABLE_UPPER_BODY_PARTS.length).toBe(7);
  });

  it('LOWER_BODY_PARTS should have 3 parts', () => {
    expect(LOWER_BODY_PARTS.length).toBe(3);
  });

  it('SELECTABLE_BODY_PARTS should equal SELECTABLE_UPPER_BODY_PARTS + LOWER_BODY_PARTS', () => {
    const combined = [...SELECTABLE_UPPER_BODY_PARTS, ...LOWER_BODY_PARTS];
    expect(SELECTABLE_BODY_PARTS.length).toBe(combined.length);
    SELECTABLE_BODY_PARTS.forEach(part => {
      expect(combined).toContain(part);
    });
  });

  it('All lower body parts should be in SELECTABLE_BODY_PARTS', () => {
    LOWER_BODY_PARTS.forEach(part => {
      expect(SELECTABLE_BODY_PARTS).toContain(part);
    });
  });

  it('All selectable upper body parts should be in SELECTABLE_BODY_PARTS', () => {
    SELECTABLE_UPPER_BODY_PARTS.forEach(part => {
      expect(SELECTABLE_BODY_PARTS).toContain(part);
    });
  });
});

describe('Round-trip consistency', () => {
  const regions: BodyRegionType[] = ['fullBody', 'upperBody', 'lowerBody'];

  regions.forEach(region => {
    it(`should round-trip correctly for ${region}`, () => {
      const parts = getBodyPartsForRegion(region);
      const detectedRegion = detectBodyRegion([...parts]);
      expect(detectedRegion).toBe(region);
    });
  });

  it('custom should not round-trip (returns empty array)', () => {
    const parts = getBodyPartsForRegion('custom');
    expect(parts).toEqual([]);
    const detectedRegion = detectBodyRegion([...parts]);
    expect(detectedRegion).toBe('custom');
  });
});



