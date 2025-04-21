import { useRef, useEffect, useState } from 'react';
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
  },
  {
    title: t('chat.question.movement.title'),
    question: t('chat.question.movement.text'),
    asked: false,
  },
  {
    title: t('chat.question.exercise.title'),
    question: t('chat.question.exercise.text'),
    asked: false,
    generate: true,
    diagnosis: '',
    programType: ProgramType.Exercise,
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

  const handleOptionClick = (question: Question) => {
    const prevQuestions = [...previousQuestions, ...localFollowUpQuestions];
    setPreviousQuestions(prevQuestions);

    sendChatMessage(question.question, {
      userPreferences,
      selectedBodyPart: selectedPart || undefined,
      selectedBodyGroupName: selectedGroups[0] ? translateBodyPartGroupName(selectedGroups[0], t) : '',
      bodyPartsInSelectedGroup:
        selectedGroups[0]?.parts.map((part) => part.name) || [],
      previousQuestions: prevQuestions,
    });
  };

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
  };
}
