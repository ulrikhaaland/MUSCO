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
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageContentRef = useRef<string>('');
  const lastMessageIdRef = useRef<string>('');
  const hasHadTouchRef = useRef<boolean>(false);
  const initialLoadingRef = useRef<boolean>(true);
  const loadingTransitionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const chatViewRef = useRef<HTMLDivElement>(null);
  const streamMessageRef = useRef<HTMLDivElement>(null);
  const questionsRef = useRef<HTMLDivElement>(null);

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

      return false;
    },
    [messages, isLoading]
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

      return false;
    },
    [messages, isLoading]
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
      return;
    }

    // Skip auto-scrolling if disabled
    if (disableAutoScroll) {
      followUpQuestionsRef.current = [...followUpQuestions];
      return;
    }

    // Deep check if questions have changed (not just count)
    const hasNewQuestions = followUpQuestions.some((newQ) => {
      // If we can't find this question title in the previous questions, it's new
      return !followUpQuestionsRef.current.some(
        (oldQ) => oldQ.title === newQ.title
      );
    });

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

  // Calculate available height for loading message
  useEffect(() => {
    const calculateAvailableHeight = () => {
      // Start with full container height
      let height = chatContainerHeight;

      // Subtract stream message height if it exists and is visible
      if (streamMessageRef.current && isStreaming) {
        const streamHeight = streamMessageRef.current.offsetHeight;
        setStreamMessageHeight(streamHeight);
        height -= streamHeight;
      } else {
        setStreamMessageHeight(0);
      }

      // Subtract questions height if they exist
      if (questionsRef.current && showFollowUps) {
        const qHeight = questionsRef.current.offsetHeight;
        setQuestionsHeight(qHeight);
        height -= qHeight;
      } else {
        setQuestionsHeight(0);
      }

      // Ensure minimum height and set result
      const minHeight = 100; // Minimum height in pixels
      const calculatedHeight = Math.max(height * 0.7, minHeight);
      setAvailableHeight(calculatedHeight);
      console.log('[ChatMessages] Calculated availableHeight:', calculatedHeight); // DEBUG PRINT
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
    isStreaming,
    showFollowUps,
    messages,
    followUpQuestions,
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
        className="flex-1 overflow-y-auto scroll-smooth"
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
                      : 'bg-gray-800 mr-8'
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
                    <div className="text-base">{msg.content}</div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Current turn with flex layout */}
          {messages.length > 0 && (
            <>
              {/* User message at top */}
              {messages.map((msg, index) => {
                if (!isLastUserMessage(index)) return null;

                // Remove mb-4 when followed by a streaming response
                const isFollowedByStreaming =
                  isStreaming &&
                  messages.length > 0 &&
                  messages[messages.length - 1].role === 'assistant';

                return (
                  <div key={`current-user-${msg.id}`} className="flex-none">
                    <div
                      className={`px-4 py-2 rounded-lg bg-indigo-600 ml-8 ${isFollowedByStreaming ? '' : 'mb-4'}`}
                    >
                      <div className="text-base">{msg.content}</div>
                    </div>
                  </div>
                );
              })}

              {/* Assistant streaming message - placed immediately after user message */}
              {isStreaming &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'assistant' && (
                  <div
                    key={`streaming-${messages[messages.length - 1].id}`}
                    className="flex-none"
                    ref={streamMessageRef}
                  >
                    <div
                      className={`px-4 py-2 rounded-lg bg-gray-800 mr-8 ${streamError ? 'border border-red-400' : ''}`}
                    >
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
            </>
          )}

          {/* Follow-up questions */}
          {showFollowUps && (
            <div ref={questionsRef}>
              <div className="space-y-2">
                {followUpQuestions.map((question) => (
                  <button
                    key={question.title || question.question}
                    onClick={() => onQuestionClick?.(question)}
                    className={`follow-up-question-btn w-full text-left px-2 rounded-lg transition-colors ${
                      question.generate
                        ? 'bg-gradient-to-r from-indigo-900 to-indigo-800 hover:from-indigo-800 hover:to-indigo-700'
                        : 'bg-gray-800 hover:bg-gray-700'
                    } ${isMobile ? 'py-1' : 'py-2'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className={`${!question.title ? 'text-lg' : 'font-medium'}`}>{question.title || question.question}</div>
                      {question.generate && (
                        <div className="text-xs px-2 py-0.5 bg-indigo-600 rounded-full ml-2">
                          Generate program
                        </div>
                      )}
                    </div>
                    {question.title && (
                      <div className="text-sm text-gray-400">
                        {question.question}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 
            Loading message spacer - rendered ONLY during active loading or streaming
            - Uses dynamic height calculation that adjusts based on content
            - Completely removed after streaming completes
          */}
          {isLoading && (needsResponsePlaceholder || isStreaming) && (
            <div
              className="block w-full overflow-hidden"
              style={{
                height: `${availableHeight}px`,
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden', // Keep overflow hidden on the parent
                marginTop: '0',
              }}
            >
              <LoadingMessage
                containerHeight={availableHeight}
                visible={needsResponsePlaceholder && !isStreaming}
              />
            </div>
          )}
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
          className="scroll-to-bottom-btn flex items-center justify-center w-10 h-10 bg-indigo-600/50 hover:bg-indigo-600/70 rounded-full shadow-md transition-all duration-200"
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
