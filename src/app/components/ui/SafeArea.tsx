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
      
      // If we're on a mobile device, try to measure the viewport discrepancies
      if (isMobileDevice) {
        // Check for Visual Viewport API support (newer browsers)
        if (window.visualViewport) {
          const resizeViewport = () => {
            // Calculate the difference between window.innerHeight and visualViewport.height
            // This difference approximates the browser UI height
            const viewportDifference = window.innerHeight - window.visualViewport.height;
            // Use at least 4rem (64px) for the navigation bar or the calculated difference
            const bottomPadding = Math.max(viewportDifference, 64);
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
        height: isMobile ? "calc(100dvh)" : "100vh", // Use dynamic viewport height unit
        WebkitOverflowScrolling: "touch",
        // Apply safe-area-inset-bottom from env() when available, 
        // fallback to our calculated value
        ...(isMobile ? {
          paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + max(4rem, var(--safe-area-bottom, 4rem)))`
        } : {})
      }}
    >
      {children}
    </div>
  );
}
