import { NextResponse } from 'next/server';
import {
  getOrCreateAssistant,
  createThread,
  addMessage,
  streamRunResponse,
  getMessages,
  generateExerciseProgramWithModel,
} from '@/app/api/assistant/openai-server';
import { OpenAIMessage } from '@/app/types';
import { ProgramStatus } from '@/app/types/program';

export async function POST(request: Request) {
  const handlerStartTime = performance.now();
  console.log(`[API Route] POST /api/assistant received.`);
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
        const sendMessageStartTime = performance.now();
        console.log(`[API Route] Action: send_message started. Stream: ${stream}. Time since handler start: ${sendMessageStartTime - handlerStartTime} ms`);

        if (!threadId) {
          return NextResponse.json(
            { error: 'Thread ID is required' },
            { status: 400 }
          );
        }

        // Hardcoded Assistant ID for this path
        const assistantId = 'asst_e1prLG3Ykh2ZCVspoAFMZPZC';

        // Add the message to the thread (no need to get assistant object here)
        const preStreamStartTime = performance.now();
        console.log(`[API Route] Starting pre-stream OpenAI call (addMessage)...`);
        await addMessage(threadId, payload);
        const preStreamEndTime = performance.now();
        console.log(`[API Route] Finished pre-stream OpenAI call (addMessage). Duration: ${preStreamEndTime - preStreamStartTime} ms`);

        if (stream) {
          // Set up streaming response
          const encoder = new TextEncoder();
          let firstChunkSent = false;
          const streamSetupTime = performance.now();
          console.log(`[API Route] Starting stream setup. Time since send_message start: ${streamSetupTime - sendMessageStartTime} ms`);

          const customReadable = new ReadableStream({
            async start(controller) {
              const streamStartTime = performance.now();
              console.log(`[API Route] ReadableStream start() called. Time since stream setup: ${streamStartTime - streamSetupTime} ms`);
              try {
                const callOpenAIStreamStartTime = performance.now();
                console.log(`[API Route] Calling streamRunResponse... Time since stream start: ${callOpenAIStreamStartTime - streamStartTime} ms`);

                // Use the hardcoded assistantId directly
                await streamRunResponse(threadId, assistantId, (content) => {
                  const openaiStreamChunkReceivedTime = performance.now();
                  if (!firstChunkSent) {
                    console.log(`[API Route] First chunk RECEIVED from OpenAI stream. Time since calling streamRunResponse: ${openaiStreamChunkReceivedTime - callOpenAIStreamStartTime} ms`);
                  }

                  const chunk = encoder.encode(
                    `data: ${JSON.stringify({ content })}\n\n`
                  );
                  controller.enqueue(chunk);
                  if (!firstChunkSent) {
                     const firstChunkSentTime = performance.now();
                     console.log(`[API Route] First chunk ENQUEUED to client response. Time since receiving from OpenAI: ${firstChunkSentTime - openaiStreamChunkReceivedTime} ms`);
                     firstChunkSent = true;
                  }
                });

                const streamFinishedTime = performance.now();
                console.log(`[API Route] streamRunResponse finished. Total stream duration: ${streamFinishedTime - callOpenAIStreamStartTime} ms`);

                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (error) {
                console.error('[API Route] Error during stream:', error);
                controller.error(error);
              }
            },
          });

          const returnResponseTime = performance.now();
          console.log(`[API Route] Returning streaming response object. Time since stream setup: ${returnResponseTime - streamSetupTime} ms`);
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

      case 'generate_exercise_program': {
        if (!payload) {
          return NextResponse.json(
            { error: 'Payload is required' },
            { status: 400 }
          );
        }

        try {
          const program = await generateExerciseProgramWithModel({
            diagnosisData: payload.diagnosisData,
            userInfo: payload.userInfo,
            userId: payload.userId,
            programId: payload.programId,
            assistantId: payload.assistantId,
            language: payload.language || 'en',
          });

          return NextResponse.json({
            program,
            status: ProgramStatus.Done,
          });
        } catch (error) {
          console.error('Error generating program:', error);
          return NextResponse.json(
            {
              error: 'Failed to generate program',
              status: ProgramStatus.Error,
            },
            { status: 500 }
          );
        }
      }

      case 'generate_follow_up_program': {
        if (!payload) {
          return NextResponse.json(
            { error: 'Payload is required' },
            { status: 400 }
          );
        }

        // Define a specific type for the payload for this case
        interface FollowUpProgramPayload {
          diagnosisData: any;
          userInfo: any;
          userId: string;
          programId: string;
          assistantId?: string;
          previousProgram?: any[];
          language?: string;
        }

        try {
          // Use the provided assistantId or fall back to default
          const assistantId =
            payload.assistantId || 'asst_PjMTzHis7vLSeDZRhbBB1tbe';

          const program = await generateExerciseProgramWithModel({
            diagnosisData: payload.diagnosisData,
            userInfo: payload.userInfo,
            userId: payload.userId,
            programId: payload.programId,
            assistantId: assistantId,
            isFollowUp: true, // Flag to indicate this is a follow-up week
            previousProgram: payload.previousProgram, // Pass the previous program data
            language: payload.language || 'en', // Add language parameter with default fallback
          });

          return NextResponse.json({
            program,
            status: ProgramStatus.Done,
          });
        } catch (error) {
          console.error('Error generating follow-up program:', error);
          return NextResponse.json(
            {
              error: 'Failed to generate follow-up program',
              status: ProgramStatus.Error,
            },
            { status: 500 }
          );
        }
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    const errorTime = performance.now();
    console.error(`[API Route] Error in assistant API: ${error}. Time since handler start: ${errorTime - handlerStartTime} ms`);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
