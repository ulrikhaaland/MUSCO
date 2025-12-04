'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';

export default function GymOwnerRegisterPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [_err] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      router.replace('/admin/gyms');
    }
  }, [loading, user, router]);

  if (!loading && user) {
    // Silent immediate redirect if already signed in
    router.replace('/admin/gyms');
    return null;
  }

  // Back-compat: redirect /admin/register to /admin/login
  if (typeof window !== 'undefined') {
    router.replace('/admin/login');
  }
  return null;
}


