import OpenAI from 'openai';
import { ChatPayload } from '../../types';
import { exploreSystemPrompt } from '../prompts/explorePrompt';

// Dedicated OpenAI client instance for exploration assistant
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Ensure an exploration assistant exists and return its id.
 * Optionally supply an existing assistant id via env EXPLORE_ASSISTANT_ID.
 */
export async function getOrCreateExploreAssistant(): Promise<string> {
  const cachedId = process.env.EXPLORE_ASSISTANT_ID;
  if (cachedId) {
    try {
      // Verify it exists
      await openai.beta.assistants.retrieve(cachedId);
      return cachedId;
    } catch (e) {
      console.warn('[ExploreAssistant] EXPLORE_ASSISTANT_ID not found, will create new assistant');
    }
  }

  const assistant = await openai.beta.assistants.create({
    name: 'Musco Explore Assistant',
    instructions: exploreSystemPrompt,
    model: 'gpt-4.1',
    tools: [],
  });

  return assistant.id;
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
) {
  const stream = await openai.beta.threads.runs.stream(threadId, {
    assistant_id: assistantId,
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
