import OpenAI from 'openai';
import { ChatPayload, DiagnosisAssistantResponse } from '../../types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '@/app/shared/types';
import { adminDb } from '@/app/firebase/admin';
import { ProgramStatus, ExerciseProgram, Exercise } from '@/app/types/program';
import { loadServerExercises } from '@/app/services/server-exercises';
import { ProgramFeedback } from '@/app/components/ui/ProgramFeedbackQuestionnaire';

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

// Utility function to prepare exercises prompt for the LLM
async function prepareExercisesPrompt(userInfo: ExerciseQuestionnaireAnswers): Promise<{
  exercisesPrompt: string;
  exerciseCount: number;
}> {
  const targetAreas = userInfo.targetAreas;
  const equipment = userInfo.equipment || [];
  const exerciseEnvironment = userInfo.exerciseEnvironments || 'gym';
  const exerciseModalities = userInfo.exerciseModalities || '';

  equipment.push('bodyweight');

  // Prepare body parts to load, always include warmups
  const bodyPartsToLoad = [...targetAreas, 'Warmup'];
  
  // Keep cardio separate so we can load it without equipment filtering
  const needsCardio = exerciseModalities.toLowerCase().includes('cardio');

  console.log(`Loading exercises for body parts: ${bodyPartsToLoad.join(', ')}`);
  console.log(`User environment: ${exerciseEnvironment}, equipment: ${equipment.join(', ')}`);
  console.log(`User wants cardio: ${needsCardio}`);

  // Load strength and warmup exercises with equipment filtering
  let availableExercises: Exercise[] = [];
  if (exerciseEnvironment.toLowerCase() === 'custom') {
    availableExercises = await loadServerExercises({
      bodyParts: bodyPartsToLoad,
      includeOriginals: false,
      onlyLoadMissingOriginals: true,
      equipment: equipment,
      includeBodyweightWarmups: true, // Include bodyweight warmups for custom environment
    });
  } else {
    availableExercises = await loadServerExercises({
      bodyParts: bodyPartsToLoad,
      includeOriginals: false,
      onlyLoadMissingOriginals: true,
      includeBodyweightWarmups: false, // Don't include extra bodyweight warmups for non-custom environments
    });
  }

  // Load cardio exercises separately without equipment filtering if needed
  let cardioExercises: Exercise[] = [];
  if (needsCardio) {
    cardioExercises = await loadServerExercises({
      bodyParts: ['Cardio'],
      includeOriginals: false,
      onlyLoadMissingOriginals: true,
      // No equipment filtering for cardio - we'll handle that manually
    });
    console.log(`Loaded ${cardioExercises.length} cardio exercises`);
  }

  // Combine exercise arrays
  availableExercises = [...availableExercises, ...cardioExercises];

  console.log(
    `Loaded ${availableExercises.length} exercises for prompt construction`
  );

  // Separate warmup exercises from other exercises
  const warmupExercises = availableExercises.filter(
    (ex) => ex.bodyPart === 'Warmup'
  );
  
  // Filter cardio exercises based on user preferences if modalities includes cardio
  let filteredCardioExercises: Exercise[] = [];
  if (needsCardio) {
    // Get all cardio exercises first
    const allCardioExercises = availableExercises.filter((ex) => ex.bodyPart === 'Cardio');
    console.log(`Found ${allCardioExercises.length} total cardio exercises before filtering`);
    
    // Apply filters based on user preferences
    if (userInfo.cardioType && allCardioExercises.length > 0) {
      // Extract the cardio type from userInfo (Running, Cycling, Rowing)
      const cardioType = userInfo.cardioType.toLowerCase();
      
      // Extract the cardio environment preference
      const cardioEnvironment = userInfo.cardioEnvironment?.toLowerCase() || '';
      
      // Get user's equipment
      const userEquipment = userInfo.equipment || [];
      const userEquipmentLowerCase = userEquipment.map(item => item.toLowerCase());
      
      // Calculate user's fitness level based on questionnaire answers
      // This affects whether we include interval training
      const includeIntervals = shouldIncludeIntervals(userInfo);
      
      // Filter cardio exercises based on type, environment, and training style
      filteredCardioExercises = allCardioExercises.filter((ex) => {
        const name = ex.name?.toLowerCase() || '';
        const environment = (ex as any).environment?.toLowerCase() || '';
        const exerciseEquipment = (ex.equipment || []).map(item => item.toLowerCase());
        
        // Check if exercise is interval-based (contains "interval" in name)
        const isIntervalExercise = name.includes('interval') || name.includes('4x4');
        
        // If user's fitness level doesn't support intervals, skip interval exercises
        if (isIntervalExercise && !includeIntervals) {
          return false;
        }
        
        // Check if the exercise name contains the selected cardio type
        const matchesType = 
          (cardioType.includes('running') && name.includes('running')) || 
          (cardioType.includes('cycling') && (name.includes('cycling') || name.includes('bike'))) || 
          (cardioType.includes('rowing') && name.includes('rowing')) || 
          cardioType === '';  // If no specific type selected, include all
        
        // Check if the exercise environment matches the selected environment
        // For "Both" or "Inside and Outside", include both indoor and outdoor exercises
        const matchesEnvironment = 
          cardioEnvironment === 'both' || 
          cardioEnvironment.includes('inside and outside') || 
          cardioEnvironment === '' ? true : 
          cardioEnvironment.includes('inside') ? environment.includes('indoor') : 
          cardioEnvironment.includes('outside') ? environment.includes('outdoor') : 
          true; // If no specific environment, include all
          
        // Check if user has the required equipment for this exercise
        let hasRequiredEquipment = true;
        
        // Only check equipment requirements for INDOOR exercises
        // Outdoor exercises like running outside don't need special equipment
        if (environment.includes('indoor')) {
          // Get the required equipment for this exercise (if any)
          if (exerciseEquipment.length > 0) {
            // Check specific equipment needs based on equipment array, not just names
            const needsTreadmill = exerciseEquipment.some(eq => eq.includes('treadmill'));
            const needsBike = exerciseEquipment.some(eq => eq.includes('bike') || eq.includes('cycling'));
            const needsRower = exerciseEquipment.some(eq => eq.includes('rowing') || eq.includes('rower'));
            const needsElliptical = exerciseEquipment.some(eq => eq.includes('elliptical'));
            const needsJumpRope = exerciseEquipment.some(eq => eq.includes('jump rope'));
            
            // Check if user has the required equipment
            if (needsTreadmill && !userEquipmentLowerCase.some(item => item.includes('treadmill'))) {
              console.log(`Filtering out exercise "${ex.name}" - requires treadmill`);
              hasRequiredEquipment = false;
            } else if (needsBike && !userEquipmentLowerCase.some(item => item.includes('exercise bike') || item.includes('stationary bike'))) {
              console.log(`Filtering out exercise "${ex.name}" - requires exercise bike`);
              hasRequiredEquipment = false;
            } else if (needsRower && !userEquipmentLowerCase.some(item => item.includes('rowing machine'))) {
              console.log(`Filtering out exercise "${ex.name}" - requires rowing machine`);
              hasRequiredEquipment = false;
            } else if (needsElliptical && !userEquipmentLowerCase.some(item => item.includes('elliptical'))) {
              console.log(`Filtering out exercise "${ex.name}" - requires elliptical`);
              hasRequiredEquipment = false;
            } else if (needsJumpRope && !userEquipmentLowerCase.some(item => item.includes('jump rope'))) {
              console.log(`Filtering out exercise "${ex.name}" - requires jump rope`);
              hasRequiredEquipment = false;
            }
          }
        }
        
        return matchesType && matchesEnvironment && hasRequiredEquipment;
      });
      
      console.log(`Filtered cardio exercises from ${allCardioExercises.length} to ${filteredCardioExercises.length} based on user preferences`);
      console.log(`User preferences: Type=${cardioType}, Environment=${cardioEnvironment}, Include Intervals=${includeIntervals}`);
      console.log(`User equipment: ${userEquipment.join(', ')}`);
      
      // Log the names of the selected cardio exercises for debugging
      console.log("Selected cardio exercises:");
      filteredCardioExercises.forEach(ex => console.log(`- ${ex.name} (${(ex as any).environment || 'unknown'}) [Equipment: ${(ex.equipment || []).join(', ')}]`));
    } else {
      // If no specific preferences, include all cardio exercises
      filteredCardioExercises = allCardioExercises;
    }
  }
  
  // Filter other exercises (not warmups or cardio)
  const otherExercises = availableExercises.filter(
    (ex) => ex.bodyPart !== 'Warmup' && ex.bodyPart !== 'Cardio'
  );

  console.log(
    `Found ${warmupExercises.length} warmup exercises, ${filteredCardioExercises.length} cardio exercises, and ${otherExercises.length} regular exercises`
  );

  // Format exercises by body part for the LLM
  const exercisesByBodyPart: Record<string, Exercise[]> = {};

  // Add 'Warmup' as the first category if we have warmup exercises
  if (warmupExercises.length > 0) {
    exercisesByBodyPart['Warmup'] = warmupExercises;
  }
  
  // Add 'Cardio' category if we have cardio exercises
  if (filteredCardioExercises.length > 0) {
    exercisesByBodyPart['Cardio'] = filteredCardioExercises;
  }

  // Group the remaining exercises by body part
  otherExercises.forEach((exercise) => {
    const bodyPart =
      exercise.bodyPart || exercise.targetBodyParts?.[0] || 'Other';

    if (!exercisesByBodyPart[bodyPart]) {
      exercisesByBodyPart[bodyPart] = [];
    }

    exercisesByBodyPart[bodyPart].push(exercise);
  });

  // Log the number of exercises per category
  console.log(`------- Exercise Count By Body Part -------`);
  let totalExerciseCount = 0;
  Object.entries(exercisesByBodyPart).forEach(([bodyPart, exercises]) => {
    console.log(`${bodyPart}: ${exercises.length} exercises`);
    totalExerciseCount += exercises.length;
  });
  console.log(`Total exercises: ${totalExerciseCount}`);
  console.log(`-----------------------------------------`);

  // Format exercises as JSON for the prompt
  let exercisesPrompt = '\n\nEXERCISE DATABASE:\n';

  // Format each body part and its exercises
  Object.entries(exercisesByBodyPart).forEach(([bodyPart, exercises]) => {
    exercisesPrompt += `{\n  "bodyPart": "${bodyPart}",\n  "exercises": [\n`;

    // Add each exercise with necessary fields
    exercises.forEach((exercise, index) => {
      exercisesPrompt += `    {\n`;
      exercisesPrompt += `      "id": "${exercise.id || exercise.exerciseId}",\n`;
      exercisesPrompt += `      "name": "${exercise.name || ''}",\n`;
      exercisesPrompt += `      "difficulty": "${exercise.difficulty || 'beginner'}",\n`;

      // Remove equipment information from the appended exercises
      // Equipment is already filtered before this point

      // If it's a warmup exercise, explicitly add the category
      if (bodyPart === 'Warmup') {
        exercisesPrompt += `      "category": "warmup",\n`;
      }
      
      // If it's a cardio exercise, add relevant cardio properties
      if (bodyPart === 'Cardio') {
        exercisesPrompt += `      "environment": "${(exercise as any).environment || 'indoor'}",\n`;
        if ((exercise as any).heartRateZone) {
          exercisesPrompt += `      "heartRateZone": "${(exercise as any).heartRateZone}",\n`;
        }
        if ((exercise as any).intervalDuration) {
          exercisesPrompt += `      "intervalDuration": ${(exercise as any).intervalDuration},\n`;
        }
        if ((exercise as any).duration) {
          exercisesPrompt += `      "duration": ${(exercise as any).duration},\n`;
        }
      }

      // Add exercise category if it exists (for warmups)
      if ((exercise as any).category) {
        exercisesPrompt += `      "category": "${(exercise as any).category}",\n`;
      }

      // Add contraindications if available
      if (
        exercise.contraindications &&
        exercise.contraindications.length > 0
      ) {
        exercisesPrompt += `      "contraindications": [\n`;
        exercise.contraindications.forEach((contra, i) => {
          exercisesPrompt += `        "${contra}"${i < exercise.contraindications!.length - 1 ? ',' : ''}\n`;
        });
        exercisesPrompt += `      ],\n`;
      } else {
        exercisesPrompt += `      "contraindications": ["Injury", "Pain during movement"],\n`;
      }

      exercisesPrompt += `    }${index < exercises.length - 1 ? ',' : ''}\n`;
    });

    exercisesPrompt += `  ]\n},\n`;
  });

  return { exercisesPrompt, exerciseCount: totalExerciseCount };
}

// Helper function to determine if user should get interval training 
// based on their fitness level and exercise history
function shouldIncludeIntervals(userInfo: ExerciseQuestionnaireAnswers): boolean {
  // Only include intervals for users with some exercise experience
  const lowExperienceLevels = [
    'No exercise in the past year',
    'Less than once a month'
  ];
  
  // Check if user has a low experience level
  const hasLowExperience = lowExperienceLevels.some(level => 
    userInfo.lastYearsExerciseFrequency.includes(level)
  );
  
  // Don't include intervals for beginners
  if (hasLowExperience) {
    return false;
  }
  
  // Check age - be more conservative with older age groups
  const isOlderAgeGroup = userInfo.age.includes('60') || userInfo.age.includes('70');
  
  // For older age groups with limited experience, avoid intervals
  if (isOlderAgeGroup && userInfo.lastYearsExerciseFrequency.includes('1-2 times')) {
    return false;
  }
  
  // Include intervals for everyone else
  return true;
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

    // Get exercises prompt from shared utility function
    const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(context.userInfo);
    console.log(`Prepared exercise prompt with ${exerciseCount} total exercises`);

    // Import the follow-up system prompt
    const systemPrompt = await import('../prompts/exerciseFollowUpPrompt');

    // Before we transform feedback data, log the raw input
    console.log('Raw program feedback input:');
    console.log('preferredExercises:', context.feedback.preferredExercises);
    console.log('removedExercises:', context.feedback.removedExercises);
    console.log('replacedExercises:', context.feedback.replacedExercises);
    console.log('addedExercises:', context.feedback.addedExercises);

    // Only include necessary exercise information (id and name)
    const programFeedback = {
      preferredExercises: (context.feedback.preferredExercises || [])
        .map(id => typeof id === 'string' ? id : (id as any)?.id || (id as any)?.exerciseId || null)
        .filter(Boolean),
      removedExercises: (context.feedback.removedExercises || [])
        .map(id => typeof id === 'string' ? id : (id as any)?.id || (id as any)?.exerciseId || null)
        .filter(Boolean),
      replacedExercises: (context.feedback.replacedExercises || [])
        .map(id => typeof id === 'string' ? id : (id as any)?.id || (id as any)?.exerciseId || null)
        .filter(Boolean),
      addedExercises: (context.feedback.addedExercises || []).map(ex => ({
        id: ex.id || ex.exerciseId,
        name: ex.name
      }))
    };

    // Log feedback for debugging
    console.log('Program feedback details:');
    console.log(`Preferred exercises (${programFeedback.preferredExercises.length}):`);
    programFeedback.preferredExercises.forEach(id => console.log(`  - ${id}`));

    console.log(`Removed exercises (${programFeedback.removedExercises.length}):`);
    programFeedback.removedExercises.forEach(id => console.log(`  - ${id}`));

    console.log(`Replaced exercises (${programFeedback.replacedExercises.length}):`);
    programFeedback.replacedExercises.forEach(id => console.log(`  - ${id}`));

    console.log(`Added exercises (${programFeedback.addedExercises.length}):`);
    programFeedback.addedExercises.forEach(ex => console.log(`  - ${ex.id}: ${ex.name}`));

    // Format the feedback for inclusion in the prompt
    const formattedFeedback = `

===================================================
USER PROGRAM FEEDBACK (CRITICAL INSTRUCTIONS)
===================================================

** CRITICAL - YOU MUST FOLLOW THESE INSTRUCTIONS: **

PREFERRED EXERCISES (YOU MUST INCLUDE THESE):
${programFeedback.preferredExercises.length > 0 
  ? programFeedback.preferredExercises.map(id => `- ${id}`).join('\n')
  : '- None'}

REMOVED EXERCISES (YOU MUST NOT INCLUDE THESE):
${programFeedback.removedExercises.length > 0
  ? programFeedback.removedExercises.map(id => `- ${id}`).join('\n')
  : '- None'}

REPLACED EXERCISES (YOU MUST NOT INCLUDE THESE):
${programFeedback.replacedExercises.length > 0
  ? programFeedback.replacedExercises.map(id => `- ${id}`).join('\n')
  : '- None'}

ADDED EXERCISES (YOU MUST INCLUDE THESE):
${programFeedback.addedExercises.length > 0
  ? programFeedback.addedExercises.map(ex => `- ${ex.id}: ${ex.name}`).join('\n')
  : '- None'}

===================================================
FAILURE TO FOLLOW THE ABOVE INSTRUCTIONS EXACTLY WILL RESULT IN POOR USER EXPERIENCE
===================================================

`;

    // Get final system prompt with feedback and exercises appended
    const finalSystemPrompt = systemPrompt.programFollowUpSystemPrompt + formattedFeedback + exercisesPrompt;

    // Log a sample of the prompt to verify its structure
    console.log('Prompt structure summary:');
    console.log(`- System prompt: ${systemPrompt.programFollowUpSystemPrompt.substring(0, 100)}...`);
    console.log(`- Feedback section: ${formattedFeedback.substring(0, 200)}...`);
    console.log(`- Exercise database: ${exercisesPrompt.substring(0, 100)}...`);
    console.log(`- Total prompt length: ${finalSystemPrompt.length} characters`);

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
      console.log("\n----- EXERCISE VALIDATION (CHECKING FEEDBACK COMPLIANCE) -----");
      
      // Collect all exercise IDs from the response
      const includedExerciseIds = new Set<string>();
      if (program.program && Array.isArray(program.program)) {
        program.program.forEach(week => {
          week.days.forEach(day => {
            if (!day.isRestDay && day.exercises && Array.isArray(day.exercises)) {
              day.exercises.forEach(exercise => {
                if (exercise.exerciseId) {
                  includedExerciseIds.add(exercise.exerciseId);
                }
              });
            }
          });
        });
      }
      
      // Check if preferred exercises are included
      console.log("\nPREFERRED EXERCISES (should all be included):");
      programFeedback.preferredExercises.forEach(id => {
        const isIncluded = includedExerciseIds.has(id);
        console.log(`  - ${id}: ${isIncluded ? '✅ INCLUDED' : '❌ MISSING'}`);
      });
      
      // Check if removed exercises are excluded
      console.log("\nREMOVED EXERCISES (should NOT be included):");
      programFeedback.removedExercises.forEach(id => {
        const isIncluded = includedExerciseIds.has(id);
        console.log(`  - ${id}: ${isIncluded ? '❌ WRONGLY INCLUDED' : '✅ PROPERLY EXCLUDED'}`);
      });
      
      // Check if replaced exercises are excluded
      console.log("\nREPLACED EXERCISES (should NOT be included):");
      programFeedback.replacedExercises.forEach(id => {
        const isIncluded = includedExerciseIds.has(id);
        console.log(`  - ${id}: ${isIncluded ? '❌ WRONGLY INCLUDED' : '✅ PROPERLY EXCLUDED'}`);
      });
      
      // Check if added exercises are included
      console.log("\nADDED EXERCISES (should all be included):");
      programFeedback.addedExercises.forEach(ex => {
        const id = ex.id;
        const isIncluded = includedExerciseIds.has(id);
        console.log(`  - ${id} (${ex.name}): ${isIncluded ? '✅ INCLUDED' : '❌ MISSING'}`);
      });
      
      // List all exercises in the response
      console.log("\nALL EXERCISES IN RESPONSE:");
      console.log([...includedExerciseIds].join(', '));
      
      console.log("\n----- END VALIDATION -----\n");
      
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
            active: true, // Set the new program as active
          });

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
    const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(context.userInfo);
    console.log(`Prepared exercise prompt with ${exerciseCount} total exercises`);

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
            active: true, // Set the new program as active
          });

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


