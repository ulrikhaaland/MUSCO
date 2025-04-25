'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';
import { useLoader } from '../context/LoaderContext';

function RouteChangeListenerContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { hideLoader } = useLoader();
  const prevPathRef = useRef<string | null>(null);

  // Hide loader on route change
  useEffect(() => {
    // Only consider actual route changes, not initial mount
    if (prevPathRef.current !== null && prevPathRef.current !== pathname) {
      console.log(`Route changed from ${prevPathRef.current} to ${pathname}`);
      hideLoader();
    }
    
    // Update the previous path
    prevPathRef.current = pathname;
  }, [pathname, searchParams, hideLoader]);

  return null;
}

export function RouteChangeListener() {
  return (
    <Suspense fallback={null}>
      <RouteChangeListenerContent />
    </Suspense>
  );
} 