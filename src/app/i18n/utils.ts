import { Locale } from './translations';

/**
 * Detects the user's preferred locale from browser settings
 * Falls back to 'en' if no matching locale is found
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === 'undefined') {
    return 'en'; // Default to English on server
  }

  // Get browser language (e.g. 'en-US', 'nb-NO')
  const browserLang = navigator.language;
  
  // Extract language code (e.g. 'en', 'nb')
  const langCode = browserLang.split('-')[0].toLowerCase();
  
  // Check if it's one of our supported locales
  if (langCode === 'nb' || langCode === 'no') {
    return 'nb';
  }
  
  // Default to English for all other languages
  return 'en';
}

/**
 * Saves the current locale to localStorage
 */
export function saveLocalePreference(locale: Locale): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferredLocale', locale);
  }
}

/**
 * Gets the saved locale preference from localStorage
 * Falls back to browser detection if no preference is saved
 */
export function getSavedLocalePreference(): Locale {
  if (typeof window === 'undefined') {
    return 'en';
  }
  
  const saved = localStorage.getItem('preferredLocale') as Locale | null;
  return saved || detectBrowserLocale();
} 