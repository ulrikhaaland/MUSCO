'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Tailwind md breakpoint
const MD_BREAKPOINT = 768;

export interface SectionRefs {
  general: HTMLDivElement | null;
  healthBasics: HTMLDivElement | null;
  fitnessProfile: HTMLDivElement | null;
  medicalBackground: HTMLDivElement | null;
}

export type SectionId = keyof SectionRefs;

export interface UseResponsiveProfileReturn {
  isDesktop: boolean;
  activeSection: SectionId;
  sectionRefs: React.MutableRefObject<SectionRefs>;
  scrollToSection: (sectionId: SectionId) => void;
  setSectionRef: (sectionId: SectionId, el: HTMLDivElement | null) => void;
}

/**
 * Hook for managing responsive profile page behavior.
 * Handles breakpoint detection, section refs, and scroll-to functionality.
 */
export function useResponsiveProfile(): UseResponsiveProfileReturn {
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('general');
  
  const sectionRefs = useRef<SectionRefs>({
    general: null,
    healthBasics: null,
    fitnessProfile: null,
    medicalBackground: null,
  });

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

  // IntersectionObserver for active section detection on desktop
  useEffect(() => {
    if (!isDesktop) return;

    const observers: IntersectionObserver[] = [];
    const sectionOrder: SectionId[] = ['general', 'healthBasics', 'fitnessProfile', 'medicalBackground'];
    const visibleSections = new Set<SectionId>();

    const updateActiveSection = () => {
      // Find the first visible section in order
      for (const sectionId of sectionOrder) {
        if (visibleSections.has(sectionId)) {
          setActiveSection(sectionId);
          return;
        }
      }
    };

    // Create observers for each section
    sectionOrder.forEach((sectionId) => {
      const element = sectionRefs.current[sectionId];
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              visibleSections.add(sectionId);
            } else {
              visibleSections.delete(sectionId);
            }
            updateActiveSection();
          });
        },
        {
          rootMargin: '-100px 0px -50% 0px',
          threshold: 0,
        }
      );

      observer.observe(element);
      observers.push(observer);
    });

    return () => {
      observers.forEach((observer) => observer.disconnect());
    };
  }, [isDesktop]);

  // Scroll to section function
  const scrollToSection = useCallback((sectionId: SectionId) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      const offset = 100; // Account for sticky header
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
    }
  }, []);

  // Helper to set section refs
  const setSectionRef = useCallback((sectionId: SectionId, el: HTMLDivElement | null) => {
    sectionRefs.current[sectionId] = el;
  }, []);

  return {
    isDesktop,
    activeSection,
    sectionRefs,
    scrollToSection,
    setSectionRef,
  };
}

export default useResponsiveProfile;



