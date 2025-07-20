'use client';

import { useState, useRef, useEffect } from 'react';
import { httpsCallable } from 'firebase/functions';
import { functions, auth, db } from '@/app/firebase/config';
import { signInWithEmailLink } from 'firebase/auth';
import { collection, addDoc, query, getDocs } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { toast } from './ToastProvider';
import { useTranslation } from '@/app/i18n';
import Logo from './Logo';
import { LoadingDots } from './LoadingDots';
import { ProgramType } from '@/app/shared/types';

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
      console.log('🔍 Validating auth code...');
      // Call the Cloud Function to validate the code
      const validateAuthCode = httpsCallable(functions, 'validateAuthCode');
      const result = await validateAuthCode({ email, code: codeToValidate });

      // Get the sign-in link and program data from the result
      const data = result.data as { link: string; program?: any };
      console.log('📥 Auth code validation result:', { 
        hasLink: !!data?.link, 
        hasProgram: !!data?.program,
        programTitle: data?.program?.title,
        programType: data?.program?.type
      });

      if (!data || !data.link) {
        throw new Error('Invalid response from server');
      }

      // Use the link to sign in
      console.log('🔐 Signing in with email link...');
      const userCredential = await signInWithEmailLink(auth, email, data.link);
      const user = userCredential.user;
      console.log('✅ User signed in successfully:', user.uid);

      // If program data was provided, save it to the user's account
      if (data.program && user) {
        console.log('💾 Program data found, starting save process...');
        console.log('📋 Program data:', {
          title: data.program.title,
          type: data.program.type,
          targetAreas: data.program.targetAreas,
          daysCount: data.program.days?.length || 'unknown'
        });
        
        try {
          // Check if user already has existing programs
          const programsRef = collection(db, `users/${user.uid}/programs`);
          const existingProgramsQuery = query(programsRef);
          const existingProgramsSnapshot = await getDocs(existingProgramsQuery);
          const hasExistingPrograms = !existingProgramsSnapshot.empty;
          
          console.log(`📊 User has ${existingProgramsSnapshot.size} existing programs`);
          
          // Create a recovery program entry in the user's programs collection
          console.log('📁 Creating program document in collection:', `users/${user.uid}/programs`);
          
          // Create a structured program document similar to other user programs
          // Set active to false if user already has programs, true if this is their first program
          
          // Check if this is the new UserProgram structure with diagnosis/questionnaire
          const isNewUserProgramStructure = data.program.diagnosis && data.program.questionnaire;
          
          const programDoc = {
            diagnosis: isNewUserProgramStructure ? data.program.diagnosis : {
              diagnosis: data.program.title || 'Recovery Program',
              painfulAreas: data.program.targetAreas || [],
              informationalInsights: data.program.programOverview || null,
              onset: 'gradual',
              painScale: 5,
              mechanismOfInjury: 'overuse',
              aggravatingFactors: null,
              relievingFactors: null,
              priorInjury: 'unknown',
              painPattern: 'activity-dependent',
              painLocation: null,
              painCharacter: 'dull',
              assessmentComplete: true,
              redFlagsPresent: false,
              avoidActivities: [],
              recoveryGoals: ['reduce pain', 'improve mobility', 'prevent future injury'],
              timeFrame: '4 weeks',
              followUpQuestions: [],
              programType: ProgramType.Recovery,
              targetAreas: data.program.targetAreas || []
            },
            questionnaire: isNewUserProgramStructure ? data.program.questionnaire : {
              // Minimal questionnaire data for recovery program
              age: '30_40', // Default age range
              pastExercise: '2_3_times_per_week',
              exerciseDays: 3,
              targetAreas: data.program.targetAreas || [],
              exerciseEnvironment: 'at_home',
              workoutDuration: '30_45_minutes',
              painAreas: [],
              trainingType: 'at_home',
            },
            active: !hasExistingPrograms, // Only set as active if user has no existing programs
            status: 'done',
            type: ProgramType.Recovery,
            title: isNewUserProgramStructure ? data.program.title : (data.program.title || 'Recovery Program'),
            timeFrame: isNewUserProgramStructure ? data.program.timeFrame : '4 weeks',
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          console.log('📄 Program document structure:', { 
            ...programDoc, 
            active: programDoc.active,
            reason: hasExistingPrograms ? 'User has existing programs - setting as inactive' : 'First program for user - setting as active'
          });
          const programDocRef = await addDoc(programsRef, programDoc);
          console.log('✅ Program document created with ID:', programDocRef.id);

          // Now save the actual program data in the programs subcollection
          const innerProgramsRef = collection(db, `users/${user.uid}/programs/${programDocRef.id}/programs`);
          console.log('📁 Creating program data in subcollection:', `users/${user.uid}/programs/${programDocRef.id}/programs`);
          
          if (isNewUserProgramStructure) {
            // For recovery programs, save each week as a separate document
            console.log('💾 Saving recovery program with', data.program.programs.length, 'weeks');
            
            for (let i = 0; i < data.program.programs.length; i++) {
              const weekProgram = data.program.programs[i];
              const programDataDoc = {
                ...weekProgram,
                createdAt: new Date(),
              };
              
              console.log(`📊 Week ${i + 1} program data:`, {
                title: programDataDoc.title,
                type: programDataDoc.type,
                programDays: programDataDoc.days?.length || 'unknown',
                hasExercises: !!programDataDoc.days?.[0]?.exercises
              });
              
              const innerProgramDocRef = await addDoc(innerProgramsRef, programDataDoc);
              console.log(`✅ Week ${i + 1} saved with ID:`, innerProgramDocRef.id);
            }
          } else {
            // For regular programs, save the single program
            const programDataDoc = {
              ...data.program,
              createdAt: new Date(),
            };
            console.log('📊 Regular program data document:', {
              title: programDataDoc.title,
              type: programDataDoc.type,
              programDays: programDataDoc.days?.length || 'unknown',
              hasExercises: !!programDataDoc.days?.[0]?.exercises
            });
            
            const innerProgramDocRef = await addDoc(innerProgramsRef, programDataDoc);
            console.log('✅ Program data saved with ID:', innerProgramDocRef.id);
          }
          console.log('🎉 Recovery program successfully saved to user account!');

          toast.success('Program saved to your account!');
        } catch (error) {
          console.error('❌ Error saving program:', error);
          console.error('📋 Program data that failed to save:', data.program);
          // Don't throw here - the login was successful, we just couldn't save the program
          toast.error('Login successful, but there was an issue saving the program.');
        }
      } else {
        console.log('ℹ️ No program data to save');
        if (!data.program) console.log('   - No program data in response');
        if (!user) console.log('   - No user object available');
      }

      // Clean up localStorage
      window.localStorage.removeItem('hasPendingQuestionnaire');

      // Successfully signed in, redirect to appropriate page
      console.log('🎯 Login successful, redirecting...');
      toast.success(t('login.success'));
      
      const previousPath = window.sessionStorage.getItem('previousPath');
      const loginContext = window.sessionStorage.getItem('loginContext');
      
      // If user signed up to save a program, always redirect to /program
      if (loginContext === 'saveProgram') {
        console.log('🏠 Save context detected, redirecting to program page');
        router.push('/program');
      } else if (previousPath) {
        console.log('🔄 Redirecting to previous path:', previousPath);
        router.push(previousPath);
      } else {
        console.log('🏠 Redirecting to program page');
        router.push('/program');
      }
      
      // Clean up session storage
      window.sessionStorage.removeItem('previousPath');
      window.sessionStorage.removeItem('loginContext');
      window.sessionStorage.removeItem('currentRecoveryProgram');
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
