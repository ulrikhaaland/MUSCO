'use client';

import { ReactNode } from 'react';
import { Toaster, toast } from 'react-hot-toast';

// Create a simple interface for the component props
interface ToastProviderProps {
  children: ReactNode;
}

// Create a simple toast provider component
export function ToastProvider({ children }: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          // Default options for all toasts
          duration: 5000,
          style: {
            background: '#333',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#2e7d32',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#d32f2f',
            },
          },
        }}
      />
    </>
  );
}

// Export toast functions directly for easier imports
export { toast }; 