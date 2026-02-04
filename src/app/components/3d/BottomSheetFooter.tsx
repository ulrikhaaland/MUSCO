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
    <div className="flex-shrink-0 bg-gradient-to-t from-gray-900 via-gray-900 to-gray-900/95">
      {/* Unified footer container */}
      <div 
        className="px-3 pt-2"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom, 0px))' }}
      >
        {/* Context chip + actions row */}
        {showHeaderContent && (
          <div className="flex items-center gap-2 mb-2">
            {/* Context chip - compact pill showing group + selected part */}
            {(title || subtitle) && (
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-500/15 border border-violet-500/30 rounded-full max-w-full hover:bg-violet-500/25 hover:border-violet-500/50 transition-colors active:scale-95"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-3.5 w-3.5 text-violet-400 flex-shrink-0" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs text-violet-200 truncate">
                    {subtitle ? (
                      <>
                        <span className="font-medium">{subtitle}</span>
                        {title && <span className="text-violet-400/70"> · {title}</span>}
                      </>
                    ) : (
                      <span className="font-medium">{title}</span>
                    )}
                  </span>
                </button>
              </div>
            )}
            
            {/* Action buttons - minimal, icon-only */}
            <div className="flex items-center gap-1">
              {user && onOpenHistory && (
                <button
                  onClick={onOpenHistory}
                  className="p-2 text-gray-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-full transition-all duration-150 active:scale-95"
                  aria-label={t('bottomSheet.chatHistory')}
                  title={t('bottomSheet.chatHistory')}
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
              {onNewChat && (
                <button
                  onClick={onNewChat}
                  className="p-2 text-gray-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-full transition-all duration-150 active:scale-95"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              )}
              {hasClose && (
                <button
                  onClick={onClose}
                  className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-all duration-150 active:scale-95"
                  aria-label={t('mobile.controls.close')}
                  title={t('mobile.controls.close')}
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Input row */}
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
          {/* Close button when no header content */}
          {hasClose && !showHeaderContent && (
            <CloseButton onClick={onClose} label={t('mobile.controls.close')} />
          )}
        </div>
      </div>
    </div>
  );
}
