'use client';

import React, { useCallback, useState, useRef, useEffect } from 'react';
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
import { formatRestTime } from '@/app/utils/timeUtils';
import RestTimer from './RestTimer';
import { Chip } from './Chip';

interface WorkoutSessionProps {
  session: WorkoutSessionState;
  actions: WorkoutSessionActions;
  onClose: () => void;
  onVideoClick?: (exercise: Exercise) => void;
  onComplete?: () => void;
}

type SlideDirection = 'right' | 'left' | null;

// Map exercise body parts to Chip variants
function getChipVariant(bodyPart?: string): 'strength' | 'cardio' | 'recovery' | 'warmup' | 'category' {
  if (!bodyPart) return 'category';
  const lower = bodyPart.toLowerCase();
  if (lower === 'cardio') return 'cardio';
  if (lower === 'warmup') return 'warmup';
  if (lower === 'recovery' || lower === 'stretching') return 'recovery';
  return 'strength';
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

  // Elapsed time
  const elapsedSeconds = useElapsedTime(session.startTime, session.isActive);

  // Slide animation direction
  const [slideDir, setSlideDir] = useState<SlideDirection>(null);
  const slideKey = useRef(0);

  // Swipe gesture tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);
  const SWIPE_THRESHOLD = 80;

  const triggerSlide = useCallback((dir: SlideDirection) => {
    slideKey.current += 1;
    setSlideDir(dir);
  }, []);

  // --- Handlers ---

  const handleCompleteSet = useCallback(() => {
    actions.completeSet();
    // If not last set (and not completing workout), the set circle will animate via CSS
  }, [actions]);

  const handleFinishWorkout = useCallback(() => {
    onComplete?.();
    actions.endSession();
    onClose();
  }, [actions, onClose, onComplete]);

  const handleExitWorkout = useCallback(() => {
    onClose();
  }, [onClose]);

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

  // --- Exercise pills for header ---
  const renderExercisePills = () => (
    <div className="flex items-center gap-1 overflow-hidden max-w-[50%]">
      {session.exercises.map((ex, i) => {
        const exSets = ex.sets ?? 1;
        const exCompleted = session.completedSets[i] ?? 0;
        const isDone = exCompleted >= exSets;
        const isCurrent = i === session.currentExerciseIndex;

        return (
          <button
            key={i}
            onClick={() => {
              if (i < session.currentExerciseIndex) {
                triggerSlide('left');
              } else if (i > session.currentExerciseIndex) {
                triggerSlide('right');
              }
              actions.goToExercise(i);
            }}
            className={`
              h-1.5 rounded-full transition-all duration-300 min-w-[6px]
              ${isCurrent 
                ? 'bg-indigo-500 flex-[2]' 
                : isDone 
                  ? 'bg-indigo-500/60 flex-1' 
                  : 'bg-gray-700 flex-1'
              }
              ${isCurrent ? 'animate-pulse-subtle' : ''}
            `}
            aria-label={`${t('workout.exercise')} ${i + 1}`}
          />
        );
      })}
    </div>
  );

  // --- Set circles ---
  const renderSetCircles = () => (
    <div className="flex items-center justify-center gap-3 my-6">
      {Array.from({ length: totalSets }, (_, i) => {
        const isDone = i < completedSetsForCurrent;
        const isCurrent = i === completedSetsForCurrent && !isResting;

        return (
          <div
            key={i}
            className={`
              w-10 h-10 rounded-full flex items-center justify-center
              transition-all duration-200
              ${isDone 
                ? 'bg-indigo-500 animate-set-complete' 
                : isCurrent 
                  ? 'ring-2 ring-indigo-500 bg-indigo-500/10 animate-pulse-subtle' 
                  : 'ring-1 ring-gray-600 bg-transparent'
              }
            `}
          >
            {isDone ? (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <span className={`text-sm font-semibold ${isCurrent ? 'text-indigo-300' : 'text-gray-600'}`}>
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
    ? truncateName(session.exercises[session.currentExerciseIndex - 1]?.name ?? '')
    : '';
  const nextExName = canGoNext
    ? truncateName(session.exercises[session.currentExerciseIndex + 1]?.name ?? '')
    : '';

  return (
    <div 
      className="fixed inset-0 z-[100] bg-gray-900 flex flex-col"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* ── Header ── */}
      <header className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-gray-800/60">
        {/* Close */}
        <button
          onClick={handleExitWorkout}
          className="p-2 -ml-2 rounded-lg hover:bg-gray-800 active:bg-gray-700 transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Elapsed timer */}
        <div className="flex items-center gap-1.5 text-gray-400">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="text-sm font-medium tabular-nums">{formatElapsedTime(elapsedSeconds)}</span>
        </div>

        {/* Exercise pills */}
        {renderExercisePills()}
      </header>

      {/* ── Progress bar ── */}
      <div className="h-0.5 bg-gray-800">
        <div 
          className="h-full bg-gradient-to-r from-indigo-600 to-indigo-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 flex flex-col px-4 pt-6 pb-4 overflow-y-auto">
        {/* Exercise card */}
        <div 
          key={`exercise-${session.currentExerciseIndex}-${slideKey.current}`}
          className={`
            flex-1 flex flex-col
            bg-gradient-to-b from-gray-800/70 to-gray-800/30
            ring-1 ring-gray-700/40
            rounded-2xl p-5
            ${slideClass}
          `}
        >
          {/* Card header: name + body part + video */}
          <div className="flex items-start justify-between mb-1">
            <div className="flex-1 min-w-0 pr-3">
              <h1 className="text-xl md:text-2xl font-bold text-white leading-tight">
                {currentExercise.name}
              </h1>
            </div>
            {onVideoClick && (
              <button
                onClick={() => onVideoClick(currentExercise)}
                className="
                  p-2.5 rounded-xl
                  bg-gray-700/50 hover:bg-gray-700 active:bg-gray-600
                  transition-colors duration-150
                  flex-shrink-0
                "
                aria-label="Watch video"
              >
                <svg className="w-5 h-5 text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            )}
          </div>

          {/* Body part chip */}
          {currentExercise.bodyPart && (
            <div className="mb-5">
              <Chip variant={getChipVariant(currentExercise.bodyPart)} size="sm">
                {currentExercise.bodyPart}
              </Chip>
            </div>
          )}

          {/* Sets × Reps display */}
          {!isResting && (
            <div className="flex items-baseline justify-center gap-3 mb-1">
              <span className="text-5xl font-bold text-white tabular-nums">{totalSets}</span>
              <span className="text-2xl text-gray-500 font-light">×</span>
              <span className="text-5xl font-bold text-white tabular-nums">
                {currentExercise.repetitions ?? '—'}
              </span>
            </div>
          )}

          {/* Rest info */}
          {!isResting && restTime > 0 && (
            <p className="text-center text-gray-500 text-sm mb-2">
              {formatRestTime(restTime)} {t('workout.restTime').toLowerCase()}
            </p>
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

              {/* ── CTA Button ── */}
              <div className="mt-auto pt-4">
                <button
                  onClick={handleCompleteSet}
                  className={`
                    w-full py-4 rounded-2xl
                    text-white text-lg font-semibold
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
                  {isLastSetOfCurrent
                    ? (canGoNext ? t('workout.nextExercise') : t('workout.completeWorkout'))
                    : t('workout.completeSet')
                  }
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* ── Navigation footer ── */}
      <footer className="flex items-center justify-between px-4 py-3 bg-gray-900 border-t border-gray-800/60">
        {/* Previous */}
        <button
          onClick={handlePrev}
          disabled={!canGoPrev}
          className={`
            flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[72px]
            transition-colors duration-200
            ${canGoPrev 
              ? 'text-gray-400 hover:bg-gray-800 active:bg-gray-700' 
              : 'text-gray-700 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          {prevExName && (
            <span className="text-[10px] max-w-[64px] truncate">{prevExName}</span>
          )}
        </button>

        {/* Exercise-level dots */}
        <div className="flex items-center gap-1.5">
          {session.exercises.map((ex, i) => {
            const exSets = ex.sets ?? 1;
            const exCompleted = session.completedSets[i] ?? 0;
            const isDone = exCompleted >= exSets;
            const isCurrent = i === session.currentExerciseIndex;

            return (
              <div
                key={i}
                className={`
                  rounded-full transition-all duration-300
                  ${isCurrent 
                    ? 'w-2.5 h-2.5 bg-indigo-500' 
                    : isDone 
                      ? 'w-2 h-2 bg-indigo-500/50' 
                      : 'w-2 h-2 bg-gray-700'
                  }
                `}
              />
            );
          })}
        </div>

        {/* Next */}
        <button
          onClick={handleNext}
          disabled={!canGoNext}
          className={`
            flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl min-w-[72px]
            transition-colors duration-200
            ${canGoNext 
              ? 'text-gray-400 hover:bg-gray-800 active:bg-gray-700' 
              : 'text-gray-700 cursor-not-allowed'
            }
          `}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          {nextExName && (
            <span className="text-[10px] max-w-[64px] truncate">{nextExName}</span>
          )}
        </button>
      </footer>
    </div>
  );
}

/** Truncate exercise name for footer labels */
function truncateName(name: string, max = 12): string {
  if (name.length <= max) return name;
  return name.slice(0, max - 1) + '…';
}

export default WorkoutSession;
