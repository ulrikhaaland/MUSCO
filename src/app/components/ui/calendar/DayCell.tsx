'use client';

import { memo } from 'react';

interface DayCellProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  hasWorkout: boolean;
  isRestDay: boolean;
  workoutLabel: string;
  restLabel: string;
  onClick: () => void;
}

export const DayCell = memo(function DayCell({
  date,
  isCurrentMonth,
  isToday,
  isSelected,
  hasWorkout,
  isRestDay,
  workoutLabel,
  restLabel,
  onClick,
}: DayCellProps) {
  const hasProgramDay = hasWorkout || isRestDay;

  return (
    <button
      onClick={onClick}
      className={`
        relative p-1 md:p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 focus:ring-offset-gray-900
        min-h-[52px] md:min-h-[72px]
        ${isCurrentMonth
          ? hasProgramDay
            ? 'bg-gray-800/50'
            : 'bg-gray-900/50'
          : 'bg-gray-900/30 text-gray-600'
        }
        ${isSelected
          ? 'bg-indigo-600/40 ring-2 ring-indigo-400'
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
      aria-label={`${date.toLocaleDateString()}, ${hasWorkout ? workoutLabel : isRestDay ? restLabel : ''}`}
      aria-selected={isSelected}
    >
      <div className="flex flex-col h-full justify-between">
        {/* Date number */}
        <div className="flex justify-center items-center">
          <span
            className={`
              text-sm md:text-base font-medium
              ${isToday
                ? 'bg-indigo-600 text-white rounded-full w-7 h-7 md:w-8 md:h-8 flex items-center justify-center'
                : isSelected
                  ? 'text-white font-semibold'
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

        {/* Workout indicator */}
        {hasProgramDay && isCurrentMonth && (
          <div className="mt-auto pb-1">
            {hasWorkout ? (
              <div className="text-[10px] md:text-xs text-indigo-300 text-center font-medium">
                {workoutLabel}
              </div>
            ) : isRestDay ? (
              <div className="text-[10px] md:text-xs text-gray-400 text-center">
                {restLabel}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </button>
  );
});

