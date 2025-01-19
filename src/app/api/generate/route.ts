import { searchYouTubeVideo } from '@/app/utils/youtube';

// ... existing imports and code ...

async function addVideoUrlsToProgram(program: ExerciseProgram): Promise<ExerciseProgram> {
  for (const week of program.program) {
    for (const day of week.days) {
      if (!day.isRestDay) {
        for (const exercise of day.exercises) {
          if (!exercise.videoUrl) {
            const searchQuery = `${exercise.name} proper form`;
            const videoUrl = await searchYouTubeVideo(searchQuery);
            if (videoUrl) {
              exercise.videoUrl = videoUrl;
            }
          }
        }
      }
    }
  }
  return program;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { diagnosis, answers } = body;

    const program = await generateProgram(diagnosis, answers);
    const programWithVideos = await addVideoUrlsToProgram(program);

    return NextResponse.json(programWithVideos);
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: 'Failed to generate program' },
      { status: 500 }
    );
  }
} 