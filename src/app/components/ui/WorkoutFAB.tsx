'use client';

import React from 'react';
import { useTranslation } from '@/app/i18n/TranslationContext';

interface WorkoutFABProps {
  onClick: () => void;
  isActive?: boolean;
  progress?: number; // 0-100 for showing progress ring when active
  disabled?: boolean;
}

/**
 * Floating Action Button for starting/resuming workout sessions.
 * Animated entry on mount, pulsing glow when a session is active.
 */
export function WorkoutFAB({ 
  onClick, 
  isActive = false, 
  progress = 0,
  disabled = false 
}: WorkoutFABProps) {
  const { t } = useTranslation();

  // Progress ring calculations
  const size = 56;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - (progress / 100) * circumference;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        fixed bottom-24 right-4 md:bottom-8 md:right-8 z-50
        w-14 h-14 rounded-full
        flex items-center justify-center
        animate-scale-in
        transition-all duration-200 ease-out
        ${disabled 
          ? 'bg-gray-700 cursor-not-allowed opacity-50' 
          : isActive
            ? 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 animate-fab-glow'
            : 'bg-indigo-600 hover:bg-indigo-500 hover:scale-105 active:scale-95 shadow-lg shadow-indigo-900/30'
        }
      `}
      aria-label={isActive ? t('workout.resumeWorkout') : t('workout.startWorkout')}
    >
      {/* Progress ring when active */}
      {isActive && progress > 0 && (
        <svg
          className="absolute inset-0 -rotate-90"
          width={size}
          height={size}
        >
          {/* Background ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255, 255, 255, 0.15)"
            strokeWidth={strokeWidth}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="white"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            className="transition-all duration-500"
          />
        </svg>
      )}

      {/* Icon */}
      {isActive ? (
        // Double chevron (resume)
        <svg
          className="w-6 h-6 text-white relative z-10"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2.5}
            d="M13 5l7 7-7 7M5 5l7 7-7 7"
          />
        </svg>
      ) : (
        // Play icon
        <svg
          className="w-7 h-7 text-white ml-0.5"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      )}
    </button>
  );
}

export default WorkoutFAB;
