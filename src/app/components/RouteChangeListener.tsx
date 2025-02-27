'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function RouteChangeListener() {
  const pathname = usePathname();
  const { shouldNavigateToProgram, setShouldNavigateToProgram } = useApp();

  useEffect(() => {
    // If we're not on the root page and shouldNavigateToProgram is true,
    // set it to false to prevent automatic navigation to program page
    if (pathname !== '/' && shouldNavigateToProgram) {
      setShouldNavigateToProgram(false);
    }
  }, [pathname, shouldNavigateToProgram, setShouldNavigateToProgram]);

  // This component doesn't render anything
  return null;
} 