import OpenAI from 'openai';
import { DiagnosisAssistantResponse } from '../../types';
import {
  ENFORCE_CHAT_LIMITS,
  SUBSCRIPTIONS_ENABLED,
  FREE_DAILY_TOKENS,
  ESTIMATED_RESPONSE_TOKENS,
  estimateTokensFromString,
  FreeLimitExceededError,
  logFreeLimit,
} from '@/app/lib/chatLimits';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../../shared/types';
import { adminDb } from '@/app/firebase/admin';
import { ProgramStatus, ExerciseProgram, DayType, getDayType } from '@/app/types/program';
// import { loadServerExercises } from '@/app/services/server-exercises';
import { ProgramFeedback } from '@/app/components/ui/ProgramFeedbackQuestionnaire';
import { prepareExercisesPrompt } from '@/app/helpers/exercise-prompt';
import { getStartOfWeek, addDays } from '@/app/utils/dateutils';
import { recordProgramGenerationAdmin } from '@/app/services/programGenerationLimitsAdmin';
import { PreFollowupFeedback, ExerciseIntensityFeedback, PreFollowupStructuredUpdates, ProgramAdjustments } from '@/app/types/incremental-program';

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
import { DIAGNOSIS_MODEL, EXPLORE_MODEL, PROGRAM_MODEL } from './models';

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
  model: modelOverride,
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
  model?: string;
}) {
  try {
    void _threadId;
    
    // For diagnosis mode: send ALL turns to prevent losing context
    // For explore mode: send last 6 turns to keep token usage reasonable
    const isDiagnosisMode = userMessage && typeof userMessage === 'object' && userMessage.mode === 'diagnosis';
    const isExploreMode = userMessage && typeof userMessage === 'object' && userMessage.mode === 'explore';
    const selectedModel = modelOverride || (isExploreMode ? EXPLORE_MODEL : DIAGNOSIS_MODEL);
    
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

    const stream = await openai.responses.stream({
      model: selectedModel,
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

// Legacy Assistants API functions removed - now using chat-completions with StreamParser

// ----------------------
// Follow-Up Program Types
// ----------------------
interface CleanedProgramFeedback {
  preferredExercises: string[];
  removedExercises: string[];
  replacedExercises: string[];
  addedExercises: { id: string; name: string }[];
}

interface FollowUpMetadataResponse {
  title: string;
  programOverview: string;
  summary: string;
  whatNotToDo: string;
  afterTimeFrame: {
    expectedOutcome: string;
    nextSteps: string;
  };
  weeklyPlan: Array<{
    day: number;
    dayType: 'strength' | 'cardio' | 'recovery' | 'rest';
    intensity: 'high' | 'moderate' | 'low';
    focus: string;
  }>;
}

interface FollowUpSingleDayResponse {
  day: number;
  dayType: DayType;
  description: string;
  exercises: Array<{
    exerciseId: string;
    warmup?: boolean;
    modification?: string;
    precaution?: string;
    duration?: number;
  }>;
  duration: number;
}

// ----------------------
// Helper: Clean program feedback from mixed types to clean IDs/names
// ----------------------
function cleanProgramFeedback(feedback: ProgramFeedback): CleanedProgramFeedback {
  const extractId = (item: string | { id?: string; exerciseId?: string }): string | null => {
    if (typeof item === 'string') return item;
    return (item as any)?.id || (item as any)?.exerciseId || null;
  };

  return {
    preferredExercises: (feedback.preferredExercises || [])
      .map(extractId)
      .filter(Boolean) as string[],
    removedExercises: (feedback.removedExercises || [])
      .map(extractId)
      .filter(Boolean) as string[],
    replacedExercises: (feedback.replacedExercises || [])
      .map(extractId)
      .filter(Boolean) as string[],
    addedExercises: (feedback.addedExercises || []).map((ex) => ({
      id: ex.id || (ex as any).exerciseId || '',
      name: ex.name || '',
    })),
  };
}

// ----------------------
// Helper: Generate follow-up metadata only (no exercises)
// ----------------------
async function generateFollowUpMetadata(request: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  feedback: CleanedProgramFeedback;
  previousProgram?: ExerciseProgram;
  language: string;
  // Additional feedback from pre-followup chat
  conversationalFeedback?: string;
  feedbackSummary?: string;
  overallIntensity?: 'increase' | 'maintain' | 'decrease';
  programAdjustments?: ProgramAdjustments;
}): Promise<FollowUpMetadataResponse> {
  const { followUpMetadataOnlyPrompt } = await import('../prompts/singleDayPrompt');

  const userMessage = JSON.stringify({
    diagnosisData: request.diagnosisData,
    userInfo: {
      ...request.userInfo,
      equipment: undefined,
      exerciseEnvironments: undefined,
    },
    previousProgram: request.previousProgram,
    programFeedback: request.feedback,
    // Include conversational feedback from pre-followup chat
    userFeedbackSummary: request.feedbackSummary || request.conversationalFeedback,
    overallIntensity: request.overallIntensity,
    programAdjustments: request.programAdjustments,
    language: request.language,
  });

  console.log(`[followup-incremental] Generating metadata...`);

  const response = await (openai.responses as any).create({
    model: PROGRAM_MODEL,
    input: [
      { role: 'system', content: followUpMetadataOnlyPrompt },
      { role: 'user', content: userMessage },
    ],
    text: { format: { type: 'json_object' } },
  });

  const rawContent = response.output_text;
  if (!rawContent) {
    throw new Error('No response content from OpenAI for follow-up metadata');
  }

  console.log(`[followup-incremental] Metadata response length: ${rawContent.length}`);

  return JSON.parse(rawContent) as FollowUpMetadataResponse;
}

// ----------------------
// Helper: Build adjustment instructions from user feedback
// ----------------------
function buildAdjustmentInstructions(
  adjustments: ProgramAdjustments,
  previousStats?: {
    avgSets?: number;
    avgReps?: number;
    avgRest?: number;
    workoutDays?: number;
  }
): string {
  const instructions: string[] = [];
  const prev = previousStats || {};

  if (adjustments.sets === 'increase') {
    instructions.push(`Increase sets per exercise (previous avg: ${prev.avgSets || 3} → target: ${(prev.avgSets || 3) + 1})`);
  } else if (adjustments.sets === 'decrease') {
    instructions.push(`Decrease sets per exercise (previous avg: ${prev.avgSets || 3} → target: ${Math.max(2, (prev.avgSets || 3) - 1)})`);
  }

  if (adjustments.reps === 'increase') {
    instructions.push(`Increase reps per set (previous avg: ${prev.avgReps || 10} → target: ${(prev.avgReps || 10) + 2})`);
  } else if (adjustments.reps === 'decrease') {
    instructions.push(`Decrease reps per set (previous avg: ${prev.avgReps || 10} → target: ${Math.max(6, (prev.avgReps || 10) - 2)})`);
  }

  if (adjustments.restTime === 'increase') {
    instructions.push(`Increase rest between sets (previous avg: ${prev.avgRest || 60}s → target: ${(prev.avgRest || 60) + 15}s)`);
  } else if (adjustments.restTime === 'decrease') {
    instructions.push(`Decrease rest between sets (previous avg: ${prev.avgRest || 60}s → target: ${Math.max(30, (prev.avgRest || 60) - 15)}s)`);
  }

  if (adjustments.duration === 'increase') {
    instructions.push('Increase workout duration - add more exercises or sets');
  } else if (adjustments.duration === 'decrease') {
    instructions.push('Decrease workout duration - fewer exercises or sets');
  }

  if (instructions.length === 0) {
    return 'Maintain similar intensity to previous week';
  }

  return 'USER REQUESTED ADJUSTMENTS:\n- ' + instructions.join('\n- ');
}

// ----------------------
// Helper: Generate a single day for follow-up program
// ----------------------
async function generateFollowUpSingleDay(request: {
  dayNumber: number;
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  feedback: CleanedProgramFeedback;
  previousDays: FollowUpSingleDayResponse[];
  weeklyPlan: FollowUpMetadataResponse['weeklyPlan'];
  language: string;
  programAdjustments?: ProgramAdjustments;
  previousProgramStats?: {
    avgSets?: number;
    avgReps?: number;
    avgRest?: number;
    workoutDays?: number;
  };
  // Additional feedback from pre-followup chat
  feedbackSummary?: string;
  overallIntensity?: 'increase' | 'maintain' | 'decrease';
}): Promise<FollowUpSingleDayResponse> {
  const { followUpSingleDaySystemPrompt } = await import('../prompts/singleDayPrompt');

  // Get exercises prompt, excluding removed exercises
  const removedExerciseIds = [
    ...request.feedback.removedExercises,
    ...request.feedback.replacedExercises,
  ];

  const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(
    request.userInfo,
    removedExerciseIds,
    false, // includeEquipment
    request.language
  );

  console.log(`[followup-incremental] Day ${request.dayNumber}: using ${exerciseCount} exercises`);

  const finalSystemPrompt = followUpSingleDaySystemPrompt + exercisesPrompt;

  // Build context about previous days for variety
  const previousDaysContext = request.previousDays.map((day) => ({
    day: day.day,
    exerciseIds: day.exercises.map((e) => e.exerciseId).filter(Boolean),
  }));

  // Build adjustment instructions based on user feedback
  const adjustmentInstructions = request.programAdjustments ? {
    adjustments: request.programAdjustments,
    previousStats: request.previousProgramStats,
    instructions: buildAdjustmentInstructions(request.programAdjustments, request.previousProgramStats),
  } : undefined;

  const userMessage = JSON.stringify({
    dayToGenerate: request.dayNumber,
    weeklyPlan: request.weeklyPlan,
    previousDays: previousDaysContext,
    targetAreas: request.userInfo.targetAreas,
    cardioType: request.userInfo.cardioType,
    cardioEnvironment: request.userInfo.cardioEnvironment,
    workoutDuration: request.userInfo.workoutDuration,
    diagnosisData: request.diagnosisData,
    programFeedback: request.feedback,
    programAdjustments: adjustmentInstructions,
    // Include conversational feedback from pre-followup chat
    userFeedbackSummary: request.feedbackSummary,
    overallIntensity: request.overallIntensity,
    userInfo: {
      ...request.userInfo,
      equipment: undefined,
      exerciseEnvironments: undefined,
    },
    language: request.language,
  });

  const response = await (openai.responses as any).create({
    model: PROGRAM_MODEL,
    input: [
      { role: 'system', content: finalSystemPrompt },
      { role: 'user', content: userMessage },
    ],
    text: { format: { type: 'json_object' } },
  });

  const rawContent = response.output_text;
  if (!rawContent) {
    throw new Error(`No response content from OpenAI for follow-up day ${request.dayNumber}`);
  }

  console.log(`[followup-incremental] Day ${request.dayNumber} response length: ${rawContent.length}`);

  const parsed = JSON.parse(rawContent) as FollowUpSingleDayResponse;
  parsed.day = request.dayNumber; // Ensure day number matches request

  return parsed;
}

// ----------------------
// Helper: Create week document with follow-up metadata
// ----------------------
async function createFollowUpWeekWithMetadata(
  userId: string,
  programId: string,
  metadata: FollowUpMetadataResponse,
  targetAreas: string[],
  createdAtIso: string
): Promise<string> {
  const programRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('programs')
    .doc(programId);

  // Create new week document in weeks subcollection
  const weekRef = programRef.collection('weeks').doc();

  // Week-specific data
  const weekData = {
    programOverview: metadata.programOverview,
    summary: metadata.summary,
    whatNotToDo: metadata.whatNotToDo,
    afterTimeFrame: metadata.afterTimeFrame,
    targetAreas: targetAreas,
    bodyParts: targetAreas,
    days: [],
    generatingDay: 1,
    createdAt: createdAtIso,
  };

  // Update program document with title and tracking fields
  const batch = adminDb.batch();
  batch.set(weekRef, weekData);
  batch.update(programRef, {
    title: metadata.title,
    currentWeekId: weekRef.id,
    generatingDay: 1,
    updatedAt: new Date().toISOString(),
  });
  await batch.commit();

  console.log(`[followup-incremental] Created week ${weekRef.id} with metadata for program ${programId}`);
  return weekRef.id;
}

// ----------------------
// Helper: Save a day to follow-up week
// ----------------------
async function saveFollowUpDayToWeek(
  userId: string,
  programId: string,
  weekId: string,
  day: FollowUpSingleDayResponse,
  isLastDay: boolean,
  diagnosisType?: string
): Promise<void> {
  const programRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('programs')
    .doc(programId);

  const weekRef = programRef.collection('weeks').doc(weekId);

  const batch = adminDb.batch();

  // Get current week data
  const weekSnap = await weekRef.get();
  const weekData = weekSnap.data() || {};
  const existingDays: FollowUpSingleDayResponse[] = weekData.days || [];

  // Add or replace the day
  const dayIndex = existingDays.findIndex((d) => d.day === day.day);
  if (dayIndex >= 0) {
    existingDays[dayIndex] = day;
  } else {
    existingDays.push(day);
  }
  // Sort by day number
  existingDays.sort((a, b) => a.day - b.day);

  // Update week document
  batch.update(weekRef, {
    days: existingDays,
    generatingDay: isLastDay ? null : day.day + 1,
  });

  // Update program document
  const programUpdates: Record<string, unknown> = {
    generatingDay: isLastDay ? null : day.day + 1,
    updatedAt: new Date().toISOString(),
  };

  if (isLastDay) {
    programUpdates.status = ProgramStatus.Done;
    programUpdates.currentWeekId = null;

    // Record the weekly generation limit now that program is complete
    if (diagnosisType) {
      await recordProgramGenerationAdmin(userId, diagnosisType as ProgramType);
    }
  }

  batch.update(programRef, programUpdates);
  await batch.commit();

  console.log(`[followup-incremental] Saved day ${day.day} to week ${weekId} (lastDay: ${isLastDay})`);
}

// ----------------------
// Main: Generate follow-up exercise program (incremental)
// ----------------------
export async function generateFollowUpExerciseProgram(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  feedback: ProgramFeedback | PreFollowupFeedback;
  userId?: string;
  programId?: string;
  previousProgram?: ExerciseProgram;
  language?: string;
  desiredCreatedAt?: string;
}) {
  const language = context.language || 'en';

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
        console.log('[followup-incremental] Updated program status to Generating');
      } catch (error) {
        console.error('[followup-incremental] Error updating program status to Generating:', error);
        // Continue even if status update fails
      }
    }

    // Determine if this is a PreFollowupFeedback or legacy ProgramFeedback
    const isPreFollowupFeedback = 'conversationalFeedback' in context.feedback;
    
    // Extract exercise intensity feedback for later use
    let exerciseIntensity: ExerciseIntensityFeedback[] | undefined;
    let conversationalFeedback: string | undefined;
    let overallIntensity: 'increase' | 'maintain' | 'decrease' | undefined;
    let structuredUpdates: PreFollowupStructuredUpdates | undefined;
    let programAdjustments: ProgramAdjustments | undefined;
    
    // Clean the feedback data
    let cleanedFeedback;
    if (isPreFollowupFeedback) {
      const prefFeedback = context.feedback as PreFollowupFeedback;
      exerciseIntensity = prefFeedback.exerciseIntensity;
      conversationalFeedback = prefFeedback.conversationalFeedback;
      overallIntensity = prefFeedback.overallIntensity;
      structuredUpdates = prefFeedback.structuredUpdates;
      programAdjustments = prefFeedback.structuredUpdates?.programAdjustments;
      
      // Use the exercise feedback if provided, otherwise create empty feedback
      if (prefFeedback.exerciseFeedback) {
        cleanedFeedback = prefFeedback.exerciseFeedback;
      } else {
        cleanedFeedback = {
          preferredExercises: [],
          removedExercises: [],
          replacedExercises: [],
          addedExercises: [],
        };
      }
      
      console.log('[followup-incremental] Using PreFollowupFeedback:');
      console.log(`  Exercise intensity feedback: ${exerciseIntensity?.length || 0} items`);
      console.log(`  Overall intensity: ${overallIntensity || 'not specified'}`);
      console.log(`  Conversational feedback length: ${conversationalFeedback?.length || 0} chars`);
      console.log(`  Program adjustments:`, programAdjustments || 'none');
      console.log(`  Structured updates:`, structuredUpdates ? JSON.stringify(structuredUpdates) : 'none');
    } else {
      cleanedFeedback = cleanProgramFeedback(context.feedback as ProgramFeedback);
    }

    // Log feedback for debugging
    throttledLog(
      'debug',
      'followup_feedback_sizes',
      `pref=${cleanedFeedback.preferredExercises.length} rem=${cleanedFeedback.removedExercises.length} repl=${cleanedFeedback.replacedExercises.length} add=${cleanedFeedback.addedExercises.length}`
    );

    console.log('[followup-incremental] Program feedback details:');
    console.log(`  Preferred exercises (${cleanedFeedback.preferredExercises.length}):`, cleanedFeedback.preferredExercises);
    console.log(`  Removed exercises (${cleanedFeedback.removedExercises.length}):`, cleanedFeedback.removedExercises);
    console.log(`  Replaced exercises (${cleanedFeedback.replacedExercises.length}):`, cleanedFeedback.replacedExercises);
    console.log(`  Added exercises (${cleanedFeedback.addedExercises.length}):`, cleanedFeedback.addedExercises);

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

    // Convert to UTC Monday 00:00
    const nextProgramDateUTC = new Date(
      Date.UTC(
        nextProgramDate.getFullYear(),
        nextProgramDate.getMonth(),
        nextProgramDate.getDate()
      )
    );
    const createdAtIso = nextProgramDateUTC.toISOString();

    // ========================================
    // STEP 1: Generate metadata + weeklyPlan
    // ========================================
    console.log('[followup-incremental] Step 1: Generating metadata...');
    const metadata = await generateFollowUpMetadata({
      diagnosisData: context.diagnosisData,
      userInfo: context.userInfo,
      feedback: cleanedFeedback,
      previousProgram: context.previousProgram,
      language,
      // Pass additional feedback from pre-followup chat
      conversationalFeedback,
      feedbackSummary: structuredUpdates?.feedbackSummary,
      overallIntensity,
      programAdjustments,
    });

    // ========================================
    // STEP 2: Create week document with metadata (if we have userId/programId)
    // ========================================
    let weekId: string | null = null;
    if (context.userId && context.programId) {
      weekId = await createFollowUpWeekWithMetadata(
        context.userId,
        context.programId,
        metadata,
        context.userInfo.targetAreas || [],
        createdAtIso
      );
    }

    // ========================================
    // STEP 3: Generate days 1-7, saving each immediately
    // ========================================
    console.log('[followup-incremental] Step 3: Generating days 1-7...');
    const generatedDays: FollowUpSingleDayResponse[] = [];

    // Calculate previous program stats for adjustment instructions
    const previousProgramStats = context.previousProgram?.days ? (() => {
      const allSets: number[] = [];
      const allReps: number[] = [];
      const allRest: number[] = [];
      
      context.previousProgram.days.forEach(d => {
        d.exercises?.forEach(e => {
          if (e.sets) allSets.push(e.sets);
          if (e.repetitions) allReps.push(e.repetitions);
          if (e.restBetweenSets) allRest.push(e.restBetweenSets);
        });
      });

      return {
        avgSets: allSets.length > 0 ? Math.round(allSets.reduce((a, b) => a + b, 0) / allSets.length) : undefined,
        avgReps: allReps.length > 0 ? Math.round(allReps.reduce((a, b) => a + b, 0) / allReps.length) : undefined,
        avgRest: allRest.length > 0 ? Math.round(allRest.reduce((a, b) => a + b, 0) / allRest.length) : undefined,
        workoutDays: context.previousProgram.days.filter(d => d.dayType !== 'rest').length,
      };
    })() : undefined;

    if (programAdjustments) {
      console.log('[followup-incremental] Applying program adjustments:', programAdjustments);
      console.log('[followup-incremental] Previous program stats:', previousProgramStats);
    }

    for (let dayNum = 1; dayNum <= 7; dayNum++) {
      console.log(`[followup-incremental] Generating day ${dayNum}...`);

      const dayResult = await generateFollowUpSingleDay({
        dayNumber: dayNum,
        diagnosisData: context.diagnosisData,
        userInfo: context.userInfo,
        feedback: cleanedFeedback,
        previousDays: generatedDays,
        weeklyPlan: metadata.weeklyPlan,
        language,
        programAdjustments,
        previousProgramStats,
        // Pass additional feedback from pre-followup chat
        feedbackSummary: structuredUpdates?.feedbackSummary,
        overallIntensity,
      });

      generatedDays.push(dayResult);

      // Save immediately to Firebase if we have credentials
      const isLastDay = dayNum === 7;
      if (context.userId && context.programId && weekId) {
        await saveFollowUpDayToWeek(
          context.userId,
          context.programId,
          weekId,
          dayResult,
          isLastDay,
          context.diagnosisData?.programType
        );
      }
    }

    // ========================================
    // STEP 4: Build and return the complete program
    // ========================================
    console.log('[followup-incremental] Step 4: Building final program...');

    // Validate feedback compliance
    const includedExerciseIds = new Set<string>();
    generatedDays.forEach((day) => {
      if (day.dayType !== 'rest' && day.exercises) {
        day.exercises.forEach((ex) => {
          if (ex.exerciseId) includedExerciseIds.add(ex.exerciseId);
        });
      }
    });

    const preferredIncluded = cleanedFeedback.preferredExercises.filter((id) => includedExerciseIds.has(id)).length;
    const removedIncluded = cleanedFeedback.removedExercises.filter((id) => includedExerciseIds.has(id)).length;
    const addedIncluded = cleanedFeedback.addedExercises.filter((ex) => includedExerciseIds.has(ex.id)).length;
    
    console.log('[followup-incremental] Feedback compliance:', {
      preferredIncluded: `${preferredIncluded}/${cleanedFeedback.preferredExercises.length}`,
      removedIncluded: `${removedIncluded} (should be 0)`,
      addedIncluded: `${addedIncluded}/${cleanedFeedback.addedExercises.length}`,
    });

    // Construct the final program object
    // Note: The days contain LLM-generated exercise references (exerciseId only).
    // Full exercise data (name, description, etc.) is populated on the client side.
    const program: ExerciseProgram = {
      title: metadata.title,
      programOverview: metadata.programOverview,
      summary: metadata.summary,
      whatNotToDo: metadata.whatNotToDo,
      afterTimeFrame: metadata.afterTimeFrame,
      targetAreas: context.userInfo.targetAreas || [],
      bodyParts: context.userInfo.targetAreas || [],
      timeFrameExplanation: '', // Not used in follow-up programs
      days: generatedDays as unknown as ExerciseProgram['days'],
      createdAt: nextProgramDateUTC,
    };

    console.log('[followup-incremental] Successfully generated follow-up program');
    return program;

  } catch (error) {
    console.error('[followup-incremental] Error generating follow-up exercise program:', error);
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
        console.error('[followup-incremental] Error updating program status to error:', statusError);
      }
    }
    throw new Error('Failed to generate follow-up exercise program');
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

    const response = await openai.responses.create({
      model,
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
