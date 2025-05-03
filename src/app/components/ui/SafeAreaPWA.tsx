'use client';

import React, { useEffect, useState, ReactNode } from 'react';

interface SafeAreaPWAProps {
  children: ReactNode;
  className?: string;
}

export function SafeAreaPWA({ children, className = '' }: SafeAreaPWAProps) {
  const [isPwa, setIsPwa] = useState(false);
  
  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const isPwaMode = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone ||
      document.referrer.includes('android-app://');
    
    setIsPwa(isPwaMode);
    
    // Add listener for changes in display mode
    const mediaQuery = window.matchMedia('(display-mode: standalone)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsPwa(e.matches);
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);
  
  if (!isPwa) {
    // Return children as-is if not in PWA mode
    return <>{children}</>;
  }
  
  // In PWA mode, apply safe area insets
  return (
    <div 
      className={`${className}`}
      style={{
        // Apply safe area insets using CSS variables for better compatibility
        paddingTop: 'var(--safe-area-inset-top)',
        paddingRight: 'var(--safe-area-inset-right)',
        paddingBottom: 'var(--safe-area-inset-bottom)',
        paddingLeft: 'var(--safe-area-inset-left)',
      }}
    >
      {children}
    </div>
  );
} 