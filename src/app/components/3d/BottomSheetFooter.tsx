import { RefObject } from 'react';
import { Question } from '@/app/types';
import { useTranslation } from '@/app/i18n';
import { CloseButton } from '../ui/CloseButton';
import { useAuth } from '@/app/context/AuthContext';

interface BottomSheetFooterProps {
  message: string;
  isLoading: boolean;
  textareaRef: RefObject<HTMLTextAreaElement>;
  setMessage: (message: string) => void;
  handleOptionClick: (question: Question) => void;
  messagesCount?: number;
  onClose?: () => void;
  // Header content props
  title?: string;
  subtitle?: string;
  onNewChat?: () => void;
  onOpenHistory?: () => void;
  showHeaderContent?: boolean;
}

export function BottomSheetFooter({
  message,
  isLoading,
  textareaRef,
  setMessage,
  handleOptionClick,
  messagesCount = 0,
  onClose,
  // Header content
  title,
  subtitle,
  onNewChat,
  onOpenHistory,
  showHeaderContent = false,
}: BottomSheetFooterProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const handleSendMessage = () => {
    if (message.trim() && !isLoading) {
      handleOptionClick({
        title: '',
        question: message,
        asked: true,
      });
      setMessage('');
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const placeholderText = messagesCount > 0 
    ? t('bottomSheet.typeMessage') 
    : t('bottomSheet.askSomethingElse');

  const hasClose = Boolean(onClose);

  return (
    <div className="border-t border-gray-700 flex-shrink-0 bg-gray-900 px-3">
      {/* Merged header content - above text input */}
      {showHeaderContent && (
        <div className="flex justify-between items-center py-2">
          <div className="flex flex-col items-start text-left flex-1 mr-3 overflow-hidden">
            {title && (
              <h3 className="text-sm font-semibold text-white line-clamp-1">
                {title}
              </h3>
            )}
            {subtitle && (
              <span className="text-xs text-gray-400 line-clamp-1">
                {subtitle}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* History button - only show if user is logged in */}
            {user && onOpenHistory && (
              <button
                onClick={onOpenHistory}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label={t('bottomSheet.chatHistory')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
            {/* New Chat button */}
            {onNewChat && (
              <button
                onClick={onNewChat}
                className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                aria-label={t('chatHistory.newChat')}
                title={t('chatHistory.newChat')}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Text input row */}
      <div className={`flex items-center gap-2 ${showHeaderContent ? 'pb-2' : 'py-2'}`}>
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
            placeholder={placeholderText}
            className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none text-white placeholder-gray-500"
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
        {hasClose && (
          <CloseButton onClick={onClose} label={t('mobile.controls.close')} />
        )}
      </div>
    </div>
  );
}
