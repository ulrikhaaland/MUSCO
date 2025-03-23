'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthForm } from '@/app/components/auth/AuthForm';

export default function LoginPage() {
  const router = useRouter();

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <AuthForm onSkip={handleSkip} />
    </div>
  );
} 