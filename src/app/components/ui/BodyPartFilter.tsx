import React, { useState, useEffect } from 'react';
import Chip from './Chip';
import { useTranslation } from '@/app/i18n';

interface BodyPartFilterProps {
  bodyParts: string[];
  onFilterChange: (removedBodyParts: string[]) => void;
  initialRemovedBodyParts?: string[];
}

export function BodyPartFilter({
  bodyParts,
  onFilterChange,
  initialRemovedBodyParts = [],
}: BodyPartFilterProps) {
  const { t } = useTranslation();
  // State to track removed body parts
  const [removedBodyParts, setRemovedBodyParts] = useState<string[]>(initialRemovedBodyParts);

  // Call onFilterChange when removedBodyParts changes
  useEffect(() => {
    onFilterChange(removedBodyParts);
  }, [removedBodyParts, onFilterChange]);

  // Toggle body part filter
  const toggleBodyPart = (bodyPart: string) => {
    setRemovedBodyParts((prev) => 
      prev.includes(bodyPart)
        ? prev.filter((part) => part !== bodyPart)
        : [...prev, bodyPart]
    );
  };

  // Reset filters
  const resetFilters = () => {
    setRemovedBodyParts([]);
  };

  // Function to get the translated body part name
  const getTranslatedBodyPart = (bodyPart: string) => {
    // First try with bodyPart.category prefix (for standard categories)
    const translationKey = `bodyPart.category.${bodyPart}`;
    const translated = t(translationKey as any);
    // If translation returns the key itself, it means no translation was found
    if (translated && translated !== translationKey) return translated;
    
    // Fallback to program.bodyPart prefix for other body parts
    const fallbackKey = `program.bodyPart.${bodyPart.toLowerCase().replace(/ /g, '_')}`;
    const fallbackTranslated = t(fallbackKey as any);
    if (fallbackTranslated && fallbackTranslated !== fallbackKey) return fallbackTranslated;
    
    // Return the original bodyPart name if no translation found
    return bodyPart;
  };

  return (
    <div className="mb-4">
      <h4 className="text-gray-50 font-medium mb-4">{t('exerciseFeedbackSelector.targetBodyParts')}</h4>
      <div className="flex flex-wrap gap-2 pb-2">
        {bodyParts.map((bodyPart) => (
          <Chip
            key={bodyPart}
            onClick={() => toggleBodyPart(bodyPart)}
            size="md"
            variant={removedBodyParts.includes(bodyPart) ? 'inactive' : 'default'}
            className={`bg-transparent border whitespace-nowrap ${
              removedBodyParts.includes(bodyPart)
                ? 'border-gray-600 text-gray-400/80 line-through'
                : bodyPart.toLowerCase() === 'warmup'
                  ? 'border-amber-600 text-brand-text-light'
                  : 'border-brand text-brand-text-light'
            } transition-colors`}
            icon={
              removedBodyParts.includes(bodyPart) ? (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )
            }
          >
            {getTranslatedBodyPart(bodyPart)}
          </Chip>
        ))}
      </div>
      
      {removedBodyParts.length > 0 && (
        <button
          onClick={resetFilters}
          className="text-indigo-300 hover:text-indigo-200 mt-2 text-sm underline"
        >
          {t('program.resetFilters')}
        </button>
      )}
    </div>
  );
}

export default BodyPartFilter; 