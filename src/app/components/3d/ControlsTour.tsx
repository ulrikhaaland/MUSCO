'use client';

import { useEffect, useRef, useState } from 'react';
import { TourStep } from '@/app/hooks/useControlsTour';
import { useTranslation } from '@/app/i18n';

// LocalStorage key for tracking tour viewed status
const TOUR_VIEWED_KEY = 'controls_tour_viewed';

interface ControlsTourProps {
  currentStep: TourStep;
  onNext: () => void;
  onSkip: () => void;
  controlsBottom: string;
}

// Separate HighlightRing component
const HighlightRing = ({ currentStep, controlsBottom }: { currentStep: TourStep, controlsBottom: string }) => {
  const [position, setPosition] = useState({ left: 0, top: 0 });
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  // Update position on step change, window resize, and controlsBottom changes
  useEffect(() => {
    const getSelector = () => {
      return currentStep === 'rotate' 
        ? '.rotate-button' 
        : currentStep === 'reset' 
          ? '.reset-button' 
          : '.gender-button';
    };
    
    const updatePosition = () => {
      const selector = getSelector();
      const targetButton = document.querySelector(selector);
      
      if (targetButton) {
        const rect = targetButton.getBoundingClientRect();
        setPosition({
          left: rect.x + rect.width / 2,
          top: rect.y + rect.height / 2
        });
      }
    };
    
    // Initial position
    updatePosition();
    
    // Set up mutation observer to track DOM changes
    if (!observerRef.current) {
      observerRef.current = new MutationObserver(() => {
        updatePosition();
      });
      
      const mobileControls = document.querySelector('.mobile-controls-container');
      if (mobileControls) {
        observerRef.current.observe(mobileControls, {
          attributes: true,
          attributeFilter: ['style'],
          childList: true,
          subtree: true
        });
      }
    }
    
    // Set up resize observer to track element size changes
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        updatePosition();
      });
      
      const selector = getSelector();
      const targetButton = document.querySelector(selector);
      if (targetButton) {
        resizeObserverRef.current.observe(targetButton);
      }
    }
    
    // Update on resize
    window.addEventListener('resize', updatePosition);
    
    // Continuously update position while tour is active
    const interval = setInterval(updatePosition, 100);
    
    return () => {
      window.removeEventListener('resize', updatePosition);
      clearInterval(interval);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [currentStep, controlsBottom]);
  
  return (
    <div
      className="fixed w-12 h-12 rounded-full border-2 border-white/50 pointer-events-none z-[60] highlight-ring-pulse"
      style={{
        left: `${position.left}px`,
        top: `${position.top}px`,
        transform: 'translate(-50%, -50%)'
      }}
    />
  );
};

export default function ControlsTour({ currentStep, onNext, onSkip, controlsBottom }: ControlsTourProps) {
  const { t } = useTranslation();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [prevFocusElement, setPrevFocusElement] = useState<HTMLElement | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ left: 0, top: 0 });
  const [arrowPosition] = useState('right');
  const observerRef = useRef<MutationObserver | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  
  // Check localStorage on mount to see if tour has been viewed
  useEffect(() => {
    const hasViewedTour = localStorage.getItem(TOUR_VIEWED_KEY) === 'true';
    if (hasViewedTour) {
      // If tour has been viewed before, skip it
      onSkip();
    }
  }, [onSkip]);

  // Mark tour as viewed when completed
  useEffect(() => {
    if (currentStep === 'complete') {
      localStorage.setItem(TOUR_VIEWED_KEY, 'true');
    }
  }, [currentStep]);
  
  // Handle accessibility - move focus to tooltip when step changes
  useEffect(() => {
    if (tooltipRef.current) {
      // Store the currently focused element
      if (document.activeElement instanceof HTMLElement) {
        setPrevFocusElement(document.activeElement);
      }
      
      // Move focus to tooltip
      tooltipRef.current.focus();
    }
    
    return () => {
      // Return focus to previously focused element on unmount
      if (prevFocusElement) {
        prevFocusElement.focus();
      }
    };
  }, [currentStep]);

  // Calculate tooltip position based on button position
  useEffect(() => {
    const getSelector = () => {
      return currentStep === 'rotate' 
        ? '.rotate-button' 
        : currentStep === 'reset' 
          ? '.reset-button' 
          : '.gender-button';
    };
    
    const updateTooltipPosition = () => {
      const selector = getSelector();
      const targetButton = document.querySelector(selector);
      
      if (targetButton && tooltipRef.current) {
        const buttonRect = targetButton.getBoundingClientRect();
        
        // Position tooltip to the left of the button with minimal spacing
        setTooltipPosition({
          left: buttonRect.left - 200 - 24, // Use fixed width to avoid initial positioning issues
          top: buttonRect.top + (buttonRect.height / 2) - 50 // Approximate half height
        });
      }
    };
    
    // Initial position
    updateTooltipPosition();
    
    // Set up mutation observer to track DOM changes
    if (!observerRef.current) {
      observerRef.current = new MutationObserver(() => {
        updateTooltipPosition();
      });
      
      const mobileControls = document.querySelector('.mobile-controls-container');
      if (mobileControls) {
        observerRef.current.observe(mobileControls, {
          attributes: true,
          attributeFilter: ['style'],
          childList: true,
          subtree: true
        });
      }
    }
    
    // Set up resize observer to track element size changes
    if (!resizeObserverRef.current) {
      resizeObserverRef.current = new ResizeObserver(() => {
        updateTooltipPosition();
      });
      
      const selector = getSelector();
      const targetButton = document.querySelector(selector);
      if (targetButton) {
        resizeObserverRef.current.observe(targetButton);
      }
    }
    
    // Update on resize
    window.addEventListener('resize', updateTooltipPosition);
    
    // Continuously update position while tour is active
    const interval = setInterval(updateTooltipPosition, 100);
    
    return () => {
      window.removeEventListener('resize', updateTooltipPosition);
      clearInterval(interval);
      
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
      
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
      }
    };
  }, [currentStep, controlsBottom]); // Add controlsBottom as dependency

  // Handle escape key to skip tour
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onSkip();
        localStorage.setItem(TOUR_VIEWED_KEY, 'true');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSkip]);

  // Handle click outside to skip
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        tooltipRef.current && 
        !tooltipRef.current.contains(e.target as Node) &&
        !(e.target as Element).closest('.rotate-button, .reset-button, .gender-button')
      ) {
        onSkip();
        localStorage.setItem(TOUR_VIEWED_KEY, 'true');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onSkip]);

  if (currentStep === 'complete') return null;
  
  // Get current step number
  const getStepNumber = () => {
    switch (currentStep) {
      case 'rotate': return 1;
      case 'reset': return 2;
      case 'gender': return 3;
      default: return 1;
    }
  };

  const getTooltipText = () => {
    switch (currentStep) {
      case 'rotate':
        return t('mobile.controls.tour.rotate');
      case 'reset':
        return t('mobile.controls.tour.reset');
      case 'gender':
        return t('mobile.controls.tour.gender');
      default:
        return '';
    }
  };
  
  const handleTooltipClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent clicks from propagating
  };

  return (
    <>
      {/* Separate highlight ring component */}
      <HighlightRing currentStep={currentStep} controlsBottom={controlsBottom} />

      {/* Tooltip - z-index 70 */}
      <div
        ref={tooltipRef}
        role="dialog"
        aria-labelledby="tour-tooltip-text"
        tabIndex={-1}
        className={`fixed z-[70] max-w-[200px] bg-[#1f2937e0] text-white px-3 py-2 rounded-lg shadow-lg tooltip-slide-up tooltip-arrow-${arrowPosition} border-0`}
        style={{
          left: `${tooltipPosition.left}px`,
          top: `${tooltipPosition.top}px`
        }}
        onClick={handleTooltipClick}
      >
        <p 
          id="tour-tooltip-text"
          className="text-[14px] leading-5 font-medium"
        >
          {getTooltipText()}
        </p>
        
        <div className="mt-2 flex items-center gap-1">
          <span className="text-[12px] font-mono text-gray-300 mr-1">
            {getStepNumber()} / 3
          </span>
          <div className="flex-grow"></div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
              if (getStepNumber() === 3) {
                localStorage.setItem(TOUR_VIEWED_KEY, 'true');
              }
            }}
            className="text-[14px] leading-5 font-semibold bg-[#374151] hover:bg-[#4b5563] h-8 px-4 rounded-md transition-colors duration-200"
          >
            {t('mobile.controls.next')}
          </button>
        </div>
      </div>
    </>
  );
} 