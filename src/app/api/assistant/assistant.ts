import {
  OpenAIMessage,
  ChatPayload,
  Question,
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
  onStream?: (content: string, payload?: ChatPayload) => void,
  onFollowUpQuestions?: (questions: {
    followUpQuestions: {
      title: string;
      description: string;
      question: string;
    }[];
  }) => void
): Promise<MessagesResponse> {
  const transformedPayload = {
    message: payload.message,
    userPreferences: payload.userPreferences,
    selectedBodyGroupName: payload.selectedBodyGroupName,
    selectedBodyPart:
      payload.selectedBodyPart || 'no body part of body group selected',
    bodyPartsInSelectedGroup: payload.bodyPartsInSelectedGroup,
  };

  // Start both requests in parallel
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

  // Start follow-up questions generation in parallel
  const followUpPromise = fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generate_follow_up',
      payload: {
        messages: [{ role: 'user', content: payload.message }],
        selectedBodyPartName: payload.selectedBodyPart?.name || '',
        selectedGroupName: payload.selectedBodyGroupName,
        bodyPartsInSelectedGroup: payload.bodyPartsInSelectedGroup,
        previousQuestions: {
          questions: payload.previousQuestions || [],
          selected: payload.message,
        },
      },
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

    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    try {
      // Handle follow-up questions in parallel while streaming
      followUpPromise
        .then(async (followUpResponse) => {
          if (followUpResponse.ok) {
            const questions = await followUpResponse.json();
            onFollowUpQuestions?.(questions);
          }
        })
        .catch(console.error);

      while (true) {
        const { done, value } = await reader.read();
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
  const [messageResult, followUpResult] = await Promise.all([
    response.json(),
    followUpPromise.then((r) => (r.ok ? r.json() : null)).catch(() => null),
  ]);

  if (followUpResult) {
    onFollowUpQuestions?.(followUpResult);
  }

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

export async function generateFollowUp(
  messages: { role: string; content: string }[],
  selectedBodyPartName: string,
  selectedGroupName: string,
  bodyPartsInSelectedGroup: string[],
  previousQuestions?: Question[]
) {
  const payload = {
    messages,
    selectedBodyPartName: selectedBodyPartName,
    selectedGroupName: selectedGroupName,
    bodyPartsInSelectedGroup: bodyPartsInSelectedGroup,
    previousQuestions: previousQuestions || [],
  };

  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generate_follow_up',
      payload: payload,
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate follow-up questions');
  }

  return response.json();
}

export async function generateExerciseProgram(
  diagnosis: DiagnosisAssistantResponse,
  questionnaire: {
    selectedBodyGroup?: string;
    selectedBodyPart?: string;
    age: string;
    pastExercise: string;
    plannedExercise: string;
    painAreas: string[];
    exercisePain: boolean;
    painfulAreas: string[];
    trainingType: string;
    trainingLocation: string;
  }
) {
  const response = await fetch('/api/assistant', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      action: 'generate_exercise_program',
      payload: {
        diagnosis,
        questionnaire,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate exercise program');
  }

  return response.json();
}
