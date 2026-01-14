import { RefObject } from 'react';
import { Question } from '@/app/types';
import { useTranslation } from '@/app/i18n';
import { CloseButton } from '../ui/CloseButton';
import { useAuth } from '@/app/context/AuthContext';
import { ChatInput } from '../ui/ChatInput';

interface BottomSheetFooterProps {
  message: string;
  isLoading: boolean;
  textareaRef?: RefObject<HTMLTextAreaElement>; // Deprecated - kept for backwards compat
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
  textareaRef: _textareaRef, // Deprecated
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
    }
  };

  const placeholderText = messagesCount > 0 
    ? t('bottomSheet.typeMessage') 
    : t('bottomSheet.askSomethingElse');

  const hasClose = Boolean(onClose);

  return (
    <div className="flex-shrink-0 bg-gray-900">
      {/* Context bar - title/subtitle + actions */}
      {showHeaderContent && (
        <div className="border-t border-gray-700 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Context info */}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-sm font-medium text-white truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs text-gray-500 truncate mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            
            {/* Right: Action buttons in a unified group */}
            <div className="flex items-center gap-0.5 bg-gray-800/60 rounded-lg p-0.5">
              {user && onOpenHistory && (
                <button
                  onClick={onOpenHistory}
                  className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700/80 transition-colors"
                  aria-label={t('bottomSheet.chatHistory')}
                  title={t('bottomSheet.chatHistory')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
              {onNewChat && (
                <button
                  onClick={onNewChat}
                  className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700/80 transition-colors"
                  aria-label={t('chatHistory.newChat')}
                  title={t('chatHistory.newChat')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
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
              {hasClose && (
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white p-2 rounded-md hover:bg-gray-700/80 transition-colors"
                  aria-label={t('mobile.controls.close')}
                  title={t('mobile.controls.close')}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Input bar */}
      <div className={`px-3 pb-safe ${showHeaderContent ? 'pt-0 pb-2' : 'border-t border-gray-700 py-2'}`}
           style={showHeaderContent ? { paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' } : { paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom, 0px))' }}>
        <div className="flex items-end gap-2">
          <ChatInput
            value={message}
            onChange={setMessage}
            onSend={handleSendMessage}
            isLoading={isLoading}
            placeholder={placeholderText}
            maxHeight={480}
            variant="mobile"
            className="flex-1"
          />
          {/* Close button moved to header when showHeaderContent is true */}
          {hasClose && !showHeaderContent && (
            <CloseButton onClick={onClose} label={t('mobile.controls.close')} />
          )}
        </div>
      </div>
    </div>
  );
}
