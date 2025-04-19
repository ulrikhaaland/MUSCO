import React from 'react';
import { useTranslation } from '@/app/i18n';

interface LanguageSwitcherProps {
  className?: string;
  showFullNames?: boolean;
}

export default function LanguageSwitcher({ 
  className = '',
  showFullNames = false
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();
  
  // Get translated language names
  const languages = {
    en: showFullNames ? t('language.en') : 'EN',
    nb: showFullNames ? t('language.nb') : 'NB'
  };
  
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          locale === 'en'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        aria-label={t('language.en')}
      >
        {languages.en}
      </button>
      <button
        onClick={() => setLocale('nb')}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          locale === 'nb'
            ? 'bg-indigo-600 text-white'
            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
        aria-label={t('language.nb')}
      >
        {languages.nb}
      </button>
    </div>
  );
} 