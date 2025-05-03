'use client';

import { useState, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '@/app/firebase/config';
import { signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from './ToastProvider';
import { useTranslation } from '@/app/i18n';
import Logo from './Logo';

export function AuthCodeInput() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const router = useRouter();
  const { t } = useTranslation();
  
  // References for the individual code inputs
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  // Get email from localStorage if available (for PWA flow)
  useEffect(() => {
    const storedEmail = window.localStorage.getItem('emailForSignIn');
    
    if (storedEmail) {
      setEmail(storedEmail);
      
      // Only automatically go to code entry if:
      // 1. We're in PWA mode, OR 
      // 2. There's a parameter/flag indicating we came from code request flow
      const isPwa = typeof window !== 'undefined' && (
        window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://')
      );
      
      // Get URL parameter 'showcode' if present
      const urlParams = new URLSearchParams(window.location.search);
      const showCode = urlParams.get('showcode');
      
      // Check for a recently requested code timestamp
      const codeRequestTimestamp = window.localStorage.getItem('codeRequestTimestamp');
      const isRecentCodeRequest = codeRequestTimestamp && 
        (Date.now() - parseInt(codeRequestTimestamp, 10) < 5 * 60 * 1000); // 5 minutes
      
      if (isPwa || showCode === 'true' || isRecentCodeRequest) {
        setStep('code');
      }
    }
  }, []);

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast.error(t('login.invalidEmail'));
      return;
    }
    
    // Store email for the code step
    window.localStorage.setItem('emailForSignIn', email);
    
    // Set a timestamp for the code request
    window.localStorage.setItem('codeRequestTimestamp', Date.now().toString());
    
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

  // Handle input change for the code digits
  const handleCodeDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value.charAt(value.length - 1);
    }

    if (!/^[0-9]*$/.test(value)) {
      return;
    }

    const newCode = code.split('');
    newCode[index] = value;
    const updatedCode = newCode.join('');
    setCode(updatedCode);

    // Move focus to next input if this one has a value
    if (value && index < 5) {
      inputRefs[index + 1].current?.focus();
    }
  };

  // Handle backspace in code input
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (index > 0 && !code[index]) {
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  // Handle paste for code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    if (!pastedText) return;
    
    const digits = pastedText.replace(/\D/g, '').slice(0, 6);
    if (digits.length) {
      setCode(digits);
      
      // Focus the appropriate field
      if (digits.length < 6) {
        inputRefs[digits.length]?.current?.focus();
      } else {
        inputRefs[5]?.current?.focus();
      }
    }
  };

  if (step === 'email') {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-6">
          <Logo variant="vertical" />
          <h2 className="text-3xl font-bold text-white mt-5">{t('login.enterEmail')}</h2>
          <p className="text-gray-400 text-sm mt-2">{t('auth.enterEmailForCode')}</p>
        </div>
        
        <form onSubmit={handleEmailSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="sr-only">
              {t('login.email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder={t('auth.emailAddress')}
              required
              autoComplete="email"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-6 rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
          >
            {t('auth.sendCode')}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8">
      <div className="text-center">
        <Logo variant="vertical" />
        <h2 className="text-3xl font-bold text-white mt-5">
          {t('auth.codeLogin')}
        </h2>
        
        {/* Show email that code was sent to */}
        <p className="text-gray-400 text-sm mt-2">
          {t('auth.codeSentTo')} <span className="text-white">{email}</span>
        </p>
        
        <p className="text-gray-400 text-sm mt-2">
          {t('auth.enterCodeFromEmail')}
        </p>
      </div>

      <form onSubmit={handleCodeSubmit} className="space-y-6">
        <div className="flex justify-center space-x-2 sm:space-x-4">
          {/* Individual digit inputs */}
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              ref={inputRefs[index]}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={1}
              autoFocus={index === 0}
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              onChange={(e) => handleCodeDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onPaste={handlePaste}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-6 rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? t('login.verifying') : t('login.verify')}
        </button>
      </form>

      <div className="text-center">
        <button
          type="button"
          onClick={handleBackToEmail}
          className="text-indigo-400 hover:text-indigo-300 text-sm focus:outline-none"
        >
          {t('login.back')}
        </button>
      </div>
    </div>
  );
} 