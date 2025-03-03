'use client';

import { ReactNode } from 'react';

interface LoadingSpinnerProps {
  fullScreen?: boolean;
  size?: 'small' | 'medium' | 'large';
  withOverlay?: boolean;
  message?: string;
  submessage?: string | ReactNode;
}

export function LoadingSpinner({
  fullScreen = false,
  size = 'medium',
  withOverlay = false,
  message = 'Loading...',
  submessage
}: LoadingSpinnerProps) {
  const sizeClasses = {
    small: 'h-6 w-6 border-t-1 border-b-1',
    medium: 'h-12 w-12 border-t-2 border-b-2',
    large: 'h-16 w-16 border-t-3 border-b-3'
  };

  // Container classes vary based on fullScreen prop
  const containerClasses = fullScreen
    ? 'fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center'
    : withOverlay
    ? 'absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center'
    : 'flex items-center justify-center h-full w-full';

  return (
    <div className={containerClasses}>
      <div className="flex flex-col items-center space-y-4">
        <div className={`animate-spin rounded-full ${sizeClasses[size]} border-indigo-500`}></div>
        {message && <p className={`${fullScreen ? 'text-white text-lg' : 'text-white text-sm'} font-medium`}>{message}</p>}
        {submessage && (
          <div className={`text-center max-w-md ${fullScreen ? 'text-gray-300 text-base' : 'text-gray-400 text-xs'} mt-2`}>
            {typeof submessage === 'string' ? <p>{submessage}</p> : submessage}
          </div>
        )}
      </div>
    </div>
  );
} 