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

export async function sendMessage(threadId: string, message: string, bodyPart?: string): Promise<MessagesResponse> {
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
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to send message');
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