'use client';

import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

export function AuthForm({ onSkip }: { onSkip: () => void }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { sendSignInLink } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await sendSignInLink(email);
      // Save the email locally to complete sign in after user clicks the link
      window.localStorage.setItem('emailForSignIn', email);
      setEmailSent(true);
    } catch (error: any) {
      setError(error.message);
      setEmailSent(false);
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="w-full max-w-md space-y-8 px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Check your email</h2>
          <p className="mt-4 text-gray-400">
            We sent a login link to <span className="text-white">{email}</span>
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Click the link in the email to sign in
          </p>
        </div>

        <div className="space-y-4">
          <button
            type="button"
            onClick={() => setEmailSent(false)}
            className="w-full px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
          >
            Use a different email
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
          >
            Continue without login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-8 px-4">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white">Welcome to Musco</h2>
        <p className="mt-2 text-sm text-gray-400">
          Enter your email to get started
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div>
          <label htmlFor="email" className="sr-only">
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Email address"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full px-6 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send login link'}
          </button>

          <button
            type="button"
            onClick={onSkip}
            className="w-full px-6 py-3 rounded-xl bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-colors duration-200"
          >
            Continue without login
          </button>
        </div>
      </form>
    </div>
  );
} 