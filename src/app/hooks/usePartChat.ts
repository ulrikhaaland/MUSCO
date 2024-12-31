import { useRef, useEffect, useState } from 'react';
import { useChat } from './useChat';
import { AnatomyPart } from '../types/anatomy';
import { Question } from '../types';
import { BodyPartGroup } from '../config/bodyPartGroups';

const initialQuestions: Question[] = [
  {
    title: 'Learn more',
    description: `I want to learn more about the $part`,
    question: `I want to learn more about the $part`,
  },
  {
    title: 'I have an issue',
    description: `I need help with a problem related to the $part`,
    question: `I need help with a problem related to the $part`,
  },
  {
    title: 'Explore exercises',
    description: 'Show me exercises that can strengthen or improve the $part',
    question: 'What exercises can strengthen or improve the $part?',
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

  // Update the questions when part changes
  useEffect(() => {
    if (selectedPart || selectedGroup) {
      setLocalFollowUpQuestions(
        getInitialQuestions(selectedPart?.name ?? selectedGroup.name)
      );
    } else if (messages.length === 0) {
      setLocalFollowUpQuestions([]);
    }
  }, [selectedPart, selectedGroup, messages.length]);

  // Update local follow-up questions when chat questions change
  useEffect(() => {
    if (chatFollowUpQuestions?.length > 0) {
      setLocalFollowUpQuestions(chatFollowUpQuestions);
    }
  }, [chatFollowUpQuestions]);

  const handleOptionClick = (question: Question) => {
    sendChatMessage(question.question, {
      userPreferences,
      selectedBodyPart: selectedPart || undefined,
      selectedGroupName: selectedGroup?.name || '',
      bodyPartsInSelectedGroup: selectedGroup?.parts.map((part) => part.name) || [],
      followUpQuestions: chatFollowUpQuestions,
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
