'use client';

import { Suspense, useState, useCallback, useEffect, useRef } from 'react';
import HumanViewer from './components/3d/HumanViewer';
import { Gender } from './types';
import { ProgramStatus } from './types/program';
import { useApp, ProgramIntention } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { useUser } from './context/UserContext';
import { useLoader } from './context/LoaderContext';
import { QuestionnaireAuthForm } from './components/auth/QuestionnaireAuthForm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSearchParams, useRouter } from 'next/navigation';
import { IntentionQuestion } from './components/ui/IntentionQuestion';
import { ErrorDisplay } from './components/ui/ErrorDisplay';
import { useTranslation } from './i18n';

// Create a separate component for search params functionality
function HomeContent() {
  const {
    intention,
    setIntention,
    skipAuth,
    setSkipAuth,
    shouldNavigateToProgram,
    setShouldNavigateToProgram,
    completeReset,
  } = useApp();
  const { user, loading: authLoading, error: authError } = useAuth();
  const {
    program,
    isLoading: userLoading,
    programStatus,
    pendingQuestionnaire,
  } = useUser();
  const { setIsLoading, isLoading: loaderLoading } = useLoader();
  const { t } = useTranslation();
  const [showAuthForm, setShowAuthForm] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const genderParam = searchParams?.get('gender') as Gender;
  const newParam = searchParams?.get('new');
  const [gender, setGender] = useState<Gender>(genderParam || 'male');
  const [intentionSelected, setIntentionSelected] = useState(false);
  const [shouldResetModel, setShouldResetModel] = useState(false);

  const isLoading = authLoading || userLoading;

  // Control the loader visibility based on loading state
  // useEffect(() => {
  //   // Avoid infinite render loops by not changing the loader state on every render
  //   const timer = setTimeout(() => {
  //     if (isLoading && !loaderLoading) {
  //       setIsLoading(true, t('home.loading'));
  //     } else if (
  //       typeof window !== 'undefined' &&
  //       window.location.pathname !== '/program' &&
  //       loaderLoading
  //     ) {
  //       // Only hide the loader when content is ready
  //       setIsLoading(false);
  //     }
  //   }, 100);

  //   return () => clearTimeout(timer);
  // }, [isLoading]);

  // Set page title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.title = t('home.pageTitle');
    }
  }, [t]);

  // Reset intention to None when navigating to home page if not already None
  useEffect(() => {
    // Only reset if we're not explicitly creating a new program
    if (newParam !== 'true' && intention !== ProgramIntention.None) {
      completeReset();
      setShouldResetModel(true);

      // Reset the flag after a short delay
      const timer = setTimeout(() => {
        setShouldResetModel(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [completeReset, newParam, intention]);

  // Update gender when URL param changes
  useEffect(() => {
    if (genderParam && (genderParam === 'male' || genderParam === 'female')) {
      setGender(genderParam);
    }
  }, [genderParam]);

  const handleGenderChange = useCallback(
    (newGender: Gender) => {
      setGender(newGender);
      // Update URL without reloading the page
      const params = new URLSearchParams(searchParams?.toString() || '');
      params.set('gender', newGender);

      // Preserve the new=true parameter if it exists
      if (newParam === 'true' && !params.has('new')) {
        params.set('new', 'true');
      }

      router.push(`/?${params.toString()}`, { scroll: false });
    },
    [router, searchParams, newParam]
  );

  const handleIntentionSelect = useCallback(
    (selectedIntention: ProgramIntention) => {
      setIntention(selectedIntention);
      setIntentionSelected(true);
    },
    [setIntention]
  );

  // Show auth form if user is not logged in and not skipping auth
  // OR if we have pending questionnaire data and user is not logged in
  useEffect(() => {
    const hasPendingQuestionnaire = Boolean(pendingQuestionnaire);
    const hasPendingQuestionnaireFlag =
      typeof window !== 'undefined' &&
      window.localStorage.getItem('hasPendingQuestionnaire') === 'true';

    if (
      // Show auth if there's pending questionnaire data (high priority)
      (hasPendingQuestionnaire && !user) ||
      // Also show auth if there's a flag in localStorage
      (hasPendingQuestionnaireFlag && !user) ||
      // Or show auth if user is not logged in and not explicitly skipping auth
      (!user && !authLoading && !skipAuth)
    ) {
      setShowAuthForm(true);
    } else {
      setShowAuthForm(false);
    }
  }, [user, authLoading, skipAuth, pendingQuestionnaire, showAuthForm]);

  // Clear the pendingQuestionnaire flag in localStorage when user logs in
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      // If user is logged in, we can clear the flag since it's no longer needed
      window.localStorage.removeItem('hasPendingQuestionnaire');
    }
  }, [user]);

  // Reset intentionSelected whenever newParam is 'true' or URL params change
  useEffect(() => {
    // Check if we're on the create program page (new=true)
    if (newParam === 'true') {
      console.log('Resetting intention selection - new param detected');
      setIntentionSelected(false);
    }
  }, [newParam, searchParams]); // searchParams helps detect any change to the URL params

  if (authError) {
    return <ErrorDisplay error={authError} />;
  }

  // If we're loading, render nothing as the loader is managed via context
  if (isLoading) {
    return null;
  }

  return (
    <div className="h-full">
      {/* Only render HumanViewer when not showing IntentionQuestion and not showing QuestionnaireAuthForm */}
      {!(newParam === 'true' && !intentionSelected) &&
        !(showAuthForm && pendingQuestionnaire) && (
          <HumanViewer
            gender={gender}
            onGenderChange={handleGenderChange}
            shouldResetModel={shouldResetModel}
          />
        )}

      {/* Conditionally overlay the auth form */}
      {showAuthForm && pendingQuestionnaire && (
        <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="max-w-lg w-full mx-4">
            <QuestionnaireAuthForm />
          </div>
        </div>
      )}

      {newParam === 'true' && !intentionSelected && (
        <IntentionQuestion
          onSelect={(selectedIntention) => {
            console.log('Intention selected:', selectedIntention);
            handleIntentionSelect(selectedIntention);
          }}
        />
      )}
    </div>
  );
}

// Main component that wraps the HomeContent with suspense
export default function Home() {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>
        <HomeContent />
      </Suspense>
    </ErrorBoundary>
  );
}
