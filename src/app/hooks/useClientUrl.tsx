'use client';

import { useState, useEffect } from 'react';

export function useClientUrl() {
  const [href, setHref] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHref(window.location.href);
    }
  }, []);

  return {
    href,
    isReady: href !== ''
  };
} 