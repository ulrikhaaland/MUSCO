'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ExerciseProgramCalendar } from '@/app/components/ui/ExerciseProgramCalendar';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { ProgramStatus, ProgramDay } from '@/app/types/program';

function LoadingSpinner() {
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}

function ErrorDisplay({ error }: { error: Error }) {
  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 text-center">
        <h2 className="text-2xl font-bold text-white">Something went wrong</h2>
        <pre className="text-red-400 text-sm overflow-auto p-4 bg-gray-800 rounded-lg">
          {error.message}
        </pre>
        <button
          onClick={() => (window.location.href = '/')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500"
        >
          Go back
        </button>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const router = useRouter();
  const { user, loading: authLoading, error: authError } = useAuth();
  const { program, isLoading: userLoading, programStatus } = useUser();
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

  const handleToggleView = () => {
    router.push('/program');
  };

  const handleDaySelect = (day: ProgramDay, dayName: string) => {
    router.push(`/program/day/${day.day}`);
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (authError) {
    return <ErrorDisplay error={authError} />;
  }

  if (error) {
    return <ErrorDisplay error={error} />;
  }

  if (!program && programStatus !== ProgramStatus.Generating) {
    return <LoadingSpinner />;
  }

  return (
    <ExerciseProgramCalendar
      program={program}
      onToggleView={handleToggleView}
      dayName={getDayName}
      onDaySelect={handleDaySelect}
    />
  );
} 