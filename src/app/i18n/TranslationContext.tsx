import React, { createContext, useState, useContext, useCallback, ReactNode, useEffect } from 'react';
import { Locale, TranslationKey, t as translate } from './translations';
import { saveLocalePreference, getSavedLocalePreference } from './utils';

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
  // Initialize locale: Prioritize initialLocale, then fallback to a fixed default ('en') for SSR.
  // Reading from localStorage here can cause hydration mismatch.
  const [locale, setLocaleState] = useState<Locale>(initialLocale || 'en');

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
    // On the client, after hydration, check localStorage for saved preference
    // and update if different from the initial server render locale.
    // This ensures hydration passes using the initialLocale/default, then updates.
    const savedLocale = getSavedLocalePreference(); // Safe to call now
    if (savedLocale && savedLocale !== locale) {
      setLocaleState(savedLocale);
    }
  // We only want this effect to run once on mount to check localStorage.
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