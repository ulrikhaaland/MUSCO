import { ChatMessage, Question } from '@/app/types';
import ReactMarkdown from 'react-markdown';
import { RefObject, useEffect, useState, useRef, useCallback } from 'react';
import { LoadingMessage } from './LoadingMessage';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { AnatomyPart } from '@/app/types/human';

interface ChatMessagesProps {
  messages: ChatMessage[];
  messagesRef: RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
  streamError?: Error | null;
  followUpQuestions?: Question[];
  onQuestionClick?: (question: Question) => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  onUserScroll?: (hasScrolled: boolean) => void;
  part?: AnatomyPart;
  groups?: BodyPartGroup[];
  isMobile?: boolean;
  onResend?: (message: ChatMessage) => void;
  disableAutoScroll?: boolean;
  containerHeight?: number;
}

export function ChatMessages({
  messages,
  messagesRef,
  isLoading,
  streamError,
  followUpQuestions = [],
  onQuestionClick,
  onScroll,
  onUserScroll,
  part,
  groups,
  isMobile = false,
  onResend,
  disableAutoScroll = true,
  containerHeight,
}: ChatMessagesProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const [streamMessageHeight, setStreamMessageHeight] = useState(0);
  const [questionsHeight, setQuestionsHeight] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(0);
  const [chatContainerHeight, setChatContainerHeight] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [clickedQuestions, setClickedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [keepSpacer, setKeepSpacer] = useState(false);
  const [targetSpacerHeight, setTargetSpacerHeight] = useState(0);
  const [visibleQuestions, setVisibleQuestions] = useState<Set<string>>(
    new Set()
  );
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageContentRef = useRef<string>('');
  const lastMessageIdRef = useRef<string>('');
  const hasHadTouchRef = useRef<boolean>(false);
  const initialLoadingRef = useRef<boolean>(true);
  const loadingTransitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatViewRef = useRef<HTMLDivElement>(null);
  const streamMessageRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const wasStreamingRef = useRef<boolean>(false);
  const clickTimeoutRef = useRef<number | null>(null);
  const isProcessingClickRef = useRef<boolean>(false);
  const lastLogRef = useRef<any>(null);
  const lastKnownStreamHeightRef = useRef<number>(0);

  // Check if user prefers reduced motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

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
  }, [userTouched]);

  // Handle touch events to detect user interaction for DOM events
  const handleDOMInteraction = (e: Event) => {
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
  };

  // Handle React touch events
  const handleReactTouchStart = useCallback<
    React.TouchEventHandler<HTMLDivElement>
  >(
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
    [resetTouchState, userTouched]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [userTouched]);

  // Add effect to prevent wheel events from propagating to parent components
  useEffect(() => {
    // Function to prevent wheel events from propagating to parent containers
    const preventWheelPropagation = (event: WheelEvent) => {
      // Always prevent wheel events from propagating, even if there's no overflow
      event.stopPropagation();
    };

    // Add event listener to the message container
    const container = messagesRef.current;
    if (container) {
      container.addEventListener('wheel', preventWheelPropagation);

      // Clean up
      return () => {
        container.removeEventListener('wheel', preventWheelPropagation);
      };
    }
  }, [messagesRef]);

  // Check if we need to show a placeholder for awaiting response (when user sent a message but no response yet)
  const needsResponsePlaceholder =
    isLoading &&
    messages.length > 0 &&
    messages[messages.length - 1].role === 'user';

  // Determine if we're in streaming mode
  const isStreaming =
    messages.length > 0 &&
    isLoading &&
    messages[messages.length - 1].role !== 'user';

  const showFollowUps = followUpQuestions.length > 0;

  // Unified function to check scroll position and update button visibility
  const updateScrollButtonVisibility = useCallback(
    (container: Element | null) => {
      // Don't show button if we have fewer than 2 messages
      if (!container || messages.length < 2) {
        setShowScrollButton(false);
        return;
      }

      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

      // Show button when scrolled more than 150px from bottom
      const scrollThreshold = 250;
      const isScrolledUpEnough = distanceFromBottom > scrollThreshold;
      setShowScrollButton(isScrolledUpEnough);
    },
    [messages.length]
  );

  // Check if we're in the current turn (user message waiting for response or streaming response)
  const isCurrentTurn = useCallback(
    (index: number) => {
      if (messages.length === 0) return false;

      // If the last message is from user and we're loading, it's the current turn
      if (isLoading && messages[messages.length - 1].role === 'user') {
        return index === messages.length - 1;
      }

      // If we're streaming an assistant response, include both the user question and assistant answer
      if (isLoading && messages[messages.length - 1].role === 'assistant') {
        return index === messages.length - 1 || index === messages.length - 2;
      }

      // If we're keeping the spacer (after streaming completes), still consider it current turn
      if (keepSpacer && messages[messages.length - 1].role === 'assistant') {
        return index === messages.length - 1 || index === messages.length - 2;
      }

      return false;
    },
    [messages, isLoading, keepSpacer]
  );

  // Check if this is the last user message before an assistant response
  const isLastUserMessage = useCallback(
    (index: number) => {
      if (messages.length === 0) return false;

      // If last message is from user and loading, it's the last user message
      if (isLoading && messages[messages.length - 1].role === 'user') {
        return index === messages.length - 1;
      }

      // If we're streaming an assistant response, the previous message is the last user message
      if (isLoading && messages[messages.length - 1].role === 'assistant') {
        return index === messages.length - 2 && messages[index].role === 'user';
      }

      // If we're keeping the spacer (after streaming completes), the previous message is still the last user message
      if (keepSpacer && messages[messages.length - 1].role === 'assistant') {
        return index === messages.length - 2 && messages[index].role === 'user';
      }

      return false;
    },
    [messages, isLoading, keepSpacer]
  );

  // Set up scroll event listeners and handle initial scroll position
  useEffect(() => {
    // Get the right container based on mobile or desktop
    const container = isMobile
      ? document.querySelector('[data-rsbs-scroll]')
      : messagesRef.current;

    if (!container) return;

    // Add a flag to track if we initiated the scroll programmatically
    let isProgrammaticScroll = false;

    const handleScroll = () => {
      updateScrollButtonVisibility(container);

      // Skip handling user interaction if this is a programmatic scroll
      if (isProgrammaticScroll) {
        return;
      }

      // Only treat as user interaction if not at the bottom
      const { scrollTop, scrollHeight, clientHeight } = container;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const isNearBottom = distanceFromBottom < 100; // Within 30px of bottom

      if (!isNearBottom) {
        // User manually scrolled away from bottom - set touched flag
        setUserTouched(true);
        hasHadTouchRef.current = true; // Mark that we've had a real touch
        resetTouchState();
      }
    };

    // Check initial position
    updateScrollButtonVisibility(container);

    // Add the appropriate event listeners
    container.addEventListener('scroll', handleScroll);
    container.addEventListener('touchstart', handleDOMInteraction);
    container.addEventListener('mousedown', handleDOMInteraction);

    // Override the scrollTo method to mark programmatic scrolls
    const originalScrollTo = container.scrollTo;
    container.scrollTo = function (...args) {
      isProgrammaticScroll = true;
      setTimeout(() => {
        isProgrammaticScroll = false;
      }, 500); // Give 500ms for the scroll to complete and events to fire
      return originalScrollTo.apply(this, args);
    };

    return () => {
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('touchstart', handleDOMInteraction);
      container.removeEventListener('mousedown', handleDOMInteraction);
      // Restore original scrollTo
      if (container.scrollTo !== originalScrollTo) {
        container.scrollTo = originalScrollTo;
      }
    };
  }, [
    isMobile,
    messagesRef,
    resetTouchState,
    userTouched,
    updateScrollButtonVisibility,
  ]);

  // Modified version of scrollToBottom function to scroll to the bottom properly
  const scrollToBottom = (forceScroll = false) => {
    // Skip scrolling if disabled, unless forceScroll is true
    if (disableAutoScroll && !forceScroll) return;

    try {
      // Flag to prevent double scrolling attempts
      let scrollAttempted = false;

      // For mobile view
      if (isMobile) {
        const mobileContainer = document.querySelector('[data-rsbs-scroll]');

        if (mobileContainer) {
          // Initial scroll attempt with animation
          mobileContainer.scrollTo({
            top: mobileContainer.scrollHeight,
            behavior: 'smooth',
          });
          scrollAttempted = true;

          // Use just one backup attempt with a delay
          setTimeout(() => {
            if (mobileContainer) {
              // Direct property assignment for more reliable scroll
              mobileContainer.scrollTop = mobileContainer.scrollHeight;
              updateScrollButtonVisibility(mobileContainer);
            }
          }, 300);
        }
      }
      // For desktop view
      else if (messagesRef.current) {
        // Simple scrollTo works fine on desktop
        messagesRef.current.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: 'smooth',
        });
        scrollAttempted = true;

        // Just to be safe, set scroll directly after animation starts
        setTimeout(() => {
          if (messagesRef.current) {
            messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
            updateScrollButtonVisibility(messagesRef.current);
          }
        }, 300);
      }
    } catch (error) {
      console.error('Error scrolling to bottom:', error);
    }
  };

  // Track follow-up questions and auto-scroll when they appear
  const followUpQuestionsRef = useRef<Question[]>([]);
  const followUpObserverRef = useRef<MutationObserver | null>(null);

  // Function to ensure follow-up questions are visible
  const ensureFollowUpQuestionsVisible = useCallback(() => {
    // Skip auto-scrolling if disabled
    if (disableAutoScroll) return;

    // Don't scroll if user has explicitly scrolled away
    if (userTouched) return;

    // Clear touch state to allow auto-scrolling
    hasHadTouchRef.current = false;

    // Clear any existing touch timeout to prevent unexpected resets
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    // First try to locate and scroll to the follow-up questions container
    const followUpsContainer = document.querySelector('.space-y-2');
    if (followUpsContainer) {
      // Try to make follow-ups visible by directly scrolling to them
      try {
        followUpsContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch (e) {
        // Fallback to general scrollToBottom if direct scroll fails
        setTimeout(scrollToBottom, 50);
      }
    } else {
      // If container not found, use regular scroll to bottom
      scrollToBottom();
    }

    // Additional attempt after a delay to ensure visibility
    setTimeout(scrollToBottom, 250);
  }, [userTouched, disableAutoScroll]);

  useEffect(() => {
    // Skip empty arrays
    if (followUpQuestions.length === 0) {
      followUpQuestionsRef.current = [];
      setVisibleQuestions(new Set());
      return;
    }

    // Skip auto-scrolling if disabled
    if (disableAutoScroll) {
      followUpQuestionsRef.current = [...followUpQuestions];
      // Show all questions immediately if auto-scroll is disabled
      const allQuestionIds = new Set(
        followUpQuestions.map((q) => q.title || q.question)
      );
      setVisibleQuestions(allQuestionIds);
      return;
    }

    // Deep check if questions have changed (not just count)
    const getQId = (q: Question) => q.title || q.question;

    // Detect if any truly new question (by id) arrived
    const hasNewQuestions = followUpQuestions.some((newQ) => {
      const newId = getQId(newQ);
      return !followUpQuestionsRef.current.some(
        (oldQ) => getQId(oldQ) === newId
      );
    });

    // Stagger question animations when new questions appear
    if (hasNewQuestions) {
      // Clear previous questions
      setVisibleQuestions(new Set());

      // Add questions with staggered delays
      followUpQuestions.forEach((question, index) => {
        const questionId = question.title || question.question;
        setTimeout(() => {
          setVisibleQuestions((prev) => new Set([...prev, questionId]));

          // Questions animation complete
        }, index * 150); // 150ms delay between each question
      });
    }

    // Always scroll when follow-up questions appear or change unless user has explicitly scrolled
    if (hasNewQuestions) {
      // Disconnect any existing observer
      if (followUpObserverRef.current) {
        followUpObserverRef.current.disconnect();
        followUpObserverRef.current = null;
      }

      // Set up a mutation observer to detect when follow-up questions are fully rendered
      const targetNode = document.querySelector('.space-y-2');
      if (targetNode) {
        // Initial attempt to scroll
        ensureFollowUpQuestionsVisible();

        // Create an observer to watch for DOM changes in the follow-up questions area
        followUpObserverRef.current = new MutationObserver((mutations) => {
          // When DOM changes detected, ensure questions are visible
          ensureFollowUpQuestionsVisible();

          // Disconnect after a certain time to avoid infinite loops
          setTimeout(() => {
            if (followUpObserverRef.current) {
              followUpObserverRef.current.disconnect();
              followUpObserverRef.current = null;
            }
          }, 1000);
        });

        // Start observing
        followUpObserverRef.current.observe(targetNode, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        // Backup plan: try scrolling again after a delay
        setTimeout(ensureFollowUpQuestionsVisible, 500);
      } else {
        // If we can't find the container yet, try a few times with delay
        setTimeout(ensureFollowUpQuestionsVisible, 100);
        setTimeout(ensureFollowUpQuestionsVisible, 300);
        setTimeout(ensureFollowUpQuestionsVisible, 600);
      }
    }

    // Update reference for next comparison
    followUpQuestionsRef.current = [...followUpQuestions];

    // Clean up observer on unmount or when follow-up questions change
    return () => {
      if (followUpObserverRef.current) {
        followUpObserverRef.current.disconnect();
        followUpObserverRef.current = null;
      }
    };
  }, [followUpQuestions, ensureFollowUpQuestionsVisible, disableAutoScroll]);

  // Handler for desktop scroll events
  const handleDesktopScroll = (e: React.UIEvent<HTMLDivElement>) => {
    updateScrollButtonVisibility(e.currentTarget);

    // If this is an actual user scroll (not programmatic), mark as user touched
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    const isNearBottom = distanceFromBottom < 30; // Within 30px of bottom

    if (!isNearBottom) {
      setUserTouched(true);
      hasHadTouchRef.current = true;
      resetTouchState();
    }

    onScroll?.(e);
  };

  // Function to handle resending an interrupted message
  const handleResend = (message: ChatMessage) => {
    if (onResend) {
      onResend(message);
    }
  };

  // Find the last user message before an interrupted assistant message
  const findUserMessageBeforeError = (msgIndex: number): ChatMessage | null => {
    if (msgIndex <= 0) return null;
    const prevIndex = msgIndex - 1;
    if (messages[prevIndex].role === 'user') {
      return messages[prevIndex];
    }
    return null;
  };

  // Measure the chat container height - use prop if provided, measure if not
  useEffect(() => {
    // If containerHeight prop is provided, use it directly
    if (containerHeight !== undefined) {
      setChatContainerHeight(containerHeight);
      return;
    }

    // Otherwise measure it ourselves
    const measureChatContainer = () => {
      if (messagesRef?.current) {
        const height = messagesRef.current.clientHeight;
        setChatContainerHeight(height);
      }
    };

    // Measure on mount and whenever messages/questions change
    measureChatContainer();

    // Set up a resize observer to detect changes in container size
    const resizeObserver = new ResizeObserver(() => {
      measureChatContainer();
    });

    if (messagesRef?.current) {
      resizeObserver.observe(messagesRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [messagesRef, messages, followUpQuestions, containerHeight]);

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

  // Update the message streaming effect to always scroll for user messages
  useEffect(() => {
    // Skip if no messages
    if (messages.length === 0) return;

    // Get the last message
    const lastMessage = messages[messages.length - 1];
    const lastMessageContent = lastMessage?.content || '';
    const lastMessageId = lastMessage?.id || '';

    // Get the current container
    const container = isMobile
      ? document.querySelector('[data-rsbs-scroll]')
      : messagesRef.current;

    // Check if we're currently at the bottom before any updates
    const wasAtBottom = isScrolledToBottom(container);

    // Detect if this is a new message (ID changed)
    const isNewMessage = lastMessageId !== lastMessageIdRef.current;

    // Reset content tracking when message ID changes
    if (isNewMessage) {
      lastMessageContentRef.current = '';
      lastMessageIdRef.current = lastMessageId;
    }

    // Detect if content is streaming (getting longer)
    const isMessageStreaming =
      lastMessage?.role === 'assistant' &&
      lastMessageContent.length > lastMessageContentRef.current.length;

    // Update the reference for next comparison
    lastMessageContentRef.current = lastMessageContent;

    // Check if this is a user message
    const isNewUserMessage = lastMessage?.role === 'user' && isNewMessage;

    // Note: Spacer management moved to separate useEffect to avoid setState during render

    // ALWAYS scroll for user messages, regardless of disableAutoScroll setting
    if (isNewUserMessage) {
      // Force scroll for user messages
      scrollToBottom(true);
    } else if (
      !disableAutoScroll &&
      (needsResponsePlaceholder ||
        (isMessageStreaming && wasAtBottom && !userTouched))
    ) {
      // Normal conditional scrolling for other cases
      scrollToBottom();
    } else {
      // For other message updates, just check if we need to show the scroll button
      setTimeout(() => {
        updateScrollButtonVisibility(container);
      }, 200);
    }
  }, [
    messages,
    needsResponsePlaceholder,
    isMobile,
    userTouched,
    isLoading,
    updateScrollButtonVisibility,
    isScrolledToBottom,
    disableAutoScroll,
  ]);

  // Fix the scrollToBottom click handler
  const handleScrollToBottomClick = () => {
    scrollToBottom(true);
  };

  // Separate effect for spacer management to avoid setState during render
  useEffect(() => {
    if (messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage?.id || '';
    const isNewMessage = lastMessageId !== lastMessageIdRef.current;
    const isNewUserMessage = lastMessage?.role === 'user' && isNewMessage;

    // Remove spacer when new user message is sent
    if (isNewUserMessage) {
      setKeepSpacer(false);
    }
  }, [messages]);

  // Calculate available height for loading message with smooth transitions
  useEffect(() => {
    const calculateAvailableHeight = () => {
      // During keepSpacer period, only recalculate if container height changed
      if (keepSpacer && availableHeight > 0) {
        // Calculate what the spacer height should be with current container height
        const estimatedUserMessageHeight = 20;
        const expectedSpacerHeight = chatContainerHeight - estimatedUserMessageHeight;
        
        // If the expected height matches current height (within 10px tolerance), skip recalculation
        if (Math.abs(expectedSpacerHeight - availableHeight) < 10) {
          console.log(`🔒 SPACER LOCKED: keeping height=${availableHeight}px (container unchanged)`);
          return;
        }
        
        console.log(`🔄 SPACER RECALIBRATING: container height changed from ${availableHeight + 60}px to ${chatContainerHeight}px`);
      }
      // Calculate spacer height to position user message at the very top of viewport
      // Use smaller reserved space so spacer is bigger and pushes content higher
      const estimatedUserMessageHeight = 20; // Reduced to make spacer bigger
      
      // Spacer height = full container minus minimal space for user message
      // Bigger spacer pushes the user message higher to the top
      const spacerHeight = chatContainerHeight - estimatedUserMessageHeight;

      // With stack layout, we don't subtract stream height from spacer
      // The message will grow above the fixed spacer
      let streamHeight = 0;
      const hasStreamRef = !!streamMessageRef.current;
      const hasMessages = messages.length > 0;
      const lastIsAssistant = messages[messages.length - 1]?.role === 'assistant';
      
      // Still track stream height for logging purposes
      if (hasStreamRef && hasMessages && lastIsAssistant) {
        streamHeight = streamMessageRef.current.offsetHeight;
        lastKnownStreamHeightRef.current = streamHeight;
        setStreamMessageHeight(streamHeight);
      } 
      else if (!hasStreamRef && hasMessages && lastIsAssistant && lastKnownStreamHeightRef.current > 0) {
        streamHeight = lastKnownStreamHeightRef.current;
        setStreamMessageHeight(streamHeight);
        console.log(`🔧 Using stored stream height: ${streamHeight}px (ref is gone) - streaming=${isStreaming} keepSpacer=${keepSpacer}`);
      }
      else {
        if (!lastIsAssistant) {
          lastKnownStreamHeightRef.current = 0;
          console.log(`🔄 Resetting stored stream height - new message cycle`);
        }
        setStreamMessageHeight(0);
      }

      // Track questions height for logging, but don't subtract from spacer
      let questionsHeight = 0;
      if (questionsRef.current && showFollowUps) {
        questionsHeight = questionsRef.current.offsetHeight;
        setQuestionsHeight(questionsHeight);
      } else {
        setQuestionsHeight(0);
      }

      // With stack layout, user message height is already accounted for in spacer calculation

      // Ensure minimum spacer height
      const minHeight = Math.max(50, chatContainerHeight * 0.1);
      let calculatedHeight = Math.max(spacerHeight, minHeight);

      // When keepSpacer is true (after completion), check if content actually needs the spacer
      let actualContentHeight = 0;
      if (keepSpacer && messagesRef.current) {
        // Calculate actual content height (excluding spacer)
        Array.from(messagesRef.current.children).forEach((child) => {
          const element = child as HTMLElement;
          if (element !== spacerRef.current) {
            actualContentHeight += element.offsetHeight;
          }
        });

        // If content fits within container with some margin, minimize spacer to prevent extra scroll space
        const marginBuffer = 50; // Allow some breathing room
        const availableSpace = chatContainerHeight - marginBuffer;
        
        if (actualContentHeight <= availableSpace) {
          calculatedHeight = 0; // Remove spacer completely when content fits comfortably
        }
      }

      const finalHeight = calculatedHeight;

      // Smart logging - only log when values change significantly
      const currentLog = {
        chatContainerHeight,
        isStreaming,
        keepSpacer,
        showFollowUps,
        followUpQuestionsCount: followUpQuestions.length,
        streamHeight,
        questionsHeight,
        actualContentHeight,
        finalHeight,
        availableHeight
      };

      const shouldLog = !lastLogRef.current || 
        Object.keys(currentLog).some(key => {
          const current = currentLog[key as keyof typeof currentLog];
          const previous = lastLogRef.current?.[key];
          return Math.abs(Number(current) - Number(previous)) > 5 || current !== previous;
        });

      if (shouldLog) {
        const diff = finalHeight - availableHeight;
        console.log(`🔧 SPACER CHANGED: container=${chatContainerHeight} streaming=${isStreaming} keepSpacer=${keepSpacer} showFollowUps=${showFollowUps}`);
        console.log(`   Questions: count=${followUpQuestions.length} height=${questionsHeight}px`);
        console.log(`   Stream: height=${streamHeight}px | Content: ${actualContentHeight}px`);
        console.log(`   Spacer: ${availableHeight}px → ${finalHeight}px (${diff > 0 ? '+' : ''}${diff}px)`);
        lastLogRef.current = currentLog;
      }

      // Track viewport position changes to detect jumping
      if (finalHeight !== availableHeight && messagesRef.current) {
        const container = messagesRef.current;
        const beforeScrollTop = container.scrollTop;
        const beforeScrollHeight = container.scrollHeight;

        // Set new height
        setAvailableHeight(finalHeight);

        // Check for viewport jump after a short delay
        setTimeout(() => {
          const afterScrollTop = container.scrollTop;
          const afterScrollHeight = container.scrollHeight;
          const scrollDiff = afterScrollTop - beforeScrollTop;
          const heightDiff = afterScrollHeight - beforeScrollHeight;

          if (Math.abs(scrollDiff) > 5) {
            console.warn('⚠️ [Viewport Jump] Detected:', {
              scrollTopChange: scrollDiff,
              scrollHeightChange: heightDiff,
              beforePosition: beforeScrollTop,
              afterPosition: afterScrollTop,
            });
          }
        }, 100);
      } else {
        // Set height for smooth animation
        setAvailableHeight(finalHeight);
      }
    };

    // Calculate on initial render and when dependencies change
    calculateAvailableHeight();

    // Set up a resize observer to recalculate on DOM changes
    const resizeObserver = new ResizeObserver(() => {
      calculateAvailableHeight();
    });

    // Observe elements that affect height
    if (messagesRef.current) {
      resizeObserver.observe(messagesRef.current);
    }
    if (streamMessageRef.current) {
      resizeObserver.observe(streamMessageRef.current);
    }
    if (questionsRef.current) {
      resizeObserver.observe(questionsRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    chatContainerHeight,
    keepSpacer,
    isStreaming,
    showFollowUps,
    messages.length,
    followUpQuestions.length,
    isStreaming ? messages[messages.length - 1]?.content : null,
  ]);

  // Add touch animation and scrollbar styles
  useEffect(() => {
    const styleEl = document.createElement('style');

    const styles = `
      ${
        isMobile
          ? `
        @media (pointer: coarse) {
          .follow-up-question-btn:active {
            transform: scale(0.99) translateY(-2px);
            box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            transition: transform 75ms ease-out, box-shadow 100ms ease-out;
          }
          
          .follow-up-question-btn:active svg {
            transform: translateX(6px);
            transition: transform 90ms ease-out;
          }
          
          @media (prefers-reduced-motion: reduce) {
            .follow-up-question-btn:active {
              transform: none;
              box-shadow: 0 4px 16px rgba(0,0,0,0.3);
            }
            
            .follow-up-question-btn:active svg {
              transform: none;
            }
          }
        }
      `
          : ''
      }
    `;

    styleEl.innerHTML = styles;
    document.head.appendChild(styleEl);

    return () => {
      document.head.removeChild(styleEl);
    };
  }, [isMobile]);

  // Handle question selection with additional cleanup and debounce
  const handleQuestionSelect = (question: Question) => {
    // Get unique identifier for this question
    const questionId = question.title || question.question;

    // Prevent double-clicking/tapping the same question
    if (isProcessingClickRef.current || clickedQuestions.has(questionId)) {
      return;
    }

    // Immediately mark as processing to prevent double clicks
    isProcessingClickRef.current = true;

    // Add to clicked questions set
    setClickedQuestions((prev) => {
      const newSet = new Set(prev);
      newSet.add(questionId);
      return newSet;
    });

    // Clear any previous timeout if it exists
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }

    // Set a timeout to reset the processing flag after a delay
    // This prevents accidental double-clicks but allows clicking different questions
    clickTimeoutRef.current = window.setTimeout(() => {
      isProcessingClickRef.current = false;
    }, 1000); // 1 second debounce

    // Process the click by calling onQuestionClick immediately.
    // This ensures the parent component is notified of the selection promptly.
    onQuestionClick?.(question);

    // After processing the click, handle UI changes.
    // If it's not a "generate" question and we are currently streaming,
    // fade out the question container for immediate visual feedback.
    // The parent component will handle updating/clearing followUpQuestions
    // as part of the new message cycle initiated by onQuestionClick.
    if (!question.generate && isStreaming) {
      const questionContainer = questionsRef.current;
      if (questionContainer) {
        // Apply immediate visual feedback by fading out
        questionContainer.style.opacity = '0';
        questionContainer.style.transition = 'opacity 0.2s ease-out';
      }
    }
  };

  // Initialize loading ref on mount
  useEffect(() => {
    initialLoadingRef.current = isLoading;
  }, []); // Only run once on mount

  // Effect to track loading state changes and manage spacer
  useEffect(() => {
    // If we just finished loading (response completed), keep the spacer visible
    const wasLoading = initialLoadingRef.current;

    if (wasLoading && !isLoading && messages.length > 0) {
      // Response just completed - keep spacer until next user message
      setKeepSpacer(true);
    }

    // Update the loading state ref
    initialLoadingRef.current = isLoading;
  }, [isLoading, messages.length]);

  // Effect to track streaming state changes
  useEffect(() => {
    // If we just finished streaming, make sure to check if we need to clear any stale UI
    const isCurrentlyStreaming =
      isLoading &&
      messages.length > 0 &&
      messages[messages.length - 1].role === 'assistant';

    // Detect when streaming ends
    if (wasStreamingRef.current && !isCurrentlyStreaming) {
      // Streaming just ended - if we have any pending questions in the UI
      // that weren't properly cleared, fade them out
      if (questionsRef.current && followUpQuestions.length === 0) {
        questionsRef.current.style.opacity = '0';
      }
    }

    // Update ref for next check
    wasStreamingRef.current = isCurrentlyStreaming;
  }, [isLoading, messages, followUpQuestions]);

  // Reset clicked questions when messages change
  useEffect(() => {
    // When new messages arrive, we can reset the clicked questions
    // as the previous questions have already been processed
    setClickedQuestions(new Set());
  }, [messages.length]);

  // Log follow-up questions changes to debug spacer issues
  useEffect(() => {
    if (followUpQuestions.length > 0) {
      console.log('❓ FOLLOW-UP QUESTIONS APPEARED:', {
        count: followUpQuestions.length,
        showFollowUps,
        keepSpacer,
        isStreaming
      });
    }
  }, [followUpQuestions.length, showFollowUps]);

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      ref={chatViewRef}
    >
      <div
        ref={messagesRef}
        onScroll={handleDesktopScroll}
        onTouchStart={handleReactTouchStart}
        className={`flex-1 scroll-smooth ${isMobile ? 'overflow-y-visible' : 'overflow-y-auto'}`}
      >
        {messages.length === 0 && !part && !groups && !isMobile && (
          <div className="h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <p className="text-lg mb-2">
                Welcome to the Musculoskeletal Assistant
              </p>
              <p className="text-sm">Select a body part to start exploring</p>
            </div>
          </div>
        )}

        {/* Regular messages container */}
        <div className="space-y-4 min-h-full relative flex flex-col">
          {/* Prior messages (not part of current turn) */}
          {messages.map((msg, index) => {
            // Skip current turn messages as they'll be rendered differently
            if (isCurrentTurn(index)) return null;

            return (
              <div key={msg.id}>
                <div
                  className={`px-4 py-2 rounded-lg ${
                    msg.role === 'user'
                      ? 'bg-indigo-600 ml-8'
                      : 'bg-gray-800 mr-4'
                  } ${msg.hasError ? 'border border-red-400' : ''}`}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-pre:leading-none prose-strong:text-white prose-strong:font-semibold">
                      <ReactMarkdown
                        className="text-base leading-relaxed"
                        components={{
                          ul: ({ children }) => (
                            <ul className="list-none">
                              {children as React.ReactNode}
                            </ul>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                      {msg.hasError && (
                        <div>
                          <div className="mt-2 text-sm text-red-400">
                            Note: This message was interrupted due to connection
                            issues.
                          </div>
                          {onResend && (
                            <div className="mt-3">
                              <button
                                onClick={() => {
                                  const userMsg =
                                    findUserMessageBeforeError(index);
                                  if (userMsg) {
                                    handleResend(userMsg);
                                  }
                                }}
                                className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 text-white text-sm rounded-md flex items-center gap-1 transition-colors duration-200"
                                disabled={isLoading}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-4 w-4"
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                                {isLoading ? 'Sending...' : 'Try Again'}
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-base break-words whitespace-pre-wrap">{msg.content}</div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current turn messages are now rendered in the stack layout below */}

          {/* Initial follow-up questions (before any conversation) */}
          {showFollowUps && !isLoading && !keepSpacer && (
            <div
              ref={questionsRef}
              className="mt-[12px]"
              style={{
                transition: 'opacity 0.2s ease-out',
              }}
            >
              <div className="space-y-[10px]">
                {followUpQuestions.map((question, index) => {
                  const questionId = question.title || question.question;
                  const isClicked = clickedQuestions.has(questionId);
                  const isVisible = visibleQuestions.has(questionId);

                  return (
                    <button
                      key={questionId}
                      onClick={() => handleQuestionSelect(question)}
                      aria-label={questionId}
                      data-quick-reply
                      role="button"
                      disabled={isClicked}
                      className={`follow-up-question-btn w-full min-h-[48px] text-left px-4 py-3 pb-4 rounded-lg cursor-pointer
                        bg-[rgba(99,91,255,0.12)] border border-[rgba(99,91,255,0.35)] text-[#c8cbff] font-medium
                        hover:border-[rgba(99,91,255,0.5)] focus:border-[rgba(99,91,255,0.5)] active:border-[rgba(99,91,255,0.5)]
                        hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.25)] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
                        hover:bg-gradient-to-r hover:from-indigo-900/80 hover:to-indigo-800/80
                        hover:-translate-y-[2px] active:-translate-y-[2px] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
                        group transition-all duration-300 ease-out
                        ${prefersReducedMotion ? '' : 'motion-safe:hover:-translate-y-[2px] motion-safe:active:scale-[0.99]'}
                        ${isClicked ? 'opacity-50 pointer-events-none' : ''}
                        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                      style={{
                        transitionDelay: isVisible ? `${index * 50}ms` : '0ms',
                      }}
                    >
                      <div className="flex items-start">
                        {/* Arrow icon */}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className={`mr-2 text-[#635bff] transform transition-transform duration-[90ms] mt-[2px] ${prefersReducedMotion ? '' : 'group-hover:translate-x-[6px]'}`}
                        >
                          <path
                            d="M7 17L17 7M17 7H7M17 7V17"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>

                        <div className="flex-1">
                          <div
                            className={`${!question.title ? 'text-[#c8cbff]' : 'font-medium text-[#c8cbff] capitalize'}`}
                          >
                            {question.title
                              ? question.title.toLowerCase()
                              : question.question}
                          </div>
                          {question.meta && (
                            <div className="text-sm text-[#c8cbff] opacity-75 mt-1">
                              {question.meta}
                            </div>
                          )}
                          {question.title && !question.meta && (
                            <div className="text-sm text-gray-400">
                              {question.question}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 
            Loading message spacer - stack-based layout where content grows above fixed spacer
            - Fixed spacer height pushes message to top
            - Message content grows above spacer without affecting spacer height
          */}
          {(isLoading && (needsResponsePlaceholder || isStreaming)) ||
          keepSpacer ? (
            <div
              className="relative"
            >
              {/* Fixed spacer at bottom of stack */}
              <div
                ref={spacerRef}
                className="block w-full transition-all duration-300 ease-out"
                style={{
                  height: `${availableHeight}px`,
                  borderRadius: '8px',
                }}
              />
              
              {/* Message content positioned at top of stack */}
              <div
                className="absolute top-0 left-0 right-0 flex flex-col"
                style={{
                  height: `${availableHeight}px`,
                }}
              >
                {/* User message at top of stack */}
                {messages.map((msg, index) => {
                  if (!isLastUserMessage(index)) return null;

                  return (
                    <div key={`current-user-${msg.id}`} className="flex-none mb-4">
                      <div className="px-4 py-2 rounded-lg bg-indigo-600 ml-8">
                        <div className="text-base break-words whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  );
                })}

                {/* Assistant streaming message in stack */}
                {(isStreaming || keepSpacer) &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === 'assistant' && (
                    <div
                      key={`streaming-${messages[messages.length - 1].id}`}
                      className="flex-none"
                      ref={streamMessageRef}
                    >
                      <div className="px-4 py-2 rounded-lg bg-gray-800 mr-4">
                        <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-pre:leading-none prose-strong:text-white prose-strong:font-semibold">
                          <ReactMarkdown
                            className="text-base leading-relaxed"
                            components={{
                              ul: ({ children }) => (
                                <ul className="list-none">
                                  {children as React.ReactNode}
                                </ul>
                              ),
                            }}
                          >
                            {messages[messages.length - 1].content}
                          </ReactMarkdown>

                          {/* Show error message if stream error occurred */}
                          {streamError && (
                            <div className="mt-2">
                              <div className="text-sm text-red-400">
                                Note: This message was interrupted due to
                                connection issues.
                              </div>
                              {onResend && (
                                <div className="mt-3">
                                  <button
                                    onClick={() => {
                                      const userMsg = findUserMessageBeforeError(
                                        messages.length - 1
                                      );
                                      if (userMsg) {
                                        handleResend(userMsg);
                                      }
                                    }}
                                    className="px-3 py-1 bg-indigo-700 hover:bg-indigo-600 text-white text-sm rounded-md flex items-center gap-1 transition-colors duration-200"
                                    disabled={isLoading}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-4 w-4"
                                      viewBox="0 0 20 20"
                                      fill="currentColor"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                    {isLoading ? 'Sending...' : 'Try Again'}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                {/* Follow-up questions in stack (during active conversation) */}
                {showFollowUps && (isLoading || keepSpacer) && (
                  <div
                    ref={questionsRef}
                    className="mt-[12px]"
                    style={{
                      transition: 'opacity 0.2s ease-out',
                    }}
                  >
                    <div className="space-y-[10px]">
                      {followUpQuestions.map((question, index) => {
                        const questionId = question.title || question.question;
                        const isClicked = clickedQuestions.has(questionId);
                        const isVisible = visibleQuestions.has(questionId);

                        return (
                          <button
                            key={questionId}
                            onClick={() => handleQuestionSelect(question)}
                            aria-label={questionId}
                            data-quick-reply
                            role="button"
                            disabled={isClicked}
                            className={`follow-up-question-btn w-full min-h-[48px] text-left px-4 py-3 pb-4 rounded-lg cursor-pointer
                              bg-[rgba(99,91,255,0.12)] border border-[rgba(99,91,255,0.35)] text-[#c8cbff] font-medium
                              hover:border-[rgba(99,91,255,0.5)] focus:border-[rgba(99,91,255,0.5)] active:border-[rgba(99,91,255,0.5)]
                              hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.25)] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
                              hover:bg-gradient-to-r hover:from-indigo-900/80 hover:to-indigo-800/80
                              hover:-translate-y-[2px] active:-translate-y-[2px] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
                              group transition-all duration-300 ease-out
                              ${prefersReducedMotion ? '' : 'motion-safe:hover:-translate-y-[2px] motion-safe:active:scale-[0.99]'}
                              ${isClicked ? 'opacity-50 pointer-events-none' : ''}
                              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                            style={{
                              transitionDelay: isVisible ? `${index * 50}ms` : '0ms',
                            }}
                          >
                            <div className="flex items-start">
                              {/* Arrow icon */}
                              <svg
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                                className={`mr-2 text-[#635bff] transform transition-transform duration-[90ms] mt-[2px] ${prefersReducedMotion ? '' : 'group-hover:translate-x-[6px]'}`}
                              >
                                <path
                                  d="M7 17L17 7M17 7H7M17 7V17"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>

                              <div className="flex-1">
                                <div
                                  className={`${!question.title ? 'text-[#c8cbff]' : 'font-medium text-[#c8cbff] capitalize'}`}
                                >
                                  {question.title
                                    ? question.title.toLowerCase()
                                    : question.question}
                                </div>
                                {question.meta && (
                                  <div className="text-sm text-[#c8cbff] opacity-75 mt-1">
                                    {question.meta}
                                  </div>
                                )}
                                {question.title && !question.meta && (
                                  <div className="text-sm text-gray-400">
                                    {question.question}
                                  </div>
                                )}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Loading message for when waiting for response */}
                <LoadingMessage
                  containerHeight={availableHeight}
                  visible={
                    needsResponsePlaceholder && !isStreaming
                  }
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Scroll to bottom button with fade animation */}
      <div
        className={`fixed left-1/2 bottom-16 transform -translate-x-1/2 z-50 transition-opacity duration-300 ease-in-out ${
          showScrollButton ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <button
          onClick={handleScrollToBottomClick}
          className="scroll-to-bottom-btn flex items-center justify-center w-10 h-10 bg-gray-600/70 hover:bg-gray-500/80 rounded-full shadow-md transition-all duration-200"
          aria-label="Scroll to bottom"
          disabled={!showScrollButton}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M7 10l5 5 5-5"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
