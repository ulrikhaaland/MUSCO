'use client';

import { useRouter } from 'next/navigation';
import { AuthForm } from '@/app/components/auth/AuthForm';
import { useEffect } from 'react';

export default function LoginPage() {
  const router = useRouter();

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
      <AuthForm onSkip={handleSkip} />
    </div>
  );
} 