'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { useApp } from '../context/AppContext';

export function RouteChangeListener() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { shouldNavigateToProgram, setShouldNavigateToProgram, completeReset } = useApp();

  useEffect(() => {
    // Check for ?new=true parameter and reset app state if found
    const newParam = searchParams.get('new');
    if (newParam === 'true') {
      console.log('Detected ?new=true parameter, resetting app state');
      completeReset();
    }
    
    // If we're not on the root page and shouldNavigateToProgram is true,
    // set it to false to prevent automatic navigation to program page
    if (pathname !== '/' && shouldNavigateToProgram) {
      setShouldNavigateToProgram(false);
    }
  }, [pathname, searchParams, shouldNavigateToProgram, setShouldNavigateToProgram, completeReset]);

  // This component doesn't render anything
  return null;
} 