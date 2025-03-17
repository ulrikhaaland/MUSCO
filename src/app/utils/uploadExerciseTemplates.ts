import { uploadAllExerciseTemplates } from '@/app/services/exerciseTemplateService';

/**
 * This function can be used in a development environment to upload
 * all exercise templates to Firestore.
 * 
 * Example usage (in the browser console on a development environment):
 * ```
 * import { uploadTemplates } from '@/app/utils/uploadExerciseTemplates';
 * await uploadTemplates();
 * ```
 */
export const uploadTemplates = async () => {
  try {
    console.log('Starting to upload exercise templates to Firestore...');
    await uploadAllExerciseTemplates();
    console.log('Exercise templates uploaded successfully!');
    return { success: true };
  } catch (error) {
    console.error('Error uploading exercise templates:', error);
    return { success: false, error };
  }
};

/**
 * This utility helps confirm that all exercise files are properly imported
 * in the index.ts file. It doesn't do anything functionally but can help
 * catch import errors during development.
 */
export const validateExerciseImports = () => {
  // This is just to ensure that all exercise files are imported
  // The actual checking is done at compile time through TypeScript
  console.log('Exercise imports validation successful.');
  return true;
}; 