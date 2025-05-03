'use client';

import { useEffect } from 'react';

/**
 * PwaViewportFix - Fixes viewport height issues in PWA mode
 * 
 * This component addresses the 100vh issue on mobile browsers, particularly in PWA mode,
 * where the viewport height can change when the address bar is shown/hidden, or when
 * the device orientation changes.
 */
export function PwaViewportFix() {
  useEffect(() => {
    // Function to handle viewport height adjustment
    const setViewportHeight = () => {
      // Get the window's inner height
      const vh = window.innerHeight * 0.01;
      
      // Set the --vh custom property to the root of the document
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Initial call
    setViewportHeight();

    // Set up listener for resize events
    window.addEventListener('resize', setViewportHeight);
    
    // Set up listener for orientation changes
    window.addEventListener('orientationchange', () => {
      // Add a small delay to allow the browser to complete the resize
      setTimeout(setViewportHeight, 100);
    });

    // Additional fixes for iOS devices
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) {
      // iOS specific adjustments
      document.documentElement.style.setProperty('--safe-area-inset-bottom', 'env(safe-area-inset-bottom)');
      
      // Fix for iOS PWA bounce effect
      document.body.style.overscrollBehaviorY = 'none';
    }

    return () => {
      window.removeEventListener('resize', setViewportHeight);
      window.removeEventListener('orientationchange', setViewportHeight);
    };
  }, []);

  // Add a global style to use the custom property
  return (
    <style jsx global>{`
      /* Use the custom property to set heights */
      :root {
        --app-height: 100%;
      }
      
      /* Apply the viewport height fix */
      html, body {
        height: 100vh;
        height: calc(var(--vh, 1vh) * 100);
      }
      
      /* Fix for PWA safe areas */
      .app-container {
        min-height: 100vh;
        min-height: calc(var(--vh, 1vh) * 100);
        padding-bottom: var(--safe-area-inset-bottom, 0);
      }
    `}</style>
  );
}

export default PwaViewportFix; 