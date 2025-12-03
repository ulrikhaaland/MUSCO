'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  /** Which side the drawer slides in from */
  side?: 'left' | 'right';
  /** Width class (tailwind), defaults to w-80 */
  width?: string;
  /** Z-index class, defaults to z-[100] */
  zIndex?: string;
  /** Content to render inside the drawer */
  children: React.ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  side = 'right',
  width = 'w-80',
  zIndex = 'z-[100]',
  children,
}: DrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null);

  // Swipe-to-close state
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState(0);

  const closeThreshold = 100; // px

  // Touch handlers for swipe-to-close
  const onTouchStart = (e: React.TouchEvent) => {
    setTouchStart(side === 'right' ? e.targetTouches[0].clientX : e.targetTouches[0].clientX);
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !dragging) return;

    const currentTouch = e.targetTouches[0].clientX;
    const diff = currentTouch - touchStart;

    // For right drawer: allow dragging to the right (positive diff)
    // For left drawer: allow dragging to the left (negative diff)
    if (side === 'right' && diff > 0) {
      setDragPosition(diff);
    } else if (side === 'left' && diff < 0) {
      setDragPosition(Math.abs(diff));
    }
  };

  const onTouchEnd = () => {
    if (!dragging) return;

    if (dragPosition > closeThreshold) {
      onClose();
    }

    setDragging(false);
    setDragPosition(0);
  };

  // Calculate transform based on drag position and side
  const getDrawerStyle = (): React.CSSProperties => {
    if (!isOpen) {
      return { transform: side === 'right' ? 'translateX(100%)' : 'translateX(-100%)' };
    }

    if (dragging && dragPosition > 0) {
      const transform = side === 'right' ? `translateX(${dragPosition}px)` : `translateX(-${dragPosition}px)`;
      return { transform };
    }

    return { transform: 'translateX(0)' };
  };

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflowY = 'hidden';

      return () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflowY = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [isOpen]);

  // Escape key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClass = side === 'right' ? 'right-0' : 'left-0';

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm ${zIndex} transition-opacity`}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        ref={drawerRef}
        className={`fixed inset-y-0 ${positionClass} ${zIndex} ${width} bg-gray-900 shadow-xl flex flex-col max-h-screen overflow-hidden ${
          !dragging ? 'transition-transform duration-300 ease-out' : ''
        }`}
        style={getDrawerStyle()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {children}
      </div>
    </>
  );
}

