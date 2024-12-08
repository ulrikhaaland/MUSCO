import OpenAI from 'openai';
import { ChatPayload } from '../types';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract JSON from text
function extractJsonFromText(text: string): {
  payload: ChatPayload | null;
  cleanText: string;
} {
  try {
    const jsonStartIndex = text.indexOf('{');
    if (jsonStartIndex === -1) {
      return { payload: null, cleanText: text };
    }

    const jsonSubstring = text.slice(jsonStartIndex);

    // Find the last matching closing brace
    let braceCount = 0;
    let jsonEndIndex = -1;

    for (let i = 0; i < jsonSubstring.length; i++) {
      if (jsonSubstring[i] === '{') braceCount++;
      if (jsonSubstring[i] === '}') {
        braceCount--;
        if (braceCount === 0) {
          jsonEndIndex = i + 1;
          break;
        }
      }
    }

    if (jsonEndIndex === -1) {
      return { payload: null, cleanText: text };
    }

    const jsonStr = jsonSubstring.slice(0, jsonEndIndex);

    const cleanText = text.slice(0, jsonStartIndex).trim();

    try {
      const payload = JSON.parse(jsonStr) as ChatPayload;
      return { payload, cleanText };
    } catch (error) {
      return { payload: null, cleanText: text };
    }
  } catch (error) {
    return { payload: null, cleanText: text };
  }
}

// Create or load the assistant
export async function getOrCreateAssistant() {
  try {
    const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID!;
    return await openai.beta.assistants.retrieve(ASSISTANT_ID);
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
    // If we have a payload, append it as a system message
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
  onMessage: (content: string, payload?: ChatPayload) => void
) {
  try {
    let accumulatedText = '';
    let isCollectingJson = false;
    const stream = await openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    stream
      .on('textCreated', () => {
        // Optional: Handle when text is created
      })
      .on('textDelta', (delta) => {
        if (delta.value) {
          if (isCollectingJson) {
            // If we're collecting JSON, just accumulate without sending to UI
            accumulatedText += delta.value;
          } else {
            // Check if this delta contains the start of a JSON object
            const jsonStartIndex = delta.value.indexOf('{');

            if (jsonStartIndex !== -1) {
              // Send only the text before the JSON
              const textContent = delta.value.slice(0, jsonStartIndex);
              if (textContent) {
                onMessage(textContent);
              }

              // Start collecting JSON
              isCollectingJson = true;
              accumulatedText = delta.value.slice(jsonStartIndex);
            } else {
              // No JSON found, send the content normally
              onMessage(delta.value);
            }
          }

          // Try to extract JSON if we're collecting it
          if (isCollectingJson) {
            console.log('isCollectingJson', accumulatedText);
            const { payload } = extractJsonFromText(accumulatedText);
            if (payload) {
              console.log('Extracted payload:', payload);
              onMessage('', payload);
              // Reset for next message
              accumulatedText = '';
              isCollectingJson = false;
            }
          }
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
    const lastMessage = messages[0]; // Most recent message

    if (lastMessage && typeof lastMessage.content === 'string') {
      const payload = extractJsonFromText(lastMessage.content);
      return { runStatus, payload };
    }

    return { runStatus, payload: null };
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
