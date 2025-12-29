/**
 * Pre-followup chat service for Firestore persistence.
 * Handles saving and loading pre-followup conversation state.
 * 
 * Storage: users/{userId}/programs/{programId}/weeks/{weekId} (feedbackChat field)
 * Fallback: users/{userId}/preFollowupChats/{programId} (for backwards compatibility)
 */

import {
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { ChatMessage, Question } from '../types';
import { PreFollowupFeedback, PreFollowupStructuredUpdates, ExerciseIntensityFeedback, DayCompletionStatus } from '../types/incremental-program';

const LEGACY_COLLECTION_NAME = 'preFollowupChats';

/**
 * State of a pre-followup chat session stored in Firestore
 */
export interface PreFollowupChatState {
  /** Full conversation history */
  messages: ChatMessage[];
  /** Current follow-up questions being displayed */
  followUpQuestions: Question[];
  /** Accumulated structured feedback from the conversation */
  accumulatedFeedback: {
    structuredUpdates?: PreFollowupStructuredUpdates;
    exerciseIntensity?: ExerciseIntensityFeedback[];
    overallIntensity?: 'increase' | 'maintain' | 'decrease';
    conversationalSummary: string;
  };
  /** Whether the LLM has indicated the conversation is complete */
  conversationComplete?: boolean;
  /** When the chat was created */
  createdAt: Date;
  /** When the chat was last updated */
  updatedAt: Date;
}

/**
 * Firestore document structure (with Firestore timestamps)
 */
interface PreFollowupChatDocument {
  messages: ChatMessage[];
  followUpQuestions: Question[];
  accumulatedFeedback: {
    structuredUpdates?: PreFollowupStructuredUpdates;
    exerciseIntensity?: ExerciseIntensityFeedback[];
    overallIntensity?: 'increase' | 'maintain' | 'decrease';
    conversationalSummary: string;
  };
  conversationComplete?: boolean;
  createdAt: ReturnType<typeof serverTimestamp> | Timestamp;
  updatedAt: ReturnType<typeof serverTimestamp> | Timestamp;
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
 * Get document reference for a user's pre-followup chat
 * Primary: stored in the week document
 * Fallback: legacy separate collection (for backwards compatibility)
 */
function getWeekDocRef(userId: string, programId: string, weekId: string) {
  return doc(db, `users/${userId}/programs/${programId}/weeks/${weekId}`);
}

function getLegacyChatDocRef(userId: string, programId: string) {
  return doc(db, `users/${userId}/${LEGACY_COLLECTION_NAME}/${programId}`);
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
 * Save or update a pre-followup chat session
 * Stores in the week document as a 'feedbackChat' field
 */
export async function savePreFollowupChat(
  userId: string,
  programId: string,
  weekId: string | undefined,
  state: Omit<PreFollowupChatState, 'createdAt' | 'updatedAt'>
): Promise<void> {
  // Clean accumulated feedback of undefined values (Firestore doesn't accept undefined)
  const cleanedFeedback = removeUndefined(state.accumulatedFeedback);

  const chatData: PreFollowupChatDocument = {
    messages: state.messages,
    followUpQuestions: state.followUpQuestions,
    accumulatedFeedback: cleanedFeedback,
    conversationComplete: state.conversationComplete ?? false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  if (weekId) {
    // Store in week document
    const weekRef = getWeekDocRef(userId, programId, weekId);
    const weekDoc = await getDoc(weekRef);
    
    if (weekDoc.exists()) {
      const existingChat = weekDoc.data().feedbackChat;
      if (existingChat?.createdAt) {
        chatData.createdAt = existingChat.createdAt;
      }
      await updateDoc(weekRef, { feedbackChat: chatData });
    } else {
      // Week doesn't exist yet, fall back to legacy
      const legacyRef = getLegacyChatDocRef(userId, programId);
      await setDoc(legacyRef, chatData);
    }
  } else {
    // No weekId, use legacy storage
    const legacyRef = getLegacyChatDocRef(userId, programId);
    const existingDoc = await getDoc(legacyRef);
    if (existingDoc.exists() && existingDoc.data().createdAt) {
      chatData.createdAt = existingDoc.data().createdAt;
    }
    await setDoc(legacyRef, chatData);
  }
}

/**
 * Load a pre-followup chat session if it exists
 * Checks week document first, then falls back to legacy collection
 */
export async function loadPreFollowupChat(
  userId: string,
  programId: string,
  weekId: string | undefined
): Promise<PreFollowupChatState | null> {
  // Try week document first
  if (weekId) {
    const weekRef = getWeekDocRef(userId, programId, weekId);
    const weekSnap = await getDoc(weekRef);
    
    if (weekSnap.exists()) {
      const weekData = weekSnap.data();
      if (weekData.feedbackChat) {
        const data = weekData.feedbackChat as PreFollowupChatDocument;
        return {
          messages: data.messages || [],
          followUpQuestions: data.followUpQuestions || [],
          accumulatedFeedback: data.accumulatedFeedback || { conversationalSummary: '' },
          conversationComplete: data.conversationComplete ?? false,
          createdAt: convertTimestamp(data.createdAt as Timestamp | null),
          updatedAt: convertTimestamp(data.updatedAt as Timestamp | null),
        };
      }
    }
  }

  // Fall back to legacy collection
  const legacyRef = getLegacyChatDocRef(userId, programId);
  const legacySnap = await getDoc(legacyRef);

  if (!legacySnap.exists()) {
    return null;
  }

  const data = legacySnap.data() as PreFollowupChatDocument;

  return {
    messages: data.messages || [],
    followUpQuestions: data.followUpQuestions || [],
    accumulatedFeedback: data.accumulatedFeedback || { conversationalSummary: '' },
    conversationComplete: data.conversationComplete ?? false,
    createdAt: convertTimestamp(data.createdAt as Timestamp | null),
    updatedAt: convertTimestamp(data.updatedAt as Timestamp | null),
  };
}

/**
 * Delete a pre-followup chat session (called after generating follow-up program)
 * Note: We keep the feedbackChat in the week document for historical reference
 * but delete the legacy collection entry if it exists
 */
export async function deletePreFollowupChat(
  userId: string,
  programId: string,
  weekId: string | undefined
): Promise<void> {
  // Delete legacy collection entry if it exists
  const legacyRef = getLegacyChatDocRef(userId, programId);
  try {
    await deleteDoc(legacyRef);
  } catch {
    // Ignore if doesn't exist
  }

  // Optionally clear the feedbackChat from week document
  // (keeping it for historical reference, but could clear if needed)
  if (weekId) {
    const weekRef = getWeekDocRef(userId, programId, weekId);
    const weekSnap = await getDoc(weekRef);
    if (weekSnap.exists() && weekSnap.data().feedbackChat) {
      // Mark as completed rather than deleting
      await updateDoc(weekRef, {
        'feedbackChat.completed': true,
        'feedbackChat.completedAt': serverTimestamp(),
      });
    }
  }
}

/**
 * Convert accumulated feedback to PreFollowupFeedback for program generation
 */
export function convertToPreFollowupFeedback(
  accumulatedFeedback: PreFollowupChatState['accumulatedFeedback']
): PreFollowupFeedback {
  // Prefer the LLM-generated feedbackSummary over raw conversational text
  const feedbackSummary = accumulatedFeedback.structuredUpdates?.feedbackSummary;
  const conversationalFeedback = feedbackSummary || accumulatedFeedback.conversationalSummary;
  
  // Also prefer overallIntensity from structuredUpdates if available
  const overallIntensity = accumulatedFeedback.structuredUpdates?.overallIntensity || accumulatedFeedback.overallIntensity;
  
  return {
    structuredUpdates: accumulatedFeedback.structuredUpdates,
    exerciseIntensity: accumulatedFeedback.exerciseIntensity,
    overallIntensity,
    conversationalFeedback,
  };
}

/**
 * Update program days with completion status
 * Called when user provides workout completion feedback during pre-followup chat
 */
export async function updateProgramCompletion(
  userId: string,
  programId: string,
  allCompleted: boolean,
  dayCompletionStatus?: DayCompletionStatus[]
): Promise<void> {
  const programRef = doc(db, `users/${userId}/programs/${programId}`);
  const programDoc = await getDoc(programRef);
  
  if (!programDoc.exists()) {
    console.warn('[preFollowupChatService] Program not found for completion update:', programId);
    return;
  }

  const programData = programDoc.data();
  const days = programData.days || [];
  const now = new Date().toISOString();

  // Update each day's completion status
  const updatedDays = days.map((day: { day: number }) => {
    if (allCompleted) {
      return { ...day, completed: true, completedAt: now };
    }
    
    // Find specific completion status for this day
    const status = dayCompletionStatus?.find(s => s.day === day.day);
    if (status) {
      return { 
        ...day, 
        completed: status.completed,
        completedAt: status.completed ? now : null
      };
    }
    
    return day;
  });

  await updateDoc(programRef, {
    days: updatedDays,
    updatedAt: now,
  });
}

/**
 * Merge new feedback from an LLM response into accumulated feedback
 */
export function mergeAccumulatedFeedback(
  existing: PreFollowupChatState['accumulatedFeedback'],
  newFeedback: {
    structuredUpdates?: PreFollowupStructuredUpdates;
    exerciseIntensity?: ExerciseIntensityFeedback[];
    conversationalSummary?: string;
  }
): PreFollowupChatState['accumulatedFeedback'] {
  return {
    structuredUpdates: {
      ...existing.structuredUpdates,
      ...newFeedback.structuredUpdates,
    },
    exerciseIntensity: [
      ...(existing.exerciseIntensity || []),
      ...(newFeedback.exerciseIntensity || []),
    ].filter((item, index, self) => 
      // Deduplicate by exerciseId, keeping the latest
      self.findIndex(i => i.exerciseId === item.exerciseId) === index
    ),
    overallIntensity: newFeedback.structuredUpdates?.painLevelChange 
      ? (newFeedback.structuredUpdates.painLevelChange === 'better' ? 'increase' : 
         newFeedback.structuredUpdates.painLevelChange === 'worse' ? 'decrease' : 'maintain')
      : existing.overallIntensity,
    conversationalSummary: newFeedback.conversationalSummary 
      ? `${existing.conversationalSummary} ${newFeedback.conversationalSummary}`.trim()
      : existing.conversationalSummary,
  };
}

