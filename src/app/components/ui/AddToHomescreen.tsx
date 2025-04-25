'use client';

import { useState, useEffect } from 'react';

interface AddToHomescreenProps {
  title?: string;
  message?: string;
  installButtonText?: string;
  cancelButtonText?: string;
}

export default function AddToHomescreen({
  title = 'Add to Home Screen',
  message = 'Install this app on your device for quick and easy access.',
  installButtonText = 'Install',
  cancelButtonText = 'Not Now',
}: AddToHomescreenProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);

  useEffect(() => {
    // Track whether the user has already dismissed the prompt or installed the app
    const hasPromptBeenShown = localStorage.getItem('pwaPromptDismissed');
    
    // Detect iOS devices
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    setIsIOSDevice(isIOS);
    
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

    // Check if app is already installed on PWA or standalone mode
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches 
                            || (window.navigator as any).standalone 
                            || document.referrer.includes('android-app://');

    // Only show prompt if not already in standalone mode
    if (!isInStandaloneMode) {
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      
      // For iOS, we'll show the prompt after a delay if they haven't seen it
      if (isIOS && hasPromptBeenShown !== 'true') {
        // Delay showing iOS instructions to avoid interrupting initial app experience
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 5000);
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
    
    // For iOS, just close the prompt when they click install (they'll need to follow instructions)
    if (isIOSDevice) {
      setShowPrompt(false);
    }
  };

  const handleCancelClick = () => {
    // Set flag to not show prompt again for a while
    localStorage.setItem('pwaPromptDismissed', 'true');
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 pb-safe animate-scale-in">
      <div className="mx-4 mb-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
        <div className="p-4">
          <div className="flex items-start">
            <div className="flex-1">
              <h3 className="text-lg font-medium text-white">{title}</h3>
              <p className="mt-1 text-sm text-gray-300">{message}</p>
              
              {isIOSDevice && (
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
                </div>
              )}
            </div>
          </div>
          
          <div className="mt-4 flex space-x-3 justify-end">
            <button
              onClick={handleCancelClick}
              className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
            >
              {cancelButtonText}
            </button>
            <button
              onClick={handleInstallClick}
              className="px-3 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded"
            >
              {installButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 