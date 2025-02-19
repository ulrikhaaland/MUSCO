'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useClientUrl() {
  const searchParams = useSearchParams();
  const [href, setHref] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHref(window.location.href);
    }
  }, [searchParams]);

  return {
    href,
    searchParams,
    getParam: (key: string) => searchParams?.get(key) ?? null
  };
} 