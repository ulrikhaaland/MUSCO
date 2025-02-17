'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import HumanViewer from './components/3d/HumanViewer';
import { Gender } from './types';
import { ProgramStatus } from './types/program';
import { AppProvider, useApp, ProgramIntention } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { UserProvider, useUser } from './context/UserContext';
import { AuthForm } from './components/auth/AuthForm';
import { ExerciseProgramContainer } from './components/ui/ExerciseProgramContainer';

function IntentionQuestion({
  onSelect,
}: {
  onSelect: (intention: ProgramIntention) => void;
}) {
  const { user } = useAuth();
  const [skipAuth, setSkipAuth] = useState(false);

  const handleSelect = (intention: ProgramIntention) => {
    onSelect(intention);
  };

  const handleSkipAuth = () => {
    setSkipAuth(true);
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

function HumanViewerWrapper() {
  const searchParams = useSearchParams();
  const initialGender = (searchParams?.get('gender') as Gender) || 'male';
  const [gender, setGender] = useState<Gender>(initialGender);
  const { intention, setIntention } = useApp();
  const { user } = useAuth();
  const { program, isLoading, programStatus } = useUser();
  const [skipAuth, setSkipAuth] = useState(false);

  const handleGenderChange = useCallback((newGender: Gender) => {
    setGender(newGender);
  }, []);

  const handleIntentionSelect = useCallback(
    (selectedIntention: ProgramIntention) => {
      setIntention(selectedIntention);
    },
    [setIntention]
  );

  // Show program container if:
  // 1. User is logged in and has a program
  // 2. Program is being generated (show loading state)
  // 3. Program is ready
  if (user && (program || programStatus === ProgramStatus.Generating)) {
    return (
      <ExerciseProgramContainer
        isLoading={isLoading || programStatus === ProgramStatus.Generating}
        program={program}
      />
    );
  }

  return (
    <>
      <HumanViewer gender={gender} onGenderChange={handleGenderChange} />
      {(intention === ProgramIntention.None || (!user && !skipAuth)) && (
        <IntentionQuestion onSelect={handleIntentionSelect} />
      )}
    </>
  );
}

function AppContent() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HumanViewerWrapper />
    </Suspense>
  );
}

export default function Page() {
  return (
    <AuthProvider>
      <UserProvider>
        <AppProvider>
          <AppContent />
        </AppProvider>
      </UserProvider>
    </AuthProvider>
  );
}
