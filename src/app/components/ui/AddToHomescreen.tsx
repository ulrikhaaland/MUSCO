'use client';

import { useState, useEffect } from 'react';

interface AddToHomescreenProps {
  title?: string;
  message?: string;
  installButtonText?: string;
  cancelButtonText?: string;
  neverShowText?: string;
}

export default function AddToHomescreen({
  title = 'Add to Home Screen',
  message = 'Install this app on your device for quick and easy access.',
  installButtonText = 'Install',
  cancelButtonText = 'Not Now',
  neverShowText = 'Never Show Again',
}: AddToHomescreenProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isIOSChrome, setIsIOSChrome] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showShareHint, setShowShareHint] = useState(false);

  useEffect(() => {
    // Don't run on server side
    if (typeof window === 'undefined') return;
    
    // Track whether the user has already dismissed the prompt or installed the app
    const hasPromptBeenShown = localStorage.getItem('pwaPromptDismissed');
    const permanentlyDismissed = localStorage.getItem('pwaPromptPermanentlyDismissed');
    
    // If the user has permanently dismissed, don't show the prompt
    if (permanentlyDismissed === 'true') {
      return;
    }
    
    // Detect browsers and platforms
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    const isChromeIOS = isIOS && /CriOS/.test(navigator.userAgent);
    const isSafariCheck = isIOS && /Safari/.test(navigator.userAgent) && !/CriOS|FxiOS|OPiOS|mercury/i.test(navigator.userAgent);

    // Check if already in standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
                            || (window.navigator as any).standalone === true
                            || document.referrer.includes('android-app://');
    
    // Set state for UI decisions
    setIsIOSDevice(isIOS);
    setIsIOSChrome(isChromeIOS);
    setIsSafari(isSafariCheck);
    setIsStandalone(isInStandaloneMode);
    
    // Compile debug info
    const debug = [
      `iOS: ${isIOS}`,
      `Chrome iOS: ${isChromeIOS}`,
      `Safari: ${isSafariCheck}`,
      `Standalone: ${isInStandaloneMode}`,
      `Navigator standalone: ${(window.navigator as any).standalone}`,
      `Previously dismissed: ${hasPromptBeenShown === 'true'}`,
      `Permanently dismissed: ${permanentlyDismissed === 'true'}`,
      `User Agent: ${navigator.userAgent.slice(0, 50)}...`
    ].join(' | ');
    
    setDebugInfo(debug);
    
    // Listen for beforeinstallprompt event (fired on non-iOS devices)
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      
      // Show the prompt if it hasn't been dismissed before
      if (hasPromptBeenShown !== 'true') {
        setShowPrompt(true);
      }
    };

    // Only show prompt if not already in standalone mode
    if (!isInStandaloneMode) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // For iOS Safari, we'll show the prompt after a delay if they haven't seen it
      if (isIOS && hasPromptBeenShown !== 'true') {
        // Delay showing iOS instructions to avoid interrupting initial app experience
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!isIOSDevice && deferredPrompt) {
      // Show the install prompt for non-iOS devices
      deferredPrompt.prompt();
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      
      // Clear the deferred prompt variable
      setDeferredPrompt(null);
      
      // Hide our custom prompt
      setShowPrompt(false);
      
      // If they accepted, no need to show again
      if (outcome === 'accepted') {
        localStorage.setItem('pwaPromptDismissed', 'true');
      }
    }
    
    // For iOS Safari, show the visual hint for the share button
    if (isIOSDevice && isSafari) {
      setShowShareHint(true);
      // Hide after 5 seconds
      setTimeout(() => {
        setShowShareHint(false);
      }, 5000);
    }
    
    // For iOS Chrome, we'll handle this differently - button will say "Open in Safari" (see below)
  };

  const handleCancelClick = () => {
    // Set flag to not show prompt again for a while
    localStorage.setItem('pwaPromptDismissed', 'true');
    setShowPrompt(false);
    setShowShareHint(false);
  };

  const handleNeverShowClick = () => {
    // Set flag to never show the prompt again
    localStorage.setItem('pwaPromptPermanentlyDismissed', 'true');
    setShowPrompt(false);
    setShowShareHint(false);
  };

  // Reset the dismissed prompt status to test again
  const handleReset = () => {
    localStorage.removeItem('pwaPromptDismissed');
    localStorage.removeItem('pwaPromptPermanentlyDismissed');
    setShowPrompt(true);
  };

  if (!showPrompt || isStandalone) return null;

  const openInSafari = () => {
    // Get the current URL
    const currentUrl = window.location.href;
    
    try {
      // This approach works better on iOS Chrome to ensure it actually opens Safari
      // We use a small trick: redirect to a special URL schema that iOS will always open in Safari
      window.location.href = `googlechrome://navigate?url=${encodeURIComponent(currentUrl)}`;
      
      // After a short delay, redirect to the URL directly which will open in Safari
      // if the custom schema didn't work
      setTimeout(() => {
        window.location.href = currentUrl;
      }, 500);
    } catch (e) {
      // Fallback if that doesn't work
      console.error('Failed to open in Safari', e);
      
      // Direct user to copy the URL
      alert('Please open this website in Safari to add it to your home screen:\n\n' +
            `1. Copy this URL: ${window.location.hostname}\n` +
            '2. Open Safari\n' +
            '3. Paste the URL and visit the site\n' +
            '4. Use the Share button and select "Add to Home Screen"');
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-safe animate-scale-in">
      <div className="mx-4 mb-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{title}</h3>
              <p className="mt-1 text-sm text-gray-300">{message}</p>
              
              {isIOSChrome ? (
                <div className="mt-2 text-sm text-gray-300">
                  <p>Chrome on iOS doesn&apos;t support adding to homescreen directly.</p>
                  <p className="mt-1">Please open this site in Safari instead to install:</p>
                </div>
              ) : isIOSDevice && (
                <div className="mt-2 text-sm text-gray-300">
                  <p>To install:</p>
                  <ol className="list-decimal pl-5 mt-1 space-y-1">
                    <li>Tap the share icon <span className="inline-block w-5">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M13 4.5a2.5 2.5 0 1 1 .621 1.651L8.496 8.962a2.5 2.5 0 0 1 0 2.076l5.125 2.812a2.5 2.5 0 1 1-.75 1.372l-5.125-2.813a2.5 2.5 0 1 1 0-4.82l5.125-2.812A2.499 2.499 0 0 1 13 4.5Z" />
                      </svg>
                    </span></li>
                    <li>Scroll down and tap &quot;Add to Home Screen&quot;</li>
                    <li>Tap &quot;Add&quot; to confirm</li>
                  </ol>
                  <p className="mt-2 text-xs text-gray-400">
                    {isSafari ? 
                      "You're using Safari, so you can follow these steps to install." :
                      "Note: This works best in Safari browser."}
                  </p>
                </div>
              )}
              
              {showShareHint && isSafari && (
                <div className="mt-3 p-3 border border-yellow-500 bg-yellow-900/30 rounded-md text-sm text-yellow-200 flex items-center">
                  <span className="mr-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                    </svg>
                  </span>
                  Look for the Share button in your browser toolbar ↑ and select &quot;Add to Home Screen&quot;
                </div>
              )}
              
              {process.env.NODE_ENV !== 'production' && (
                <div className="mt-2 border-t border-gray-700 pt-2 text-xs text-gray-400">
                  <p className="font-mono break-words">Debug: {debugInfo}</p>
                  <button 
                    onClick={handleReset} 
                    className="mt-1 text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Reset prompt status
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex flex-wrap gap-2 justify-end">
            <button
              onClick={handleNeverShowClick}
              className="px-3 py-2 text-sm font-medium text-gray-400 hover:text-gray-200"
            >
              {neverShowText}
            </button>
            <button
              onClick={handleCancelClick}
              className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              {cancelButtonText}
            </button>
            
            {isIOSChrome ? (
              <button
                onClick={openInSafari}
                className="px-3 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded"
              >
                Open in Safari
              </button>
            ) : (
              <button
                onClick={handleInstallClick}
                className="px-3 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded"
              >
                {installButtonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 