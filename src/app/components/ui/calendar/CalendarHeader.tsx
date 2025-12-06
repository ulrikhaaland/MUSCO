'use client';

import { TextButton } from '../TextButton';

interface CalendarHeaderProps {
  selectedDate: Date;
  onMonthChange: (increment: number) => void;
  onTodayClick: () => void;
  isCurrentDay: boolean;
  todayLabel: string;
}

export function CalendarHeader({
  selectedDate,
  onMonthChange,
  onTodayClick,
  isCurrentDay,
  todayLabel,
}: CalendarHeaderProps) {
  const monthYear = selectedDate.toLocaleString('default', {
    month: 'long',
    year: 'numeric',
  });

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
      <h2 className="text-xl font-semibold text-white">
        {monthYear}
      </h2>

      <TextButton onClick={onTodayClick} disabled={isCurrentDay}>
        {todayLabel}
      </TextButton>

      <div className="flex space-x-2">
        <button
          onClick={() => onMonthChange(-1)}
          className="p-2 rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => onMonthChange(1)}
          className="p-2 rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}

