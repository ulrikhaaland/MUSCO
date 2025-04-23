import React from 'react';
import { useTranslation } from '@/app/i18n';

// Simple SVG Flag Components
const UKFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 5 3" className="w-5 h-auto mr-2">
    <rect width="5" height="3" fill="#012169"/>
    <path d="M0,0 L5,3 M5,0 L0,3" stroke="#fff" strokeWidth="0.6"/>
    <path d="M0,0 L5,3 M5,0 L0,3" stroke="#C8102E" strokeWidth="0.4"/>
    <path d="M2.5,0 V3 M0,1.5 H5" stroke="#fff" strokeWidth="1"/>
    <path d="M2.5,0 V3 M0,1.5 H5" stroke="#C8102E" strokeWidth="0.6"/>
  </svg>
);

const NorwayFlag = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 22 16" className="w-5 h-auto mr-2">
    <rect width="22" height="16" fill="#ef2b2d"/>
    <path d="M0,8 h22 M8,0 v16" stroke="#fff" strokeWidth="4"/>
    <path d="M0,8 h22 M8,0 v16" stroke="#002868" strokeWidth="2"/>
  </svg>
);

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
  const languages = [
    { code: 'en', name: showFullNames ? t('language.en') : 'EN', icon: <UKFlag /> },
    { code: 'nb', name: showFullNames ? t('language.nb') : 'NB', icon: <NorwayFlag /> }
  ];
  
  return (
    <div className={`flex flex-col space-y-2 ${className}`}>
      <div role="radiogroup" aria-label={t('common.language')} className={`flex flex-col space-y-2 ${className}`}>
      {languages.map(lang => (
        <label 
          key={lang.code} 
          className={`flex items-center px-3 py-2 rounded-lg cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-indigo-400 focus-within:ring-offset-2 focus-within:ring-offset-gray-900 ${ 
            locale === lang.code
              ? 'bg-indigo-600/20 border border-indigo-500 text-indigo-100'
              : 'bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-600/70'
          }`}
          role="radio"
          aria-checked={locale === lang.code}
          tabIndex={0}
          onClick={() => setLocale(lang.code)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setLocale(lang.code);
            }
          }}
        >
          {lang.icon}
          <span className="text-sm font-medium">{lang.name}</span>
        </label>
      ))}
      </div>
    </div>
  );
} 