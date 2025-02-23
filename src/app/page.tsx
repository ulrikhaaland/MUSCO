'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import HumanViewer from './components/3d/HumanViewer';
import { Gender } from './types';
import { ProgramStatus } from './types/program';
import { AppProvider, useApp, ProgramIntention } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { AuthForm } from './components/auth/AuthForm';
import { QuestionnaireAuthForm } from './components/auth/QuestionnaireAuthForm';
import { ExerciseProgramContainer } from './components/ui/ExerciseProgramContainer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { useSearchParams, useRouter } from 'next/navigation';

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

function IntentionQuestion({
  onSelect,
  onSkip,
}: {
  onSelect: (intention: ProgramIntention) => void;
  onSkip: () => void;
}) {
  const { user } = useAuth();
  const { skipAuth, setSkipAuth } = useApp();

  const handleSelect = (intention: ProgramIntention) => {
    onSelect(intention);
  };

  const handleSkipAuth = () => {
    setSkipAuth(true);
    onSkip();
  };

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        {user || skipAuth ? (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-semibold text-white mb-2">
                How can we help you today?
              </h1>
              <p className="text-gray-400">
                Choose what you&apos;re looking for:
              </p>
            </div>
            <div className="space-y-4">
              <button
                onClick={() => handleSelect(ProgramIntention.Exercise)}
                className="w-full bg-indigo-600/90 hover:bg-indigo-500/90 text-white p-4 rounded-xl transition-colors duration-200 flex items-center justify-between group"
              >
                <span className="text-lg">Exercise Program</span>
                <svg
                  className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
              <button
                onClick={() => handleSelect(ProgramIntention.Recovery)}
                className="w-full bg-indigo-600/90 hover:bg-indigo-500/90 text-white p-4 rounded-xl transition-colors duration-200 flex items-center justify-between group"
              >
                <span className="text-lg">Recovery Program</span>
                <svg
                  className="w-6 h-6 transform group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <AuthForm onSkip={handleSkipAuth} />
        )}
      </div>
    </div>
  );
}

function GenderFromParams({ onGender }: { onGender: (gender: Gender) => void }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const gender = (searchParams?.get('gender') as Gender) || 'male';
  
  useEffect(() => {
    onGender(gender);
  }, [gender, onGender]);

  const updateGender = useCallback((newGender: Gender) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('gender', newGender);
    router.push(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);
  
  return null;
}

function HumanViewerContent() {
  const [gender, setGender] = useState<Gender>('male');
  const { intention, setIntention, skipAuth } = useApp();
  const { user, loading: authLoading, error: authError } = useAuth();
  const {
    program,
    isLoading: userLoading,
    programStatus,
    pendingQuestionnaire,
  } = useUser();
  const [showAuthForm, setShowAuthForm] = useState(false);

  const handleGenderChange = useCallback((newGender: Gender) => {
    setGender(newGender);
  }, []);

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
    return <LoadingSpinner />;
  }

  if (authError) {
    return <ErrorDisplay error={authError} />;
  }

  if (user && (program || programStatus === ProgramStatus.Generating)) {
    return (
      <ExerciseProgramContainer
        isLoading={programStatus === ProgramStatus.Generating}
        program={program}
      />
    );
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
    <>
      <HumanViewer gender={gender} onGenderChange={handleGenderChange} />
      {(intention === ProgramIntention.None || (!user && !skipAuth)) && (
        <IntentionQuestion onSelect={handleIntentionSelect} onSkip={() => {}} />
      )}
    </>
  );
}

function HumanViewerWrapper() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <HumanViewerContent />
      <GenderFromParams onGender={(gender) => {
        const viewer = document.getElementById('myViewer') as HTMLIFrameElement;
        if (viewer) {
          viewer.src = gender === 'female' ? '/female.html' : '/male.html';
        }
      }} />
    </Suspense>
  );
}

function AppContent() {
  return <HumanViewerWrapper />;
}

export default function Page() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
