/**
 * Admin version of pre-followup chat service for server-side Firestore operations.
 * Uses Firebase Admin SDK for writes from API routes.
 */

import { adminDb } from '../firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { ChatMessage, Question } from '../types';
import { PreFollowupStructuredUpdates, ExerciseIntensityFeedback } from '../types/incremental-program';

const LEGACY_COLLECTION_NAME = 'preFollowupChats';

/**
 * State of a pre-followup chat session (matches client-side interface)
 */
export interface PreFollowupChatStateAdmin {
  messages: ChatMessage[];
  followUpQuestions: Question[];
  accumulatedFeedback: {
    structuredUpdates?: PreFollowupStructuredUpdates;
    exerciseIntensity?: ExerciseIntensityFeedback[];
    overallIntensity?: 'increase' | 'maintain' | 'decrease';
    conversationalSummary: string;
  };
  conversationComplete?: boolean;
}

/**
 * Remove undefined values from an object (Firestore doesn't accept undefined)
 */
function removeUndefined<T extends Record<string, unknown>>(obj: T): T {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = removeUndefined(value as Record<string, unknown>);
      } else {
        result[key] = value;
      }
    }
  }
  return result as T;
}

/**
 * Save or update a pre-followup chat session using Admin SDK
 * Stores in the week document as a 'feedbackChat' field
 */
export async function savePreFollowupChatAdmin(
  userId: string,
  programId: string,
  weekId: string | undefined,
  state: PreFollowupChatStateAdmin
): Promise<void> {
  // Clean accumulated feedback of undefined values
  const cleanedFeedback = removeUndefined(state.accumulatedFeedback);

  const chatData = {
    messages: state.messages,
    followUpQuestions: state.followUpQuestions,
    accumulatedFeedback: cleanedFeedback,
    conversationComplete: state.conversationComplete ?? false,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (weekId) {
    // Store in week document
    const weekRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('programs')
      .doc(programId)
      .collection('weeks')
      .doc(weekId);
    
    const weekDoc = await weekRef.get();
    
    if (weekDoc.exists) {
      const existingChat = weekDoc.data()?.feedbackChat;
      const updateData: Record<string, unknown> = { feedbackChat: chatData };
      
      // Preserve original createdAt if it exists
      if (existingChat?.createdAt) {
        updateData.feedbackChat = { ...chatData, createdAt: existingChat.createdAt };
      } else {
        updateData.feedbackChat = { ...chatData, createdAt: FieldValue.serverTimestamp() };
      }
      
      await weekRef.update(updateData);
    } else {
      // Week doesn't exist yet, fall back to legacy collection
      const legacyRef = adminDb
        .collection('users')
        .doc(userId)
        .collection(LEGACY_COLLECTION_NAME)
        .doc(programId);
      
      await legacyRef.set({
        ...chatData,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  } else {
    // No weekId, use legacy storage
    const legacyRef = adminDb
      .collection('users')
      .doc(userId)
      .collection(LEGACY_COLLECTION_NAME)
      .doc(programId);
    
    const existingDoc = await legacyRef.get();
    if (existingDoc.exists && existingDoc.data()?.createdAt) {
      await legacyRef.update(chatData);
    } else {
      await legacyRef.set({
        ...chatData,
        createdAt: FieldValue.serverTimestamp(),
      });
    }
  }
}
