'use client';

import localFont from "next/font/local";
import "./globals.css";
import { useEffect } from "react";
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { SafeArea } from './components/ui/SafeArea';

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyC8H9W_l5u0wA7dZBUJLlLnaLbx_XuCkcA",
  authDomain: "musco-dc111.firebaseapp.com",
  projectId: "musco-dc111",
  storageBucket: "musco-dc111.firebasestorage.app",
  messagingSenderId: "1084458794272",
  appId: "1:1084458794272:web:8984fac47086369adaeb45",
  measurementId: "G-LZV30VC03Y"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // Initialize Firebase on the client side
    const app = initializeApp(firebaseConfig);
    // Only initialize analytics in production and on the client side
    if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
      getAnalytics(app);
    }
  }, []);

  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans`}>
        <SafeArea>{children}</SafeArea>
      </body>
    </html>
  );
}
