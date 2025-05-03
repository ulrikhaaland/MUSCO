'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { auth } from '@/app/firebase/config';
import { useLoader } from '@/app/context/LoaderContext';

export default function SharedLinkHandlerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsLoading } = useLoader();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleSharedLink = async () => {
      setIsLoading(true, 'Processing sign-in link...');

      try {
        // Extract the link from search params
        const url = searchParams.get('link');

        if (!url) {
          setError('No link was shared.');
          setIsLoading(false);
          return;
        }

        // Check if this is a valid sign-in link
        if (isSignInWithEmailLink(auth, url)) {
          // Get the email from localStorage
          const email = window.localStorage.getItem('emailForSignIn');

          // If no email in storage, we can't proceed
          if (!email) {
            setError(
              'Please use the original device where you requested the sign-in link.'
            );
            setIsLoading(false);
            return;
          }

          try {
            // Attempt to sign in
            await signInWithEmailLink(auth, email, url);

            // Clean up localStorage
            window.localStorage.removeItem('emailForSignIn');
            window.localStorage.removeItem('hasPendingQuestionnaire');

            // Redirect to home page
            router.push('/');
          } catch (authError: any) {
            console.error('Error signing in with email link:', authError);
            
            // Handle specific Firebase error codes
            if (authError?.code === 'auth/invalid-action-code') {
              setError(
                'This sign-in link has expired or has already been used. Please request a new sign-in link.'
              );
            } else {
              setError(`Authentication error: ${authError?.message || 'Unknown error'}`);
            }
          }
        } else {
          setError('Invalid sign-in link. Please request a new link.');
        }
      } catch (err) {
        console.error('Error processing shared link:', err);
        setError('Failed to process sign-in link. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    handleSharedLink();
  }, [searchParams, router, setIsLoading]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
      {error ? (
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-6 max-w-md w-full text-center">
          <h2 className="text-xl font-bold text-white mb-3">Authentication Error</h2>
          <p className="text-red-300 mb-4">{error}</p>
          <p className="text-gray-300 mb-6 text-sm">
            Magic links expire after 1 hour or once they&apos;ve been used.
            If you&apos;re using a PWA, try using the verification code that was sent in your email.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-6 py-3 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-colors w-full"
          >
            Back to Login
          </button>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
          <p>Processing your sign-in link...</p>
        </div>
      )}
    </div>
  );
} 