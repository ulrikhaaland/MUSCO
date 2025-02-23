'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';

export function useClientUrl() {
  const searchParams = useSearchParams();
  const initialized = useRef(false);
  const [href, setHref] = useState<string>(() => {
    // Initialize href immediately if we're on the client
    if (typeof window !== 'undefined') {
      initialized.current = true;
      return window.location.href;
    }
    return '';
  });

  useEffect(() => {
    if (!initialized.current && typeof window !== 'undefined') {
      initialized.current = true;
      setHref(window.location.href);
    }
  }, []);

  // Update href when searchParams change, but only if we're initialized
  useEffect(() => {
    if (initialized.current) {
      setHref(window.location.href);
    }
  }, [searchParams]);

  return {
    href,
    searchParams,
    getParam: (key: string) => searchParams?.get(key) ?? null,
    isReady: initialized.current
  };
} 