'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useLoader } from '@/app/context/LoaderContext';
import { db } from '@/app/firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useTranslation } from '@/app/i18n/TranslationContext';

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { t } = useTranslation();
  const [statusText, setStatusText] = useState(t('subscribe.success.finalizing'));
  const { setIsLoading } = useLoader();

  useEffect(() => {
    // Wait for auth to settle before deciding anything
    if (loading) return;
    if (!user?.uid) return; // don't kick to login; let user arrive after redirect

    // Show global loader while we finalize subscription
    setIsLoading(
      true,
      t('subscribe.success.activating'),
      t('subscribe.success.usuallySeconds')
    );

    let cancelled = false;
    let attempts = 0;

    const check = async () => {
      attempts += 1;
      try {
        const snap = await getDoc(doc(db, 'users', user.uid));
        const data = snap.exists() ? (snap.data() as any) : null;
        const active =
          data?.isSubscriber === true ||
          data?.subscriptionStatus === 'active' ||
          data?.subscriptionStatus === 'trialing';
        if (active && !cancelled) {
          setIsLoading(
            true,
            t('subscribe.success.active'),
            t('subscribe.success.openingFeedback')
          );
          router.replace('/program/feedback');
          return;
        }
      } catch {}

      if (!cancelled) {
        if (attempts < 7) {
          setTimeout(check, 1500);
        } else {
          setStatusText(t('subscribe.success.recordedLoading'));
          router.replace('/program');
        }
      }
    };

    const timeoutId = setTimeout(check, 800);
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      setIsLoading(false);
    };
  }, [user, loading, router, setIsLoading, t]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="text-center">
        <div className="text-2xl font-semibold mb-2">{t('subscribe.success.title')}</div>
        <div className="text-gray-300">{statusText}</div>
      </div>
    </div>
  );
}


