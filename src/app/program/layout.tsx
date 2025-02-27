'use client';

import { AppProvider } from '../context/AppContext';
import { AuthProvider } from '../context/AuthContext';
import { UserProvider } from '../context/UserContext';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { RouteChangeListener } from '../components/RouteChangeListener';

export default function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <UserProvider>
          <AppProvider>
            <RouteChangeListener />
            {children}
          </AppProvider>
        </UserProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
} 