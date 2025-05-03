'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import MuscleLoader from '../components/ui/MuscleLoader';

interface LoaderContextType {
  showLoader: (message?: string, submessage?: string) => void;
  hideLoader: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean, message?: string, submessage?: string) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [message, setMessage] = useState('initializing muscles');
  const [submessage, setSubmessage] = useState<string | undefined>(undefined);
  const loaderRef = useRef<HTMLDivElement>(null);

  // Prevent body scrolling when loader is visible
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
      console.log('Loader shown:', message);
    } else {
      document.body.style.overflow = '';
      console.log('Loader hidden');
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isVisible, message]);

  const showLoader = (newMessage?: string, newSubmessage?: string) => {
    // Check if the loader is already visible with the same message and submessage
    if (isVisible && newMessage === message && newSubmessage === submessage) {
      return; // Skip update if already showing the same message
    }
    
    console.log('Showing loader with message:', newMessage);
    
    // Update message first if provided
    if (newMessage) setMessage(newMessage);
    if (newSubmessage !== submessage) setSubmessage(newSubmessage);
    
    // Then update visibility
    setIsVisible(true);
  };

  const hideLoader = () => {
    console.log('Hiding loader');
    setIsVisible(false);
  };

  const setIsLoading = (loading: boolean, newMessage?: string, newSubmessage?: string) => {
    if (loading) {
      showLoader(newMessage, newSubmessage);
    } else {
      hideLoader();
    }
  };

  return (
    <LoaderContext.Provider
      value={{
        showLoader,
        hideLoader,
        isLoading: isVisible,
        setIsLoading,
      }}
    >
      <div
        ref={loaderRef}
        className="loader-container fixed inset-0 z-50 transition-opacity duration-300"
        style={{ 
          display: isVisible ? 'block' : 'none',
          opacity: isVisible ? 1 : 0,
          visibility: isVisible ? 'visible' : 'hidden',
          transition: 'opacity 0.3s ease, visibility 0.3s ease',
        }}
        data-testid="global-loader"
      >
        <MuscleLoader fullScreen message={message} submessage={submessage} />
      </div>
      {children}
    </LoaderContext.Provider>
  );
};

export const useLoader = (): LoaderContextType => {
  const context = useContext(LoaderContext);
  if (context === undefined) {
    throw new Error('useLoader must be used within a LoaderProvider');
  }
  return context;
}; 