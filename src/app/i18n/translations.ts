export type Locale = 'en' | 'nb';

export type TranslationKey = string;

// Import language files
import enTranslations from './translations/en';
import nbTranslations from './translations/nb';

// Type for the translations map
interface TranslationsMap {
  [key: string]: string;
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
  const translation = translations[locale][key];
  if (!translation) {
    console.warn(`Translation missing for key: ${key} in locale: ${locale}`);
    // Fallback to English if available
    if (locale !== 'en' && translations.en[key]) {
      return translations.en[key];
    }
    // Otherwise return the key itself
    return key;
  }
  
  return translation;
}

/**
 * Add or update a translation
 */
export function addTranslation(key: TranslationKey, locale: Locale, value: string): void {
  if (!translations[locale]) {
    translations[locale] = {};
  }
  
  translations[locale][key] = value;
}

/**
 * Verify if a translation exists
 */
export function hasTranslation(key: TranslationKey, locale: Locale = 'en'): boolean {
  return Boolean(translations[locale][key]);
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