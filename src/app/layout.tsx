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
      </head>
      <body>
        <I18nWrapper>
          <AuthProvider>
            <UserProvider>
              <AppProvider>
                <ToastProvider>
                  <RouteChangeListener />
                  <SafeArea>
                    <div className="h-full pb-16">{children}</div>
                    <NavigationMenu />
                  </SafeArea>
                </ToastProvider>
              </AppProvider>
            </UserProvider>
          </AuthProvider>
        </I18nWrapper>
      </body>
    </html>
  );
}
