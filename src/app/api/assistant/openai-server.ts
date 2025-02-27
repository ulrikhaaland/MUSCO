import OpenAI from 'openai';
import { ChatPayload, DiagnosisAssistantResponse } from '../../types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '@/app/shared/types';
import endent from 'endent';
import { adminDb } from '@/app/firebase/admin';
import { ExerciseProgram, ProgramStatus } from '@/app/types/program';
import { recoverySystemPrompt } from '../prompts/recovery';
import { programSystemPrompt } from '../prompts/exercise';
import { collection, addDoc } from 'firebase/firestore';

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
    console.log('Adding message to thread:', content);
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
        console.error('Stream error:', error);
        throw error;
      });

    await stream.done();
    console.log('Stream completed successfully');
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

export async function generateFollowUpQuestions(context: {
  messages: { role: string; content: string }[];
  bodyGroup: string;
  bodyPart: string;
  previousQuestions?: {
    questions: {
      title: string;
      description: string;
      question: string;
    }[];
    selected?: string;
  };
}) {
  try {
    const systemPrompt = `You are a follow-up question generator for a musculoskeletal diagnosis app.

Your task is to generate 3 targeted follow-up questions to help the user better identify the cause of their discomfort. The questions should guide the user through simple physical actions or inquiries to gather more information about their condition.

Guidelines:
1. Questions should flow naturally from the conversation history and current focus area.
2. Avoid repeating previously suggested questions.
3. Focus on the current body group or part being discussed.
4. Each question should explore different diagnostic angles:
   - Symptom specifics (e.g., nature, duration, triggers of pain).
   - Physical tests (e.g., movements to perform, actions that provoke pain).
   - Possible causes (e.g., strain, posture, recent activities).
5. Ensure questions are specific, actionable, and formatted as if the user is directly asking the assistant for guidance.

Question Formatting:
- The "question" field must be phrased in first-person, where the user is asking the assistant for guidance on what to do next (e.g., "Should I try bending sideways to see if it changes the intensity of my discomfort?").
- The "title" should be a short, engaging summary.

Examples:
- Title: "Specific Movement Test"
- Question: "Should I try bending sideways to see if it changes the intensity of my discomfort?"

- Title: "Core Muscle Tension Test"
- Question: "Should I try tightening my abdominal muscles to see if it changes my discomfort?"

Return exactly 3 questions in the following JSON format:
{
  "followUpQuestions": [
    {
      "title": "Brief, engaging title",
      "question": "The actual question phrased from the user's perspective asking for guidance"
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: JSON.stringify({
            bodyGroup: context.bodyGroup,
            bodyPart: context.bodyPart,
            conversationHistory: context.messages,
            previousQuestions: context.previousQuestions,
          }),
        },
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    return JSON.parse(response);
  } catch (error) {
    console.error('Error generating follow-up questions:', error);
    throw new Error('Failed to generate follow-up questions');
  }
}

interface TextContent {
  type: 'text';
  text: {
    value: string;
    annotations: any[];
  };
}

export async function generateExerciseProgram(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
}) {
  try {
    const assistantId =
      context.diagnosisData.programType === ProgramType.Exercise
        ? 'asst_tqUYRDRatboM8tTqgJUV15p9'
        : 'asst_KqxD6OX9IRFXmOFdS6QtpCP4';

    console.log(context.diagnosisData.programType);
    console.log(assistantId);
    // Get the assistant
    const assistant = await getOrCreateAssistant(assistantId);

    // Create a new thread
    const thread = await createThread();

    // Transform context into a valid ChatPayload
    const payload: ChatPayload = {
      message: JSON.stringify(context),
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
    const response = JSON.parse(messageContent.text.value);
    return response;
  } catch (error) {
    console.error('Error generating exercise program:', error);
    throw new Error('Failed to generate exercise program');
  }
}

export async function generateExerciseProgramWithModel(context: {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
  userId?: string;
  programId?: string;
}) {
  console.log('Generating exercise program with model');
  const prompt =
    context.diagnosisData.programType === ProgramType.Exercise
      ? programSystemPrompt
      : recoverySystemPrompt;

  // If we have a userId and programId, update the program status
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
    } catch (error) {
      console.error('Error updating program status:', error);
      // Continue even if status update fails
    }
  }

  try {
    const completion = await openai.chat.completions.create({
      model: 'o1-2024-12-17',
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: prompt,
        },
        {
          role: 'user',
          content: JSON.stringify({
            diagnosisData: context.diagnosisData,
            userInfo: context.userInfo,
            currentDay: new Date().getDay(),
          }),
        },
      ],
    });

    const response = completion.choices[0].message.content;
    if (!response) {
      throw new Error('No response from OpenAI');
    }

    const program = JSON.parse(response) as ExerciseProgram;
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
        await programRef.update({
          status: ProgramStatus.Done,
          updatedAt: new Date().toISOString(),
        });
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
