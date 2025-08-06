import { useRef, useEffect, useState, useCallback } from 'react';
import { useChat } from './useChat';
import { AnatomyPart } from '../types/human';
import { Question } from '../types';
import { BodyPartGroup } from '../config/bodyPartGroups';
import { ProgramIntention, useApp } from '../context/AppContext';
import { ProgramType } from '../shared/types';
import { useTranslation } from '../i18n';
import { translateBodyPartGroupName, translatePartDirectionPrefix } from '../utils/bodyPartTranslation';

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

export interface UsePartChatProps {
  selectedPart: AnatomyPart | null;
  selectedGroups: BodyPartGroup[];
}

export function usePartChat({
  selectedPart,
  selectedGroups,
}: UsePartChatProps) {
  const { t } = useTranslation();
  const messagesRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    userPreferences,
    followUpQuestions: chatFollowUpQuestions,
    resetChat,
    sendChatMessage,
    assistantResponse,
    streamError,
  } = useChat();

  const { intention } = useApp();

  const [localFollowUpQuestions, setLocalFollowUpQuestions] = useState<
    Question[]
  >(() => {
    const name = selectedPart 
      ? translatePartDirectionPrefix(selectedPart, t).toLowerCase()
      : (selectedGroups.length > 0 ? translateBodyPartGroupName(selectedGroups[0], t).toLowerCase() : '');
    return getInitialQuestions(name, intention, t);
  });

  const [previousQuestions, setPreviousQuestions] = useState<Question[]>([]);
  const [chatMode, setChatMode] = useState<'diagnosis' | 'explore'>('diagnosis');

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
    // Decide which assistant should handle the next turn.
    // Prefer explicit programType flag from the backend. Fallback to heuristics on the title text.
    const programTypeRaw = (question as any).chatMode as string | undefined;
    const titleLower = (question.title || '').toLowerCase();

    let nextMode: 'diagnosis' | 'explore' = chatMode;

    // Localised titles
    const exploreTitleLower = t('chat.question.explore.title').toLowerCase();
    const painTitleLower = t('chat.question.painSource.title').toLowerCase();

    const isDiagnosisOption =
      programTypeRaw === 'diagnosis';

    const isExploreOption =
      titleLower === exploreTitleLower ||
      titleLower.includes('explore') ||
      titleLower.includes('utforsk');

    if (isDiagnosisOption) {
      nextMode = 'diagnosis';
    } else if (isExploreOption) {
      nextMode = 'explore';
    }

    setChatMode(nextMode);

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

    sendChatMessage(question.question, {
      mode: nextMode,
      userPreferences,
      selectedBodyPart: selectedPart || undefined,
      selectedBodyGroupName: selectedGroups[0]
        ? translateBodyPartGroupName(selectedGroups[0], t)
        : '',
      bodyPartsInSelectedGroup: selectedGroups[0]?.parts.map((part) => part.name) || [],
      previousQuestions: deduped,
    });
  }, [chatMode, previousQuestions, localFollowUpQuestions, userPreferences, selectedPart, selectedGroups, t, sendChatMessage]);

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

  return {
    messages,
    isLoading,
    followUpQuestions:
      messages.length === 0 ? localFollowUpQuestions : chatFollowUpQuestions,
    messagesRef,
    resetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    assistantResponse,
    streamError,
  };
}
