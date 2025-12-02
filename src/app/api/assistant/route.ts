import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  getOrCreateAssistant,
  createThread,
  getMessages,
  generateExerciseProgramWithModel,
  generateFollowUpExerciseProgram,
  reserveFreeChatTokens,
  reserveFreeChatTokensForAnon,
  streamChatCompletion,
  getChatCompletion,
} from '@/app/api/assistant/openai-server';
import { OpenAIMessage } from '@/app/types';
import { ProgramStatus, BODY_PART_GROUPS, SPECIFIC_BODY_PARTS } from '@/app/types/program';
import { diagnosisSystemPrompt } from '@/app/api/prompts/diagnosisPrompt';
import { getExploreSystemPrompt } from '@/app/api/prompts/explorePrompt';
import { chatModeRouterPrompt } from '@/app/api/prompts/routePrompt';
import { ROUTER_MODEL } from '@/app/api/assistant/models';
import { StreamParser } from '@/app/api/assistant/stream-parser';

export async function POST(request: Request) {
  const handlerStartTime = performance.now();
  console.log(`[API Route] POST /api/assistant received.`);
  try {
    const { action, threadId, payload, stream } = await request.json();

    switch (action) {
      case 'initialize': {
        const initStart = performance.now();
        console.log(`[API Route] action=initialize status=starting`);
        const cookieStore = await cookies();
        const existingThread = cookieStore.get('musco_thread_id')?.value;
        const assistant = await getOrCreateAssistant(
          'asst_e1prLG3Ykh2ZCVspoAFMZPZC'
        );
        let threadId: string;
        if (existingThread) {
          threadId = existingThread;
          console.log(`[API Route] action=initialize reuse_thread=${threadId}`);
        } else {
          const thread = await createThread();
          threadId = thread.id;
        }
        const initEnd = performance.now();
        console.log(
          `[API Route] action=initialize status=ok assistantId=${assistant.id} threadId=${threadId} durMs=${(initEnd - initStart).toFixed(1)}`
        );
        const response = NextResponse.json({
          assistantId: assistant.id,
          threadId,
        });
        if (!existingThread && threadId) {
          response.headers.set(
            'Set-Cookie',
            `musco_thread_id=${threadId}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`
          );
        }
        return response;
      }

      // UNIFIED CHAT PATH - handles both 'diagnosis' and 'explore' modes
      // Uses chat-completions API + StreamParser for structured output
      case 'send_message_chat': {
        // log: api entry
        try { console.info('level=info event=api_entry action=send_message_chat'); } catch {}

        // Determine effective mode on the server for the first user message if not provided
        let effectiveMode: 'diagnosis' | 'explore' | undefined = payload?.mode;
        const isFirstMessage = !Array.isArray(payload?.messages) || (Array.isArray(payload?.messages) && payload.messages.length === 0);
        try { console.info(`level=info event=router_check first=${Boolean(isFirstMessage)} has_mode=${Boolean(effectiveMode)}`); } catch {}

        if (!effectiveMode && isFirstMessage) {
          try {
            // log: router run start
            try { console.info('level=info event=router_run reason=first_no_mode'); } catch {}
            const text = await getChatCompletion({
              threadId: 'virtual',
              messages: [],
              systemMessage: chatModeRouterPrompt,
              userMessage: {
                message: payload?.message ?? '',
                selectedBodyGroupName: payload?.selectedBodyGroupName ?? '',
                selectedBodyPart: payload?.selectedBodyPart ?? '',
              language: payload?.language ?? 'en',
            },
            modelName: ROUTER_MODEL,
          });

            // Parse result defensively
            try {
              const parsed = JSON.parse(text);
              if (parsed?.chatMode === 'diagnosis' || parsed?.chatMode === 'explore') {
                effectiveMode = parsed.chatMode;
                    }
                  } catch {
              const s = (text || '').toLowerCase();
              if (/pain|hurt|injur|symptom|red flag|numb|tingl|swoll|ache/.test(s)) {
                effectiveMode = 'diagnosis';
                }
            }
            try { console.info(`level=info event=router_result mode=${effectiveMode || 'unknown'}`); } catch {}
          } catch {
            // Fall back to explore if router fails
            effectiveMode = 'explore';
            try { console.warn('level=warn event=router_fail fallback=explore'); } catch {}
              }
                } else {
          // log: router skipped
          try {
            const reason = effectiveMode ? 'has_mode' : 'has_history';
            console.info(`level=info event=router_skip reason=${reason}`);
                } catch {}
              }

        // Build the system message with the resolved mode
        const resolvedMode: 'diagnosis' | 'explore' = effectiveMode === 'diagnosis' ? 'diagnosis' : 'explore';
        try { console.info(`level=info event=mode_use value=${resolvedMode}`); } catch {}
        const locale = payload?.language || 'en';
        const sessionLanguage = locale.toLowerCase();
        
        // Get language-specific explore prompt or diagnosis prompt
        const basePrompt = resolvedMode === 'explore' 
          ? getExploreSystemPrompt(locale) 
          : diagnosisSystemPrompt;
          
        const languageLock = `\n<<LANGUAGE_LOCK>>\nSESSION_LANGUAGE=${sessionLanguage}\nRules:\n- All natural-language output (assistant bubble and followUpQuestions.question) must be in SESSION_LANGUAGE for the entire thread.\n- Do not switch languages mid-session unless SESSION_LANGUAGE changes.\n- JSON keys remain English (except user-provided content).\n<<LANGUAGE_LOCK_END>>\n`;
        
        // Inject body part context and body part groups data for diagnosis mode
        const bodyPart = payload?.selectedBodyPart?.name || payload?.selectedBodyGroupName || '(not yet selected)';
        const bodyPartGroups = BODY_PART_GROUPS.join(', ');
        const specificBodyParts = JSON.stringify(SPECIFIC_BODY_PARTS, null, 2);
        
        // Available body parts for clickable markers (from selected group)
        const availableBodyParts = payload?.bodyPartsInSelectedGroup?.join(', ') || '(none selected)';
        
        const promptWithContext = basePrompt
          .replace(/\{\{BODY_PART\}\}/g, bodyPart)
          .replace(/\{\{BODY_PART_GROUPS\}\}/g, bodyPartGroups)
          .replace(/\{\{SPECIFIC_BODY_PARTS\}\}/g, specificBodyParts)
          .replace(/\{\{AVAILABLE_BODY_PARTS\}\}/g, availableBodyParts);
        
        const systemMessage = `${languageLock}\n${promptWithContext}`;

        const anonCookieName = 'musco_anon_id';
        const cookieStore = await cookies();
        let anonId = cookieStore.get(anonCookieName)?.value;
        let setCookie: string | undefined;
        if (!anonId) {
          anonId = `anon_${Math.random().toString(36).slice(2)}_${Date.now()}`;
          setCookie = `${anonCookieName}=${anonId}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`;
        }

        if (stream) {
          const encoder = new TextEncoder();
          const customReadable = new ReadableStream({
            async start(controller) {
              try {
                // Rate-limit reservation (best effort)
                try {
                  if (payload?.userId) {
                    await reserveFreeChatTokens(payload?.userId, undefined, payload?.isSubscriber);
                  } else if (anonId) {
                    await reserveFreeChatTokensForAnon(anonId, undefined);
                  }
                } catch {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ payload: { error: 'free_limit_exceeded' } })}\n\n`));
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                  return;
                }

                // Create backend parser to emit structured events
                const parser = new StreamParser({
                  onText: (text) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`));
                  },
                  onFollowUp: (question) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'followup', question })}\n\n`));
                  },
                  onAssistantResponse: (response) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'assistant_response', response })}\n\n`));
                  },
                  onExercises: (exercises, query) => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'exercises', exercises, query })}\n\n`));
                  },
                  onComplete: () => {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
                  },
                }, { locale });

                await streamChatCompletion({
                  threadId: 'virtual',
                  messages: payload?.messages || [],
                  systemMessage,
                  userMessage: { ...(payload || {}), mode: resolvedMode },
                  onContent: (content) => {
                    parser.processChunk(content);
                  },
                  options: {
                    userId: payload?.userId,
                    isSubscriber: payload?.isSubscriber,
                    anonId: !payload?.userId ? anonId : undefined,
                  },
                });

                await parser.complete();
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                controller.close();
              } catch (error) {
                const message = String((error as any)?.message || error || '');
                const payloadObj = message.includes('FREE_CHAT_DAILY_TOKEN_LIMIT_EXCEEDED') || message.includes('free_limit_exceeded')
                  ? { error: 'free_limit_exceeded' }
                  : { error: 'stream_error' };
                try {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ payload: payloadObj })}\n\n`));
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  controller.close();
                } catch {}
              }
            }
          });

          return new Response(customReadable, {
            headers: {
              'Content-Type': 'text/event-stream',
              'Cache-Control': 'no-cache',
              Connection: 'keep-alive',
              ...(setCookie ? { 'Set-Cookie': setCookie } : {}),
            },
          });
        }

        // Non-streaming fallback
        const text = await getChatCompletion({
          threadId: 'virtual',
          messages: payload?.messages || [],
          systemMessage,
          userMessage: { ...(payload || {}), mode: resolvedMode },
          modelName: undefined,
          options: {
            userId: payload?.userId,
            isSubscriber: payload?.isSubscriber,
            anonId: !payload?.userId ? anonId : undefined,
          },
        });
        return NextResponse.json(
          { messages: [{ role: 'assistant', content: text }] as OpenAIMessage[] },
          { headers: setCookie ? { 'Set-Cookie': setCookie } : undefined }
        );
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

      case 'route_chat_mode': {
        // Use minimal, fast chat completion to decide chat mode
        const text = await getChatCompletion({
          threadId: 'virtual',
          messages: [],
          systemMessage: chatModeRouterPrompt,
          userMessage: {
            message: payload?.message ?? '',
            selectedBodyGroupName: payload?.selectedBodyGroupName ?? '',
            selectedBodyPart: payload?.selectedBodyPart ?? '',
            language: payload?.language ?? 'en',
          },
            modelName: ROUTER_MODEL,
        });

        // Be defensive: attempt to parse and coerce shape
        let mode: 'diagnosis' | 'explore' = 'explore';
        try {
          const parsed = JSON.parse(text);
          if (parsed?.chatMode === 'diagnosis' || parsed?.chatMode === 'explore') {
            mode = parsed.chatMode;
          }
        } catch {
          // Heuristic fallback: look for pain/symptom words
          const s = (text || '').toLowerCase();
          if (/pain|hurt|injur|symptom|red flag|numb|tingl|swoll|ache/.test(s)) {
            mode = 'diagnosis';
          }
        }

        return NextResponse.json({ chatMode: mode });
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
