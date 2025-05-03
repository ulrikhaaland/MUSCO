'use client';

import localFont from 'next/font/local';
import './globals.css';
import { useEffect } from 'react';
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

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
  }, []);

  // Handle email sign-in links when opened in browser
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.href;

      // Check if this is a sign-in link
      if (isSignInWithEmailLink(auth, currentUrl)) {
        // Check if we're in a standalone PWA
        const isPwa = window.matchMedia('(display-mode: standalone)').matches;
        
        // If we're not in a PWA, try to redirect to PWA
        if (!isPwa) {
          const email = window.localStorage.getItem('emailForSignIn');
          if (email) {
            // Try to use URL scheme for a better native PWA experience
            const pwaRedirect = `${window.location.origin}/auth/shared-link?link=${encodeURIComponent(currentUrl)}`;
            
            // See if we can open the PWA app directly
            try {
              // First try to open in PWA directly
              window.location.href = pwaRedirect;
              
              // We need to keep this page open for a bit to let the user choose
              // the PWA in the prompt. After 8 seconds, we'll handle in-browser auth.
              setTimeout(() => {
                // If we're still here, continue with browser auth flow
                console.log('Continuing with in-browser auth');
              }, 8000);
            } catch (e) {
              console.log('Failed to redirect to PWA, continuing in browser');
            }
          }
        }
      }
    }
  }, []);

  return (
    <html lang="en" className="h-full bg-gray-900">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
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
      </head>
      <body className="bg-gray-900">
        <I18nWrapper>
        <LoaderProvider>
          <AuthProvider>
            <UserProvider>
              <AppProvider>
                <ToastProvider>
                  <RouteChangeListener />
                  <SafeArea className="h-full">
                    <div className="flex-1">{children}</div>
                    <NavigationMenu />
                  </SafeArea>
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
