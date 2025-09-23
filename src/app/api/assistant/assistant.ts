import { ExerciseQuestionnaireAnswers } from '../../../../shared/types';
import {
  OpenAIMessage,
  ChatPayload,
  DiagnosisAssistantResponse,
} from '../../types';

interface AssistantResponse {
  assistantId: string;
  threadId: string;
}

interface MessagesResponse {
  messages: OpenAIMessage[];
  payload?: ChatPayload;
}

export async function getOrCreateAssistant(): Promise<AssistantResponse> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'initialize' }),
  });

  if (!response.ok) {
    throw new Error('Failed to initialize assistant');
  }

  return response.json();
}

export async function createThread(): Promise<AssistantResponse> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ action: 'initialize' }),
  });

  if (!response.ok) {
    throw new Error('Failed to create thread');
  }

  return response.json();
}

export async function sendMessage(
  threadId: string,
  payload: ChatPayload,
  onStream?: (content: string, payload?: ChatPayload) => void
): Promise<MessagesResponse> {
  // Try to include user context for rate limiting if available
  let userId: string | undefined;
  let isSubscriber: boolean | undefined;
  try {
    const raw = window.localStorage.getItem('musco_user');
    if (raw) {
      const parsed = JSON.parse(raw);
      userId = parsed?.uid || undefined;
      isSubscriber = !!parsed?.profile?.isSubscriber;
    }
  } catch {}
  const transformedPayload = {
    message: payload.message,
    userPreferences: payload.userPreferences,
    selectedBodyGroupName: payload.selectedBodyGroupName,
    selectedBodyPart:
      payload.selectedBodyPart || 'no body part of body group selected',
    bodyPartsInSelectedGroup: payload.bodyPartsInSelectedGroup,
    language: payload.language,
    diagnosisAssistantResponse: payload.diagnosisAssistantResponse,
    mode: payload.mode,
    previousQuestions: payload.previousQuestions,
    // Prefer values provided by caller (useChat with useAuth) and fall back to localStorage
    userId: (payload as any).userId ?? userId,
    isSubscriber: (payload as any).isSubscriber ?? isSubscriber,
  };

  // Start both requests in parallel
  const startTime = performance.now(); // Record start time
  const messagePromise = fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      // Prefer chat-completions fast path which ignores threadId
      action: 'send_message_chat',
      threadId,
      payload: {
        ...transformedPayload,
        // Prefer messages passed by caller; fallback to cached snapshot
        messages: (payload as any).messages ?? buildSimpleHistoryFromDOMOrCache(),
      },
      stream: !!onStream,
    }),
  });

  // Wait for message response
  const response = await messagePromise;
  if (!response.ok) {
    // Try to surface structured error so UI can react consistently
    try {
      const data = await response.json();
      if (onStream && data && (data.error === 'free_limit_exceeded' || data.error === 'stream_error')) {
        onStream('', { ...(payload as any), error: data.error } as any);
        return { messages: [] } as any;
      }
      console.error('[assistant.sendMessage] HTTP error', response.status, data);
    } catch {
      try {
        const text = await response.text();
        console.error('[assistant.sendMessage] HTTP error', response.status, text);
      } catch {}
    }
    throw new Error('Failed to send message');
  }

  if (onStream) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    let firstChunkReceived = false; // Flag to track first chunk

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();

        // Measure time to first chunk
        if (!firstChunkReceived && value) {
            const firstChunkTime = performance.now();
            console.log(`Time to first stream chunk: ${firstChunkTime - startTime} ms`);
            firstChunkReceived = true;
        }

        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter((line) => line.trim() !== '');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content || parsed.payload) {
                onStream(parsed.content || '', parsed.payload);
              }
            } catch (e) {
              console.error('Error parsing stream data:', e);
            }
          }
        }
      }
    } catch (streamError) {
        console.error('Error reading stream:', streamError);
        // Re-throw the error so the calling hook can handle it
        throw new Error(`Stream reading failed: ${streamError.message}`);
    } finally {
      reader.releaseLock();
    }

    // Streaming path returns no thread messages; construct a minimal response
    return { messages: [] } as any;
  }

  // For non-streaming responses, wait for both requests
  const messageResult = await response.json();

  return messageResult;
}

// Build a lightweight history array from cached chat state if present
function buildSimpleHistoryFromDOMOrCache(): Array<{ role: 'user' | 'assistant' | 'system'; content: string }> | undefined {
  try {
    const raw = window.sessionStorage.getItem('chat_snapshot');
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const messages = Array.isArray(parsed?.messages) ? parsed.messages : [];
    // Map only last few items to reduce token usage
    const last = messages.slice(-8).map((m: any) => ({ role: m.role, content: m.content }));
    return last;
  } catch {
    return undefined;
  }
}

export async function getMessages(threadId: string): Promise<MessagesResponse> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'get_messages',
      threadId,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get messages');
  }

  return response.json();
}

export async function generateExerciseProgram(
  diagnosisData: DiagnosisAssistantResponse,
  userInfo: ExerciseQuestionnaireAnswers,
  userId?: string,
  diagnosisId?: string
) {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generate_exercise_program',
      payload: {
        diagnosisData,
        userInfo,
        userId,
        diagnosisId,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate exercise program');
  }

  return response.json();
}
