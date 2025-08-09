'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/config';
import { doc, getDoc } from 'firebase/firestore';

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [statusText, setStatusText] = useState('Finalizing your subscription…');

  useEffect(() => {
    // Wait for auth to settle before deciding anything
    if (loading) return;
    if (!user?.uid) return; // don't kick to login; let user arrive after redirect

    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      attempts += 1;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.exists() ? (snap.data() as any) : null;
        const active = data?.isSubscriber === true || data?.subscriptionStatus === 'active' || data?.subscriptionStatus === 'trialing';
        if (active && !cancelled) {
          router.replace('/program/feedback');
          return;
        }
      } catch {}

      if (!cancelled) {
        if (attempts < 7) {
          setTimeout(check, 1500);
        } else {
          setStatusText('Subscription recorded, loading your account…');
          router.replace('/program');
        }
      }
    };

    const t = setTimeout(check, 800);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">Thanks for subscribing!</div>
        <div className="text-gray-300">{statusText}</div>
      </div>
    </div>
  );
}


