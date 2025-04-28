import { Exercise } from '@/app/types/program';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';

// Cache to track which videos have been preloaded
const preloadedVideos = new Set<string>();

/**
 * Extracts Firebase Storage URL from an exercise if present
 */
const getFirebaseVideoUrl = (exercise: Exercise): string | null => {
  // Check if the exercise has a videoUrl property that's a Firebase Storage URL
  if (exercise.videoUrl && typeof exercise.videoUrl === 'string' && exercise.videoUrl.startsWith('gs://')) {
    return exercise.videoUrl;
  }
  return null;
};

/**
 * Preloads a single video
 * @param url Firebase Storage URL
 * @returns Promise that resolves when video is preloaded or fails
 */
const preloadSingleVideo = async (url: string): Promise<void> => {
  // If already preloaded, skip
  if (preloadedVideos.has(url)) {
    return;
  }
  
  try {
    // Convert Firebase Storage URL to HTTP URL
    const httpUrl = await convertFirebaseUrlToHttpUrl(url);
    
    // Create a hidden video element to preload the video
    const videoElement = document.createElement('video');
    videoElement.style.display = 'none';
    videoElement.preload = 'auto';
    
    // Return a promise that resolves when the video is loaded or fails
    return new Promise((resolve) => {
      videoElement.onloadeddata = () => {
        preloadedVideos.add(url);
        document.body.removeChild(videoElement);
        console.log(`Preloaded video: ${url}`);
        resolve();
      };
      
      videoElement.onerror = () => {
        document.body.removeChild(videoElement);
        console.error(`Failed to preload video: ${url}`);
        resolve();
      };
      
      // Set source and append to document to start loading
      videoElement.src = httpUrl;
      document.body.appendChild(videoElement);
    });
  } catch (error) {
    console.error(`Error preloading video ${url}:`, error);
  }
};

/**
 * Converts a Firebase Storage URL to an HTTP URL
 * Uses Firebase Storage SDK to get the download URL
 */
const convertFirebaseUrlToHttpUrl = async (firebaseUrl: string): Promise<string> => {
  try {
    const storage = getStorage();
    const gsReference = ref(storage, firebaseUrl);
    return await getDownloadURL(gsReference);
  } catch (error) {
    console.error(`Error converting Firebase URL: ${firebaseUrl}`, error);
    throw error;
  }
};

/**
 * Preloads videos for all exercises that have Firebase video URLs
 * @param exercises List of exercises to preload videos for
 */
export const preloadExerciseVideos = async (exercises: Exercise[]): Promise<void> => {
  console.log(`Starting to preload videos for ${exercises.length} exercises`);
  
  // Filter exercises to only those with Firebase video URLs
  const exercisesWithVideos = exercises.filter(ex => getFirebaseVideoUrl(ex) !== null);
  
  console.log(`Found ${exercisesWithVideos.length} exercises with Firebase videos to preload`);
  
  // Preload videos in chunks to avoid overwhelming the browser
  const chunkSize = 5;
  for (let i = 0; i < exercisesWithVideos.length; i += chunkSize) {
    const chunk = exercisesWithVideos.slice(i, i + chunkSize);
    const videoUrls = chunk.map(ex => getFirebaseVideoUrl(ex)).filter(Boolean) as string[];
    
    // Preload videos in this chunk in parallel
    await Promise.all(videoUrls.map(url => preloadSingleVideo(url)));
    
    // Small delay between chunks to prevent browser throttling
    if (i + chunkSize < exercisesWithVideos.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }
  
  console.log(`Completed preloading ${preloadedVideos.size} exercise videos`);
};

/**
 * Checks if a video URL has been preloaded
 */
export const isVideoPreloaded = (url: string): boolean => {
  return preloadedVideos.has(url);
}; 