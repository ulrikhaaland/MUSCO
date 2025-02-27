'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import HumanViewer from './components/3d/HumanViewer';
import { Gender } from './types';
import { ProgramStatus } from './types/program';
import { useApp, ProgramIntention } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { useUser } from './context/UserContext';
import { QuestionnaireAuthForm } from './components/auth/QuestionnaireAuthForm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSearchParams, useRouter } from 'next/navigation';
import { IntentionQuestion } from './components/ui/IntentionQuestion';

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
          Reload page
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  const {
    intention,
    setIntention,
    skipAuth,
    shouldNavigateToProgram,
    setShouldNavigateToProgram,
  } = useApp();
  const { user, loading: authLoading, error: authError } = useAuth();
  const {
    program,
    isLoading: userLoading,
    programStatus,
    pendingQuestionnaire,
  } = useUser();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const genderParam = searchParams?.get('gender') as Gender;
  const [gender, setGender] = useState<Gender>(genderParam || 'male');

  // Set page title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = 'MUSCO - Create Your Program';
    }
  }, []);

  // Update gender when URL param changes
  useEffect(() => {
    if (genderParam && (genderParam === 'male' || genderParam === 'female')) {
      setGender(genderParam);
    }
  }, [genderParam]);

  const handleGenderChange = useCallback((newGender: Gender) => {
    setGender(newGender);
    // Update URL without reloading the page
    const params = new URLSearchParams(searchParams?.toString() || '');
    params.set('gender', newGender);
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  const handleIntentionSelect = useCallback(
    (selectedIntention: ProgramIntention) => {
      setIntention(selectedIntention);
    },
    [setIntention]
  );

  // Show auth form if we have pending questionnaire data
  useEffect(() => {
    if (pendingQuestionnaire && !user) {
      setShowAuthForm(true);
    } else {
      setShowAuthForm(false);
    }
  }, [pendingQuestionnaire, user]);

  // Redirect to program page if user has a program and shouldNavigateToProgram is true
  useEffect(() => {
    if (
      user &&
      (program || programStatus === ProgramStatus.Generating) &&
      shouldNavigateToProgram
    ) {
      // Set the flag to false before redirecting to prevent future redirects
      setShouldNavigateToProgram(false);
      router.push('/program');
    }
  }, [
    user,
    program,
    programStatus,
    router,
    shouldNavigateToProgram,
    setShouldNavigateToProgram,
  ]);

  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (authError) {
    return <ErrorDisplay error={authError} />;
  }

  if (showAuthForm) {
    return (
      <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
        <div className="max-w-lg w-full mx-4">
          <QuestionnaireAuthForm />
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="h-full">
        <HumanViewer gender={gender} onGenderChange={handleGenderChange} />
        {(intention === ProgramIntention.None || (!user && !skipAuth)) && (
          <IntentionQuestion
            onSelect={handleIntentionSelect}
            onSkip={() => {}}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
