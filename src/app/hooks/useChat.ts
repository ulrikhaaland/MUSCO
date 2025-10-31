import { useState, useRef, useEffect } from 'react';
import {
  getOrCreateAssistant,
  createThread,
  sendMessage,
} from '../api/assistant/assistant';
import {
  ChatMessage,
  ChatPayload,
  Question,
  UserPreferences,
  DiagnosisAssistantResponse,
} from '../types';
import { Exercise } from '../types/program';
import { useTranslation } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { extractExerciseMarkers } from '../utils/exerciseMarkerParser';

// Type for storing failed message details for retry
type FailedMessageInfo = {
  messageContent: string;
  chatPayload: Omit<ChatPayload, 'message'>;
};

export function useChat() {
  const { locale } = useTranslation();
  const { user } = useAuth();
  const { saveChatState, restoreChatState, clearChatState } = useApp();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [userPreferences] = useState<UserPreferences | undefined>();
  const [followUpQuestions, setFollowUpQuestions] = useState<Question[]>([]);
  const [assistantResponse, setAssistantResponse] =
    useState<DiagnosisAssistantResponse | null>(null);
  const [exerciseResults, setExerciseResults] = useState<Exercise[]>([]);
  const [inlineExercises, setInlineExercises] = useState<Map<string, Exercise>>(new Map());
  const threadIdRef = useRef<string | null>(null);
  const assistantIdRef = useRef<string | null>(null);
  const messageQueueRef = useRef<
    { message: string; payload: Omit<ChatPayload, 'message'> }[]
  >([]);
  const justResetRef = useRef<boolean>(false); // ADDED: Ref to track if reset just occurred

  // Refs to track the last message and stream state for reconnection
  const lastUserMessageRef = useRef<{
    messageContent: string;
    chatPayload: Omit<ChatPayload, 'message'>;
  } | null>(null);
  const streamPossiblyInterruptedRef = useRef(false);
  const isRefetchingRef = useRef(false); // Prevent multiple refetches

  // State to store details of the last message that failed to send
  const [lastSendError, setLastSendError] = useState<FailedMessageInfo | null>(
    null
  );
  const [streamError, setStreamError] = useState<Error | null>(null); // Add stream error state
  const streamHadErrorRef = useRef(false);

  useEffect(() => {
    async function initializeAssistant() {
      try {
        // Try to reuse prewarmed IDs from sessionStorage to avoid creating new thread
        let preAssistantId: string | null = null;
        let preThreadId: string | null = null;
        try {
          preAssistantId = window.sessionStorage.getItem('assistant_id');
          preThreadId = window.sessionStorage.getItem('assistant_thread_id');
        } catch {}
        if (preAssistantId && preThreadId) {
          assistantIdRef.current = preAssistantId;
          threadIdRef.current = preThreadId;
          return;
        }
        const { assistantId, threadId } = await getOrCreateAssistant();
        assistantIdRef.current = assistantId;
        threadIdRef.current = threadId;
        try {
          window.sessionStorage.setItem('assistant_id', assistantId);
          window.sessionStorage.setItem('assistant_thread_id', threadId);
        } catch {}
      } catch (error) {
        console.error('Error initializing assistant:', error);
      }
    }

    initializeAssistant();
    // NOTE: initializeAssistant is stable, and we intentionally
    // run this once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hydrate rate-limit state from session so overlay persists across redirects
  useEffect(() => {
    try {
      const rl = window.sessionStorage.getItem('rateLimited');
      if (rl === '1') {
        setRateLimited(true);
      }
    } catch {}
  }, []);

  // If user logs in (uid present), clear local rate-limit flag (server will re-enforce if still true)
  useEffect(() => {
    if (user?.uid) {
      try {
        window.sessionStorage.removeItem('rateLimited');
      } catch {}
      setRateLimited(false);
    }
  }, [user?.uid]);

  // Restore any previously saved chat snapshot (from anon → login flow or refresh)
  useEffect(() => {
    // Only hydrate once, and only if nothing is currently in memory
    if (messages.length > 0) return;
    try {
      const snapshot = restoreChatState?.();
      if (
        snapshot &&
        Array.isArray(snapshot.messages) &&
        snapshot.messages.length > 0
      ) {
        setMessages(snapshot.messages);
        setFollowUpQuestions(snapshot.followUpQuestions || []);
        setAssistantResponse(snapshot.assistantResponse ?? null);
      }
    } catch {
      // ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Add listener for visibility change to handle stream interruptions
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        streamPossiblyInterruptedRef.current &&
        lastUserMessageRef.current &&
        !isRefetchingRef.current // Only refetch if not already doing so
      ) {
        console.log(
          'App became visible, potential stream interruption detected. Scheduling refetch...'
        );
        isRefetchingRef.current = true; // Mark as refetching immediately
        streamPossiblyInterruptedRef.current = false; // Reset interruption flag

        // Delay the refetch attempt slightly
        setTimeout(() => {
          // Double check if still needed (e.g., user didn't reset chat in the meantime)
          if (!lastUserMessageRef.current) {
            console.log('Refetch cancelled: No last user message.');
              isRefetchingRef.current = false;
              return;
          }
          console.log('Executing delayed refetch...');
          sendChatMessage(
            lastUserMessageRef.current.messageContent,
            lastUserMessageRef.current.chatPayload,
            true // Indicate this is a refetch
          ).finally(() => {
            isRefetchingRef.current = false; // Mark refetching as complete
            console.log(
              `Delayed Refetch finally block: isRefetchingRef reset to ${isRefetchingRef.current}`
            );
          });
        }, 1000); // Delay for 1 second (1000ms)
      } else if (
        document.visibilityState ===
        'hidden' /* && isLoading - Removing isLoading check here, rely on flag set in sendChatMessage */
      ) {
        // If page hides, and streamPossiblyInterruptedRef is true (set before API call),
        // keep the flag as true. If it's false, it means no stream was active.
        if (streamPossiblyInterruptedRef.current) {
          console.log(
            'App hidden while stream might be active, interruption flag remains true.'
          );
        } else {
             // console.log('App hidden, but no stream was active.');
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // Remove isLoading dependency, rely on the ref flag set within sendChatMessage
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchInlineExercises = async (messageContent: string) => {
    const exerciseMarkers = extractExerciseMarkers(messageContent);
    const exerciseNames = exerciseMarkers.map(m => m.name);
    
    if (exerciseNames.length === 0) return;

    try {
      // Search for ALL exercises (no query filter) to ensure we get matches
      const response = await fetch('/api/exercises/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bodyParts: [], // Search all body parts
          query: '', // No query filter - get all exercises
          limit: 200, // High limit to get all exercises
          locale,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.exercises) {
          // Create map of exercise name -> Exercise for quick lookup
          const exerciseMap = new Map<string, Exercise>();
          data.exercises.forEach((ex: Exercise) => {
            exerciseMap.set(ex.name, ex);
          });
          setInlineExercises(exerciseMap);
        }
      } else {
        console.error('[useChat] API returned error:', response.status);
      }
    } catch (error) {
      console.error('[useChat] Failed to fetch inline exercises:', error);
    }
  };

  const resetChat = () => {
    // Increment reset counter to invalidate in-flight streams
    const resetId = Date.now();
    (window as any).__chatResetId = resetId;
    
    setMessages([]);
    setFollowUpQuestions([]);
    setAssistantResponse(null);
    setExerciseResults([]); // Clear exercise results on reset
    setInlineExercises(new Map()); // Clear inline exercises on reset
    setIsLoading(false); // Stop loading state
    try {
      clearChatState?.();
    } catch {}
    justResetRef.current = true; // ADDED: Ref to track if reset just occurred
    // Log to confirm assistantResponse is intended to be null for the next send operation
    console.log(
      "[useChat - resetChat] assistantResponse set to null and justResetRef set to true. The next 'Value of assistantResponse (state) before capturing' log should show null."
    );
    messageQueueRef.current = []; // Clear the queue on reset
    lastUserMessageRef.current = null; // Clear last message on reset
    streamPossiblyInterruptedRef.current = false; // Reset interruption flag
    isRefetchingRef.current = false; // Reset refetching flag
    setLastSendError(null); // Clear any send error on reset
    // Immediately clear the thread reference so that no further messages are
    // accidentally sent to the previous conversation while a new thread is
    // being created.
    threadIdRef.current = null;

    // Request a brand-new thread from the backend and store its id once the
    // request resolves. Any user message that is triggered before this promise
    // settles will be queued because the threadIdRef is null, ensuring that
    // no message can be appended to the old thread.
    createThread()
      .then(({ threadId }) => {
        threadIdRef.current = threadId;

        // Process any messages that may have been queued while the new thread
        // was being created.
        processNextMessage();
      })
      .catch((error) => {
        console.error('Failed to create new chat thread:', error);
      });
  };

  const processNextMessage = async () => {
    if (messageQueueRef.current.length > 0 && !isLoading) {
      const nextMessage = messageQueueRef.current[0];
      messageQueueRef.current = messageQueueRef.current.slice(1);
      // Merge the LATEST assistantResponse when processing (not when queueing)
      const payloadWithLatestContext = {
        ...nextMessage.payload,
        diagnosisAssistantResponse: assistantResponse || nextMessage.payload.diagnosisAssistantResponse,
      };
      await sendChatMessage(nextMessage.message, payloadWithLatestContext);
    }
  };

  // (Client no longer decides mode; routing handled server-side.)

  const sendChatMessage = async (
    messageContent: string,
    chatPayload: Omit<ChatPayload, 'message'>,
    isRefetch: boolean = false, // Added flag to indicate refetch
    isResend: boolean = false // Added flag to indicate a resend after error
  ) => {
    // Block send if rate-limited; keep overlay visible
    if (rateLimited && !isRefetch) {
      console.warn('Rate limited: blocking send.');
      return;
    }
    // Create the message object
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: messageContent,
      timestamp: new Date(),
    };

    // Threads are optional in chat-completions fast path; proceed even if not ready.
    // We still allow queueing while actively loading to preserve order.
    
    if (!isRefetch) {
      if (isLoading) {
        // Queue the message if loading (unless it's a refetch)
        // Don't save assistantResponse here - it will be retrieved fresh when processing
        console.log('Chat is busy, queuing message:', messageContent);
        messageQueueRef.current.push({
          message: messageContent,
          payload: chatPayload, // Don't include assistantResponse yet
        });
        // CRITICAL: Clear follow-up questions immediately when queueing
        // This prevents duplicate questions from appearing when the stream completes
        setFollowUpQuestions([]);
        return;
      }
      
      if (isResend) {
        // Robust cleanup: remove any assistant error bubbles and empty assistant tails
        setMessages((prev) => {
          let filtered = prev.filter(
            (m: any) => !(m.role === 'assistant' && m.hasError === true)
          );
          while (
            filtered.length > 0 &&
            filtered[filtered.length - 1].role === 'assistant' &&
            (!filtered[filtered.length - 1].content ||
              filtered[filtered.length - 1].content.trim() === '')
          ) {
            filtered = filtered.slice(0, -1);
          }
          return filtered;
        });
      } else {
        // Normal new message flow - add the user message
        setMessages((prev) => [...prev, newMessage]);
      }
      
      // Store the details of the last message sent by the user
      lastUserMessageRef.current = { 
        messageContent, 
        chatPayload: {
          ...chatPayload,
          diagnosisAssistantResponse: assistantResponse,
        },
      };
    } else {
      // If it's a refetch, remove the potentially incomplete last assistant message
      console.log(
        'Refetching: Removing potentially incomplete last assistant message.'
      );
      setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          if (lastMsg && lastMsg.role === 'assistant') {
              return prev.slice(0, -1); // Remove last assistant message
          }
          return prev; // No assistant message to remove
      });
    }

    // Capture the assistantResponse from the previous turn *before* resetting it.
    let previousTurnAssistantResponseFromState = assistantResponse; // Capture current state from hook

    if (justResetRef.current) {
      console.log(
        '[useChat] First message after reset: Forcing previousTurnAssistantResponse to null.'
      );
      previousTurnAssistantResponseFromState = null;
      justResetRef.current = false; // Clear the flag after using it once
    }

    // Reset state for the new/refetched response
    setFollowUpQuestions([]);
    setAssistantResponse(null); // Also reset previous assistant response data
    setExerciseResults([]); // Clear previous exercise results
    setLastSendError(null); // Clear any previous error when sending a new message
    setStreamError(null); // Clear any previous stream error
    streamHadErrorRef.current = false;
    setIsLoading(true);
    streamPossiblyInterruptedRef.current = false; // Reset before starting

    try {
      // Build lightweight prior history for chat-completions (exclude current message)
      const priorHistory = messages.map((m) => ({
        role: m.role as 'user' | 'assistant' | 'system',
        content: m.content,
      }));

      const payload: ChatPayload = {
        ...chatPayload,
        message: messageContent,
        language: locale,
        diagnosisAssistantResponse: previousTurnAssistantResponseFromState, // MODIFIED: Use the potentially overridden value
        userId: user?.uid,
        isSubscriber: user?.profile?.isSubscriber,
        messages: priorHistory,
      };

      // Client no longer routes; backend determines mode for first typed message when needed

      if (isRefetch) {
        console.log('Refetch: Sending payload:', JSON.stringify(payload));
      }

      // Mark stream as potentially interruptible right before the async call
      // Only set if not already loading (prevents overriding during queue processing)
      if (!isLoading) {
        streamPossiblyInterruptedRef.current = true;
        console.log(
          'Set streamPossiblyInterruptedRef = true before await sendMessage'
        );
      }

      // Capture reset ID to detect if chat was reset during this stream
      const streamResetId = (window as any).__chatResetId || 0;
      
      // Send the message and handle streaming response with structured events
      try {
        await sendMessage(
          threadIdRef.current ?? '',
          payload,
          (content, payloadObj) => {
            // Ignore events if chat was reset during this stream
            if ((window as any).__chatResetId !== streamResetId) {
              // Chat was reset - ignore this event
              return;
            }
            
            // Handle error payloads
          if (payloadObj && (payloadObj as any).error === 'free_limit_exceeded') {
            setRateLimited(true);
              try {
                window.sessionStorage.setItem('rateLimited', '1');
              } catch {}
            setIsLoading(false);
            return;
          }
            
          if (payloadObj && (payloadObj as any).error === 'stream_error') {
            setStreamError(new Error('Stream error'));
              streamHadErrorRef.current = true;
            setIsLoading(false);
              setMessages((prev) => {
                const lastMsg = prev[prev.length - 1];
                if (lastMsg && lastMsg.role === 'assistant' && (lastMsg as any).hasError !== true) {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMsg, hasError: true, content: lastMsg.content || 'Message interrupted' },
                  ];
                } else if (lastMsg && lastMsg.role === 'user') {
                return [
                  ...prev,
                  {
                      id: `assistant-error-${Date.now()}`,
                    role: 'assistant',
                      content: 'Unable to complete response due to connection issue.',
                      hasError: true,
                    timestamp: new Date(),
                  },
                ];
                }
                return prev;
              });
              return;
            }

            // Handle structured event from backend
            if (payloadObj && (payloadObj as any).type === 'followup') {
              const question = (payloadObj as any).question as Question;
              // Skip adding follow-ups if user already queued a message
              // (they clicked a follow-up before the stream completed)
              if (messageQueueRef.current.length > 0) {
            return;
          }
                    setFollowUpQuestions((prev) => {
                      if (!prev.some((q) => q.question === question.question)) {
                        return [...prev, question];
                      }
                      return prev;
                    });
              return;
              }

            if (payloadObj && (payloadObj as any).type === 'assistant_response') {
              const response = (payloadObj as any).response as DiagnosisAssistantResponse;
              setAssistantResponse(response);
            return;
          }

            if (payloadObj && (payloadObj as any).type === 'exercises') {
              const exercises = (payloadObj as any).exercises as Exercise[];
              setExerciseResults(exercises);
            return;
          }

            if (payloadObj && (payloadObj as any).type === 'complete') {
              // Stream complete - fetch exercises for inline markers
              const lastMessage = messages[messages.length - 1];
              if (lastMessage?.role === 'assistant' && lastMessage.content) {
                fetchInlineExercises(lastMessage.content);
              }
              return;
            }

            // Handle text content
            if (content) {
              // Reset interruption flag when receiving content
              if (streamPossiblyInterruptedRef.current) {
                streamPossiblyInterruptedRef.current = false;
                              }

              // Add text to assistant message
                setMessages((prev) => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                      content: lastMessage.content + content,
                        timestamp: new Date(),
                      },
                    ];
                  }
                  return [
                    ...prev,
                    {
                    id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                      role: 'assistant',
                    content,
                      timestamp: new Date(),
                    },
                  ];
                });
              }
            }
        );
        
        // Stream completed successfully (only clear if no error was flagged)
        if (!streamHadErrorRef.current) {
        setStreamError(null);
        }
      } catch (error) {
        console.error('Error during message streaming:', error);
        
        // Set stream error state so the UI can show an error message
        setStreamError(
          error instanceof Error ? error : new Error('Stream interrupted')
        );
        
        // Add a note to the latest assistant message if one exists
        setMessages((prev) => {
          const lastMsg = prev[prev.length - 1];
          // Only add error note if the last message is from the assistant
          if (lastMsg && lastMsg.role === 'assistant') {
            return [
              ...prev.slice(0, -1),
              {
                ...lastMsg,
                hasError: true, // Flag to indicate error
                content: lastMsg.content || 'Message interrupted', // Ensure content exists
              },
            ];
          }
          // If last message was from user, add a new assistant message with error
          else if (lastMsg && lastMsg.role === 'user') {
            return [
              ...prev,
              {
                id: `assistant-error-${Date.now()}`,
                role: 'assistant',
                content: 'Unable to complete response due to connection issue.',
                hasError: true,
                timestamp: new Date(),
              },
            ];
          }
          return prev;
        });
      }

      setIsLoading(false);
      processNextMessage();
    } catch (error) {
      console.error('Error in sendChatMessage:', error);
      setIsLoading(false);
      // Use the last message reference to construct a proper FailedMessageInfo
      if (lastUserMessageRef.current) {
        setLastSendError(lastUserMessageRef.current);
      }
      processNextMessage();
    }
  };

  // Function to retry sending the last failed message
  const retryLastMessage = () => {
    const base = lastSendError ?? lastUserMessageRef.current;
    if (!base) return;
    console.log('Retrying last message (cleanup + resend)...');
    const { messageContent, chatPayload } = base;
    // Remove any assistant error bubbles to avoid duplicating them on retry
    setMessages((prev) => {
      let filtered = prev.filter((m: any) => !(m.role === 'assistant' && m.hasError === true));
      // Also trim trailing empty assistant message if present
      while (
        filtered.length > 0 &&
        filtered[filtered.length - 1].role === 'assistant' &&
        (!filtered[filtered.length - 1].content || filtered[filtered.length - 1].content.trim() === '')
      ) {
        filtered = filtered.slice(0, -1);
      }
      return filtered;
    });
      setLastSendError(null); // Clear the error state before retrying
      // Send the message again with the isResend flag
    sendChatMessage(
      messageContent,
      {
        ...chatPayload,
        diagnosisAssistantResponse: assistantResponse,
      },
      false,
      true
    );
  };

  // Persist chat state on every material change so anon → login preserves it
  useEffect(() => {
    try {
      // Avoid saving empty snapshots
      if (
        messages.length === 0 &&
        followUpQuestions.length === 0 &&
        !assistantResponse
      ) {
        return;
      }
      saveChatState?.({
        messages,
        followUpQuestions,
        assistantResponse,
      });
    } catch {}
  }, [messages, followUpQuestions, assistantResponse, saveChatState]);

  // Fetch inline exercises when assistant messages are added
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage.content) {
      const markers = extractExerciseMarkers(lastMessage.content);
      if (markers.length > 0 && inlineExercises.size === 0) {
        fetchInlineExercises(lastMessage.content);
      }
    }
  }, [messages]);

  // Use assistantResponse.followUpQuestions when available (has augmented fields)
  // Fall back to incremental followUpQuestions if no assistant response yet
  const finalFollowUpQuestions = assistantResponse?.followUpQuestions || followUpQuestions;

  return {
    messages,
    isLoading,
    rateLimited,
    userPreferences,
    followUpQuestions: finalFollowUpQuestions,
    assistantResponse,
    exerciseResults,
    inlineExercises,
    lastSendError,
    streamError,
    resetChat,
    sendChatMessage,
    retryLastMessage,
    setFollowUpQuestions,
  };
}
