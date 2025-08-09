'use client';

import { useState, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, auth } from '@/app/firebase/config';
import { signInWithEmailLink } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { toast } from './ToastProvider';
import { useTranslation } from '@/app/i18n';
import Logo from './Logo';
import { LoadingDots } from './LoadingDots';
import { saveRecoveryProgramToAccount, clearRecoveryProgramFromSession } from '@/app/services/recoveryProgramService';



export function AuthCodeInput() {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const router = useRouter();
  const { t, locale } = useTranslation();

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
      const isPwa =
        typeof window !== 'undefined' &&
        (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone ||
          document.referrer.includes('android-app://'));

      // Get URL parameter 'showcode' if present
      const urlParams = new URLSearchParams(window.location.search);
      const showCode = urlParams.get('showcode');

      // Check for a recently requested code timestamp
      const codeRequestTimestamp = window.localStorage.getItem(
        'codeRequestTimestamp'
      );
      const isRecentCodeRequest =
        codeRequestTimestamp &&
        Date.now() - parseInt(codeRequestTimestamp, 10) < 5 * 60 * 1000; // 5 minutes

      if (isPwa || showCode === 'true' || isRecentCodeRequest) {
        setStep('code');
      }
    }
  }, []);

  // Cool-down timer for "resend code" button
  useEffect(() => {
    if (resendCooldown === 0) return;

    const timer = setInterval(() => {
      setResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [resendCooldown]);

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

  const performCodeValidation = async (codeToValidate: string) => {
    if (isLoading) return; // Prevent concurrent submissions

    setIsLoading(true);
    try {
      // Call the Cloud Function to validate the code
      const validateAuthCode = httpsCallable(functions, 'validateAuthCode');
      const result = await validateAuthCode({ email, code: codeToValidate });

      // Get the sign-in link and program data from the result
      const data = result.data as { link: string; program?: any };

      if (!data || !data.link) {
        throw new Error('Invalid response from server');
      }

      // Use the link to sign in
      const userCredential = await signInWithEmailLink(auth, email, data.link);
      const user = userCredential.user;

      // If program data was provided, save it to the user's account
      if (data.program && user) {
        try {
          await saveRecoveryProgramToAccount(user, data.program);
          toast.success('Program saved to your account!');
        } catch (error) {
          console.error('❌ Error saving program:', error);
          console.error('📋 Program data that failed to save:', data.program);
          // Don't throw here - the login was successful, we just couldn't save the program
          toast.error('Login successful, but there was an issue saving the program.');
        }
      }

      // Clean up localStorage
      window.localStorage.removeItem('hasPendingQuestionnaire');

      // Successfully signed in, redirect to appropriate page
      toast.success(t('login.success'));
      
      const previousPath = window.sessionStorage.getItem('previousPath');
      const loginContext = window.sessionStorage.getItem('loginContext');
      
      // If user signed up to save a program, always redirect to /program
      if (loginContext === 'saveProgram') {
        router.push('/program');
      } else if (previousPath) {
        router.push(previousPath);
      } else {
        router.push('/program');
      }
      
      // Clean up session storage
      window.sessionStorage.removeItem('previousPath');
      window.sessionStorage.removeItem('loginContext');
      clearRecoveryProgramFromSession();
    } catch (error: any) {
      console.error('❌ Error validating code:', error);

      let errorMessage = t('login.codeFailed');
      // Optionally map known Firebase error codes for clarity
      if (error && typeof error === 'object' && 'code' in error) {
        const fbCode = (error as any).code as string;
        if (fbCode === 'functions/invalid-argument') {
          // keep default translated message
        } else if (fbCode === 'functions/failed-precondition') {
          errorMessage = t('login.codeFailed');
        }
      }

      setErrorMsg(errorMessage);
      setCode('');
      inputRefs[0].current?.focus();
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || code.length !== 6) {
      toast.error(t('login.invalidCode'));
      return;
    }
    await performCodeValidation(code);
  };

  // Handle input change for the code digits
  const handleCodeDigitChange = (index: number, value: string) => {
    if (isLoading) return;

    // If the user pasted or autofilled multiple digits (e.g. by tapping an OTP prompt)
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6);

      if (digits.length) {
        setCode(digits);

        // Focus the appropriate field or validate immediately if complete
        if (digits.length < 6) {
          inputRefs[digits.length]?.current?.focus();
        } else {
          inputRefs[5]?.current?.focus();
          // Auto-submit if code is complete after autofill
          performCodeValidation(digits);
        }
      }
      return;
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

    // Auto-submit if code is complete
    if (updatedCode.length === 6) {
      performCodeValidation(updatedCode);
    }
  };

  // Handle backspace in code input
  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }

    if (e.key === 'Backspace') {
      if (index > 0 && !code[index]) {
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  // Handle paste for code
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isLoading) return;
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
        // Auto-submit if code is complete after paste
        performCodeValidation(digits);
      }
    }
  };

  // Handle iOS OTP autofill (keyboard "Code from Mail/SMS"): capture before maxlength truncates
  const handleBeforeInput = (
    index: number,
    e: React.FormEvent<HTMLInputElement>
  ) => {
    if (isLoading) return;
    const native = e.nativeEvent as unknown as { data?: string; inputType?: string };
    const incoming = native?.data ?? '';
    const inputType = native?.inputType ?? '';

    const isBulkInsert =
      (incoming && incoming.length > 1) ||
      inputType === 'insertFromPaste' ||
      inputType === 'insertReplacementText';

    if (!isBulkInsert) return;

    const digits = (incoming || '').replace(/\D/g, '').slice(0, 6);
    if (!digits) return;

    e.preventDefault();
    setCode(digits);

    if (digits.length < 6) {
      inputRefs[digits.length]?.current?.focus();
      return;
    }

    inputRefs[5]?.current?.focus();
    performCodeValidation(digits);
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;

    try {
      setIsLoading(true);
      setErrorMsg(null);

      if (!functions) {
        toast.error('Konfigurasjonsfeil. Prøv igjen senere.');
        return;
      }

      const sendLoginEmail = httpsCallable(functions, 'sendLoginEmail');

      // Detect PWA like in useIsPwa (small duplication to avoid extra import)
      const isPwa =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone ||
        document.referrer.includes('android-app://');

      await sendLoginEmail({
        email,
        origin: window.location.origin,
        language: locale,
        isPwa,
      });

      toast.success(t('login.codeResent'));
      setResendCooldown(30);
    } catch (error) {
      console.error('Error resending code:', error);
      toast.error(t('login.codeResendFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'email') {
    return (
      <div className="w-full max-w-md space-y-8">
        <div className="text-center mb-6">
          <Logo variant="vertical" />
          <h2 className="text-3xl font-bold text-white mt-5">
            {t('login.enterEmail')}
          </h2>
          <p className="text-gray-400 text-sm mt-2">
            {t('auth.enterEmailForCode')}
          </p>
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
              autoComplete="one-time-code"
              className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
              value={code[index] || ''}
              onChange={(e) => handleCodeDigitChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              onBeforeInput={(e) => handleBeforeInput(index, e)}
              onPaste={handlePaste}
              readOnly={isLoading}
              disabled={isLoading}
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex justify-center py-3 px-6 rounded-xl shadow-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              {t('login.verifying')}
              <LoadingDots />
            </>
          ) : (
            t('login.verify')
          )}
        </button>

        {/* Inline error message */}
        {errorMsg && (
          <p className="mt-2 text-sm text-red-500 text-center">{errorMsg}</p>
        )}

        {/* Resend code link */}
        <p className="mt-3 text-center text-sm">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isLoading}
            className="text-indigo-400 hover:text-indigo-300 disabled:opacity-50 underline underline-offset-4"
          >
            {resendCooldown > 0
              ? t('login.resendIn', { s: String(resendCooldown) })
              : t('login.resendCode')}
          </button>
        </p>
      </form>
    </div>
  );
}
