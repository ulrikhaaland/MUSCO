'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { AuthForm } from '@/app/components/auth/AuthForm';

export default function AdminLoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      router.replace('/admin/gyms');
    }
  }, [loading, user, router]);

  if (!loading && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="max-w-md mx-auto h-[100dvh] flex items-center justify-center px-6">
        <div className="w-full space-y-6">
          <AuthForm isAdmin />
        </div>
      </div>
    </div>
  );
}


