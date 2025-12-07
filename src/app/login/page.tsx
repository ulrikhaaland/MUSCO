'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { AuthForm } from '@/app/components/auth/AuthForm';
import { useEffect, useState, Suspense } from 'react';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSaveContext, setIsSaveContext] = useState(false);

  useEffect(() => {
    // Check URL parameter for save context
    const context = searchParams?.get('context');
    // Also check session storage
    const loginContext = window.sessionStorage.getItem('loginContext');
    
    setIsSaveContext(context === 'save' || loginContext === 'saveProgram');
  }, [searchParams]);

  const handleSkip = () => {
    // Clean up any logout/delete flags
    window.sessionStorage.removeItem('justLoggedOut');
    window.sessionStorage.removeItem('accountDeleted');

    // Only try to go back if user was in a save context (trying to save a program)
    if (isSaveContext) {
      // Prefer same-origin referrer
      if (document.referrer) {
        try {
          const ref = new URL(document.referrer);
          if (ref.origin === window.location.origin && !ref.pathname.startsWith('/login')) {
            router.push(`${ref.pathname}${ref.search}${ref.hash}`);
            return;
          }
        } catch {
          // ignore URL parse errors
        }
      }
      // Fall back to browser history
      if (window.history.length > 1) {
        router.back();
        return;
      }
    }

    // Default: go to root
    router.push('/');
  };
  
  // Reset code request timestamp when arriving at login page directly
  useEffect(() => {
    // Only reset if we're coming directly to the login page, not from a code request flow
    const urlParams = new URLSearchParams(window.location.search);
    const showCode = urlParams.get('showcode');
    
    if (!showCode) {
      // Clear code request timestamp to reset the auth flow
      window.localStorage.removeItem('codeRequestTimestamp');
    }
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center">
        <AuthForm onSkip={handleSkip} isSaveContext={isSaveContext} />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
} 