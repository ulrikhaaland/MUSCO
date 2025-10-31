import { storage } from '@/app/firebase/config';
import { ref, getDownloadURL } from 'firebase/storage';
import { searchYouTubeVideo } from './youtube';
import { Exercise } from '@/app/types/program';

export function isFirebaseStorageUrl(url: string): boolean {
  return url.startsWith('gs://');
}

export function getVideoEmbedUrl(url: string): string {
  const youtubeRegExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(youtubeRegExp);
  if (match && match[2]?.length === 11) {
    return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
  }
  return url;
}

/**
 * Fetches video URL for an exercise
 * Handles Firebase Storage URLs, YouTube URLs, and fallback search
 */
export async function fetchExerciseVideoUrl(exercise: Exercise): Promise<string | null> {
  try {
    if (exercise.videoUrl) {
      if (isFirebaseStorageUrl(exercise.videoUrl)) {
        // Fetch Firebase download URL
        const storageRef = ref(storage, exercise.videoUrl);
        const downloadUrl = await getDownloadURL(storageRef);
        return downloadUrl;
      } else {
        return getVideoEmbedUrl(exercise.videoUrl);
      }
    } else {
      // No video URL - search YouTube
      const searchQuery = `${exercise.name} proper form`;
      const youtubeUrl = await searchYouTubeVideo(searchQuery);
      if (youtubeUrl) {
        return getVideoEmbedUrl(youtubeUrl);
      }
    }
    return null;
  } catch (error) {
    console.error('Error fetching video URL:', error);
    return null;
  }
}

