import React, { ReactNode, useState, useEffect } from 'react';
import { Exercise } from '@/app/types/program';
import Card from './Card';
import Chip from './Chip';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { ChevronDown, PlayIcon, ArrowUp, ArrowDown, SpinnerIcon } from '../icons';

// Filter out placeholder values that shouldn't be displayed
const PLACEHOLDER_VALUES = ['ingen', 'none', 'optional', 'n/a', 'null', 'undefined', '-'];
const isPlaceholderValue = (value: string | undefined): boolean => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return PLACEHOLDER_VALUES.includes(normalized) || normalized.length === 0;
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

    // Determine if this is a duration-based exercise (cardio, warmup, stretching)
    const isDurationExercise = 
      ex.bodyPart === "Cardio" || 
      ex.bodyPart === "Warmup" ||
      ex.warmup === true ||
      ex.exerciseType?.includes('cardio') ||
      ex.exerciseType?.includes('warmup') ||
      ex.exerciseType?.includes('stretching');

    // Show sets × reps for strength exercises
    if (ex.sets && ex.repetitions && !isDurationExercise) {
      chips.push(
        <Chip key="sets-reps" size="lg" variant="subtle">
          {ex.sets} × {ex.repetitions}
        </Chip>
      );
      if (ex.restBetweenSets && ex.restBetweenSets !== 0) {
        chips.push(
          <Chip key="restBetweenSets" size="lg" variant="subtle">
            {t('program.rest', { seconds: ex.restBetweenSets.toString() })}
          </Chip>
        );
      }
    } 
    // Show duration for cardio/warmup/stretching exercises
    else if (ex.duration && isDurationExercise) {
      chips.push(
        <Chip key="duration" size="sm" variant="subtle">
          {ex.duration >= 60
            ? `${Math.floor(ex.duration / 60)} min${ex.duration % 60 > 0 ? ` ${ex.duration % 60} sec` : ''}`
            : `${ex.duration} min`}
        </Chip>
      );
    }
    // Fallback: show sets × reps if available
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
            <Card.Section className="pt-4 space-y-4">
              {/* Exercise description */}
              {exercise.description && (
                <div className="text-gray-300 text-sm leading-relaxed">
                  <p>
                    {isDescriptionExpanded
                      ? exercise.description
                      : getTruncatedDescription(exercise.description)}
                  </p>
                  {exercise.description.length > 100 && (
                    <button
                      className="mt-1 text-indigo-400 hover:text-indigo-300 text-xs font-medium px-2 py-0.5 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDescriptionExpanded((prev) => !prev);
                      }}
                    >
                      {isDescriptionExpanded ? t('program.seeLess') : t('program.seeMore')}
                    </button>
                  )}
                </div>
              )}

              {/* Modification & Precaution container */}
              {((exercise.modification && !isPlaceholderValue(exercise.modification)) ||
                (exercise.precaution && !isPlaceholderValue(exercise.precaution))) && (
                <div className="bg-gray-800/50 rounded-lg p-3 space-y-2 border border-gray-700/50">
                  {exercise.modification && !isPlaceholderValue(exercise.modification) && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-yellow-400 flex-shrink-0 mt-0.5">⚙️</span>
                      <div>
                        <span className="text-yellow-300 font-medium">{t('program.modification')}</span>{' '}
                        <span className="text-yellow-200/80">{exercise.modification}</span>
                      </div>
                    </div>
                  )}

                  {exercise.precaution && !isPlaceholderValue(exercise.precaution) && (
                    <div className="flex items-start gap-2 text-sm">
                      <span className="text-red-400 flex-shrink-0 mt-0.5">⚠️</span>
                      <div>
                        <span className="text-red-400 font-medium">{t('program.precaution')}</span>{' '}
                        <span className="text-red-300/80">{exercise.precaution}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions section */}
              {exercise.steps && exercise.steps.length > 0 && (
                <div className="text-gray-300 text-sm">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowInstructions((prev) => !prev);
                    }}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-indigo-500/10 transition-colors"
                  >
                    {showInstructions ? (
                      <>
                        <ArrowUp className="w-4 h-4" />
                        {t('program.hideInstructions')}
                      </>
                    ) : (
                      <>
                        <ArrowDown className="w-4 h-4" />
                        {t('program.viewInstructions')}
                      </>
                    )}
                  </button>
                  {showInstructions && (
                    <div className="mt-3 pl-6 relative bg-gray-800/40 p-4 rounded-r-xl">
                      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-indigo-700/80 via-indigo-700/50 to-indigo-700/20 rounded-full" />
                      <ol className="list-decimal pl-5 space-y-2">
                        {exercise.steps.map((step, index) => (
                          <li key={index} className="leading-[1.4]">
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              )}
            </Card.Section>
          )}
        </div>

        {/* When collapsed nothing else is rendered */}
      </Card>
    </div>
  );
}
