'use client';

import React, { ReactNode } from "react";

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
  /** @deprecated No longer used - nav bar floats over content */
  includeNavBar?: boolean;
}

/**
 * Main layout SafeArea wrapper
 * Handles safe areas for the app's main content area
 * 
 * The bottom navigation bar floats over content (fixed position).
 * Pages that need to avoid content being hidden behind the nav bar
 * should add their own bottom padding (e.g., pb-20) locally.
 * 
 * For fixed bottom elements (nav bars, FABs), use:
 * - className="pb-safe" or "bottom-safe" utilities
 * - Or add padding: calc(env(safe-area-inset-bottom) + your-spacing)
 */
export function SafeArea({ children, className = '' }: SafeAreaProps) {
  return (
    <div
      className={`
        min-h-[100dvh] flex flex-col bg-gray-900
        pt-safe px-safe pb-safe
        ${className}
      `}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  );
}

export default SafeArea;
