import React, { ReactNode, useState, useEffect } from 'react';
import { Exercise } from '@/app/types/program';
import Card from './Card';
import Chip from './Chip';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { ChevronDown, PlayIcon, ArrowUp, ArrowDown, SpinnerIcon } from '../icons';
import { PLACEHOLDER_VALUES } from '@/app/constants';
import { formatRestTime, formatMinutes } from '@/app/utils/timeUtils';

// Filter out placeholder values that shouldn't be displayed
const isPlaceholderValue = (value: string | undefined): boolean => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return PLACEHOLDER_VALUES.includes(normalized as typeof PLACEHOLDER_VALUES[number]) || normalized.length === 0;
};

interface ExerciseCardProps {
  exercise: Exercise;
  isExpanded?: boolean; // Controls whether details are shown
  onToggle?: () => void; // Called when the card header is clicked
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  compact?: boolean;
}

export default function ExerciseCard({
  exercise,
  isExpanded = true,
  onToggle,
  onVideoClick,
  loadingVideoExercise = null,
  compact = false,
}: ExerciseCardProps) {
  const { t } = useTranslation();
  
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Local UI state per exercise card
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  // Accessibility: detect user preference for reduced motion
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouching, setIsTouching] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Direct click handler
  const handleClick = () => {
    if (onToggle) {
      onToggle();
    }
  };

  // Handlers for touch feedback (mobile)
  const handleTouchStart = () => {
    if (!onToggle) return;
    setIsTouching(true);
    setTimeout(() => setIsTouching(false), 75);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setIsTouching(false);
    }
  };

  // Dynamic wrapper styles for interactive feedback
  const interactiveWrapperClasses = `
    rounded-xl overflow-hidden
    transition-all duration-120 ease-out
    ${onToggle ? 'outline outline-1 outline-indigo-500/20' : ''}
    ${onToggle && !prefersReducedMotion ? 'hover:-translate-y-[3px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] hover:outline-indigo-500/60' : ''}
    ${onToggle && prefersReducedMotion ? 'hover:outline-indigo-500/60' : ''}
    ${isTouching && !prefersReducedMotion ? 'scale-[0.98]' : ''}
    ${isTouching && prefersReducedMotion ? 'outline-indigo-500/60' : ''}
  `;

  // Function to get the translated body part name
  const getTranslatedBodyPart = (bodyPart: string) => {
    if (!bodyPart) return '';
    
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

  const getTruncatedDescription = (description: string, charLimit = 100) => {
    if (description.length <= charLimit) return description;
    const lastSpaceIndex = description.lastIndexOf(' ', charLimit);
    if (lastSpaceIndex === -1)
      return description.substring(0, charLimit) + '...';
    return description.substring(0, lastSpaceIndex) + '...';
  };

  const renderExerciseChips = (ex: Exercise): ReactNode[] => {
    const chips: ReactNode[] = [];

    // Cardio exercises use duration as their primary metric (sets/reps are placeholders)
    const isCardioExercise = 
      ex.bodyPart === "Cardio" || 
      ex.exerciseType?.includes('cardio');

    // Show sets × reps for non-cardio exercises that have them
    if (ex.sets && ex.repetitions && !isCardioExercise) {
      chips.push(
        <Chip key="sets-reps" size="lg" variant="subtle">
          {ex.sets} × {ex.repetitions}
        </Chip>
      );
      if (ex.restBetweenSets && ex.restBetweenSets !== 0) {
        chips.push(
          <Chip key="restBetweenSets" size="lg" variant="subtle">
            {formatRestTime(ex.restBetweenSets)} {t('calendar.rest').toLowerCase()}
          </Chip>
        );
      }
    } 
    // Show duration for cardio or exercises without sets/reps
    else if (ex.duration) {
      chips.push(
        <Chip key="duration" size="sm" variant="subtle">
          {formatMinutes(ex.duration)}
        </Chip>
      );
    }
    // Fallback: show sets × reps if available (e.g. cardio without duration)
    else if (ex.sets && ex.repetitions) {
      chips.push(
        <Chip key="sets-reps" size="lg" variant="subtle">
          {ex.sets} × {ex.repetitions}
        </Chip>
      );
    }

    return chips;
  };

  // Function to render the exercise metrics row (consistent between collapsed/expanded states)
  const renderExerciseMetricsRow = () => (
    <div className="flex flex-wrap gap-4 items-center">
      <div className="flex flex-wrap gap-2 justify-start">
        {renderExerciseChips(exercise)}
      </div>
      <div
        onClick={(e) => {
          e.stopPropagation();
          onVideoClick(exercise);
        }}
        className={`inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl ${
          compact ? 'text-xs' : 'text-sm'
        } transition-colors duration-200 cursor-pointer ml-auto`}
      >
        {(() => {
          const exerciseIdentifier =
            exercise.name || exercise.id || exercise.exerciseId;
          return loadingVideoExercise === exerciseIdentifier ? (
            <SpinnerIcon size={compact ? 'sm' : 'md'} />
          ) : (
            <PlayIcon size={compact ? 'sm' : 'md'} />
          );
        })()}
        <span>{t('program.watchVideo')}</span>
      </div>
    </div>
  );

  const exerciseId = exercise.id || exercise.exerciseId || exercise.name;

  return (
    <div
      className={interactiveWrapperClasses}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={() => setIsTouching(false)}
      tabIndex={onToggle ? 0 : -1}
      onKeyDown={(e) => {
        if (!onToggle) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <Card
        key={exerciseId}
        onClick={handleClick}
        isClickable={!!onToggle}
        title={
          <span className={isMobile ? 'tracking-tighter' : 'tracking-tight'}>
            {exercise.name}
          </span>
        }
        tag={
          <div className="flex items-center gap-2">
            {exercise.bodyPart && (
              <Chip
                size="md"
                variant={exercise.warmup ? 'warmup' : 'category'}
              >
                {getTranslatedBodyPart(exercise.bodyPart)}
              </Chip>
            )}
            {onToggle && (
              <ChevronDown 
                className="text-gray-400" 
                isRotated={isExpanded}
              />
            )}
          </div>
        }
      >
        {/* Metrics row – always visible */}
        <Card.Section>
          {renderExerciseMetricsRow()}
        </Card.Section>

        {/* Collapsible content */}
        <div
          className={`transition-all duration-300 ease-in-out overflow-hidden ${
            isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          {isExpanded && (
            <Card.Section className="pt-4">
              {/* Exercise description */}
              {exercise.description && (
                <section className="mb-4 space-y-1.5">
                  <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                    Description
                  </h3>
                  <div className="text-gray-300 leading-relaxed">
                    {isDescriptionExpanded
                      ? exercise.description
                      : getTruncatedDescription(exercise.description)}
                    {exercise.description.length > 100 && (
                      <button
                        className="ml-1 text-indigo-300 hover:text-indigo-200 text-sm font-medium"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDescriptionExpanded((prev) => !prev);
                        }}
                      >
                        {isDescriptionExpanded ? t('program.seeLess') : t('program.seeMore')}
                      </button>
                    )}
                  </div>
                </section>
              )}

              {exercise.modification && !isPlaceholderValue(exercise.modification) && (
                <section className="text-sm leading-relaxed mb-4 space-y-1">
                  <h3 className="font-semibold text-yellow-400 text-xs uppercase tracking-wide">
                    {t('program.modification')}
                  </h3>
                  <p className="text-gray-100">{exercise.modification}</p>
                </section>
              )}

              {exercise.precaution && !isPlaceholderValue(exercise.precaution) && (
                <section className="text-sm leading-relaxed mb-4 space-y-1">
                  <h3 className="font-semibold text-red-400 text-xs uppercase tracking-wide">
                    {t('program.precaution')}
                  </h3>
                  <p className="text-gray-100">{exercise.precaution}</p>
                </section>
              )}

              {exercise.steps && exercise.steps.length > 0 && (
                <section className="text-gray-300 text-sm leading-relaxed space-y-1.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                      Instructions
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowInstructions((prev) => !prev);
                      }}
                      className="text-indigo-300 hover:text-indigo-200 text-sm font-medium inline-flex items-center"
                    >
                      {showInstructions ? (
                        <>
                          <ArrowUp className="mr-1" />
                          {t('program.hideInstructions')}
                        </>
                      ) : (
                        <>
                          <ArrowDown className="mr-1" />
                          {t('program.viewInstructions')}
                        </>
                      )}
                    </button>
                  </div>
                  {showInstructions && (
                    <div className="mt-2">
                      <ol className="list-decimal pl-5 space-y-2 text-gray-300">
                        {exercise.steps.map((step, index) => (
                          <li key={index} className="leading-[1.4]">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </section>
              )}
            </Card.Section>
          )}
        </div>

        {/* When collapsed nothing else is rendered */}
      </Card>
    </div>
  );
}
