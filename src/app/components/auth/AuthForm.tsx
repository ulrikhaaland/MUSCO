'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/app/i18n';
import Logo from '@/app/components/ui/Logo';
import { AuthCodeInput } from '@/app/components/ui/AuthCodeInput';
import { LoadingDots } from '@/app/components/ui/LoadingDots';
import { useIsPwa } from '@/app/hooks/useIsPwa';

export function AuthForm({ onSkip }: { onSkip?: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const isPwa = useIsPwa();
  const [step, setStep] = useState<'email' | 'code'>('email');
  const { sendSignInLink } = useAuth();

  // If running as PWA and an email is stored locally, jump directly to code entry
  useEffect(() => {
    if (!isPwa) return;

    const storedEmail = window.localStorage.getItem('emailForSignIn');
    if (storedEmail) {
      setEmail(storedEmail);
      setStep('code');
    }
  }, [isPwa]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendSignInLink(email);
      // Save the email locally to complete sign in after user clicks the link
      window.localStorage.setItem('emailForSignIn', email);
      window.localStorage.setItem('codeRequestTimestamp', Date.now().toString());

      setStep('code');
    } catch (error: any) {
      setError(error.message);
      setStep('email'); // on error, go back to email step
    } finally {
      setLoading(false);
    }
  };

  if (step === 'code') {
    return (
      <div className="w-full max-w-md px-4 pb-6 overflow-hidden">
        <AuthCodeInput />
        
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setStep('email')}
            className="text-sm text-gray-400 hover:text-gray-300 underline underline-offset-4 transition-colors duration-200"
          >
            {t('auth.backToEmail')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4 px-4 pb-6 overflow-hidden">
      <Logo variant="vertical" />
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">{t('auth.welcome')}</h2>
        <p className="mt-1 text-sm text-gray-400">
          {t('auth.enterEmailForCode')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-4 space-y-4">
        <div>
          <label htmlFor="email" className="sr-only">
            {t('auth.emailAddress')}
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
            placeholder={t('auth.emailAddress')}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="space-y-3">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>
                {t('auth.sending')}
                <LoadingDots />
              </span>
            ) : (
              t('auth.sendCode')
            )}
          </button>

          {onSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="w-full px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
            >
              {t('auth.continueWithoutLogin')}
            </button>
          )}
        </div>
      </form>
    </div>
  );
} 