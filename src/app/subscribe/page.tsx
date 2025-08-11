'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';
import { useTranslation } from '@/app/i18n/TranslationContext';

export default function SubscribePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | 'ulrik' | null>(null);
  const { t } = useTranslation();

  const startCheckout = async (plan: 'monthly' | 'annual' | 'ulrik') => {
    if (!user?.uid) {
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem('previousPath', '/subscribe');
        window.sessionStorage.setItem('loginContext', 'subscribe');
      }
      router.push('/login');
      return;
    }

    setLoadingPlan(plan);
    try {
      const res = await fetch('/api/subscribe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: plan, uid: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (e) {
      console.error('Checkout error', e);
      setLoadingPlan(null);
    }
  };

  const isFounderEligible = () => {
    const email = user?.email?.toLowerCase() || '';
    return (
      email === 'ulrikhaaland2@gmail.com' ||
      email === 'ulrikhaland@gmail.com' ||
      email.includes('hopstock')
    );
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white px-6 py-10">
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-semibold">{t('subscribe.title')}</h1>
          <p className="text-gray-300 mt-3">{t('subscribe.subtitle')}</p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 items-start">
          {/* Benefits */}
          <div className="md:col-span-3 bg-gray-800/60 rounded-2xl ring-1 ring-gray-700/50 p-6">
            <h2 className="text-xl font-medium mb-4">{t('subscribe.premium.heading')}</h2>
            <ul className="space-y-3 text-gray-200">
              {[
                'subscribe.premium.benefit.weeklyFollowUp',
                'subscribe.premium.benefit.library',
                'subscribe.premium.benefit.evidence',
                'subscribe.premium.benefit.calendar',
                'subscribe.premium.benefit.multiLang',
                'subscribe.premium.benefit.priority',
              ].map((key) => (
                <li key={key} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{t(key)}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-sm text-gray-400">
              <p>
                {t('subscribe.free.limits')}
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gray-800/60 rounded-2xl ring-1 ring-gray-700/50 p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-lg font-medium">{t('subscribe.plan.monthly')}</div>
                  <div className="text-gray-300">{t('subscribe.price.monthly')}</div>
                </div>
                <button
                  onClick={() => startCheckout('monthly')}
                  disabled={loadingPlan !== null}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loadingPlan === 'monthly' ? t('subscribe.button.redirecting') : t('subscribe.button.choose')}
                </button>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-2xl ring-1 ring-gray-700/50 p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-lg font-medium">{t('subscribe.plan.annual')}</div>
                  <div className="text-gray-300">{t('subscribe.price.annual')}</div>
                </div>
                <button
                  onClick={() => startCheckout('annual')}
                  disabled={loadingPlan !== null}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loadingPlan === 'annual' ? t('subscribe.button.redirecting') : t('subscribe.button.choose')}
                </button>
              </div>
            </div>

            {isFounderEligible() && (
              <div className="bg-amber-900/50 rounded-2xl ring-1 ring-amber-700/50 p-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-lg font-medium">{t('subscribe.plan.founder')}</div>
                    <div className="text-gray-300">{t('subscribe.plan.founderDesc')}</div>
                  </div>
                  <button
                    onClick={() => startCheckout('ulrik')}
                    disabled={loadingPlan !== null}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
                  >
                    {loadingPlan === 'ulrik' ? t('subscribe.button.redirecting') : t('subscribe.button.choose')}
                  </button>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">{t('subscribe.footer.note')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}


