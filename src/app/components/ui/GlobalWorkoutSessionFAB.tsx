'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import WorkoutFAB from './WorkoutFAB';
import WorkoutSession from './WorkoutSession';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { markDayAsCompleted } from '@/app/services/workoutSessionService';
import {
  useWorkoutSession,
  getWorkoutProgress,
  isWorkoutComplete,
} from '@/app/hooks/useWorkoutSession';

/**
 * Global workout session resume FAB.
 * Visible on all app routes except the HumanViewer /app route.
 */
export default function GlobalWorkoutSessionFAB() {
  const pathname = usePathname();
  const { user } = useAuth();
  const { markDayCompleteInMemory } = useUser();
  const [session, actions] = useWorkoutSession();
  const [showWorkoutSession, setShowWorkoutSession] = useState(false);

  const hideOnHumanViewerRoute = pathname === '/app' || pathname?.startsWith('/app/');
  const progress = getWorkoutProgress(session);
  const completed = isWorkoutComplete(session);

  const shouldShowFab = useMemo(() => {
    return session.isActive && !showWorkoutSession && !hideOnHumanViewerRoute;
  }, [session.isActive, showWorkoutSession, hideOnHumanViewerRoute]);

  useEffect(() => {
    if (!session.isActive) {
      setShowWorkoutSession(false);
    }
  }, [session.isActive]);

  const handleCompleteFromGlobal = async () => {
    if (!user?.uid) return;
    if (!session.sourceProgramId || !session.sourceDayNumber) return;

    try {
      await markDayAsCompleted(
        user.uid,
        session.sourceProgramId,
        session.sourceDayNumber,
        session.sourceWeekId ?? undefined
      );
      markDayCompleteInMemory(
        session.sourceDayNumber,
        true,
        session.sourceWeekId ?? undefined
      );
    } catch (error) {
      console.error('[GlobalWorkoutSessionFAB] Failed to mark day complete:', error);
    }
  };

  return (
    <>
      {shouldShowFab && (
        <WorkoutFAB
          onClick={() => setShowWorkoutSession(true)}
          isActive
          progress={progress}
          completed={completed}
        />
      )}

      {showWorkoutSession && session.isActive && (
        <WorkoutSession
          session={session}
          actions={actions}
          onClose={() => setShowWorkoutSession(false)}
          onComplete={handleCompleteFromGlobal}
        />
      )}
    </>
  );
}
