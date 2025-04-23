import { ExerciseQuestionnaireAnswers } from '@/app/shared/types';
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
  const transformedPayload = {
    message: payload.message,
    userPreferences: payload.userPreferences,
    selectedBodyGroupName: payload.selectedBodyGroupName,
    selectedBodyPart:
      payload.selectedBodyPart || 'no body part of body group selected',
    bodyPartsInSelectedGroup: payload.bodyPartsInSelectedGroup,
    language: payload.language,
  };

  // Start both requests in parallel
  const startTime = performance.now(); // Record start time
  const messagePromise = fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'send_message',
      threadId,
      payload: transformedPayload,
      stream: !!onStream,
    }),
  });

  // Wait for message response
  const response = await messagePromise;
  if (!response.ok) {
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
    } finally {
      reader.releaseLock();
    }

    // Get final messages after streaming is complete
    const finalResponse = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'get_messages',
        threadId,
      }),
    });

    if (!finalResponse.ok) {
      throw new Error('Failed to get final messages');
    }

    return finalResponse.json();
  }

  // For non-streaming responses, wait for both requests
  const messageResult = await response.json();

  return messageResult;
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
