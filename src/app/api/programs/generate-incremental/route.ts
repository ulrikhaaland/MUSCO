import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { prepareExercisesPrompt } from '@/app/helpers/exercise-prompt';
import { programMetadataOnlyPrompt, singleDaySystemPrompt } from '@/app/api/prompts/singleDayPrompt';
import {
  GenerateMetadataRequest,
  GenerateSingleDayRequest,
  ProgramMetadataResponse,
  SingleDayResponse,
} from '@/app/types/incremental-program';
import { ProgramDay, ProgramStatus } from '@/app/types/program';
import { adminDb } from '@/app/firebase/admin';
import { PROGRAM_MODEL } from '@/app/api/assistant/models';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Save metadata to Firebase
 */
async function saveMetadataToFirebase(
  userId: string,
  programId: string,
  metadata: ProgramMetadataResponse
): Promise<void> {
  const programRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('programs')
    .doc(programId);

  await programRef.update({
    title: metadata.title,
    programOverview: metadata.programOverview,
    summary: metadata.summary,
    whatNotToDo: metadata.whatNotToDo,
    afterTimeFrame: metadata.afterTimeFrame,
    generatingDay: 1, // About to generate day 1
    updatedAt: new Date().toISOString(),
  });

  console.log(`[incremental] Saved metadata to Firebase for ${programId}`);
}

/**
 * Save a generated day to Firebase
 */
async function saveDayToFirebase(
  userId: string,
  programId: string,
  day: ProgramDay,
  isLastDay: boolean,
  diagnosisType?: string
): Promise<void> {
  const programRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('programs')
    .doc(programId);

  const batch = adminDb.batch();

  // Get current program data
  const programSnap = await programRef.get();
  const existingData = programSnap.data() || {};
  const existingDays: ProgramDay[] = existingData.days || [];
  
  // Add or replace the day
  const dayIndex = existingDays.findIndex((d) => d.day === day.day);
  if (dayIndex >= 0) {
    existingDays[dayIndex] = day;
  } else {
    existingDays.push(day);
  }
  // Sort by day number
  existingDays.sort((a, b) => a.day - b.day);

  const updates: Record<string, unknown> = {
    days: existingDays,
    generatingDay: isLastDay ? null : day.day + 1,
    updatedAt: new Date().toISOString(),
  };

  // If last day, mark as complete, save to subcollection, and deactivate other programs
  if (isLastDay) {
    updates.status = ProgramStatus.Done;
    updates.active = true;

    // Deactivate other programs of the same type
    if (diagnosisType) {
      const otherActiveProgramsQuery = adminDb
        .collection('users')
        .doc(userId)
        .collection('programs')
        .where('active', '==', true)
        .where('type', '==', diagnosisType);

      const otherActiveProgramsSnapshot = await otherActiveProgramsQuery.get();
      otherActiveProgramsSnapshot.forEach((doc) => {
        if (doc.id !== programId) {
          batch.update(doc.ref, {
            active: false,
            updatedAt: new Date().toISOString(),
          });
          console.log(`[incremental] Deactivating program ${doc.id}`);
        }
      });
    }

    // Save the weekly program to subcollection (like old generation did)
    const weekRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('programs')
      .doc(programId)
      .collection('programs')
      .doc();

    // Extract program metadata for the weekly document
    const weeklyProgramData = {
      days: existingDays,
      title: existingData.title || '',
      programOverview: existingData.programOverview || '',
      summary: existingData.summary || '',
      whatNotToDo: existingData.whatNotToDo || '',
      afterTimeFrame: existingData.afterTimeFrame || {},
      targetAreas: existingData.questionnaire?.targetAreas || [],
      bodyParts: existingData.questionnaire?.targetAreas || [],
      createdAt: new Date().toISOString(),
    };

    batch.set(weekRef, weeklyProgramData);
    console.log(`[incremental] Created weekly program document: ${weekRef.id}`);
  }

  batch.update(programRef, updates);
  await batch.commit();

  console.log(`[incremental] Saved day ${day.day} to Firebase (lastDay: ${isLastDay})`);
}

/**
 * Generate program metadata only (no exercises)
 */
async function generateMetadata(
  request: GenerateMetadataRequest
): Promise<ProgramMetadataResponse> {
  const userMessage = JSON.stringify({
    diagnosisData: request.diagnosisData,
    userInfo: {
      ...request.userInfo,
      equipment: undefined,
      exerciseEnvironments: undefined,
    },
    language: request.language || 'en',
  });

  console.log(`[incremental] Generating metadata...`);

  const response = await openai.chat.completions.create({
    model: PROGRAM_MODEL,
    messages: [
      { role: 'system', content: programMetadataOnlyPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    reasoning_effort: 'minimal',
  } as any);

  const rawContent = response.choices[0].message.content;
  if (!rawContent) {
    throw new Error('No response content from OpenAI');
  }

  console.log(`[incremental] Metadata response length: ${rawContent.length}`);

  const parsed = JSON.parse(rawContent) as ProgramMetadataResponse;
  return parsed;
}

/**
 * Generate a single day (days 1-7)
 */
async function generateSingleDay(
  request: GenerateSingleDayRequest
): Promise<SingleDayResponse> {
  const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(
    request.userInfo,
    undefined, // removedExerciseIds
    false, // includeEquipment
    request.language || 'en' // language
  );

  console.log(`[incremental] Day ${request.dayNumber}: using ${exerciseCount} exercises (locale: ${request.language || 'en'})`);

  // Use the detailed singleDaySystemPrompt + exercises
  const finalSystemPrompt = singleDaySystemPrompt + exercisesPrompt;

  // Build context about previous days for the LLM (for exercise variety)
  const previousDaysContext = request.previousDays?.map((day) => ({
    day: day.day,
    exerciseIds: day.exercises.map((e) => e.exerciseId).filter(Boolean),
  })) || [];

  // Get the weekly plan from metadata (tells us what type each day should be)
  const weeklyPlan = request.programMetadata?.weeklyPlan || [];

  const userMessage = JSON.stringify({
    dayToGenerate: request.dayNumber,
    weeklyPlan, // CRITICAL: The plan that tells us what type of day this should be
    previousDays: previousDaysContext, // For exercise variety
    targetAreas: request.userInfo.targetAreas,
    cardioType: request.userInfo.cardioType,
    cardioEnvironment: request.userInfo.cardioEnvironment,
    workoutDuration: request.userInfo.workoutDuration,
    diagnosisData: request.diagnosisData,
    userInfo: {
      ...request.userInfo,
      equipment: undefined,
      exerciseEnvironments: undefined,
    },
    language: request.language || 'en',
  });

  const response = await openai.chat.completions.create({
    model: PROGRAM_MODEL,
    messages: [
      { role: 'system', content: finalSystemPrompt },
      { role: 'user', content: userMessage },
    ],
    response_format: { type: 'json_object' },
    reasoning_effort: 'minimal',
  } as any);

  const rawContent = response.choices[0].message.content;
  if (!rawContent) {
    throw new Error('No response content from OpenAI');
  }

  console.log(`[incremental] Day ${request.dayNumber} response length: ${rawContent.length}`);

  const parsed = JSON.parse(rawContent) as SingleDayResponse;
  
  // Ensure day number matches request
  parsed.day = request.dayNumber;
  
  return parsed;
}

/**
 * Convert SingleDayResponse to ProgramDay format
 */
function toProgramDay(response: SingleDayResponse): ProgramDay {
  return {
    day: response.day,
    isRestDay: response.isRestDay,
    isCardioDay: (response as any).isCardioDay || false,
    description: response.description,
    exercises: response.exercises,
    duration: response.duration,
  } as ProgramDay;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'generate_metadata') {
      // Generate program metadata only (no exercises)
      const request = body as GenerateMetadataRequest & { action: string };
      
      const result = await generateMetadata({
        diagnosisData: request.diagnosisData,
        userInfo: request.userInfo,
        userId: request.userId,
        programId: request.programId,
        language: request.language,
      });

      // Save metadata to Firebase
      if (request.userId && request.programId) {
        await saveMetadataToFirebase(request.userId, request.programId, result);
      }

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else if (action === 'generate_day') {
      // Generate a single day (1-7)
      const request = body as GenerateSingleDayRequest & { action: string };
      
      if (request.dayNumber < 1 || request.dayNumber > 7) {
        return NextResponse.json(
          { error: 'dayNumber must be between 1 and 7' },
          { status: 400 }
        );
      }

      const result = await generateSingleDay({
        dayNumber: request.dayNumber,
        diagnosisData: request.diagnosisData,
        userInfo: request.userInfo,
        previousDays: request.previousDays || [],
        programMetadata: request.programMetadata,
        userId: request.userId,
        programId: request.programId,
        language: request.language,
      });

      const programDay = toProgramDay(result);

      // Save day to Firebase
      if (request.userId && request.programId) {
        const isLastDay = request.dayNumber === 7;
        await saveDayToFirebase(
          request.userId,
          request.programId,
          programDay,
          isLastDay,
          request.diagnosisData?.programType
        );
      }

      return NextResponse.json({
        success: true,
        data: programDay,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "generate_metadata" or "generate_day"' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('[incremental] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
