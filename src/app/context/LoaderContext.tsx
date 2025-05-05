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
  
  // Add timer ref to track when loader was shown
  const showTimeRef = useRef<number | null>(null);
  // Track if we're in transition
  const isTransitioning = useRef(false);

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
    // Set the show time
    showTimeRef.current = Date.now();
    
    // Update message first if provided
    if (newMessage) setMessage(newMessage);
    if (newSubmessage !== submessage) setSubmessage(newSubmessage);
    
    // Then update visibility
    setIsVisible(true);
    isTransitioning.current = false;
    
    console.log('Showing loader with message:', newMessage || message);
  };

  const hideLoader = () => {
    // If loader was just shown, add a minimum display time
    // to prevent flashing of loader for quick operations
    const currentTime = Date.now();
    const minDisplayTime = 300; // minimum ms to show loader
    
    if (showTimeRef.current && currentTime - showTimeRef.current < minDisplayTime) {
      // If we've shown the loader very briefly, keep it a bit longer
      if (isTransitioning.current) return; // Don't schedule multiple hides
      
      isTransitioning.current = true;
      console.log('Scheduling loader hide after minimum display time');
      
      setTimeout(() => {
        setIsVisible(false);
        isTransitioning.current = false;
        console.log('Loader hidden (after delay)');
      }, minDisplayTime - (currentTime - showTimeRef.current));
    } else {
      // Otherwise hide immediately
      setIsVisible(false);
      isTransitioning.current = false;
      console.log('Hiding loader');
    }
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