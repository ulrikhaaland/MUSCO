import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import { Locale, TranslationKey, t as translate } from './translations';
import { detectBrowserLocale, saveLocalePreference, getSavedLocalePreference } from './utils';

interface TranslationContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, replacements?: Record<string, string>) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

interface TranslationProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
}

export function TranslationProvider({ 
  children, 
  initialLocale 
}: TranslationProviderProps) {
  // Initialize locale from provided initialLocale, localStorage, or browser settings
  const [locale, setLocaleState] = useState<Locale>(() => {
    return initialLocale || (typeof window !== 'undefined' ? getSavedLocalePreference() : 'en');
  });

  // Custom setLocale that also saves the preference
  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    saveLocalePreference(newLocale);
  }, []);

  // Extended translation function with replacements support
  const t = useCallback((key: TranslationKey, replacements?: Record<string, string>) => {
    let translated = translate(key, locale);
    
    if (replacements && translated) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        translated = translated.replace(`{{${placeholder}}}`, value);
      });
    }
    
    return translated;
  }, [locale]);

  // Hydration fix for server-side rendering
  useEffect(() => {
    // If initialLocale wasn't provided, update the locale client-side
    if (!initialLocale) {
      const savedLocale = getSavedLocalePreference();
      if (savedLocale !== locale) {
        setLocaleState(savedLocale);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <TranslationContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  
  return context;
} 