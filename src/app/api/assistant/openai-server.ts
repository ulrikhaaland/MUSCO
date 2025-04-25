import OpenAI from 'openai';
import { ChatPayload, DiagnosisAssistantResponse } from '../../types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '@/app/shared/types';
import { adminDb } from '@/app/firebase/admin';
import { ProgramStatus, ExerciseProgram } from '@/app/types/program';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
      handleStreamEnd(error instanceof Error ? error : new Error(String(error)));
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

export async function generateExerciseProgram(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  userId?: string;
  programId?: string;
  assistantId?: string;
  isFollowUp?: boolean;
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

    // Get the assistant
    const assistant = await getOrCreateAssistant(
      context.diagnosisData.programType === ProgramType.Exercise
        ? 'asst_fna9UiwoPMHC8MQXxNx0npU4'
        : 'asst_KqxD6OX9IRFXmOFdS6QtpCP4'
    );

    // Create a new thread
    const thread = await createThread();

    // Determine language - default to 'en' if not specified
    const language = context.language || 'en';

    // Transform context into a valid ChatPayload
    const payload: ChatPayload = {
      message: JSON.stringify({
        diagnosisData: context.diagnosisData,
        userInfo: context.userInfo,
        currentDay: new Date().getDay(),
        previousProgram: context.previousProgram,
        isFollowUp: context.isFollowUp,
        language: language, // Add language parameter to the payload
      }),
      selectedBodyGroupName: '', // Not needed for exercise program
      bodyPartsInSelectedGroup: [], // Not needed for exercise program
    };

    // Add the message with the context to the thread
    await addMessage(thread.id, payload);

    // Run the assistant and wait for completion
    const { messages } = await runAssistant(thread.id, assistant.id);

    // Get the last message (the assistant's response)
    const lastMessage = messages[0];
    if (!lastMessage) {
      throw new Error('No response from assistant');
    }

    // Get the message content
    const messageContent = lastMessage.content[0];
    if (
      !messageContent ||
      typeof messageContent !== 'object' ||
      !('text' in messageContent)
    ) {
      throw new Error('Invalid message content format');
    }

    // Parse the response as JSON
    console.log(
      `Response first 100 chars: "${messageContent.text.value.substring(
        0,
        100
      )}..."`
    );
    console.log(
      `Response length: ${messageContent.text.value.length} characters`
    );
    console.log(`Complete response: ${messageContent.text.value}`);

    // Helper function to extract JSON from text
    const extractJsonFromText = (text: string): string => {
      // Try to find content between JSON code blocks (```json ... ```)
      const jsonBlockMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonBlockMatch && jsonBlockMatch[1]) {
        console.log('Found JSON in code block, extracting...');
        return jsonBlockMatch[1].trim();
      }

      // Try to find content that looks like a JSON object
      const jsonObjectMatch = text.match(/(\{[\s\S]*\})/);
      if (jsonObjectMatch && jsonObjectMatch[1]) {
        console.log('Found JSON object pattern, extracting...');
        return jsonObjectMatch[1].trim();
      }

      // Return the original text if no JSON-like content found
      return text;
    };

    let response;
    try {
      response = JSON.parse(messageContent.text.value);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error(
        'First 200 characters of raw response:',
        messageContent.text.value.substring(0, 200)
      );

      // Try to extract JSON from text and parse again
      const extractedJson = extractJsonFromText(messageContent.text.value);
      console.log('Attempting to parse extracted content...');

      try {
        response = JSON.parse(extractedJson);
        console.log('Successfully parsed extracted JSON');
      } catch (extractError) {
        console.error('Failed to parse extracted content:', extractError);
        throw new Error(
          `Failed to parse response as JSON: ${parseError.message}`
        );
      }
    }

    // Add program type and target areas to the response
    const program = response as ExerciseProgram;
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

        // For follow-up programs, we don't change the active status of existing programs
        // Only for new programs do we set others to inactive
        if (!context.isFollowUp) {
          // Set all other programs of the same type to inactive
          const programType = context.diagnosisData.programType;
          const userProgramsRef = adminDb
            .collection('users')
            .doc(context.userId)
            .collection('programs');

          // Query all programs with the same type
          const sameTypeProgramsSnapshot = await userProgramsRef
            .where('type', '==', programType)
            .where('active', '==', true)
            .get();

          // Batch update to set all of them to inactive
          if (!sameTypeProgramsSnapshot.empty) {
            const batch = adminDb.batch();
            sameTypeProgramsSnapshot.docs.forEach((doc) => {
              batch.update(doc.ref, { active: false });
            });
            await batch.commit();
            console.log(
              `Set ${sameTypeProgramsSnapshot.size} ${programType} programs to inactive`
            );
          }
        }

        // Create a new document in the programs subcollection
        await adminDb
          .collection('users')
          .doc(context.userId)
          .collection('programs')
          .doc(context.programId)
          .collection('programs')
          .add({
            ...program,
            createdAt: new Date().toISOString(),
          });

        // Update the main program document status
        // For follow-ups, don't modify the active status
        if (context.isFollowUp) {
          await programRef.update({
            status: ProgramStatus.Done,
            updatedAt: new Date().toISOString(),
          });
        } else {
          await programRef.update({
            status: ProgramStatus.Done,
            updatedAt: new Date().toISOString(),
            active: true, // Set the new program as active
          });
        }

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
    console.error('Error generating exercise program:', error);
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
    throw new Error('Failed to generate exercise program');
  }
}

export async function generateExerciseProgramWithModel(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  userId?: string;
  programId?: string;
  assistantId?: string;
  isFollowUp?: boolean;
  previousProgram?: ExerciseProgram;
  language?: string;
}) {
  return generateExerciseProgram(context);
}
