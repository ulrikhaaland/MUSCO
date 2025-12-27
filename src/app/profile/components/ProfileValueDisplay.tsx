'use client';

import { Fragment } from 'react';
import { useTranslation } from '@/app/i18n';

interface ProfileValueDisplayProps {
  value: string | string[] | null | undefined;
  translationPrefix: string;
  fallback?: string;
}

/**
 * Displays profile values with translation support.
 * Uses simple i18n translation lookup - values should be stored 
 * in a format that matches translation keys (e.g., "Left Hand" for bodyParts.Left Hand)
 */
export default function ProfileValueDisplay({
  value,
  translationPrefix,
  fallback = 'profile.notSet',
}: ProfileValueDisplayProps) {
  const { t } = useTranslation();

  if (!value || (Array.isArray(value) && value.length === 0)) {
    return <>{t(fallback)}</>;
  }

  const translateTerm = (term: string): string => {
    // Try direct translation with the exact term
    const directKey = `${translationPrefix}.${term}`;
    const directTranslation = t(directKey);
    if (directTranslation !== directKey) {
      return directTranslation;
    }

    // Try with lowercase (handles case variations)
    const lowerKey = `${translationPrefix}.${term.toLowerCase()}`;
    const lowerTranslation = t(lowerKey);
    if (lowerTranslation !== lowerKey) {
      return lowerTranslation;
    }

    // Try converting snake_case to "Title Case" format
    // e.g., "left_hand" -> "Left Hand"
    if (term.includes('_')) {
      const titleCase = term
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      const titleKey = `${translationPrefix}.${titleCase}`;
      const titleTranslation = t(titleKey);
      if (titleTranslation !== titleKey) {
        return titleTranslation;
      }
    }

    // Try converting camelCase to "Title Case" format
    // e.g., "leftHand" -> "Left Hand"
    if (/[a-z][A-Z]/.test(term)) {
      const titleCase = term
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .replace(/^./, str => str.toUpperCase());
      const titleKey = `${translationPrefix}.${titleCase}`;
      const titleTranslation = t(titleKey);
      if (titleTranslation !== titleKey) {
        return titleTranslation;
      }
    }

    // Return the original term formatted nicely if no translation found
    return term
      .replace(/_/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/\b\w/g, c => c.toUpperCase());
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
