import { useCallback, useRef, useState } from 'react';

/**
 * Hook for managing touch/mouse interactions to detect user-initiated scrolling.
 * Used to differentiate between programmatic scrolls and user scrolls.
 */
interface UseTouchInteractionReturn {
  /** Whether the user has touched/interacted with the container */
  userTouched: boolean;
  /** Set the userTouched state directly */
  setUserTouched: (touched: boolean) => void;
  /** Reset touch state after a delay (5 seconds) */
  resetTouchState: () => void;
  /** React touch event handler */
  handleTouchStart: React.TouchEventHandler<HTMLDivElement>;
  /** DOM event handler for touch/mouse interactions */
  handleDOMInteraction: (e: Event) => void;
}

export function useTouchInteraction(): UseTouchInteractionReturn {
  const [userTouched, setUserTouched] = useState(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasHadTouchRef = useRef<boolean>(false);

  // Reset touch state after a delay
  const resetTouchState = useCallback(() => {
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
    }

    // Only set a timeout if we've had a real touch before
    if (hasHadTouchRef.current) {
      touchTimeoutRef.current = setTimeout(() => {
        setUserTouched(false);
      }, 5000); // Reset after 5 seconds of no touch
    }
  }, []);

  // Handle touch events to detect user interaction for DOM events
  const handleDOMInteraction = useCallback((e: Event) => {
    // Skip if the interaction is on a follow-up question button or scroll button
    const target = e.target as HTMLElement;

    // Check if the click is on a follow-up question button or its children
    const isFollowUpQuestion = target.closest('.follow-up-question-btn');

    // Check if the click is on the scroll-to-bottom button or its children
    const isScrollButton = target.closest('.scroll-to-bottom-btn');

    // Only set userTouched if it's not on these special elements
    if (!isFollowUpQuestion && !isScrollButton) {
      setUserTouched(true);
      hasHadTouchRef.current = true; // Mark that we've had a real touch
      resetTouchState();
    }
  }, [resetTouchState]);

  // Handle React touch events
  const handleTouchStart = useCallback<React.TouchEventHandler<HTMLDivElement>>(
    (e) => {
      // Same logic as DOM event handler
      const target = e.target as HTMLElement;
      const isFollowUpQuestion = target.closest('.follow-up-question-btn');
      const isScrollButton = target.closest('.scroll-to-bottom-btn');

      if (!isFollowUpQuestion && !isScrollButton) {
        setUserTouched(true);
        hasHadTouchRef.current = true;
        resetTouchState();
      }
    },
    [resetTouchState]
  );

  return {
    userTouched,
    setUserTouched,
    resetTouchState,
    handleTouchStart,
    handleDOMInteraction,
  };
}


