/**
 * Profile page helper utilities
 */

import { PAIN_BODY_PARTS } from '@/app/types/program';

/**
 * Normalize body part names to match PAIN_BODY_PARTS format
 * Converts various formats (snake_case, camelCase) to "Title Case" format
 * that matches the values in PAIN_BODY_PARTS and translation keys
 */
export const normalizeBodyPartName = (
  bodyPart: string,
  t: (key: string) => string
): string => {
  // If already in PAIN_BODY_PARTS, return as-is
  if (PAIN_BODY_PARTS.includes(bodyPart as any)) {
    return bodyPart;
  }

  // Convert snake_case to Title Case: "left_hand" -> "Left Hand"
  if (bodyPart.includes('_')) {
    const titleCase = bodyPart
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    if (PAIN_BODY_PARTS.includes(titleCase as any)) {
      return titleCase;
    }
  }

  // Convert camelCase to Title Case: "leftHand" -> "Left Hand"
  if (/[a-z][A-Z]/.test(bodyPart)) {
    const titleCase = bodyPart
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
    if (PAIN_BODY_PARTS.includes(titleCase as any)) {
      return titleCase;
    }
  }

  // Try to find by translation match
  const matchedPart = PAIN_BODY_PARTS.find((part) => {
    const translated = t(`bodyParts.${part}`);
    return translated.toLowerCase() === bodyPart.toLowerCase();
  });

  return matchedPart || bodyPart;
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
