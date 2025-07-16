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
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <AuthForm onSkip={handleSkip} isSaveContext={isSaveContext} />
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