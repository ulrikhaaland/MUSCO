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
import { useTranslation } from '../i18n';

// Type for storing failed message details for retry
type FailedMessageInfo = {
  messageContent: string;
  chatPayload: Omit<ChatPayload, 'message'>;
};

export function useChat() {
  const { locale } = useTranslation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [userPreferences, setUserPreferences] = useState<
    UserPreferences | undefined
  >();
  const [followUpQuestions, setFollowUpQuestions] = useState<Question[]>([]);
  const [assistantResponse, setAssistantResponse] =
    useState<DiagnosisAssistantResponse | null>(null);
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

  useEffect(() => {
    async function initializeAssistant() {
      try {
        const { assistantId, threadId } = await getOrCreateAssistant();
        assistantIdRef.current = assistantId;
        threadIdRef.current = threadId;
      } catch (error) {
        console.error('Error initializing assistant:', error);
      }
    }

    initializeAssistant();
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
              console.log("Refetch cancelled: No last user message.");
              isRefetchingRef.current = false;
              return;
          }
          console.log("Executing delayed refetch...");
          sendChatMessage(
            lastUserMessageRef.current.messageContent,
            lastUserMessageRef.current.chatPayload,
            true // Indicate this is a refetch
          ).finally(() => {
            isRefetchingRef.current = false; // Mark refetching as complete
            console.log(`Delayed Refetch finally block: isRefetchingRef reset to ${isRefetchingRef.current}`);
          });
        }, 1000); // Delay for 1 second (1000ms)

      } else if (document.visibilityState === 'hidden' /* && isLoading - Removing isLoading check here, rely on flag set in sendChatMessage */) {
        // If page hides, and streamPossiblyInterruptedRef is true (set before API call),
        // keep the flag as true. If it's false, it means no stream was active.
        if (streamPossiblyInterruptedRef.current) {
             console.log('App hidden while stream might be active, interruption flag remains true.');
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
  }, []);

  const resetChat = () => {
    setMessages([]);
    setFollowUpQuestions([]);
    setAssistantResponse(null);
    justResetRef.current = true; // ADDED: Set the flag
    // Log to confirm assistantResponse is intended to be null for the next send operation
    console.log('[useChat - resetChat] assistantResponse set to null and justResetRef set to true. The next \'Value of assistantResponse (state) before capturing\' log should show null.');
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
      await sendChatMessage(nextMessage.message, nextMessage.payload);
    }
  };

  const sendChatMessage = async (
    messageContent: string,
    chatPayload: Omit<ChatPayload, 'message'>,
    isRefetch: boolean = false, // Added flag to indicate refetch
    isResend: boolean = false   // Added flag to indicate a resend after error
  ) => {
    // Create the message object
    const newMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: messageContent,
      timestamp: new Date(),
    };

    // If the thread is not yet ready (e.g., immediately after a reset), queue
    // the message and return. Once the new thread id is obtained, queued
    // messages will be processed by `processNextMessage` which is triggered
    // in the `createThread` promise inside `resetChat`.
    if (!threadIdRef.current) {
      console.warn('Chat thread not ready yet, queuing message.');

      messageQueueRef.current.push({
        message: messageContent,
        payload: {
          ...chatPayload,
          diagnosisAssistantResponse: assistantResponse,
        },
      });

      // Store as last user message so that potential reconnection logic still
      // works correctly.
      lastUserMessageRef.current = {
        messageContent,
        chatPayload: {
          ...chatPayload,
          diagnosisAssistantResponse: assistantResponse,
        },
      };

      return; // Exit until thread is ready
    }
    
    if (!isRefetch) {
      if (isLoading) {
        // Queue the message if loading (unless it's a refetch)
        // Since we're queueing a new message, we can consider the current response complete
        // setIsLoading(false); // Let's not assume the current response is complete, just queue
        console.log("Chat is busy, queuing message:", messageContent);
        messageQueueRef.current.push({
          message: messageContent,
          payload: {
            ...chatPayload,
            diagnosisAssistantResponse: assistantResponse,
          },
        });
        return;
      }
      
      if (isResend) {
        // Find and remove the error message and keep only the original user message
        setMessages((prev) => {
          // Find the last error message index
          const errorMsgIndex = [...prev].reverse().findIndex(msg => 
            msg.role === 'assistant' && msg.hasError === true);
          
          if (errorMsgIndex >= 0) {
            // Real index from the end
            const realErrorIndex = prev.length - 1 - errorMsgIndex;
            
            // Remove the error message
            return prev.filter((_, index) => index !== realErrorIndex);
          }
          
          return prev;
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
          diagnosisAssistantResponse: assistantResponse
        }
      };
    } else {
      // If it's a refetch, remove the potentially incomplete last assistant message
      console.log("Refetching: Removing potentially incomplete last assistant message.");
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
      console.log('[useChat] First message after reset: Forcing previousTurnAssistantResponse to null.');
      previousTurnAssistantResponseFromState = null;
      justResetRef.current = false; // Clear the flag after using it once
    }
    console.log('[useChat] Effective previousTurnAssistantResponse (after considering reset flag):', JSON.stringify(previousTurnAssistantResponseFromState, null, 2)); // DEBUG

    // Reset state for the new/refetched response
    setFollowUpQuestions([]);
    setAssistantResponse(null); // Also reset previous assistant response data
    setLastSendError(null); // Clear any previous error when sending a new message
    setStreamError(null); // Clear any previous stream error
    setIsLoading(true);
    streamPossiblyInterruptedRef.current = false; // Reset before starting

    try {
      const payload: ChatPayload = {
        ...chatPayload,
        message: messageContent,
        language: locale,
        diagnosisAssistantResponse: previousTurnAssistantResponseFromState, // MODIFIED: Use the potentially overridden value
      };
      console.log('[useChat] Final payload being sent to backend:', JSON.stringify(payload, null, 2)); // DEBUG

      if (isRefetch) {
        console.log("Refetch: Sending payload:", JSON.stringify(payload));
      }

      let accumulatedContent = '';
      let jsonDetected = false;
      let accumulatedJsonBuffer = '';

      // Mark stream as potentially interruptible right before the async call
      // Only set if not already loading (prevents overriding during queue processing)
      if (!isLoading) {
        streamPossiblyInterruptedRef.current = true;
        console.log("Set streamPossiblyInterruptedRef = true before await sendMessage");
      }

      // Send the message and handle streaming response
      try {
        await sendMessage(threadIdRef.current ?? '', payload, (content) => {
          if (!content) return;

          if (isRefetch) {
            console.log("Refetch: Received content chunk:", content ? content.substring(0, 50) + '...' : 'null');
          }

          // If the stream was previously marked as interrupted and we are now receiving content,
          // it means the connection survived or reconnected automatically. Reset the flag.
          if (streamPossiblyInterruptedRef.current) {
              console.log("Receiving content after potential interruption, resetting flag.");
              streamPossiblyInterruptedRef.current = false;
          }

          // Add to buffer for cross-chunk marker detection
          accumulatedJsonBuffer += content;

          // First check if content has any '<<' marker
          const markerIndex = content.indexOf('<<');
          if (markerIndex !== -1) {
            // Extract text before the marker and process any json after it
            const textBeforeMarker = content.substring(0, markerIndex).trim();
            jsonDetected = true;

            // Add text content before marker to messages if any
            if (textBeforeMarker) {
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'assistant') {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: lastMessage.content + textBeforeMarker,
                      timestamp: new Date(),
                    },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: `assistant-${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2, 7)}`,
                    role: 'assistant',
                    content: textBeforeMarker,
                    timestamp: new Date(),
                  },
                ];
              });
            }

            // Collect the content after '<<' for JSON processing
            accumulatedContent += content.substring(markerIndex);

            // Don't show this chunk with marker
            return;
          }

          // First check if accumulated buffer contains markers
          const markerStartIndex = accumulatedJsonBuffer.indexOf('<<JSON_DATA>>');
          const markerEndIndex = accumulatedJsonBuffer.indexOf('<<JSON_END>>');

          if (
            markerStartIndex !== -1 &&
            markerEndIndex !== -1 &&
            markerEndIndex > markerStartIndex
          ) {
            // We have complete JSON with markers in the buffer
            jsonDetected = true;

            // Extract text content before markers
            const textContentBeforeJson = accumulatedJsonBuffer
              .substring(0, markerStartIndex)
              .trim();

            // Extract JSON content between markers
            const jsonContent = accumulatedJsonBuffer
              .substring(
                markerStartIndex + '<<JSON_DATA>>'.length,
                markerEndIndex
              )
              .trim();

            // Extract content after JSON end marker
            const contentAfterJson = accumulatedJsonBuffer
              .substring(markerEndIndex + '<<JSON_END>>'.length)
              .trim();

            // Add text content before JSON to message if it exists
            if (textContentBeforeJson) {
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === 'assistant') {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: textContentBeforeJson, // Replace with clean content
                      timestamp: new Date(),
                    },
                  ];
                }
                return [
                  ...prev,
                  {
                    id: `assistant-${Date.now()}-${Math.random()
                      .toString(36)
                      .slice(2, 7)}`,
                    role: 'assistant',
                    content: textContentBeforeJson,
                    timestamp: new Date(),
                  },
                ];
              });
            }

            // Process JSON content
            try {
              const response = JSON.parse(
                jsonContent
              ) as DiagnosisAssistantResponse;
              console.log('[useChat] Parsed AI JSON response:', JSON.stringify(response, null, 2)); // DEBUG
              setAssistantResponse(response);

              if (
                response.followUpQuestions &&
                response.followUpQuestions.length > 0
              ) {
                // Process questions one by one with a small delay to simulate incremental appearance
                response.followUpQuestions.forEach((question, index) => {
                  setTimeout(() => {
                    setFollowUpQuestions((prev) => {
                      if (!prev.some((q) => q.question === question.question)) {
                        return [...prev, question];
                      }
                      return prev;
                    });
                  }, index * 150); // Stagger by 150ms per question
                });
              }
            } catch (e) {
              // JSON parsing failed
            }

            // Clear buffer but keep content after end marker if any
            accumulatedJsonBuffer = contentAfterJson;

            // If we have content after JSON, process it normally
            if (contentAfterJson) {
              // Check for more JSON or just add as regular content
              if (!jsonDetected) {
                // Process as regular content
                setMessages((prev) => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: lastMessage.content + contentAfterJson,
                        timestamp: new Date(),
                      },
                    ];
                  }
                  return [
                    ...prev,
                    {
                      id: `assistant-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 7)}`,
                      role: 'assistant',
                      content: contentAfterJson,
                      timestamp: new Date(),
                    },
                  ];
                });
              }
            }

            return;
          }

          // If we have markers but not the complete pair, wait for more content
          if (
            (markerStartIndex !== -1 && markerEndIndex === -1) ||
            content.includes('<<')
          ) {
            // We have a marker or part of one, extract any text content before it
            if (content.includes('<<')) {
              // Only add text content that comes before the marker
              const textBeforeMarker = content
                .substring(0, content.indexOf('<<'))
                .trim();
              if (textBeforeMarker) {
                setMessages((prev) => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: lastMessage.content + textBeforeMarker,
                        timestamp: new Date(),
                      },
                    ];
                  }
                  return [
                    ...prev,
                    {
                      id: `assistant-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 7)}`,
                      role: 'assistant',
                      content: textBeforeMarker,
                      timestamp: new Date(),
                    },
                  ];
                });
              }
            }

            // Check if we have the start marker
            if (markerStartIndex !== -1) {
              // Try to extract partial questions from what we have so far
              const partialJson = accumulatedJsonBuffer.substring(
                markerStartIndex + '<<JSON_DATA>>'.length
              );

              // Look for complete question objects in the partial JSON
              const questionMatches = partialJson.match(
                /"question"\s*:\s*"[^"]*"/g
              );

              if (questionMatches) {
                for (const questionMatch of questionMatches) {
                  // Find the complete object containing this question
                  const questionEndIndex = partialJson.indexOf(
                    '}',
                    partialJson.indexOf(questionMatch)
                  );

                  if (questionEndIndex !== -1) {
                    // Look backwards for the start of this object
                    const questionStartIndex = partialJson.lastIndexOf(
                      '{',
                      partialJson.indexOf(questionMatch)
                    );

                    if (questionStartIndex !== -1) {
                      const questionObject = partialJson.substring(
                        questionStartIndex,
                        questionEndIndex + 1
                      );

                      try {
                        const question = JSON.parse(questionObject) as Question;
                        // Only add if not already in the follow-up questions
                        setFollowUpQuestions((prev) => {
                          if (
                            !prev.some((q) => q.question === question.question)
                          ) {
                            return [...prev, question];
                          }
                          return prev;
                        });
                      } catch (e) {
                        // Skip malformed question
                      }
                    }
                  }
                }
              }
            }

            // Wait for more content before displaying
            return;
          }

          // No markers found, proceed with normal processing
          if (!jsonDetected) {
            // Look for JSON structure in the message
            const jsonRegex =
              /\{\s*"diagnosis"[\s\S]*"followUpQuestions"[\s\S]*\}|\{\s*["']diagnosis["']\s*:\s*null,\s*["']followUpQuestions["']\s*:\s*\[[\s\S]*\]\s*\}/;
            const markerRegex = /<<JSON_DATA>>[\s\S]*<<JSON_END>>/;
            // Check if content has a partial start marker without end marker
            const hasPartialMarker =
              content.includes('<<JSON_DATA') &&
              !content.includes('<<JSON_END>>');

            let contentToAdd = content;
            let foundJson = false;

            // If we have a partial marker, don't display this chunk at all
            if (hasPartialMarker) {
              // Set flag but don't display the content containing the marker
              foundJson = true;
              jsonDetected = true;
              contentToAdd = content
                .substring(0, content.indexOf('<<JSON_DATA'))
                .trim();
              // Add partial JSON to accumulated content for later extraction
              accumulatedContent += content.substring(
                content.indexOf('<<JSON_DATA')
              );
            }
            // First check for the markers
            else if (markerRegex.test(content)) {
              foundJson = true;
              const match = content.match(markerRegex);
              if (match) {
                // Remove the marked JSON from the content
                contentToAdd = content.replace(match[0], '').trim();

                // Extract JSON content between markers
                const jsonContent = match[0]
                  .replace('<<JSON_DATA>>', '')
                  .replace('<<JSON_END>>', '')
                  .trim();

                jsonDetected = true;
                accumulatedContent = jsonContent;

                try {
                  const response = JSON.parse(
                    jsonContent
                  ) as DiagnosisAssistantResponse;
                  setAssistantResponse(response);

                  if (
                    response.followUpQuestions &&
                    response.followUpQuestions.length > 0
                  ) {
                    // Process questions one by one with a small delay to simulate incremental appearance
                    response.followUpQuestions.forEach((question, index) => {
                      setTimeout(() => {
                        setFollowUpQuestions((prev) => {
                          if (
                            !prev.some((q) => q.question === question.question)
                          ) {
                            return [...prev, question];
                          }
                          return prev;
                        });
                      }, index * 150); // Stagger by 150ms per question
                    });
                  }
                } catch (e) {
                  // JSON parsing failed
                }
              }
            }
            // Then check for standard JSON format if no markers found
            else if (jsonRegex.test(content)) {
              foundJson = true;
              const jsonMatch = content.match(jsonRegex);
              if (jsonMatch) {
                // Remove JSON from the content
                contentToAdd = content.replace(jsonMatch[0], '').trim();

                // Use the JSON for processing follow-up questions
                jsonDetected = true;
                accumulatedContent = jsonMatch[0];

                try {
                  const response = JSON.parse(
                    jsonMatch[0]
                  ) as DiagnosisAssistantResponse;
                  setAssistantResponse(response);

                  // Extract questions one by one instead of all at once
                  if (
                    response.followUpQuestions &&
                    response.followUpQuestions.length > 0
                  ) {
                    // Process each question individually with a small delay
                    response.followUpQuestions.forEach((question, index) => {
                      setTimeout(() => {
                        setFollowUpQuestions((prev) => {
                          if (
                            !prev.some((q) => q.question === question.question)
                          ) {
                            return [...prev, question];
                          }
                          return prev;
                        });
                      }, index * 150); // Stagger by 150ms per question
                    });
                  }
                } catch (e) {
                  // JSON parsing failed

                  // Even if full parsing failed, try to extract individual questions
                  const questionMatches = jsonMatch[0].match(
                    /"question"\s*:\s*"[^"]*"/g
                  );

                  if (questionMatches) {
                    for (const questionMatch of questionMatches) {
                      // Find the complete object containing this question
                      const questionEndIndex = jsonMatch[0].indexOf(
                        '}',
                        jsonMatch[0].indexOf(questionMatch)
                      );

                      if (questionEndIndex !== -1) {
                        // Look backwards for the start of this object
                        const questionStartIndex = jsonMatch[0].lastIndexOf(
                          '{',
                          jsonMatch[0].indexOf(questionMatch)
                        );

                        if (questionStartIndex !== -1) {
                          const questionObject = jsonMatch[0].substring(
                            questionStartIndex,
                            questionEndIndex + 1
                          );

                          try {
                            const question = JSON.parse(
                              questionObject
                            ) as Question;
                            setFollowUpQuestions((prev) => {
                              if (
                                !prev.some(
                                  (q) => q.question === question.question
                                )
                              ) {
                                return [...prev, question];
                              }
                              return prev;
                            });
                          } catch (e) {
                            // Skip malformed question
                          }
                        }
                      }
                    }
                  }
                }
              }
            }

            // Only add message content if there's content to add
            if (contentToAdd) {
              // Check if the content contains '<<' and cut off the message at that point
              const markerIndex = contentToAdd.indexOf('<<');
              if (markerIndex !== -1) {
                // Only include content before the marker
                contentToAdd = contentToAdd.substring(0, markerIndex).trim();
              }

              // Only add if we have content left after filtering
              if (contentToAdd) {
                setMessages((prev) => {
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage?.role === 'assistant') {
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: lastMessage.content + contentToAdd,
                        timestamp: new Date(),
                      },
                    ];
                  }
                  return [
                    ...prev,
                    {
                      id: `assistant-${Date.now()}-${Math.random()
                        .toString(36)
                        .slice(2, 7)}`,
                      role: 'assistant',
                      content: contentToAdd,
                      timestamp: new Date(),
                    },
                  ];
                });
              }
            }

            if (!foundJson) {
              accumulatedContent += content;
            }
          }

          // Always accumulate content for JSON parsing, even if we're not updating messages
          if (jsonDetected) {
            accumulatedContent += content;

            // Try to find complete follow-up questions in the accumulated content
            const questionMatches = accumulatedContent.match(
              /"question":\s*"[^"]*"/g
            );
            if (questionMatches) {
              for (const questionMatch of questionMatches) {
                // Find the complete object containing this question
                const questionEndIndex = accumulatedContent.indexOf(
                  '}',
                  accumulatedContent.indexOf(questionMatch)
                );
                if (questionEndIndex !== -1) {
                  // Look backwards for the start of this object
                  const questionStartIndex = accumulatedContent.lastIndexOf(
                    '{',
                    accumulatedContent.indexOf(questionMatch)
                  );
                  if (questionStartIndex !== -1) {
                    const questionObject = accumulatedContent.substring(
                      questionStartIndex,
                      questionEndIndex + 1
                    );
                    try {
                      const question = JSON.parse(questionObject) as Question;
                      // Only add if not already present
                      setFollowUpQuestions((prev) => {
                        if (!prev.some((q) => q.question === question.question)) {
                          return [...prev, question];
                        }
                        return prev;
                      });
                    } catch (e) {
                      // Skip malformed question
                    }
                  }
                }
              }
            }

            // Still try to parse the complete response when possible
            try {
              // First check for our new markers
              const markerJsonRegex = /<<JSON_DATA>>[\s\S]*<<JSON_END>>/;
              let jsonMatch = accumulatedContent.match(markerJsonRegex)?.[0];

              if (jsonMatch) {
                // Extract just the JSON part between the markers
                const jsonContent = jsonMatch
                  .replace('<<JSON_DATA>>', '')
                  .replace('<<JSON_END>>', '')
                  .trim();
                const response = JSON.parse(
                  jsonContent
                ) as DiagnosisAssistantResponse;
                setAssistantResponse(response);

                // Also clean the markers from any existing messages
                setMessages((prev) => {
                  if (prev.length === 0) return prev;
                  const lastMessage = prev[prev.length - 1];
                  if (lastMessage.role === 'assistant') {
                    const cleanedContent = lastMessage.content
                      .replace(markerJsonRegex, '')
                      .trim();
                    return [
                      ...prev.slice(0, -1),
                      {
                        ...lastMessage,
                        content: cleanedContent,
                        timestamp: new Date(),
                      },
                    ];
                  }
                  return prev;
                });
              } else {
                // Fall back to the original method if no markers found
                jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/)?.[0];
                if (jsonMatch) {
                  // Make sure we have a valid JSON object by removing any text before the first {
                  const cleanedJson = jsonMatch.substring(jsonMatch.indexOf('{'));
                  const response = JSON.parse(
                    cleanedJson
                  ) as DiagnosisAssistantResponse;
                  setAssistantResponse(response);
                }
              }
            } catch (e) {
              // Complete JSON not available yet
            }
          }
        });
        
        // Stream completed successfully
        setStreamError(null);
      } catch (error) {
        console.error('Error during message streaming:', error);
        
        // Set stream error state so the UI can show an error message
        setStreamError(error instanceof Error ? error : new Error('Stream interrupted'));
        
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
              }
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
              }
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
    if (lastSendError) {
      console.log('Retrying last failed message...');
      const { messageContent, chatPayload } = lastSendError;
      setLastSendError(null); // Clear the error state before retrying
      // Send the message again with the isResend flag
      sendChatMessage(messageContent, {
        ...chatPayload,
        diagnosisAssistantResponse: assistantResponse
      }, false, true);
    }
  };

  // Clean up any JSON that might have slipped through
  const cleanupJsonInMessages = () => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;

      const lastMessage = prev[prev.length - 1];
      if (lastMessage.role !== 'assistant') return prev;

      // Remove markers and any text after them
      const markerRegex = /<<JSON_DATA>>|<<JSON_END>>/;
      const match = lastMessage.content.match(markerRegex);

      if (match && match.index !== undefined) {
          const cleanContent = lastMessage.content.substring(0, match.index).trim();
          console.log("Cleaning up JSON markers from last message.");

          // If cleaning removed everything, remove the message entirely
          if (!cleanContent) {
             console.log("Cleaned content is empty, removing message.");
            return prev.slice(0,-1);
          }

          return [
            ...prev.slice(0, -1),
            {
              ...lastMessage,
              content: cleanContent,
              timestamp: new Date(),
            },
          ];
      }

      return prev;
    });
  };

  return {
    messages,
    isLoading,
    userPreferences,
    followUpQuestions,
    assistantResponse,
    lastSendError,
    streamError,
    resetChat,
    sendChatMessage,
    retryLastMessage,
    setFollowUpQuestions,
  };
}
