import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/firebase/admin';
import { getStartOfWeek } from '@/app/utils/dateutils';
import { ProgramType } from '@/../shared/types';
import {
  canGenerateProgramAdmin,
  recordProgramGenerationAdmin,
  getNextAllowedGenerationDateAdmin,
} from '@/app/services/programGenerationLimitsAdmin';

/**
 * POST /api/programs/copy-week
 * Copies the previous week's program to create a new week.
 * This allows users to repeat a week without going through the feedback process.
 */
export async function POST(req: NextRequest) {
  try {
    const { userId, programId } = await req.json();

    if (!userId || !programId) {
      return NextResponse.json(
        { error: 'userId and programId are required' },
        { status: 400 }
      );
    }

    const programRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('programs')
      .doc(programId);

    // Get the program document
    const programSnap = await programRef.get();
    if (!programSnap.exists) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    const programData = programSnap.data();
    const programType = programData?.type as ProgramType;

    if (!programType) {
      return NextResponse.json(
        { error: 'Program type not found' },
        { status: 400 }
      );
    }

    // Check weekly generation limit
    const canGenerate = await canGenerateProgramAdmin(userId, programType);
    if (!canGenerate) {
      const nextAllowedDate = await getNextAllowedGenerationDateAdmin(userId, programType);
      return NextResponse.json(
        {
          error: 'Weekly generation limit reached',
          code: 'WEEKLY_LIMIT_REACHED',
          nextAllowedDate: nextAllowedDate?.toISOString(),
        },
        { status: 429 }
      );
    }

    // Get all weeks for this program, ordered by creation date
    const weeksSnapshot = await programRef
      .collection('weeks')
      .orderBy('createdAt', 'asc')
      .get();

    if (weeksSnapshot.empty) {
      return NextResponse.json(
        { error: 'No weeks found in this program' },
        { status: 400 }
      );
    }

    // Get the last week (most recent)
    const lastWeekDoc = weeksSnapshot.docs[weeksSnapshot.docs.length - 1];
    const lastWeekData = lastWeekDoc.data();

    if (!lastWeekData?.days || lastWeekData.days.length === 0) {
      return NextResponse.json(
        { error: 'Previous week has no exercise data to copy' },
        { status: 400 }
      );
    }

    // Calculate the new week's start date (Monday of current week or next Monday)
    const now = new Date();
    const currentWeekStart = getStartOfWeek(now);
    
    // Check if there's already a week for the current calendar week
    const lastWeekCreatedAt = lastWeekData.createdAt?.toDate?.() || new Date(lastWeekData.createdAt);
    const lastWeekStart = getStartOfWeek(lastWeekCreatedAt);
    
    // If the last week was created this week, create for next week
    // Otherwise, create for current week
    let newWeekStart: Date;
    if (currentWeekStart.getTime() <= lastWeekStart.getTime()) {
      // Last week was created this week or later, so create for next week
      newWeekStart = new Date(lastWeekStart);
      newWeekStart.setDate(newWeekStart.getDate() + 7);
    } else {
      // Last week was from a previous week, create for current week
      newWeekStart = currentWeekStart;
    }

    // Deep copy the days array, resetting completion status
    const copiedDays = lastWeekData.days.map((day: Record<string, unknown>) => ({
      ...day,
      completed: false,
      completedAt: null,
    }));

    // Create new week document
    const newWeekData = {
      days: copiedDays,
      programOverview: lastWeekData.programOverview || '',
      summary: lastWeekData.summary || '',
      timeFrameExplanation: lastWeekData.timeFrameExplanation || '',
      afterTimeFrame: lastWeekData.afterTimeFrame || null,
      whatNotToDo: lastWeekData.whatNotToDo || '',
      targetAreas: lastWeekData.targetAreas || [],
      bodyParts: lastWeekData.bodyParts || [],
      createdAt: newWeekStart.toISOString(),
      updatedAt: new Date().toISOString(),
      copiedFromWeekId: lastWeekDoc.id, // Track which week this was copied from
    };

    // Add the new week to the weeks subcollection
    const newWeekRef = await programRef.collection('weeks').add(newWeekData);

    // Update the program's updatedAt timestamp
    await programRef.update({
      updatedAt: new Date().toISOString(),
    });

    // Record the generation to enforce weekly limits
    await recordProgramGenerationAdmin(userId, programType);

    console.log(
      `[copy-week] Copied week ${lastWeekDoc.id} to create new week ${newWeekRef.id} for program ${programId} (type: ${programType})`
    );

    return NextResponse.json({
      success: true,
      data: {
        newWeekId: newWeekRef.id,
        copiedFromWeekId: lastWeekDoc.id,
        weekNumber: weeksSnapshot.docs.length + 1,
      },
    });
  } catch (error) {
    console.error('[copy-week] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
