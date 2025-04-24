'use client';

import { useState, useEffect } from 'react';

export type TourStep = 'rotate' | 'reset' | 'gender' | 'complete';

export default function useControlsTour() {
  const [shouldShowTour, setShouldShowTour] = useState(false);
  const [currentStep, setCurrentStep] = useState<TourStep>('rotate');
  const [isTourMounted, setIsTourMounted] = useState(false);

  useEffect(() => {
    // Add a delay before showing the tour
    const timer = setTimeout(() => {
      setShouldShowTour(true);
      setIsTourMounted(true);
    }, 250);

    return () => clearTimeout(timer);
  }, []);

  const nextStep = () => {
    switch (currentStep) {
      case 'rotate':
        setCurrentStep('reset');
        break;
      case 'reset':
        setCurrentStep('gender');
        break;
      case 'gender':
        setCurrentStep('complete');
        completeTour();
        break;
    }
  };

  const skipTour = () => {
    completeTour();
  };

  const completeTour = () => {
    setShouldShowTour(false);
    localStorage.setItem('controlsTourSeen', 'true');
    
    // Allow animation to complete before unmounting
    setTimeout(() => {
      setIsTourMounted(false);
    }, 300);
  };

  return {
    shouldShowTour,
    currentStep,
    isTourMounted,
    nextStep,
    skipTour,
  };
} 