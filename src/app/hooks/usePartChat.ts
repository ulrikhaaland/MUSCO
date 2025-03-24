import { useRef, useEffect, useState } from 'react';
import { useChat } from './useChat';
import { AnatomyPart } from '../types/human';
import { Question } from '../types';
import { BodyPartGroup } from '../config/bodyPartGroups';
import { ProgramIntention, useApp } from '../context/AppContext';
import { ProgramType } from '../shared/types';

const initialQuestions: Question[] = [
  {
    title: 'Find the source of my pain',
    question: "I'm experiencing discomfort in the $part. Can you help me find out what's wrong?",
    asked: false,
  },
  {
    title: 'Test my movement',
    question: "Can you walk me through some movements to check if there's an issue with the $part?",
    asked: false,
  },
  // {
  //   title: 'Learn about common problems',
  //   question: 'What are some common issues or injuries related to the $part?',
  //   asked: false,
  // },
  {
    title: 'Exercise program',
    question: 'What is the best exercise program for my $part?',
    asked: false,
    generate: true,
    diagnosis: '',
    programType: ProgramType.Exercise,
  },
];

function getInitialQuestions(name?: string, intention?: string): Question[] {
  if (!name) return [];

  // Modify questions based on intention
  const questions = initialQuestions.map(q => {
    // Deep copy to avoid modifying the original
    const question = {...q};
    
    // Replace the Exercise program question with Recovery program when intention is recovery
    if (question.title === 'Exercise program' && intention === ProgramIntention.Recovery) {
      question.title = 'Recovery program';
      question.question = 'What is the best recovery program for my $part?';
      question.programType = ProgramType.Recovery;
    }
    
    // Always use the full part name
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
  >(() => getInitialQuestions(selectedPart?.name, intention));

  const [previousQuestions, setPreviousQuestions] = useState<Question[]>([]);

  // Update the questions when part changes
  useEffect(() => {
    if (selectedPart || selectedGroups.length > 0) {
      setLocalFollowUpQuestions(
        getInitialQuestions(selectedPart?.name ?? selectedGroups[0].name, intention)
      );
    } else if (messages.length === 0) {
      setLocalFollowUpQuestions([]);
      setPreviousQuestions([]);
    }
  }, [selectedPart, selectedGroups, messages.length, intention]);

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
      selectedBodyGroupName: selectedGroups[0]?.name || '',
      bodyPartsInSelectedGroup:
        selectedGroups[0]?.parts.map((part) => part.name) || [],
      previousQuestions: prevQuestions,
    });
  };

  const getGroupDisplayName = (): string => {
    if (selectedGroups.length === 0) {
      return messages.length > 0
        ? 'No body part selected'
        : 'Select a body part to get started';
    } else {
      return selectedGroups[0].name;
    }
  };

  const getPartDisplayName = (): string => {
    if (!selectedPart) {
      if (selectedGroups.length === 0) {
        return '';
      } else {
        return `Chat about the ${selectedGroups[0].name} or select a specific part`;
      }
    }
    return selectedPart.name;
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
