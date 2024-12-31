import { RefObject } from 'react';
import { Question } from '@/app/types';
import { BottomSheetRef } from 'react-spring-bottom-sheet';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface BottomSheetFooterProps {
  message: string;
  isLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  messagesRef: RefObject<HTMLDivElement>;
  setMessage: (message: string) => void;
  handleOptionClick: (question: Question) => void;
  sheetRef: RefObject<BottomSheetRef>;
  getSnapPoints: () => number[];
  getViewportHeight: () => number;
  setIsExpanded: (expanded: boolean) => void;
  onSheetHeightModified?: (modified: boolean) => void;
}

export function BottomSheetFooter({
  message,
  isLoading,
  textareaRef,
  messagesRef,
  setMessage,
  handleOptionClick,
  sheetRef,
  getSnapPoints,
  getViewportHeight,
  setIsExpanded,
  onSheetHeightModified,
}: BottomSheetFooterProps) {
  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      handleOptionClick({
        title: '',
        description: '',
        question: message,
      });
      setMessage('');
    }
  };

  return (
    <div className="border-t border-gray-700 pt-2 pb-1 flex-shrink-0 bg-gray-900 pr-[60px]">
      <div className="flex items-center gap-2">
        <form
          className="relative flex-1"
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => {
              setMessage(e.target.value);
              const textarea = textareaRef.current;
              if (textarea) {
                textarea.style.height = 'auto';
                const newHeight = Math.min(textarea.scrollHeight, 480);
                textarea.style.height = `${newHeight}px`;
              }
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            rows={1}
            placeholder="Type your message..."
            className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 flex justify-center items-center w-8 h-8 rounded-full transition-colors ${
              isLoading || !message.trim()
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-white hover:text-white hover:bg-gray-700'
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
