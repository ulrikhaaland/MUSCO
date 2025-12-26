/**
 * Chat history service for Firestore persistence
 * Handles CRUD operations for chat sessions
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import {
  ChatSession,
  ChatSessionSummary,
  CreateChatSessionData,
  UpdateChatSessionData,
} from '../types/chat';

const CHATS_COLLECTION = 'chats';
const MAX_CHAT_HISTORY = 50; // Maximum number of chats to keep per user

/**
 * Generate a title from the first user message or body part (fallback)
 */
function generateFallbackTitle(data: CreateChatSessionData): string {
  // Try to use the first user message
  const firstUserMessage = data.messages.find((m) => m.role === 'user');
  if (firstUserMessage?.content) {
    // Truncate to first 50 chars
    const content = firstUserMessage.content.trim();
    return content.length > 50 ? content.substring(0, 47) + '...' : content;
  }

  // Fallback to body part or generic title
  if (data.selectedGroupId) {
    return `Chat about ${data.selectedGroupId}`;
  }

  return 'New conversation';
}

/**
 * Generate a unique chat title using LLM
 */
export async function generateChatTitle(
  firstQuestion: string,
  firstResponse: string,
  language: 'en' | 'nb' = 'en'
): Promise<string | null> {
  try {
    const response = await fetch('/api/chat-title', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ firstQuestion, firstResponse, language }),
    });

    if (!response.ok) {
      console.error('[chatService] Failed to generate title:', response.status);
      return null;
    }

    const data = await response.json();
    return data.title || null;
  } catch (error) {
    console.error('[chatService] Error generating chat title:', error);
    return null;
  }
}

/**
 * Convert Firestore timestamp to Date
 */
function convertTimestamp(timestamp: Timestamp | Date | null): Date {
  if (!timestamp) return new Date();
  if (timestamp instanceof Timestamp) return timestamp.toDate();
  return timestamp;
}

/**
 * Get the chats collection reference for a user
 */
function getChatsRef(userId: string) {
  return collection(db, `users/${userId}/${CHATS_COLLECTION}`);
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  userId: string,
  data: CreateChatSessionData
): Promise<string> {
  const chatsRef = getChatsRef(userId);
  const chatDoc = doc(chatsRef);
  const chatId = chatDoc.id;

  const title = data.title || generateFallbackTitle(data);

  const chatSession: Omit<ChatSession, 'id' | 'createdAt' | 'updatedAt'> & {
    createdAt: ReturnType<typeof serverTimestamp>;
    updatedAt: ReturnType<typeof serverTimestamp>;
  } = {
    title,
    messages: data.messages,
    followUpQuestions: data.followUpQuestions || [],
    assistantResponse: data.assistantResponse || null,
    selectedGroupId: data.selectedGroupId || null,
    selectedPartId: data.selectedPartId || null,
    mode: data.mode || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(chatDoc, chatSession);
  return chatId;
}

/**
 * Update an existing chat session
 */
export async function updateChatSession(
  userId: string,
  chatId: string,
  data: UpdateChatSessionData
): Promise<void> {
  const chatDoc = doc(db, `users/${userId}/${CHATS_COLLECTION}/${chatId}`);

  const updateData: Record<string, unknown> = {
    updatedAt: serverTimestamp(),
  };

  if (data.title !== undefined) updateData.title = data.title;
  if (data.messages !== undefined) updateData.messages = data.messages;
  if (data.followUpQuestions !== undefined)
    updateData.followUpQuestions = data.followUpQuestions;
  if (data.assistantResponse !== undefined)
    updateData.assistantResponse = data.assistantResponse;

  await setDoc(chatDoc, updateData, { merge: true });
}

/**
 * Get a chat session by ID
 */
export async function getChatSession(
  userId: string,
  chatId: string
): Promise<ChatSession | null> {
  const chatDoc = doc(db, `users/${userId}/${CHATS_COLLECTION}/${chatId}`);
  const snapshot = await getDoc(chatDoc);

  if (!snapshot.exists()) return null;

  const data = snapshot.data();
  return {
    id: snapshot.id,
    title: data.title || 'Untitled',
    messages: data.messages || [],
    followUpQuestions: data.followUpQuestions || [],
    assistantResponse: data.assistantResponse || null,
    selectedGroupId: data.selectedGroupId || null,
    selectedPartId: data.selectedPartId || null,
    mode: data.mode || null,
    createdAt: convertTimestamp(data.createdAt),
    updatedAt: convertTimestamp(data.updatedAt),
  };
}

/**
 * Get all chat sessions for a user (summaries only, ordered by most recent)
 */
export async function getChatSessionList(
  userId: string,
  maxResults: number = MAX_CHAT_HISTORY
): Promise<ChatSessionSummary[]> {
  const chatsRef = getChatsRef(userId);
  const q = query(chatsRef, orderBy('updatedAt', 'desc'), limit(maxResults));
  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || 'Untitled',
      messageCount: data.messages?.length || 0,
      mode: data.mode || null,
      selectedGroupId: data.selectedGroupId || null,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    };
  });
}

/**
 * Delete a chat session
 */
export async function deleteChatSession(
  userId: string,
  chatId: string
): Promise<void> {
  const chatDoc = doc(db, `users/${userId}/${CHATS_COLLECTION}/${chatId}`);
  await deleteDoc(chatDoc);
}

/**
 * Delete all chat sessions for a user
 */
export async function deleteAllChatSessions(userId: string): Promise<void> {
  const chatsRef = getChatsRef(userId);
  const snapshot = await getDocs(chatsRef);

  const deletePromises = snapshot.docs.map((doc) => deleteDoc(doc.ref));
  await Promise.all(deletePromises);
}

