import React, { useEffect, useState } from "react";

interface SafeAreaProps {
  children: React.ReactNode;
}

export function SafeArea({ children }: SafeAreaProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);
  const [isiOS, setIsiOS] = useState(false);

  useEffect(() => {
    // Enhanced mobile detection
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
      
      // Check specifically for iOS devices
      const isIOSDevice = /iPhone|iPad|iPod/i.test(userAgent);
      setIsiOS(isIOSDevice);
      
      setIsMobile(isMobileDevice);
      
      // Add or remove the mobile class on the html element
      if (isMobileDevice) {
        document.documentElement.classList.add('is-mobile-device');
        // Add iOS-specific class if needed
        if (isIOSDevice) {
          document.documentElement.classList.add('is-ios-device');
        } else {
          document.documentElement.classList.remove('is-ios-device');
        }
      } else {
        document.documentElement.classList.remove('is-mobile-device');
        document.documentElement.classList.remove('is-ios-device');
      }
      
      // If we're on a mobile device, try to measure the viewport discrepancies
      if (isMobileDevice) {
        // Check for Visual Viewport API support (newer browsers)
        if (window.visualViewport) {
          const resizeViewport = () => {
            // Calculate the difference between window.innerHeight and visualViewport.height
            // This difference approximates the browser UI height
            const viewportDifference = window.innerHeight - window.visualViewport.height;
            // Use at most 2rem (32px) for the navigation bar or the calculated difference
            const bottomPadding = Math.min(viewportDifference, 32);
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
      
      // For iOS Safari, we need to handle special cases with viewport height
      if (isiOS) {
        // Force a small scroll to ensure the browser UI is taken into account
        setTimeout(() => {
          // Scroll just 1px to encourage the browser to recalculate heights
          window.scrollTo(0, 1);
        }, 100); // Reduced timeout
      }
    } else {
      document.documentElement.style.removeProperty('--safe-area-bottom');
    }
  }, [isMobile, safeAreaBottom, isiOS]);

  return (
    <div
      className={`
        min-h-screen flex flex-col
        ${isMobile ? "safe-area-container" : ""}
      `}
      style={{
        height: isMobile ? "calc(100dvh)" : "100vh", // Use dynamic viewport height unit
        WebkitOverflowScrolling: "touch",
        // Different handling for iOS vs Android
        ...(isMobile && isiOS
          ? {
              // iOS needs special handling
              paddingBottom: `calc(env(safe-area-inset-bottom, 0px) + max(1rem, var(--safe-area-bottom, 1rem)))`,
            }
          : isMobile
          ? {
              // Android needs a different approach
              marginBottom: `max(1rem, var(--safe-area-bottom, 1rem))`,
            }
          : {})
      }}
    >
      {children}
    </div>
  );
}
