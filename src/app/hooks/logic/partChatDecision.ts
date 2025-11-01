export interface ModeDecisionInput {
  forceMode?: 'diagnosis' | 'explore';
  rawMode?: 'diagnosis' | 'explore' | undefined;
  currentChatMode: 'diagnosis' | 'explore';
  messagesLength: number;
  questionTitle?: string;
  questionHasChatMode?: boolean;
  questionGenerate?: boolean;
}

export interface ModeDecisionOutput {
  nextMode: 'diagnosis' | 'explore';
  modeForPayload: 'diagnosis' | 'explore' | undefined;
  deferRouter: boolean;
}

export function decideMode(input: ModeDecisionInput): ModeDecisionOutput {
  const {
    forceMode: forced,
    rawMode,
    currentChatMode,
    messagesLength,
    questionTitle,
    questionHasChatMode,
    questionGenerate,
  } = input;

  // Determine next mode based on priority:
  // 1. forceMode (from component prop)
  // 2. rawMode (explicit chatMode from question/template)
  // 3. currentChatMode (existing conversation mode)
  let nextMode: 'diagnosis' | 'explore' = currentChatMode;
  if (forced) {
    nextMode = forced;
  } else if (rawMode === 'diagnosis' || rawMode === 'explore') {
    nextMode = rawMode;
  }

  // Defer to backend router ONLY for:
  // - First message (no conversation history)
  // - Typed by user (no question button clicked)
  // - No explicit chatMode provided (template questions always have chatMode)
  const isTypedFirstMessage =
    messagesLength === 0 &&
    (!questionTitle || questionTitle.trim() === '') &&
    !(questionHasChatMode || (rawMode === 'diagnosis' || rawMode === 'explore')) &&
    !questionGenerate;

  const deferRouter = !forced && isTypedFirstMessage;
  const modeForPayload = deferRouter ? undefined : nextMode;

  return { nextMode, modeForPayload, deferRouter };
}


