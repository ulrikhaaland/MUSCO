import { useEffect, useState } from 'react';

/**
 * Detect if the app is running in standalone / PWA mode.
 * Encapsulates the various heuristics in one place so components
 * don't have to duplicate the logic.
 */
export function useIsPwa(): boolean {
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');

    setIsPwa(isStandalone);
  }, []);

  return isPwa;
} 