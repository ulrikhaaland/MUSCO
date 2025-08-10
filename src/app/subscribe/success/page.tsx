'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLoader } from '@/app/context/LoaderContext';

function FinalizeSubscription() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { user, loading, refreshUserProfile } = useAuth();
  const { showLoader, hideLoader } = useLoader();

  useEffect(() => {
    if (loading) return;
    if (!user?.uid || !sessionId) return;

    let cancelled = false;

    const finalize = async () => {
      showLoader('Finalizing your subscription…');
      try {
        await fetch('/api/subscribe/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_id: sessionId, uid: user.uid }),
        });
        await refreshUserProfile();
        if (!cancelled) {
          router.replace('/program/feedback');
        }
      } catch (err) {
        console.error('Subscription confirmation failed', err);
        if (!cancelled) {
          router.replace('/program');
        }
      } finally {
        hideLoader();
      }
    };

    finalize();

    return () => {
      cancelled = true;
    };
  }, [loading, user, sessionId, router, refreshUserProfile, showLoader, hideLoader]);

  return null;
}

export default function SubscribeSuccessPage() {
  return (
    <Suspense fallback={null}>
      <FinalizeSubscription />
    </Suspense>
  );
}

