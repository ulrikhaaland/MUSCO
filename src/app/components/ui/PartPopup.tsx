import { useState, useRef, ChangeEvent, useEffect } from 'react';
import {
  getOrCreateAssistant,
  createThread,
  sendMessage,
} from '../../lib/assistant';
import { ChatMessage, OpenAIMessage } from '../../types';
import ReactMarkdown from 'react-markdown';

interface PartPopupProps {
  part: {
    id: string;
    name: string;
    description: string;
  } | null;
  onClose: () => void;
}

function extractMessageContent(content: OpenAIMessage['content']): string {
  if (typeof content === 'string') {
    return content;
  }
  if (Array.isArray(content) && content.length > 0 && content[0].text) {
    return content[0].text.value;
  }
  return 'Unable to display message content';
}

function convertOpenAIMessageToChatMessage(msg: OpenAIMessage): ChatMessage {
  return {
    id: msg.id,
    content: extractMessageContent(msg.content),
    role: msg.role,
    timestamp: new Date(msg.created_at * 1000),
  };
}

export default function PartPopup({ part, onClose }: PartPopupProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const threadIdRef = useRef<string | null>(null);
  const assistantIdRef = useRef<string | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [streamingContent, setStreamingContent] = useState<string>('');

  // Initialize assistant and thread
  useEffect(() => {
    async function initializeAssistant() {
      try {
        const { assistantId, threadId } = await getOrCreateAssistant();
        assistantIdRef.current = assistantId;
        threadIdRef.current = threadId;
      } catch (error) {
        console.error('Error initializing assistant:', error);
      }
    }

    initializeAssistant();
  }, []);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesContainerRef.current) {
      const scrollContainer = messagesContainerRef.current;
      // Use requestAnimationFrame to ensure DOM has updated
      requestAnimationFrame(() => {
        scrollContainer.scrollTo({
          top: scrollContainer.scrollHeight,
          behavior: 'smooth',
        });
      });
    }
  }, [messages, isLoading]);

  const handleResetChat = () => {
    setSelectedOption(null);
    setMessage('');
    setMessages([]);
    // Create a new thread
    createThread().then(({ threadId }) => {
      threadIdRef.current = threadId;
    });
  };

  const handleTextareaChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-grow logic
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 480); // 480px = 20 lines * 24px per line
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleTextareaKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as any);
    }
  };

  const handleOptionClick = async (option: {
    id: string;
    label: string;
    description: string;
  }) => {
    if (!threadIdRef.current || !part) return;

    setSelectedOption(option.id);
    setIsLoading(true);
    setStreamingContent('');

    try {
      // Add system message about the selected option
      const optionMessage = `User selected "${option.label}" for ${part.name}. ${option.description}`;

      // Create a temporary message for the user's selection
      const tempUserMessage: ChatMessage = {
        id: `temp-${Date.now()}`,
        content: optionMessage,
        role: 'user',
        timestamp: new Date(),
      };

      // Create a temporary message for the assistant's response
      const tempAssistantMessage: ChatMessage = {
        id: `temp-assistant-${Date.now()}`,
        content: '',
        role: 'assistant',
        timestamp: new Date(),
      };

      // Add both messages to the chat
      setMessages(prev => [tempAssistantMessage, tempUserMessage, ...prev]);

      // Send the message and handle streaming
      await sendMessage(
        threadIdRef.current,
        optionMessage,
        part.name,
        (content) => {
          setStreamingContent(prev => prev + content);
          // Update the temporary assistant message with the streamed content
          setMessages(prev => {
            const updated = [...prev];
            const assistantMessageIndex = updated.findIndex(msg => msg.id === tempAssistantMessage.id);
            if (assistantMessageIndex !== -1) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: prev[assistantMessageIndex].content + content,
              };
            }
            return updated;
          });
        }
      );
    } catch (error) {
      console.error('Error handling option click:', error);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !threadIdRef.current) return;

    const userMessage = message;
    setMessage('');
    setIsLoading(true);
    setStreamingContent('');

    // Create temporary messages
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      content: userMessage,
      role: 'user',
      timestamp: new Date(),
    };

    const tempAssistantMessage: ChatMessage = {
      id: `temp-assistant-${Date.now()}`,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
    };

    // Add both messages to the chat
    setMessages(prev => [tempAssistantMessage, tempUserMessage, ...prev]);

    try {
      // Send the message and handle streaming
      await sendMessage(
        threadIdRef.current,
        userMessage,
        part?.name,
        (content) => {
          setStreamingContent(prev => prev + content);
          // Update the temporary assistant message with the streamed content
          setMessages(prev => {
            const updated = [...prev];
            const assistantMessageIndex = updated.findIndex(msg => msg.id === tempAssistantMessage.id);
            if (assistantMessageIndex !== -1) {
              updated[assistantMessageIndex] = {
                ...updated[assistantMessageIndex],
                content: prev[assistantMessageIndex].content + content,
              };
            }
            return updated;
          });
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
      setStreamingContent('');
    }
  };

  const options = part
    ? [
        {
          id: 'learn',
          label: 'Learn more',
          description: `Learn more about ${part.name}`,
        },
        {
          id: 'issue',
          label: 'I have an issue',
          description: `Get help with ${part.name} issues`,
        },
        {
          id: 'placeholder1',
          label: 'Placeholder 1',
          description: 'Lorem ipsum...',
        },
        {
          id: 'placeholder2',
          label: 'Placeholder 2',
          description: 'Lorem ipsum...',
        },
      ]
    : [];

  return (
    <div className="h-full bg-gray-900 text-white p-6 flex flex-col">
      {part ? (
        <>
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-sm text-gray-400 mb-1">
                Musculoskeletal Assistant
              </h2>
              <h3 className="text-xl font-bold">{part.name}</h3>
            </div>
            <div className="group relative">
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
              <div className="absolute right-0 top-full mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap">
                Reset Chat
              </div>
            </div>
          </div>

          <div className="flex-grow overflow-y-auto space-y-4">
            <div className="space-y-3">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleOptionClick(option)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedOption === option.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-800 hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm text-gray-400">
                    {option.description}
                  </div>
                </button>
              ))}
            </div>

            {messages.length > 0 && (
              <div
                ref={messagesContainerRef}
                className="space-y-4 mt-6 overflow-y-auto flex flex-col"
              >
                <div className="space-y-4">
                  {[...messages].reverse().map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3 rounded-lg ${
                        msg.role === 'user'
                          ? 'bg-indigo-600 ml-8'
                          : 'bg-gray-800 mr-8'
                      }`}
                    >
                      {msg.role === 'assistant' ? (
                        <div className="prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white prose-strong:font-semibold">
                          <ReactMarkdown
                            className="text-base leading-relaxed"
                            components={{
                              ul: ({ ...props }) => (
                                <ul className=" list-none" {...props} />
                              ),
                              //   li: ({...props}) => (
                              //     <li className="relative pl-6 before:absolute before:left-2 before:content-['•'] before:text-gray-400" {...props} />
                              //   ),
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
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-grow flex flex-col">
          <div className="flex-grow flex flex-col items-center justify-center">
            <h2 className="text-sm text-gray-400 mb-1">
              Musculoskeletal Assistant
            </h2>
            <h3 className="text-xl font-bold mb-6">
              Select a body part to get started
            </h3>
            <div className="text-gray-400 text-center">
              Click on any part of the body or start a chat to learn more about
              it or get help with specific issues.
            </div>
          </div>

          {messages.length > 0 && (
            <div
              ref={messagesContainerRef}
              className="space-y-4 mt-6 overflow-y-auto flex flex-col"
            >
              <div className="space-y-4">
                {[...messages].reverse().map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-3 rounded-lg ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 ml-8'
                        : 'bg-gray-800 mr-8'
                    }`}
                  >
                    {msg.role === 'assistant' ? (
                      <div className="prose prose-invert max-w-none prose-p:my-2 prose-strong:text-white prose-strong:font-semibold">
                        <ReactMarkdown
                          className="text-base leading-relaxed"
                          components={{
                            ul: ({ ...props }) => (
                              <ul
                                className="my-2 space-y-2 list-none"
                                {...props}
                              />
                            ),
                            li: ({ ...props }) => (
                              <li
                                className="relative pl-6 before:absolute before:left-2 before:content-['•'] before:text-gray-400"
                                {...props}
                              />
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
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-4 border-t border-gray-700 pt-4">
        <form onSubmit={handleSendMessage} className="relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextareaChange}
            onKeyDown={handleTextareaKeyDown}
            rows={3}
            placeholder="Type your message..."
            className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none min-h-[72px] max-h-[480px] overflow-y-auto"
            style={{ lineHeight: '24px' }}
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
