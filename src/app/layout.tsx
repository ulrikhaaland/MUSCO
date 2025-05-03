'use client';

import localFont from 'next/font/local';
import './globals.css';
import { useEffect, useState } from 'react';
import { getAnalytics } from 'firebase/analytics';
import { SafeArea } from './components/ui/SafeArea';
import { NavigationMenu } from './components/ui/NavigationMenu';
import { app } from './firebase/config';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { AppProvider } from './context/AppContext';
import { LoaderProvider } from './context/LoaderContext';
import { RouteChangeListener } from './components/RouteChangeListener';
import { ToastProvider } from './components/ui/ToastProvider';
import { I18nWrapper } from './i18n/setup';
import { isSignInWithEmailLink } from 'firebase/auth';
import { auth } from './firebase/config';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import the PwaViewportFix component to avoid loading it unnecessarily
const PwaViewportFix = dynamic(() => import('./components/ui/PwaViewportFix'), { 
  ssr: false 
});

// const geistSans = localFont({
//   src: "./fonts/GeistVF.woff",
//   variable: "--font-geist-sans",
//   weight: "100 900",
// });
// const geistMono = localFont({
//   src: "./fonts/GeistMonoVF.woff",
//   variable: "--font-geist-mono",
//   weight: "100 900",
// });

// PWA Safe Area Wrapper component
const PwaSafeArea = ({ 
  children, 
  isPwa 
}: { 
  children: React.ReactNode; 
  isPwa: boolean 
}) => {
  if (!isPwa) return <>{children}</>;
  
  return (
    <div className="pwa-safe-area">
      <style jsx global>{`
        .pwa-safe-area {
          /* Apply safe area insets for PWA mode */
          padding-top: env(safe-area-inset-top, 0);
          padding-bottom: env(safe-area-inset-bottom, 0);
          padding-left: env(safe-area-inset-left, 0);
          padding-right: env(safe-area-inset-right, 0);
          min-height: 100vh;
          min-height: -webkit-fill-available;
          display: flex;
          flex-direction: column;
        }
        
        /* Additional PWA mode fixes */
        @supports (-webkit-touch-callout: none) {
          body {
            /* Avoid iOS Safari viewport issues */
            height: -webkit-fill-available;
          }
          html {
            height: -webkit-fill-available;
          }
        }
      `}</style>
      {children}
    </div>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const [isPwa, setIsPwa] = useState(false);

  useEffect(() => {
    // Only initialize analytics in production and on the client side
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      getAnalytics(app);
    }
    
    // Force Android Chrome navigation bar color
    if (typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)) {
      document.documentElement.style.setProperty('--navigation-bar-color', '#111827');
      
      // Try to use Android Chrome's theme-color API if available
      const metaThemeColor = document.querySelector('meta[name=theme-color]');
      if (metaThemeColor) {
        metaThemeColor.setAttribute('content', '#111827');
      }
    }

    // Detect if we're in PWA mode on component mount
    if (typeof window !== 'undefined') {
      const detectPwa = () => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone ||
                         document.referrer.includes('android-app://');
        setIsPwa(isStandalone);
        
        // Add a body class for additional CSS targeting
        if (isStandalone) {
          document.body.classList.add('pwa-mode');
        }
      };
      
      // Initial detection
      detectPwa();
      
      // Setup listener for display mode changes
      const mediaQuery = window.matchMedia('(display-mode: standalone)');
      const handleChange = (e: MediaQueryListEvent) => {
        setIsPwa(e.matches);
        if (e.matches) {
          document.body.classList.add('pwa-mode');
        } else {
          document.body.classList.remove('pwa-mode');
        }
      };
      
      // Add listener if supported
      if (mediaQuery.addEventListener) {
        mediaQuery.addEventListener('change', handleChange);
      }
      
      return () => {
        if (mediaQuery.removeEventListener) {
          mediaQuery.removeEventListener('change', handleChange);
        }
      };
    }
  }, []);

  // Handle email sign-in links when opened in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;

      // Check if this is a sign-in link
      if (isSignInWithEmailLink(auth, currentUrl)) {
        // Get the email from localStorage
        const email = window.localStorage.getItem('emailForSignIn');
        
        // Check if we're already in the shared link handler page
        const isInSharedLinkHandler = window.location.pathname.includes('/auth/shared-link');
        
        // Don't interfere if we're already in the shared link handler
        if (isInSharedLinkHandler) {
          console.log('Already in shared link handler, not redirecting');
          return;
        }
        
        if (email) {
          try {
            // If we're in PWA, handle it internally
            if (isPwa) {
              // Let the AuthContext handle the sign-in
              console.log('In PWA mode, letting AuthContext handle sign-in');
            } 
            // If we're in browser but came from mobile, redirect to code page
            else if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
              // Create a redirect to the auth code input page with a flag to show code input
              console.log('Mobile browser detected, redirecting to code input');
              
              // Set the flag to show code input instead of email input
              window.localStorage.setItem('codeRequestTimestamp', Date.now().toString());
              
              // Redirect to login page with code input showing
              router.push('/login?showcode=true');
            }
            // Otherwise, we'll let AuthContext handle it normally in browser
          } catch (e) {
            console.error('Error handling sign-in link:', e);
            // Redirect to login page for fallback
            router.push('/login');
          }
        } else {
          // No email in localStorage, redirect to login page
          console.log('No email found in localStorage, redirecting to login');
          router.push('/login');
        }
      }
    }
  }, [router, isPwa]);

  return (
    <html lang="en" className="h-full bg-gray-900">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover, user-scalable=no"
        />
        <link rel="icon" href="/img/logo_biceps.png" />
        <link rel="manifest" href="/manifest.json" />
        {/* Primary theme color meta tags */}
        <meta name="theme-color" content="#111827" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#111827" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#111827" />
        
        {/* Android Chrome specific */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="navigation-bar-color" content="#111827" />
        
        {/* iOS specific */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Musco" />
        <link rel="apple-touch-icon" href="/img/logo_biceps.png" />
        <script src="/sw-register.js" defer></script>
        
        {/* Force Android Chrome navigation bar color */}
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              if (/Android/i.test(navigator.userAgent)) {
                document.documentElement.style.setProperty('--navigation-bar-color', '#111827');
                document.documentElement.style.backgroundColor = '#111827';
                document.body.style.backgroundColor = '#111827';
                
                // Try to set it via meta tag as a backup
                var meta = document.querySelector('meta[name="theme-color"]');
                if (meta) meta.setAttribute('content', '#111827');
              }
            })();
          `
        }} />
        
        {/* Additional CSS specifically for PWA mode */}
        {isPwa && (
          <style dangerouslySetInnerHTML={{
            __html: `
              /* PWA-specific styles */
              body {
                padding: env(safe-area-inset-top, 0) env(safe-area-inset-right, 0) env(safe-area-inset-bottom, 0) env(safe-area-inset-left, 0);
                -webkit-overflow-scrolling: touch;
              }
              
              /* Fix navigation menu positioning for PWA mode */
              .pwa-mode .navigation-menu {
                padding-bottom: env(safe-area-inset-bottom, 0);
              }
              
              /* Ensure content doesn't go under status bar */
              .pwa-safe-area > * {
                padding-top: max(env(safe-area-inset-top, 0), 20px);
              }
            `
          }} />
        )}
      </head>
      <body className="bg-gray-900">
        <I18nWrapper>
        <LoaderProvider>
          <AuthProvider>
            <UserProvider>
              <AppProvider>
                <ToastProvider>
                  <RouteChangeListener />
                  {isPwa && <PwaViewportFix />}
                  <PwaSafeArea isPwa={isPwa}>
                    <SafeArea className={`h-full ${isPwa ? 'app-container' : ''}`}>
                      <div className="flex-1">{children}</div>
                      <NavigationMenu />
                    </SafeArea>
                  </PwaSafeArea>
                </ToastProvider>
              </AppProvider>
            </UserProvider>
          </AuthProvider>
        </LoaderProvider>
        </I18nWrapper>
      </body>
    </html>
  );
}
