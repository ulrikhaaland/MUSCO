'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';

export default function SubscribePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | 'ulrik' | null>(null);

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
          <h1 className="text-3xl md:text-4xl font-semibold">Unlock Weekly, Personalized Programs</h1>
          <p className="text-gray-300 mt-3">AI‑guided recovery and training, adapted to your feedback, available in English and Norwegian.</p>
        </div>

        <div className="grid md:grid-cols-5 gap-6 items-start">
          {/* Benefits */}
          <div className="md:col-span-3 bg-gray-800/60 rounded-2xl ring-1 ring-gray-700/50 p-6">
            <h2 className="text-xl font-medium mb-4">Everything in BodAI Premium</h2>
            <ul className="space-y-3 text-gray-200">
              {[
                'Weekly follow‑up program tailored from your feedback',
                'Full exercise library with clear videos and modifications',
                'Evidence‑based recovery + strength programming',
                'Calendar & progress tracking across weeks',
                'Multi‑language: English & Norwegian',
                'Priority model access for faster responses',
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                  </svg>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6 text-sm text-gray-400">
              <p>
                Free plan limits: follow‑up program generation is locked, and chat/model interactions are limited. Upgrade to remove limits.
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="md:col-span-2 space-y-4">
            <div className="bg-gray-800/60 rounded-2xl ring-1 ring-gray-700/50 p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-lg font-medium">Monthly</div>
                  <div className="text-gray-300">NOK 99 / month</div>
                </div>
                <button
                  onClick={() => startCheckout('monthly')}
                  disabled={loadingPlan !== null}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loadingPlan === 'monthly' ? 'Redirecting…' : 'Choose'}
                </button>
              </div>
            </div>

            <div className="bg-gray-800/60 rounded-2xl ring-1 ring-gray-700/50 p-6">
              <div className="flex items-baseline justify-between">
                <div>
                  <div className="text-lg font-medium">Annual</div>
                  <div className="text-gray-300">NOK 899 / year</div>
                </div>
                <button
                  onClick={() => startCheckout('annual')}
                  disabled={loadingPlan !== null}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50"
                >
                  {loadingPlan === 'annual' ? 'Redirecting…' : 'Choose'}
                </button>
              </div>
            </div>

            {isFounderEligible() && (
              <div className="bg-amber-900/50 rounded-2xl ring-1 ring-amber-700/50 p-6">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-lg font-medium">Founder Plan</div>
                    <div className="text-gray-300">Internal subscription</div>
                  </div>
                  <button
                    onClick={() => startCheckout('ulrik')}
                    disabled={loadingPlan !== null}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 disabled:opacity-50"
                  >
                    {loadingPlan === 'ulrik' ? 'Redirecting…' : 'Choose'}
                  </button>
                </div>
              </div>
            )}

            <div className="text-xs text-gray-500">Secure checkout by Stripe. Cancel anytime from your account.</div>
          </div>
        </div>
      </div>
    </div>
  );
}


