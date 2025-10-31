import { ChatMessage, DiagnosisAssistantResponse, Question } from '@/app/types';

type SetMessages = React.Dispatch<React.SetStateAction<ChatMessage[]>>;
type SetQuestions = React.Dispatch<React.SetStateAction<Question[]>>;

export interface StreamProcessorDeps {
  setMessages: SetMessages;
  setAssistantResponse: (resp: DiagnosisAssistantResponse | null) => void;
  setFollowUpQuestions: SetQuestions;
  cleanupAssistantJsonLeak: () => void;
}

export interface StreamProcessor {
  handleChunk: (content: string) => void;
  reset: () => void;
}

// Extracted streaming parser from useChat. Logic preserved 1:1.
export function createStreamProcessor(deps: StreamProcessorDeps): StreamProcessor {
  const { setMessages, setAssistantResponse, setFollowUpQuestions, cleanupAssistantJsonLeak } = deps;

  let accumulatedContent = '';
  let jsonDetected = false;
  let accumulatedJsonBuffer = '';

  const handleChunk = (content: string) => {
    if (!content) return;

    // Add to buffer for cross-chunk marker detection
    accumulatedJsonBuffer += content;

    // First check if content has any '<<' marker
    const markerIndex = content.indexOf('<<');
    if (markerIndex !== -1) {
      const after = content.substring(markerIndex);
      const isStartMarker = after.startsWith('<<JSON_DATA');
      // Only treat as start marker for pre-text; end markers are handled by buffer parser
      if (isStartMarker) {
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
              id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              role: 'assistant',
              content: textBeforeMarker,
              timestamp: new Date(),
            },
          ];
        });
      }

      // Collect the content after '<<' for JSON processing
      accumulatedContent += content.substring(markerIndex);
      }
      // Do not return here; allow buffer-based detection to process full pairs in this chunk
    }

    // First check if accumulated buffer contains markers
    const markerStartIndex = accumulatedJsonBuffer.indexOf('<<JSON_DATA>>');
    const markerEndIndex = accumulatedJsonBuffer.indexOf('<<JSON_END>>');

    if (markerStartIndex !== -1 && markerEndIndex !== -1 && markerEndIndex > markerStartIndex) {
      // We have complete JSON with markers in the buffer
      jsonDetected = true;

      // Extract text content before markers
      const textContentBeforeJson = accumulatedJsonBuffer.substring(0, markerStartIndex).trim();

      // Extract JSON content between markers
      const jsonContent = accumulatedJsonBuffer
        .substring(markerStartIndex + '<<JSON_DATA>>'.length, markerEndIndex)
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
                content: textContentBeforeJson,
                timestamp: new Date(),
              },
            ];
          }
          return [
            ...prev,
            {
              id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              role: 'assistant',
              content: textContentBeforeJson,
              timestamp: new Date(),
            },
          ];
        });
      }

      // If there's no visible text before JSON and previous message isn't assistant,
      // insert a minimal placeholder to avoid "only follow-ups" UI state.
      if (!textContentBeforeJson) {
        setMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.role === 'assistant') return prev;
          return [
            ...prev,
            {
              id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              role: 'assistant',
              content: '',
              timestamp: new Date(),
            },
          ];
        });
      }

      // Process JSON content
      try {
        const response = JSON.parse(jsonContent) as DiagnosisAssistantResponse;
        setAssistantResponse(response);

        if (response.followUpQuestions && response.followUpQuestions.length > 0) {
          // Process questions one by one with a small delay to simulate incremental appearance
          response.followUpQuestions.forEach((question, index) => {
            setTimeout(() => {
              setFollowUpQuestions((prev) => {
                if (!prev.some((q) => q.question === question.question)) {
                  return [...prev, question];
                }
                return prev;
              });
            }, index * 150);
          });
        }
      } catch {
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
                id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
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
    if ((markerStartIndex !== -1 && markerEndIndex === -1) || content.includes('<<JSON_DATA')) {
      // We have a marker or part of one, extract any text content before it
      if (content.includes('<<JSON_DATA')) {
        // Only add text content that comes before the marker
        const textBeforeMarker = content.substring(0, content.indexOf('<<JSON_DATA')).trim();
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
                id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                role: 'assistant',
                content: textBeforeMarker,
                timestamp: new Date(),
              },
            ];
          });
        }
      }

      // Try to extract partial questions from what we have so far
      if (markerStartIndex !== -1) {
        const partialJson = accumulatedJsonBuffer.substring(
          markerStartIndex + '<<JSON_DATA>>'.length
        );

        const questionMatches = partialJson.match(/"question"\s*:\s*"[^"]*"/g);
        if (questionMatches) {
          for (const questionMatch of questionMatches) {
            const questionEndIndex = partialJson.indexOf('}', partialJson.indexOf(questionMatch));
            if (questionEndIndex !== -1) {
              const questionStartIndex = partialJson.lastIndexOf('{', partialJson.indexOf(questionMatch));
              if (questionStartIndex !== -1) {
                const questionObject = partialJson.substring(questionStartIndex, questionEndIndex + 1);
                try {
                  const question = JSON.parse(questionObject) as Question;
                  setFollowUpQuestions((prev) => {
                    if (!prev.some((q) => q.question === question.question)) {
                      return [...prev, question];
                    }
                    return prev;
                  });
                } catch {
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
      const braceIndex = content.indexOf('{');
      if (braceIndex !== -1) {
        const tail = content.substring(braceIndex);
        const looksLikeSchema = /"diagnosis"|"followUpQuestions"/.test(tail);
        if (looksLikeSchema) {
          // Add any text before the JSON brace
          const textBeforeJson = content.substring(0, braceIndex).trim();
          if (textBeforeJson) {
            setMessages((prev) => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage?.role === 'assistant') {
                return [
                  ...prev.slice(0, -1),
                  {
                    ...lastMessage,
                    content: lastMessage.content + textBeforeJson,
                    timestamp: new Date(),
                  },
                ];
              }
              return [
                ...prev,
                {
                  id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                  role: 'assistant',
                  content: textBeforeJson,
                  timestamp: new Date(),
                },
              ];
            });
          }

          // Start accumulating JSON across chunks and prevent it from rendering
          jsonDetected = true;
          accumulatedContent += tail;

          // Try to extract any early follow-up questions from the partial JSON
          const questionMatchesEarly = tail.match(/"question"\s*:\s*"[^"]*"/g);
          if (questionMatchesEarly) {
            for (const qm of questionMatchesEarly) {
              const endIdx = tail.indexOf('}', tail.indexOf(qm));
              if (endIdx !== -1) {
                const startIdx = tail.lastIndexOf('{', tail.indexOf(qm));
                if (startIdx !== -1) {
                  const objStr = tail.substring(startIdx, endIdx + 1);
                  try {
                    const qObj = JSON.parse(objStr) as Question;
                    setFollowUpQuestions((prev) => {
                      if (!prev.some((q) => q.question === qObj.question)) {
                        return [...prev, qObj];
                      }
                      return prev;
                    });
                  } catch {}
                }
              }
            }
          }

          // Suppress rendering this chunk further
          return;
        }
      }

      // Look for JSON structure in the message
      const jsonRegex =
        /\{\s*"diagnosis"[\s\S]*"followUpQuestions"[\s\S]*\}|\{\s*["']diagnosis["']\s*:\s*null,\s*["']followUpQuestions["']\s*:\s*\[[\s\S]*\]\s*\}/;
      const markerRegex = /<<JSON_DATA>>[\s\S]*<<JSON_END>>/;
      const hasPartialMarker = content.includes('<<JSON_DATA') && !content.includes('<<JSON_END>>');

      let contentToAdd = content;
      let foundJson = false;

      if (hasPartialMarker) {
        foundJson = true;
        jsonDetected = true;
        contentToAdd = content.substring(0, content.indexOf('<<JSON_DATA')).trim();
        accumulatedContent += content.substring(content.indexOf('<<JSON_DATA'));
      } else if (markerRegex.test(content)) {
        foundJson = true;
        const match = content.match(markerRegex);
        if (match) {
          contentToAdd = content.replace(match[0], '').trim();
          const jsonContent = match[0].replace('<<JSON_DATA>>', '').replace('<<JSON_END>>', '').trim();
          jsonDetected = true;
          accumulatedContent = jsonContent;

          try {
            const response = JSON.parse(jsonContent) as DiagnosisAssistantResponse;
            setAssistantResponse(response);
            if (response.followUpQuestions && response.followUpQuestions.length > 0) {
              response.followUpQuestions.forEach((question, index) => {
                setTimeout(() => {
                  setFollowUpQuestions((prev) => {
                    if (!prev.some((q) => q.question === question.question)) {
                      return [...prev, question];
                    }
                    return prev;
                  });
                }, index * 150);
              });
            }
          } catch {}
        }
      } else if (jsonRegex.test(content)) {
        foundJson = true;
        const jsonMatch = content.match(jsonRegex);
        if (jsonMatch) {
          contentToAdd = content.replace(jsonMatch[0], '').trim();
          jsonDetected = true;
          accumulatedContent = jsonMatch[0];

          try {
            const response = JSON.parse(jsonMatch[0]) as DiagnosisAssistantResponse;
            setAssistantResponse(response);
            if (response.followUpQuestions && response.followUpQuestions.length > 0) {
              response.followUpQuestions.forEach((question, index) => {
                setTimeout(() => {
                  setFollowUpQuestions((prev) => {
                    if (!prev.some((q) => q.question === question.question)) {
                      return [...prev, question];
                    }
                    return prev;
                  });
                }, index * 150);
              });
            }
          } catch {
            const questionMatches = jsonMatch[0].match(/"question"\s*:\s*"[^"]*"/g);
            if (questionMatches) {
              for (const questionMatch of questionMatches) {
                const questionEndIndex = jsonMatch[0].indexOf('}', jsonMatch[0].indexOf(questionMatch));
                if (questionEndIndex !== -1) {
                  const questionStartIndex = jsonMatch[0].lastIndexOf('{', jsonMatch[0].indexOf(questionMatch));
                  if (questionStartIndex !== -1) {
                    const questionObject = jsonMatch[0].substring(questionStartIndex, questionEndIndex + 1);
                    try {
                      const question = JSON.parse(questionObject) as Question;
                      setFollowUpQuestions((prev) => {
                        if (!prev.some((q) => q.question === question.question)) {
                          return [...prev, question];
                        }
                        return prev;
                      });
                    } catch {}
                  }
                }
              }
            }
          }
        }
      }

      if (contentToAdd) {
        // Strip any marker remnants (complete or partial) from visible text
        const stripIndexMarked = contentToAdd.search(/<<JSON_DATA>>/);
        const stripIndexPlainA = contentToAdd.search(/\{[\s\S]*?"diagnosis"[\s\S]*?\}/);
        const stripIndexPlainB = contentToAdd.search(/\{[\s\S]*?"followUpQuestions"[\s\S]*?\}/);
        const candidates = [stripIndexMarked, stripIndexPlainA, stripIndexPlainB].filter((i) => i >= 0);
        if (candidates.length > 0) {
          const cut = Math.min(...candidates);
          contentToAdd = contentToAdd.substring(0, cut).trim();
        }
        // Cut at ANY occurrence of '<<' or literal 'JSON_DATA' to prevent marker leaks
        const markerStartIdx = contentToAdd.indexOf('<<');
        const literalJsonDataIdx = contentToAdd.indexOf('JSON_DATA');
        const cutIdx = [markerStartIdx, literalJsonDataIdx].filter((i) => i >= 0);
        if (cutIdx.length > 0) {
          const earliestCut = Math.min(...cutIdx);
          contentToAdd = contentToAdd.substring(0, earliestCut).trim();
        }

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
                id: `assistant-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
                role: 'assistant',
                content: contentToAdd,
                timestamp: new Date(),
              },
            ];
          });

          // After appending, ensure no JSON leaked in the composed message
          cleanupAssistantJsonLeak();
        }
      }

      if (!foundJson) {
        accumulatedContent += content;
      }
    }

    // Always accumulate content for JSON parsing, even if we're not updating messages
    if (jsonDetected) {
      accumulatedContent += content;

      const questionMatches = accumulatedContent.match(/"question":\s*"[^"]*"/g);
      if (questionMatches) {
        for (const questionMatch of questionMatches) {
          const questionEndIndex = accumulatedContent.indexOf('}', accumulatedContent.indexOf(questionMatch));
          if (questionEndIndex !== -1) {
            const questionStartIndex = accumulatedContent.lastIndexOf('{', accumulatedContent.indexOf(questionMatch));
            if (questionStartIndex !== -1) {
              const questionObject = accumulatedContent.substring(questionStartIndex, questionEndIndex + 1);
              try {
                const question = JSON.parse(questionObject) as Question;
                setFollowUpQuestions((prev) => {
                  if (!prev.some((q) => q.question === question.question)) {
                    return [...prev, question];
                  }
                  return prev;
                });
              } catch {}
            }
          }
        }
      }

      try {
        const markerJsonRegex = /<<JSON_DATA>>[\s\S]*<<JSON_END>>/;
        let jsonMatch = accumulatedContent.match(markerJsonRegex)?.[0];
        if (jsonMatch) {
          const jsonContent = jsonMatch.replace('<<JSON_DATA>>', '').replace('<<JSON_END>>', '').trim();
          const response = JSON.parse(jsonContent) as DiagnosisAssistantResponse;
          setAssistantResponse(response);

          // Also clean the markers from any existing messages
          setMessages((prev) => {
            if (prev.length === 0) return prev;
            const lastMessage = prev[prev.length - 1];
            if (lastMessage.role === 'assistant') {
              const cleanedContent = lastMessage.content.replace(markerJsonRegex, '').trim();
              return [
                ...prev.slice(0, -1),
                { ...lastMessage, content: cleanedContent, timestamp: new Date() },
              ];
            }
            return prev;
          });
        } else {
          jsonMatch = accumulatedContent.match(/\{[\s\S]*\}/)?.[0];
          if (jsonMatch) {
            const cleanedJson = jsonMatch.substring(jsonMatch.indexOf('{'));
            const response = JSON.parse(cleanedJson) as DiagnosisAssistantResponse;
            setAssistantResponse(response);
          }
        }
      } catch {
        // Complete JSON not available yet
      }
    }
  };

  const reset = () => {
    accumulatedContent = '';
    jsonDetected = false;
    accumulatedJsonBuffer = '';
  };

  return { handleChunk, reset };
}


