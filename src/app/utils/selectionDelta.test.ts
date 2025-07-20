import { diffSelect } from './selectionDelta';

describe('diffSelect', () => {
  it('should return empty delta when selections are identical', () => {
    const prev = { a: true, b: false };
    const next = { a: true, b: false };
    const delta = diffSelect(prev, next);
    expect(Object.keys(delta)).toHaveLength(0);
  });

  it('should detect newly selected items', () => {
    const prev = { a: true };
    const next = { a: true, b: true };
    const delta = diffSelect(prev, next);
    expect(delta).toEqual({ b: true });
  });

  it('should detect deselected items', () => {
    const prev = { a: true, b: true };
    const next = { a: true };
    const delta = diffSelect(prev, next);
    expect(delta).toEqual({ b: false });
  });

  it('should detect value changes', () => {
    const prev = { a: true, b: false };
    const next = { a: false, b: true };
    const delta = diffSelect(prev, next);
    expect(delta).toEqual({ a: false, b: true });
  });

  it('should handle empty previous selection', () => {
    const prev = {};
    const next = { a: true, b: true };
    const delta = diffSelect(prev, next);
    expect(delta).toEqual({ a: true, b: true });
  });

  it('should handle empty next selection', () => {
    const prev = { a: true, b: true };
    const next = {};
    const delta = diffSelect(prev, next);
    expect(delta).toEqual({ a: false, b: false });
  });

  it('should handle complex scenario with additions, removals, and changes', () => {
    const prev = { a: true, b: false, c: true };
    const next = { a: false, c: true, d: true };
    const delta = diffSelect(prev, next);
    expect(delta).toEqual({ 
      a: false,  // changed from true to false
      b: false,  // removed (was false, now missing)
      d: true    // added
    });
  });
}); 