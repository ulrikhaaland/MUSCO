/**
 * Throttles a function to execute at most once every specified delay period.
 * Ensures the function is called at regular intervals, not more frequently than the delay.
 * 
 * @param fn - Function to throttle
 * @param delay - Minimum time between executions in milliseconds (default: 200ms)
 * @returns Throttled version of the function
 */
export function throttle<T extends (...a: any[]) => void>(
  fn: T,
  delay = 200
): T {
  let last = 0;
  let id: ReturnType<typeof setTimeout> | null = null;
  
  return function(this: any, ...args: any[]) {
    const now = Date.now();
    const run = () => { 
      last = now; 
      fn.apply(this, args); 
    };
    
    if (now - last >= delay) {
      run();
    } else {
      if (id) clearTimeout(id);
      id = setTimeout(run, delay - (now - last));
    }
  } as T;
} 