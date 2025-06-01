import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { content, filename, exerciseSource } = await request.json();

    if (!content || !filename) {
      return NextResponse.json(
        { error: 'Content and filename are required' },
        { status: 400 }
      );
    }

    // Create debug directory if it doesn't exist
    const debugDir = path.join(process.cwd(), 'debug');
    if (!fs.existsSync(debugDir)) {
      fs.mkdirSync(debugDir, { recursive: true });
    }

    // Write the file
    const filepath = path.join(debugDir, filename);
    fs.writeFileSync(filepath, content, 'utf8');

    console.log(`Exercise data written to server file: ${filepath}`);
    console.log(`Exercise source: ${exerciseSource}`);
    console.log(`File size: ${content.length} characters`);

    return NextResponse.json({
      success: true,
      message: 'Exercise data written to file successfully',
      filepath: filepath,
      filename: filename,
      size: content.length
    });

  } catch (error) {
    console.error('Error writing exercise data to file:', error);
    return NextResponse.json(
      { error: 'Failed to write exercise data to file' },
      { status: 500 }
    );
  }
} 