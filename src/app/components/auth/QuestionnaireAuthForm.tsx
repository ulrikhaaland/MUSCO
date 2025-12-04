'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';
import { useUser } from '@/app/context/UserContext';
import { storePendingQuestionnaire } from '@/app/services/questionnaire';
import { useTranslation } from '@/app/i18n';
import { AuthCodeInput } from '../ui/AuthCodeInput';
import { useIsPwa } from '@/app/hooks/useIsPwa';
import { PartnerLogos } from '../ui/PartnerLogos';

export function QuestionnaireAuthForm() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { sendSignInLink } = useAuth();
  const { pendingQuestionnaire } = useUser();
  const _isPwa = useIsPwa();
  const [showAuthCode, setShowAuthCode] = useState(false);

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
      window.localStorage.setItem('codeRequestTimestamp', Date.now().toString());
      
      setShowAuthCode(true);
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (showAuthCode) {
    return <AuthCodeInput />;
  }

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      {/* Progress */}
      <div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full w-full bg-indigo-600 animate-pulse" />
        </div>
        <p className="text-xs text-gray-400 text-center mt-2">{t('qa.stepIndicator')}</p>
      </div>

      {/* Heading */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">{t('qa.heading')}</h2>
        <p className="mt-4 text-gray-400">
          {t('qa.subheading')}
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

        <div className="space-y-6">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? t('auth.sending') + '…' : t('auth.sendCode')}
          </button>

          {/* Benefits list */}
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span>{t('qa.benefit.noPassword')}</li>
            <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span>{t('qa.benefit.free')}</li>
            <li className="flex items-center gap-2"><span className="text-indigo-400">✓</span>{t('qa.benefit.crossDevice')}</li>
          </ul>
        </div>
      </form>

      {/* Partner logos */}
      <PartnerLogos />
    </div>
  );
} 