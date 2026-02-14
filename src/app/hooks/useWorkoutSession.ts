import { useState, useCallback, useEffect, useRef } from 'react';
import { Exercise } from '@/app/types/program';

/**
 * Workout session state for tracking active gym sessions
 */
export interface WorkoutSession {
  isActive: boolean;
  currentExerciseIndex: number;
  currentSet: number;
  completedSets: number[]; // count of completed sets per exercise
  startTime: Date | null;
  restTimerEnd: Date | null;
  exercises: Exercise[];
  sourceDayNumber: number | null;
  sourceWeekId: string | null;
  sourceProgramId: string | null;
}

/**
 * Actions for controlling workout session
 */
export interface WorkoutSessionActions {
  startSession: (
    exercises: Exercise[],
    source?: {
      dayNumber?: number;
      weekId?: string;
      programId?: string;
    }
  ) => void;
  markStarted: () => void;
  endSession: () => void;
  completeSet: () => void;
  skipRest: () => void;
  extendRest: (seconds: number) => void;
  goToExercise: (index: number) => void;
  goToNextExercise: () => void;
  goToPrevExercise: () => void;
}

const STORAGE_KEY = 'musco_workout_session';
const WORKOUT_SESSION_EVENT = 'musco:workout-session-updated';

const initialSession: WorkoutSession = {
  isActive: false,
  currentExerciseIndex: 0,
  currentSet: 1,
  completedSets: [],
  startTime: null,
  restTimerEnd: null,
  exercises: [],
  sourceDayNumber: null,
  sourceWeekId: null,
  sourceProgramId: null,
};

function areSessionsEqual(a: WorkoutSession, b: WorkoutSession): boolean {
  return serializeSession(a) === serializeSession(b);
}

/**
 * Serialize session for localStorage (handles Date objects)
 */
function serializeSession(session: WorkoutSession): string {
  return JSON.stringify({
    ...session,
    startTime: session.startTime?.toISOString() ?? null,
    restTimerEnd: session.restTimerEnd?.toISOString() ?? null,
  });
}

/**
 * Deserialize session from localStorage
 */
function deserializeSession(json: string): WorkoutSession | null {
  try {
    const data = JSON.parse(json);
    return {
      ...data,
      startTime: data.startTime ? new Date(data.startTime) : null,
      restTimerEnd: data.restTimerEnd ? new Date(data.restTimerEnd) : null,
      sourceDayNumber: data.sourceDayNumber ?? null,
      sourceWeekId: data.sourceWeekId ?? null,
      sourceProgramId: data.sourceProgramId ?? null,
    };
  } catch {
    return null;
  }
}

/**
 * Hook for managing live workout sessions
 * Handles exercise navigation, set tracking, and rest timers
 */
export function useWorkoutSession(): [WorkoutSession, WorkoutSessionActions] {
  const [session, setSession] = useState<WorkoutSession>(initialSession);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Load persisted session on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const restored = deserializeSession(stored);
      if (restored?.isActive) {
        // Check if rest timer is still valid
        if (restored.restTimerEnd && new Date(restored.restTimerEnd) < new Date()) {
          restored.restTimerEnd = null;
        }
        setSession(restored);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist session changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (session.isActive) {
      const serialized = serializeSession(session);
      localStorage.setItem(STORAGE_KEY, serialized);
      window.dispatchEvent(
        new CustomEvent(WORKOUT_SESSION_EVENT, { detail: serialized })
      );
    } else {
      localStorage.removeItem(STORAGE_KEY);
      window.dispatchEvent(
        new CustomEvent(WORKOUT_SESSION_EVENT, { detail: null })
      );
    }
  }, [session]);

  // Keep all hook instances in sync (same tab + cross-tab) so only one session is active globally.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncFromSerialized = (serialized: string | null) => {
      const next = serialized ? deserializeSession(serialized) : null;
      const normalizedNext = next ?? initialSession;
      setSession(prev => (areSessionsEqual(prev, normalizedNext) ? prev : normalizedNext));
    };

    const onInternalSync = (event: Event) => {
      const customEvent = event as CustomEvent<string | null>;
      syncFromSerialized(customEvent.detail ?? null);
    };

    const onStorage = (event: StorageEvent) => {
      if (event.key !== STORAGE_KEY) return;
      syncFromSerialized(event.newValue);
    };

    window.addEventListener(WORKOUT_SESSION_EVENT, onInternalSync as EventListener);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(WORKOUT_SESSION_EVENT, onInternalSync as EventListener);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Timer tick effect for rest countdown
  useEffect(() => {
    if (!session.restTimerEnd) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    const checkTimer = () => {
      if (session.restTimerEnd && new Date() >= session.restTimerEnd) {
        setSession(prev => ({ ...prev, restTimerEnd: null }));
      }
    };

    timerRef.current = setInterval(checkTimer, 100);
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [session.restTimerEnd]);

  const startSession = useCallback((
    exercises: Exercise[],
    source?: {
      dayNumber?: number;
      weekId?: string;
      programId?: string;
    }
  ) => {
    setSession({
      isActive: true,
      currentExerciseIndex: 0,
      currentSet: 1,
      completedSets: new Array(exercises.length).fill(0),
      startTime: null,
      restTimerEnd: null,
      exercises,
      sourceDayNumber: source?.dayNumber ?? null,
      sourceWeekId: source?.weekId ?? null,
      sourceProgramId: source?.programId ?? null,
    });
  }, []);

  const markStarted = useCallback(() => {
    setSession(prev => {
      if (!prev.isActive || prev.startTime) return prev;
      return {
        ...prev,
        startTime: new Date(),
      };
    });
  }, []);

  const endSession = useCallback(() => {
    setSession(initialSession);
  }, []);

  const completeSet = useCallback(() => {
    setSession(prev => {
      if (!prev.isActive || prev.exercises.length === 0) return prev;

      const currentExercise = prev.exercises[prev.currentExerciseIndex];
      const totalSets = currentExercise?.sets ?? 1;
      const restTime = currentExercise?.restBetweenSets ?? currentExercise?.rest ?? 60;

      const newCompletedSets = [...prev.completedSets];
      newCompletedSets[prev.currentExerciseIndex] = (newCompletedSets[prev.currentExerciseIndex] ?? 0) + 1;

      const isLastSet = prev.currentSet >= totalSets;
      const isLastExercise = prev.currentExerciseIndex >= prev.exercises.length - 1;

      if (isLastSet && isLastExercise) {
        // Workout complete - fill all exercises to full completion
        const filledSets = prev.exercises.map((ex, i) => {
          const target = ex.sets ?? 1;
          return Math.max(newCompletedSets[i] ?? 0, target);
        });
        return {
          ...prev,
          completedSets: filledSets,
          restTimerEnd: null,
        };
      }

      if (isLastSet) {
        // Move to next exercise
        return {
          ...prev,
          currentExerciseIndex: prev.currentExerciseIndex + 1,
          currentSet: 1,
          completedSets: newCompletedSets,
          restTimerEnd: null,
        };
      }

      // More sets remaining - start rest timer
      return {
        ...prev,
        currentSet: prev.currentSet + 1,
        completedSets: newCompletedSets,
        restTimerEnd: new Date(Date.now() + restTime * 1000),
      };
    });
  }, []);

  const skipRest = useCallback(() => {
    setSession(prev => ({ ...prev, restTimerEnd: null }));
  }, []);

  const extendRest = useCallback((seconds: number) => {
    setSession(prev => {
      if (!prev.restTimerEnd) return prev;
      return {
        ...prev,
        restTimerEnd: new Date(prev.restTimerEnd.getTime() + seconds * 1000),
      };
    });
  }, []);

  const goToExercise = useCallback((index: number) => {
    setSession(prev => {
      if (!prev.isActive || index < 0 || index >= prev.exercises.length) return prev;
      
      // Mark current exercise as fully completed when moving forward
      const newCompletedSets = [...prev.completedSets];
      if (index > prev.currentExerciseIndex) {
        const currentEx = prev.exercises[prev.currentExerciseIndex];
        newCompletedSets[prev.currentExerciseIndex] = Math.max(
          newCompletedSets[prev.currentExerciseIndex] ?? 0,
          currentEx?.sets ?? 1
        );
      }

      const completedForTarget = newCompletedSets[index] ?? 0;
      const targetExercise = prev.exercises[index];
      const totalSets = targetExercise?.sets ?? 1;
      
      return {
        ...prev,
        currentExerciseIndex: index,
        currentSet: Math.min(completedForTarget + 1, totalSets),
        completedSets: newCompletedSets,
        restTimerEnd: null,
      };
    });
  }, []);

  const goToNextExercise = useCallback(() => {
    setSession(prev => {
      if (!prev.isActive || prev.currentExerciseIndex >= prev.exercises.length - 1) return prev;
      
      // Mark current exercise as fully completed when skipping forward
      const newCompletedSets = [...prev.completedSets];
      const currentEx = prev.exercises[prev.currentExerciseIndex];
      newCompletedSets[prev.currentExerciseIndex] = Math.max(
        newCompletedSets[prev.currentExerciseIndex] ?? 0,
        currentEx?.sets ?? 1
      );

      const nextIndex = prev.currentExerciseIndex + 1;
      const completedForNext = newCompletedSets[nextIndex] ?? 0;
      const nextExercise = prev.exercises[nextIndex];
      const totalSets = nextExercise?.sets ?? 1;
      
      return {
        ...prev,
        currentExerciseIndex: nextIndex,
        currentSet: Math.min(completedForNext + 1, totalSets),
        completedSets: newCompletedSets,
        restTimerEnd: null,
      };
    });
  }, []);

  const goToPrevExercise = useCallback(() => {
    setSession(prev => {
      if (!prev.isActive || prev.currentExerciseIndex <= 0) return prev;
      
      const prevIndex = prev.currentExerciseIndex - 1;
      const completedForPrev = prev.completedSets[prevIndex] ?? 0;
      const prevExercise = prev.exercises[prevIndex];
      const totalSets = prevExercise?.sets ?? 1;
      
      return {
        ...prev,
        currentExerciseIndex: prevIndex,
        currentSet: Math.min(completedForPrev + 1, totalSets),
        restTimerEnd: null,
      };
    });
  }, []);

  const actions: WorkoutSessionActions = {
    startSession,
    markStarted,
    endSession,
    completeSet,
    skipRest,
    extendRest,
    goToExercise,
    goToNextExercise,
    goToPrevExercise,
  };

  return [session, actions];
}

/**
 * Hook for tracking elapsed time since workout started
 * Ticks every second while session is active
 */
export function useElapsedTime(startTime: Date | null, isActive: boolean): number {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime || !isActive) {
      setElapsed(0);
      return;
    }

    const update = () => {
      setElapsed(Math.floor((Date.now() - startTime.getTime()) / 1000));
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [startTime, isActive]);

  return elapsed;
}

/**
 * Format elapsed seconds into HH:MM:SS or MM:SS
 */
export function formatElapsedTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const mm = minutes.toString().padStart(2, '0');
  const ss = seconds.toString().padStart(2, '0');

  if (hours > 0) {
    return `${hours}:${mm}:${ss}`;
  }
  return `${mm}:${ss}`;
}

/**
 * Calculate remaining rest time in seconds
 */
export function getRemainingRestTime(restTimerEnd: Date | null): number {
  if (!restTimerEnd) return 0;
  const remaining = Math.max(0, restTimerEnd.getTime() - Date.now());
  return Math.ceil(remaining / 1000);
}

/**
 * Check if all exercises in the session are complete
 */
export function isWorkoutComplete(session: WorkoutSession): boolean {
  if (!session.isActive || session.exercises.length === 0) return false;
  
  return session.exercises.every((exercise, index) => {
    const totalSets = exercise.sets ?? 1;
    const completed = session.completedSets[index] ?? 0;
    return completed >= totalSets;
  });
}

/**
 * Get overall workout progress as a percentage (0-100)
 */
export function getWorkoutProgress(session: WorkoutSession): number {
  if (!session.isActive || session.exercises.length === 0) return 0;
  
  let totalSets = 0;
  let completedSets = 0;
  
  session.exercises.forEach((exercise, index) => {
    const sets = exercise.sets ?? 1;
    totalSets += sets;
    completedSets += Math.min(session.completedSets[index] ?? 0, sets);
  });
  
  return totalSets > 0 ? Math.round((completedSets / totalSets) * 100) : 0;
}

/**
 * Get total completed sets across all exercises
 */
export function getTotalCompletedSets(session: WorkoutSession): number {
  if (!session.isActive) return 0;
  return session.completedSets.reduce((sum, count) => sum + (count ?? 0), 0);
}

/**
 * Get total target sets across all exercises
 */
export function getTotalTargetSets(session: WorkoutSession): number {
  if (!session.isActive) return 0;
  return session.exercises.reduce((sum, ex) => sum + (ex.sets ?? 1), 0);
}
