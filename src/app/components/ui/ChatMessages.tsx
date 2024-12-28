import { ChatMessage, Question } from '@/app/types';
import ReactMarkdown from 'react-markdown';
import { RefObject, useEffect, useState, useRef } from 'react';
import { LoadingMessage } from './LoadingMessage';

interface ChatMessagesProps {
  messages: ChatMessage[];
  messagesRef: RefObject<HTMLDivElement | null>;
  isLoading?: boolean;
  isCollectingJson?: boolean;
  followUpQuestions?: Question[];
  onQuestionClick?: (question: Question) => void;
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
  onUserScroll?: (hasScrolled: boolean) => void;
  part?: { name: string } | null;
  isMobile?: boolean;
}

export function ChatMessages({
  messages,
  messagesRef,
  isLoading,
  isCollectingJson = false,
  followUpQuestions = [],
  onQuestionClick,
  onScroll,
  onUserScroll,
  part,
  isMobile = false,
}: ChatMessagesProps) {
  const [userHasScrolled, setUserHasScrolled] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [hasStartedCollecting, setHasStartedCollecting] = useState(false);
  const lastScrollTop = useRef(0);
  const lastMessage = messages[messages.length - 1];
  const showLoading =
    isLoading && (!lastMessage || lastMessage.role === 'user');
  const showFollowUps = !isLoading && followUpQuestions.length > 0;

  // Track when collection starts
  useEffect(() => {
    if (isCollectingJson) {
      setHasStartedCollecting(true);
    }
  }, [isCollectingJson]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const container = e.currentTarget;
    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;

    // Only consider it a user scroll if they're moving up AND not at the bottom
    if (scrollTop < lastScrollTop.current && distanceFromBottom > 20) {
      setUserHasScrolled(true);
      onUserScroll?.(true);
    }

    // If user has scrolled to bottom, reset scroll state
    if (distanceFromBottom < 20) {
      setUserHasScrolled(false);
      onUserScroll?.(false);
    }

    setShowScrollButton(userHasScrolled && distanceFromBottom > 20);
    lastScrollTop.current = scrollTop;
    onScroll?.(e);
  };

  // Auto-scroll effect
  useEffect(() => {
    const container = messagesRef.current;
    if (!container || userHasScrolled) return;

    // Use requestAnimationFrame for smooth scrolling during streaming
    requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
    });
  }, [messages, isLoading, followUpQuestions, userHasScrolled]);

  const scrollToBottom = () => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  const QuestionShimmerItem = () => (
    <button className="w-full text-left p-3 rounded-lg bg-gray-800 cursor-default">
      <div className="animate-pulse space-y-2">
        <div className="h-4 bg-gray-700 rounded w-3/4"></div>
        <div className="h-3 bg-gray-700/50 rounded w-1/2"></div>
      </div>
    </button>
  );

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto scroll-smooth"
      >
        {messages.length === 0 && !part && !isMobile && (
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
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`p-4 rounded-lg ${
                msg.role === 'user' ? 'bg-indigo-600 ml-8' : 'bg-gray-800 mr-8'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:my-0 prose-pre:p-0 prose-pre:leading-none prose-strong:text-white prose-strong:font-semibold">
                  <ReactMarkdown
                    className="text-base leading-relaxed"
                    components={{
                      ul: ({ ...props }) => (
                        <ul className=" list-none" {...props} />
                      ),
                    }}
                  >
                    {msg.content}
                  </ReactMarkdown>
                </div>
              ) : (
                <div className="text-base">{msg.content}</div>
              )}
            </div>
          ))}
          {showLoading && <LoadingMessage />}

          {(showFollowUps || isCollectingJson) && (
            <div
              className={`space-y-2 mt-4 ${messages.length > 0 ? 'pb-4' : ''}`}
            >
              {/* <h4 className="text-sm font-medium text-gray-400 ml-2">
                Suggested questions:
              </h4> */}
              <div className="space-y-2">
                {!showFollowUps
                  ? Array(3)
                      .fill(null)
                      .map((_, index) => (
                        <QuestionShimmerItem key={`shimmer-${index}`} />
                      ))
                  : followUpQuestions.map((question) => (
                      <button
                        key={question.title}
                        onClick={() => onQuestionClick?.(question)}
                        className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                      >
                        <div className="font-medium">{question.title}</div>
                        <div className="text-sm text-gray-400">
                          {question.description}
                        </div>
                      </button>
                    ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Scroll to bottom button - centered and floating at bottom */}
      {showScrollButton && (
        <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-10">
          <button
            onClick={scrollToBottom}
            className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-full shadow-lg transition-all duration-200 transform hover:scale-105"
            aria-label="Scroll to bottom"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-white"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
