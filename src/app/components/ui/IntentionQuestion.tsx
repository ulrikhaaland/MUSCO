'use client';

import { useState } from 'react';
import { ProgramIntention } from '@/app/context/AppContext';
import { useAuth } from '@/app/context/AuthContext';
import { useApp } from '@/app/context/AppContext';
import { AuthForm } from '../auth/AuthForm';

interface IntentionQuestionProps {
  onSelect: (intention: ProgramIntention) => void;
  onSkip: () => void;
}

export function IntentionQuestion({
  onSelect,
  onSkip,
}: IntentionQuestionProps) {
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