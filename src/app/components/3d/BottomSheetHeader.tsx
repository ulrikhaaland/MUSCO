import { BottomSheetRef } from 'react-spring-bottom-sheet';
import { ChatMessage } from '@/app/types';
import { useEffect, useRef } from 'react';

interface BottomSheetHeaderProps {
  messages: ChatMessage[];
  isLoading: boolean;
  getGroupDisplayName: () => string;
  getPartDisplayName: () => string;
  resetChat: () => void;
  onHeightChange?: (height: number) => void;
  isMinimized: boolean;
}

export function BottomSheetHeader({
  messages,
  isLoading,
  getGroupDisplayName,
  getPartDisplayName,
  resetChat,
  onHeightChange,
  isMinimized,
}: BottomSheetHeaderProps) {
  const headerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (headerRef.current && onHeightChange) {
      const observer = new ResizeObserver(() => {
        const height = headerRef.current?.getBoundingClientRect().height;
        if (height) {
          onHeightChange(height + 28);
        }
      });

      observer.observe(headerRef.current);
      return () => observer.disconnect();
    }
  }, [onHeightChange]);

  return (
    <div ref={headerRef} className="h-12 w-full flex justify-between items-center">
      <div className="flex flex-col items-start text-left flex-1 mr-4 max-h-12 overflow-hidden">
        <h3 className="text-lg font-bold text-white text-left break-words w-full line-clamp-1">{getGroupDisplayName()}</h3>
        <h2 className="text-sm text-white text-left break-words w-full line-clamp-1">{getPartDisplayName()}</h2>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 self-center">
        {messages.length > 0 &&
          messages.some((m) => m.role === 'assistant' && m.content) &&
          !isLoading && !isMinimized && (
            <button
              onClick={resetChat}
              className="text-white hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Reset Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
      </div>
    </div>
  );
} 