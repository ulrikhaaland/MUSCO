/**
 * Chat history types for Firestore persistence
 * Stored at: users/{userId}/chats/{chatId}
 */

import { ChatMessage, Question, DiagnosisAssistantResponse } from './index';

/**
 * A saved chat session in Firestore
 */
export interface ChatSession {
  id: string;
  /** Auto-generated title from first user message or selected body part */
  title: string;
  /** All messages in the conversation */
  messages: ChatMessage[];
  /** Current follow-up questions */
  followUpQuestions: Question[];
  /** Assistant response state (diagnosis data, etc.) */
  assistantResponse: DiagnosisAssistantResponse | null;
  /** The body part group selected when chat started */
  selectedGroupId: string | null;
  /** The specific body part selected when chat started */
  selectedPartId: string | null;
  /** Chat mode: diagnosis or explore */
  mode: 'diagnosis' | 'explore' | null;
  /** When the chat was created */
  createdAt: Date;
  /** When the chat was last updated */
  updatedAt: Date;
}

/**
 * Data needed to create a new chat session
 */
export interface CreateChatSessionData {
  title?: string;
  messages: ChatMessage[];
  followUpQuestions?: Question[];
  assistantResponse?: DiagnosisAssistantResponse | null;
  selectedGroupId?: string | null;
  selectedPartId?: string | null;
  mode?: 'diagnosis' | 'explore' | null;
}

/**
 * Data for updating an existing chat session
 */
export interface UpdateChatSessionData {
  title?: string;
  messages?: ChatMessage[];
  followUpQuestions?: Question[];
  assistantResponse?: DiagnosisAssistantResponse | null;
}

/**
 * Chat session summary for history list (lighter weight)
 */
export interface ChatSessionSummary {
  id: string;
  title: string;
  messageCount: number;
  mode: 'diagnosis' | 'explore' | null;
  selectedGroupId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

