import OpenAI from 'openai';
import { ChatPayload, DiagnosisAssistantResponse } from '../../types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '@/app/shared/types';
import { adminDb } from '@/app/firebase/admin';
import { ProgramStatus, ExerciseProgram, Exercise } from '@/app/types/program';
import { loadServerExercises } from '@/app/services/server-exercises';
import { ProgramFeedback } from '@/app/components/ui/ProgramFeedbackQuestionnaire';
import { prepareExercisesPrompt } from '@/app/helpers/exercise-prompt';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Stream chat completion with OpenAI
export async function streamChatCompletion({
  threadId,
  messages,
  systemMessage,
  userMessage,
  modelName = 'gpt-4.1',
  onContent,
}: {
  threadId: string;
  messages: any[];
  systemMessage: string;
  userMessage: any;
  modelName?: string;
  onContent: (content: string) => void;
}) {
  try {
    console.log(`[streamChatCompletion] Starting with model: ${modelName}`);

    // Re-introduce historical messages
    const formattedMessages = formatMessagesForChatCompletion(messages);

    // Add the system message at the beginning
    formattedMessages.unshift({
      role: 'system' as const,
      content: systemMessage,
    });

    // Construct the user message content
    let userMessageContent = '';
    if (typeof userMessage === 'string') {
      userMessageContent = userMessage;
    } else if (typeof userMessage === 'object' && userMessage !== null) {
      // Prioritize userMessage.message if it exists (this is the actual typed text)
      if (userMessage.message && typeof userMessage.message === 'string') {
        userMessageContent = `User input: "${userMessage.message}"`;
      } else {
        // Fallback if .message isn't there, though ChatPayload expects it
        userMessageContent = 'User input: (no direct text provided)';
      }

      if (
        userMessage.diagnosisAssistantResponse &&
        Object.keys(userMessage.diagnosisAssistantResponse).length > 0
      ) {
        // Append the structured context if it exists and is not empty
        // Omit fields that are AI conclusions or UI constructs, not primary history data
        const {
          followUpQuestions,
          targetAreas,
          programType,
          informationalInsights,
          // assessmentComplete and redFlagsPresent might also be considered AI conclusions,
          // but they can be useful for the AI to know its own previous state flags.
          // Let's keep them for now unless they cause issues.
          ...contextualInfo
        } = userMessage.diagnosisAssistantResponse;
        userMessageContent += `\n\n<<PREVIOUS_CONTEXT_JSON>>\n${JSON.stringify(contextualInfo, null, 2)}\n<<PREVIOUS_CONTEXT_JSON_END>>`;
      }

      // Add selected body group and part information
      if (
        userMessage.selectedBodyGroupName &&
        typeof userMessage.selectedBodyGroupName === 'string'
      ) {
        userMessageContent += `\nSelected Body Group: ${userMessage.selectedBodyGroupName}`;
      }
      if (
        userMessage.selectedBodyPart &&
        typeof userMessage.selectedBodyPart === 'string' &&
        userMessage.selectedBodyPart !== 'no body part of body group selected'
      ) {
        userMessageContent += `\nSelected Specific Body Part: ${userMessage.selectedBodyPart}`;
      } else if (
        userMessage.selectedBodyPart ===
          'no body part of body group selected' &&
        !userMessage.selectedBodyGroupName
      ) {
        // Only add this if group name is also missing, to avoid redundancy if group is present
        userMessageContent += `\nSelected Specific Body Part: ${userMessage.selectedBodyPart}`;
      }

      if (
        userMessage.bodyPartsInSelectedGroup &&
        Array.isArray(userMessage.bodyPartsInSelectedGroup) &&
        userMessage.bodyPartsInSelectedGroup.length > 0
      ) {
        userMessageContent += `\nBody Parts In Selected Group: [${userMessage.bodyPartsInSelectedGroup.join(', ')}]`;
      }

      if (userMessage.language && typeof userMessage.language === 'string') {
        userMessageContent += `\nLanguage Preference: ${userMessage.language}`;
      }
    } else {
      // Fallback for unexpected userMessage types
      userMessageContent = JSON.stringify(userMessage);
    }
    console.log(
      '[streamChatCompletion] Constructed user message content (for current turn):',
      userMessageContent
    );

    // Add the new user message to the history
    formattedMessages.push({
      role: 'user' as const,
      content: userMessageContent,
    });

    // Call OpenAI streaming chat completion
    const stream = await openai.chat.completions.create({
      model: modelName,
      messages: formattedMessages, // Use the full history + current message
      stream: true,
    });

    let streamEnded = false;

    // Process the streaming response
    for await (const chunk of stream) {
      try {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onContent(content);
        }
      } catch (error) {
        if (!streamEnded) {
          console.error(
            '[streamChatCompletion] Error processing chunk:',
            error
          );
          streamEnded = true;
        }
      }
    }

    console.log('[streamChatCompletion] Stream completed successfully');
  } catch (error) {
    console.error('[streamChatCompletion] Error in stream:', error);
    throw error;
  }
}

// Helper function to format messages for chat completion
function formatMessagesForChatCompletion(messages: any[]) {
  return messages.map((msg) => {
    // Map OpenAI assistant API message format to chat completion format
    const role = msg.role === 'user' ? 'user' : 'assistant';

    // Handle various content formats
    let content = '';
    if (typeof msg.content === 'string') {
      content = msg.content;
    } else if (Array.isArray(msg.content)) {
      // Handle content array (text, image, etc.)
      content = msg.content
        .filter((item: any) => item.type === 'text')
        .map((item: any) => item.text?.value || '')
        .join('\n');
    } else if (msg.content?.text) {
      content = msg.content.text;
    } else if (msg.content) {
      // Try to stringify any other content object
      try {
        content = JSON.stringify(msg.content);
      } catch (e) {
        content = 'Content could not be processed';
      }
    }

    return {
      role: role as 'user' | 'assistant' | 'system',
      content,
    };
  });
}

// Create or load the assistant
export async function getOrCreateAssistant(assistantId: string) {
  try {
    const assistant = await openai.beta.assistants.retrieve(assistantId);

    return assistant;
  } catch (error) {
    console.error('Error in getOrCreateAssistant:', error);
    throw new Error('Failed to initialize assistant');
  }
}

// Create a new thread
export async function createThread() {
  try {
    return await openai.beta.threads.create();
  } catch (error) {
    console.error('Error creating thread:', error);
    throw new Error('Failed to create conversation thread');
  }
}

// Add a message to a thread
export async function addMessage(threadId: string, payload: ChatPayload) {
  try {
    const content = JSON.stringify(payload);
    return await openai.beta.threads.messages.create(threadId, {
      role: 'user',
      content,
    });
  } catch (error) {
    console.error('Error adding message:', error);
    throw new Error('Failed to add message to thread');
  }
}

// Run the assistant on a thread with streaming
export async function streamRunResponse(
  threadId: string,
  assistantId: string,
  onMessage: (content: string) => void
) {
  try {
    const stream = await openai.beta.threads.runs.stream(threadId, {
      assistant_id: assistantId,
    });

    // Keep track if we've already handled stream completion
    let streamEnded = false;

    // Add proper error handling - common for client disconnects
    const handleStreamEnd = (error?: Error) => {
      if (streamEnded) return; // Prevent duplicate handling
      streamEnded = true;

      if (error) {
        // Check if it's a premature close error (client disconnected)
        const isPrematureClose =
          error.message?.includes('Premature close') ||
          (error.cause as any)?.code === 'ERR_STREAM_PREMATURE_CLOSE';

        if (isPrematureClose) {
          // This is expected when clients navigate away or close the page
          console.log('Client disconnected from stream (expected behavior)');
        } else {
          // For other errors, log them as actual errors
          console.error('Stream error:', error);
        }
      } else {
        console.log('Stream completed successfully');
      }
    };

    stream
      .on('textCreated', () => {
        // Optional: Handle when text is created
      })
      .on('textDelta', (delta) => {
        if (delta.value) {
          onMessage(delta.value);
        }
      })
      .on('error', (error) => {
        handleStreamEnd(error);
      })
      .on('end', () => {
        handleStreamEnd();
      });

    try {
      await stream.done();
    } catch (error) {
      // Handle the error at the await point if it wasn't caught by the event handlers
      handleStreamEnd(
        error instanceof Error ? error : new Error(String(error))
      );
    }

    return;
  } catch (error) {
    console.error('Error in streamRunResponse:', error);
    throw error;
  }
}

// Run the assistant on a thread (non-streaming)
export async function runAssistant(threadId: string, assistantId: string) {
  try {
    const run = await openai.beta.threads.runs.create(threadId, {
      assistant_id: assistantId,
      response_format: { type: 'json_object' },
    });

    // Wait for the run to complete
    let runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    while (
      runStatus.status === 'in_progress' ||
      runStatus.status === 'queued'
    ) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      runStatus = await openai.beta.threads.runs.retrieve(threadId, run.id);
    }

    if (
      runStatus.status === 'failed' ||
      runStatus.status === 'cancelled' ||
      runStatus.status === 'expired'
    ) {
      throw new Error(`Run ended with status: ${runStatus.status}`);
    }

    // Get the messages after run completion
    const messages = await getMessages(threadId);
    return { runStatus, messages };
  } catch (error) {
    console.error('Error running assistant:', error);
    throw new Error('Failed to run assistant');
  }
}

// Get messages from a thread
export async function getMessages(threadId: string) {
  try {
    const messages = await openai.beta.threads.messages.list(threadId);
    return messages.data;
  } catch (error) {
    console.error('Error getting messages:', error);
    throw new Error('Failed to get messages');
  }
}

export async function generateFollowUpExerciseProgram(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  feedback: ProgramFeedback;
  userId?: string;
  programId?: string;
  previousProgram?: ExerciseProgram;
  language?: string;
}) {
  try {
    // If we have a userId and programId, update the program status to Generating
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        await programRef.update({
          status: ProgramStatus.Generating,
          updatedAt: new Date().toISOString(),
        });
        console.log('Updated program status to Generating');
      } catch (error) {
        console.error('Error updating program status to Generating:', error);
        // Continue even if status update fails
      }
    }

    // Prepare a clean list of removed exercise IDs for the prompt generation
    const removedExerciseIdsForPrompt = (
      context.feedback.removedExercises || []
    )
      .map((id) =>
        typeof id === 'string'
          ? id
          : (id as any)?.id || (id as any)?.exerciseId || null
      )
      .filter(Boolean) as string[];

    // Get exercises prompt from shared utility function, excluding removed exercises
    const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(
      context.userInfo,
      removedExerciseIdsForPrompt
    );
    console.log(
      `Prepared exercise prompt with ${exerciseCount} total exercises after excluding removed ones`
    );

    // Import the follow-up system prompt
    const systemPrompt = await import('../prompts/exerciseFollowUpPrompt');

    // Before we transform feedback data, log the raw input
    console.log('Raw program feedback input:');
    console.log('preferredExercises:', context.feedback.preferredExercises);
    console.log('removedExercises:', context.feedback.removedExercises);
    console.log('replacedExercises:', context.feedback.replacedExercises);
    console.log('addedExercises:', context.feedback.addedExercises);

    // Only include necessary exercise information (id and name) for the main feedback object
    const programFeedback = {
      preferredExercises: (context.feedback.preferredExercises || [])
        .map((id) =>
          typeof id === 'string'
            ? id
            : (id as any)?.id || (id as any)?.exerciseId || null
        )
        .filter(Boolean),
      removedExercises: (context.feedback.removedExercises || [])
        .map((id) =>
          typeof id === 'string'
            ? id
            : (id as any)?.id || (id as any)?.exerciseId || null
        )
        .filter(Boolean),
      replacedExercises: (context.feedback.replacedExercises || [])
        .map((id) =>
          typeof id === 'string'
            ? id
            : (id as any)?.id || (id as any)?.exerciseId || null
        )
        .filter(Boolean),
      addedExercises: (context.feedback.addedExercises || []).map((ex) => ({
        id: ex.id || ex.exerciseId,
        name: ex.name,
      })),
    };

    // Log feedback for debugging
    console.log('Program feedback details:');
    console.log(
      `Preferred exercises (${programFeedback.preferredExercises.length}):`
    );
    programFeedback.preferredExercises.forEach((id) =>
      console.log(`  - ${id}`)
    );

    console.log(
      `Removed exercises (${programFeedback.removedExercises.length}):`
    );
    programFeedback.removedExercises.forEach((id) => console.log(`  - ${id}`));

    console.log(
      `Replaced exercises (${programFeedback.replacedExercises.length}):`
    );
    programFeedback.replacedExercises.forEach((id) => console.log(`  - ${id}`));

    console.log(`Added exercises (${programFeedback.addedExercises.length}):`);
    programFeedback.addedExercises.forEach((ex) =>
      console.log(`  - ${ex.id}: ${ex.name}`)
    );

    // Format the feedback for inclusion in the prompt
    const formattedFeedback = `

===================================================
USER PROGRAM FEEDBACK (CRITICAL INSTRUCTIONS)
===================================================

** CRITICAL - YOU MUST FOLLOW THESE INSTRUCTIONS: **

PREFERRED EXERCISES (YOU MUST INCLUDE THESE):
${
  programFeedback.preferredExercises.length > 0
    ? programFeedback.preferredExercises.map((id) => `- ${id}`).join('\n')
    : '- None'
}

REMOVED EXERCISES (YOU MUST NOT INCLUDE THESE):
${
  programFeedback.removedExercises.length > 0
    ? programFeedback.removedExercises.map((id) => `- ${id}`).join('\n')
    : '- None'
}

REPLACED EXERCISES (YOU MUST NOT INCLUDE THESE):
${
  programFeedback.replacedExercises.length > 0
    ? programFeedback.replacedExercises.map((id) => `- ${id}`).join('\n')
    : '- None'
}

ADDED EXERCISES (YOU MUST INCLUDE THESE):
${
  programFeedback.addedExercises.length > 0
    ? programFeedback.addedExercises
        .map((ex) => `- ${ex.id}: ${ex.name}`)
        .join('\n')
    : '- None'
}

===================================================
FAILURE TO FOLLOW THE ABOVE INSTRUCTIONS EXACTLY WILL RESULT IN POOR USER EXPERIENCE
===================================================

`;

    // Get final system prompt with feedback and exercises appended
    const finalSystemPrompt =
      systemPrompt.programFollowUpSystemPrompt +
      formattedFeedback +
      exercisesPrompt;

    // Log a sample of the prompt to verify its structure
    console.log('Prompt structure summary:');
    console.log(
      `- System prompt: ${systemPrompt.programFollowUpSystemPrompt.substring(0, 100)}...`
    );
    console.log(
      `- Feedback section: ${formattedFeedback.substring(0, 200)}...`
    );
    console.log(`- Exercise database: ${exercisesPrompt.substring(0, 100)}...`);
    console.log(
      `- Total prompt length: ${finalSystemPrompt.length} characters`
    );

    // Transform context into a valid user message payload
    const userMessage = JSON.stringify({
      diagnosisData: context.diagnosisData,
      userInfo: {
        ...context.userInfo,
        // Remove equipment and exerciseEnvironments from userInfo
        equipment: undefined,
        exerciseEnvironments: undefined,
      },
      currentDay: new Date().getDay(),
      previousProgram: context.previousProgram,
      language: context.language || 'en', // Default to English if not specified
      programFeedback: programFeedback, // Use the explicitly provided feedback
    });

    // Call the OpenAI chat completion API
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1', // Using a capable model for handling complex JSON output
      messages: [
        {
          role: 'system',
          content: finalSystemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    // Extract the content from the response
    const rawContent = response.choices[0].message.content;
    if (!rawContent) {
      throw new Error('No response content from chat completion');
    }

    console.log(
      `Response first 100 chars: "${rawContent.substring(0, 100)}..."`
    );
    console.log(`Response length: ${rawContent.length} characters`);

    // Parse the response as JSON
    let program: ExerciseProgram;
    try {
      program = JSON.parse(rawContent) as ExerciseProgram;

      // Add createdAt timestamp to each program week
      const currentDate = new Date().toISOString();
      if (program.program && Array.isArray(program.program)) {
        program.program.forEach((week) => {
          week.createdAt = currentDate;
        });
      }

      // Log extracted exercises from the response for verification
      console.log(
        '\n----- EXERCISE VALIDATION (CHECKING FEEDBACK COMPLIANCE) -----'
      );

      // Collect all exercise IDs from the response
      const includedExerciseIds = new Set<string>();
      if (program.program && Array.isArray(program.program)) {
        program.program.forEach((week) => {
          week.days.forEach((day) => {
            if (
              !day.isRestDay &&
              day.exercises &&
              Array.isArray(day.exercises)
            ) {
              day.exercises.forEach((exercise) => {
                if (exercise.exerciseId) {
                  includedExerciseIds.add(exercise.exerciseId);
                }
              });
            }
          });
        });
      }

      // Check if preferred exercises are included
      console.log('\nPREFERRED EXERCISES (should all be included):');
      programFeedback.preferredExercises.forEach((id) => {
        const isIncluded = includedExerciseIds.has(id);
        console.log(`  - ${id}: ${isIncluded ? '✅ INCLUDED' : '❌ MISSING'}`);
      });

      // Check if removed exercises are excluded
      console.log('\nREMOVED EXERCISES (should NOT be included):');
      programFeedback.removedExercises.forEach((id) => {
        const isIncluded = includedExerciseIds.has(id);
        console.log(
          `  - ${id}: ${isIncluded ? '❌ WRONGLY INCLUDED' : '✅ PROPERLY EXCLUDED'}`
        );
      });

      // Check if replaced exercises are excluded
      console.log('\nREPLACED EXERCISES (should NOT be included):');
      programFeedback.replacedExercises.forEach((id) => {
        const isIncluded = includedExerciseIds.has(id);
        console.log(
          `  - ${id}: ${isIncluded ? '❌ WRONGLY INCLUDED' : '✅ PROPERLY EXCLUDED'}`
        );
      });

      // Check if added exercises are included
      console.log('\nADDED EXERCISES (should all be included):');
      programFeedback.addedExercises.forEach((ex) => {
        const id = ex.id;
        const isIncluded = includedExerciseIds.has(id);
        console.log(
          `  - ${id} (${ex.name}): ${isIncluded ? '✅ INCLUDED' : '❌ MISSING'}`
        );
      });

      // List all exercises in the response
      console.log('\nALL EXERCISES IN RESPONSE:');
      console.log([...includedExerciseIds].join(', '));

      console.log('\n----- END VALIDATION -----\n');
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error(
        'First 200 characters of raw response:',
        rawContent.substring(0, 200)
      );
      throw new Error(
        `Failed to parse response as JSON: ${parseError.message}`
      );
    }

    // Add program type and target areas to the response
    program.type = context.diagnosisData.programType;
    program.targetAreas = context.userInfo.targetAreas;

    // If we have a userId and programId, update the program document
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        // Atomically add the new week document and mark the parent program as Done
        const batch = adminDb.batch();

        // New week document reference (auto-ID)
        const newWeekRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId)
          .collection('programs')
          .doc();

        batch.set(newWeekRef, {
          ...program,
          createdAt: new Date().toISOString(),
        });

        batch.update(programRef, {
          status: ProgramStatus.Done,
          updatedAt: new Date().toISOString(),
          active: true, // Set the new program as active
        });

        await batch.commit();

        console.log('Successfully updated program document and set as active');
      } catch (error) {
        console.error('Error updating program document:', error);
        // Update status to error if save fails
        try {
          if (context.userId && context.programId) {
            const programRef = adminDb
              .collection('users')
              .doc(context.userId)
              .collection('programs')
              .doc(context.programId);

            await programRef.update({
              status: ProgramStatus.Error,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (statusError) {
          console.error('Error updating program status to error:', statusError);
        }
        throw error;
      }
    }

    return program;
  } catch (error) {
    console.error('Error generating follow-up exercise program:', error);
    // If we have a userId and programId, update the status to error
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        await programRef.update({
          status: ProgramStatus.Error,
          updatedAt: new Date().toISOString(),
        });
      } catch (statusError) {
        console.error('Error updating program status to error:', statusError);
      }
    }
    throw new Error('Failed to generate follow-up exercise program');
  }
}

export async function generateExerciseProgramWithModel(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  userId?: string;
  programId?: string;
  previousProgram?: ExerciseProgram;
  language?: string;
}) {
  try {
    // If we have a userId and programId, update the program status to Generating
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        await programRef.update({
          status: ProgramStatus.Generating,
          updatedAt: new Date().toISOString(),
        });
        console.log('Updated program status to Generating');
      } catch (error) {
        console.error('Error updating program status to Generating:', error);
        // Continue even if status update fails
      }
    }

    // Get exercises prompt from shared utility function
    const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(
      context.userInfo
    );
    console.log(
      `Prepared exercise prompt with ${exerciseCount} total exercises`
    );

    // Import the program system prompt
    const { programSystemPrompt } = await import('../prompts/exercisePrompt');

    // Get final system prompt with exercises appended to the end
    const finalSystemPrompt = programSystemPrompt + exercisesPrompt;

    // Transform context into a valid user message payload
    const userMessage = JSON.stringify({
      diagnosisData: context.diagnosisData,
      userInfo: {
        ...context.userInfo,
        // Remove equipment and exerciseEnvironments from userInfo
        equipment: undefined,
        exerciseEnvironments: undefined,
      },
      currentDay: new Date().getDay(),
      previousProgram: context.previousProgram,
      language: context.language || 'en', // Default to English if not specified
    });

    // Call the OpenAI chat completion API
    const response = await openai.chat.completions.create({
      model: 'gpt-4.1', // Using a capable model for handling complex JSON output
      messages: [
        {
          role: 'system',
          content: finalSystemPrompt,
        },
        {
          role: 'user',
          content: userMessage,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    // Extract the content from the response
    const rawContent = response.choices[0].message.content;
    if (!rawContent) {
      throw new Error('No response content from chat completion');
    }

    console.log(
      `Response first 100 chars: "${rawContent.substring(0, 100)}..."`
    );
    console.log(`Response length: ${rawContent.length} characters`);

    // Parse the response as JSON
    let program: ExerciseProgram;
    try {
      program = JSON.parse(rawContent) as ExerciseProgram;

      // Add createdAt timestamp to each program week
      const currentDate = new Date().toISOString();
      if (program.program && Array.isArray(program.program)) {
        program.program.forEach((week) => {
          week.createdAt = currentDate;
        });
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error(
        'First 200 characters of raw response:',
        rawContent.substring(0, 200)
      );
      throw new Error(
        `Failed to parse response as JSON: ${parseError.message}`
      );
    }

    // Add program type and target areas to the response
    program.type = context.diagnosisData.programType;
    program.targetAreas = context.userInfo.targetAreas;

    // If we have a userId and programId, update the program document
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        // Atomically add the new week document and mark the parent program as Done
        const batch = adminDb.batch();

        // Deactivate other programs of the same type
        const programType = context.diagnosisData.programType;
        if (programType) {
          const otherActiveProgramsQuery = adminDb
            .collection('users')
            .doc(context.userId)
            .collection('programs')
            .where('active', '==', true)
            .where('type', '==', programType);

          const otherActiveProgramsSnapshot =
            await otherActiveProgramsQuery.get();
          otherActiveProgramsSnapshot.forEach((doc) => {
            // Ensure we don't deactivate the program we are currently activating
            if (doc.id !== context.programId) {
              batch.update(doc.ref, {
                active: false,
                updatedAt: new Date().toISOString(),
              });
              console.log(
                `Deactivating program ${doc.id} of type ${programType}`
              );
            }
          });
        } else {
          console.warn(
            'Program type not available, skipping deactivation of other programs.'
          );
        }

        // New week document reference (auto-ID)
        const newWeekRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId)
          .collection('programs')
          .doc();

        batch.set(newWeekRef, {
          ...program,
          createdAt: new Date().toISOString(),
        });

        batch.update(programRef, {
          status: ProgramStatus.Done,
          updatedAt: new Date().toISOString(),
          active: true, // Set the new program as active
        });

        await batch.commit();

        console.log('Successfully updated program document and set as active');
      } catch (error) {
        console.error('Error updating program document:', error);
        // Update status to error if save fails
        try {
          if (context.userId && context.programId) {
            const programRef = adminDb
              .collection('users')
              .doc(context.userId)
              .collection('programs')
              .doc(context.programId);

            await programRef.update({
              status: ProgramStatus.Error,
              updatedAt: new Date().toISOString(),
            });
          }
        } catch (statusError) {
          console.error('Error updating program status to error:', statusError);
        }
        throw error;
      }
    }

    return program;
  } catch (error) {
    console.error('Error generating exercise program with model:', error);
    // If we have a userId and programId, update the status to error
    if (context.userId && context.programId) {
      try {
        const programRef = adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId);

        await programRef.update({
          status: ProgramStatus.Error,
          updatedAt: new Date().toISOString(),
        });
      } catch (statusError) {
        console.error('Error updating program status to error:', statusError);
      }
    }
    throw new Error('Failed to generate exercise program with model');
  }
}

// Non-streaming chat completion with OpenAI
export async function getChatCompletion({
  threadId,
  messages,
  systemMessage,
  userMessage,
  modelName = 'gpt-4.1',
}: {
  threadId: string;
  messages: any[];
  systemMessage: string;
  userMessage: any;
  modelName?: string;
}) {
  try {
    console.log(`[getChatCompletion] Starting with model: ${modelName}`);

    // Re-introduce historical messages
    const formattedMessages = formatMessagesForChatCompletion(messages);

    // Add the system message at the beginning
    formattedMessages.unshift({
      role: 'system' as const,
      content: systemMessage,
    });

    // Construct the user message content
    let userMessageContent = '';
    if (typeof userMessage === 'string') {
      userMessageContent = userMessage;
    } else if (typeof userMessage === 'object' && userMessage !== null) {
      if (userMessage.message && typeof userMessage.message === 'string') {
        userMessageContent = `User input: "${userMessage.message}"`;
      } else {
        userMessageContent = 'User input: (no direct text provided)';
      }

      if (
        userMessage.diagnosisAssistantResponse &&
        Object.keys(userMessage.diagnosisAssistantResponse).length > 0
      ) {
        // Append the structured context if it exists and is not empty
        // Omit fields that are AI conclusions or UI constructs, not primary history data
        const {
          followUpQuestions,
          targetAreas,
          programType,
          informationalInsights,
          // assessmentComplete and redFlagsPresent might also be considered AI conclusions,
          // but they can be useful for the AI to know its own previous state flags.
          // Let's keep them for now unless they cause issues.
          ...contextualInfo
        } = userMessage.diagnosisAssistantResponse;
        userMessageContent += `\n\n<<PREVIOUS_CONTEXT_JSON>>\n${JSON.stringify(contextualInfo, null, 2)}\n<<PREVIOUS_CONTEXT_JSON_END>>`;
      }

      // Add selected body group and part information
      if (
        userMessage.selectedBodyGroupName &&
        typeof userMessage.selectedBodyGroupName === 'string'
      ) {
        userMessageContent += `\nSelected Body Group: ${userMessage.selectedBodyGroupName}`;
      }
      if (
        userMessage.selectedBodyPart &&
        typeof userMessage.selectedBodyPart === 'string' &&
        userMessage.selectedBodyPart !== 'no body part of body group selected'
      ) {
        userMessageContent += `\nSelected Specific Body Part: ${userMessage.selectedBodyPart}`;
      } else if (
        userMessage.selectedBodyPart ===
          'no body part of body group selected' &&
        !userMessage.selectedBodyGroupName
      ) {
        // Only add this if group name is also missing, to avoid redundancy if group is present
        userMessageContent += `\nSelected Specific Body Part: ${userMessage.selectedBodyPart}`;
      }

      if (
        userMessage.bodyPartsInSelectedGroup &&
        Array.isArray(userMessage.bodyPartsInSelectedGroup) &&
        userMessage.bodyPartsInSelectedGroup.length > 0
      ) {
        userMessageContent += `\nBody Parts In Selected Group: [${userMessage.bodyPartsInSelectedGroup.join(', ')}]`;
      }

      if (userMessage.language && typeof userMessage.language === 'string') {
        userMessageContent += `\nLanguage Preference: ${userMessage.language}`;
      }
    } else {
      userMessageContent = JSON.stringify(userMessage);
    }
    console.log(
      '[getChatCompletion] Constructed user message content (for current turn):',
      userMessageContent
    );

    // Add the new user message to the history
    formattedMessages.push({
      role: 'user' as const,
      content: userMessageContent,
    });

    console.log(
      '[getChatCompletion] Full formattedMessages (with history) being sent to OpenAI API:',
      JSON.stringify(formattedMessages, null, 2)
    );

    // Call OpenAI chat completion
    const response = await openai.chat.completions.create({
      model: modelName,
      messages: formattedMessages, // Use the full history + current message
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('[getChatCompletion] Error:', error);
    throw error;
  }
}
