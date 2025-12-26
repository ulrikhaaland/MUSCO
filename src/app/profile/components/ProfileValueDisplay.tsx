'use client';

import { Fragment } from 'react';
import { useTranslation } from '@/app/i18n';
import {
  NORWEGIAN_BODY_PARTS,
  BODY_PART_TRANSLATION_MAP as BODY_PART_MAP,
  DIETARY_TRANSLATION_MAP,
  isNorwegianTerm,
} from '@/app/constants';

interface ProfileValueDisplayProps {
  value: string | string[] | null | undefined;
  translationPrefix: string;
  fallback?: string;
}

export default function ProfileValueDisplay({
  value,
  translationPrefix,
  fallback = 'profile.notSet',
}: ProfileValueDisplayProps) {
  const { t } = useTranslation();

  if (!value || (Array.isArray(value) && value.length === 0)) {
    return <>{t(fallback)}</>;
  }

  // Translation helper that tries multiple approaches
  const translateTerm = (term: string): string => {
    // Skip translation for Norwegian terms
    if (isNorwegianTerm(term)) {
      return term;
    }

    // Check current locale
    const isNorwegian =
      typeof window !== 'undefined' &&
      window.localStorage &&
      window.localStorage.getItem('i18nextLng') === 'nb';

    // Special handling for body parts in Norwegian locale
    if (translationPrefix === 'bodyParts' && isNorwegian) {
      // First try the direct Norwegian mapping
      const normalizedTerm = term.replace(/-/g, '_');
      if (NORWEGIAN_BODY_PARTS[normalizedTerm]) {
        return NORWEGIAN_BODY_PARTS[normalizedTerm];
      }

      // For camelCase, try converting to underscore format first
      const underscored = term.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (NORWEGIAN_BODY_PARTS[underscored]) {
        return NORWEGIAN_BODY_PARTS[underscored];
      }
    }

    // Special handling for body parts with underscores
    if (translationPrefix === 'bodyParts' && term.includes('_')) {
      // Check if we have a direct mapping
      if (BODY_PART_MAP[term]) {
        try {
          const translated = t(BODY_PART_MAP[term]);
          if (translated !== BODY_PART_MAP[term]) {
            return translated;
          }
        } catch {
          // If translation fails and we're in Norwegian, try direct mapping
          if (isNorwegian && NORWEGIAN_BODY_PARTS[term]) {
            return NORWEGIAN_BODY_PARTS[term];
          }
        }
      }

      // Try converting underscores to camelCase
      const camelCased = term.replace(/_([a-z])/g, (_match, letter) =>
        letter.toUpperCase()
      );
      try {
        const translatedCamel = t(`${translationPrefix}.${camelCased}`);
        if (translatedCamel !== `${translationPrefix}.${camelCased}`) {
          return translatedCamel;
        }
      } catch {
        // If translation fails and we're in Norwegian, try direct mapping of camelCase
        if (isNorwegian && NORWEGIAN_BODY_PARTS[camelCased]) {
          return NORWEGIAN_BODY_PARTS[camelCased];
        }
      }

      // If we're in Norwegian, try to find any matching entry
      if (isNorwegian) {
        // Look for close matches by removing underscores
        const simplified = term.replace(/_/g, '').toLowerCase();
        for (const [key, mapValue] of Object.entries(NORWEGIAN_BODY_PARTS)) {
          if (key.replace(/_/g, '').toLowerCase() === simplified) {
            return mapValue;
          }
        }
      }

      // Format the underscored term to be more readable
      return term
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }

    // For dietary preferences, try direct mapping
    if (translationPrefix === 'profile.diet') {
      // Try to find a match in our dietary mapping
      const dietKey = Object.keys(DIETARY_TRANSLATION_MAP).find(
        (key) => key.toLowerCase() === term.toLowerCase()
      );

      if (dietKey) {
        try {
          const translated = t(DIETARY_TRANSLATION_MAP[dietKey]);
          if (translated !== DIETARY_TRANSLATION_MAP[dietKey]) {
            return translated;
          }
        } catch {
          // Continue to other methods if this fails
        }
      }
    }

    // Try with original format
    try {
      const translatedDirect = t(`${translationPrefix}.${term}`);
      if (translatedDirect !== `${translationPrefix}.${term}`) {
        return translatedDirect;
      }
    } catch {
      // Continue to other methods if this fails
    }

    // Try with lowercase and no spaces
    try {
      const formattedKey = `${translationPrefix}.${term.toLowerCase().replace(/\s+/g, '').replace(/-/g, '')}`;
      const translated = t(formattedKey);
      if (translated !== formattedKey) {
        return translated;
      }
    } catch {
      // Continue to other methods if this fails
    }

    // Return formatted original if all translation attempts fail
    return term
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  };

  // Handle array values
  if (Array.isArray(value)) {
    return (
      <>
        {value.map((item, index) => (
          <Fragment key={index}>
            {index > 0 && ', '}
            {translateTerm(item)}
          </Fragment>
        ))}
      </>
    );
  }

  // Handle single string value
  return <>{translateTerm(value)}</>;
}

