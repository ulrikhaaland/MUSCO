'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '../../../app/i18n';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import IosShareIcon from '@mui/icons-material/IosShare';

export default function AddToHomescreen() {
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
    const dismissedTimestamp = localStorage.getItem('pwaPromptDismissedTimestamp');
    const permanentlyDismissed = localStorage.getItem(
      'pwaPromptPermanentlyDismissed'
    );

    // Check if temporary dismissal has expired (1 hour = 3600000 ms)
    const temporaryDismissalExpired = !dismissedTimestamp || 
      (Date.now() - parseInt(dismissedTimestamp, 10)) > 3600000;

    console.log('LocalStorage checks:', {
      hasPromptBeenShown,
      dismissedTimestamp,
      temporaryDismissalExpired,
      permanentlyDismissed,
    });

    // If the user has permanently dismissed, don't show the prompt
    if (permanentlyDismissed === 'true') {
      console.log('Permanently dismissed, not showing prompt');
      return;
    }

    // If temporary dismissal hasn't expired, don't show the prompt
    if (hasPromptBeenShown === 'true' && !temporaryDismissalExpired) {
      console.log('Temporarily dismissed, not showing prompt yet');
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
      `beforeinstallprompt event: not received yet`
    ].join(' | ');

    setDebugInfo(debug);

    // Listen for beforeinstallprompt event (fired on supported desktop and Android browsers)
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('beforeinstallprompt event fired', e);
      // Prevent Chrome 76+ from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);

      // Update debug info to indicate the event was received
      const updatedDebug = debug.replace('not received yet', 'RECEIVED ✓');
      setDebugInfo(updatedDebug);

      // Show the prompt if it hasn't been dismissed before
      if (hasPromptBeenShown !== 'true') {
        console.log('Setting showPrompt to true from beforeinstallprompt event');
        setShowPrompt(true);
      }
    };

    let timer: NodeJS.Timeout | null = null;

    // Only show prompt if not already in standalone mode
    if (!isInStandaloneMode) {
      console.log('Adding beforeinstallprompt event listener');
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

      // For iOS Safari, we'll show the prompt after a delay if they haven't seen it
      if (isIOS && hasPromptBeenShown !== 'true') {
        console.log('Setting timer for iOS prompt');
        timer = setTimeout(() => {
          console.log('Timer fired - showing iOS prompt');
          setShowPrompt(true);
        }, 3000);
      } else if (isDesktopDevice && hasPromptBeenShown !== 'true') {
        // For desktop browsers without beforeinstallprompt support
        console.log('Setting timer for desktop prompt');
        timer = setTimeout(() => {
          console.log('Timer fired - showing desktop prompt');
          setShowPrompt(true);
        }, 3000);
      } else if (
        process.env.NODE_ENV === 'development' &&
        hasPromptBeenShown !== 'true'
      ) {
        // In development mode, always show the prompt after a short delay
        console.log('In development mode - forcing prompt to show after delay');
        timer = setTimeout(() => {
          console.log('Development timer fired - showing prompt');
          setShowPrompt(true);
        }, 3000);
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
      if (timer) {
        clearTimeout(timer);
      }
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

    // For debugging - show a message in console if the event wasn't captured
    console.log('Install button clicked but no deferredPrompt available', {
      browser: browserType,
      isDesktop,
      isIOSDevice
    });

    // For iOS Safari and Chrome, show the visual hint for the share button
    if (isIOSDevice && (isSafari || isIOSChrome)) {
      setShowShareHint(true);
      // Don't auto-hide the hint
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
    // Set timestamp to allow showing the prompt again after 1 hour
    localStorage.setItem('pwaPromptDismissed', 'true');
    localStorage.setItem('pwaPromptDismissedTimestamp', Date.now().toString());
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
    localStorage.removeItem('pwaPromptDismissedTimestamp');
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
          <ol className="list-decimal pl-5 mt-1 space-y-1">
            <li className="flex items-center">
              {t('pwa.iosChrome.steps.0')} 
              <IosShareIcon className="h-5 w-5 text-blue-400 ml-1" fontSize="small" />
            </li>
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
            <li className="flex items-center">
              {t('pwa.ios.steps.0')} 
              <IosShareIcon className="h-5 w-5 text-blue-400 ml-1" fontSize="small" />
            </li>
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
              <li>
                {t('pwa.desktop.chrome.steps.0')} 
                <span className="inline-flex items-center align-middle ml-1">
                  <BrowserUpdatedIcon className="h-5 w-5 text-blue-400" fontSize="small" />
                  <span className="ml-1 align-middle">in the address bar at the right side</span>
                </span>
              </li>
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
              <li>
                {t('pwa.desktop.edge.steps.0')}
                <span className="inline-flex items-center align-middle ml-1">
                  <BrowserUpdatedIcon className="h-5 w-5 text-blue-400" fontSize="small" />
                  <span className="ml-1 align-middle">in the address bar at the right side</span>
                </span>
              </li>
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
  const translatedTitle = t('pwa.addToHomescreen');
  const translatedMessage = t('pwa.addToHomescreenMessage');
  const translatedInstallButtonText = t('pwa.install');
  const translatedCancelButtonText = t('pwa.notNow');
  const translatedNeverShowText = t('pwa.neverShow');

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-in"
        onClick={handleCancelClick}
      />

      {/* Dialog content */}
      <div className="fixed inset-x-0 bottom-0 z-50 pb-safe animate-scale-in">
        <div className="mx-auto max-w-md sm:max-w-lg md:max-w-4xl mb-4 bg-gray-800 border border-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-1">
                <h3 className="text-lg font-medium text-white">{translatedTitle}</h3>
                <p className="mt-1 text-sm text-gray-300">{translatedMessage}</p>

                {renderInstructions()}

                {showShareHint && (isSafari || isIOSChrome) && (
                  <div className="mt-3 p-3 border border-yellow-500 bg-yellow-900/30 rounded-md text-sm text-yellow-200 flex items-center">
                    <span className="mr-2">
                      <IosShareIcon className="h-5 w-5" />
                    </span>
                    {t('pwa.ios.hint')}
                  </div>
                )}

                {process.env.NODE_ENV !== 'production' && (
                  <div className="mt-2 border-t border-gray-700 pt-2 text-xs text-gray-400">
                    <p className="font-mono break-words">Debug: {debugInfo}</p>
                    <p className="mt-1 text-amber-400">
                      {deferredPrompt ? 'Install API available ✓' : 'Install API not available ✗ (manual installation required)'}
                    </p>
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

              {/* Use Install button for all browsers including iOS Chrome */}
              <button
                onClick={handleInstallClick}
                className="px-3 py-2 text-sm font-medium bg-indigo-500 hover:bg-indigo-600 text-white rounded"
              >
                {translatedInstallButtonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
