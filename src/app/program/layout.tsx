'use client';

import { ErrorBoundary } from '../components/ErrorBoundary';
import { SelectedDayProvider } from '../context/SelectedDayContext';

export default function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <SelectedDayProvider>
        {children}
      </SelectedDayProvider>
    </ErrorBoundary>
  );
} 