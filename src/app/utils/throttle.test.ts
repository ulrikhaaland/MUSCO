import { throttle } from './throttle';

describe('throttle', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call function immediately on first call', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 200);

    throttled();
    
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throttle subsequent calls within delay period', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 200);

    // First call - should execute immediately
    throttled();
    expect(fn).toHaveBeenCalledTimes(1);

    // Second call within 200ms - should be throttled
    throttled();
    expect(fn).toHaveBeenCalledTimes(1); // Still 1, not 2

    // Advance time by 100ms (still within throttle period)
    jest.advanceTimersByTime(100);
    throttled();
    expect(fn).toHaveBeenCalledTimes(1); // Still 1

    // Advance time to trigger the delayed call
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should allow immediate execution after delay period', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 200);

    throttled(); // First call
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time beyond throttle period
    jest.advanceTimersByTime(250);

    throttled(); // Should execute immediately
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple rapid calls correctly', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 200);

    // Rapid sequence of calls
    throttled(); // Call 1 - immediate
    throttled(); // Call 2 - throttled
    throttled(); // Call 3 - throttled
    throttled(); // Call 4 - throttled

    expect(fn).toHaveBeenCalledTimes(1); // Only first call executed

    // Advance time to trigger delayed execution
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(2); // Last call executed
  });

  it('should use default 200ms delay when not specified', () => {
    const fn = jest.fn();
    const throttled = throttle(fn); // No delay specified

    throttled(); // First call
    expect(fn).toHaveBeenCalledTimes(1);

    throttled(); // Second call - should be throttled
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time by 150ms (still within default 200ms)
    jest.advanceTimersByTime(150);
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time to trigger delayed execution
    jest.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should preserve function context and arguments', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 100);
    const context = { test: true };
    const args = ['arg1', 'arg2', 123];

    throttled.apply(context, args);
    expect(fn).toHaveBeenCalledWith('arg1', 'arg2', 123);
    expect(fn).toHaveBeenCalledWith(...args);
  });

  it('should handle custom delay periods', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 500); // 500ms delay

    throttled(); // First call
    expect(fn).toHaveBeenCalledTimes(1);

    throttled(); // Second call - throttled
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time by 300ms (still within 500ms)
    jest.advanceTimersByTime(300);
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time to trigger delayed execution
    jest.advanceTimersByTime(200);
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should clear previous timeout when new call comes in', () => {
    const fn = jest.fn();
    const throttled = throttle(fn, 200);

    throttled(); // Call 1 - immediate
    expect(fn).toHaveBeenCalledTimes(1);

    throttled(); // Call 2 - throttled, sets timeout
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time by 100ms
    jest.advanceTimersByTime(100);

    throttled(); // Call 3 - should clear previous timeout and set new one
    expect(fn).toHaveBeenCalledTimes(1);

    // Advance time to trigger the delayed execution
    jest.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
  });
}); 