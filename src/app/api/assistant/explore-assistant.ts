import OpenAI from 'openai';
import { ChatPayload } from '../../types';
import { exploreSystemPrompt } from '../prompts/explorePrompt';

// Dedicated OpenAI client instance for exploration assistant
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Simple in-process cache to avoid re-creating assistants when env var isn't set
let exploreAssistantIdCache: string | undefined;

/**
 * Ensure an exploration assistant exists and return its id.
 * Optionally supply an existing assistant id via env EXPLORE_ASSISTANT_ID.
 */
export async function getOrCreateExploreAssistant(): Promise<string> {
  const cachedId = exploreAssistantIdCache || process.env.EXPLORE_ASSISTANT_ID;
  if (cachedId) {
    try {
      // Verify it exists and return cached ID
      await openai.beta.assistants.retrieve(cachedId);
      console.log('[ExploreAssistant] Using cached assistant:', cachedId);
      exploreAssistantIdCache = cachedId;
      return exploreAssistantIdCache;
    } catch {
      console.warn('[ExploreAssistant] EXPLORE_ASSISTANT_ID not found, creating new assistant');
    }
  }

  try {
    const assistant = await openai.beta.assistants.create({
      name: 'Musco Explore Assistant',
      instructions: exploreSystemPrompt,
      model: 'gpt-4.1-mini',
      tools: [],
    });

    console.log('[ExploreAssistant] Created new assistant:', assistant.id);
    exploreAssistantIdCache = assistant.id;
    return exploreAssistantIdCache;
  } catch (error) {
    console.error('[ExploreAssistant] Failed to create assistant:', error);
    throw new Error('Failed to create explore assistant');
  }
}

export async function createExploreThread() {
  const thread = await openai.beta.threads.create();
  return thread.id;
}

export async function addExploreMessage(threadId: string, payload: ChatPayload) {
  await openai.beta.threads.messages.create(threadId, {
    role: 'user',
    content: typeof payload === 'string' ? payload : JSON.stringify(payload),
  });
}

export async function streamExploreResponse(
  threadId: string,
  assistantId: string,
  onMessage: (content: string) => void,
  instructions?: string,
) {
  const stream = await openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
    ...(instructions ? { instructions } : {}),
  });

  stream
    .on('textDelta', (delta) => {
      if (delta.value) onMessage(delta.value);
    })
    .on('error', (err) => {
      console.error('[ExploreAssistant] stream error', err);
    });

  await stream.done();
}

/**
 * Convenience helper: add message then stream assistant response.
 */
export async function sendExploreChat(
  threadId: string,
  assistantId: string,
  payload: ChatPayload,
  onContent: (content: string) => void,
) {
  await addExploreMessage(threadId, payload);
  await streamExploreResponse(threadId, assistantId, onContent);
}
