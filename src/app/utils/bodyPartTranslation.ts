import { BodyPartGroup } from '../config/bodyPartGroups';
import { AnatomyPart } from '../types/human';
import { hasTranslation, Locale } from '../i18n/translations';

/**
 * Translate a body part group name
 * @param group The body part group to translate
 * @param t Translation function
 * @param locale Current locale (optional, for silent key check)
 * @returns Translated group name
 */
export function translateBodyPartGroupName(
  group: BodyPartGroup, 
  t: (key: string, options?: any) => string,
  locale: Locale = 'en'
): string {
  // Try to find a translation key based on the group id
  const translationKey = `bodyPart.group.${group.id}`;
  
  // Check if translation exists silently before calling t()
  if (hasTranslation(translationKey, locale) || hasTranslation(translationKey, 'en')) {
    return t(translationKey);
  }
  
  return group.name;
}

/**
 * Translate only the left/right prefix in an anatomy part name
 * @param part The anatomy part to translate prefixes for
 * @param t Translation function
 * @returns Part name with translated left/right prefix
 */
export function translatePartDirectionPrefix(part: AnatomyPart | null, t: (key: string, options?: any) => string): string {
  if (!part) return '';
  
  const name = part.name;
  
  // Check for "Left" prefix
  if (name.startsWith('Left ')) {
    const leftTranslated = t('direction.left');
    return `${leftTranslated} ${name.substring(5)}`;
  }
  
  // Check for "Right" prefix
  if (name.startsWith('Right ')) {
    const rightTranslated = t('direction.right');
    return `${rightTranslated} ${name.substring(6)}`;
  }
  
  return name;
}

/**
 * Translate an anatomy part name fully (both direction prefix AND body part name)
 * Tries multiple translation key formats for the body part name.
 * @param part The anatomy part to translate
 * @param t Translation function
 * @param locale Current locale (optional, for silent key check)
 * @returns Fully translated part name, or original with direction prefix translated
 */
export function translateAnatomyPart(
  part: AnatomyPart | null, 
  t: (key: string, options?: any) => string,
  locale: Locale = 'en'
): string {
  if (!part) return '';
  
  const name = part.name;
  
  // Try direct translations with various key formats
  const keyFormats = [
    `bodyParts.${name}`,                           // "bodyParts.Left Shoulder"
    `bodyParts.${name.toLowerCase()}`,             // "bodyParts.left shoulder"
    `bodyParts.${name.replace(/\s+/g, '')}`,       // "bodyParts.LeftShoulder"
    `bodyParts.${name.toLowerCase().replace(/\s+/g, '')}`, // "bodyParts.leftshoulder"
  ];
  
  // Check silently for existing translations to avoid console spam
  for (const key of keyFormats) {
    if (hasTranslation(key, locale) || hasTranslation(key, 'en')) {
      return t(key);
    }
  }
  
  // Fallback: at least translate the direction prefix
  return translatePartDirectionPrefix(part, t);
} 