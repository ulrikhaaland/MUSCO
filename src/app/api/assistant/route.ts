import { NextResponse } from 'next/server';
import {
  getOrCreateAssistant,
  createThread,
  addMessage,
  streamRunResponse,
  getMessages,
  generateFollowUpQuestions,
  generateExerciseProgram,
  generateExerciseProgramWithModel,
} from '@/app/api/assistant/openai-server';
import { OpenAIMessage } from '@/app/types';
import { ProgramStatus } from '@/app/types/program';
import { ExerciseProgram } from '@/app/types/program';

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

        try {
          const program = await generateExerciseProgramWithModel({
            diagnosisData: payload.diagnosisData,
            userInfo: payload.userInfo,
            userId: payload.userId,
            programId: payload.programId,
            assistantId: payload.assistantId,
            language: payload.language || 'en'
          });

          return NextResponse.json({
            program,
            status: ProgramStatus.Done,
          });
        } catch (error) {
          console.error('Error generating program:', error);
          return NextResponse.json({
            error: 'Failed to generate program',
            status: ProgramStatus.Error,
          }, { status: 500 });
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
          const assistantId = payload.assistantId || 'asst_PjMTzHis7vLSeDZRhbBB1tbe';
          
          const program = await generateExerciseProgramWithModel({
            diagnosisData: payload.diagnosisData,
            userInfo: payload.userInfo,
            userId: payload.userId,
            programId: payload.programId,
            assistantId: assistantId,
            isFollowUp: true, // Flag to indicate this is a follow-up week
            previousProgram: payload.previousProgram, // Pass the previous program data
            language: payload.language || 'en' // Add language parameter with default fallback
          });

          return NextResponse.json({
            program,
            status: ProgramStatus.Done,
          });
        } catch (error) {
          console.error('Error generating follow-up program:', error);
          return NextResponse.json({
            error: 'Failed to generate follow-up program',
            status: ProgramStatus.Error,
          }, { status: 500 });
        }
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
