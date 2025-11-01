import { useState, useRef, ChangeEvent } from 'react';
import { ChatMessages } from './ChatMessages';
import { usePartChat } from '@/app/hooks/usePartChat';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { Question, ChatMessage } from '@/app/types';
import { AnatomyPart } from '@/app/types/human';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useApp } from '@/app/context/AppContext';
import { ProgramType } from '../../../../shared/types';
import { Exercise } from '@/app/types/program';
import { VideoModal } from './VideoModal';
import { fetchExerciseVideoUrl } from '@/app/utils/videoUtils';
import { getGlobalTemplateQuestions } from '@/app/config/templateQuestions';
import { useTranslation } from '@/app/i18n';

interface PartPopupProps {
  part: AnatomyPart | null;
  groups: BodyPartGroup[];
  onClose: () => void;
  onQuestionClick?: (question: Question) => void;
  forceMode?: 'diagnosis' | 'explore';
  onGenerateProgram?: (programType: ProgramType) => void;
}

export default function PartPopup({
  part,
  groups,
  onClose,
  onQuestionClick,
  forceMode,
  onGenerateProgram,
}: PartPopupProps) {
  const router = useRouter();
  const { t } = useTranslation();
  
  const { user } = useAuth();
  const { saveViewerState } = useApp();
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Get translated template questions
  const globalTemplateQuestions = getGlobalTemplateQuestions(t);
  
  // Video handling for exercise cards
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  
  const {
    messages,
    isLoading,
    rateLimited,
    followUpQuestions,
    exerciseResults,
    inlineExercises,
    messagesRef,
    resetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    streamError,
  } = usePartChat({ selectedPart: part, selectedGroups: groups, forceMode, onGenerateProgram });
  
  const handleVideoClick = async (exercise: Exercise) => {
    const exerciseId = exercise.name || exercise.id;
    if (loadingVideoExercise === exerciseId) return;
    
    setLoadingVideoExercise(exerciseId);
    setCurrentExercise(exercise);
    try {
      const videoUrl = await fetchExerciseVideoUrl(exercise);
      if (videoUrl) {
        setVideoUrl(videoUrl);
      }
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoadingVideoExercise(null);
    }
  };

  // no local scroll tracking in this variant

  const handleResetChat = () => {
    setMessage('');
    resetChat();
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 480);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message);
    }
  };

  const handleSendMessage = async (messageContent: string) => {
    if (!messageContent.trim()) return;
    setMessage('');
    handleOptionClick({
      title: '',
      question: messageContent,
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
    <div className="h-full bg-gray-900 text-white p-6 flex flex-col">
      <div className="flex justify-between items-start mb-6 flex-shrink-0">
        <div className="w-full">
          <h2 className="text-sm text-gray-400 mb-1">
            Musculoskeletal Assistant
          </h2>
          <h3 className="text-app-title">{getGroupDisplayName()}</h3>
          <div>
            <div className="flex items-center justify-between w-full gap-2">
              <h2 className="text-sm text-gray-400">{getPartDisplayName()}</h2>

              <button
                onClick={handleResetChat}
                className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
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
            </div>
          </div>
        </div>
      </div>

      {/* Global Template Questions (when no body part selected and no messages) */}
      {messages.length === 0 && groups.length === 0 && !isLoading && (
        <div className="mb-4 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
          <div className="text-base text-white mb-2">Start a chat or select a specific part</div>
          <div className="text-sm text-gray-400 mb-3">Ask anything about pain, recovery or training.</div>
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
                className="px-3 py-2 text-sm rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                title={template.description}
              >
                {template.label}
              </button>
            ))}
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
        isSubscriber={Boolean(user?.profile?.isSubscriber)}
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
        disableAutoScroll={false}
      />

      <div className="mt-4 border-t border-gray-700 pt-4 flex-shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage(message);
          }}
          className="relative"
        >
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            rows={1}
            placeholder="Type your message..."
            className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !message.trim()}
            className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
              isLoading || !message.trim()
                ? 'text-gray-500 cursor-not-allowed'
                : 'text-indigo-600 hover:text-indigo-500 hover:bg-gray-700/50'
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
      
      {/* Video Modal */}
      {videoUrl && (
        <VideoModal
          videoUrl={videoUrl}
          onClose={() => {
            setVideoUrl(null);
            setCurrentExercise(null);
          }}
          exerciseName={currentExercise?.name}
        />
      )}
    </div>
  );
}
