'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramCalendar } from '@/app/components/ui/ExerciseProgramCalendar';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { ProgramStatus, ProgramDay } from '@/app/types/program';
import { ErrorDisplay } from '@/app/components/ui/ErrorDisplay';

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();
  const {
    program,
    isLoading: userLoading,
    programStatus,
    userPrograms,
  } = useUser();
  const [error, setError] = useState<Error | null>(null);

  const isLoading = authLoading || userLoading;

  // Update page title
  useEffect(() => {
    if (program?.title && typeof document !== 'undefined') {
      document.title = `${program.title} - Calendar | MUSCO`;
    } else if (typeof document !== 'undefined') {
      document.title = 'Program Calendar | MUSCO';
    }
  }, [program]);

  // Redirect to home if no user or program
  useEffect(() => {
    if (!authLoading && !userLoading) {
      if (!user) {
        router.push('/');
      } else if (!program && programStatus !== ProgramStatus.Generating) {
        router.push('/');
      }
    }
  }, [user, program, programStatus, authLoading, userLoading, router]);

  const getDayName = (dayOfWeek: number): string => {
    const days = [
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
      'Sunday',
    ];
    return days[dayOfWeek - 1];
  };

  const handleDaySelect = (
    day: ProgramDay,
    dayName: string,
    programId: string
  ) => {
    // Find the selected program by its createdAt value
    const selectedProgram = userPrograms
      .flatMap((up) => up.programs)
      .find((p) => p.createdAt.toString() === programId);

    if (selectedProgram) {
      // Navigate to the specific program day
      router.push(
        `/program/day/${day.day}?programId=${encodeURIComponent(programId)}`
      );
    } else {
      // Fallback to default behavior if program not found
      router.push(`/program/day/${day.day}`);
    }
  };

  if (isLoading) {
    // We're using the global loader context instead of rendering our own spinner
    return null;
  }

  if (authError) {
    return <ErrorDisplay error={authError} />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!program && programStatus !== ProgramStatus.Generating) {
    // We're using the global loader context instead of rendering our own spinner
    return null;
  }

  return (
    <ExerciseProgramCalendar
      program={program}
      dayName={getDayName}
      onDaySelect={handleDaySelect}
    />
  );
}
