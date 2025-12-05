'use client';

import React, { ReactNode } from "react";

interface SafeAreaProps {
  children: ReactNode;
  className?: string;
  /** Include bottom navigation bar height in padding (default: true for mobile) */
  includeNavBar?: boolean;
}

/**
 * Main layout SafeArea wrapper
 * Handles safe areas for the app's main content area
 * 
 * For fixed bottom elements (nav bars, FABs), use:
 * - className="pb-safe" or "bottom-safe" utilities
 * - Or add padding: calc(env(safe-area-inset-bottom) + your-spacing)
 */
export function SafeArea({ children, className = '', includeNavBar = true }: SafeAreaProps) {
  return (
    <div
      className={`
        min-h-screen flex flex-col bg-gray-900
        pt-safe px-safe
        ${includeNavBar ? 'pb-[calc(env(safe-area-inset-bottom,0px)+4rem)]' : 'pb-safe'}
        ${className}
      `}
      style={{ WebkitOverflowScrolling: 'touch' }}
    >
      {children}
    </div>
  );
}

export default SafeArea;
