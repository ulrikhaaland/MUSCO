'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Create a separate component that doesn't use any client hooks directly
function NotFoundContent() {
  return (
    <div className="fixed inset-0 bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full text-center px-4">
        <div className="mb-8">
          <h1 className="text-app-title text-white mb-4">Page Not Found</h1>
          <div className="text-gray-400 mb-8">
            The page you are looking for doesn&apos;t exist or has been moved.
          </div>
          <Link 
            href="/"
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors duration-200 inline-block"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

// Main component that wraps content with suspense
export default function NotFound() {
  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <NotFoundContent />
    </Suspense>
  );
} 