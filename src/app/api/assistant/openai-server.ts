import OpenAI from 'openai';
import { ChatPayload } from '../../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create or load the assistant
export async function getOrCreateAssistant() {
  try {
    const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;
    const assistant = await openai.beta.assistants.retrieve(ASSISTANT_ID);

    return assistant;
  } catch (error) {
    console.error('Error in getOrCreateAssistant:', error);
    throw new Error('Failed to initialize assistant');
  }
}

// Create a new thread
export async function createThread() {
  try {
    return await openai.beta.threads.create();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create conversation thread');
  }
}

// Add a message to a thread
export async function addMessage(threadId: string, payload: ChatPayload) {
  try {
    const content = JSON.stringify(payload);
    console.log('Adding message to thread:', content);
    return await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message to thread');
  }
}

// Run the assistant on a thread with streaming
export async function streamRunResponse(
  threadId: string,
  assistantId: string,
  onMessage: (content: string) => void
) {
  try {
    const stream = await openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    stream
      .on('textCreated', () => {
        // Optional: Handle when text is created
      })
      .on('textDelta', (delta) => {
        if (delta.value) {
          onMessage(delta.value);
        }
      })
      .on('error', (error) => {
        console.error('Stream error:', error);
        throw error;
      });

    await stream.done();
    return;
  } catch (error) {
    console.error('Error in streamRunResponse:', error);
    throw error;
  }
}

// Run the assistant on a thread (non-streaming)
export async function runAssistant(threadId: string, assistantId: string) {
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (
      runStatus.status === 'in_progress' ||
      runStatus.status === 'queued'
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (
      runStatus.status === 'failed' ||
      runStatus.status === 'cancelled' ||
      runStatus.status === 'expired'
    ) {
      throw new Error(`Run ended with status: ${runStatus.status}`);
    }

    // Get the messages after run completion
    const messages = await getMessages(threadId);
    return { runStatus, messages };
  } catch (error) {
    console.error('Error running assistant:', error);
    throw new Error('Failed to run assistant');
  }
}

// Get messages from a thread
export async function getMessages(threadId: string) {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error('Failed to get messages');
  }
}

// Generate follow-up questions using chat completions
export async function generateFollowUpQuestions(context: {
  messages: { role: string; content: string }[];
  bodyGroup: string;
  bodyPart: string;
  previousQuestions?: {
    questions: {
      title: string;
      description: string;
      question: string;
    }[];
    selected?: string;
  };
}) {
  try {
    const systemPrompt = `You are a follow-up question generator for a musculoskeletal learning app.

Your task is to generate 3 engaging follow-up questions based on the conversation history and current context.

Guidelines:
1. Questions should naturally flow from the current conversation
2. Avoid repeating previously suggested questions
3. Focus on the current body part being discussed
4. Each question should explore a different aspect (e.g., anatomy, exercises, injuries)
5. Make questions specific and actionable

Return exactly 3 questions in the following JSON format:
{
  "followUpQuestions": [
    {
      "title": "Brief, engaging title",
      "description": "One-line preview of what will be learned",
      "question": "The actual question to be asked"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: JSON.stringify({
            bodyGroup: context.bodyGroup,
            bodyPart: context.bodyPart,
            conversationHistory: context.messages,
            previousQuestions: context.previousQuestions,
          }),
        },
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    throw new Error('Failed to generate follow-up questions');
  }
}
