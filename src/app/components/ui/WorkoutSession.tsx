'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { Exercise } from '@/app/types/program';
import { 
  WorkoutSession as WorkoutSessionState, 
  WorkoutSessionActions,
  getRemainingRestTime,
  isWorkoutComplete,
  getWorkoutProgress,
  useElapsedTime,
  formatElapsedTime,
  getTotalCompletedSets,
} from '@/app/hooks/useWorkoutSession';
import { formatRestTime, formatMinutes } from '@/app/utils/timeUtils';
import { PLACEHOLDER_VALUES } from '@/app/constants';
import RestTimer from './RestTimer';

const isPlaceholderValue = (value: string | undefined): boolean => {
  if (!value) return true;
  const normalized = value.trim().toLowerCase();
  return PLACEHOLDER_VALUES.includes(normalized as typeof PLACEHOLDER_VALUES[number]) || normalized.length === 0;
};

interface WorkoutSessionProps {
  session: WorkoutSessionState;
  actions: WorkoutSessionActions;
  onClose: () => void;
  onVideoClick?: (exercise: Exercise) => void;
  onComplete?: () => void;
  /** Called when user restarts a previously completed workout */
  onRestart?: () => void;
  /** Estimated workout duration in minutes (from ProgramDay.duration) */
  estimatedDurationMin?: number;
}

type SlideDirection = 'right' | 'left' | null;

/**
 * Map exercise bodyPart string to a body part SVG illustration path.
 * Returns null if no matching image exists.
 */
function getBodyPartImage(bodyPart?: string): string | null {
  if (!bodyPart) return null;
  const lower = bodyPart.toLowerCase();

  const mapping: Record<string, string> = {
    'abdomen': '/images/bodyparts/abs.svg',
    'abs': '/images/bodyparts/abs.svg',
    'shoulders': '/images/bodyparts/shoulders.svg',
    'upper back': '/images/bodyparts/upper_back.svg',
    'lower back': '/images/bodyparts/lower_back.svg',
    'upper legs': '/images/bodyparts/quads.svg',
    'glutes': '/images/bodyparts/glutes.svg',
    'lower legs': '/images/bodyparts/calves.svg',
    'calves': '/images/bodyparts/calves.svg',
    'forearms': '/images/bodyparts/forearms.svg',
    'upper arms': '/images/bodyparts/biceps.svg',
    'chest': '/images/bodyparts/chest.svg',
    'lats': '/images/bodyparts/lats.svg',
    'hamstrings': '/images/bodyparts/hamstrings.svg',
    'triceps': '/images/bodyparts/triceps.svg',
    'obliques': '/images/bodyparts/obliques.svg',
    'biceps': '/images/bodyparts/biceps.svg',
    'quads': '/images/bodyparts/quads.svg',
  };

  return mapping[lower] ?? null;
}

/**
 * Full-screen workout session with rich visual design.
 * Features: exercise pills header, elapsed timer, card layout,
 * interactive set circles, swipe navigation, inline rest timer,
 * and celebration completion screen.
 */
export function WorkoutSession({
  session,
  actions,
  onClose,
  onVideoClick,
  onComplete,
  onRestart,
}: WorkoutSessionProps) {
  const { t } = useTranslation();

  // Derived state
  const currentExercise = session.exercises[session.currentExerciseIndex];
  const totalSets = currentExercise?.sets ?? 1;
  const restTime = currentExercise?.restBetweenSets ?? currentExercise?.rest ?? 60;
  const completedSetsForCurrent = session.completedSets[session.currentExerciseIndex] ?? 0;
  const workoutComplete = isWorkoutComplete(session);
  const progress = getWorkoutProgress(session);
  const isResting = session.restTimerEnd !== null && getRemainingRestTime(session.restTimerEnd) > 0;

  const canGoPrev = session.currentExerciseIndex > 0;
  const canGoNext = session.currentExerciseIndex < session.exercises.length - 1;
  const isLastSetOfCurrent = (session.currentSet >= totalSets);

  // Duration-based exercises: cardio exercises (which use duration as primary metric),
  // or exercises with duration but no sets/reps.
  // Warmup/stretching exercises that have sets and reps should use the sets/reps UI.
  const isCardioExercise = currentExercise && (
    currentExercise.bodyPart === 'Cardio' ||
    currentExercise.exerciseType?.includes('cardio')
  );
  const isDurationExercise = currentExercise && (
    (isCardioExercise && !!currentExercise.duration) ||
    (!currentExercise.sets && !currentExercise.repetitions && !!currentExercise.duration)
  );

  // Exit menu state
  const [showExitMenu, setShowExitMenu] = useState(false);
  // Exercise details panel
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  // One-shot visual attention animation for the elapsed chip
  const [showElapsedAttention, setShowElapsedAttention] = useState(false);
  // Duration exercise countdown end time
  const [durationTimerEnd, setDurationTimerEnd] = useState<Date | null>(null);

  const hasStarted = session.startTime !== null;
  // Elapsed time -- ticks only between "Start Workout" and workout completion
  const elapsedSeconds = useElapsedTime(session.startTime, hasStarted && !workoutComplete);

  // Slide animation direction
  const [slideDir, setSlideDir] = useState<SlideDirection>(null);
  const slideKey = useRef(0);

  // Swipe gesture tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 80;

  const triggerSlide = useCallback((dir: SlideDirection) => {
    slideKey.current += 1;
    setSlideDir(dir);
    setIsDescriptionExpanded(false);
    setDurationTimerEnd(null);
  }, []);

  // --- Handlers ---

  const handleCompleteSet = useCallback(() => {
    if (!hasStarted) {
      actions.markStarted();
      setShowElapsedAttention(true);
      // Reset completion status when restarting a workout
      onRestart?.();
      // Start duration countdown for duration exercises
      if (isDurationExercise && currentExercise?.duration) {
        setDurationTimerEnd(new Date(Date.now() + currentExercise.duration * 60 * 1000));
      }
      return;
    }
    // Clear duration timer when advancing
    setDurationTimerEnd(null);
    actions.completeSet();
  }, [actions, hasStarted, isDurationExercise, currentExercise, onRestart]);

  const handleFinishWorkout = useCallback(() => {
    onComplete?.();
    actions.endSession();
    onClose();
  }, [actions, onClose, onComplete]);

  // X button = minimize (most common intent)
  const handleMinimize = useCallback(() => {
    onClose();
  }, [onClose]);

  // End workout = destructive cancel with confirmation
  const handleCancelWorkout = useCallback(() => {
    setShowExitMenu(false);
    actions.endSession();
    onClose();
  }, [actions, onClose]);

  const handleNext = useCallback(() => {
    if (!canGoNext) return;
    triggerSlide('right');
    actions.goToNextExercise();
  }, [actions, canGoNext, triggerSlide]);

  const handlePrev = useCallback(() => {
    if (!canGoPrev) return;
    triggerSlide('left');
    actions.goToPrevExercise();
  }, [actions, canGoPrev, triggerSlide]);

  // Swipe handlers
  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const onTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    touchStartRef.current = null;

    // Only trigger if horizontal swipe is dominant
    if (dy > Math.abs(dx) * 0.7) return;
    if (Math.abs(dx) < SWIPE_THRESHOLD) return;

    if (dx < 0 && canGoNext) {
      handleNext();
    } else if (dx > 0 && canGoPrev) {
      handlePrev();
    }
  }, [canGoNext, canGoPrev, handleNext, handlePrev]);

  // Prevent body scroll while workout session is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!currentExercise && !workoutComplete) return null;

  // --- Set circles ---
  const renderSetCircles = () => (
    <div className="flex items-center justify-center gap-2.5 md:gap-3 my-3 md:my-6">
      {Array.from({ length: totalSets }, (_, i) => {
        const isDone = i < completedSetsForCurrent;
        const isCurrent = i === completedSetsForCurrent && !isResting;

        return (
          <div
            key={i}
            className={`
              w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isDone 
                ? 'bg-indigo-500 shadow-md shadow-indigo-500/35 animate-set-complete' 
                : isCurrent 
                  ? 'ring-2 ring-indigo-400 bg-indigo-500/20 shadow-md shadow-indigo-500/30 animate-pulse-subtle' 
                  : 'ring-1 ring-gray-500/80 bg-transparent'
              }
            `}
          >
            {isDone ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className={`text-xs md:text-sm font-semibold ${isCurrent ? 'text-indigo-100' : 'text-gray-500'}`}>
                {i + 1}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );

  // --- Completion screen ---
  if (workoutComplete) {
    const totalCompletedSets = getTotalCompletedSets(session);
    const completionRingSize = 160;
    const completionStroke = 8;
    const completionRadius = (completionRingSize - completionStroke) / 2;
    const completionCircumference = 2 * Math.PI * completionRadius;

    return (
      <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center px-6">
        <div className="animate-celebration-in flex flex-col items-center">
          {/* Animated completion ring */}
          <div className="relative mb-8">
            <svg
              width={completionRingSize}
              height={completionRingSize}
              className="-rotate-90"
              style={{ '--ring-circumference': `${completionCircumference}px` } as React.CSSProperties}
            >
              <circle
                cx={completionRingSize / 2}
                cy={completionRingSize / 2}
                r={completionRadius}
                fill="none"
                stroke="rgba(34, 197, 94, 0.15)"
                strokeWidth={completionStroke}
              />
              <circle
                cx={completionRingSize / 2}
                cy={completionRingSize / 2}
                r={completionRadius}
                fill="none"
                stroke="#22c55e"
                strokeWidth={completionStroke}
                strokeLinecap="round"
                strokeDasharray={completionCircumference}
                strokeDashoffset={completionCircumference}
                className="animate-ring-draw"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>

          {/* Title */}
          <h2 className="text-3xl font-bold text-white mb-2">
            {t('workout.workoutComplete')}
          </h2>

          {/* Duration */}
          <p className="text-xl text-gray-400 mb-8 tabular-nums">
            {formatElapsedTime(elapsedSeconds)}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-6 mb-10">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{session.exercises.length}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t('workout.exercisesCompleted')}</div>
            </div>
            <div className="w-px h-8 bg-gray-700" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">{totalCompletedSets}</div>
              <div className="text-xs text-gray-500 uppercase tracking-wider">{t('workout.setsCompleted')}</div>
            </div>
          </div>

          {/* Finish button */}
          <button
            onClick={handleFinishWorkout}
            className="
              w-full max-w-xs py-4 rounded-2xl
              bg-gradient-to-r from-emerald-600 to-emerald-500
              hover:from-emerald-500 hover:to-emerald-400
              text-white text-lg font-semibold
              transition-all duration-200
              active:scale-[0.96]
              shadow-lg shadow-emerald-600/20
            "
          >
            {t('workout.finishWorkout')}
          </button>
        </div>
      </div>
    );
  }

  // --- Slide animation class ---
  const slideClass = slideDir === 'right' 
    ? 'animate-slide-in-right' 
    : slideDir === 'left' 
      ? 'animate-slide-in-left' 
      : 'animate-scale-in';

  // --- Previous/next exercise names for footer ---
  const prevExName = canGoPrev
    ? session.exercises[session.currentExerciseIndex - 1]?.name ?? ''
    : '';
  const nextExName = canGoNext
    ? session.exercises[session.currentExerciseIndex + 1]?.name ?? ''
    : '';
  return (
    <div 
      className="fixed inset-0 z-[100] bg-gray-900 flex flex-col overflow-x-hidden"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── End workout menu overlay ── */}
      {showExitMenu && (
        <div className="absolute inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-center justify-center px-6 animate-scale-in">
          <div className="bg-gray-800 ring-1 ring-gray-700/60 rounded-2xl p-6 w-full max-w-xs space-y-3">
            <p className="text-white font-semibold text-center mb-1">
              {t('workout.endWorkout')}
            </p>
            <p className="text-gray-400 text-sm text-center mb-4">
              {t('workout.endWorkoutConfirm')}
            </p>
            <button
              onClick={() => {
                setShowExitMenu(false);
                onComplete?.();
                actions.endSession();
                onClose();
              }}
              className="
                w-full py-3 rounded-xl text-sm font-medium
                bg-emerald-500/15 hover:bg-emerald-500/25 active:bg-emerald-500/35
                ring-1 ring-emerald-500/30
                text-emerald-400 transition-colors
              "
            >
              {t('workout.markCompleted')}
            </button>
            <button
              onClick={handleCancelWorkout}
              className="
                w-full py-3 rounded-xl text-sm font-medium
                bg-red-500/15 hover:bg-red-500/25 active:bg-red-500/35
                ring-1 ring-red-500/30
                text-red-400 transition-colors
              "
            >
              {t('workout.discardWorkout')}
            </button>
            <button
              onClick={() => setShowExitMenu(false)}
              className="
                w-full py-3 rounded-xl text-sm font-medium
                text-gray-500 hover:text-gray-400 transition-colors
              "
            >
              {t('workout.continueWorkout')}
            </button>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <header className="grid grid-cols-[1fr_auto_1fr] items-center px-3 md:px-4 py-3 bg-gray-900 border-b border-gray-800/60">
        {/* Left: end workout */}
        <button
          onClick={() => setShowExitMenu(true)}
          className="
            justify-self-start inline-flex items-center
            px-2.5 py-1 rounded-full
            text-sm font-semibold text-red-300
            bg-red-500/10 hover:bg-red-500/15 active:bg-red-500/20
            ring-1 ring-red-500/25
            transition-colors
          "
        >
          {t('workout.endWorkout')}
        </button>

        {/* Center: elapsed timer */}
        <div
          className={`
            justify-self-center inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full
            bg-gray-800/70 ring-2 ring-indigo-400/40 text-gray-300
            ${showElapsedAttention ? 'animate-elapsed-attention' : ''}
          `}
          onAnimationEnd={() => {
            if (showElapsedAttention) setShowElapsedAttention(false);
          }}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-[10px] uppercase tracking-wide text-gray-500">Elapsed</span>
          <span className="text-sm font-medium tabular-nums">{formatElapsedTime(elapsedSeconds)}</span>
        </div>

        {/* Right: minimize (X) */}
        <button
          onClick={handleMinimize}
          className="justify-self-end p-2 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors"
          aria-label="Minimize"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col px-4 pt-4 pb-4 overflow-y-auto">
        {/* Exercise card -- fills available space with background illustration */}
        <div 
          key={`exercise-${session.currentExerciseIndex}-${slideKey.current}`}
          className={`
            relative w-full max-w-lg mx-auto flex-1 flex flex-col
            bg-gradient-to-b from-gray-800/60 to-gray-800/20
            ring-1 ring-gray-700/40
            rounded-2xl p-5 overflow-hidden
            ${slideClass}
          `}
        >
          {/* Card content */}
          <div className="relative z-10 flex-1 flex flex-col min-h-0">
            {/* Exercise name + video */}
            <div className="flex items-start justify-between mb-2">
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight flex-1 min-w-0 pr-3">
                {currentExercise.name}
              </h1>
              {onVideoClick && (
                <button
                  onClick={() => onVideoClick(currentExercise)}
                  className="
                    inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl
                    bg-indigo-600/20 hover:bg-indigo-600/30 active:bg-indigo-600/40
                    ring-1 ring-indigo-500/30
                    transition-colors duration-150
                    text-sm font-medium text-white flex-shrink-0
                  "
                  aria-label="Watch video"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Video
                </button>
              )}
            </div>

            {/* Collapsible exercise details */}
            {(() => {
              const hasDesc = currentExercise.description && !isPlaceholderValue(currentExercise.description) && !currentExercise.description.toLowerCase().includes('no description');
              const hasPrecaution = !isPlaceholderValue(currentExercise.precaution);
              const hasModification = !isPlaceholderValue(currentExercise.modification);
              const hasSteps = currentExercise.steps && currentExercise.steps.length > 0;
              const hasAnyInfo = hasDesc || hasPrecaution || hasModification || hasSteps;

              if (!hasAnyInfo) return null;

              return (
                <div className={`mb-2 ${isDescriptionExpanded ? 'flex-1 min-h-0 flex flex-col' : ''}`}>
                  <button
                    onClick={() => setIsDescriptionExpanded(prev => !prev)}
                    className="inline-flex items-center gap-1 text-sm font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
                  >
                    <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isDescriptionExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                    </svg>
                    {isDescriptionExpanded ? t('program.seeLess') : t('workout.exerciseInfo')}
                  </button>

                  {isDescriptionExpanded && (
                    <div className="mt-2 space-y-2 text-sm leading-7 overflow-y-auto pr-1">
                      {hasDesc && (
                        <section className="space-y-1.5">
                          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Description
                          </h3>
                          <p className="text-gray-300">{currentExercise.description}</p>
                        </section>
                      )}
                      {hasPrecaution && (
                        <section className="space-y-1">
                          <h3 className="font-semibold text-red-400 text-[11px] uppercase tracking-[0.14em]">
                            {t('program.precaution')}
                          </h3>
                          <p className="text-gray-200">{currentExercise.precaution}</p>
                        </section>
                      )}
                      {hasModification && (
                        <section className="space-y-1">
                          <h3 className="font-semibold text-yellow-400 text-[11px] uppercase tracking-[0.14em]">
                            {t('program.modification')}
                          </h3>
                          <p className="text-gray-200">{currentExercise.modification}</p>
                        </section>
                      )}
                      {hasSteps && (
                        <section className="space-y-1.5">
                          <h3 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-gray-500">
                            Instructions
                          </h3>
                          <ol className="list-decimal pl-5 space-y-1.5 text-gray-300">
                            {currentExercise.steps!.map((step, i) => (
                              <li key={i} className="leading-8">{step}</li>
                            ))}
                          </ol>
                        </section>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Body part illustration + label -- hidden when details expanded */}
            {!isDescriptionExpanded && (() => {
              const imgSrc = getBodyPartImage(currentExercise.bodyPart);
              return (
                <div className="relative flex-1 min-h-0 my-2 md:my-4">
                  <div className="absolute inset-0 flex flex-col items-center justify-center py-2 md:py-4">
                    {currentExercise.bodyPart && (
                      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-300 mb-1">
                        {currentExercise.bodyPart}
                      </span>
                    )}
                    {imgSrc && (
                      <Image
                        src={imgSrc}
                        alt=""
                        width={400}
                        height={400}
                        className="opacity-[0.35] object-contain select-none w-full h-full"
                        draggable={false}
                        priority={false}
                      />
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Bottom: exercise metrics + CTA */}
            <div className="flex flex-col items-center w-full shrink-0 mt-2 pt-3 md:pt-4 border-t border-white/10 bg-gradient-to-t from-gray-900/35 to-transparent">
              {isDurationExercise ? (
                <>
                  {/* Duration countdown or static display */}
                  {currentExercise.duration && (
                    durationTimerEnd ? (
                      <DurationCountdown 
                        endTime={durationTimerEnd} 
                        totalSeconds={currentExercise.duration * 60} 
                      />
                    ) : (
                      <div className="text-center mb-2 md:mb-4">
                        <span className="text-3xl md:text-4xl font-bold text-white">
                          {formatMinutes(currentExercise.duration)}
                        </span>
                      </div>
                    )
                  )}

                  {/* CTA */}
                  <div className="pt-2 md:pt-4 w-full">
                    <button
                      onClick={handleCompleteSet}
                      className={`
                        w-full py-3 md:py-4 rounded-xl md:rounded-2xl
                        text-white text-base md:text-lg font-semibold
                        transition-all duration-150
                        active:scale-[0.96]
                        shadow-lg
                        ${!canGoNext
                          ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-600/20'
                          : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/20'
                        }
                      `}
                    >
                      {!hasStarted
                        ? t('workout.startWorkout')
                        : canGoNext ? t('workout.nextExercise') : t('workout.completeWorkout')
                      }
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Sets × Reps + rest info */}
                  {!isResting && (
                    <div className="text-center mb-2 md:mb-4">
                      <div className="flex items-baseline justify-center gap-2 md:gap-3">
                        <span className="text-4xl md:text-5xl font-bold text-white tabular-nums">{totalSets}</span>
                        <span className="text-xl md:text-2xl text-gray-500 font-light">×</span>
                        <span className="text-4xl md:text-5xl font-bold text-white tabular-nums">
                          {currentExercise.repetitions ?? '—'}
                        </span>
                      </div>
                      {restTime > 0 && (
                        <p className="text-gray-500 text-xs md:text-sm mt-0.5 md:mt-1">
                          {formatRestTime(restTime)} {t('workout.restTime').toLowerCase()}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Set circles or rest timer */}
                  {isResting && session.restTimerEnd ? (
                    <RestTimer
                      endTime={session.restTimerEnd}
                      totalSeconds={restTime}
                      onSkip={actions.skipRest}
                      onExtend={(s) => actions.extendRest(s)}
                    />
                  ) : (
                    <>
                      {renderSetCircles()}

                      {/* CTA Button */}
                      <div className="pt-2 md:pt-4 w-full">
                        <button
                          onClick={handleCompleteSet}
                          className={`
                            w-full py-3 md:py-4 rounded-xl md:rounded-2xl
                            text-white text-base md:text-lg font-semibold
                            transition-all duration-150
                            active:scale-[0.96]
                            shadow-lg
                            ${isLastSetOfCurrent && !canGoNext
                              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-600/20'
                              : isLastSetOfCurrent
                                ? 'bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-400 hover:to-violet-400 shadow-indigo-600/20'
                                : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-600/20'
                            }
                          `}
                        >
                          {!hasStarted
                            ? t('workout.startWorkout')
                            : isLastSetOfCurrent
                              ? (canGoNext ? t('workout.nextExercise') : t('workout.completeWorkout'))
                              : t('workout.completeSet')
                          }
                        </button>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── Progress bar ── */}
      <div className="relative h-5 bg-gray-800/60 flex items-center">
        <div 
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
        <span className="relative z-10 w-full text-center text-[10px] font-bold text-white tabular-nums drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">
          {progress}%
        </span>
      </div>

      {/* ── Navigation footer ── */}
      <footer
        className="flex items-center justify-between px-4 py-3 bg-gray-900"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        {/* Previous */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`
            flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl w-[120px]
            transition-colors duration-200
            ${canGoPrev 
              ? 'text-gray-300 hover:bg-gray-800 active:bg-gray-700' 
              : 'text-gray-700 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {prevExName && (
            <span className="text-[13px] text-gray-400 max-w-[120px] truncate">{prevExName}</span>
          )}
        </button>

        {/* Exercise counter */}
        <span className="text-sm text-gray-300 tabular-nums">
          {session.currentExerciseIndex + 1} / {session.exercises.length}
        </span>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`
            flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl w-[120px]
            transition-colors duration-200
            ${canGoNext 
              ? 'text-gray-300 hover:bg-gray-800 active:bg-gray-700' 
              : 'text-gray-700 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {nextExName && (
            <span className="text-[13px] text-gray-400 max-w-[120px] truncate">{nextExName}</span>
          )}
        </button>
      </footer>
    </div>
  );
}

/**
 * Inline countdown timer for duration-based exercises.
 * Shows a circular progress ring with time remaining.
 */
function DurationCountdown({ endTime, totalSeconds }: { endTime: Date; totalSeconds: number }) {
  const [remaining, setRemaining] = useState(totalSeconds);

  useEffect(() => {
    const update = () => {
      const ms = Math.max(0, endTime.getTime() - Date.now());
      setRemaining(Math.ceil(ms / 1000));
    };
    update();
    const interval = setInterval(update, 200);
    return () => clearInterval(interval);
  }, [endTime]);

  const progress = totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
  const size = 120;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - progress * circumference;

  const mins = Math.floor(remaining / 60);
  const secs = remaining % 60;
  const display = mins > 0
    ? `${mins}:${secs.toString().padStart(2, '0')}`
    : `${secs}`;

  const isDone = remaining <= 0;

  return (
    <div className="flex flex-col items-center mb-4">
      <div className={`relative ${isDone ? '' : 'animate-breathe'}`}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none" stroke="rgba(99, 102, 241, 0.12)" strokeWidth={strokeWidth}
          />
          <circle
            cx={size / 2} cy={size / 2} r={radius}
            fill="none"
            stroke={isDone ? '#22c55e' : '#6366f1'}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-200"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          {isDone ? (
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <span className="text-3xl font-bold text-white tabular-nums">{display}</span>
          )}
        </div>
      </div>
      {isDone && (
        <span className="text-sm text-green-400 font-medium mt-2">Done!</span>
      )}
    </div>
  );
}

export default WorkoutSession;
