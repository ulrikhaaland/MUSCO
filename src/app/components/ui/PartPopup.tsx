import { useState } from 'react';
import { ChatMessages } from './ChatMessages';
import { ChatHistory } from './ChatHistory';
import { ChatInput, ChatInputHandle } from './ChatInput';
import { useChatContainer } from '@/app/hooks/useChatContainer';
import { useRef } from 'react';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { Question, ChatMessage } from '@/app/types';
import { AnatomyPart } from '@/app/types/human';
import { useApp } from '@/app/context/AppContext';
import { ProgramType } from '../../../../shared/types';
import { VideoModal } from './VideoModal';
import { SUBSCRIPTIONS_ENABLED } from '@/app/lib/featureFlags';

interface PartPopupProps {
  part: AnatomyPart | null;
  groups: BodyPartGroup[];
  onClose: () => void;
  onQuestionClick?: (question: Question) => void;
  forceMode?: 'diagnosis' | 'explore';
  onGenerateProgram?: (programType: ProgramType) => void;
  onBodyGroupSelected?: (groupName: string, keepChatOpen?: boolean) => void;
  onBodyPartSelected?: (partName: string, keepChatOpen?: boolean) => void;
  onHistoryOpenChange?: (isOpen: boolean) => void;
}

export default function PartPopup({
  part,
  groups,
  onClose: _onClose,
  onQuestionClick,
  forceMode,
  onGenerateProgram,
  onBodyGroupSelected,
  onBodyPartSelected,
  onHistoryOpenChange,
}: PartPopupProps) {
  const { saveViewerState, setSelectedPart, setSelectedGroup, selectedGroups } = useApp();
  
  // Handler for body part click from chat - selects both the group and the part
  const handleBodyPartClick = (clickedPart: AnatomyPart, group: BodyPartGroup) => {
    // Only change group if it's different
    const currentGroup = selectedGroups[0];
    if (!currentGroup || currentGroup.id !== group.id) {
      // Pass skipPartReset=true since we're setting the part ourselves
      setSelectedGroup(group, true, true);
    }
    // Set the specific part
    setSelectedPart(clickedPart);
  };
  
  // Handler for group click from chat - selects just the group
  const handleGroupClick = (group: BodyPartGroup) => {
    const currentGroup = selectedGroups[0];
    if (!currentGroup || currentGroup.id !== group.id) {
      setSelectedGroup(group, true);
    }
  };
  
  // Use consolidated chat container logic
  const {
    router,
    user,
    t,
    message,
    setMessage,
    textareaRef: _textareaRef,
    videoUrl,
    loadingVideoExercise,
    currentExercise,
    handleVideoClick,
    handleCloseVideo,
    globalTemplateQuestions,
    messages,
    isLoading,
    rateLimited,
    followUpQuestions,
    exerciseResults,
    inlineExercises,
    messagesRef,
    handleResetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    streamError,
    // Chat history
    currentChatId,
    loadChatSession,
    startNewChat,
    scrollTrigger,
    chatListRefreshTrigger,
    titleGeneratingForChatId,
  } = useChatContainer({
    selectedPart: part,
    selectedGroups: groups,
    forceMode,
    onGenerateProgram,
    onBodyGroupSelected,
    onBodyPartSelected,
  });

  // Chat history panel state
  const [isHistoryOpenInternal, setIsHistoryOpenInternal] = useState(false);
  
  // Ref for ChatInput
  const chatInputRef = useRef<ChatInputHandle>(null);
  
  // Wrapper to notify parent of history open state changes
  const setIsHistoryOpen = (open: boolean) => {
    setIsHistoryOpenInternal(open);
    onHistoryOpenChange?.(open);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;
    const msg = message.trim();
    setMessage('');
    handleOptionClick({
      title: '',
      question: msg,
    });
  };

  const handleScroll = () => {
    // no-op
  };

  // const handleUserScroll = (hasScrolled: boolean) => {
  //   setUserHasScrolled(hasScrolled);
  // };

  const handleQuestionSelect = (question: Question) => {
    if (question.generate && onQuestionClick) {
      onQuestionClick(question);
    } else {
      handleOptionClick(question);
    }
  };

  // Handle resending a message when it was interrupted
  const handleResendMessage = (message: ChatMessage) => {
    if (message.role === 'user') {
      handleOptionClick({
        title: '',
        question: message.content,
      });
    }
  };

  return (
    <div className="h-full bg-gray-900 text-white p-6 flex flex-col relative" id="part-popup-container">
      <div className="flex flex-col pb-4 border-b border-gray-700 flex-shrink-0">
        {/* Top row: Group title and buttons */}
        <div className="flex items-start justify-between">
          <h3 className="text-app-title">{getGroupDisplayName()}</h3>
          <div className="flex items-center gap-1">
            {/* History button - only show if user is logged in */}
            {user && (
              <button
                onClick={() => setIsHistoryOpen(true)}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
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
            <button
              onClick={handleResetChat}
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
          </div>
        </div>
        {/* Selected part name (if any) */}
        {getPartDisplayName() && (
          <h2 className="text-sm text-gray-400 mt-1">{getPartDisplayName()}</h2>
        )}
      </div>

      {/* Global Template Questions (when no body part selected and no messages) */}
      {messages.length === 0 && groups.length === 0 && !isLoading && (
        <div className="mt-4 mb-4 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <div className="text-base text-white mb-2">{t('mobile.chat.startOrSelect')}</div>
          <div className="text-sm text-gray-400 mb-3">{t('mobile.chat.askAnything')}</div>
          <div className="flex flex-wrap gap-2">
            {globalTemplateQuestions.map((template) => (
              <button
                key={template.question}
                type="button"
                onClick={() => handleOptionClick({ 
                  title: template.title, 
                  question: template.question, 
                  chatMode: template.chatMode 
                })}
                className="px-4 py-2 text-sm font-medium rounded-full bg-[rgba(99,91,255,0.12)] border border-[rgba(99,91,255,0.35)] text-[#c8cbff] hover:bg-[rgba(99,91,255,0.2)] hover:border-[rgba(99,91,255,0.5)] active:bg-[rgba(99,91,255,0.25)] transition-colors duration-200"
                title={template.description}
              >
                {template.label}
              </button>
            ))}
            {/* Ask in chat button */}
            <button
              type="button"
              onClick={() => chatInputRef.current?.focus()}
              className="px-4 py-2 text-sm font-medium rounded-full bg-transparent border border-[rgba(99,91,255,0.35)] text-[#c8cbff] hover:bg-[rgba(99,91,255,0.12)] hover:border-[rgba(99,91,255,0.5)] active:bg-[rgba(99,91,255,0.2)] transition-colors duration-200 flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              {t('chat.askInChat')}
            </button>
          </div>
        </div>
      )}

      <ChatMessages
        messages={messages}
        messagesRef={messagesRef}
        isLoading={isLoading}
        streamError={streamError}
        rateLimited={rateLimited}
        onSubscribeClick={() => {
          try {
            saveViewerState();
            window.sessionStorage.setItem('loginContext', 'subscribe');
            window.sessionStorage.setItem('previousPath', window.location.pathname);
            window.sessionStorage.setItem('returnAfterSubscribe', window.location.pathname);
          } catch {}
          router.push('/subscribe');
        }}
        onLoginClick={() => {
          try {
            saveViewerState();
            window.sessionStorage.setItem('loginContext', 'rateLimit');
            window.sessionStorage.setItem('previousPath', window.location.pathname);
            window.sessionStorage.setItem('returnAfterSubscribe', window.location.pathname);
          } catch {}
          router.push('/login');
        }}
        isLoggedIn={Boolean(user)}
        isSubscriber={!SUBSCRIPTIONS_ENABLED || Boolean(user?.profile?.isSubscriber)}
        followUpQuestions={forceMode === 'explore' ? followUpQuestions.filter((q) => q.chatMode !== 'diagnosis') : followUpQuestions}
        exerciseResults={exerciseResults}
        inlineExercises={inlineExercises}
        onQuestionClick={handleQuestionSelect}
        onVideoClick={handleVideoClick}
        loadingVideoExercise={loadingVideoExercise}
        onScroll={handleScroll}
        part={part}
        groups={groups}
        onResend={handleResendMessage}
        disableAutoScroll={true}
        onBodyPartClick={handleBodyPartClick}
        onGroupClick={handleGroupClick}
        scrollTrigger={scrollTrigger}
      />

      <div className="border-t border-gray-700 pt-4 flex-shrink-0">
        <ChatInput
          ref={chatInputRef}
          value={message}
          onChange={setMessage}
          onSend={handleSendMessage}
          isLoading={isLoading}
          placeholder="Type your message..."
          maxHeight={480}
        />
      </div>
      
      {/* Video Modal */}
      {videoUrl && (
        <VideoModal
          videoUrl={videoUrl}
          onClose={handleCloseVideo}
          exerciseName={currentExercise?.name}
        />
      )}

      {/* Chat History Panel */}
      <ChatHistory
        isOpen={isHistoryOpenInternal}
        onClose={() => setIsHistoryOpen(false)}
        currentChatId={currentChatId}
        onSelectChat={(chatId) => {
          loadChatSession(chatId);
        }}
        onNewChat={() => {
          startNewChat();
        }}
        refreshTrigger={chatListRefreshTrigger}
        titleGeneratingForChatId={titleGeneratingForChatId}
      />
    </div>
  );
}
