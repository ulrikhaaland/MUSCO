'use client';

import { useState, useEffect } from 'react';

// Tailwind md breakpoint
const MD_BREAKPOINT = 768;

export type SectionId = 'general' | 'healthBasics' | 'fitnessProfile' | 'medicalBackground' | 'customNotes';

export interface UseResponsiveProfileReturn {
  isDesktop: boolean;
  activeSection: SectionId;
  setActiveSection: (sectionId: SectionId) => void;
}

/**
 * Hook for managing responsive profile page behavior.
 * Handles breakpoint detection and active section state.
 */
export function useResponsiveProfile(): UseResponsiveProfileReturn {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('general');

  // Breakpoint detection
  useEffect(() => {
    const checkBreakpoint = () => {
      setIsDesktop(window.innerWidth >= MD_BREAKPOINT);
    };

    // Initial check
    checkBreakpoint();

    // Listen for resize
    window.addEventListener('resize', checkBreakpoint);
    return () => window.removeEventListener('resize', checkBreakpoint);
  }, []);

  return {
    isDesktop,
    activeSection,
    setActiveSection,
  };
}

export default useResponsiveProfile;
