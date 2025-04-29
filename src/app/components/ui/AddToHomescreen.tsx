'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../../../app/i18n';

interface AddToHomescreenProps {
  title?: string;
  message?: string;
  installButtonText?: string;
  cancelButtonText?: string;
  neverShowText?: string;
}

export default function AddToHomescreen({
  title,
  message,
  installButtonText,
  cancelButtonText,
  neverShowText,
}: AddToHomescreenProps) {
  const { t } = useTranslation();
  
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOSDevice, setIsIOSDevice] = useState(false);
  const [isIOSChrome, setIsIOSChrome] = useState(false);
  const [isSafari, setIsSafari] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');
  const [showShareHint, setShowShareHint] = useState(false);
  const [showCopiedMessage, setShowCopiedMessage] = useState(false);

  // Desktop browser detection
  const [isDesktop, setIsDesktop] = useState(false);
  const [browserType, setBrowserType] = useState<
    'chrome' | 'edge' | 'firefox' | 'safari' | 'other'
  >('other');

  useEffect(() => {
    // Don't run on server side
    if (typeof window === 'undefined') return;

    console.log('AddToHomescreen mount effect running');

    // Track whether the user has already dismissed the prompt or installed the app
    const hasPromptBeenShown = localStorage.getItem('pwaPromptDismissed');
    const permanentlyDismissed = localStorage.getItem(
      'pwaPromptPermanentlyDismissed'
    );

    console.log('LocalStorage checks:', {
      hasPromptBeenShown,
      permanentlyDismissed,
    });

    // If the user has permanently dismissed, don't show the prompt
    if (permanentlyDismissed === 'true') {
      console.log('Permanently dismissed, not showing prompt');
      return;
    }

    // Detect browsers and platforms
    const userAgent = navigator.userAgent.toLowerCase();

    // Mobile detection
    const isIOS =
      /ipad|iphone|ipod/.test(userAgent) && !(window as any).MSStream;
    const isChromeIOS = isIOS && /crios/.test(userAgent);
    const isSafariCheck =
      isIOS &&
      /safari/.test(userAgent) &&
      !/crios|fxios|opios|mercury/i.test(userAgent);

    // Desktop detection
    const isMobile =
      /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
        userAgent
      );
    const isDesktopDevice = !isMobile && window.innerWidth > 768;

    // Browser type detection for desktop
    let detectedBrowser: 'chrome' | 'edge' | 'firefox' | 'safari' | 'other' =
      'other';
    if (isDesktopDevice) {
      if (/edg/.test(userAgent)) {
        detectedBrowser = 'edge';
      } else if (/chrome/.test(userAgent) && !/chromium|edg/.test(userAgent)) {
        detectedBrowser = 'chrome';
      } else if (/firefox/.test(userAgent)) {
        detectedBrowser = 'firefox';
      } else if (
        /safari/.test(userAgent) &&
        !/chrome|chromium|edg/.test(userAgent)
      ) {
        detectedBrowser = 'safari';
      }
    }

    // Check if already in standalone mode
    const isInStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://');

    console.log('Browser detection:', {
      isIOS,
      isChromeIOS,
      isSafariCheck,
      isDesktopDevice,
      detectedBrowser,
      isInStandaloneMode,
    });

    // Set state for UI decisions
    setIsIOSDevice(isIOS);
    setIsIOSChrome(isChromeIOS);
    setIsSafari(isSafariCheck);
    setIsStandalone(isInStandaloneMode);
    setIsDesktop(isDesktopDevice);
    setBrowserType(detectedBrowser);

    // Compile debug info
    const debug = [
      `iOS: ${isIOS}`,
      `Chrome iOS: ${isChromeIOS}`,
      `Safari: ${isSafariCheck}`,
      `Desktop: ${isDesktopDevice}`,
      `Browser: ${detectedBrowser}`,
      `Standalone: ${isInStandaloneMode}`,
      `Navigator standalone: ${(window.navigator as any).standalone}`,
      `Previously dismissed: ${hasPromptBeenShown === 'true'}`,
      `Permanently dismissed: ${permanentlyDismissed === 'true'}`,
      `User Agent: ${navigator.userAgent.slice(0, 50)}...`,
    ].join(' | ');

    setDebugInfo(debug);

    // Listen for beforeinstallprompt event (fired on supported desktop and Android browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired', e);
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);

      // Show the prompt if it hasn't been dismissed before
      if (hasPromptBeenShown !== 'true') {
        console.log('Setting showPrompt to true from beforeinstallprompt event');
        setShowPrompt(true);
      }
    };

    // Only show prompt if not already in standalone mode
    if (!isInStandaloneMode) {
      console.log('Adding beforeinstallprompt event listener');
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // For iOS Safari, we'll show the prompt after a delay if they haven't seen it
      if (isIOS && hasPromptBeenShown !== 'true') {
        // Delay showing iOS instructions to avoid interrupting initial app experience
        console.log('Setting timer for iOS prompt');
        const timer = setTimeout(() => {
          console.log('Timer fired - showing iOS prompt');
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }

      // For desktop browsers that don't support beforeinstallprompt, show manual instructions
      if (isDesktopDevice && hasPromptBeenShown !== 'true') {
        // Wait a moment before showing to avoid interrupting initial page load
        console.log('Setting timer for desktop prompt');
        const timer = setTimeout(() => {
          console.log('Timer fired - showing desktop prompt');
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }

      // For development mode, show prompt regardless of events
      if (process.env.NODE_ENV === 'development' && hasPromptBeenShown !== 'true') {
        console.log('In development mode - forcing prompt to show after delay');
        const timer = setTimeout(() => {
          console.log('Development timer fired - showing prompt');
          setShowPrompt(true);
        }, 3000);
        return () => clearTimeout(timer);
      }
    } else {
      console.log('App is in standalone mode, not showing prompt');
    }

    return () => {
      console.log('Removing beforeinstallprompt event listener');
      window.removeEventListener(
        'beforeinstallprompt',
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleInstallClick = async () => {
    // For browsers that support beforeinstallprompt (Chrome, Edge, Android)
    if (deferredPrompt) {
      // Show the install prompt
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

      return;
    }

    // For iOS Safari, show the visual hint for the share button
    if (isIOSDevice && isSafari) {
      setShowShareHint(true);
      // Hide after 5 seconds
      setTimeout(() => {
        setShowShareHint(false);
      }, 5000);
      return;
    }

    // For desktop browsers without beforeinstallprompt support
    if (isDesktop) {
      // The install button serves as a hint that shows instructions
      // We'll keep prompt visible to allow users to follow the steps
      return;
    }
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

  const copyToClipboard = async () => {
    // Create url based on current location
    const url = window.location.origin;

    try {
      await navigator.clipboard.writeText(url);
      setShowCopiedMessage(true);
      setTimeout(() => setShowCopiedMessage(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
        setShowCopiedMessage(true);
        setTimeout(() => setShowCopiedMessage(false), 2000);
      } catch (err) {
        console.error('Fallback: Could not copy text: ', err);
        alert(`Please copy this URL manually: ${url}`);
      }

      document.body.removeChild(textArea);
    }
  };

  const openInSafari = () => {
    // iOS doesn't allow direct navigation between browsers
    // Instead, we'll copy the URL and show instructions
    copyToClipboard();
  };

  // Render appropriate instructions based on browser detection
  const renderInstructions = () => {
    // iOS Chrome instructions
    if (isIOSChrome) {
      return (
        <div className="mt-2 text-sm text-gray-300">
          <p>
            {t('pwa.iosChrome.title')}
          </p>
          <p className="mt-1">
            {t('pwa.iosChrome.subtitle')}
          </p>
          {showCopiedMessage && (
            <div className="mt-2 p-2 bg-indigo-500/20 text-indigo-200 text-sm rounded-md">
              {t('pwa.urlCopied')}
            </div>
          )}
          <ol className="list-decimal pl-5 mt-2 space-y-1">
            <li>{t('pwa.iosChrome.steps.0')}</li>
            <li>{t('pwa.iosChrome.steps.1')}</li>
            <li>{t('pwa.iosChrome.steps.2')}</li>
            <li>{t('pwa.iosChrome.steps.3')}</li>
          </ol>
        </div>
      );
    }

    // iOS Safari instructions
    if (isIOSDevice) {
      return (
        <div className="mt-2 text-sm text-gray-300">
          <p>{t('pwa.ios.title')}</p>
          <ol className="list-decimal pl-5 mt-1 space-y-1">
            <li>{t('pwa.ios.steps.0')}</li>
            <li>{t('pwa.ios.steps.1')}</li>
            <li>{t('pwa.ios.steps.2')}</li>
          </ol>
          <p className="mt-2 text-xs text-gray-400">
            {isSafari ? t('pwa.ios.safari') : t('pwa.ios.other')}
          </p>
        </div>
      );
    }

    // Desktop instructions based on browser
    if (isDesktop) {
      // Chrome desktop
      if (browserType === 'chrome') {
        return (
          <div className="mt-2 text-sm text-gray-300">
            <p>{t('pwa.desktop.chrome.title')}</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>{t('pwa.desktop.chrome.steps.0')}</li>
              <li>{t('pwa.desktop.chrome.steps.1')}</li>
              <li>{t('pwa.desktop.chrome.steps.2')}</li>
            </ol>
          </div>
        );
      }

      // Edge desktop
      if (browserType === 'edge') {
        return (
          <div className="mt-2 text-sm text-gray-300">
            <p>{t('pwa.desktop.edge.title')}</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>{t('pwa.desktop.edge.steps.0')}</li>
              <li>{t('pwa.desktop.edge.steps.1')}</li>
              <li>{t('pwa.desktop.edge.steps.2')}</li>
              <li>{t('pwa.desktop.edge.steps.3')}</li>
            </ol>
          </div>
        );
      }

      // Firefox desktop (limited PWA support)
      if (browserType === 'firefox') {
        return (
          <div className="mt-2 text-sm text-gray-300">
            <p>{t('pwa.desktop.firefox.title')}</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>{t('pwa.desktop.firefox.steps.0')}</li>
              <li>{t('pwa.desktop.firefox.steps.1')}</li>
              <li>{t('pwa.desktop.firefox.steps.2')}</li>
            </ol>
          </div>
        );
      }

      // Safari macOS (limited PWA support)
      if (browserType === 'safari') {
        return (
          <div className="mt-2 text-sm text-gray-300">
            <p>{t('pwa.desktop.safari.title')}</p>
            <ol className="list-decimal pl-5 mt-1 space-y-1">
              <li>{t('pwa.desktop.safari.steps.0')}</li>
              <li>{t('pwa.desktop.safari.steps.1')}</li>
              <li>{t('pwa.desktop.safari.steps.2')}</li>
            </ol>
          </div>
        );
      }

      // Default/other desktop browsers
      return (
        <div className="mt-2 text-sm text-gray-300">
          <p>{t('pwa.desktop.other.title')}</p>
          <ol className="list-decimal pl-5 mt-1 space-y-1">
            <li>{t('pwa.desktop.other.steps.0')}</li>
            <li>{t('pwa.desktop.other.steps.1')}</li>
            <li>{t('pwa.desktop.other.steps.2')}</li>
          </ol>
          <p className="mt-2 text-xs text-gray-400">
            {t('pwa.desktop.other.note')}
          </p>
        </div>
      );
    }

    // Default case (should not reach here normally)
    return (
      <div className="mt-2 text-sm text-gray-300">
        <p>{t('pwa.default.title')}</p>
        <p>{t('pwa.default.message')}</p>
      </div>
    );
  };

  // Use translation or fallback to props
  const translatedTitle = title || t('pwa.addToHomescreen');
  const translatedMessage = message || t('pwa.addToHomescreenMessage');
  const translatedInstallButtonText = installButtonText || t('pwa.install');
  const translatedCancelButtonText = cancelButtonText || t('pwa.notNow');
  const translatedNeverShowText = neverShowText || t('pwa.neverShow');

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleCancelClick}
      />

      {/* Dialog content */}
      <div className="fixed inset-x-0 bottom-0 z-50 pb-safe animate-scale-in">
        <div className="mx-4 mb-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white">{translatedTitle}</h3>
                <p className="mt-1 text-sm text-gray-300">{translatedMessage}</p>

                {renderInstructions()}

                {showShareHint && isSafari && (
                  <div className="mt-3 p-3 border border-yellow-500 bg-yellow-900/30 rounded-md text-sm text-yellow-200 flex items-center">
                    <span className="mr-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z" />
                      </svg>
                    </span>
                    {t('pwa.ios.hint')}
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
                {translatedNeverShowText}
              </button>
              <button
                onClick={handleCancelClick}
                className="px-3 py-2 text-sm font-medium text-gray-300 hover:text-white"
              >
                {translatedCancelButtonText}
              </button>

              {isIOSChrome ? (
                <button
                  onClick={openInSafari}
                  className="px-3 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded"
                >
                  {t('pwa.copyUrl')}
                </button>
              ) : (
                <button
                  onClick={handleInstallClick}
                  className="px-3 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded"
                >
                  {translatedInstallButtonText}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
