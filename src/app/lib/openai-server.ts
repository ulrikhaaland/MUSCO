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
      name: "Musculoskeletal Health Assistant",
      instructions: `You are a knowledgeable assistant specializing in musculoskeletal health and anatomy. 
                    Your purpose is to help users understand and address their musculoskeletal issues.
                    When discussing a specific body part, keep responses focused on that part and provide accurate, 
                    helpful information about anatomy, common issues, exercises, and recovery.
                    When suggesting exercises or programs, consider the user's specific situation and preferences.`,
      model: "gpt-4-1106-preview",
      tools: [{ type: "code_interpreter" }],
    });

    // Log the new assistant ID - make sure to save it to your environment variables
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
export async function addMessage(threadId: string, content: string, bodyPart?: string) {
  try {
    const messageContent = bodyPart 
      ? `[Regarding ${bodyPart}] ${content}`
      : content;

    return await openai.beta.threads.messages.create(
      threadId,
      {
        role: "user",
        content: messageContent,
      }
    );
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message to thread');
  }
}

// Run the assistant on a thread
export async function runAssistant(threadId: string, assistantId: string) {
  try {
    const run = await openai.beta.threads.runs.create(
      threadId,
      { assistant_id: assistantId }
    );
    return run;
  } catch (error) {
    console.error('Error running assistant:', error);
    throw new Error('Failed to run assistant');
  }
}

// Check the status of a run
export async function checkRunStatus(threadId: string, runId: string) {
  try {
    return await openai.beta.threads.runs.retrieve(threadId, runId);
  } catch (error) {
    console.error('Error checking run status:', error);
    throw new Error('Failed to check run status');
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

// Helper function to wait for run completion
export async function waitForRunCompletion(threadId: string, runId: string) {
  const maxAttempts = 60; // Maximum number of attempts (10 minutes with 10-second intervals)
  let attempts = 0;

  while (attempts < maxAttempts) {
    const run = await checkRunStatus(threadId, runId);
    
    if (run.status === 'completed') {
      return run;
    }
    
    if (run.status === 'failed' || run.status === 'cancelled' || run.status === 'expired') {
      throw new Error(`Run ended with status: ${run.status}`);
    }
    
    // Wait for 10 seconds before checking again
    await new Promise(resolve => setTimeout(resolve, 10000));
    attempts++;
  }

  throw new Error('Run timed out');
} 