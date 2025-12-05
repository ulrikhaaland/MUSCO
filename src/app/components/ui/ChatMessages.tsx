import { ChatMessage, Question } from '@/app/types';
import { Exercise } from '@/app/types/program';
import { RefObject, useEffect, useState, useRef, useCallback } from 'react';
import { useApp } from '@/app/context/AppContext';
import { LoadingMessage } from './LoadingMessage';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { AnatomyPart } from '@/app/types/human';
import ExerciseChatCard from './ExerciseChatCard';
import { MessageWithExercises } from './MessageWithExercises';
import { SUBSCRIPTIONS_ENABLED } from '@/app/lib/featureFlags';

// Follow-up Questions Component
/**
 * Strip {{Name}} markers from text for display (used in follow-up buttons)
 */
function stripBodyPartMarkers(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, '$1');
}

interface FollowUpQuestionsProps {
  questions: Question[];
  visibleQuestions: Set<string>;
  prefersReducedMotion: boolean;
  onQuestionClick: (question: Question) => void;
}

function FollowUpQuestions({
  questions,
  visibleQuestions,
  prefersReducedMotion,
  onQuestionClick,
}: FollowUpQuestionsProps) {
  return (
    <div className="space-y-[10px]">
      {questions.map((question, index) => {
        const questionId = question.title || question.question;
        const isVisible = visibleQuestions.has(questionId);

        return (
          <button
            key={questionId}
            onClick={() => onQuestionClick(question)}
            aria-label={questionId}
            data-quick-reply
            role="button"
            className={`follow-up-question-btn w-full min-h-[48px] text-left px-4 py-3 pb-4 rounded-lg cursor-pointer
              bg-brand-soft border border-brand-border text-brand-text font-medium
              hover:border-brand/50 focus:border-brand/50 active:border-brand/50
              hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.25)] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
              hover:bg-gradient-to-r hover:from-indigo-900/80 hover:to-indigo-800/80
              hover:-translate-y-[2px] active:-translate-y-[2px] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
              group transition-all duration-300 ease-out
              ${prefersReducedMotion ? '' : 'motion-safe:hover:-translate-y-[2px] motion-safe:active:scale-[0.99]'}
              ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
            style={{
              transitionDelay: isVisible ? `${index * 50}ms` : '0ms',
            }}
          >
            <div className="flex items-start">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className={`mr-2 text-brand transform transition-transform duration-[90ms] mt-[2px] ${prefersReducedMotion ? '' : 'group-hover:translate-x-[6px]'}`}
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
                  className={`${!question.title ? 'text-brand-text' : 'font-medium text-brand-text capitalize'}`}
                >
                  {question.title
                    ? stripBodyPartMarkers(question.title.toLowerCase())
                    : stripBodyPartMarkers(question.question)}
                </div>
                {question.meta && (
                  <div className="text-sm text-brand-text opacity-75 mt-1">
                    {stripBodyPartMarkers(question.meta)}
                  </div>
                )}
                {question.title && !question.meta && (
                  <div className="text-sm text-gray-400">
                    {stripBodyPartMarkers(question.question)}
                  </div>
                )}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface ChatMessagesProps {
  messages: ChatMessage[];
  messagesRef: RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
  streamError?: Error | null;
  rateLimited?: boolean;
  onSubscribeClick?: () => void;
  onLoginClick?: () => void;
  isLoggedIn?: boolean;
  isSubscriber?: boolean;
  followUpQuestions?: Question[];
  exerciseResults?: Exercise[];
  inlineExercises?: Map<string, Exercise>;
  onQuestionClick?: (question: Question) => void;
  onVideoClick?: (exercise: Exercise) => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  loadingVideoExercise?: string | null;

  part?: AnatomyPart;
  groups?: BodyPartGroup[];
  isMobile?: boolean;
  onResend?: (message: ChatMessage) => void;
  disableAutoScroll?: boolean;
  containerHeight?: number;
  // Body part click handler for selecting on 3D model (includes group for context)
  onBodyPartClick?: (part: AnatomyPart, group: BodyPartGroup) => void;
  // Group click handler for selecting just the group
  onGroupClick?: (group: BodyPartGroup) => void;
  // Increment to trigger scroll to bottom (used when loading chat from history)
  scrollTrigger?: number;
}

export function ChatMessages({
  messages,
  messagesRef,
  isLoading,
  streamError,
  rateLimited,
  onSubscribeClick,
  onLoginClick,
  isLoggedIn,
  isSubscriber,
  followUpQuestions = [],
  exerciseResults = [],
  inlineExercises = new Map(),
  onQuestionClick,
  onVideoClick,
  onScroll,
  loadingVideoExercise,

  part,
  groups,
  isMobile = false,
  onResend,
  disableAutoScroll = true,
  containerHeight,
  onBodyPartClick,
  onGroupClick,
  scrollTrigger = 0,
}: ChatMessagesProps) {
  const { saveViewerState } = useApp();
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const prevScrollTriggerRef = useRef(scrollTrigger);

  const [availableHeight, setAvailableHeight] = useState(0);
  const [chatContainerHeight, setChatContainerHeight] = useState(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  const [keepSpacer, setKeepSpacer] = useState(false);

  // Global state for selected exercise (survives component remounts)
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

  const [visibleQuestions, setVisibleQuestions] = useState<Set<string>>(
    new Set()
  );
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageContentRef = useRef<string>('');
  const lastMessageIdRef = useRef<string>('');
  const hasHadTouchRef = useRef<boolean>(false);
  const _initialLoadingRef = useRef<boolean>(true);

  const chatViewRef = useRef<HTMLDivElement>(null);
  const streamMessageRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const wasStreamingRef = useRef<boolean>(false);
  const clickTimeoutRef = useRef<number | null>(null);
  const isProcessingClickRef = useRef<boolean>(false);

  const lastKnownStreamHeightRef = useRef<number>(0);
  const stackContentRef = useRef<HTMLDivElement>(null);

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
    [resetTouchState]
  );

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, []);

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

  const getScrollContainer = useCallback((): Element | null => {
    if (isMobile) {
      const el = document.querySelector('[data-rsbs-scroll]');
      return el ?? (messagesRef.current as unknown as Element | null);
    }
    return messagesRef.current as unknown as Element | null;
  }, [isMobile, messagesRef]);

  // Set up scroll event listeners and handle initial scroll position
  useEffect(() => {
    // Get the right container based on mobile or desktop
    const container = getScrollContainer();

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
  }, [getScrollContainer, resetTouchState, updateScrollButtonVisibility, handleDOMInteraction]);

  // Modified version of scrollToBottom function to scroll to the bottom properly
  const scrollToBottom = useCallback((forceScroll = false) => {
    // Skip scrolling if disabled, unless forceScroll is true
    if (disableAutoScroll && !forceScroll) return;

    try {
      const container = getScrollContainer();

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
  }, [disableAutoScroll, getScrollContainer, updateScrollButtonVisibility]);

  // Scroll to bottom when scrollTrigger changes (e.g., when loading chat from history)
  useEffect(() => {
    if (scrollTrigger !== prevScrollTriggerRef.current) {
      prevScrollTriggerRef.current = scrollTrigger;
      // Reset user touched state and force scroll
      setUserTouched(false);
      // Small delay to let messages render first
      setTimeout(() => {
        scrollToBottom(true);
      }, 100);
    }
  }, [scrollTrigger, scrollToBottom]);

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
      } catch {
        // Fallback to general scrollToBottom if direct scroll fails
        setTimeout(scrollToBottom, 50);
      }
    } else {
      // If container not found, use regular scroll to bottom
      scrollToBottom();
    }

    // Additional attempt after a delay to ensure visibility
    setTimeout(scrollToBottom, 250);
  }, [userTouched, disableAutoScroll, scrollToBottom]);

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

    // Show new questions immediately
    if (hasNewQuestions) {
      const prevIds = new Set(followUpQuestionsRef.current.map((q) => getQId(q)));
      const newQuestions = followUpQuestions.filter((q) => !prevIds.has(getQId(q)));

      setVisibleQuestions((prev) => {
        const updated = new Set(prev);
        newQuestions.forEach((question) => {
        const questionId = question.title || question.question;
          updated.add(questionId);
        });
        return updated;
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
        followUpObserverRef.current = new MutationObserver(() => {
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
    getScrollContainer,
    userTouched,
    isLoading,
    updateScrollButtonVisibility,
    isScrolledToBottom,
    disableAutoScroll,
    isMobile,
    messagesRef,
    scrollToBottom,
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

    // Remove spacer when new user message is sent, but only if auto-scroll is enabled
    // For desktop (disableAutoScroll=true), keep the spacer to prevent viewport shifts
    if (isNewUserMessage && !disableAutoScroll) {
      setKeepSpacer(false);
    }
  }, [messages, disableAutoScroll]);

  // Calculate available height for loading message with smooth transitions
  useEffect(() => {
    const calculateAvailableHeight = () => {
      // During keepSpacer period, only recalculate if container height changed
      if (keepSpacer && availableHeight > 0) {
        // Calculate what the spacer height should be with current container height
        const estimatedUserMessageHeight = 20;
        const expectedSpacerHeight =
          chatContainerHeight - estimatedUserMessageHeight;

        // If the expected height matches current height (within 10px tolerance), skip recalculation
        if (Math.abs(expectedSpacerHeight - availableHeight) < 10) {
          return;
        }
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
      const lastIsAssistant =
        messages[messages.length - 1]?.role === 'assistant';

      // Track stream height for reference
      if (hasStreamRef && hasMessages && lastIsAssistant) {
        streamHeight = streamMessageRef.current.offsetHeight;
        lastKnownStreamHeightRef.current = streamHeight;
      } else if (
        !hasStreamRef &&
        hasMessages &&
        lastIsAssistant &&
        lastKnownStreamHeightRef.current > 0
      ) {
        streamHeight = lastKnownStreamHeightRef.current;
      } else {
        if (!lastIsAssistant) {
          lastKnownStreamHeightRef.current = 0;
        }
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

        // Different behavior for mobile vs desktop
        if (!disableAutoScroll) {
          // MOBILE: Fit spacer to content to save space
          const marginBuffer = 100;
          const contentBasedHeight = actualContentHeight + marginBuffer;
          
          if (contentBasedHeight < calculatedHeight) {
            calculatedHeight = contentBasedHeight;
          }
        }
        // DESKTOP (disableAutoScroll=true): Keep original spacer height
        // DO NOT shrink the spacer, as this causes viewport shifts
        // The spacer must maintain its original height to keep messages at the same position
      }

      const finalHeight = calculatedHeight;

      // Set height for smooth animation
      setAvailableHeight(finalHeight);
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
    messages,
    followUpQuestions.length,
    availableHeight,
    messagesRef,
    disableAutoScroll,
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
    // Prevent double-clicking/tapping (debounce protection)
    if (isProcessingClickRef.current) {
      return;
    }

    // Immediately mark as processing to prevent double clicks
    isProcessingClickRef.current = true;

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

  // Track the previous loading state to detect completion
  const prevLoadingRef = useRef(isLoading);

  // Effect to track loading state changes and manage spacer
  useEffect(() => {
    // Detect when loading transitions from true to false (response completed)
    const wasLoading = prevLoadingRef.current;
    const justFinishedLoading = wasLoading && !isLoading;

    console.log('[ChatMessages] Loading state change:', {
      wasLoading,
      isLoading,
      messagesLength: messages.length,
      justFinishedLoading,
      willSetKeepSpacer: justFinishedLoading && messages.length > 0,
    });

    if (justFinishedLoading && messages.length > 0) {
      // Response just completed - keep spacer until next user message
      setKeepSpacer(true);
    }

    // Always update the ref at the end
    prevLoadingRef.current = isLoading;
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

  // Effect to measure actual content height and grow spacer if needed
  useEffect(() => {
    const measureContentHeight = () => {
      if (!stackContentRef.current) return;

      const contentElement = stackContentRef.current;

      // Measure the actual visible content by summing up child elements
      let totalContentHeight = 0;
      Array.from(contentElement.children).forEach((child) => {
        const element = child as HTMLElement;
        totalContentHeight += element.offsetHeight;
      });

      // Only grow spacer if content significantly exceeds current spacer height
      // Use a threshold to avoid constant micro-adjustments
      const threshold = 50; // Only grow if content is 50px+ larger than spacer
      const overage = totalContentHeight - availableHeight;

      if (overage > threshold) {
        // Only apply reduction if content has actually outgrown the original container
        // This prevents unnecessary reduction when content fits within intended bounds
        const offsetReduction =
          totalContentHeight > chatContainerHeight ? 150 : 0;
        const newSpacerHeight = Math.max(
          totalContentHeight - offsetReduction,
          availableHeight
        );
        setAvailableHeight(newSpacerHeight);
      }
    };

    // Measure on content changes
    measureContentHeight();

    // Set up a resize observer to detect content changes
    const resizeObserver = new ResizeObserver(() => {
      measureContentHeight();
    });

    if (stackContentRef.current) {
      resizeObserver.observe(stackContentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [
    availableHeight,
    isStreaming,
    messages,
    followUpQuestions.length,
    chatContainerHeight,
  ]);

  return (
    <div
      className="flex-1 flex flex-col overflow-hidden relative"
      ref={chatViewRef}
    >
      <div
        ref={messagesRef}
        onScroll={handleDesktopScroll}
        onTouchStart={handleReactTouchStart}
        className={`flex-1 scroll-smooth chat-scrollbar ${isMobile ? 'overflow-y-visible' : 'overflow-y-auto pr-2'}`}
      >
        {/* Rate limit is handled by a fullscreen overlay to preserve page state */}

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
                    <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-pre:leading-none prose-strong:text-indigo-300 prose-strong:font-bold">
                      <MessageWithExercises
                        key={`msg-${msg.id}`}
                        content={msg.content}
                        exercises={inlineExercises}
                        onVideoClick={onVideoClick}
                        loadingVideoExercise={loadingVideoExercise}
                        className="text-base leading-relaxed"
                        selectedExercise={selectedExercise}
                        onExerciseSelect={setSelectedExercise}
                        onBodyPartClick={onBodyPartClick}
                        onGroupClick={onGroupClick}
                      />
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
                    <div className="text-base break-words whitespace-pre-wrap">
                      {msg.content}
                    </div>
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
              {/* Exercise results */}
              {exerciseResults.length > 0 && onVideoClick && (
                <div className="mb-4 space-y-2">
                  {exerciseResults.map((exercise) => (
                    <ExerciseChatCard
                      key={exercise.id || exercise.name}
                      exercise={exercise}
                      onVideoClick={onVideoClick}
                      loadingVideoExercise={loadingVideoExercise}
                    />
                  ))}
                </div>
              )}

              <FollowUpQuestions
                questions={followUpQuestions}
                visibleQuestions={visibleQuestions}
                prefersReducedMotion={prefersReducedMotion}
                onQuestionClick={handleQuestionSelect}
              />
            </div>
          )}

          {/* 
            Loading message spacer - stack-based layout where content grows above fixed spacer
            - Fixed spacer height pushes message to top
            - Message content grows above spacer without affecting spacer height
          */}
          {(isLoading && (needsResponsePlaceholder || isStreaming)) ||
          keepSpacer ? (
            <div className="relative">
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
                ref={stackContentRef}
                className="absolute top-0 left-0 right-0 flex flex-col"
                style={{
                  minHeight: `${availableHeight}px`,
                }}
              >
                {/* User message at top of stack */}
                {messages.map((msg, index) => {
                  if (!isLastUserMessage(index)) return null;

                  return (
                    <div
                      key={`current-user-${msg.id}`}
                      className="flex-none mb-4"
                    >
                      <div className="px-4 py-2 rounded-lg bg-indigo-600 ml-8">
                        <div className="text-base break-words whitespace-pre-wrap">
                          {msg.content}
                        </div>
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
                        <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-pre:leading-none prose-strong:text-indigo-300 prose-strong:font-bold">
                          <MessageWithExercises
                            key={`msg-${messages[messages.length - 1].id}`}
                            content={messages[messages.length - 1].content}
                            exercises={inlineExercises}
                            onVideoClick={onVideoClick}
                            loadingVideoExercise={loadingVideoExercise}
                            className="text-base leading-relaxed"
                            selectedExercise={selectedExercise}
                            onExerciseSelect={setSelectedExercise}
                            onBodyPartClick={onBodyPartClick}
                            onGroupClick={onGroupClick}
                          />

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
                                      const userMsg =
                                        findUserMessageBeforeError(
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
                    <FollowUpQuestions
                      questions={followUpQuestions}
                      visibleQuestions={visibleQuestions}
                      prefersReducedMotion={prefersReducedMotion}
                      onQuestionClick={handleQuestionSelect}
                    />
                  </div>
                )}

                {/* Loading message for when waiting for response */}
                <LoadingMessage
                  visible={needsResponsePlaceholder && !isStreaming}
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

      {rateLimited && (
        <div
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          role="dialog"
          aria-modal="true"
        >
          <div className="max-w-2xl w-full text-center text-white">
            <div className="text-2xl sm:text-3xl md:text-4xl font-semibold leading-snug">
              You’ve reached your daily free limit
            </div>
            <div className="mt-3 text-base sm:text-lg text-gray-200">
              Log in to save progress, or subscribe to explore even more.
            </div>
            <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
              {isLoggedIn ? (
                SUBSCRIPTIONS_ENABLED && !isSubscriber && (
                  <button
                    onClick={onSubscribeClick}
                    className="px-5 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
                  >
                    Subscribe
                  </button>
                )
              ) : (
                <>
                  <button
                    onClick={() => {
                      try {
                        saveViewerState();
                        window.sessionStorage.setItem(
                          'loginContext',
                          'rateLimit'
                        );
                        window.sessionStorage.setItem(
                          'previousPath',
                          window.location.pathname
                        );
                        window.sessionStorage.setItem(
                          'returnAfterSubscribe',
                          window.location.pathname
                        );
                      } catch {}
                      onLoginClick?.();
                    }}
                    className="px-5 py-3 rounded-md bg-white/10 hover:bg-white/20 text-white text-sm font-medium"
                  >
                    Log in / Sign up
                  </button>
                  {SUBSCRIPTIONS_ENABLED && (
                    <button
                      onClick={() => {
                        try {
                          saveViewerState();
                          window.sessionStorage.setItem(
                            'loginContext',
                            'subscribe'
                          );
                          window.sessionStorage.setItem(
                            'previousPath',
                            window.location.pathname
                          );
                          window.sessionStorage.setItem(
                            'returnAfterSubscribe',
                            window.location.pathname
                          );
                        } catch {}
                        onSubscribeClick?.();
                      }}
                      className="px-5 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium"
                    >
                      Subscribe
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
