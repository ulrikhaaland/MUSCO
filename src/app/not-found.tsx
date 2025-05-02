'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useLoader } from './context/LoaderContext';
import { useSearchParams } from 'next/navigation';

// Create a separate component that doesn't use any client hooks directly
function NotFoundContent() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { setIsLoading } = useLoader();
  
  useEffect(() => {
    // Check for error message in URL parameters
    const error = searchParams?.get('error');
    if (error) {
      try {
        // Try to decode the error if it's URI encoded
        setErrorMessage(decodeURIComponent(error));
      } catch {
        setErrorMessage(error);
      }
    }
    
    // Hide loader once content is ready
    setIsLoading(false);
  }, [searchParams, setIsLoading]);

  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          {errorMessage ? (
            <>
              <h1 className="text-app-title text-white mb-4">Authentication Error</h1>
              <div className="text-red-400 mb-8">
                {errorMessage}
              </div>
            </>
          ) : (
            <>
              <h1 className="text-app-title text-white mb-4">Page Not Found</h1>
              <div className="text-gray-400 mb-8">
                The page you are looking for doesn&apos;t exist or has been moved.
              </div>
            </>
          )}
          <Link 
            href={errorMessage ? "/signin" : "/"}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-200 inline-block"
          >
            {errorMessage ? 'Back to Sign In' : 'Back to Home'}
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps content with suspense
export default function NotFound() {
  const { setIsLoading } = useLoader();
  
  useEffect(() => {
    // Show loader while content is loading
    setIsLoading(true, 'Loading');
  }, [setIsLoading]);
  
  return (
    <Suspense fallback={null}>
      <NotFoundContent />
    </Suspense>
  );
} 