'use client';

import { useMemo } from 'react';
import { DayCell, DayType } from './DayCell';
import { getStartOfWeek, addDays } from '@/app/utils/dateutils';

interface WeekDay {
  short: string;
  full: string;
}

export interface DayData {
  date: Date;
  dayType: DayType;
  isCompleted?: boolean;
}

interface DayTypeLabels {
  strength: string;
  cardio: string;
  recovery: string;
  rest: string;
}

interface CalendarGridProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  getDayData: (date: Date) => DayData;
  weekDays: WeekDay[];
  dayTypeLabels: DayTypeLabels;
}

export function CalendarGrid({
  selectedDate,
  onDateSelect,
  getDayData,
  weekDays,
  dayTypeLabels,
}: CalendarGridProps) {
  const today = new Date();
  const currentDateString = today.toDateString();
  const selectedDateString = selectedDate.toDateString();

  // Memoize weeks calculation
  const weeks = useMemo(() => {
    const firstDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      1
    );
    const lastDay = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth() + 1,
      0
    );
    const startDate = getStartOfWeek(firstDay);

    const result: Date[][] = [];

    for (let week = 0; week < 6; week++) {
      const currentWeek: Date[] = [];
      for (let day = 0; day < 7; day++) {
        currentWeek.push(new Date(startDate));
        const nextDate = addDays(startDate, 1);
        startDate.setTime(nextDate.getTime());
      }
      result.push(currentWeek);

      if (startDate > lastDay && startDate.getDay() === 1) {
        break;
      }
    }

    return result;
  }, [selectedDate]);

  return (
    <div className="p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day, index) => (
          <div key={index} className="text-center py-2">
            {/* Short name on mobile, full name on desktop */}
            <span className="text-xs md:text-sm font-medium text-gray-400 md:hidden">
              {day.short}
            </span>
            <span className="text-sm font-medium text-gray-400 hidden md:block">
              {day.full}
            </span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid gap-px bg-gray-800/30">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map((date) => {
              const dayData = getDayData(date);
              const dateString = date.toDateString();

              const dayTypeLabel = dayData.dayType ? dayTypeLabels[dayData.dayType] : '';

              return (
                <DayCell
                  key={dateString}
                  date={date}
                  isCurrentMonth={date.getMonth() === selectedDate.getMonth()}
                  isToday={dateString === currentDateString}
                  isSelected={dateString === selectedDateString}
                  dayType={dayData.dayType}
                  dayTypeLabel={dayTypeLabel}
                  isCompleted={dayData.isCompleted}
                  onClick={() => onDateSelect(date)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

