import { useState, useRef, useEffect } from 'react';
import {
  getOrCreateAssistant,
  createThread,
  sendMessage,
  generateFollowUp,
} from '../api/assistant/assistant';
import { ChatMessage, ChatPayload, Question, UserPreferences } from '../types';

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreferences | undefined>();
  const [followUpQuestions, setFollowUpQuestions] = useState<Question[]>([]);
  const threadIdRef = useRef<string | null>(null);
  const assistantIdRef = useRef<string | null>(null);

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

  const resetChat = () => {
    setMessages([]);
    setFollowUpQuestions([]);
    createThread().then(({ threadId }) => {
      threadIdRef.current = threadId;
    });
  };

  const sendChatMessage = async (
    messageContent: string,
    chatPayload: Omit<ChatPayload, 'message'>
  ) => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const payload: ChatPayload = {
        ...chatPayload,
        message: messageContent,
      };

      // Add user message immediately
      const newMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user' as const,
        content: messageContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

      // Start follow-up questions generation in parallel
      const followUpPromise = generateFollowUp(
        [newMessage],
        chatPayload.selectedBodyPart?.name || '',
        chatPayload.selectedGroupName || '',
        chatPayload.bodyPartsInSelectedGroup || [],
        {
          questions: chatPayload.followUpQuestions || [],
          selected: messageContent,
        }
      );

      // Handle follow-up questions when they arrive
      followUpPromise.then(({ followUpQuestions: questions }) => {
        if (questions) {
          setFollowUpQuestions(questions);
        }
      }).catch(console.error);

      // Send the message and handle streaming response
      await sendMessage(
        threadIdRef.current ?? '',
        payload,
        (content) => {
          if (content) {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.role === 'assistant') {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + content,
                    timestamp: new Date(),
                  },
                ];
              }
              return [
                ...prev,
                {
                  id: `assistant-${Date.now()}`,
                  role: 'assistant',
                  content,
                  timestamp: new Date(),
                },
              ];
            });
          }
        }
      );
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    messages,
    isLoading,
    userPreferences,
    followUpQuestions,
    resetChat,
    sendChatMessage,
    setFollowUpQuestions,
  };
}
