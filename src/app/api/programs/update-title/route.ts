import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/app/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const { userId, programId, title } = await req.json();

    if (!userId || !programId) {
      return NextResponse.json(
        { error: 'userId and programId are required' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string') {
      return NextResponse.json(
        { error: 'title is required and must be a string' },
        { status: 400 }
      );
    }

    // Trim and validate title length
    const trimmedTitle = title.trim();
    if (trimmedTitle.length === 0) {
      return NextResponse.json(
        { error: 'title cannot be empty' },
        { status: 400 }
      );
    }

    if (trimmedTitle.length > 100) {
      return NextResponse.json(
        { error: 'title must be 100 characters or less' },
        { status: 400 }
      );
    }

    const programRef = adminDb
      .collection('users')
      .doc(userId)
      .collection('programs')
      .doc(programId);

    // Check if program exists
    const programSnap = await programRef.get();
    if (!programSnap.exists) {
      return NextResponse.json(
        { error: 'Program not found' },
        { status: 404 }
      );
    }

    // Update the title
    await programRef.update({
      title: trimmedTitle,
      updatedAt: new Date().toISOString(),
    });

    console.log(`[update-title] Updated title for program ${programId} to "${trimmedTitle}"`);

    return NextResponse.json({
      success: true,
      data: { title: trimmedTitle },
    });
  } catch (error) {
    console.error('[update-title] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}

