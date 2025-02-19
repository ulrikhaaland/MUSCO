'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useClientUrl() {
  const searchParams = useSearchParams();
  const [href, setHref] = useState<string>('');

  useEffect(() => {
    setHref(window.location.href);
  }, [searchParams]);

  return href;
} 