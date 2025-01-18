import { useState, useRef, useEffect } from "react";
import {
  getOrCreateAssistant,
  createThread,
  sendMessage,
  generateFollowUp,
} from "../api/assistant/assistant";
import {
  ChatMessage,
  ChatPayload,
  Question,
  UserPreferences,
  DiagnosisAssistantResponse,
} from "../types";

export function useChat() {
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
  const messageQueueRef = useRef<{message: string; payload: Omit<ChatPayload, "message">}[]>([]);

  useEffect(() => {
    async function initializeAssistant() {
      try {
        const { assistantId, threadId } = await getOrCreateAssistant();
        assistantIdRef.current = assistantId;
        threadIdRef.current = threadId;
      } catch (error) {
        console.error("Error initializing assistant:", error);
      }
    }

    initializeAssistant();
  }, []);

  const resetChat = () => {
    setMessages([]);
    setFollowUpQuestions([]);
    setAssistantResponse(null);
    messageQueueRef.current = []; // Clear the queue on reset
    createThread().then(({ threadId }) => {
      threadIdRef.current = threadId;
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
    chatPayload: Omit<ChatPayload, "message">
  ) => {
    if (isLoading) {
      // Queue the message instead of returning
      messageQueueRef.current.push({
        message: messageContent,
        payload: chatPayload
      });
      return;
    }

    setFollowUpQuestions([]);
    setIsLoading(true);

    try {
      const payload: ChatPayload = {
        ...chatPayload,
        message: messageContent,
      };

      // Add user message immediately
      const newMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user" as const,
        content: messageContent,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, newMessage]);

      let accumulatedContent = "";
      let jsonDetected = false;
      let hasAssistantQuestions = false;
      let partialFollowUps: Question[] = [];

      // Send the message and handle streaming response
      await sendMessage(threadIdRef.current ?? "", payload, (content) => {
        if (content && !jsonDetected) {
          // Check if this chunk contains any JSON-related content
          if (
            content.includes("```") ||
            content.toLowerCase().includes("json {")
          ) {
            jsonDetected = true;
            // Split on either ``` or "json {"
            const parts = content.split(/```|json \{/);
            const textContent = parts[0].trim();

            if (textContent) {
              setMessages((prev) => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage?.role === "assistant") {
                  return [
                    ...prev.slice(0, -1),
                    {
                      ...lastMessage,
                      content: lastMessage.content + textContent,
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
                    role: "assistant",
                    content: textContent,
                    timestamp: new Date(),
                  },
                ];
              });
            }

            // Start accumulating JSON content
            accumulatedContent = content;
          } else {
            // Normal text content, update messages
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.role === "assistant") {
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
                  id: `assistant-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2, 7)}`,
                  role: "assistant",
                  content,
                  timestamp: new Date(),
                },
              ];
            });
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
                "}",
                accumulatedContent.indexOf(questionMatch)
              );
              if (questionEndIndex !== -1) {
                // Look backwards for the start of this object
                const questionStartIndex = accumulatedContent.lastIndexOf(
                  "{",
                  accumulatedContent.indexOf(questionMatch)
                );
                if (questionStartIndex !== -1) {
                  const questionObject = accumulatedContent.substring(
                    questionStartIndex,
                    questionEndIndex + 1
                  );
                  try {
                    const question = JSON.parse(questionObject) as Question;
                    if (
                      !partialFollowUps.some(
                        (q) => q.question === question.question
                      )
                    ) {
                      console.log("Found new question:", question);
                      partialFollowUps = [...partialFollowUps, question];
                      setFollowUpQuestions(partialFollowUps);
                      hasAssistantQuestions = true;
                    }
                  } catch (e) {
                    // Skip malformed question
                  }
                }
              }
            }
          }

          // Still try to parse the complete response when possible
          try {
            const jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/)?.[0];
            if (jsonMatch) {
              const response = JSON.parse(
                jsonMatch
              ) as DiagnosisAssistantResponse;
              setAssistantResponse(response);
            }
          } catch (e) {
            // Complete JSON not available yet
          }
        }
      });

      // After message is complete, check if we need to use generated follow-ups
      // if (!hasAssistantQuestions) {
      //   const { followUpQuestions: generatedQuestions } = await followUpPromise;
      //   if (generatedQuestions) {
      //     setFollowUpQuestions(generatedQuestions);
      //   }
      // }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsLoading(false);
      // Process next message in queue if any
      processNextMessage();
    }
  };

  return {
    messages,
    isLoading,
    userPreferences,
    followUpQuestions,
    assistantResponse,
    resetChat,
    sendChatMessage,
    setFollowUpQuestions,
  };
}
