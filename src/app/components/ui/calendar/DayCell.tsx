'use client';

import { memo } from 'react';

export type DayType = 'strength' | 'cardio' | 'recovery' | 'rest' | null;

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  dayType: DayType;
  dayTypeLabel: string;
  isCompleted?: boolean;
  onClick: () => void;
}

export const DayCell = memo(function DayCell({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  dayType,
  dayTypeLabel,
  isCompleted = false,
  onClick,
}: DayCellProps) {
  const hasProgramDay = dayType !== null;

  return (
    <button
      onClick={onClick}
      className={`
        relative aspect-square p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
        ${isCurrentMonth
          ? hasProgramDay
            ? 'bg-gray-800/50'
            : 'bg-gray-900/50'
          : 'bg-gray-900/30 text-gray-600'
        }
        ${isSelected
          ? 'bg-indigo-600/40 border-2 border-indigo-400'
          : ''
        }
        ${hasProgramDay && isCurrentMonth && !isSelected
          ? 'hover:bg-gray-700/50'
          : !hasProgramDay && isCurrentMonth && !isSelected
            ? 'hover:bg-gray-800/40'
            : ''
        }
        transition-all duration-200
      `}
    >
      <div className="flex flex-col h-full">
        <div className={`flex justify-center items-center flex-grow ${isToday ? 'relative' : ''}`}>
          <span
            className={`
              text-sm relative z-10
              ${isSelected
                ? 'text-white font-bold'
                : isToday
                  ? 'text-indigo-300 font-semibold'
                  : isCurrentMonth
                    ? hasProgramDay
                      ? 'text-gray-100'
                      : 'text-gray-300'
                    : 'text-gray-600'
              }
            `}
          >
            {date.getDate()}
          </span>
        </div>
        {hasProgramDay && isCurrentMonth && (
          <div className="mt-auto">
            <div className={`text-xs mt-1 flex items-center justify-center gap-1 ${isCompleted ? 'text-emerald-400 opacity-80' : 'text-white opacity-65'}`}>
              {isCompleted && (
                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
              {dayTypeLabel}
            </div>
          </div>
        )}
      </div>
    </button>
  );
});

