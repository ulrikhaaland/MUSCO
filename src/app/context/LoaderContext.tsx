'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import MuscleLoader from '../components/ui/MuscleLoader';

interface LoaderContextType {
  showLoader: (message?: string, submessage?: string) => void;
  hideLoader: () => void;
  forceHide: () => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean, message?: string, submessage?: string) => void;
}

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export const LoaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [message, setMessage] = useState('initializing muscles');
  const [submessage, setSubmessage] = useState<string | undefined>(undefined);
  const loaderRef = useRef<HTMLDivElement>(null);
  const lockRef = useRef(false);
  const initialLoadRef = useRef(true);

  // Apply initial styles to ensure animation works on first load
  useEffect(() => {
    if (initialLoadRef.current && isVisible && loaderRef.current) {
      console.log('Applying initial loader styles');
      loaderRef.current.style.display = 'block';
      loaderRef.current.style.opacity = '1';
      loaderRef.current.style.visibility = 'visible';
      
      // Add a small delay to ensure the SVG animation initializes properly
      const timer = setTimeout(() => {
        if (loaderRef.current) {
          // Force a reflow to ensure animations start
          loaderRef.current.style.display = 'none';
          void loaderRef.current.offsetHeight; // Force reflow
          loaderRef.current.style.display = 'block';
        }
        initialLoadRef.current = false;
      }, 50);
      
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

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

  const forceHide = () => {
    // Prevent recursive calls
    if (lockRef.current) return;
    
    try {
      lockRef.current = true;
      console.log('Force hiding loader');
      
      // Update state
      setIsVisible(false);
      
      // Direct DOM manipulation as backup
      if (loaderRef.current) {
        loaderRef.current.style.display = 'none';
        loaderRef.current.style.opacity = '0';
        loaderRef.current.style.visibility = 'hidden';
      }
    } finally {
      // Release lock after a short delay
      setTimeout(() => {
        lockRef.current = false;
      }, 100);
    }
  };

  const showLoader = (newMessage?: string, newSubmessage?: string) => {
    // Prevent showing if we're in a locked state
    if (lockRef.current) {
      console.log('Ignoring showLoader due to lock');
      return;
    }
    
    console.log('Showing loader with message:', newMessage);
    
    // Update message first if provided
    if (newMessage) setMessage(newMessage);
    if (submessage !== newSubmessage) setSubmessage(newSubmessage);
    
    // Then update visibility
    setIsVisible(true);
    
    // Direct DOM update as backup
    if (loaderRef.current) {
      loaderRef.current.style.display = 'block';
      loaderRef.current.style.opacity = '1';
      loaderRef.current.style.visibility = 'visible';
    }
  };

  const hideLoader = () => {
    if (lockRef.current) {
      console.log('Ignoring hideLoader due to lock');
      return;
    }
    
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
        forceHide,
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