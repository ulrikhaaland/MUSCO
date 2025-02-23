'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export function useClientUrl() {
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const [href, setHref] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialized.current = true;
      setHref(window.location.href);
    }
  }, [searchParams]);

  return {
    href,
    getParam: (key: string) => searchParams?.get(key) ?? null,
    isReady: initialized.current
  };
} 