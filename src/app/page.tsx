'use client';

import { Suspense, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import HumanViewer from './components/3d/HumanViewer';
import { Gender } from './types';
import { AppProvider, useApp, ProgramIntention } from './context/AppContext';

function IntentionQuestion({ onSelect }: { onSelect: (intention: ProgramIntention) => void }) {
  console.log('IntentionQuestion rendered');
  
  const handleSelect = (intention: ProgramIntention) => {
    console.log('IntentionQuestion - handleSelect called with:', intention);
    onSelect(intention);
  };

  return (
    <div className="fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="max-w-lg w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-white mb-2">How can we help you today?</h1>
          <p className="text-gray-400">Choose what you&apos;re looking for:</p>
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
      </div>
    </div>
  );
}

function HumanViewerWrapper() {
  const searchParams = useSearchParams();
  const initialGender = (searchParams?.get('gender') as Gender) || 'male';
  const [gender, setGender] = useState<Gender>(initialGender);
  const { intention, setIntention } = useApp();

  console.log('HumanViewerWrapper rendered with intention:', intention);

  const handleGenderChange = useCallback((newGender: Gender) => {
    console.log('Changing gender to:', newGender);
    setGender(newGender);
  }, []);

  const handleIntentionSelect = useCallback((selectedIntention: ProgramIntention) => {
    console.log('HumanViewerWrapper - handleIntentionSelect called with:', selectedIntention);
    setIntention(selectedIntention);
  }, [setIntention]);

  useEffect(() => {
    console.log('Current intention state:', intention);
  }, [intention]);

  return (
    <>
      <HumanViewer gender={gender} onGenderChange={handleGenderChange} />
      {intention === ProgramIntention.None && <IntentionQuestion onSelect={handleIntentionSelect} />}
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
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
