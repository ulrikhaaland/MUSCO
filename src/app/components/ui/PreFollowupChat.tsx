'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, Question } from '@/app/types';
import { Exercise } from '@/app/types/program';
import { ExerciseProgram } from '@/app/types/program';
import { DiagnosisAssistantResponse } from '@/app/types';
import { ExerciseQuestionnaireAnswers } from '../../../shared/types';
import { PreFollowupFeedback, PreFollowupStructuredUpdates, ExerciseIntensityFeedback } from '@/app/types/incremental-program';
import { MessageWithExercises } from './MessageWithExercises';
import { FollowUpQuestions } from './FollowUpQuestions';
import { LoadingMessage } from './LoadingMessage';
import { useScrollManagement } from '@/app/hooks/useScrollManagement';
import { useTouchInteraction } from '@/app/hooks/useTouchInteraction';
import { useQuestionVisibility } from '@/app/hooks/useQuestionVisibility';
import {
  savePreFollowupChat,
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
  
  // Accumulated feedback from conversation
  const [accumulatedFeedback, setAccumulatedFeedback] = useState<PreFollowupChatState['accumulatedFeedback']>({
    conversationalSummary: '',
  });

  // Refs
  const messagesRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Ref to prevent multiple auto-starts
  const hasAutoStarted = useRef(false);

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
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: userMessage,
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
  }, [messages, previousProgram, diagnosisData, questionnaireData, locale, scrollToBottom, setUserTouched]);

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

  // Save state to Firestore whenever it changes
  useEffect(() => {
    if (!isInitialized || messages.length === 0) return;
    
    const saveState = async () => {
      try {
        await savePreFollowupChat(userId, programId, weekId, {
          messages,
          followUpQuestions,
          accumulatedFeedback,
          conversationComplete,
        });
      } catch (err) {
        console.error('[PreFollowupChat] Error saving state:', err);
      }
    };
    
    saveState();
  }, [messages, followUpQuestions, accumulatedFeedback, conversationComplete, userId, programId, weekId, isInitialized]);

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
    // Convert accumulated feedback and call onGenerateProgram FIRST (triggers redirect)
    const feedback = convertToPreFollowupFeedback(accumulatedFeedback);
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

  // Handle textarea change with auto-resize
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputMessage(e.target.value);
    
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  };

  // Handle textarea keydown (Enter to send)
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendInputMessage();
    }
  };

  // Handle send from input
  const handleSendInputMessage = () => {
    if (!inputMessage.trim() || isLoading) return;
    const msg = inputMessage.trim();
    setInputMessage('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    sendMessage(msg);
  };

  // Handle "Answer in chat" click - focus the input
  const handleAnswerInChatClick = () => {
    textareaRef.current?.focus();
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
        {messages
          .filter((msg) => msg.content.trim() !== '') // Hide empty messages
          .map((msg) => (
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
                />
              </div>
            ) : (
              <div className="text-base break-words whitespace-pre-wrap">
                {msg.content}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && messages.length > 0 && messages[messages.length - 1].content === '' && (
          <LoadingMessage visible={true} />
        )}

        {/* Follow-up questions */}
        {followUpQuestions.length > 0 && !isLoading && (
          <div className="mt-4">
            <FollowUpQuestions
              questions={followUpQuestions}
              visibleQuestions={visibleQuestions}
              prefersReducedMotion={prefersReducedMotion}
              onQuestionClick={handleQuestionClick}
            />
          </div>
        )}

        {/* Answer in chat fallback (when no follow-ups and not loading) */}
        {followUpQuestions.length === 0 && !isLoading && messages.length > 0 && (
          <div className="mt-4">
            <button
              onClick={handleAnswerInChatClick}
              className="w-full min-h-[48px] text-left px-4 py-3 rounded-lg cursor-pointer
                bg-[rgba(99,91,255,0.12)] border border-[rgba(99,91,255,0.35)] text-[#c8cbff] font-medium
                hover:border-[rgba(99,91,255,0.5)] hover:bg-gradient-to-r hover:from-indigo-900/80 hover:to-indigo-800/80
                transition-all duration-300"
            >
              <div className="flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-[#635bff]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
                {t('feedback.answerInChat')}
              </div>
            </button>
          </div>
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
          <div className="relative">
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleTextareaChange}
              onKeyDown={handleTextareaKeyDown}
              rows={1}
              placeholder={t('feedback.typeMessage')}
              className="w-full bg-gray-700 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none text-white placeholder-gray-400"
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={handleSendInputMessage}
              disabled={isLoading || !inputMessage.trim()}
              className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                isLoading || !inputMessage.trim()
                  ? 'text-gray-500 cursor-not-allowed'
                  : 'text-indigo-500 hover:text-indigo-400 hover:bg-gray-600/50'
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </div>
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
            disabled={isLoading}
            className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors disabled:opacity-50"
          >
            {t('feedback.buildProgram')}
          </button>
          {/* Debug button - only show on localhost */}
          {typeof window !== 'undefined' && window.location.hostname === 'localhost' && (
            <button
              onClick={() => {
                const feedback = convertToPreFollowupFeedback(accumulatedFeedback);
                console.log('═══════════════════════════════════════════');
                console.log('📊 PRE-FOLLOWUP CHAT - ACCUMULATED FEEDBACK');
                console.log('═══════════════════════════════════════════');
                console.log('\n🔹 Raw Accumulated State:');
                console.log(JSON.stringify(accumulatedFeedback, null, 2));
                console.log('\n🔹 Converted Feedback (sent to generator):');
                console.log(JSON.stringify(feedback, null, 2));
                console.log('\n🔹 Conversation Complete:', conversationComplete);
                console.log('═══════════════════════════════════════════');
              }}
              className="p-3 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white transition-colors"
              title="Debug: Log accumulated feedback"
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
                className="flex-1 px-4 py-3 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
              >
                {t('feedback.continueChat')}
              </button>
              <button
                onClick={handleBuildConfirm}
                className="flex-1 px-4 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
              >
                {t('feedback.buildAnyway')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

