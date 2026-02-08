import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Exercise, ProgramDay, getDayType } from '@/app/types/program';
import ExerciseCard from './ExerciseCard';
// import Chip from './Chip';
import BodyPartFilter from './BodyPartFilter';
import EquipmentFilter from './EquipmentFilter';
import { useTranslation } from '@/app/i18n/TranslationContext';
import InfoBadge from './InfoBadge';
import { TextButton } from './TextButton';
import { useWorkoutSession, getWorkoutProgress } from '@/app/hooks/useWorkoutSession';
import WorkoutFAB from './WorkoutFAB';
import WorkoutSession from './WorkoutSession';

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
  /** Called when workout is completed */
  onWorkoutComplete?: () => void;
  /** Called when user restarts a completed workout (resets completion) */
  onWorkoutRestart?: () => void;
  /** Called when user marks a missed past day as completed */
  onMarkComplete?: () => void;
  /** Hide the workout FAB (e.g., for rest days or when viewing past days) */
  hideWorkoutFAB?: boolean;
  /** Whether this day is in the past (already passed on the calendar) */
  isPastDay?: boolean;
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
  onWorkoutComplete,
  onWorkoutRestart,
  onMarkComplete,
  hideWorkoutFAB = false,
  isPastDay = false,
}: ProgramDayComponentProps) {
  const { t } = useTranslation();
  // State to track removed body parts and equipment
  const [removedBodyParts, setRemovedBodyParts] = useState<string[]>([]);
  const [removedEquipment, setRemovedEquipment] = useState<string[]>([]);
  // State to track if title is being hovered
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  // State to track viewport width for responsive adjustments
  const [_isMobile, setIsMobile] = useState(false);
  // Workout session state
  const [session, sessionActions] = useWorkoutSession();
  const [showWorkoutSession, setShowWorkoutSession] = useState(false);

  // Get all unique body parts from exercises
  const allBodyParts = useMemo(() => {
    return Array.from(
    new Set(
      day.exercises?.map((exercise) => exercise.bodyPart).filter(Boolean) || []
    )
  ).sort();
  }, [day.exercises]);

  // Get all unique equipment from exercises
  const allEquipment = useMemo(() => {
    return Array.from(
      new Set(
        day.exercises?.flatMap((exercise) => exercise.equipment || []).filter(Boolean) || []
      )
    ).sort();
  }, [day.exercises]);

  // Filter exercises based on removed body parts and equipment
  const filteredExercises = useMemo(() => {
    return day.exercises?.filter((exercise) => {
      // Body part filter: if exercise has no body part, show it
      if (exercise.bodyPart && removedBodyParts.includes(exercise.bodyPart)) {
        return false;
      }

      // Equipment filter: if exercise has equipment and ALL of its equipment is removed, hide it
      if (removedEquipment.length > 0 && exercise.equipment && exercise.equipment.length > 0) {
        const hasAllEquipmentRemoved = exercise.equipment.every((eq) => removedEquipment.includes(eq));
        if (hasAllEquipmentRemoved) return false;
      }

      return true;
    });
  }, [day.exercises, removedBodyParts, removedEquipment]);

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

  // Handle equipment filter changes
  const handleEquipmentFilterChange = (newRemovedEquipment: string[]) => {
    setRemovedEquipment(newRemovedEquipment);
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

  // Resume workout session once when an active session is first detected.
  // The flag prevents re-opening after the user minimizes.
  const hasResumed = useRef(false);
  useEffect(() => {
    if (hasResumed.current) return;
    if (!session.isActive || session.exercises.length === 0) return; // not loaded yet

    const sessionExerciseIds = session.exercises.map(e => e.id || e.exerciseId || e.name).join(',');
    const dayExerciseIds = (filteredExercises || [])
      .filter(e => !e.warmup)
      .map(e => e.id || e.exerciseId || e.name)
      .join(',');
    
    if (sessionExerciseIds === dayExerciseIds) {
      setShowWorkoutSession(true);
    }
    hasResumed.current = true;
  }, [session.isActive, session.exercises, filteredExercises]);

  // Handle starting workout
  const handleStartWorkout = useCallback(() => {
    const exercises = filteredExercises || [];
    if (exercises.length > 0) {
      sessionActions.startSession(exercises);
      setShowWorkoutSession(true);
    }
  }, [filteredExercises, sessionActions]);

  // Handle closing workout session (minimize to FAB)
  const handleCloseWorkoutSession = useCallback(() => {
    setShowWorkoutSession(false);
  }, []);

  // Handle workout completion
  const handleWorkoutComplete = useCallback(() => {
    onWorkoutComplete?.();
  }, [onWorkoutComplete]);

  // Check if the active session belongs to this day's exercises
  const sessionMatchesDay = useMemo(() => {
    if (!session.isActive || session.exercises.length === 0) return false;
    const sessionIds = session.exercises.map(e => e.id || e.exerciseId || e.name).join(',');
    const dayIds = (filteredExercises || [])
      .map(e => e.id || e.exerciseId || e.name)
      .join(',');
    return sessionIds === dayIds;
  }, [session.isActive, session.exercises, filteredExercises]);

  // Handle FAB click - resume if this day's session, otherwise start new
  const handleFABClick = useCallback(() => {
    if (session.isActive && sessionMatchesDay) {
      setShowWorkoutSession(true);
    } else {
      // Start new session (replaces any existing one from another day)
      handleStartWorkout();
    }
  }, [session.isActive, sessionMatchesDay, handleStartWorkout]);

  // Completion state
  const isCompleted = day.completed === true;

  const completedDateStr = useMemo(() => {
    if (!day.completedAt) return '';
    const d = day.completedAt instanceof Date ? day.completedAt : new Date(day.completedAt as unknown as string);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  }, [day.completedAt]);

  // Determine if FAB should be shown
  const dayType = getDayType(day);
  const hasExercises = (filteredExercises?.length ?? 0) > 0;

  const showFAB = !hideWorkoutFAB && hasExercises && dayType !== 'rest';
  const workoutProgress = getWorkoutProgress(session);

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

        {/* Completion / missed banner (only for signed-in users) */}
        {!hideWorkoutFAB && isCompleted ? (
          <div className="mb-4 rounded-xl bg-emerald-500/10 ring-1 ring-emerald-500/25 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-emerald-400 font-semibold text-sm">{t('workout.workoutComplete')}</p>
                {completedDateStr && (
                  <p className="text-emerald-400/60 text-xs mt-0.5">
                    {t('workout.completedOn').replace('{date}', completedDateStr)}
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : isPastDay && hasExercises && dayType !== 'rest' ? (
          <div className="mb-4 rounded-xl bg-amber-500/10 ring-1 ring-amber-500/25 px-4 py-3">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0">
                <svg className="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-amber-400 font-semibold text-sm">{t('workout.missed')}</p>
                <p className="text-amber-400/60 text-xs mt-0.5">{t('workout.missedDescription')}</p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onMarkComplete?.();
              }}
              className="mt-2 text-xs font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {t('workout.markCompleted')}
            </button>
          </div>
        ) : null}

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

      {/* Equipment Filter Section */}
      {allEquipment.length > 0 && (
        <EquipmentFilter
          equipmentList={allEquipment}
          onFilterChange={handleEquipmentFilterChange}
          initialRemovedEquipment={removedEquipment}
        />
      )}

      {/* Content section */}
      <div className="space-y-8 flex-1 pb-24 md:pb-8">
        {/* Optional exercises message for rest days */}
        {getDayType(day) === 'rest' && filteredExercises && filteredExercises.length > 0 && (
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
              onClick={() => { setRemovedBodyParts([]); setRemovedEquipment([]); }}
              className="mt-2"
            >
              {t('program.resetFilters')}
            </TextButton>
          </div>
        )}
      </div>

      {/* Workout FAB */}
      {showFAB && (
        <WorkoutFAB
          onClick={handleFABClick}
          isActive={session.isActive && sessionMatchesDay}
          progress={sessionMatchesDay ? workoutProgress : 0}
          completed={isCompleted && !session.isActive}
        />
      )}

      {/* Workout Session Modal */}
      {showWorkoutSession && session.isActive && (
        <WorkoutSession
          session={session}
          actions={sessionActions}
          onClose={handleCloseWorkoutSession}
          onVideoClick={onVideoClick}
          onComplete={handleWorkoutComplete}
          onRestart={onWorkoutRestart}
          estimatedDurationMin={day.duration}
        />
      )}
    </div>
  );
}
