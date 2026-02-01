import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  generateFollowUpExerciseProgram,
  reserveFreeChatTokens,
  reserveFreeChatTokensForAnon,
  streamChatCompletion,
  getChatCompletion,
} from '@/app/api/assistant/openai-server';
import { OpenAIMessage, Question } from '@/app/types';
import { ProgramStatus, SPECIFIC_BODY_PARTS } from '@/app/types/program';
import { diagnosisSystemPrompt } from '@/app/api/prompts/diagnosisPrompt';
import { getExploreSystemPrompt } from '@/app/api/prompts/explorePrompt';
import { chatModeRouterPrompt } from '@/app/api/prompts/routePrompt';
import { preFollowupSystemPrompt, buildPreFollowupUserContext } from '@/app/api/prompts/preFollowupPrompt';
import { buildHealthContextForPrompt } from '@/app/api/prompts/healthContext';
import { 
  ROUTER_MODEL, ROUTER_REASONING,
  PRE_FOLLOWUP_CHAT_MODEL, PRE_FOLLOWUP_CHAT_REASONING,
  getReasoningParam,
} from '@/app/api/assistant/models';
import { StreamParser } from '@/app/api/assistant/stream-parser';
import { bodyPartGroups } from '@/app/config/bodyPartGroups';
import { mergeAccumulatedFeedback } from '@/app/services/preFollowupChatService';
import { savePreFollowupChatAdmin } from '@/app/services/preFollowupChatServiceAdmin';
import { PreFollowupStructuredUpdates, ExerciseIntensityFeedback } from '@/app/types/incremental-program';

// Get all actual group names from bodyPartGroups config (for clickable markers)
const ALL_GROUP_NAMES = Object.values(bodyPartGroups).map(g => g.name);

export async function POST(request: Request) {
  const handlerStartTime = performance.now();
  console.log(`[API Route] POST /api/assistant received.`);
  try {
    const { action, threadId: _threadId, payload, stream } = await request.json();
    void _threadId; // threadId no longer used - chat completions are stateless

    switch (action) {
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
        const specificBodyParts = JSON.stringify(SPECIFIC_BODY_PARTS, null, 2);
        
        // Available body parts for clickable markers (from selected group)
        const availableBodyParts = payload?.bodyPartsInSelectedGroup?.join(', ') || '(none selected)';
        
        // All actual group names for clickable group markers (quoted to avoid comma ambiguity)
        const allGroupNames = ALL_GROUP_NAMES.map((name, i) => `${i + 1}. "${name}"`).join('\n');
        
        const promptWithContext = basePrompt
          .replace(/\{\{BODY_PART\}\}/g, bodyPart)
          .replace(/\{\{BODY_PART_GROUPS\}\}/g, allGroupNames)
          .replace(/\{\{SPECIFIC_BODY_PARTS\}\}/g, specificBodyParts)
          .replace(/\{\{AVAILABLE_BODY_PARTS\}\}/g, availableBodyParts);
        
        // Build health context from user profile and diagnosis data
        const healthContext = buildHealthContextForPrompt({
          userProfile: payload?.userProfile,
          diagnosisResponse: payload?.diagnosisAssistantResponse,
        }, { language: sessionLanguage });
        
        const systemMessage = `${languageLock}\n${healthContext ? `${healthContext}\n\n` : ''}${promptWithContext}`;

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

      case 'generate_follow_up_program': {
        if (!payload) {
          return NextResponse.json(
            { error: 'Payload is required' },
            { status: 400 }
          );
        }

        try {
          // Extract chat messages from feedback if available (for LLM processing)
          const chatMessages = payload.feedback?.chatMessages;
          
          const program = await generateFollowUpExerciseProgram({
            diagnosisData: payload.diagnosisData,
            userInfo: payload.userInfo,
            feedback: payload.feedback,
            userId: payload.userId,
            programId: payload.programId,
            previousProgram: payload.previousProgram, // Pass the previous program data
            language: payload.language || 'en', // Add language parameter with default fallback
            chatMessages, // Pass chat messages for LLM feedback processing
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

      case 'send_pre_followup_message': {
        // Pre-followup chat for gathering feedback before generating follow-up program
        if (!payload) {
          return NextResponse.json({ error: 'Payload is required' }, { status: 400 });
        }

        const { 
          messages: chatMessages, 
          previousProgram, 
          diagnosisData, 
          questionnaireData, 
          language, 
          accumulatedFeedback, 
          userProfile,
          // IDs for saving chat state to Firestore
          userId,
          programId,
          weekId,
        } = payload;
        const locale = language || 'en';

        // Build exercise name map from previous program
        const exerciseNames = new Map<string, string>();
        if (previousProgram?.days) {
          for (const day of previousProgram.days) {
            if (day.exercises) {
              for (const ex of day.exercises) {
                if (ex.exerciseId && ex.name) {
                  exerciseNames.set(ex.exerciseId, ex.name);
                }
              }
            }
          }
        }

        // Build user context for the prompt
        const userContext = buildPreFollowupUserContext({
          previousProgram: {
            title: previousProgram?.title || 'Previous Program',
            createdAt: previousProgram?.createdAt,
            days: previousProgram?.days || [],
          },
          diagnosisData: diagnosisData || {},
          questionnaireData: questionnaireData || {},
          exerciseNames,
          language: locale,
        });

        // Log the context being sent to the model
        console.log('\n┌─────────────────────────────────────────────────────');
        console.log('│ PRE-FOLLOWUP CHAT - Context sent to model');
        console.log('├─────────────────────────────────────────────────────');
        console.log(userContext);
        console.log('└─────────────────────────────────────────────────────\n');

        // Build accumulated feedback context so LLM knows what's already been answered
        let feedbackContext = '';
        if (accumulatedFeedback) {
          const parts: string[] = [];
          
          // Include existing feedbackSummary for the LLM to UPDATE (not replace)
          if (accumulatedFeedback.structuredUpdates?.feedbackSummary) {
            parts.push(`- CURRENT SUMMARY (update this, correct if contradicted): "${accumulatedFeedback.structuredUpdates.feedbackSummary}"`);
          }
          if (accumulatedFeedback.structuredUpdates?.overallFeeling) {
            parts.push(`- Overall feeling: ${accumulatedFeedback.structuredUpdates.overallFeeling}`);
          }
          if (accumulatedFeedback.structuredUpdates?.overallIntensity) {
            parts.push(`- Overall intensity preference: ${accumulatedFeedback.structuredUpdates.overallIntensity}`);
          }
          if (accumulatedFeedback.structuredUpdates?.allWorkoutsCompleted !== undefined) {
            parts.push(`- Workout completion: ${accumulatedFeedback.structuredUpdates.allWorkoutsCompleted ? 'ALL completed' : 'Some missed'}`);
          }
          if (accumulatedFeedback.structuredUpdates?.dayCompletionStatus?.length > 0) {
            const completed = accumulatedFeedback.structuredUpdates.dayCompletionStatus.filter((d: { completed: boolean }) => d.completed).map((d: { day: number }) => d.day);
            const missed = accumulatedFeedback.structuredUpdates.dayCompletionStatus.filter((d: { completed: boolean }) => !d.completed).map((d: { day: number }) => d.day);
            if (completed.length > 0) parts.push(`- Days completed: ${completed.join(', ')}`);
            if (missed.length > 0) parts.push(`- Days missed: ${missed.join(', ')}`);
          }
          if (accumulatedFeedback.structuredUpdates?.preferredWorkoutDays?.length > 0) {
            parts.push(`- Preferred workout days: ${accumulatedFeedback.structuredUpdates.preferredWorkoutDays.join(', ')}`);
          }
          if (accumulatedFeedback.structuredUpdates?.programAdjustments) {
            parts.push(`- Program adjustments requested: ${JSON.stringify(accumulatedFeedback.structuredUpdates.programAdjustments)}`);
          }
          if (accumulatedFeedback.exerciseIntensity?.length > 0) {
            parts.push(`- Exercise intensity feedback: ${accumulatedFeedback.exerciseIntensity.map((e: { exerciseId: string; feedback: string }) => `${e.exerciseId}=${e.feedback}`).join(', ')}`);
          }
          if (accumulatedFeedback.overallIntensity) {
            parts.push(`- Overall intensity preference: ${accumulatedFeedback.overallIntensity}`);
          }
          if (parts.length > 0) {
            feedbackContext = `\n\n<<ALREADY_COLLECTED_FEEDBACK>>\nThis is what we know so far. Do NOT ask again about these topics. UPDATE the feedbackSummary to include new information:\n${parts.join('\n')}\n<<END_ALREADY_COLLECTED_FEEDBACK>>`;
          }
        }

        // Build health context from user profile and diagnosis data
        const healthContext = buildHealthContextForPrompt({
          userProfile,
          questionnaireAnswers: questionnaireData,
          diagnosisResponse: diagnosisData,
        }, { language: locale });

        // Build system message with context
        const languageLock = `\n<<LANGUAGE_LOCK>>\nSESSION_LANGUAGE=${locale.toLowerCase()}\n<<LANGUAGE_LOCK_END>>\n`;
        const systemMessage = `${languageLock}\n${healthContext ? `${healthContext}\n\n` : ''}${preFollowupSystemPrompt}\n\n${userContext}${feedbackContext}`;

        // Track response data for saving to Firestore after streaming completes
        let assistantContent = '';
        const collectedFollowUps: Question[] = [];
        let structuredUpdates: PreFollowupStructuredUpdates | undefined;
        let exerciseIntensity: ExerciseIntensityFeedback[] | undefined;
        let conversationComplete = false;

        // Stream the response
        const encoder = new TextEncoder();
        const customReadable = new ReadableStream({
          async start(controller) {
            try {
              // Create parser for structured output
              const parser = new StreamParser({
                onText: (text) => {
                  assistantContent += text;
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', content: text })}\n\n`));
                },
                onFollowUp: (question) => {
                  collectedFollowUps.push(question as Question);
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'followup', question })}\n\n`));
                },
                onAssistantResponse: (response) => {
                  if (response.structuredUpdates) {
                    structuredUpdates = response.structuredUpdates;
                  }
                  if (response.exerciseIntensity) {
                    exerciseIntensity = response.exerciseIntensity;
                  }
                  if (response.conversationComplete !== undefined) {
                    conversationComplete = response.conversationComplete;
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'assistant_response', response })}\n\n`));
                },
                onExercises: () => {
                  // Pre-followup chat doesn't need exercise loading - exercises come from previous program
                },
                onComplete: async () => {
                  // Save chat state to Firestore after streaming completes
                  if (userId && programId) {
                    try {
                      // Build the new assistant message
                      const assistantMessage = {
                        id: `assistant-${Date.now()}`,
                        role: 'assistant' as const,
                        content: assistantContent,
                      };
                      
                      // Merge new structured updates with existing accumulated feedback
                      const mergedFeedback = mergeAccumulatedFeedback(
                        accumulatedFeedback || {},
                        {
                          structuredUpdates,
                          exerciseIntensity,
                          conversationalSummary: '',
                        }
                      );

                      // Build complete messages array (existing + new assistant message)
                      const updatedMessages = [...(chatMessages || []), assistantMessage];

                      await savePreFollowupChatAdmin(userId, programId, weekId, {
                        messages: updatedMessages,
                        followUpQuestions: collectedFollowUps,
                        accumulatedFeedback: mergedFeedback,
                        conversationComplete,
                      });
                    } catch (saveError) {
                      console.error('[API Route] Error saving pre-followup chat state:', saveError);
                      // Don't fail the request if save fails - client can retry
                    }
                  }
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'complete' })}\n\n`));
                },
              }, { locale });

              await streamChatCompletion({
                threadId: 'virtual',
                messages: chatMessages || [],
                systemMessage,
                userMessage: { message: '' }, // Empty for auto-start or user message is in chatMessages
                onContent: (content) => {
                  parser.processChunk(content);
                },
                model: PRE_FOLLOWUP_CHAT_MODEL,
                reasoning: PRE_FOLLOWUP_CHAT_REASONING,
              });

              await parser.complete();
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            } catch (error) {
              console.error('[API Route] Error in pre-followup chat:', error);
              try {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', error: 'stream_error' })}\n\n`));
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
          },
        });
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
