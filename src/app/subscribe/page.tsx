'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { useState } from 'react';

export default function SubscribePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loadingPlan, setLoadingPlan] = useState<'monthly' | 'annual' | null>(null);

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

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-gray-800/60 rounded-2xl ring-1 ring-gray-700/50 p-8">
        <h1 className="text-2xl font-semibold mb-2 text-center">Go Premium</h1>
        <p className="text-gray-300 text-center mb-8">Unlock weekly follow-up programs and support continued progress.</p>

        <div className="grid md:grid-cols-2 gap-4">
          <button
            onClick={() => startCheckout('monthly')}
            disabled={loadingPlan !== null}
            className={`rounded-xl p-5 bg-indigo-600 hover:bg-indigo-500 transition disabled:opacity-50`}
          >
            <div className="text-lg font-medium">Monthly</div>
            <div className="opacity-80">NOK 99 / mo</div>
            {loadingPlan === 'monthly' && <div className="text-sm mt-2 opacity-80">Redirecting…</div>}
          </button>

          <button
            onClick={() => startCheckout('annual')}
            disabled={loadingPlan !== null}
            className={`rounded-xl p-5 bg-gray-700 hover:bg-gray-600 transition disabled:opacity-50`}
          >
            <div className="text-lg font-medium">Annual</div>
            <div className="opacity-80">NOK 899 / yr</div>
            {loadingPlan === 'annual' && <div className="text-sm mt-2 opacity-80">Redirecting…</div>}
          </button>
          {user?.email && (user.email === 'ulrikhaaland2@gmail.com' || user.email === 'ulrikhaland@gmail.com') && (
            <button
              onClick={() => startCheckout('ulrik')}
              disabled={loadingPlan !== null}
              className={`rounded-xl p-5 bg-amber-700 hover:bg-amber-600 transition disabled:opacity-50 md:col-span-2`}
            >
              <div className="text-lg font-medium">Founder Plan</div>
              <div className="opacity-80">Special internal subscription</div>
              {loadingPlan === 'ulrik' && <div className="text-sm mt-2 opacity-80">Redirecting…</div>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}


