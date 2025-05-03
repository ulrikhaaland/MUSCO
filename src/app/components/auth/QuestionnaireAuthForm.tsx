'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { storePendingQuestionnaire } from '@/app/services/questionnaire';
import { useTranslation } from '@/app/i18n';
import { AuthCodeInput } from '../ui/AuthCodeInput';

export function QuestionnaireAuthForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isPwa, setIsPwa] = useState(false);
  const [showAuthCode, setShowAuthCode] = useState(false);
  const { sendSignInLink } = useAuth();
  const { pendingQuestionnaire } = useUser();

  // Detect if running as a PWA (standalone mode)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check if running in standalone mode (PWA)
      const isStandalone = 
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');
      
      setIsPwa(isStandalone);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!pendingQuestionnaire) {
      setError('No questionnaire data found');
      setLoading(false);
      return;
    }

    try {
      // Store the questionnaire data in Firestore using email as temporary ID
      await storePendingQuestionnaire(
        email,
        pendingQuestionnaire.diagnosis,
        pendingQuestionnaire.answers
      );

      // Send the sign-in link
      await sendSignInLink(email);
      
      // Save the email locally to complete sign in after user clicks the link
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('hasPendingQuestionnaire', 'true');
      
      setEmailSent(true);
      
      // If in PWA mode, go directly to the code entry screen
      if (isPwa) {
        setShowAuthCode(true);
      }
    } catch (error: any) {
      setError(error.message);
      setEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  if (showAuthCode) {
    return <AuthCodeInput />;
  }

  if (emailSent) {
    return (
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">{t('auth.checkEmail')}</h2>
          <p className="mt-4 text-gray-400">
            {isPwa ? t('auth.sentLoginCode') : t('auth.sentLoginLink')} <span className="text-white">{email}</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {isPwa 
              ? t('auth.enterCodeToSignIn')
              : t('auth.clickLinkToSignIn')
            }
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="w-full px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
          >
            {t('auth.useDifferentEmail')}
          </button>

          {!isPwa && (
            <button
              type="button"
              onClick={() => {
                // Set a timestamp to remember that code entry was requested
                window.localStorage.setItem('codeRequestTimestamp', Date.now().toString());
                setShowAuthCode(true);
              }}
              className="w-full px-6 py-3 rounded-xl bg-indigo-700/30 text-indigo-300 hover:bg-indigo-700/40 hover:text-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              {t('auth.alreadyHaveCode')}
            </button>
          )}
          
          {isPwa && (
            <button
              type="button"
              onClick={() => {
                // Set a timestamp to remember that code entry was requested
                window.localStorage.setItem('codeRequestTimestamp', Date.now().toString());
                setShowAuthCode(true);
              }}
              className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              {t('login.continue')}
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Sign in to Continue</h2>
        <p className="mt-4 text-gray-400">
          Enter your email to view your personalized program
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email address"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div>
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Continue'}
          </button>
        </div>
      </form>
    </div>
  );
} 