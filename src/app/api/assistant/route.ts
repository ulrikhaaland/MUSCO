import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
// import OpenAI from 'openai';
import {
  getOrCreateAssistant,
  createThread,
  addMessage,
  getMessages,
  generateExerciseProgramWithModel,
  generateFollowUpExerciseProgram,
  runAssistant,
  streamRunResponse,
  reserveFreeChatTokens,
  reserveFreeChatTokensForAnon,
} from '@/app/api/assistant/openai-server';
import { OpenAIMessage } from '@/app/types';
import { ProgramStatus } from '@/app/types/program';
import { diagnosisSystemPrompt } from '@/app/api/prompts/diagnosisPrompt';
import { exploreSystemPrompt } from '@/app/api/prompts/explorePrompt';
import { getOrCreateExploreAssistant, streamExploreResponse } from '@/app/api/assistant/explore-assistant';

// OpenAI client not needed directly in this route after migration to helpers

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
        console.log(
          `[API Route] Action: send_message started. Stream: ${stream}. Time since handler start: ${sendMessageStartTime - handlerStartTime} ms`
        );

        if (!threadId) {
          return NextResponse.json(
            { error: 'Thread ID is required' },
            { status: 400 }
          );
        }

        // We previously fetched messages for chat completions; kept for future context if needed
        // const previousMessages = await getMessages(threadId);
        
        // Build per-run instructions (merge strategy) and prepend a language lock
        const basePrompt = payload?.mode === 'explore' ? exploreSystemPrompt : diagnosisSystemPrompt;
        const sessionLanguage = (payload?.language || 'en').toLowerCase();
        const languageLock = `\n<<LANGUAGE_LOCK>>\nSESSION_LANGUAGE=${sessionLanguage}\nRules:\n- All natural-language output (assistant bubble and followUpQuestions.question) must be in SESSION_LANGUAGE for the entire thread.\n- Do not switch languages mid-session unless SESSION_LANGUAGE changes.\n- JSON keys remain English (except user-provided content).\n<<LANGUAGE_LOCK_END>>\n`;
        const systemMessage = `${languageLock}\n${basePrompt}`;
        
        // Store the new message in the thread for future reference
        const preStreamStartTime = performance.now();
        console.log(
          `[API Route] Starting pre-stream OpenAI call (addMessage)...`
        );
        await addMessage(threadId, payload);
        const preStreamEndTime = performance.now();
        console.log(
          `[API Route] Finished pre-stream OpenAI call (addMessage). Duration: ${preStreamEndTime - preStreamStartTime} ms`
        );

        // Identify user context (subscriber or anonymous)
        const anonCookieName = 'musco_anon_id';
        const cookieStore = await cookies();
        let anonId = cookieStore.get(anonCookieName)?.value;
        let setCookie: string | undefined;
        if (!anonId) {
          // generate a simple anon id; cryptographically random is preferred if available
          anonId = `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
          // set httpOnly cookie for 30 days
          setCookie = `${anonCookieName}=${anonId}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`;
        }

        if (stream) {
          // Set up streaming response
          const encoder = new TextEncoder();
          let firstChunkSent = false;
          const streamSetupTime = performance.now();
          console.log(
            `[API Route] Starting stream setup. Time since send_message start: ${streamSetupTime - sendMessageStartTime} ms`
          );

          const customReadable = new ReadableStream({
            async start(controller) {
              const streamStartTime = performance.now();
              console.log(
                `[API Route] ReadableStream start() called. Time since stream setup: ${streamStartTime - streamSetupTime} ms`
              );
              try {
                const callOpenAIStreamStartTime = performance.now();
                console.log(
                  `[API Route] Calling streamChatCompletion... Time since stream start: ${callOpenAIStreamStartTime - streamStartTime} ms`
                );

                if (payload?.mode === 'explore') {
                  const exploreAssistantId = await getOrCreateExploreAssistant();
                  // Pre-reserve free-tier tokens for explore stream (best-effort)
                  try {
                    if (payload?.userId) {
                      // Logged-in path (subscribers bypass in helper)
                      await reserveFreeChatTokens(payload?.userId, undefined, payload?.isSubscriber);
                    } else if (anonId) {
                      // Anonymous path
                      await reserveFreeChatTokensForAnon(anonId, undefined);
                    }
                  } catch {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ payload: { error: 'free_limit_exceeded' } })}\n\n`));
                    controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                    controller.close();
                    return;
                  }
                  await streamExploreResponse(threadId, exploreAssistantId, (content) => {
                    const openaiStreamChunkReceivedTime = performance.now();
                    if (!firstChunkSent) {
                      console.log(`[API Route] First chunk RECEIVED from Explore stream. +${openaiStreamChunkReceivedTime - callOpenAIStreamStartTime} ms`);
                    }
                    const chunk = encoder.encode(`data: ${JSON.stringify({ content })}\n\n`);
                    controller.enqueue(chunk);
                    if (!firstChunkSent) {
                      firstChunkSent = true;
                    }
                  }, systemMessage);
                } else {
                  // Stream using Assistants Threads for diagnosis as well (merge)
                  const unifiedAssistant = await getOrCreateAssistant('asst_e1prLG3Ykh2ZCVspoAFMZPZC');
                  await streamRunResponse(
                    threadId,
                    unifiedAssistant.id,
                    (content) => {
                      const openaiStreamChunkReceivedTime = performance.now();
                      if (!firstChunkSent) {
                        console.log(
                          `[API Route] First chunk RECEIVED from Assistants stream. +${openaiStreamChunkReceivedTime - callOpenAIStreamStartTime} ms`
                        );
                      }
                      const chunk = encoder.encode(`data: ${JSON.stringify({ content })}\n\n`);
                      controller.enqueue(chunk);
                      if (!firstChunkSent) firstChunkSent = true;
                    },
                    {
                      userId: payload?.userId,
                      isSubscriber: payload?.isSubscriber,
                      anonId: !payload?.userId ? anonId : undefined,
                    },
                    systemMessage
                  );
                }

                const streamFinishedTime = performance.now();
                console.log(
                  `[API Route] streamChatCompletion finished. Total stream duration: ${streamFinishedTime - callOpenAIStreamStartTime} ms`
                );

                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (error) {
                // Always send a structured SSE message so the client can react
                const message = String((error as any)?.message || error || '');
                const payload = message.includes('FREE_CHAT_DAILY_TOKEN_LIMIT_EXCEEDED') || message.includes('free_limit_exceeded')
                  ? { error: 'free_limit_exceeded' }
                  : { error: 'stream_error' };
                try {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ payload })}\n\n`));
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                } catch {}
              }
            },
          });

          const returnResponseTime = performance.now();
          console.log(
            `[API Route] Returning streaming response object. Time since stream setup: ${returnResponseTime - streamSetupTime} ms`
          );
          return new Response(customReadable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
              ...(setCookie ? { 'Set-Cookie': setCookie } : {}),
            },
          });
        }

        // For non-streaming responses, use chat completions synchronously
        try {
          if (payload?.mode === 'explore') {
            const exploreAssistantId = await getOrCreateExploreAssistant();
            await runAssistant(threadId, exploreAssistantId, systemMessage);
          } else {
            const unifiedAssistant = await getOrCreateAssistant('asst_e1prLG3Ykh2ZCVspoAFMZPZC');
            await runAssistant(threadId, unifiedAssistant.id, systemMessage);
          }
          // After if/else fetch updated messages and return
          const messages = await getMessages(threadId);
          return NextResponse.json(
            { messages: messages as OpenAIMessage[] },
            { headers: setCookie ? { 'Set-Cookie': setCookie } : undefined }
          );
        } catch (error) {
          const message = String((error as any)?.message || error || '');
          if (message.includes('FREE_CHAT_DAILY_TOKEN_LIMIT_EXCEEDED') || message.includes('free_limit_exceeded')) {
            return NextResponse.json(
              { error: 'free_limit_exceeded' },
              { status: 429, headers: setCookie ? { 'Set-Cookie': setCookie } : undefined }
            );
          }
          console.error('Error processing non-streaming message:', error);
          return NextResponse.json(
            { error: 'Failed to process message' },
            { status: 500, headers: setCookie ? { 'Set-Cookie': setCookie } : undefined }
          );
        }
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

        try {
          const program = await generateFollowUpExerciseProgram({
            diagnosisData: payload.diagnosisData,
            userInfo: payload.userInfo,
            feedback: payload.feedback,
            userId: payload.userId,
            programId: payload.programId,
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
    console.error(
      `[API Route] Error in assistant API: ${error}. Time since handler start: ${errorTime - handlerStartTime} ms`
    );
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
