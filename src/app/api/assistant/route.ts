import { NextResponse } from 'next/server';
import {
  getOrCreateAssistant,
  createThread,
  addMessage,
  streamRunResponse,
  getMessages,
} from '@/app/lib/openai-server';
import { OpenAIMessage } from '@/app/types';

export async function POST(request: Request) {
  try {
    const { action, threadId, payload, stream } = await request.json();

    switch (action) {
      case 'initialize': {
        const assistant = await getOrCreateAssistant();
        const thread = await createThread();
        return NextResponse.json({
          assistantId: assistant.id,
          threadId: thread.id,
        });
      }

      case 'send_message': {
        if (!threadId) {
          return NextResponse.json(
            { error: 'Thread ID is required' },
            { status: 400 }
          );
        }

        // Get the assistant ID
        const assistant = await getOrCreateAssistant();

        // Add the message to the thread
        await addMessage(threadId, payload);

        if (stream) {
          // Set up streaming response
          const encoder = new TextEncoder();
          const customReadable = new ReadableStream({
            async start(controller) {
              try {
                await streamRunResponse(threadId, assistant.id, (content, streamPayload) => {
                  const chunk = encoder.encode(
                    `data: ${JSON.stringify({ content, payload: streamPayload })}\n\n`
                  );
                  controller.enqueue(chunk);
                });
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (error) {
                controller.error(error);
              }
            },
          });

          return new Response(customReadable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
            },
          });
        }

        const messages = await getMessages(threadId);
        return NextResponse.json({ messages: messages as OpenAIMessage[] });
      }

      case 'get_messages': {
        if (!threadId) {
          return NextResponse.json(
            { error: 'Thread ID is required' },
            { status: 400 }
          );
        }

        const messages = await getMessages(threadId);
        return NextResponse.json({ messages: messages as OpenAIMessage[] });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error in assistant API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
