import { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useTranslation } from '../i18n';
import { usePartChat } from './usePartChat';
import { fetchExerciseVideoUrl } from '../utils/videoUtils';
import { getGlobalTemplateQuestions } from '../config/templateQuestions';
import type { Exercise } from '../types/program';
import type { BodyPartGroup } from '../config/bodyPartGroups';
import type { AnatomyPart } from '../types/human';
import type { ProgramType } from '../../../shared/types';

interface UseChatContainerProps {
  selectedPart: AnatomyPart | null;
  selectedGroups: BodyPartGroup[];
  forceMode?: 'diagnosis' | 'explore';
  onGenerateProgram?: (programType: ProgramType) => void;
  onBodyGroupSelected?: (groupName: string) => void;
  onBodyPartSelected?: (partName: string) => void;
}

/**
 * Shared chat container logic used by both mobile and desktop components.
 * Consolidates:
 * - Video handling (video modal, loading states)
 * - Chat hook integration (usePartChat)
 * - Form state (message, textarea ref)
 * - Auth/router hooks
 * - Template questions
 */
export function useChatContainer({
  selectedPart,
  selectedGroups,
  forceMode,
  onGenerateProgram,
  onBodyGroupSelected,
  onBodyPartSelected,
}: UseChatContainerProps) {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useTranslation();

  // Form state
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Video handling state
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loadingVideoExercise, setLoadingVideoExercise] = useState<string | null>(null);
  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);

  // Template questions
  const globalTemplateQuestions = getGlobalTemplateQuestions(t);

  // Chat hook integration
  const {
    messages,
    isLoading,
    rateLimited,
    followUpQuestions,
    exerciseResults,
    inlineExercises,
    messagesRef,
    resetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    assistantResponse,
    streamError,
  } = usePartChat({
    selectedPart,
    selectedGroups,
    forceMode,
    onGenerateProgram,
    onBodyGroupSelected,
    onBodyPartSelected,
  });

  // Video handling
  const handleVideoClick = async (exercise: Exercise) => {
    const exerciseId = exercise.name || exercise.id;
    if (loadingVideoExercise === exerciseId) return;

    setLoadingVideoExercise(exerciseId);
    setCurrentExercise(exercise);
    try {
      const url = await fetchExerciseVideoUrl(exercise);
      if (url) {
        setVideoUrl(url);
      }
    } catch (error) {
      console.error('Error loading video:', error);
    } finally {
      setLoadingVideoExercise(null);
    }
  };

  const handleCloseVideo = () => {
    setVideoUrl(null);
    setCurrentExercise(null);
  };

  const handleResetChat = () => {
    setMessage('');
    resetChat();
  };

  return {
    // Auth/Router
    router,
    user,
    t,

    // Form state
    message,
    setMessage,
    textareaRef,

    // Video state
    videoUrl,
    loadingVideoExercise,
    currentExercise,
    handleVideoClick,
    handleCloseVideo,

    // Template questions
    globalTemplateQuestions,

    // Chat state (from usePartChat)
    messages,
    isLoading,
    rateLimited,
    followUpQuestions,
    exerciseResults,
    inlineExercises,
    messagesRef,
    resetChat, // Raw reset function
    handleResetChat, // Reset + clear message
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    assistantResponse,
    streamError,
  };
}

