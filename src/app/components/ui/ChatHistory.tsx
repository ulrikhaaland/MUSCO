'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/app/i18n';
import { getChatSessionList, deleteChatSession } from '@/app/services/chatService';
import { ChatSessionSummary } from '@/app/types/chat';
import { Drawer } from './Drawer';

/**
 * Compact time-ago formatter (avoids text wrapping in tight spaces)
 */
function formatTimeAgo(date: Date, locale: string): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  const isNorwegian = locale === 'nb';

  if (diffMin < 1) {
    return isNorwegian ? 'nå' : 'now';
  }
  if (diffMin < 60) {
    return isNorwegian ? `${diffMin}m` : `${diffMin}m`;
  }
  if (diffHour < 24) {
    return isNorwegian ? `${diffHour}t` : `${diffHour}h`;
  }
  if (diffDay < 7) {
    return isNorwegian ? `${diffDay}d` : `${diffDay}d`;
  }
  // Beyond a week, show date
  return date.toLocaleDateString(isNorwegian ? 'nb-NO' : 'en-US', {
    day: 'numeric',
    month: 'short',
  });
}

interface ChatHistoryProps {
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  currentChatId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ChatHistory({
  onSelectChat,
  onNewChat,
  currentChatId,
  isOpen,
  onClose,
}: ChatHistoryProps) {
  const { user } = useAuth();
  const { t, locale } = useTranslation();
  const [chats, setChats] = useState<ChatSessionSummary[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load chat history when opened
  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    const loadChats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const chatList = await getChatSessionList(user.uid, 20);
        setChats(chatList);
      } catch (err) {
        console.error('[ChatHistory] Failed to load chats:', err);
        setError(t('chatHistory.loadError'));
      } finally {
        setIsLoading(false);
      }
    };

    loadChats();
  }, [isOpen, user?.uid]);

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    if (!user?.uid) return;

    try {
      await deleteChatSession(user.uid, chatId);
      setChats((prev) => prev.filter((c) => c.id !== chatId));
    } catch (err) {
      console.error('[ChatHistory] Failed to delete chat:', err);
    }
  };

  const handleSelectChat = (chatId: string) => {
    onSelectChat(chatId);
    onClose();
  };

  const handleNewChat = () => {
    onNewChat();
    onClose();
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} side="right" width="w-80">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
        <h2 className="text-lg font-semibold text-white">{t('chatHistory.title')}</h2>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
          aria-label={t('chatHistory.close')}
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

      {/* New Chat Button */}
      <div className="p-3 border-b border-gray-700 flex-shrink-0">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          {t('chatHistory.newChat')}
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-12 text-red-400 px-4 text-center">
            {error}
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-gray-500 px-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12 mb-3 opacity-50"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p>{t('chatHistory.noChats')}</p>
            <p className="text-sm mt-1 text-center">{t('chatHistory.startConversation')}</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-800">
            {chats.map((chat) => (
              <li key={chat.id}>
                <div
                  onClick={() => handleSelectChat(chat.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectChat(chat.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  className={`w-full text-left p-4 hover:bg-gray-800/50 transition-colors cursor-pointer ${
                    currentChatId === chat.id ? 'bg-gray-800' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium truncate">
                        {chat.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <span>{chat.messageCount} {t('chatHistory.messages')}</span>
                        <span>•</span>
                        <span>{formatTimeAgo(chat.updatedAt, locale)}</span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => handleDelete(e, chat.id)}
                      className="p-1.5 text-gray-500 hover:text-red-400 transition-colors rounded"
                      aria-label={t('chatHistory.deleteChat')}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </Drawer>
  );
}
