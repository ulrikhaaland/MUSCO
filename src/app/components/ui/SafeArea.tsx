import React, { useEffect, useState } from "react";

interface SafeAreaProps {
  children: React.ReactNode;
}

export function SafeArea({ children }: SafeAreaProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);

  useEffect(() => {
    // Better detection for mobile devices
    const checkIfMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      
      setIsMobile(isMobileDevice);
      
      // Add or remove the mobile class on the html element
      if (isMobileDevice) {
        document.documentElement.classList.add('is-mobile-device');
      } else {
        document.documentElement.classList.remove('is-mobile-device');
      }
      
      // If we're on a mobile device, use a more aggressive approach to detect the safe area
      if (isMobileDevice) {
        // Initial value - use a larger default on iOS
        const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
        const defaultPadding = isIOS ? 120 : 80; // Much larger default padding
        setSafeAreaBottom(defaultPadding);
        
        // Check for Visual Viewport API support (newer browsers)
        if (window.visualViewport) {
          const resizeViewport = () => {
            // Calculate the difference between window.innerHeight and visualViewport.height
            // This difference approximates the browser UI height
            const viewportDifference = window.innerHeight - window.visualViewport.height;
            
            // Add an extra buffer (20px) to account for potential inaccuracies
            // and use at least our default padding or the calculated difference + buffer
            const bottomPadding = Math.max(
              defaultPadding,
              viewportDifference + 20
            );
            
            setSafeAreaBottom(bottomPadding);
          };
          
          // Initial calculation
          resizeViewport();
          
          // Update on resize and scroll to handle dynamic browser bars
          window.visualViewport.addEventListener('resize', resizeViewport);
          window.visualViewport.addEventListener('scroll', resizeViewport);
          
          return () => {
            window.visualViewport.removeEventListener('resize', resizeViewport);
            window.visualViewport.removeEventListener('scroll', resizeViewport);
          };
        }
      }
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Create a CSS variable to store the dynamic safe area value
  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.setProperty(
        '--safe-area-bottom',
        `${safeAreaBottom}px`
      );
    } else {
      document.documentElement.style.removeProperty('--safe-area-bottom');
    }
  }, [isMobile, safeAreaBottom]);

  return (
    <div
      className={`
        min-h-screen flex flex-col
        ${isMobile ? "pb-safe-area" : ""}
      `}
      style={{
        height: isMobile ? "100%" : "100vh", // Use 100% height instead of dvh to avoid height constraints
        minHeight: isMobile ? "100dvh" : "100vh", // Still ensure it's at least full height
        WebkitOverflowScrolling: "touch",
        // Apply safe-area-inset-bottom from env() when available, 
        // fallback to our calculated value with a larger value
        ...(isMobile ? {
          paddingBottom: `max(env(safe-area-inset-bottom, 0px) + var(--safe-area-bottom, 80px), 80px)`
        } : {})
      }}
    >
      {children}
    </div>
  );
}
