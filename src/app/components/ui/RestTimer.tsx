'use client';

import React, { useState, useEffect } from 'react';
import { useTranslation } from '@/app/i18n/TranslationContext';

interface RestTimerProps {
  /** End time for the rest period */
  endTime: Date;
  /** Total rest duration in seconds (for progress calculation) */
  totalSeconds: number;
  /** Called when user skips rest */
  onSkip: () => void;
  /** Called when user wants to add more time */
  onExtend?: (seconds: number) => void;
}

/**
 * Inline rest timer overlay with circular countdown.
 * Renders inside the exercise card area rather than taking over the full screen.
 */
export function RestTimer({ 
  endTime, 
  totalSeconds, 
  onSkip,
  onExtend,
}: RestTimerProps) {
  const { t } = useTranslation();
  const [remainingSeconds, setRemainingSeconds] = useState(0);

  // Update remaining time every 100ms for smooth countdown
  useEffect(() => {
    const updateRemaining = () => {
      const remaining = Math.max(0, endTime.getTime() - Date.now());
      setRemainingSeconds(Math.ceil(remaining / 1000));
    };

    updateRemaining();
    const interval = setInterval(updateRemaining, 100);
    return () => clearInterval(interval);
  }, [endTime]);

  // Calculate progress for circular indicator (0 = just started, 1 = done)
  const progress = totalSeconds > 0 
    ? Math.min(1, (totalSeconds - remainingSeconds) / totalSeconds) 
    : 0;

  // Circle dimensions
  const size = 160;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progressOffset = circumference - progress * circumference;

  // Format time display
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const timeDisplay = minutes > 0 
    ? `${minutes}:${seconds.toString().padStart(2, '0')}`
    : seconds.toString();

  return (
    <div className="flex flex-col items-center justify-center py-6 animate-scale-in">
      {/* Label */}
      <span className="text-sm font-medium text-indigo-400 uppercase tracking-wider mb-6">
        {t('workout.restTime')}
      </span>

      {/* Circular timer */}
      <div className="relative mb-8 animate-breathe">
        <svg
          width={size}
          height={size}
          className="-rotate-90"
        >
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(99, 102, 241, 0.12)"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#6366f1"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            className="transition-all duration-100"
          />
        </svg>

        {/* Time display in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-5xl font-bold text-white tabular-nums">
            {timeDisplay}
          </span>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        {onExtend && (
          <button
            onClick={() => onExtend(15)}
            className="
              px-5 py-3 rounded-xl
              bg-gray-800/80 hover:bg-gray-700 active:bg-gray-600
              ring-1 ring-gray-700/50
              text-gray-300 text-sm font-medium
              transition-all duration-150
              active:scale-[0.96]
            "
          >
            {t('workout.extendRest')}
          </button>
        )}
        <button
          onClick={onSkip}
          className="
            px-5 py-3 rounded-xl
            bg-indigo-600/20 hover:bg-indigo-600/30 active:bg-indigo-600/40
            ring-1 ring-indigo-500/30
            text-indigo-300 text-sm font-medium
            transition-all duration-150
            active:scale-[0.96]
          "
        >
          {t('workout.skipRest')}
        </button>
      </div>

      {/* Hint */}
      <p className="mt-5 text-gray-600 text-xs">
        {t('workout.nextSetReady')}
      </p>
    </div>
  );
}

export default RestTimer;
