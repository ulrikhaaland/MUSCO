import { NextResponse } from 'next/server';
import { 
  getOrCreateAssistant, 
  createThread, 
  addMessage, 
  runAssistant, 
  waitForRunCompletion, 
  getMessages 
} from '@/app/lib/openai-server';
import { OpenAIMessage } from '@/app/types';

export async function POST(request: Request) {
  try {
    const { action, threadId, message, bodyPart } = await request.json();

    switch (action) {
      case 'initialize': {
        const assistant = await getOrCreateAssistant();
        const thread = await createThread();
        return NextResponse.json({ assistantId: assistant.id, threadId: thread.id });
      }

      case 'send_message': {
        if (!threadId) {
          return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
        }

        // Get the assistant ID (you might want to store this in an environment variable)
        const assistant = await getOrCreateAssistant();
        
        // Add the message to the thread
        await addMessage(threadId, message, bodyPart);
        
        // Run the assistant
        const run = await runAssistant(threadId, assistant.id);
        
        // Wait for completion
        await waitForRunCompletion(threadId, run.id);
        
        // Get the messages
        const messages = await getMessages(threadId);
        
        return NextResponse.json({ messages: messages as OpenAIMessage[] });
      }

      case 'get_messages': {
        if (!threadId) {
          return NextResponse.json({ error: 'Thread ID is required' }, { status: 400 });
        }

        const messages = await getMessages(threadId);
        return NextResponse.json({ messages: messages as OpenAIMessage[] });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in assistant API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 