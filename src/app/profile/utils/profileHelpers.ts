/**
 * Profile page helper utilities
 */

import { PAIN_BODY_PARTS } from '@/app/types/program';
import { isNorwegianTerm } from '@/app/constants';

/**
 * Check if a term is a Norwegian body part
 * @deprecated Use isNorwegianTerm from @/app/constants instead
 */
export const isNorwegianBodyPart = isNorwegianTerm;

/**
 * Normalize body part names between languages
 * Handles translation between English keys and localized display values
 */
export const normalizeBodyPartName = (
  bodyPart: string,
  t: (key: string) => string
): string => {
  // If it's already a Norwegian term, don't try to find an English key or translate
  if (isNorwegianBodyPart(bodyPart)) {
    return bodyPart;
  }

  // Try to get the English key for a translated body part
  const englishKey = PAIN_BODY_PARTS.find((key) => {
    try {
      const translatedValue = t(`bodyParts.${key}`);
      return translatedValue === bodyPart;
    } catch {
      return false;
    }
  });

  if (englishKey) {
    return englishKey;
  }

  // If we have an English key, get its translation
  if (PAIN_BODY_PARTS.includes(bodyPart as any)) {
    try {
      const translated = t(`bodyParts.${bodyPart}`);
      if (translated !== `bodyParts.${bodyPart}`) {
        return translated;
      }
    } catch {
      // Translation not found, continue with original
    }
  }

  return bodyPart;
};

/**
 * Get active programs by type from user programs
 */
export const getActiveProgramsByType = (
  userPrograms: Array<{ active: boolean; type: string }> | undefined
) => {
  const activePrograms = userPrograms?.filter((program) => program.active) ?? [];
  
  return {
    exercise: activePrograms.find((p) => p.type === 'exercise'),
    recovery: activePrograms.find((p) => p.type === 'recovery'),
    exerciseAndRecovery: activePrograms.find((p) => p.type === 'exercise_and_recovery'),
  };
};

/**
 * Normalize array values - handles both array and comma-separated string inputs
 */
export const normalizeArrayValue = (
  value: unknown,
  normalizer?: (item: string) => string
): string[] => {
  if (!value) return [];
  
  let items: string[];
  
  if (Array.isArray(value)) {
    items = value.map((v) => String(v).trim().toLowerCase());
  } else if (typeof value === 'string') {
    items = value.split(',').map((v) => v.trim().toLowerCase());
  } else {
    return [];
  }
  
  return normalizer ? items.map(normalizer) : items;
};

/**
 * Upload profile image to Firebase Storage
 */
export const uploadProfileImage = async (
  file: File,
  userId: string,
  storage: any,
  onProgress?: (progress: number) => void
): Promise<string> => {
  const { ref, uploadBytesResumable, getDownloadURL } = await import('firebase/storage');
  
  const storageRef = ref(storage, `profile_pictures/${userId}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(progress);
      },
      (error) => reject(error),
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      }
    );
  });
};

