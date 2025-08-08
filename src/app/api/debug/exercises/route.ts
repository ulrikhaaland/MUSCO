import { NextRequest, NextResponse } from 'next/server';
import { prepareExercisesPrompt } from '@/app/helpers/exercise-prompt';
import { ExerciseQuestionnaireAnswers } from '../../../../../shared/types';

export async function POST(request: NextRequest) {
  try {
    // Parse the request body to get the form data
    const formData: ExerciseQuestionnaireAnswers = await request.json();
    
    // Call the helper function to prepare exercises prompt
    const { exercisesPrompt, exerciseCount } = await prepareExercisesPrompt(formData);
    
    // Return the results
    return NextResponse.json({ 
      success: true,
      exerciseCount,
      exercisesPrompt
    });
  } catch (error) {
    console.error('Error in debug exercise API:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
} 