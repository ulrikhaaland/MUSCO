import { NextResponse } from 'next/server';
import {
  getOrCreateAssistant,
  createThread,
  addMessage,
  streamRunResponse,
  getMessages,
  generateFollowUpQuestions,
  generateExerciseProgram,
} from '@/app/api/assistant/openai-server';
import { OpenAIMessage } from '@/app/types';

export async function POST(request: Request) {
  try {
    const { action, threadId, payload, stream } = await request.json();

    switch (action) {
      case 'initialize': {
        const assistant = await getOrCreateAssistant(
          'asst_e1prLG3Ykh2ZCVspoAFMZPZC'
        );
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
        const assistant = await getOrCreateAssistant(
          'asst_e1prLG3Ykh2ZCVspoAFMZPZC'
        );

        // Add the message to the thread
        await addMessage(threadId, payload);

        if (stream) {
          // Set up streaming response
          const encoder = new TextEncoder();
          const customReadable = new ReadableStream({
            async start(controller) {
              try {
                await streamRunResponse(threadId, assistant.id, (content) => {
                  const chunk = encoder.encode(
                    `data: ${JSON.stringify({ content })}\n\n`
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

      case 'generate_follow_up': {
        if (!payload) {
          return NextResponse.json(
            { error: 'Payload is required' },
            { status: 400 }
          );
        }

        const followUpQuestions = await generateFollowUpQuestions(payload);
        return NextResponse.json(followUpQuestions);
      }

      case 'generate_exercise_program': {
        if (!payload) {
          return NextResponse.json(
            { error: 'Payload is required' },
            { status: 400 }
          );
        }

        const program = await generateExerciseProgram(payload);
        return NextResponse.json(program);
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
