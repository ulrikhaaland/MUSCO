'use client';

import { Suspense } from 'react';
import SharedLinkHandlerContent from './SharedLinkHandlerContent';

export default function SharedLinkPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-900 text-white">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full text-center">
            <p>Loading...</p>
          </div>
        </div>
      }
    >
      <SharedLinkHandlerContent />
    </Suspense>
  );
}
