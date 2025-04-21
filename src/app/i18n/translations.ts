export type Locale = 'en' | 'nb';

export type TranslationKey = string;

// Import language files
import enTranslations from './translations/en';
import nbTranslations from './translations/nb';

// Type for the translations map - updated to support nested objects
interface TranslationsMap {
  [key: string]: string | Record<string, string> | TranslationsMap;
}

// Map of all translations by locale
const translations: Record<Locale, TranslationsMap> = {
  en: enTranslations,
  nb: nbTranslations
};

/**
 * Get a translation for the specified key and locale
 */
export function t(key: TranslationKey, locale: Locale = 'en'): string {
  // Split the key by dots to handle nested translations
  const parts = key.split('.');
  let result: any = translations[locale];
  
  // Navigate through nested objects
  for (const part of parts) {
    if (!result || typeof result !== 'object') {
      console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
      // Fallback to English if available
      if (locale !== 'en') {
        return t(key, 'en');
      }
      // Otherwise return the key itself
      return key;
    }
    result = result[part];
  }
  
  if (typeof result !== 'string') {
    console.warn(`Translation for key: ${key} in locale: ${locale} is not a string`);
    // Fallback to English if available
    if (locale !== 'en') {
      return t(key, 'en');
    }
    // Otherwise return the key itself
    return key;
  }
  
  return result;
}

/**
 * Add or update a translation
 */
export function addTranslation(key: TranslationKey, locale: Locale, value: string): void {
  if (!translations[locale]) {
    translations[locale] = {};
  }
  
  // Handle nested keys
  const parts = key.split('.');
  let current = translations[locale];
  
  // Navigate to the correct nesting level
  for (let i = 0; i < parts.length - 1; i++) {
    const part = parts[i];
    if (!current[part] || typeof current[part] !== 'object') {
      current[part] = {};
    }
    current = current[part] as TranslationsMap;
  }
  
  // Set the value at the final level
  current[parts[parts.length - 1]] = value;
}

/**
 * Verify if a translation exists
 */
export function hasTranslation(key: TranslationKey, locale: Locale = 'en'): boolean {
  // Split the key by dots to handle nested translations
  const parts = key.split('.');
  let current: any = translations[locale];
  
  // Navigate through nested objects
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return false;
    }
    current = current[part];
  }
  
  return typeof current === 'string';
}

// Default translations for common UI elements
addTranslation('common.loading', 'en', 'Loading...');
addTranslation('common.loading', 'nb', 'Laster...');
addTranslation('common.save', 'en', 'Save');
addTranslation('common.save', 'nb', 'Lagre');
addTranslation('common.cancel', 'en', 'Cancel');
addTranslation('common.cancel', 'nb', 'Avbryt');
addTranslation('common.ok', 'en', 'OK');
addTranslation('common.ok', 'nb', 'OK'); 