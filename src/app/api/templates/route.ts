import { NextResponse } from 'next/server';
import { uploadAllExerciseTemplates } from '@/app/services/exerciseTemplateService';

export async function POST(request: Request) {
  try {
    // For security, you should implement proper authentication here
    // This endpoint should only be accessible by administrators

    // Check if this is an authorized request (implement your auth logic)
    const authHeader = request.headers.get('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // In a real implementation, validate the token
    // For now, we'll proceed with uploading the templates
    await uploadAllExerciseTemplates();
    
    return NextResponse.json({
      message: 'Exercise templates uploaded successfully',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error uploading exercise templates:', error);
    return NextResponse.json(
      { error: 'Failed to upload exercise templates' },
      { status: 500 }
    );
  }
} 