import { useRef, useEffect, useState, useCallback } from 'react';
import { useChat } from './useChat';
import { AnatomyPart } from '../types/human';
import { Question, DiagnosisAssistantResponse } from '../types';
import { BodyPartGroup } from '../config/bodyPartGroups';
import { ProgramIntention, useApp } from '../context/AppContext';
import { ProgramType } from '../../../shared/types';
import { useTranslation } from '../i18n';
import { translateBodyPartGroupName, translatePartDirectionPrefix } from '../utils/bodyPartTranslation';
import { decideMode } from './logic/partChatDecision';
import { detectProgramType } from '../utils/questionAugmentation';

// Initialize translations with null function that will be replaced
let t = (key: string) => key;

// Define initial questions using translation function
const getInitialQuestionsTemplate = (): Question[] => [
  {
    title: t('chat.question.painSource.title'),
    question: t('chat.question.painSource.text'),
    asked: false,
    meta: t('chat.question.painSource.meta'),
    chatMode: 'diagnosis',
  },
  {
    title: t('chat.question.explore.title'),
    question: t('chat.question.explore.text'),
    asked: false,
    meta: t('chat.question.explore.meta'),
    chatMode: 'explore',
  },
  {
    title: t('chat.question.exercise.title'),
    question: t('chat.question.exercise.text'),
    asked: false,
    generate: true,
    diagnosis: '',
    programType: ProgramType.Exercise,
    meta: t('chat.question.exercise.meta'),
  },
];

function getInitialQuestions(name?: string, intention?: string, translationFunc?: (key: string) => string): Question[] {
  if (!name) return [];

  // Use provided translation function or fallback to identity function
  const translate = translationFunc || ((key: string) => key);
  
  // Update t for template generation
  t = translate;
  
  // Get questions with translations applied
  const questions = getInitialQuestionsTemplate().map(q => {
    // Deep copy to avoid modifying the original
    const question = {...q};
    
    // Replace the Exercise program question with Recovery program when intention is recovery
    if (question.title === translate('chat.question.exercise.title') && intention === ProgramIntention.Recovery) {
      question.title = translate('chat.question.recovery.title');
      question.question = translate('chat.question.recovery.text');
      question.programType = ProgramType.Recovery;
    }
    
      // Always replace the $part placeholder with the part name
  return {
    ...question,
    question: question.question.replace('$part', name.toLowerCase()),
    meta: question.meta?.replace('$part', name.toLowerCase()),
  };
  });

  return questions;
}

// Pure decision helper extracted for unit testing
// moved to './logic/partChatDecision'

export interface UsePartChatProps {
  selectedPart: AnatomyPart | null;
  selectedGroups: BodyPartGroup[];
  forceMode?: 'diagnosis' | 'explore';
  onGenerateProgram?: (programType: ProgramType, diagnosisData?: DiagnosisAssistantResponse | null) => void;
}

export function usePartChat({
  selectedPart,
  selectedGroups,
  forceMode,
  onGenerateProgram,
}: UsePartChatProps) {
  const { t } = useTranslation();
  const messagesRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    rateLimited,
    userPreferences,
    followUpQuestions: chatFollowUpQuestions,
    exerciseResults,
    resetChat,
    sendChatMessage,
    assistantResponse,
    streamError,
  } = useChat();

  const { intention } = useApp();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const [localFollowUpQuestions, setLocalFollowUpQuestions] = useState<
    Question[]
  >(() => {
    const name = selectedPart 
      ? translatePartDirectionPrefix(selectedPart, t).toLowerCase()
      : (selectedGroups.length > 0 ? translateBodyPartGroupName(selectedGroups[0], t).toLowerCase() : '');
    return getInitialQuestions(name, intention, t);
  });

  const [previousQuestions, setPreviousQuestions] = useState<Question[]>([]);
  const [chatMode, setChatMode] = useState<'diagnosis' | 'explore'>(forceMode ?? 'diagnosis');

  // Update the questions when part changes
  useEffect(() => {
    if (selectedPart || selectedGroups.length > 0) {
      const name = selectedPart 
        ? translatePartDirectionPrefix(selectedPart, t).toLowerCase()
        : (selectedGroups.length > 0 ? translateBodyPartGroupName(selectedGroups[0], t).toLowerCase() : '');
        
      setLocalFollowUpQuestions(
        getInitialQuestions(name, intention, t)
      );
    } else if (messages.length === 0) {
      setLocalFollowUpQuestions([]);
      setPreviousQuestions([]);
    }
  }, [selectedPart, selectedGroups, messages.length, intention, t]);

  // Update local follow-up questions when chat questions change
  useEffect(() => {
    if (chatFollowUpQuestions?.length > 0) {
      setLocalFollowUpQuestions(chatFollowUpQuestions);
    }
  }, [chatFollowUpQuestions]);

  const switchHandledRef = useRef(false);

  const handleOptionClick = useCallback((question: Question) => {
    // Check if this is a special "Answer in chat" button
    if (question.question === 'Answer in chat') {
      // Focus the chat input field
      const chatInput = document.querySelector('input[type="text"], textarea') as HTMLElement;
      if (chatInput) {
        chatInput.focus();
      }
      // Don't clear follow-ups - let user see the button while typing
      return;
    }

    // Check if this is a program generation button
    // Primary check: backend-augmented fields
    if ((question as any).generate && (question as any).programType) {
      const programType = (question as any).programType as ProgramType;
      onGenerateProgram?.(programType, assistantResponse);
      setLocalFollowUpQuestions([]);
      return;
    }
    
    // Fallback check: detect by question text (for cached/old questions)
    const detection = detectProgramType(question.question);
    
    if (detection.isProgram && detection.programType) {
      onGenerateProgram?.(detection.programType, assistantResponse);
      setLocalFollowUpQuestions([]);
      return;
    }

    const rawMode = (question as any).chatMode as ('diagnosis' | 'explore') | undefined;

    const decision = decideMode({
      forceMode,
      rawMode,
      currentChatMode: chatMode,
      messagesLength: messages.length,
      questionTitle: question.title,
      questionHasChatMode: Boolean((question as any).chatMode),
      questionGenerate: Boolean((question as any).generate),
    });

    try {
      console.info(`level=info event=fe_mode_decide next=${decision.nextMode} force=${Boolean(forceMode)} chat_mode=${rawMode ?? 'none'}`);
    } catch {}

    setChatMode(decision.nextMode);

    // Merge previous and current follow-up options, de-duplicating by question text
    const merged = [...previousQuestions, ...localFollowUpQuestions];
    const seen = new Set<string>();
    const deduped = merged.filter((q) => {
      if (!q.question) return false;
      const key = q.question.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    setPreviousQuestions(deduped);

    // Immediately clear follow-up questions to prevent stale ones from flashing
    setLocalFollowUpQuestions([]);

    if (decision.deferRouter) {
      try { console.info('level=info event=fe_defer_router reason=first_typed'); } catch {}
    }

    sendChatMessage(question.question, {
      mode: decision.modeForPayload,
      userPreferences,
      selectedBodyPart: selectedPart || undefined,
      selectedBodyGroupName: selectedGroups[0]
        ? translateBodyPartGroupName(selectedGroups[0], t)
        : '',
      bodyPartsInSelectedGroup: selectedGroups[0]?.parts.map((part) => part.name) || [],
      previousQuestions: deduped,
      // guidance to assistants: more options on desktop
      maxFollowUpOptions: isMobile ? 3 : 6,
      diagnosisAssistantResponse: assistantResponse || undefined, // Pass current assistant state
    });
  }, [chatMode, previousQuestions, localFollowUpQuestions, userPreferences, selectedPart, selectedGroups, t, sendChatMessage, forceMode, isMobile, messages.length, assistantResponse, onGenerateProgram]);

  const getGroupDisplayName = (): string => {
    if (selectedGroups.length === 0) {
      return messages.length > 0
        ? t('chat.noBodyPartSelected')
        : t('chat.selectBodyPartToStart');
    } else {
      return translateBodyPartGroupName(selectedGroups[0], t);
    }
  };

  const getPartDisplayName = (): string => {
    if (!selectedPart) {
      if (selectedGroups.length === 0) {
        return '';
      } else {
        const translatedGroupName = translateBodyPartGroupName(selectedGroups[0], t);
        return t('chat.chatAboutOrSelectSpecific', { group: translatedGroupName.toLowerCase() });
      }
    }
    return translatePartDirectionPrefix(selectedPart, t);
  };

  // Effect to handle automatic switch to diagnosis
  useEffect(() => {
    if (assistantResponse?.switchToDiagnosis && !switchHandledRef.current) {
      // The exploration assistant signalled that we should offer a pain-assessment switch.
      // Show the "Find Pain" follow-up option but wait for the user to click it.
      switchHandledRef.current = true;
      // Replace local follow-ups with the ones coming from the assistant (they include Find Pain)
      if (assistantResponse.followUpQuestions?.length) {
        setLocalFollowUpQuestions(assistantResponse.followUpQuestions);
      }
      // Do NOT auto-send; user must click the option explicitly.
    }
  }, [assistantResponse, selectedPart, selectedGroups, t, handleOptionClick]);

  const returnedFollowUps = messages.length === 0 ? localFollowUpQuestions : chatFollowUpQuestions;

  return {
    messages,
    isLoading,
    rateLimited,
    followUpQuestions: returnedFollowUps,
    exerciseResults,
    messagesRef,
    resetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    assistantResponse,
    streamError,
  };
}
