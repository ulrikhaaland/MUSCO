import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { ExerciseProgram } from '@/app/types/program';

// This component is now deprecated and serves as a compatibility layer
// for legacy code. It simply redirects to the appropriate route.

interface ExerciseProgramContainerProps {
  onBack?: () => void;
  isLoading: boolean;
  program: ExerciseProgram;
}

// Loading component for Suspense
function LoadingContainer() {
  return (
    <div className="h-screen w-screen flex flex-col bg-gray-900">
      <div className="flex flex-col items-center justify-center h-full space-y-4 px-4 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        <div className="text-app-title text-white">Loading Program</div>
        <div className="text-gray-400 max-w-sm">
          Please wait while we load your program...
        </div>
      </div>
    </div>
  );
}

// Content component that uses search params
function ExerciseProgramContainerContent({
  isLoading,
  program,
}: ExerciseProgramContainerProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const view = searchParams.get('view');
  const dayParam = searchParams.get('day');
  
  // Redirect to the appropriate route
  useEffect(() => {
    if (view === 'calendar') {
      router.replace('/program/calendar');
    } else if (dayParam) {
      router.replace(`/program/day/${dayParam}`);
    } else {
      router.replace('/program');
    }
  }, [view, dayParam, router]);

  // Show loading state while redirecting
  return <LoadingContainer />;
}

// Wrapper component with Suspense
export function ExerciseProgramContainer(props: ExerciseProgramContainerProps) {
  return (
    <Suspense fallback={<LoadingContainer />}>
      <ExerciseProgramContainerContent {...props} />
    </Suspense>
  );
}
