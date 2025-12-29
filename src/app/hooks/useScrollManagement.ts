import { RefObject, useCallback, useState } from 'react';

/**
 * Hook for managing scroll behavior in chat components.
 * Handles scroll button visibility, auto-scroll, and programmatic scrolling.
 */
interface UseScrollManagementOptions {
  /** Reference to the scrollable container */
  containerRef: RefObject<HTMLDivElement | null>;
  /** Disable auto-scroll behavior */
  disableAutoScroll?: boolean;
  /** Number of messages (used to hide scroll button when < 2 messages) */
  messageCount: number;
  /** Optional custom function to get the scroll container (for mobile bottom sheet support) */
  getScrollContainer?: () => Element | null;
}

interface UseScrollManagementReturn {
  /** Whether to show the scroll-to-bottom button */
  showScrollButton: boolean;
  /** Scroll to bottom of container */
  scrollToBottom: (force?: boolean) => void;
  /** Update scroll button visibility based on scroll position */
  updateScrollButtonVisibility: (container: Element | null) => void;
  /** Check if container is scrolled to bottom */
  isScrolledToBottom: (container: Element | null) => boolean;
}

export function useScrollManagement({
  containerRef,
  disableAutoScroll = false,
  messageCount,
  getScrollContainer,
}: UseScrollManagementOptions): UseScrollManagementReturn {
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Get the appropriate scroll container
  const getContainer = useCallback((): Element | null => {
    if (getScrollContainer) {
      return getScrollContainer();
    }
    return containerRef.current as unknown as Element | null;
  }, [getScrollContainer, containerRef]);

  // Unified function to check scroll position and update button visibility
  const updateScrollButtonVisibility = useCallback(
    (container: Element | null) => {
      // Don't show button if we have fewer than 2 messages
      if (!container || messageCount < 2) {
        setShowScrollButton(false);
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Show button when scrolled more than 250px from bottom
      const scrollThreshold = 250;
      const isScrolledUpEnough = distanceFromBottom > scrollThreshold;
      setShowScrollButton(isScrolledUpEnough);
    },
    [messageCount]
  );

  // Helper function to check if the container is scrolled to the bottom
  const isScrolledToBottom = useCallback(
    (container: Element | null): boolean => {
      if (!container) return true;

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Consider "at bottom" if within threshold of actual bottom
      const scrollThreshold = 60;
      return distanceFromBottom < scrollThreshold;
    },
    []
  );

  // Scroll to bottom of container
  const scrollToBottom = useCallback((forceScroll = false) => {
    // Skip scrolling if disabled, unless forceScroll is true
    if (disableAutoScroll && !forceScroll) return;

    try {
      const container = getContainer();

      if (container) {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth',
        });

        // Backup scroll attempt
        setTimeout(() => {
          if (container) {
            container.scrollTop = container.scrollHeight;
            updateScrollButtonVisibility(container);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  }, [disableAutoScroll, getContainer, updateScrollButtonVisibility]);

  return {
    showScrollButton,
    scrollToBottom,
    updateScrollButtonVisibility,
    isScrolledToBottom,
  };
}


