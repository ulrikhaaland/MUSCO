'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useTranslation } from '@/app/i18n';

export function AuthForm({ onSkip }: { onSkip: () => void }) {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { sendSignInLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendSignInLink(email);
      // Save the email locally to complete sign in after user clicks the link
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (error: any) {
      setError(error.message);
      setEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md space-y-8 px-4 overflow-hidden">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">{t('auth.checkEmail')}</h2>
          <p className="mt-4 text-gray-400">
            {t('auth.sentLoginLink')} <span className="text-white">{email}</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">
            {t('auth.clickLinkToSignIn')}
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

          <button
            type="button"
            onClick={onSkip}
            className="w-full px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
          >
            {t('auth.continueWithoutLogin')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 px-4 overflow-hidden">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">{t('auth.welcome')}</h2>
        <p className="mt-2 text-sm text-gray-400">
          {t('auth.enterEmailToStart')}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
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

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.sending') : t('auth.sendLoginLink')}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
          >
            {t('auth.continueWithoutLogin')}
          </button>
        </div>
      </form>
    </div>
  );
} 