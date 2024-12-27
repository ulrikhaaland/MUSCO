import { useState, useRef, ChangeEvent } from 'react';
import { AnatomyPart } from '@/app/types/anatomy';
import { ChatMessages } from './ChatMessages';
import { usePartChat } from '@/app/hooks/usePartChat';

interface PartPopupProps {
  part: AnatomyPart | null;
  onClose: () => void;
}

export default function PartPopup({ part, onClose }: PartPopupProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const {
    messages,
    isLoading,
    isCollectingJson,
    followUpQuestions,
    messagesRef,
    resetChat,
    handleOptionClick,
    getDisplayName,
  } = usePartChat({ selectedPart: part });

  const [userHasScrolled, setUserHasScrolled] = useState(false);

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
      description: '',
      question: messageContent,
    });
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    console.log('Scroll event in PartPopup');
  };

  const handleUserScroll = (hasScrolled: boolean) => {
    setUserHasScrolled(hasScrolled);
  };

  return (
    <div className="h-full bg-gray-900 text-white p-6 flex flex-col">
      <div className="flex justify-between items-start mb-6 flex-shrink-0">
        <div>
          <h2 className="text-sm text-gray-400 mb-1">
            Musculoskeletal Assistant
          </h2>
          <h3 className="text-xl font-bold">
            {getDisplayName()}
          </h3>
        </div>
        <div className="flex gap-2">
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
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
            aria-label="Close"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {messages.length === 0 && part ? (
          <div className="space-y-3">
            {followUpQuestions.map((question) => (
              <button
                key={question.title}
                onClick={() => handleOptionClick(question)}
                className="w-full text-left p-3 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
              >
                <div className="font-medium">{question.title}</div>
                <div className="text-sm text-gray-400">{question.description}</div>
              </button>
            ))}
          </div>
        ) : (
          <ChatMessages 
            messages={messages} 
            messagesRef={messagesRef}
            isLoading={isLoading}
            isCollectingJson={isCollectingJson}
            followUpQuestions={followUpQuestions}
            onQuestionClick={handleOptionClick}
            onScroll={handleScroll}
            onUserScroll={handleUserScroll}
            part={part}
          />
        )}
      </div>

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
    </div>
  );
}
