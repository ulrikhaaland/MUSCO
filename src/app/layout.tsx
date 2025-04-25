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
  useEffect(() => {
    // Only initialize analytics in production and on the client side
    if (
      process.env.NODE_ENV === 'production' &&
      typeof window !== 'undefined'
    ) {
      getAnalytics(app);
    }
  }, []);

  return (
    <html lang="en" className="h-full">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
        <link rel="icon" href="/img/logo_biceps.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#111827" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Musco" />
        <link rel="apple-touch-icon" href="/img/logo_biceps.png" />
        <script src="/sw-register.js" defer></script>
      </head>
      <body>
        <I18nWrapper>
        <AuthProvider>
          <UserProvider>
            <AppProvider>
              <LoaderProvider>
              <ToastProvider>
                <RouteChangeListener />
                <SafeArea className="h-full">
                  <div className="flex-1">{children}</div>
                  <NavigationMenu />
                </SafeArea>
              </ToastProvider>
              </LoaderProvider>
            </AppProvider>
          </UserProvider>
        </AuthProvider>
        </I18nWrapper>
      </body>
    </html>
  );
}
