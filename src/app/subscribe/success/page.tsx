'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { db } from '@/app/firebase/config';
import { doc, getDocFromServer } from 'firebase/firestore';
import { useLoader } from '@/app/context/LoaderContext';

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user, loading } = useAuth();
  const { setIsLoading: showGlobalLoader } = useLoader();
  const [statusText, setStatusText] = useState('Finalizing your subscription…');

  useEffect(() => {
    showGlobalLoader(true, statusText);
  }, [statusText, showGlobalLoader]);

  useEffect(() => {
    // Wait for auth to settle before deciding anything
    if (loading) return;
    if (!user?.uid) return; // don't kick to login; let user arrive after redirect

    if (sessionId) {
      // As a fallback if webhook is delayed/missing, confirm session on server
      fetch('/api/subscribe/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, uid: user.uid }),
      }).catch(() => {});
    }

    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      attempts += 1;
      try {
        // Force a server read to ensure we get the latest subscription data
        const snap = await getDocFromServer(doc(db, 'users', user.uid));
        const data = snap.exists() ? (snap.data() as any) : null;
        const active =
          data?.isSubscriber === true ||
          data?.subscriptionStatus === 'active' ||
          data?.subscriptionStatus === 'trialing';
        if (active && !cancelled) {
          setStatusText('Loading your account…');
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
  }, [user, loading, router, sessionId]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">Thanks for subscribing!</div>
        <div className="text-gray-300">{statusText}</div>
      </div>
    </div>
  );
}


