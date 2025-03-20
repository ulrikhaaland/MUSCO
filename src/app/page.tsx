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
import { LoadingSpinner } from './components/ui/LoadingSpinner';
import { ErrorDisplay } from './components/ui/ErrorDisplay';

// Create a separate component for search params functionality
function HomeContent() {
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

  // Redirect to program page if user is logged in and has a program
  useEffect(() => {
    // Only redirect after loading is complete
    if (!authLoading && !userLoading) {
      // Get the 'new' query parameter
      const newParam = searchParams?.get('new');
      
      // If user is logged in AND has a program AND NOT explicitly trying to create a new program
      if (user && (program || programStatus === ProgramStatus.Generating) && newParam !== 'true') {
        router.push('/program');
      }
    }
  }, [user, program, programStatus, authLoading, userLoading, router, searchParams]);

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

  const isLoading = authLoading || userLoading;

  if (isLoading) {
    return <LoadingSpinner fullScreen message="Loading..." />;
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
    <div className="h-full">
      <HumanViewer gender={gender} onGenderChange={handleGenderChange} />
    </div>
  );
}

// Main component that wraps the HomeContent with suspense
export default function Home() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <HomeContent />
      </Suspense>
    </ErrorBoundary>
  );
}
