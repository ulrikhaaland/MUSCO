import OpenAI from 'openai';
import { ChatPayload, DiagnosisAssistantResponse } from '../../types';
import {
  ENFORCE_CHAT_LIMITS,
  SUBSCRIPTIONS_ENABLED,
  FREE_DAILY_TOKENS,
  ESTIMATED_RESPONSE_TOKENS,
  estimateTokensFromString,
  FreeLimitExceededError,
  logFreeLimit,
} from '@/app/lib/chatLimits';
import { ExerciseQuestionnaireAnswers } from '../../../../shared/types';
import { adminDb } from '@/app/firebase/admin';
import { ProgramStatus, ExerciseProgram } from '@/app/types/program';
// import { loadServerExercises } from '@/app/services/server-exercises';
import { ProgramFeedback } from '@/app/components/ui/ProgramFeedbackQuestionnaire';
import { prepareExercisesPrompt } from '@/app/helpers/exercise-prompt';
import { getStartOfWeek, addDays } from '@/app/utils/dateutils';

// Initialize OpenAI client
const isTestOrCI = process.env.NODE_ENV === 'test' || 
                   process.env.CI === 'true' || 
                   process.env.CI === '1' ||
                   process.env.VERCEL === '1';
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: isTestOrCI, // Allow in test/CI environments only
});

// Import centralized model configuration
import { DIAGNOSIS_MODEL, EXPLORE_MODEL, PROGRAM_MODEL, FOLLOWUP_MODEL } from './models';

// ----------------------
// Model and token controls
// ----------------------
const CHAT_MAX_TURNS = Number(process.env.CHAT_MAX_TURNS || 6);
const CHAT_MAX_MESSAGE_CHARS = Number(process.env.CHAT_MAX_MESSAGE_CHARS || 1500);
const CHAT_MAX_OUTPUT_TOKENS = Number(process.env.CHAT_MAX_OUTPUT_TOKENS || 1024);

// ----------------------
// Logging helpers (structured, throttled)
// ----------------------
type LogLevel = 'debug' | 'info' | 'warn' | 'error';
const LOG_LEVEL: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';
const levelRank: Record<LogLevel, number> = { debug: 10, info: 20, warn: 30, error: 40 };
const currentRank = levelRank[LOG_LEVEL] ?? 20;
const throttleMap: Map<string, { count: number; start: number }> = new Map();

function shouldLog(level: LogLevel): boolean {
  return levelRank[level] >= currentRank;
}

function throttledLog(level: LogLevel, key: string, line: string) {
  if (!shouldLog(level)) return;
  const now = Date.now();
  const entry = throttleMap.get(key);
  if (!entry || now - entry.start > 60_000) {
    throttleMap.set(key, { count: 1, start: now });
  } else {
    entry.count += 1;
    if (entry.count > 3) return; // auto-throttle after 3/min
  }
  const logLine = line.length > 80 ? line.slice(0, 80) : line;
  if (level === 'error') console.error(logLine);
  else if (level === 'warn') console.warn(logLine);
  else console.log(logLine);
}

// Limits are centralized in chatLimits.ts

function truncate(input: string, max: number): string {
  if (!input) return '';
  if (input.length <= max) return input;
  return input.slice(0, Math.max(0, max - 1)) + '…';
}

async function checkAndConsumeUserChatTokens(userId: string, tokensNeeded: number): Promise<void> {
  if (!ENFORCE_CHAT_LIMITS) return;
  if (!userId) {
    throw new Error('Chat limit enforcement requires userId');
  }

  const now = new Date();
  const usageRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('usage')
    .doc('chat_daily');

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(usageRef);
    const data = snapshot.exists ? (snapshot.data() as any) : null;

    const windowStartIso = data?.windowStart as string | undefined;
    const tokensUsed = typeof data?.tokensUsed === 'number' ? data.tokensUsed : 0;

    const windowStart = windowStartIso ? new Date(windowStartIso) : null;
    const windowExpired = !windowStart || (now.getTime() - windowStart.getTime() > 24 * 60 * 60 * 1000);

    const effectiveTokensUsed = windowExpired ? 0 : tokensUsed;
    const newTotal = effectiveTokensUsed + tokensNeeded;

    throttledLog(
      'info',
      `limit_user_${userId}`,
      `limit=user user=${userId} used=${effectiveTokensUsed} need=${tokensNeeded} new=${newTotal} cap=${FREE_DAILY_TOKENS}`
    );

    if (newTotal > FREE_DAILY_TOKENS) {
      logFreeLimit({
        scope: 'chat',
        kind: 'user',
        id: userId,
        used: effectiveTokensUsed,
        need: tokensNeeded,
        next: newTotal,
        cap: FREE_DAILY_TOKENS,
      });
      throw new FreeLimitExceededError();
    }

    const newDoc = {
      tokensUsed: newTotal,
      windowStart: windowExpired ? now.toISOString() : windowStartIso ?? now.toISOString(),
      updatedAt: now.toISOString(),
    };
    if (snapshot.exists) {
      tx.update(usageRef, newDoc);
    } else {
      tx.set(usageRef, newDoc);
    }
  });
}

// Public helper for other routes to reserve free-tier tokens safely
export async function reserveFreeChatTokens(
  userId?: string,
  tokensNeeded?: number,
  isSubscriber?: boolean
): Promise<void> {
  if (!ENFORCE_CHAT_LIMITS) return;
  if (!SUBSCRIPTIONS_ENABLED) return; // all users treated as subscribers when disabled
  if (!userId) return; // cannot enforce without user context
  if (isSubscriber) {
    throttledLog(
      'info',
      `limit_bypass_user_${userId}`,
      `limit=bypass user=${userId} reason=subscriber`
    );
    return; // subscribers are exempt
  }
  const needed = typeof tokensNeeded === 'number' ? tokensNeeded : ESTIMATED_RESPONSE_TOKENS;
  await checkAndConsumeUserChatTokens(userId, needed);
}

// Anonymous limits (cookie-based anon id)
async function checkAndConsumeAnonChatTokens(anonId: string, tokensNeeded: number): Promise<void> {
  if (!ENFORCE_CHAT_LIMITS) return;
  if (!anonId) return;

  const now = new Date();
  const usageRef = adminDb
    .collection('anonymousUsage')
    .doc(anonId)
    .collection('usage')
    .doc('chat_daily');

  await adminDb.runTransaction(async (tx) => {
    const snapshot = await tx.get(usageRef);
    const data = snapshot.exists ? (snapshot.data() as any) : null;

    const windowStartIso = data?.windowStart as string | undefined;
    const tokensUsed = typeof data?.tokensUsed === 'number' ? data.tokensUsed : 0;

    const windowStart = windowStartIso ? new Date(windowStartIso) : null;
    const windowExpired = !windowStart || (now.getTime() - windowStart.getTime() > 24 * 60 * 60 * 1000);

    const effectiveTokensUsed = windowExpired ? 0 : tokensUsed;
    const newTotal = effectiveTokensUsed + tokensNeeded;

    throttledLog(
      'info',
      `limit_anon_${anonId}`,
      `limit=anon anon=${anonId} used=${effectiveTokensUsed} need=${tokensNeeded} new=${newTotal} cap=${FREE_DAILY_TOKENS}`
    );

    if (newTotal > FREE_DAILY_TOKENS) {
      logFreeLimit({
        scope: 'chat',
        kind: 'anon',
        id: anonId,
        used: effectiveTokensUsed,
        need: tokensNeeded,
        next: newTotal,
        cap: FREE_DAILY_TOKENS,
      });
      throw new FreeLimitExceededError();
    }

    const newDoc = {
      tokensUsed: newTotal,
      windowStart: windowExpired ? now.toISOString() : windowStartIso ?? now.toISOString(),
      updatedAt: now.toISOString(),
    };
    if (snapshot.exists) {
      tx.update(usageRef, newDoc);
    } else {
      tx.set(usageRef, newDoc);
    }
  });
}

export async function reserveFreeChatTokensForAnon(
  anonId?: string,
  tokensNeeded?: number
): Promise<void> {
  if (!ENFORCE_CHAT_LIMITS) return;
  if (!anonId) return;
  const needed = typeof tokensNeeded === 'number' ? tokensNeeded : ESTIMATED_RESPONSE_TOKENS;
  await checkAndConsumeAnonChatTokens(anonId, needed);
}

// Reset/migrate usage when an anonymous user logs in
export async function migrateAnonUsageToUserAndResetLimit(anonId?: string, userId?: string): Promise<boolean> {
  try {
    if (!anonId || !userId) return false;

    // Reset user's daily usage window to zero
    const nowIso = new Date().toISOString();
    const userUsageRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('usage')
      .doc('chat_daily');

    // Delete anonymous usage doc
    const anonUsageRef = adminDb
      .collection('anonymousUsage')
      .doc(anonId)
      .collection('usage')
      .doc('chat_daily');

    await adminDb.runTransaction(async (tx) => {
      // Reset user usage
      tx.set(userUsageRef, { tokensUsed: 0, windowStart: nowIso, updatedAt: nowIso }, { merge: true });
      // Clear anon usage
      tx.delete(anonUsageRef);

      // Mark migration on user root doc to avoid repeated resets if desired in future
      const userRootRef = adminDb.collection('users').doc(userId);
      tx.set(userRootRef, { chatUsageMigratedFromAnon: anonId, chatUsageMigratedAt: nowIso }, { merge: true });
    });

    return true;
  } catch (e) {
    // Best-effort; if migration fails, do not block chat
    console.warn('migrateAnonUsageToUserAndResetLimit failed', e);
    return false;
  }
}

// Stream chat completion with OpenAI
export async function streamChatCompletion({
  threadId: _threadId,
  messages,
  systemMessage,
  userMessage,
  onContent,
  options,
}: {
  threadId: string;
  messages: any[];
  systemMessage: string;
  userMessage: any;
  onContent: (content: string) => void;
  options?: {
    userId?: string;
    isSubscriber?: boolean;
    estimatedResponseTokens?: number;
    anonId?: string;
  };
}) {
  try {
    void _threadId;
    
    // For diagnosis mode: send ALL turns to prevent losing context
    // For explore mode: send last 6 turns to keep token usage reasonable
    const isDiagnosisMode = userMessage && typeof userMessage === 'object' && userMessage.mode === 'diagnosis';
    const isExploreMode = userMessage && typeof userMessage === 'object' && userMessage.mode === 'explore';
    const selectedModel = isExploreMode ? EXPLORE_MODEL : DIAGNOSIS_MODEL; // Default to diagnosis if mode unknown
    
    throttledLog('info', 'chat_stream_start', `ctx=stream model=${selectedModel}`);
    
    // Log diagnosis mode info at start of turn
    if (isDiagnosisMode) {
      console.log('\n┌─────────────────────────────────────');
      console.log('│ DIAGNOSIS MODE - New Turn');
      console.log('│ Model:', selectedModel);
      console.log('│ Message count:', (messages?.length || 0) + 1);
      if (userMessage && typeof userMessage === 'object') {
        console.log('│ User message:', userMessage.message || '(structured input)');
      }
      console.log('└─────────────────────────────────────');
    }

    const turnLimit = isDiagnosisMode ? (messages?.length || 0) : CHAT_MAX_TURNS;
    const formattedMessages = formatMessagesForChatCompletion((messages || []).slice(-turnLimit));

    // Add system message (no complex injection)
    formattedMessages.unshift({
      role: 'system' as const,
      content: systemMessage,
    });

    // Construct the user message content
    let userMessageContent = '';
    if (typeof userMessage === 'string') {
      userMessageContent = userMessage;
    } else if (typeof userMessage === 'object' && userMessage !== null) {
      // Prioritize userMessage.message if it exists (this is the actual typed text)
      if (userMessage.message && typeof userMessage.message === 'string') {
        userMessageContent = userMessage.message;
      } else {
        userMessageContent = 'User input: (no direct text provided)';
      }

      // Inject collected JSON context so LLM knows what's already answered
      if (userMessage.diagnosisAssistantResponse && Object.keys(userMessage.diagnosisAssistantResponse).length > 0) {
        const context = userMessage.diagnosisAssistantResponse;
        const collectedFields: string[] = [];
        
        if (context.onset) collectedFields.push(`onset: ${context.onset}`);
        if (context.painLocation) collectedFields.push(`painLocation: ${context.painLocation}`);
        if (context.painScale) collectedFields.push(`painScale: ${context.painScale}`);
        if (context.painCharacter) collectedFields.push(`painCharacter: ${context.painCharacter}`);
        if (context.aggravatingFactors) collectedFields.push(`aggravatingFactors: ${context.aggravatingFactors}`);
        if (context.relievingFactors) collectedFields.push(`relievingFactors: ${context.relievingFactors}`);
        if (context.painPattern) collectedFields.push(`painPattern: ${context.painPattern}`);
        if (context.priorInjury !== null && context.priorInjury !== undefined) collectedFields.push(`priorInjury: ${context.priorInjury}`);
        
        if (collectedFields.length > 0) {
          userMessageContent += `\n\n[Already collected: ${collectedFields.join(', ')}]`;
          
          // Log gathered diagnosis information
          console.log('\n=== DIAGNOSIS INFO (Current Turn) ===');
          console.log(`Gathered fields (${collectedFields.length}/8):`);
          collectedFields.forEach(field => console.log(`  • ${field}`));
          if (context.diagnosis) console.log(`Diagnosis: ${context.diagnosis}`);
          if (context.redFlag) console.log(`🚩 Red Flag: ${context.redFlag}`);
          console.log('=====================================\n');
        }
      }
    } else {
      // Fallback for unexpected userMessage types
      userMessageContent = JSON.stringify(userMessage);
    }
    throttledLog('debug', 'chat_user_msg', `len=${userMessageContent.length}`);

    // Add the new user message to the history
    formattedMessages.push({
      role: 'user' as const,
      content: userMessageContent,
    });

    // Enforce free-tier chat limits (non-subscribers only)
    const estimatedInputTokens = estimateTokensFromString(userMessageContent);
    const estimatedResponse = options?.estimatedResponseTokens ?? ESTIMATED_RESPONSE_TOKENS;
    if (ENFORCE_CHAT_LIMITS && SUBSCRIPTIONS_ENABLED) {
      if (options?.userId && options?.isSubscriber === true) {
        throttledLog('info', `limit_bypass_user_${options.userId}`, `limit=bypass user=${options.userId} reason=subscriber`);
      } else if (options?.userId && options?.isSubscriber === false) {
        await checkAndConsumeUserChatTokens(options.userId, estimatedInputTokens + estimatedResponse);
      } else if (options?.anonId) {
        await checkAndConsumeAnonChatTokens(options.anonId, estimatedInputTokens + estimatedResponse);
      }
    }

    // DEBUG: Log what we're sending to the LLM
    console.log('═══════════════════════════════════════');
    console.log('[LLM Request]');
    console.log('Model:', selectedModel);
    console.log('Mode:', isExploreMode ? 'explore' : isDiagnosisMode ? 'diagnosis' : 'unknown');
    console.log('Message count:', formattedMessages.length);
    console.log('System prompt length:', systemMessage.length, 'chars');
    console.log('Has exercise index:', systemMessage.includes('Shoulders:'));
    console.log('Has EXERCISE_QUERY instruction:', systemMessage.includes('<<EXERCISE_QUERY'));
    console.log('Has exercise database section:', systemMessage.includes('**8. Exercise Database'));
    console.log('Estimated tokens:', Math.ceil(systemMessage.length / 4));
    
    // Extract and log the exercise database section
    if (systemMessage.includes('**Exercise Database')) {
      const exerciseDbStart = systemMessage.indexOf('**Exercise Database');
      const exerciseDbEnd = systemMessage.indexOf('**When user asks about exercises', exerciseDbStart);
      const exerciseDbSection = systemMessage.substring(exerciseDbStart, exerciseDbEnd > 0 ? exerciseDbEnd : exerciseDbStart + 500);
      console.log('\n📚 Exercise Database Section:');
      console.log(exerciseDbSection);
      console.log('');
    }
    
    console.log('Last user message:', formattedMessages[formattedMessages.length - 1]?.content.substring(0, 200));
    console.log('═══════════════════════════════════════');

    // Call OpenAI Responses API (streaming) with minimal reasoning effort
    const stream = await openai.responses.stream({
      model: selectedModel,
      reasoning: isExploreMode ? { effort: 'minimal' } as any : undefined,
      input: formattedMessages,
      max_output_tokens: CHAT_MAX_OUTPUT_TOKENS,
    } as any);

    throttledLog('debug', 'chat_stream_created', 'status=ok');

    let streamEnded = false;
    let fullContent = '';

    stream
      .on('response.output_text.delta', (event: any) => {
        try {
          const delta = event?.delta ?? event?.output_text_delta ?? '';
          if (typeof delta === 'string' && delta) {
            fullContent += delta;
            onContent(delta);
          }
        } catch (err) {
          if (!streamEnded) {
            console.error('[streamChatCompletion] delta_error', err);
            streamEnded = true;
          }
        }
      })
      .on('error', (error: any) => {
        if (!streamEnded) {
          console.error('[streamChatCompletion] Stream error:', error);
          streamEnded = true;
        }
      })
      .on('response.completed', () => {
        throttledLog('debug', 'chat_stream_complete', 'ok=1');
      });

    await stream.done();
    throttledLog('debug', 'chat_stream_result', `len=${fullContent.length}`);
  } catch (error) {
    console.error('[streamChatCompletion] Error in stream:', error);
    // Re-throw so the route can send a structured SSE error payload
    throw error;
  }
}

// Helper function to format messages for chat completion
function formatMessagesForChatCompletion(messages: any[]) {
  return (messages || []).map((msg) => {
    // Map OpenAI assistant API message format to chat completion format
    const role = msg.role === 'user' ? 'user' : 'assistant';

    // Handle various content formats
    let content = '';
    if (typeof msg.content === 'string') {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      // Handle content array (text, image, etc.)
      content = msg.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text?.value || '')
        .join('\n');
    } else if (msg.content?.text) {
      content = msg.content.text;
    } else if (msg.content) {
      // Try to stringify any other content object
      try {
        content = JSON.stringify(msg.content);
      } catch {
        content = 'Content could not be processed';
      }
    }

    return {
      role: role as 'user' | 'assistant' | 'system',
      content: truncate(content, CHAT_MAX_MESSAGE_CHARS),
    };
  });
}

// Create or load the assistant
export async function getOrCreateAssistant(assistantId: string) {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);
    // If the assistant exists but is not on the desired model, update it to a supported Assistants model
    try {
      const currentModel = (assistant as any)?.model as string | undefined;
      // Assistants API currently may not support some 5-mini variants; prefer 4.1-mini if update is needed
      if (currentModel && currentModel !== 'gpt-4.1-mini') {
        const updated = await openai.beta.assistants.update(assistantId, {
          model: 'gpt-4.1-mini',
        });
        return updated;
      }
    } catch {}
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
export async function addMessage(threadId: string, payload: ChatPayload) {
  try {
    const content = JSON.stringify(payload);
    return await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message to thread');
  }
}

// Run the assistant on a thread with streaming
// Legacy Assistants API functions removed - now using chat-completions with StreamParser

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

export async function generateFollowUpExerciseProgram(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  feedback: ProgramFeedback;
  userId?: string;
  programId?: string;
  previousProgram?: ExerciseProgram;
  language?: string;
  desiredCreatedAt?: string;
}) {
  try {
    // If we have a userId and programId, update the program status to Generating
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        await programRef.update({
          status: ProgramStatus.Generating,
          updatedAt: new Date().toISOString(),
        });
        console.log('Updated program status to Generating');
      } catch (error) {
        console.error('Error updating program status to Generating:', error);
        // Continue even if status update fails
      }
    }

    // Prepare a clean list of removed exercise IDs for the prompt generation
    const removedExerciseIdsForPrompt = (
      context.feedback.removedExercises || []
    )
      .map((id) =>
        typeof id === 'string'
          ? id
          : (id as any)?.id || (id as any)?.exerciseId || null
      )
      .filter(Boolean) as string[];

    // Get exercises prompt from shared utility function, excluding removed exercises
    const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(
      context.userInfo,
      removedExerciseIdsForPrompt
    );
    throttledLog('debug', 'followup_ex_prompt', `count=${exerciseCount}`);

    // Import the follow-up system prompt
    const systemPrompt = await import('../prompts/exerciseFollowUpPrompt');

    // Debug-only: input sizes
    throttledLog(
      'debug',
      'followup_feedback_sizes',
      `pref=${context.feedback.preferredExercises?.length || 0} rem=${context.feedback.removedExercises?.length || 0} repl=${context.feedback.replacedExercises?.length || 0} add=${context.feedback.addedExercises?.length || 0}`
    );

    // Only include necessary exercise information (id and name) for the main feedback object
    const programFeedback = {
      preferredExercises: (context.feedback.preferredExercises || [])
        .map((id) =>
          typeof id === 'string'
            ? id
            : (id as any)?.id || (id as any)?.exerciseId || null
        )
        .filter(Boolean),
      removedExercises: (context.feedback.removedExercises || [])
        .map((id) =>
          typeof id === 'string'
            ? id
            : (id as any)?.id || (id as any)?.exerciseId || null
        )
        .filter(Boolean),
      replacedExercises: (context.feedback.replacedExercises || [])
        .map((id) =>
          typeof id === 'string'
            ? id
            : (id as any)?.id || (id as any)?.exerciseId || null
        )
        .filter(Boolean),
      addedExercises: (context.feedback.addedExercises || []).map((ex) => ({
        id: ex.id || ex.exerciseId,
        name: ex.name,
      })),
    };

    // Log feedback for debugging
    console.log('Program feedback details:');
    console.log(
      `Preferred exercises (${programFeedback.preferredExercises.length}):`
    );
    programFeedback.preferredExercises.forEach((id) =>
      console.log(`  - ${id}`)
    );

    console.log(
      `Removed exercises (${programFeedback.removedExercises.length}):`
    );
    programFeedback.removedExercises.forEach((id) => console.log(`  - ${id}`));

    console.log(
      `Replaced exercises (${programFeedback.replacedExercises.length}):`
    );
    programFeedback.replacedExercises.forEach((id) => console.log(`  - ${id}`));

    console.log(`Added exercises (${programFeedback.addedExercises.length}):`);
    programFeedback.addedExercises.forEach((ex) =>
      console.log(`  - ${ex.id}: ${ex.name}`)
    );

    // Format the feedback for inclusion in the prompt
    const formattedFeedback = `

===================================================
USER PROGRAM FEEDBACK (CRITICAL INSTRUCTIONS)
===================================================

** CRITICAL - YOU MUST FOLLOW THESE INSTRUCTIONS: **

PREFERRED EXERCISES (YOU MUST INCLUDE THESE):
${
  programFeedback.preferredExercises.length > 0
    ? programFeedback.preferredExercises.map((id) => `- ${id}`).join('\n')
    : '- None'
}

REMOVED EXERCISES (YOU MUST NOT INCLUDE THESE):
${
  programFeedback.removedExercises.length > 0
    ? programFeedback.removedExercises.map((id) => `- ${id}`).join('\n')
    : '- None'
}

REPLACED EXERCISES (YOU MUST NOT INCLUDE THESE):
${
  programFeedback.replacedExercises.length > 0
    ? programFeedback.replacedExercises.map((id) => `- ${id}`).join('\n')
    : '- None'
}

ADDED EXERCISES (YOU MUST INCLUDE THESE):
${
  programFeedback.addedExercises.length > 0
    ? programFeedback.addedExercises
        .map((ex) => `- ${ex.id}: ${ex.name}`)
        .join('\n')
    : '- None'
}

===================================================
FAILURE TO FOLLOW THE ABOVE INSTRUCTIONS EXACTLY WILL RESULT IN POOR USER EXPERIENCE
===================================================

`;

    // Get final system prompt with feedback and exercises appended
    const finalSystemPrompt =
      systemPrompt.programFollowUpSystemPrompt +
      formattedFeedback +
      exercisesPrompt;

    // Debug-only: prompt sizes
    throttledLog('debug', 'followup_prompt_lengths', `sys=${systemPrompt.programFollowUpSystemPrompt.length} fb=${formattedFeedback.length} ex=${exercisesPrompt.length}`);
    throttledLog('debug', 'followup_prompt_total', `chars=${finalSystemPrompt.length}`);

    // Transform context into a valid user message payload
    const userMessage = JSON.stringify({
      diagnosisData: context.diagnosisData,
      userInfo: {
        ...context.userInfo,
        // Remove equipment and exerciseEnvironments from userInfo
        equipment: undefined,
        exerciseEnvironments: undefined,
      },
      currentDay: new Date().getDay(),
      previousProgram: context.previousProgram,
      language: context.language || 'en', // Default to English if not specified
      programFeedback: programFeedback, // Use the explicitly provided feedback
    });

    // Call the OpenAI chat completion API
    const response = await openai.chat.completions.create({
      model: FOLLOWUP_MODEL,
      messages: [
        {
          role: 'system',
          content: finalSystemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: { type: 'json_object' },
    });

    // Extract the content from the response
    const rawContent = response.choices[0].message.content;
    if (!rawContent) {
      throw new Error('No response content from chat completion');
    }

    throttledLog('debug', 'followup_resp', `len=${rawContent.length}`);

    // Parse the response as JSON
    let program: ExerciseProgram;
    // Determine the correct start date for the follow-up program (always non-past)
    const nextProgramDate = (() => {
      if (context.desiredCreatedAt) {
        return new Date(context.desiredCreatedAt);
      }

      const currentWeekStart = getStartOfWeek(new Date());

      if (context.previousProgram?.createdAt) {
        const prevWeekStart = getStartOfWeek(new Date(context.previousProgram.createdAt));
        const candidate = addDays(prevWeekStart, 7);
        return candidate < currentWeekStart ? currentWeekStart : candidate;
      }
      return currentWeekStart;
    })();

    // Convert to UTC Monday 00:00 immediately so it can be reused later in the function
    const nextProgramDateUTC = new Date(
      Date.UTC(
        nextProgramDate.getFullYear(),
        nextProgramDate.getMonth(),
        nextProgramDate.getDate()
      )
    );

    try {
      program = JSON.parse(rawContent) as ExerciseProgram;

      // Add createdAt timestamp to the program
      program.createdAt = nextProgramDateUTC;

      // Log extracted exercises from the response for verification
      console.log(
        '\n----- EXERCISE VALIDATION (CHECKING FEEDBACK COMPLIANCE) -----'
      );

      // Collect all exercise IDs from the response
      const includedExerciseIds = new Set<string>();
      if (program.days && Array.isArray(program.days)) {
        program.days.forEach((day) => {
          if (!day.isRestDay && day.exercises && Array.isArray(day.exercises)) {
            day.exercises.forEach((exercise) => {
              if (exercise.exerciseId) {
                includedExerciseIds.add(exercise.exerciseId);
              }
            });
          }
        });
      }

      // Check if preferred exercises are included
      const preferredIncluded = programFeedback.preferredExercises.filter((id) => includedExerciseIds.has(id)).length;
      const removedIncluded = programFeedback.removedExercises.filter((id) => includedExerciseIds.has(id)).length;
      const replacedIncluded = programFeedback.replacedExercises.filter((id) => includedExerciseIds.has(id)).length;
      const addedIncluded = programFeedback.addedExercises.filter((ex) => includedExerciseIds.has(ex.id)).length;
      throttledLog('debug', 'followup_compliance', `prefIn=${preferredIncluded} remIn=${removedIncluded} replIn=${replacedIncluded} addIn=${addedIncluded}`);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error(
        'First 200 characters of raw response:',
        rawContent.substring(0, 200)
      );
      throw new Error(
        `Failed to parse response as JSON: ${parseError.message}`
      );
    }

    // Add target areas to the response (type is now at UserProgram level)
    program.targetAreas = context.userInfo.targetAreas;

    // If we have a userId and programId, update the program document
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        // Atomically add the new week document and mark the parent program as Done
        const batch = adminDb.batch();

        // Extract fields that belong to UserProgram level vs weekly program level
        const { timeFrame, title, days, ...programMetadata } = program as any;

        // New week document reference (auto-ID)
        const newWeekRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId)
          .collection('programs')
          .doc();

        // Save the weekly program data (days array and other program metadata)
        // Use the same next Monday date for consistency
        batch.set(newWeekRef, {
          days: days || [],
          ...programMetadata,
          createdAt: nextProgramDateUTC.toISOString(),
        });

        // Update the parent document with UserProgram-level fields
        const userProgramUpdates: any = {
          status: ProgramStatus.Done,
          updatedAt: new Date().toISOString(),
          active: true, // Set the new program as active
        };

        // Add timeFrame and title if they exist in the LLM response
        if (timeFrame) {
          userProgramUpdates.timeFrame = timeFrame;
        }
        if (title) {
          userProgramUpdates.title = title;
        }

        batch.update(programRef, userProgramUpdates);

        await batch.commit();

        console.log('Successfully updated program document and set as active');
      } catch (error) {
        console.error('Error updating program document:', error);
        // Update status to error if save fails
        try {
          if (context.userId && context.programId) {
            const programRef = adminDb
              .collection('users')
              .doc(context.userId)
              .collection('programs')
              .doc(context.programId);

            await programRef.update({
              status: ProgramStatus.Error,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (statusError) {
          console.error('Error updating program status to error:', statusError);
        }
        throw error;
      }
    }

    return program;
  } catch (error) {
    console.error('Error generating follow-up exercise program:', error);
    // If we have a userId and programId, update the status to error
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        await programRef.update({
          status: ProgramStatus.Error,
          updatedAt: new Date().toISOString(),
        });
      } catch (statusError) {
        console.error('Error updating program status to error:', statusError);
      }
    }
    throw new Error('Failed to generate follow-up exercise program');
  }
}

export async function generateExerciseProgramWithModel(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  userId?: string;
  programId?: string;
  previousProgram?: ExerciseProgram;
  language?: string;
}) {
  try {
    // If we have a userId and programId, update the program status to Generating
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        await programRef.update({
          status: ProgramStatus.Generating,
          updatedAt: new Date().toISOString(),
        });
        console.log('Updated program status to Generating');
      } catch (error) {
        console.error('Error updating program status to Generating:', error);
        // Continue even if status update fails
      }
    }

    // Get exercises prompt from shared utility function
    const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(
      context.userInfo
    );
    console.log(
      `Prepared exercise prompt with ${exerciseCount} total exercises`
    );
    console.log(exercisesPrompt);

    // Import the program system prompt
    const { programSystemPrompt } = await import('../prompts/exercisePrompt');

    // Get final system prompt with exercises appended to the end
    const finalSystemPrompt = programSystemPrompt + exercisesPrompt;

    // Transform context into a valid user message payload
    const userMessage = JSON.stringify({
      diagnosisData: context.diagnosisData,
      userInfo: {
        ...context.userInfo,
        // Remove equipment and exerciseEnvironments from userInfo
        equipment: undefined,
        exerciseEnvironments: undefined,
      },
      currentDay: new Date().getDay(),
      previousProgram: context.previousProgram,
      language: context.language || 'en', // Default to English if not specified
    });

    // Call the OpenAI chat completion API
    const response = await openai.chat.completions.create({
      model: PROGRAM_MODEL, // Use dedicated program generation m odel
      messages: [
        {
          role: 'system',
          content: finalSystemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: { type: 'json_object' },
    });

    // Extract the content from the response
    const rawContent = response.choices[0].message.content;
    if (!rawContent) {
      throw new Error('No response content from chat completion');
    }

    console.log(
      `Response first 100 chars: "${rawContent.substring(0, 100)}..."`
    );
    console.log(`Response length: ${rawContent.length} characters`);

    // Parse the response as JSON
    let program: ExerciseProgram;
    try {
      program = JSON.parse(rawContent) as ExerciseProgram;

      // Add createdAt timestamp to the program
      const currentDate = new Date().toISOString();
      program.createdAt = new Date(currentDate);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error(
        'First 200 characters of raw response:',
        rawContent.substring(0, 200)
      );
      throw new Error(
        `Failed to parse response as JSON: ${parseError.message}`
      );
    }

    // Add target areas to the response (type is now at UserProgram level)
    program.targetAreas = context.userInfo.targetAreas;

    // If we have a userId and programId, update the program document
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        // Atomically add the new week document and mark the parent program as Done
        const batch = adminDb.batch();

        // Deactivate other programs of the same type
        const programType = context.diagnosisData.programType;
        if (programType) {
          const otherActiveProgramsQuery = adminDb
            .collection('users')
            .doc(context.userId)
            .collection('programs')
            .where('active', '==', true)
            .where('type', '==', programType);

          const otherActiveProgramsSnapshot =
            await otherActiveProgramsQuery.get();
          otherActiveProgramsSnapshot.forEach((doc) => {
            // Ensure we don't deactivate the program we are currently activating
            if (doc.id !== context.programId) {
              batch.update(doc.ref, {
                active: false,
                updatedAt: new Date().toISOString(),
              });
              console.log(
                `Deactivating program ${doc.id} of type ${programType}`
              );
            }
          });
        } else {
          console.warn(
            'Program type not available, skipping deactivation of other programs.'
          );
        }

        // Extract fields that belong to UserProgram level vs weekly program level
        const { timeFrame, title, days, ...programMetadata } = program as any;

        // New week document reference (auto-ID)
        const newWeekRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId)
          .collection('programs')
          .doc();

        // Save the weekly program data (days array and other program metadata)
        batch.set(newWeekRef, {
          days: days || [],
          ...programMetadata,
          createdAt: new Date().toISOString(),
        });

        // Update the parent document with UserProgram-level fields
        const userProgramUpdates: any = {
          status: ProgramStatus.Done,
          updatedAt: new Date().toISOString(),
          active: true, // Set the new program as active
        };

        // Add timeFrame and title if they exist in the LLM response
        if (timeFrame) {
          userProgramUpdates.timeFrame = timeFrame;
        }
        if (title) {
          userProgramUpdates.title = title;
        }

        batch.update(programRef, userProgramUpdates);

        await batch.commit();

        console.log('Successfully updated program document and set as active');
      } catch (error) {
        console.error('Error updating program document:', error);
        // Update status to error if save fails
        try {
          if (context.userId && context.programId) {
            const programRef = adminDb
              .collection('users')
              .doc(context.userId)
              .collection('programs')
              .doc(context.programId);

            await programRef.update({
              status: ProgramStatus.Error,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (statusError) {
          console.error('Error updating program status to error:', statusError);
        }
        throw error;
      }
    }

    return program;
  } catch (error) {
    console.error('Error generating exercise program with model:', error);
    // If we have a userId and programId, update the status to error
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        await programRef.update({
          status: ProgramStatus.Error,
          updatedAt: new Date().toISOString(),
        });
      } catch (statusError) {
        console.error('Error updating program status to error:', statusError);
      }
    }
    throw new Error('Failed to generate exercise program with model');
  }
}

// Non-streaming chat completion with OpenAI
export async function getChatCompletion({
  threadId: _threadId,
  messages,
  systemMessage,
  userMessage,
  modelName,
  options,
}: {
  threadId: string;
  messages: any[];
  systemMessage: string;
  userMessage: any;
  modelName?: string;
  options?: {
    userId?: string;
    isSubscriber?: boolean;
    estimatedResponseTokens?: number;
    anonId?: string;
  };
}) {
  try {
    void _threadId;
    const model = modelName || DIAGNOSIS_MODEL; // Default to diagnosis model
    throttledLog('info', 'chat_completion_start', `ctx=nonstream model=${model}`);

    // Simple: send last 6 turns for both modes
    const formattedMessages = formatMessagesForChatCompletion((messages || []).slice(-CHAT_MAX_TURNS));

    // Add system message (no complex injection)
    formattedMessages.unshift({
      role: 'system' as const,
      content: systemMessage,
    });

    // Construct the user message content (simple - used for router only)
    let userMessageContent = '';
    if (typeof userMessage === 'string') {
      userMessageContent = userMessage;
    } else if (typeof userMessage === 'object' && userMessage !== null) {
      if (userMessage.message && typeof userMessage.message === 'string') {
        userMessageContent = userMessage.message;
      } else {
        userMessageContent = 'User input: (no direct text provided)';
      }
    } else {
      userMessageContent = JSON.stringify(userMessage);
    }
    throttledLog('debug', 'chat_user_msg', `len=${userMessageContent.length}`);

    // Add the new user message to the history
    formattedMessages.push({
      role: 'user' as const,
      content: userMessageContent,
    });

    throttledLog('debug', 'chat_payload_size', `msgs=${formattedMessages.length}`);

    // Enforce free-tier chat limits (non-subscribers only)
    const estimatedInputTokens = estimateTokensFromString(userMessageContent);
    const estimatedResponse = options?.estimatedResponseTokens ?? ESTIMATED_RESPONSE_TOKENS;
    if (ENFORCE_CHAT_LIMITS && SUBSCRIPTIONS_ENABLED) {
      if (options?.userId && options?.isSubscriber === true) {
        throttledLog('info', `limit_bypass_user_${options.userId}`, `limit=bypass user=${options.userId} reason=subscriber`);
      } else if (options?.userId && options?.isSubscriber === false) {
        await checkAndConsumeUserChatTokens(options.userId, estimatedInputTokens + estimatedResponse);
      } else if (options?.anonId) {
        await checkAndConsumeAnonChatTokens(options.anonId, estimatedInputTokens + estimatedResponse);
      }
    }

    // Call OpenAI Responses API with minimal reasoning effort
    const response = await openai.responses.create({
      model,
      // reasoning: { effort: 'minimal' } as any,
      input: formattedMessages,
      max_output_tokens: CHAT_MAX_OUTPUT_TOKENS,
    } as any);

    // Prefer SDK convenience if available
    const outputText: string | undefined = (response as any).output_text;
    if (outputText && typeof outputText === 'string') {
      throttledLog('debug', 'chat_output_text', `len=${outputText.length}`);
      return outputText;
    }

    // Fallback to first text segment
    const firstText = (response as any)?.output?.[0]?.content?.[0]?.text?.value;
    throttledLog('debug', 'chat_output_first', `len=${firstText?.length ?? 0}`);
    return firstText ?? '';
  } catch (error) {
    console.error('[getChatCompletion] Error:', error);
    throw error;
  }
}
