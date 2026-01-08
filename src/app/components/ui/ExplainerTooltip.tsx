'use client';

import { useRef, useEffect, useState, useLayoutEffect } from 'react';

interface ExplainerTooltipProps {
  title: string;
  text: string | null;
  isLoading: boolean;
  screenPosition: { x: number; y: number } | null;
  /** Max X position to constrain tooltip within model viewer area */
  maxX?: number;
  onClose?: () => void;
}

/**
 * Custom explainer tooltip that positions itself relative to a screen coordinate.
 * Matches the app's dark theme with purple accents.
 */
export function ExplainerTooltip({
  title,
  text,
  isLoading,
  screenPosition,
  maxX,
  onClose,
}: ExplainerTooltipProps) {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ top: number; left: number }>({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [arrowOnRight, setArrowOnRight] = useState(false);

  // Calculate position after render using useLayoutEffect (runs before paint)
  useLayoutEffect(() => {
    if (!screenPosition) {
      setIsVisible(false);
      return;
    }

    const padding = 16;
    const offsetX = 24;
    const offsetY = -8;
    const tooltipWidth = 280;
    const tooltipHeight = 200;
    
    // Use maxX if provided (e.g., left edge of chat panel), otherwise use viewport width
    const rightBoundary = maxX ?? window.innerWidth;

    let left = screenPosition.x + offsetX;
    let top = screenPosition.y + offsetY;
    let flipArrow = false;

    // Adjust if overflowing right boundary (model viewer edge)
    if (left + tooltipWidth + padding > rightBoundary) {
      // Position to the left of the click point instead
      left = screenPosition.x - tooltipWidth - offsetX;
      flipArrow = true;
    }

    // Adjust if overflowing bottom
    if (top + tooltipHeight + padding > window.innerHeight) {
      top = window.innerHeight - tooltipHeight - padding;
    }

    // Adjust if overflowing top
    if (top < padding) {
      top = padding;
    }

    // Adjust if overflowing left
    if (left < padding) {
      left = padding;
      flipArrow = false;
    }

    setPosition({ top, left });
    setArrowOnRight(flipArrow);
    setIsVisible(true);
  }, [screenPosition, maxX]);

  // Refine position after actual render
  useEffect(() => {
    if (!screenPosition || !tooltipRef.current || !isVisible) return;

    const tooltip = tooltipRef.current;
    const rect = tooltip.getBoundingClientRect();
    const padding = 16;
    const rightBoundary = maxX ?? window.innerWidth;

    let { top, left } = position;
    let needsUpdate = false;

    if (left + rect.width + padding > rightBoundary) {
      left = Math.max(padding, rightBoundary - rect.width - padding);
      needsUpdate = true;
    }
    if (top + rect.height + padding > window.innerHeight) {
      top = Math.max(padding, window.innerHeight - rect.height - padding);
      needsUpdate = true;
    }

    if (needsUpdate) {
      setPosition({ top, left });
    }
  }, [screenPosition, text, isVisible, position, maxX]);

  if (!screenPosition || !isVisible) return null;

  return (
    <div
      ref={tooltipRef}
      className="fixed z-[100] pointer-events-auto"
      style={{
        top: position.top,
        left: position.left,
      }}
    >
      <div className="bg-gray-900/95 backdrop-blur-md rounded-lg shadow-2xl border border-gray-700/50 w-[280px] overflow-hidden flex flex-col max-h-[60vh]">
        {/* Header */}
        <div className="px-4 py-2.5 border-b border-gray-700/50 bg-gray-800/50 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <h3 className="font-medium text-white text-sm truncate">{title}</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors p-1 -m-1 rounded hover:bg-white/10 flex-shrink-0"
                aria-label="Close"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Content - scrollable */}
        <div className="px-4 py-3 overflow-y-auto flex-1 min-h-0">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-gray-500 text-sm">...</span>
            </div>
          ) : text ? (
            <p className="text-gray-300 text-sm leading-relaxed">{text}</p>
          ) : null}
        </div>

        {/* Connector arrow - flips based on position */}
        <div
          className="absolute w-0 h-0"
          style={arrowOnRight ? {
            right: -8,
            top: 20,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderLeft: '8px solid rgba(17, 24, 39, 0.95)',
          } : {
            left: -8,
            top: 20,
            borderTop: '8px solid transparent',
            borderBottom: '8px solid transparent',
            borderRight: '8px solid rgba(17, 24, 39, 0.95)',
          }}
        />
      </div>
    </div>
  );
}

