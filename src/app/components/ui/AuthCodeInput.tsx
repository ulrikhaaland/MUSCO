'use client';

import { useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '@/app/firebase/config';
import { signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from './ToastProvider';
import { useTranslation } from '@/app/i18n';

export function AuthCodeInput() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const router = useRouter();
  const { t } = useTranslation();

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(t('login.invalidEmail'));
      return;
    }
    
    // Store email for the code step
    window.localStorage.setItem('emailForSignIn', email);
    setStep('code');
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error(t('login.invalidCode'));
      return;
    }

    setIsLoading(true);
    try {
      // Call the Cloud Function to validate the code
      const validateAuthCode = httpsCallable(functions, 'validateAuthCode');
      const result = await validateAuthCode({ email, code });
      
      // Get the sign-in link from the result
      const data = result.data as { link: string };
      
      if (!data || !data.link) {
        throw new Error('Invalid response from server');
      }
      
      // Use the link to sign in
      await signInWithEmailLink(auth, email, data.link);
      
      // Clean up localStorage
      window.localStorage.removeItem('hasPendingQuestionnaire');
      
      // Successfully signed in, redirect to home
      toast.success(t('login.success'));
      router.push('/');
    } catch (error: any) {
      console.error('Error validating code:', error);
      
      let errorMessage = t('login.codeFailed');
      if (error?.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep('email');
    setCode('');
  };

  if (step === 'email') {
    return (
      <div className="w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">{t('login.enterEmail')}</h2>
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {t('login.continue')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <h2 className="text-xl font-semibold text-center">{t('login.enterCode')}</h2>
      <p className="text-sm text-center text-gray-400">
        {t('login.codeInstructions')}
      </p>
      <form onSubmit={handleCodeSubmit} className="space-y-4">
        <div>
          <label htmlFor="code" className="block text-sm font-medium text-gray-300">
            {t('login.code')}
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-wider"
            required
            autoFocus
          />
        </div>
        <div className="flex flex-col space-y-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? t('login.verifying') : t('login.verify')}
          </button>
          <button
            type="button"
            onClick={handleBackToEmail}
            className="w-full flex justify-center py-2 px-4 border border-gray-700 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-transparent hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {t('login.back')}
          </button>
        </div>
      </form>
    </div>
  );
} 