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

          // Attempt to sign in
          await signInWithEmailLink(auth, email, url);

          // Clean up localStorage
          window.localStorage.removeItem('emailForSignIn');
          window.localStorage.removeItem('hasPendingQuestionnaire');

          // Redirect to home page
          router.push('/');
        } else {
          setError('Invalid sign-in link.');
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
        <div className="bg-red-900/30 border border-red-500 rounded-lg p-4 max-w-md w-full text-center">
          <p className="text-red-300">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 px-4 py-2 bg-indigo-600 rounded-md text-white hover:bg-indigo-700 transition-colors"
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