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
}: ChatMessagesProps) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [userTouched, setUserTouched] = useState(false);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastMessageContentRef = useRef<string>('');
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
  const handleReactTouchStart = useCallback<React.TouchEventHandler<HTMLDivElement>>((e) => {
    // Same logic as DOM event handler
    const target = e.target as HTMLElement;
    const isFollowUpQuestion = target.closest('.follow-up-question-btn');
    const isScrollButton = target.closest('.scroll-to-bottom-btn');
    
    if (!isFollowUpQuestion && !isScrollButton) {
      setUserTouched(true);
      hasHadTouchRef.current = true;
      resetTouchState();
    }
  }, [resetTouchState, userTouched]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (touchTimeoutRef.current) {
        clearTimeout(touchTimeoutRef.current);
      }
    };
  }, [userTouched]);

  // Check if we need to show the standard loading message (beginning of conversation)
  const showLoading = isLoading && messages.length === 1;

  // Check if we need to show a placeholder for awaiting response (when user sent a message but no response yet)
  const needsResponsePlaceholder =
    isLoading &&
    messages.length > 1 &&
    messages[messages.length - 1].role === 'user';

  const showFollowUps = followUpQuestions.length > 0;

  // Unified function to check scroll position and update button visibility
  const updateScrollButtonVisibility = useCallback((container: Element | null) => {
    // Don't show button if we have fewer than 2 messages
    if (!container || messages.length < 2) {
      setShowScrollButton(false);
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show button when scrolled more than 150px from bottom
    const scrollThreshold = 150;
    const isScrolledUpEnough = distanceFromBottom > scrollThreshold;
    setShowScrollButton(isScrolledUpEnough);
  }, [messages.length]);

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
      const isNearBottom = distanceFromBottom < 30; // Within 30px of bottom
      
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
    container.scrollTo = function(...args) {
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
  }, [isMobile, messagesRef, resetTouchState, userTouched, updateScrollButtonVisibility]);

  // Check message types and update scroll position when messages change
  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      const lastMessageContent = lastMessage?.content || '';
      const prevContent = lastMessageContentRef.current;
      
      // Reset content tracking when role changes or content is completely different
      // This handles new messages being added
      if (prevContent && 
          ((lastMessage?.role === 'assistant' && prevContent.length === 0) || 
           (lastMessageContent.length < prevContent.length))) {
        // Reset tracking for new message
        lastMessageContentRef.current = ''; // Start fresh for the new message
      }
      
      // Detect if content is streaming (getting longer)
      const isStreaming = lastMessage?.role === 'assistant' && 
                          lastMessageContent.length > lastMessageContentRef.current.length;
      
      // Update the reference for next comparison
      lastMessageContentRef.current = lastMessageContent;
      
      // Check message types
      const isNewUserMessage = lastMessage?.role === 'user';
      const isAssistantMessage = lastMessage?.role === 'assistant';
      
      // Reset user touch state when streaming begins
      if (isStreaming && lastMessageContent.length <= 20) {
        // If we just started streaming (first ~20 chars), reset touch state
        hasHadTouchRef.current = false; // This is critical - don't auto-set to true
        setUserTouched(false);
        
        // Clear any existing touch timeout to avoid phantom timeouts
        if (touchTimeoutRef.current) {
          clearTimeout(touchTimeoutRef.current);
          touchTimeoutRef.current = null;
        }
      }

      // Auto-scroll in these cases:
      // 1. User just sent a message
      // 2. We're showing the loading placeholder
      // 3. Message is streaming AND user hasn't touched the screen recently
      if (isNewUserMessage || 
          needsResponsePlaceholder || 
          (isStreaming && !userTouched)) {
        scrollToBottom();
      } else {
        // For other message updates, just check if we need to show the scroll button
        setTimeout(
          () => {
            const container = isMobile
              ? document.querySelector('[data-rsbs-scroll]')
              : messagesRef.current;
            updateScrollButtonVisibility(container);
          },
          200
        );
      }
    }
  }, [messages, needsResponsePlaceholder, isMobile, userTouched, isLoading, updateScrollButtonVisibility]);

  // Track follow-up questions and auto-scroll when they appear
  const followUpQuestionsRef = useRef<Question[]>([]);
  useEffect(() => {
    // Skip empty arrays
    if (followUpQuestions.length === 0) {
      followUpQuestionsRef.current = [];
      return;
    }
    
    // Deep check if questions have changed (not just count)
    const hasNewQuestions = followUpQuestions.some(newQ => {
      // If we can't find this question title in the previous questions, it's new
      return !followUpQuestionsRef.current.some(oldQ => oldQ.title === newQ.title);
    });
    
    // Only auto-scroll if new questions appeared AND user hasn't touched the screen
    if (hasNewQuestions && !userTouched) {
      // Small delay to ensure questions are rendered
      setTimeout(() => {
        scrollToBottom();
        
        // After scrolling for follow-up questions, don't let it trigger user touch state
        // This prevents auto-scroll from triggering touch detection
        hasHadTouchRef.current = false;
      }, 100);
    }
    
    // Update reference for next comparison
    followUpQuestionsRef.current = [...followUpQuestions];
  }, [followUpQuestions, userTouched]);

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

  // Scroll to bottom function - using a highly reliable approach
  const scrollToBottom = () => {
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

  // Function to handle resending an interrupted message
  const handleResend = (userMsg: ChatMessage) => {
    if (onResend) {
      onResend(userMsg);
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

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
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

        <div className="space-y-4">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className={`p-4 rounded-lg ${
                msg.role === 'user' ? 'bg-indigo-600 ml-8' : 'bg-gray-800 mr-8'
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
                              const userMsg = findUserMessageBeforeError(index);
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
          ))}

          {/* Loading indicator for first message of conversation */}
          {showLoading || needsResponsePlaceholder ? <LoadingMessage /> : null}

          {showFollowUps && (
            <div className={`space-y-2  ${messages.length > 0 ? 'pb-4' : ''}`}>
              <div className="space-y-2">
                {followUpQuestions.map((question) => (
                  <button
                    key={question.title}
                    onClick={() => onQuestionClick?.(question)}
                    className={`follow-up-question-btn w-full text-left px-2 rounded-lg transition-colors ${
                      question.generate
                        ? 'bg-gradient-to-r from-indigo-900 to-indigo-800 hover:from-indigo-800 hover:to-indigo-700'
                        : 'bg-gray-800 hover:bg-gray-700'
                    } ${isMobile ? 'py-1' : 'py-2'}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{question.title}</div>
                      {question.generate && (
                        <div className="text-xs px-2 py-0.5 bg-indigo-600 rounded-full ml-2">
                          Generate program
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-gray-400">
                      {question.question}
                    </div>
                  </button>
                ))}
              </div>
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
          onClick={scrollToBottom}
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
