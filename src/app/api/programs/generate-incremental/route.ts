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
import { ProgramDay, ProgramStatus, ProgramType } from '@/app/types/program';
import { adminDb } from '@/app/firebase/admin';
import { PROGRAM_MODEL } from '@/app/api/assistant/models';
import { recordProgramGenerationAdmin } from '@/app/services/programGenerationLimitsAdmin';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Create a new week document in the weeks subcollection and save metadata.
 * Returns the weekId for subsequent day saves.
 * 
 * Structure:
 * users/{userId}/programs/{programId} - top-level metadata (title, diagnosis, questionnaire, status, type)
 * users/{userId}/programs/{programId}/weeks/{weekId} - week data (overview, days[], etc.)
 * 
 * Note: Title is stored in program document (generated once, not per week)
 */
async function createWeekWithMetadata(
  userId: string,
  programId: string,
  metadata: ProgramMetadataResponse,
  targetAreas: string[]
): Promise<string> {
  const programRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('programs')
    .doc(programId);

  // Create new week document in weeks subcollection
  const weekRef = programRef.collection('weeks').doc();
  
  // Week-specific data (changes each week)
  const weekData = {
    programOverview: metadata.programOverview,
    summary: metadata.summary,
    whatNotToDo: metadata.whatNotToDo,
    afterTimeFrame: metadata.afterTimeFrame,
    weeklyPlan: (metadata as any).weeklyPlan || [],
    targetAreas: targetAreas,
    bodyParts: targetAreas,
    days: [],
    generatingDay: 1, // About to generate day 1
    createdAt: new Date().toISOString(),
  };

  // Update program document with title (only generated once) and tracking fields
  const batch = adminDb.batch();
  batch.set(weekRef, weekData);
  batch.update(programRef, {
    title: metadata.title, // Title stored at program level
    currentWeekId: weekRef.id,
    generatingDay: 1,
    updatedAt: new Date().toISOString(),
  });
  await batch.commit();

  console.log(`[incremental] Created week ${weekRef.id} with metadata for program ${programId}`);
  return weekRef.id;
}

/**
 * Save a generated day to the week document in Firebase
 */
async function saveDayToWeek(
  userId: string,
  programId: string,
  weekId: string,
  day: ProgramDay,
  isLastDay: boolean,
  diagnosisType?: string
): Promise<void> {
  const programRef = adminDb
    .collection('users')
    .doc(userId)
    .collection('programs')
    .doc(programId);
  
  const weekRef = programRef.collection('weeks').doc(weekId);

  const batch = adminDb.batch();

  // Get current week data
  const weekSnap = await weekRef.get();
  const weekData = weekSnap.data() || {};
  const existingDays: ProgramDay[] = weekData.days || [];
  
  // Add or replace the day
  const dayIndex = existingDays.findIndex((d) => d.day === day.day);
  if (dayIndex >= 0) {
    existingDays[dayIndex] = day;
  } else {
    existingDays.push(day);
  }
  // Sort by day number
  existingDays.sort((a, b) => a.day - b.day);

  // Update week document
  const weekUpdates: Record<string, unknown> = {
    days: existingDays,
    generatingDay: isLastDay ? null : day.day + 1,
  };
  batch.update(weekRef, weekUpdates);

  // Update program document
  const programUpdates: Record<string, unknown> = {
    generatingDay: isLastDay ? null : day.day + 1,
    updatedAt: new Date().toISOString(),
  };

  // If last day, mark program as complete
  if (isLastDay) {
    programUpdates.status = ProgramStatus.Done;
    programUpdates.currentWeekId = null; // Clear generating week reference

    // Record the weekly generation limit now that program is complete
    if (diagnosisType) {
      await recordProgramGenerationAdmin(userId, diagnosisType as ProgramType);
    }
  }

  batch.update(programRef, programUpdates);
  await batch.commit();

  console.log(`[incremental] Saved day ${day.day} to week ${weekId} (lastDay: ${isLastDay})`);
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

/**
 * Generate the full program (metadata + all 7 days) in a single API call.
 * Each day is saved to Firebase immediately after generation.
 * The frontend listens to Firebase for real-time updates.
 * 
 * Structure:
 * - Program document: metadata only (diagnosis, questionnaire, status, type)
 * - Week document (in weeks subcollection): title, overview, days[], etc.
 */
async function generateFullProgram(
  userId: string,
  programId: string,
  diagnosisData: GenerateMetadataRequest['diagnosisData'],
  userInfo: GenerateMetadataRequest['userInfo'],
  language: string
): Promise<{ success: boolean; completedDays: number; weekId: string }> {
  // Generate metadata first
  console.log(`[incremental-full] Generating metadata for ${programId}...`);
  const metadata = await generateMetadata({
    diagnosisData,
    userInfo,
    userId,
    programId,
    language,
  });
  
  // Create week document with metadata
  const weekId = await createWeekWithMetadata(
    userId,
    programId,
    metadata,
    userInfo.targetAreas || []
  );
  console.log(`[incremental-full] Week ${weekId} created with metadata for ${programId}`);
  
  const programMeta = {
    title: metadata.title,
    programOverview: metadata.programOverview,
    weeklyPlan: (metadata as any).weeklyPlan || [],
  };
  
  // Generate all 7 days sequentially, saving each immediately to the week
  const currentDays: ProgramDay[] = [];
  
  for (let dayNum = 1; dayNum <= 7; dayNum++) {
    console.log(`[incremental-full] Generating day ${dayNum} for ${programId}...`);
    
    const dayResult = await generateSingleDay({
      dayNumber: dayNum,
      diagnosisData,
      userInfo,
      previousDays: currentDays,
      programMetadata: programMeta,
      userId,
      programId,
      language,
    });
    
    const programDay = toProgramDay(dayResult);
    currentDays.push(programDay);
    
    // Save immediately to the week document
    const isLastDay = dayNum === 7;
    await saveDayToWeek(
      userId,
      programId,
      weekId,
      programDay,
      isLastDay,
      diagnosisData?.programType
    );
    
    console.log(`[incremental-full] Day ${dayNum} saved to week ${weekId}`);
  }
  
  return { success: true, completedDays: 7, weekId };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === 'generate_full_program') {
      // Generate the entire program in one API call
      // Each day is saved to Firebase immediately, so progress is preserved
      const { userId, programId, diagnosisData, userInfo, language } = body;
      
      if (!userId || !programId) {
        return NextResponse.json(
          { error: 'userId and programId are required' },
          { status: 400 }
        );
      }

      console.log(`[incremental-full] Starting full program generation for ${programId}`);
      
      const result = await generateFullProgram(
        userId,
        programId,
        diagnosisData,
        userInfo,
        language || 'en'
      );

      return NextResponse.json({
        success: true,
        data: result,
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "generate_full_program"' },
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
