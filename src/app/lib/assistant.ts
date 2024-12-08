import { ChatMessage, OpenAIMessage } from '../types';

interface AssistantResponse {
  assistantId: string;
  threadId: string;
}

interface MessagesResponse {
  messages: OpenAIMessage[];
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
  message: string, 
  bodyPart?: string,
  onStream?: (chunk: string) => void
): Promise<MessagesResponse> {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'send_message',
      threadId,
      message,
      bodyPart,
      stream: !!onStream,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
  }

  if (onStream) {
    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim() !== '');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                onStream(parsed.content);
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

  return response.json();
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