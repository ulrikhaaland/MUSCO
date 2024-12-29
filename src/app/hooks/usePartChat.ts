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

function getInitialQuestions(part: AnatomyPart | null): Question[] {
  if (!part || !part.name) return [];

  // Always use the full part name
  return initialQuestions.map((q) => ({
    ...q,
    description: q.description.replace('$part', part.name.toLowerCase()),
    question: q.question.replace('$part', part.name.toLowerCase()),
  }));
}

export interface UsePartChatProps {
  selectedPart: AnatomyPart | null;
  selectedGroup: BodyPartGroup | null;
}

export function usePartChat({ selectedPart, selectedGroup }: UsePartChatProps) {
  const messagesRef = useRef<HTMLDivElement>(null);
  const previousPartRef = useRef<string | null>(null);
  const {
    messages,
    isLoading,
    userPreferences,
    followUpQuestions: chatFollowUpQuestions,
    resetChat,
    sendChatMessage,
    isCollectingJson,
    setFollowUpQuestions,
  } = useChat();

  const [localFollowUpQuestions, setLocalFollowUpQuestions] = useState<
    Question[]
  >(() => getInitialQuestions(selectedPart));

  // Update the questions when part changes
  useEffect(() => {
    if (selectedPart) {
      setLocalFollowUpQuestions(getInitialQuestions(selectedPart));
    } else if (messages.length === 0) {
      setLocalFollowUpQuestions([]);
    }
  }, [selectedPart, messages.length]);

  // Update local follow-up questions when chat questions change
  useEffect(() => {
    if (chatFollowUpQuestions?.length > 0) {
      setLocalFollowUpQuestions(chatFollowUpQuestions);
    }
  }, [chatFollowUpQuestions]);

  // Reset chat when part changes
  useEffect(() => {
    const currentPartId = selectedPart?.objectId ?? null;
    if (previousPartRef.current !== currentPartId) {
      previousPartRef.current = currentPartId;
      resetChat();
    }
  }, [selectedPart?.objectId, resetChat]);

  const handleOptionClick = (question: Question) => {
    sendChatMessage(question.question, {
      userPreferences,
      part: selectedPart || undefined,
      followUpQuestions: localFollowUpQuestions,
    });
  };

  const getDisplayName = () => {
    if (!selectedPart || !selectedGroup)
      return messages.length > 0
        ? 'No body part selected'
        : 'Select a body part to get started';
    return selectedGroup.name + ' > ' + selectedPart.name;
  };

  return {
    messages,
    isLoading,
    isCollectingJson,
    followUpQuestions:
      messages.length === 0 ? localFollowUpQuestions : chatFollowUpQuestions,
    messagesRef,
    resetChat,
    handleOptionClick,
    getDisplayName,
  };
}
