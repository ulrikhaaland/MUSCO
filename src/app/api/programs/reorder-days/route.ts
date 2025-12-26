import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { userId, programId, weekId, newDayOrder } = await req.json();

    if (!userId || !programId || !weekId) {
      return NextResponse.json(
        { error: 'userId, programId, and weekId are required' },
        { status: 400 }
      );
    }

    if (!Array.isArray(newDayOrder) || newDayOrder.length !== 7) {
      return NextResponse.json(
        { error: 'newDayOrder must be an array of 7 day numbers' },
        { status: 400 }
      );
    }

    // Validate that newDayOrder contains numbers 1-7 (each exactly once)
    const sorted = [...newDayOrder].sort((a, b) => a - b);
    const expected = [1, 2, 3, 4, 5, 6, 7];
    if (!sorted.every((val, idx) => val === expected[idx])) {
      return NextResponse.json(
        { error: 'newDayOrder must contain each day number 1-7 exactly once' },
        { status: 400 }
      );
    }

    const weekRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('programs')
      .doc(programId)
      .collection('weeks')
      .doc(weekId);

    // Get the current week document
    const weekSnap = await weekRef.get();
    if (!weekSnap.exists) {
      return NextResponse.json(
        { error: 'Week not found' },
        { status: 404 }
      );
    }

    const weekData = weekSnap.data();
    const currentDays = weekData?.days || [];

    if (currentDays.length === 0) {
      return NextResponse.json(
        { error: 'No days found in this week' },
        { status: 400 }
      );
    }

    // Create a map of old day number -> day data
    const dayMap = new Map();
    for (const day of currentDays) {
      dayMap.set(day.day, day);
    }

    // Reorder days based on newDayOrder
    // newDayOrder[0] is the day that should become day 1, etc.
    const reorderedDays = newDayOrder.map((oldDayNum, newIndex) => {
      const dayData = dayMap.get(oldDayNum);
      if (!dayData) {
        throw new Error(`Day ${oldDayNum} not found in current days`);
      }
      return {
        ...dayData,
        day: newIndex + 1, // Assign new day number (1-based)
      };
    });

    // Update the week document with reordered days
    await weekRef.update({
      days: reorderedDays,
      updatedAt: new Date().toISOString(),
    });

    // Also update the program's updatedAt
    const programRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('programs')
      .doc(programId);
    
    await programRef.update({
      updatedAt: new Date().toISOString(),
    });

    console.log(`[reorder-days] Reordered days for week ${weekId} in program ${programId}`);

    return NextResponse.json({
      success: true,
      data: { days: reorderedDays },
    });
  } catch (error) {
    console.error('[reorder-days] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

