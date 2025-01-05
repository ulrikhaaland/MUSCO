import { useRef, useEffect, useState } from 'react';
import { useChat } from './useChat';
import { AnatomyPart } from '../types/anatomy';
import { Question } from '../types';
import { BodyPartGroup } from '../config/bodyPartGroups';

const initialQuestions: Question[] = [
  {
    title: 'Find the source of my pain',
    description:
      'Help me figure out what might be causing discomfort in the $part',
    question:
      'I’m experiencing discomfort in the $part. Can you help me find out what’s wrong?',
    asked: false,
  },
  {
    title: 'Test my movement',
    description:
      'Guide me through a few quick movements to check for issues with the $part',
    question:
      'Can you walk me through some movements to check if there’s an issue with the $part?',
    asked: false,
  },
  {
    title: 'Learn about common problems',
    description:
      'What are some common issues people experience with the $part?',
    question: 'What are some common issues or injuries related to the $part?',
    asked: false,
  },
  {
    title: 'Explore exercises',
    description:
      'Show me exercises to improve the function and strength of the $part',
    question: 'What exercises can help improve the $part?',
    asked: false,
  },
];

function getInitialQuestions(name?: string): Question[] {
  if (!name) return [];

  // Always use the full part name
  return initialQuestions.map((q) => ({
    ...q,
    description: q.description.replace('$part', name.toLowerCase()),
    question: q.question.replace('$part', name.toLowerCase()),
  }));
}

export interface UsePartChatProps {
  selectedPart: AnatomyPart | null;
  selectedGroup: BodyPartGroup | null;
}

export function usePartChat({ selectedPart, selectedGroup }: UsePartChatProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    userPreferences,
    followUpQuestions: chatFollowUpQuestions,
    resetChat,
    sendChatMessage,
    setFollowUpQuestions,
  } = useChat();

  const [localFollowUpQuestions, setLocalFollowUpQuestions] = useState<
    Question[]
  >(() => getInitialQuestions());

  const [previousQuestions, setPreviousQuestions] = useState<Question[]>([]);

  // Update the questions when part changes
  useEffect(() => {
    if (selectedPart || selectedGroup) {
      setLocalFollowUpQuestions(
        getInitialQuestions(selectedPart?.name ?? selectedGroup.name)
      );
    } else if (messages.length === 0) {
      setLocalFollowUpQuestions([]);
      setPreviousQuestions([]);
    }
  }, [selectedPart, selectedGroup, messages.length]);

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
      selectedBodyGroupName: selectedGroup?.name || '',
      bodyPartsInSelectedGroup:
        selectedGroup?.parts.map((part) => part.name) || [],
      previousQuestions: prevQuestions,
    });
  };

  const getGroupDisplayName = (): string => {
    if (!selectedGroup) {
      return messages.length > 0
        ? 'No body part selected'
        : 'Select a body part to get started';
    } else {
      return selectedGroup.name;
    }
  };

  const getPartDisplayName = (): string => {
    if (!selectedPart) {
      if (!selectedGroup) {
        return '';
      } else {
        return `Chat about the ${selectedGroup.name} or select a specific part`;
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
  };
}
