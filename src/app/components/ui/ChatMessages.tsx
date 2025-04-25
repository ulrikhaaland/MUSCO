import { ChatMessage, Question } from '@/app/types';
import ReactMarkdown from 'react-markdown';
import { RefObject, useEffect, useState, useRef } from 'react';
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

  // Check if we need to show the standard loading message (beginning of conversation)
  const showLoading = isLoading && messages.length === 1;

  // Check if we need to show a placeholder for awaiting response (when user sent a message but no response yet)
  const needsResponsePlaceholder =
    isLoading &&
    messages.length > 1 &&
    messages[messages.length - 1].role === 'user';

  const showFollowUps = followUpQuestions.length > 0;

  // Unified function to check scroll position and update button visibility
  const updateScrollButtonVisibility = (container: Element | null) => {
    // Don't show button if we have fewer than 2 messages
    if (!container || messages.length < 2) {
      setShowScrollButton(false);
      return;
    }

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Show button when scrolled more than 150px from bottom
    // You can adjust this value to control when the button appears
    const scrollThreshold = 150;
    const isScrolledUpEnough = distanceFromBottom > scrollThreshold;
    setShowScrollButton(isScrolledUpEnough);
  };

  // Set up scroll event listeners and handle initial scroll position
  useEffect(() => {
    // Get the right container based on mobile or desktop
    const container = isMobile
      ? document.querySelector('[data-rsbs-scroll]')
      : messagesRef.current;

    if (!container) return;

    const handleScroll = () => updateScrollButtonVisibility(container);

    // Check initial position
    handleScroll();

    // Add the appropriate event listener
    container.addEventListener('scroll', handleScroll);

    return () => {
      container.removeEventListener('scroll', handleScroll);
    };
  }, [isMobile, messages.length, messagesRef]);

  // Check scroll position when messages or followUpQuestions change
  useEffect(() => {
    // Auto-scroll to bottom when new messages are added
    if (messages.length > 0) {
      // Check if the most recent message is from the user (indicating a newly sent message)
      const isNewUserMessage = messages[messages.length - 1]?.role === 'user';

      if (isNewUserMessage || needsResponsePlaceholder) {
        // Scroll to bottom immediately for user messages or when expecting a response
        scrollToBottom();
      } else {
        // For other message updates, just check if we need to show the scroll button
        setTimeout(
          () =>
            updateScrollButtonVisibility(
              isMobile
                ? document.querySelector('[data-rsbs-scroll]')
                : messagesRef.current
            ),
          200
        );
      }
    }
  }, [messages, needsResponsePlaceholder, isMobile]);

  // Handler for desktop scroll events
  const handleDesktopScroll = (e: React.UIEvent<HTMLDivElement>) => {
    updateScrollButtonVisibility(e.currentTarget);
    onScroll?.(e);
  };

  // Scroll to bottom function - using a highly reliable approach
  const scrollToBottom = () => {
    try {
      // For mobile view
      if (isMobile) {
        const mobileContainer = document.querySelector('[data-rsbs-scroll]');

        if (mobileContainer) {
          // Initial scroll attempt with animation
          mobileContainer.scrollTo({
            top: 999999, // Intentionally large to ensure we hit the bottom
            behavior: 'smooth',
          });

          // For bottom sheets, sometimes we need more aggressive approaches
          // Use multiple delayed attempts with increasing intensity

          // First follow-up: after animation starts
          setTimeout(() => {
            // Direct property assignment often works when scrollTo doesn't
            mobileContainer.scrollTop = mobileContainer.scrollHeight;
          }, 100);

          // Second follow-up: after a bit more time
          setTimeout(() => {
            // Find any interactive elements to force scroll
            const buttons = document.querySelectorAll('button');
            if (buttons.length > 0) {
              // Focus the last button - browsers will scroll to focused elements
              buttons[buttons.length - 1].focus();
            }

            // Try scrolling directly to follow-up questions if present
            const followUps = document.querySelector('.space-y-2');
            if (followUps) {
              followUps.scrollIntoView(false);
            }
          }, 300);

          // Final attempt: brute force approach
          setTimeout(() => {
            // Try every method we can
            const content = document.getElementById('bottom-sheet-content');
            if (content) {
              content.scrollIntoView(false);
            }

            // Force scroll one more time
            mobileContainer.scrollTop = mobileContainer.scrollHeight + 2000;

            // Hide the button after our best efforts
            setShowScrollButton(false);
          }, 500);
        }
      }
      // For desktop view
      else if (messagesRef.current) {
        // Simple scrollTo works fine on desktop
        messagesRef.current.scrollTo({
          top: messagesRef.current.scrollHeight,
          behavior: 'smooth',
        });

        // Just to be safe, set scroll directly after animation starts
        setTimeout(() => {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
          updateScrollButtonVisibility(messagesRef.current);
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
                    className={`w-full text-left px-2 rounded-lg transition-colors ${
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
          className="flex items-center justify-center w-10 h-10 bg-indigo-600/50 hover:bg-indigo-600/70 rounded-full shadow-md transition-all duration-200"
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
