import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Create or load the assistant
export async function getOrCreateAssistant() {
  try {
    const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID;

    if (ASSISTANT_ID) {
      return await openai.beta.assistants.retrieve(ASSISTANT_ID);
    }

    // Create a new assistant if one doesn't exist
    const assistant = await openai.beta.assistants.create({
      name: 'Musculoskeletal Health Assistant',
      instructions: `You are a knowledgeable assistant specializing in musculoskeletal health and anatomy. 
                    Your purpose is to help users understand and address their musculoskeletal issues.
                    When discussing a specific body part, keep responses focused on that part and provide accurate, 
                    helpful information about anatomy, common issues, exercises, and recovery.
                    When suggesting exercises or programs, consider the user's specific situation and preferences.
                    Format your responses using markdown with proper headers, bullet points, and emphasis.`,
      model: 'gpt-4-1106-preview',
      tools: [{ type: 'code_interpreter' }],
    });

    console.log('Created new assistant with ID:', assistant.id);
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
export async function addMessage(
  threadId: string,
  content: string,
  bodyPart?: string
) {
  try {
    const messageContent = bodyPart
      ? `[Regarding ${bodyPart}] ${content}`
      : content;

    return await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content: messageContent,
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
    // const run = await openai.beta.threads.runs.create(threadId, {
    //   assistant_id: assistantId,
    // });

    const stream = await openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    stream
      .on('textCreated', () => {
        // Optional: Handle when text is created
      })
      .on('textDelta', (delta) => {
        if (delta.value) {
          console.log(delta.value);
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

    return runStatus;
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
