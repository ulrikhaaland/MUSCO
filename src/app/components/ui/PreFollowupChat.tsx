'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Question } from '@/app/types';
import { Exercise } from '@/app/types/program';
import { ExerciseProgram } from '@/app/types/program';
import { DiagnosisAssistantResponse } from '@/app/types';
import { ExerciseQuestionnaireAnswers } from '../../../../shared/types';
import { PreFollowupFeedback, PreFollowupStructuredUpdates, ExerciseIntensityFeedback } from '@/app/types/incremental-program';
import { MessageWithExercises } from './MessageWithExercises';
import { FollowUpQuestions } from './FollowUpQuestions';
import { LoadingMessage } from './LoadingMessage';
import { ChatInput, ChatInputHandle } from './ChatInput';
import { AnswerInChatButton } from './AnswerInChatButton';
import { useScrollManagement } from '@/app/hooks/useScrollManagement';
import { useTouchInteraction } from '@/app/hooks/useTouchInteraction';
import { useQuestionVisibility } from '@/app/hooks/useQuestionVisibility';
import {
  loadPreFollowupChat,
  deletePreFollowupChat,
  mergeAccumulatedFeedback,
  convertToPreFollowupFeedback,
  updateProgramCompletion,
  PreFollowupChatState,
} from '@/app/services/preFollowupChatService';
import { useTranslation } from '@/app/i18n';

interface PreFollowupChatProps {
  /** The previous week's program */
  previousProgram: ExerciseProgram;
  /** User's diagnosis data */
  diagnosisData: DiagnosisAssistantResponse;
  /** User's questionnaire answers */
  questionnaireData: ExerciseQuestionnaireAnswers;
  /** Current user ID */
  userId: string;
  /** Program ID for persistence */
  programId: string;
  /** Week ID for storing feedback in the week document */
  weekId?: string;
  /** Map of exercise IDs to Exercise objects for inline display */
  inlineExercises: Map<string, Exercise>;
  /** Called when user clicks "Generate Program" with collected feedback */
  onGenerateProgram: (feedback: PreFollowupFeedback) => void;
  /** Optional: Called when video is clicked */
  onVideoClick?: (exercise: Exercise) => void;
  /** Optional: Loading state for video */
  loadingVideoExercise?: string | null;
  /** When true, generate button is disabled to prevent double-clicks */
  isGenerating?: boolean;
}

/**
 * Pre-followup chat component for gathering feedback before generating follow-up program.
 * Uses a conversational LLM to ask dynamic questions about the user's experience.
 */
export function PreFollowupChat({
  previousProgram,
  diagnosisData,
  questionnaireData,
  userId,
  programId,
  weekId,
  inlineExercises,
  onGenerateProgram,
  onVideoClick,
  loadingVideoExercise,
  isGenerating = false,
}: PreFollowupChatProps) {
  const { t, locale } = useTranslation();
  
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [followUpQuestions, setFollowUpQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBuildConfirm, setShowBuildConfirm] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [conversationComplete, setConversationComplete] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  
  // Accumulated feedback from conversation
  const [accumulatedFeedback, setAccumulatedFeedback] = useState<PreFollowupChatState['accumulatedFeedback']>({
    conversationalSummary: '',
  });

  // Spacer state for pop-to-top behavior
  // Start with reasonable defaults to avoid 0-height spacer on first render
  const [availableHeight, setAvailableHeight] = useState(400);
  const [chatContainerHeight, setChatContainerHeight] = useState(500);
  // activeTurn: true from moment user sends message until they send another
  const [activeTurn, setActiveTurn] = useState(false);

  // Refs
  const messagesRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const chatInputRef = useRef<ChatInputHandle>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const stackContentRef = useRef<HTMLDivElement>(null);

  // Use extracted hooks
  const { userTouched, setUserTouched, handleTouchStart } = useTouchInteraction();
  
  const { showScrollButton, scrollToBottom, updateScrollButtonVisibility } = useScrollManagement({
    containerRef: messagesRef,
    disableAutoScroll: false,
    messageCount: messages.length,
  });

  const { visibleQuestions } = useQuestionVisibility({
    questions: followUpQuestions,
    disableAutoScroll: false,
    scrollToBottom,
    userTouched,
  });

  // Reduced motion preference
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Measure container height for spacer calculation
  // Subtract bottom padding (pb-40 = 160px) since that's behind the fixed input area
  useEffect(() => {
    const measureChatContainer = () => {
      if (messagesRef?.current) {
        const fullHeight = messagesRef.current.clientHeight;
        // pb-40 = 10rem = 160px - this is padding for the fixed input, not visible space
        const bottomPadding = 160;
        const visibleHeight = fullHeight - bottomPadding;
        setChatContainerHeight(Math.max(visibleHeight, 200)); // Minimum 200px
      }
    };

    measureChatContainer();

    const resizeObserver = new ResizeObserver(() => {
      measureChatContainer();
    });

    if (messagesRef?.current) {
      resizeObserver.observe(messagesRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [messages, followUpQuestions]);

  // Calculate available height for spacer (positions user message at top of viewport)
  useEffect(() => {
    const calculateAvailableHeight = () => {
      // Spacer height = full container minus minimal space for user message
      const estimatedUserMessageHeight = 12;
      const spacerHeight = chatContainerHeight - estimatedUserMessageHeight;

      // Ensure minimum spacer height
      const minHeight = Math.max(50, chatContainerHeight * 0.1);
      let calculatedHeight = Math.max(spacerHeight, minHeight);

      // When activeTurn is true, check if content needs the full spacer
      if (activeTurn && messagesRef.current) {
        let actualContentHeight = 0;
        Array.from(messagesRef.current.children).forEach((child) => {
          const element = child as HTMLElement;
          if (element !== spacerRef.current) {
            actualContentHeight += element.offsetHeight;
          }
        });

        // Fit spacer to content with margin buffer
        const marginBuffer = 100;
        const contentBasedHeight = actualContentHeight + marginBuffer;
        if (contentBasedHeight < calculatedHeight) {
          calculatedHeight = contentBasedHeight;
        }
      }

      setAvailableHeight(calculatedHeight);
    };

    calculateAvailableHeight();

    const resizeObserver = new ResizeObserver(() => {
      calculateAvailableHeight();
    });

    if (messagesRef.current) {
      resizeObserver.observe(messagesRef.current);
    }
    if (stackContentRef.current) {
      resizeObserver.observe(stackContentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [chatContainerHeight, activeTurn, isLoading, messages, followUpQuestions.length]);

  // Effect to measure actual content height and grow spacer if needed (matches ChatMessages.tsx)
  useEffect(() => {
    const measureContentHeight = () => {
      if (!stackContentRef.current) return;

      const contentElement = stackContentRef.current;

      // Measure the actual visible content by summing up child elements
      let totalContentHeight = 0;
      Array.from(contentElement.children).forEach((child) => {
        const element = child as HTMLElement;
        totalContentHeight += element.offsetHeight;
      });

      // Grow spacer if content exceeds current height (no reduction - show all items)
      if (totalContentHeight > availableHeight) {
        setAvailableHeight(totalContentHeight);
      }
    };

    measureContentHeight();

    const resizeObserver = new ResizeObserver(() => {
      measureContentHeight();
    });

    if (stackContentRef.current) {
      resizeObserver.observe(stackContentRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [availableHeight, activeTurn, messages, followUpQuestions.length, chatContainerHeight]);

  // Ref to prevent multiple auto-starts
  const hasAutoStarted = useRef(false);

  // Check if we're waiting for a response (empty assistant placeholder)
  const isWaitingForResponse = isLoading && messages.length > 0 && 
    messages[messages.length - 1].role === 'assistant' &&
    messages[messages.length - 1].content.trim() === '';

  // Check if a message is part of the current turn (should be in stack layout)
  const isCurrentTurn = useCallback((index: number): boolean => {
    if (!activeTurn || messages.length === 0) return false;

    // Last message is user (just sent, waiting for placeholder)
    if (messages[messages.length - 1].role === 'user') {
      return index === messages.length - 1;
    }

    // Last message is assistant (placeholder or streaming) - include user + assistant
    if (messages[messages.length - 1].role === 'assistant') {
      return index === messages.length - 1 || index === messages.length - 2;
    }

    return false;
  }, [messages, activeTurn]);

  // Check if this is the last user message (renders at top of stack)
  const isLastUserMessage = useCallback((index: number): boolean => {
    if (!activeTurn || messages.length === 0) return false;

    // Last message is user
    if (messages[messages.length - 1].role === 'user') {
      return index === messages.length - 1;
    }

    // Last message is assistant - user is second to last
    if (messages[messages.length - 1].role === 'assistant' && messages.length >= 2) {
      return index === messages.length - 2 && messages[index].role === 'user';
    }

    return false;
  }, [messages, activeTurn]);

  // Filter out banned follow-up questions that the LLM shouldn't generate
  const filterBannedFollowUps = (questions: Question[]): Question[] => {
    const bannedPatterns = [
      /type\s*(your)?\s*answer/i,
      /answer\s*in\s*chat/i,
      /skriv\s*(ditt)?\s*svar/i,
      /svar\s*i\s*chat/i,
      /build\s*program/i,
      /bygg\s*program/i,
      /generate\s*program/i,
      /generer\s*program/i,
      /i'm\s*ready/i,
      /jeg\s*er\s*klar/i,
      /let's\s*go/i,
      /start\s*now/i,
    ];
    
    return questions.filter(q => {
      const text = `${q.title || ''} ${q.question || ''}`.toLowerCase();
      return !bannedPatterns.some(pattern => pattern.test(text));
    });
  };

  // Send message to the API (defined before effects that use it)
  const sendMessage = useCallback(async (userMessage: string) => {
    // Abort any existing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    // Add user message to chat (if not empty - empty means auto-start)
    let updatedMessages = [...messages];
    if (userMessage) {
      // Activate spacer immediately when user sends message
      setActiveTurn(true);
      
      // Clear follow-up questions immediately on click
      setFollowUpQuestions([]);
      
      // Scroll to bottom to show spacer (user message is at top of spacer)
      const forceScroll = () => {
        if (messagesRef.current) {
          messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
        }
      };
      // Immediate + delayed attempts
      forceScroll();
      requestAnimationFrame(forceScroll);
      setTimeout(forceScroll, 100);
      setTimeout(forceScroll, 300);
      
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      };
      updatedMessages = [...messages, userMsg];
      setMessages(updatedMessages);
    }

    // Add placeholder for assistant response
    const assistantMsgId = `assistant-${Date.now()}`;
    const placeholderMsg: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    };
    setMessages([...updatedMessages, placeholderMsg]);

    try {
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send_pre_followup_message',
          payload: {
            messages: updatedMessages,
            previousProgram,
            diagnosisData,
            questionnaireData,
            language: locale,
            accumulatedFeedback, // Pass what we've already collected
            // IDs for backend to save chat state to Firestore
            userId,
            programId,
            weekId,
          },
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Handle streaming response
      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const newFollowUpQuestions: Question[] = [];
      let structuredUpdates: PreFollowupStructuredUpdates | undefined;
      let exerciseIntensity: ExerciseIntensityFeedback[] | undefined;

      // Clear previous follow-up questions when starting new response
      setFollowUpQuestions([]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              
              if (data.type === 'text') {
                assistantContent += data.content;
                setMessages(prev => prev.map(m => 
                  m.id === assistantMsgId ? { ...m, content: assistantContent } : m
                ));
              } else if (data.type === 'followup') {
                // Each followup event contains a single question
                const question = data.question as Question;
                console.log('[PreFollowupChat] Received followup:', question?.title || question?.question);
                if (question && !newFollowUpQuestions.some(q => q.question === question.question)) {
                  newFollowUpQuestions.push(question);
                  const filtered = filterBannedFollowUps([...newFollowUpQuestions]);
                  console.log(`[PreFollowupChat] After filter: ${filtered.length}/${newFollowUpQuestions.length} follow-ups`);
                  // Update state incrementally for better UX (filter out banned options)
                  setFollowUpQuestions(filtered);
                }
              } else if (data.type === 'assistant_response') {
                if (data.response?.structuredUpdates) {
                  structuredUpdates = data.response.structuredUpdates;
                }
                if (data.response?.exerciseIntensity) {
                  exerciseIntensity = data.response.exerciseIntensity;
                }
                if (data.response?.conversationComplete !== undefined) {
                  setConversationComplete(data.response.conversationComplete);
                }
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Final update of follow-up questions (filter out any banned options)
      const finalFiltered = filterBannedFollowUps(newFollowUpQuestions);
      console.log(`[PreFollowupChat] Final follow-ups: ${finalFiltered.length} (before filter: ${newFollowUpQuestions.length})`, 
        finalFiltered.map(q => q.title || q.question));
      setFollowUpQuestions(finalFiltered);

      // Always accumulate user messages and any structured feedback
      // This ensures all conversation context is captured for the program generator
      if (userMessage || structuredUpdates || exerciseIntensity) {
        setAccumulatedFeedback(prev => mergeAccumulatedFeedback(prev, {
          structuredUpdates,
          exerciseIntensity,
          conversationalSummary: userMessage || '',
        }));

        // Update program completion status if provided
        if (structuredUpdates?.allWorkoutsCompleted !== undefined) {
          try {
            await updateProgramCompletion(
              userId,
              programId,
              structuredUpdates.allWorkoutsCompleted,
              structuredUpdates.dayCompletionStatus
            );
          } catch (err) {
            console.error('[PreFollowupChat] Error updating program completion:', err);
          }
        }
      }

      // Reset user touched state to allow auto-scroll
      setUserTouched(false);
      setTimeout(() => scrollToBottom(), 100);

    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        return; // Request was cancelled
      }
      console.error('[PreFollowupChat] Error sending message:', err);
      setError((err as Error).message);
      
      // Remove placeholder message on error
      setMessages(prev => prev.filter(m => m.id !== assistantMsgId));
    } finally {
      setIsLoading(false);
    }
  }, [messages, previousProgram, diagnosisData, questionnaireData, locale, scrollToBottom, setUserTouched, accumulatedFeedback, userId, programId, weekId]);

  // Load existing chat state on mount
  useEffect(() => {
    async function loadExisting() {
      try {
        const existingState = await loadPreFollowupChat(userId, programId, weekId);
        if (existingState && existingState.messages.length > 0) {
          setMessages(existingState.messages);
          setFollowUpQuestions(filterBannedFollowUps(existingState.followUpQuestions));
          setAccumulatedFeedback(existingState.accumulatedFeedback);
          if (existingState.conversationComplete !== undefined) {
            setConversationComplete(existingState.conversationComplete);
          }
          setIsInitialized(true);
        } else {
          // No existing state, will auto-start
          setIsInitialized(true);
        }
      } catch (err) {
        console.error('[PreFollowupChat] Error loading existing state:', err);
        setIsInitialized(true);
      }
    }
    loadExisting();
  }, [userId, programId, weekId]);

  // Auto-start conversation on mount (if no existing messages)
  useEffect(() => {
    if (isInitialized && messages.length === 0 && !isLoading && !hasAutoStarted.current) {
      hasAutoStarted.current = true;
      sendMessage('');
    }
  }, [isInitialized, messages.length, isLoading, sendMessage]);

  // Note: Chat state is now saved by the backend after each message completes streaming
  // This eliminates redundant writes and ensures data consistency

  // Handle follow-up question click
  const handleQuestionClick = (question: Question) => {
    if (isLoading) return;
    sendMessage(question.question);
  };

  // Handle generate program click
  const handleGenerate = () => {
    // If conversation is not complete, show confirmation dialog
    if (!conversationComplete) {
      setShowBuildConfirm(true);
      return;
    }
    proceedWithGenerate();
  };

  // Actually proceed with program generation
  const proceedWithGenerate = () => {
    // Convert accumulated feedback with chat messages for LLM processing
    // Map ChatMessage[] to the simpler format expected by the processor
    const chatMessagesForProcessor = messages.map(m => ({
      role: m.role,
      content: m.content,
    }));
    const feedback = convertToPreFollowupFeedback(accumulatedFeedback, chatMessagesForProcessor);
    
    // Call onGenerateProgram FIRST (triggers redirect)
    onGenerateProgram(feedback);
    
    // Clean up Firestore state in the background (don't block navigation)
    deletePreFollowupChat(userId, programId, weekId).catch(err => {
      console.error('[PreFollowupChat] Error deleting chat state:', err);
    });
  };

  // Handle build confirmation (when user clicks "Build anyway")
  const handleBuildConfirm = () => {
    setShowBuildConfirm(false);
    proceedWithGenerate();
  };

  // Handle scroll
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    updateScrollButtonVisibility(e.currentTarget);
  };

  // Handle send from input
  const handleSendInputMessage = () => {
    if (!inputMessage.trim() || isLoading) return;
    const msg = inputMessage.trim();
    setInputMessage('');
    sendMessage(msg);
  };

  // Handle "Answer in chat" click - focus the input
  const handleAnswerInChatClick = () => {
    chatInputRef.current?.focus();
  };

  // Handle reset chat
  const handleResetChat = async () => {
    // Clear local state
    setMessages([]);
    setFollowUpQuestions([]);
    setAccumulatedFeedback({ conversationalSummary: '' });
    setError(null);
    hasAutoStarted.current = false;
    
    // Delete from Firestore
    try {
      await deletePreFollowupChat(userId, programId, weekId);
    } catch (err) {
      console.error('[PreFollowupChat] Error deleting chat state:', err);
    }
    
    // Restart conversation
    setIsInitialized(true);
  };

  return (
    <div className="relative flex flex-col h-full bg-gray-900 overflow-hidden">
      {/* Chat messages area */}
      <div
        ref={messagesRef}
        onScroll={handleScroll}
        onTouchStart={handleTouchStart}
        className="flex-1 overflow-y-auto p-4 pb-40 space-y-4"
      >
        {/* Prior messages (not part of current turn) */}
        {messages.map((msg, index) => {
          // Skip empty messages and current turn messages (rendered in stack layout)
          if (msg.content.trim() === '' || isCurrentTurn(index)) return null;

          return (
            <div
              key={msg.id}
              className={`px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-indigo-600 ml-8'
                  : 'bg-gray-800 mr-4'
              }`}
            >
              {msg.role === 'assistant' ? (
                <div className="prose prose-invert max-w-none">
                  <MessageWithExercises
                    content={msg.content}
                    exercises={inlineExercises}
                    onVideoClick={onVideoClick}
                    loadingVideoExercise={loadingVideoExercise}
                    className="text-base leading-relaxed"
                    selectedExercise={selectedExercise}
                    onExerciseSelect={setSelectedExercise}
                  />
                </div>
              ) : (
                <div className="text-base break-words whitespace-pre-wrap">
                  {msg.content}
                </div>
              )}
            </div>
          );
        })}

        {/* Loading indicator for auto-start (when activeTurn is false) */}
        {isLoading && !activeTurn && messages.length > 0 && 
          messages[messages.length - 1].role === 'assistant' &&
          messages[messages.length - 1].content.trim() === '' && (
          <LoadingMessage visible={true} />
        )}

        {/* Initial follow-up questions (before any conversation / not in stack) */}
        {followUpQuestions.length > 0 && !isLoading && !activeTurn && (
          <div className="mt-4">
            <FollowUpQuestions
              questions={followUpQuestions}
              visibleQuestions={visibleQuestions}
              prefersReducedMotion={prefersReducedMotion}
              onQuestionClick={handleQuestionClick}
            />
          </div>
        )}

        {/* 
          Spacer + stack layout for current turn messages
          - Fixed spacer pushes user message to top of viewport
          - Content grows above spacer without affecting spacer height
          - Shows when activeTurn is true (set immediately when user sends message)
        */}
        {activeTurn && messages.length > 0 && (
          <div className="relative">
            {/* Fixed spacer at bottom */}
            <div
              ref={spacerRef}
              className="block w-full transition-all duration-300 ease-out"
              style={{
                height: `${availableHeight}px`,
                borderRadius: '8px',
              }}
            />

            {/* Message content positioned at top of stack */}
            <div
              ref={stackContentRef}
              className="absolute top-0 left-0 right-0 flex flex-col"
              style={{
                minHeight: `${availableHeight}px`,
              }}
            >
              {/* User message at top of stack */}
              {messages.map((msg, index) => {
                if (!isLastUserMessage(index)) return null;

                return (
                  <div key={`current-user-${msg.id}`} className="flex-none mb-4">
                    <div className="px-4 py-3 rounded-lg bg-indigo-600 ml-8">
                      <div className="text-base break-words whitespace-pre-wrap">
                        {msg.content}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Assistant streaming/completed message in stack */}
              {activeTurn &&
                messages.length > 0 &&
                messages[messages.length - 1].role === 'assistant' &&
                messages[messages.length - 1].content.trim() !== '' && (
                  <div key={`streaming-${messages[messages.length - 1].id}`} className="flex-none">
                    <div className="px-4 py-3 rounded-lg bg-gray-800 mr-4">
                      <div className="prose prose-invert max-w-none">
                        <MessageWithExercises
                          content={messages[messages.length - 1].content}
                          exercises={inlineExercises}
                          onVideoClick={onVideoClick}
                          loadingVideoExercise={loadingVideoExercise}
                          className="text-base leading-relaxed"
                          selectedExercise={selectedExercise}
                          onExerciseSelect={setSelectedExercise}
                        />
                      </div>
                    </div>
                  </div>
                )}

              {/* Loading indicator when waiting for response (shows under user message) */}
              {isWaitingForResponse && (
                <LoadingMessage visible={true} />
              )}

              {/* Follow-up questions in stack (during active conversation) */}
              {followUpQuestions.length > 0 && activeTurn && (
                <div className="mt-4">
                  <FollowUpQuestions
                    questions={followUpQuestions}
                    visibleQuestions={visibleQuestions}
                    prefersReducedMotion={prefersReducedMotion}
                    onQuestionClick={handleQuestionClick}
                  />
                </div>
              )}

              {/* Answer in chat fallback in stack (when no follow-ups, response complete, and not conversation complete) */}
              {followUpQuestions.length === 0 && 
               !isLoading && 
               !conversationComplete &&
               messages[messages.length - 1]?.role === 'assistant' &&
               messages[messages.length - 1]?.content?.trim() !== '' && (
                <AnswerInChatButton 
                  onClick={handleAnswerInChatClick} 
                />
              )}
            </div>
          </div>
        )}

        {/* Answer in chat fallback (when no follow-ups, not loading, not complete, not in stack mode) */}
        {followUpQuestions.length === 0 && !isLoading && !activeTurn && !conversationComplete && messages.length > 0 && (
          <AnswerInChatButton 
            onClick={handleAnswerInChatClick} 
          />
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 text-red-200">
            {t('chat.error', { error })}
          </div>
        )}
      </div>

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={() => scrollToBottom(true)}
          className="absolute bottom-44 left-1/2 -translate-x-1/2 w-10 h-10 bg-gray-600/70 hover:bg-gray-500/80 rounded-full shadow-md flex items-center justify-center transition-all z-10"
          aria-label="Scroll to bottom"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-white">
            <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}

      {/* Input and action buttons - fixed at bottom */}
      <div className="absolute bottom-0 left-0 right-0 border-t border-gray-700 bg-gray-800/95 backdrop-blur-sm">
        {/* Text input */}
        <div className="p-3 pb-2">
          <ChatInput
            ref={chatInputRef}
            value={inputMessage}
            onChange={setInputMessage}
            onSend={handleSendInputMessage}
            isLoading={isLoading}
            placeholder={t('feedback.typeMessage')}
            maxHeight={120}
          />
        </div>
        
        {/* Action buttons */}
        <div className="px-3 pb-3 flex gap-3">
          <button
            onClick={handleResetChat}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors disabled:opacity-50"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            {t('feedback.startOver')}
          </button>
          <button
            onClick={handleGenerate}
            disabled={isLoading || isGenerating}
            className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('common.loading')}
              </span>
            ) : t('feedback.buildProgram')}
          </button>
          {/* Debug button - only show on localhost */}
          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
            <button
              onClick={() => {
                const chatMessagesForProcessor = messages.map(m => ({
                  role: m.role,
                  content: m.content,
                }));
                const feedback = convertToPreFollowupFeedback(accumulatedFeedback, chatMessagesForProcessor);
                console.log('═══════════════════════════════════════════');
                console.log('📊 PRE-FOLLOWUP CHAT - DEBUG DATA');
                console.log('═══════════════════════════════════════════');
                console.log('\n🔹 Chat Messages (' + messages.length + '):');
                messages.forEach((m, i) => {
                  console.log(`  [${i}] ${m.role}: ${m.content.substring(0, 100)}${m.content.length > 100 ? '...' : ''}`);
                });
                console.log('\n🔹 Raw Accumulated Feedback:');
                console.log(JSON.stringify(accumulatedFeedback, null, 2));
                console.log('\n🔹 Structured Updates:');
                console.log(JSON.stringify(accumulatedFeedback.structuredUpdates || {}, null, 2));
                console.log('\n🔹 Exercise Intensity Feedback:');
                console.log(JSON.stringify(accumulatedFeedback.exerciseIntensity || [], null, 2));
                console.log('\n🔹 Converted Feedback (sent to generator):');
                console.log(JSON.stringify(feedback, null, 2));
                console.log('\n🔹 Input Context:');
                console.log('  Diagnosis painfulAreas:', diagnosisData?.painfulAreas);
                console.log('  Diagnosis targetAreas:', diagnosisData?.targetAreas);
                console.log('  Questionnaire days:', questionnaireData?.numberOfActivityDays);
                console.log('  Questionnaire duration:', questionnaireData?.workoutDuration);
                console.log('\n🔹 State:');
                console.log('  Conversation Complete:', conversationComplete);
                console.log('  Is Loading:', isLoading);
                console.log('  Is Generating:', isGenerating);
                console.log('═══════════════════════════════════════════');
              }}
              className="p-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white transition-colors"
              title="Debug: Log all gathered data"
            >
              🐛
            </button>
          )}
        </div>
      </div>

      {/* Build confirmation modal (when conversation not complete) */}
      {showBuildConfirm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-gray-800 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-white mb-3">
              {t('feedback.buildEarlyTitle')}
            </h3>
            <p className="text-gray-300 mb-6">
              {t('feedback.buildEarlyMessage')}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBuildConfirm(false)}
                disabled={isGenerating}
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors disabled:opacity-50"
              >
                {t('feedback.continueChat')}
              </button>
              <button
                onClick={handleBuildConfirm}
                disabled={isGenerating}
                className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    {t('common.loading')}
                  </span>
                ) : t('feedback.buildAnyway')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

