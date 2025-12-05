'use client';

import { ReactNode } from 'react';
import { NavigationMenu } from './NavigationMenu';

interface PageLayoutProps {
  children: ReactNode;
  /** Title shown in mobile nav bar */
  mobileTitle?: string;
  /** Additional classes for the content wrapper */
  className?: string;
  /** Max width constraint (default: max-w-6xl) */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
}

/**
 * Standard page layout wrapper for all nav menu pages.
 * Provides consistent spacing between nav and content.
 * 
 * Usage:
 * <PageLayout mobileTitle="My Page">
 *   <YourContent />
 * </PageLayout>
 */
export function PageLayout({
  children,
  mobileTitle,
  className = '',
  maxWidth = '6xl',
}: PageLayoutProps) {
  const maxWidthClass = maxWidth === 'full' ? 'w-full' : `max-w-${maxWidth}`;
  
  return (
    <div className="flex-1 bg-gray-900 text-white flex flex-col">
      <NavigationMenu mobileTitle={mobileTitle} />
      <div className={`flex-1 ${maxWidthClass} mx-auto w-full px-4 pt-4 ${className}`}>
        {children}
      </div>
    </div>
  );
}

export default PageLayout;

