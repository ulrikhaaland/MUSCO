'use client';

import { ErrorBoundary } from '../components/ErrorBoundary';

export default function ProgramLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
} 