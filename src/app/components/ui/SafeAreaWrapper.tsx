'use client';

import React, { ReactNode } from 'react';

interface SafeAreaWrapperProps {
  children: ReactNode;
  className?: string;
  /** Apply safe area to specific edges. Default: all edges */
  edges?: {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
  };
  /** Minimum padding to apply even when no safe area is needed */
  minPadding?: {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
  };
}

/**
 * Universal SafeArea wrapper that handles:
 * - iOS notches and home indicator
 * - Android navigation bar and camera cutouts
 * - Curved phone edges
 * - Works in both browser and PWA mode
 * 
 * Usage:
 * <SafeAreaWrapper edges={{ top: true, bottom: true }}>
 *   <YourContent />
 * </SafeAreaWrapper>
 */
export function SafeAreaWrapper({ 
  children, 
  className = '',
  edges = { top: true, right: true, bottom: true, left: true },
  minPadding = {}
}: SafeAreaWrapperProps) {
  const style: React.CSSProperties = {};
  
  if (edges.top) {
    style.paddingTop = minPadding.top 
      ? `max(${minPadding.top}, env(safe-area-inset-top, 0px))`
      : 'env(safe-area-inset-top, 0px)';
  }
  
  if (edges.right) {
    style.paddingRight = minPadding.right
      ? `max(${minPadding.right}, env(safe-area-inset-right, 0px))`
      : 'env(safe-area-inset-right, 0px)';
  }
  
  if (edges.bottom) {
    style.paddingBottom = minPadding.bottom
      ? `max(${minPadding.bottom}, env(safe-area-inset-bottom, 0px))`
      : 'env(safe-area-inset-bottom, 0px)';
  }
  
  if (edges.left) {
    style.paddingLeft = minPadding.left
      ? `max(${minPadding.left}, env(safe-area-inset-left, 0px))`
      : 'env(safe-area-inset-left, 0px)';
  }
  
  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
}

/**
 * Hook to get safe area inset values for custom usage
 */
export function useSafeAreaInsets() {
  // These CSS variables are defined in globals.css
  return {
    top: 'env(safe-area-inset-top, 0px)',
    right: 'env(safe-area-inset-right, 0px)',
    bottom: 'env(safe-area-inset-bottom, 0px)',
    left: 'env(safe-area-inset-left, 0px)',
  };
}

export default SafeAreaWrapper;

