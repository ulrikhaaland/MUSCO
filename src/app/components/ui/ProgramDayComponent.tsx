import { useState, useRef, useEffect, useMemo } from 'react';
import { Exercise, ProgramDay } from '@/app/types/program';
import ExerciseCard from './ExerciseCard';
// import Chip from './Chip';
import BodyPartFilter from './BodyPartFilter';
import { useTranslation } from '@/app/i18n/TranslationContext';
import InfoBadge from './InfoBadge';
import { TextButton } from './TextButton';

interface ProgramDayComponentProps {
  day: ProgramDay;
  dayName: string;
  date?: string;
  expandedExercises?: string[];
  onExerciseToggle?: (exerciseName: string) => void;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  compact?: boolean;
  onClick?: () => void;
  programTitle?: string;
  onTitleClick?: () => void;
}

export function ProgramDayComponent({
  day,
  dayName: _dayName,
  date: _date,
  expandedExercises = [],
  onExerciseToggle,
  onVideoClick,
  loadingVideoExercise,
  compact = false,
  onClick,
  programTitle,
  onTitleClick,
}: ProgramDayComponentProps) {
  const { t } = useTranslation();
  // State to track removed body parts
  const [removedBodyParts, setRemovedBodyParts] = useState<string[]>([]);
  // State to track if title is being hovered
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  // State to track viewport width for responsive adjustments
  const [_isMobile, setIsMobile] = useState(false);

  // Get all unique body parts from exercises
  const allBodyParts = useMemo(() => {
    return Array.from(
    new Set(
      day.exercises?.map((exercise) => exercise.bodyPart).filter(Boolean) || []
    )
  ).sort();
  }, [day.exercises]);

  // Filter exercises based on removed body parts
  const filteredExercises = useMemo(() => {
    return day.exercises?.filter((exercise) => {
    // If exercise has no body part, show it
    if (!exercise.bodyPart) return true;

    // Only filter out if the exercise's body part is in the removed list
    return !removedBodyParts.includes(exercise.bodyPart);
  });
  }, [day.exercises, removedBodyParts]);

  // Auto-expand the single exercise when only one is available
  const hasAutoExpandedRef = useRef(false);
  useEffect(() => {
    if (hasAutoExpandedRef.current) return;
    if (!onExerciseToggle) return; // controlled by parent; if no handler we already expand all
    const onlyOne = Array.isArray(filteredExercises) && filteredExercises.length === 1;
    if (!onlyOne) return;
    const soleExercise = filteredExercises[0];
    if (!soleExercise) return;
    const isAlreadyExpanded = Array.isArray(expandedExercises)
      ? expandedExercises.includes(soleExercise.name)
      : false;
    if (!isAlreadyExpanded) {
      onExerciseToggle(soleExercise.name);
    }
    hasAutoExpandedRef.current = true;
  }, [filteredExercises, expandedExercises, onExerciseToggle]);

  // Handle body part filter changes
  const handleBodyPartFilterChange = (newRemovedBodyParts: string[]) => {
    setRemovedBodyParts(newRemovedBodyParts);
  };

  // Check if viewport is mobile sized
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  return (
    <div className="h-full flex flex-col" onClick={onClick}>
      {/* Header section - Removed negative margins to prevent overflow */}
      <div className="bg-gray-900/95 backdrop-blur-sm py-4">
        {programTitle && (
          <div className="mb-4">
            <button
              className={`text-lg font-medium text-indigo-200 transition-all flex items-center py-2 -ml-2 pl-2 pr-3 rounded-xl ${
                isTitleHovered ? 'bg-indigo-900/30 text-indigo-100' : ''
              } hover:bg-indigo-900/30 hover:text-indigo-100 active:bg-indigo-900/50 active:scale-[0.99] w-auto`}
              onClick={(e) => {
                e.stopPropagation();
                if (onTitleClick) onTitleClick();
              }}
              onMouseEnter={() => setIsTitleHovered(true)}
              onMouseLeave={() => setIsTitleHovered(false)}
            >
              {programTitle}
              {onTitleClick && (
                <svg
                  className={`w-5 h-5 ml-2 transition-transform duration-200 ${
                    isTitleHovered ? 'translate-x-1' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </div>
        )}

        {/* Workout duration badge */}
        <div className="mb-4">
          <InfoBadge
            label={t('profile.fields.workoutDuration')}
            value={day.duration}
            unit={t('program.minutes')}
            icon={
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.75}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            }
          />
        </div>

        <p className="text-gray-50 leading-relaxed">{day.description}</p>
      </div>

      {/* Body Parts Filter Section */}
      {allBodyParts.length > 0 && (
        <BodyPartFilter
          bodyParts={allBodyParts}
          onFilterChange={handleBodyPartFilterChange}
          initialRemovedBodyParts={removedBodyParts}
              />
      )}

      {/* Content section */}
      <div className="space-y-8 flex-1 pb-24 md:pb-8">
        {/* Optional exercises message for rest days */}
        {day.isRestDay && filteredExercises && filteredExercises.length > 0 && (
          <div className="mb-8">
            <h4 className="text-indigo-300 font-medium">
              {t('program.optionalRecoveryActivities').charAt(0).toUpperCase() + t('program.optionalRecoveryActivities').slice(1)}
            </h4>
            <p className="text-gray-300 text-sm mt-1">
              {t('program.recoveryMessage')}
            </p>
          </div>
        )}

        {/* Exercise list - same for both rest days and workout days */}
        {filteredExercises && filteredExercises.length > 0 ? (
          <div className="space-y-8">
            {filteredExercises.map((exercise, index) => {
              const _exerciseId =
                exercise.id || exercise.exerciseId || exercise.name;
              const isExpanded =
                !onExerciseToggle || expandedExercises.includes(exercise.name);

              return (
                <ExerciseCard
                  key={`${exercise.id || exercise.exerciseId || exercise.name}-${index}`}
                  exercise={exercise}
                  isExpanded={isExpanded}
                  onToggle={() => onExerciseToggle?.(exercise.name)}
                  onVideoClick={onVideoClick}
                  loadingVideoExercise={loadingVideoExercise}
                  compact={compact}
                />
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-300">
              {t('program.noExercises')}
            </p>
            <TextButton
              onClick={() => setRemovedBodyParts([])}
              className="mt-2"
            >
              {t('program.resetFilters')}
            </TextButton>
          </div>
        )}
      </div>
    </div>
  );
}
