'use client';

import { useState, useMemo, useCallback } from 'react';
import type { ExerciseProgram, ProgramDay } from '@/app/types/program';
import { getDayType } from '@/app/types/program';
import { useUser } from '@/app/context/UserContext';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { CalendarHeader, CalendarGrid, SelectedDayPanel } from './calendar';
import type { DayType } from './calendar/DayCell';
import {
  getStartOfWeek,
  getDayOfWeekMondayFirst,
  getDayShortName,
  getDayFullName,
} from '@/app/utils/dateutils';

interface ExerciseProgramCalendarProps {
  program: ExerciseProgram;
  dayName: (day: number) => string;
  onDaySelect?: (day: ProgramDay, dayName: string, programId: string) => void;
}

interface ProgramDayWithSource {
  day: ProgramDay;
  program: ExerciseProgram;
  userProgram: { title?: string; programs: ExerciseProgram[] };
  dayOfWeek: number;
}

export function ExerciseProgramCalendar({
  program: _program,
  dayName,
  onDaySelect,
}: ExerciseProgramCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const { userPrograms } = useUser();
  const { t } = useTranslation();

  // Get all user programs (previously filtered by active status, now we use all programs)
  const activeUserPrograms = useMemo(
    () => userPrograms,
    [userPrograms]
  );

  // Memoized function to get program data for a specific date
  const getDayProgram = useCallback(
    (date: Date): ProgramDayWithSource[] => {
    const result: ProgramDayWithSource[] = [];
      const dayOfWeek = getDayOfWeekMondayFirst(date);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);
      const checkWeekStart = getStartOfWeek(checkDate);

    for (const userProgram of activeUserPrograms) {
      for (const activeProgram of userProgram.programs) {
        const programStartDate = new Date(activeProgram.createdAt);
        const programWeekStart = getStartOfWeek(programStartDate);

        const weekDiff = Math.floor(
          (checkWeekStart.getTime() - programWeekStart.getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );

          if (weekDiff !== 0) continue;

        const day = activeProgram.days.find((d) => d.day === dayOfWeek);
        if (!day) continue;

        result.push({
            day: { ...day, description: day.description },
          program: activeProgram,
          userProgram,
          dayOfWeek,
        });
      }
    }

    return result;
    },
    [activeUserPrograms]
  );

  // Get day data for calendar grid (simplified for performance)
  const getDayData = useCallback(
    (date: Date): { date: Date; dayType: DayType; isCompleted?: boolean } => {
      const programDays = getDayProgram(date);
      if (programDays.length === 0) {
        return { date, dayType: null };
      }
      
      // Find the first non-rest day to determine type
      const workoutDay = programDays.find((p) => getDayType(p.day) !== 'rest');
      if (workoutDay) {
        return { date, dayType: getDayType(workoutDay.day), isCompleted: workoutDay.day.completed === true };
      }
      
      // All days are rest days
      return { date, dayType: 'rest' };
    },
    [getDayProgram]
  );

  // Get selected day's program data
  const selectedDayPrograms = useMemo(
    () => getDayProgram(selectedDate),
    [getDayProgram, selectedDate]
  );

  // Week day labels (1 = Monday, 7 = Sunday)
  const weekDays = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({
      short: getDayShortName(i + 1, t),
      full: getDayFullName(i + 1, t),
    })),
    [t]
  );

  const handleMonthChange = useCallback((increment: number) => {
    setSelectedDate((prev) => {
      const newDate = new Date(prev);
    newDate.setMonth(newDate.getMonth() + increment);
      return newDate;
    });
  }, []);

  const handleTodayClick = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  const isCurrentDay = useMemo(() => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  }, [selectedDate]);

    return (
    <div className="flex-1 bg-gray-900 flex flex-col">
      <div className="flex-1 px-4 pt-6 pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row lg:gap-8">
            {/* Calendar */}
            <div className="lg:flex-1 lg:max-w-2xl">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50">
                <CalendarHeader
                  selectedDate={selectedDate}
                  onMonthChange={handleMonthChange}
                  onTodayClick={handleTodayClick}
                  isCurrentDay={isCurrentDay}
                  todayLabel={t('calendar.today')}
                />
                <CalendarGrid
                  selectedDate={selectedDate}
                  onDateSelect={setSelectedDate}
                  getDayData={getDayData}
                  weekDays={weekDays}
                  dayTypeLabels={{
                    strength: t('calendar.strength'),
                    cardio: t('calendar.cardio'),
                    recovery: t('calendar.recovery'),
                    rest: t('calendar.rest'),
                  }}
                />
        </div>
      </div>

            {/* Selected Day Details */}
            <div className="mt-6 lg:mt-0 lg:flex-1 lg:max-w-md">
              <SelectedDayPanel
                programDays={selectedDayPrograms}
                dayName={dayName}
                onDaySelect={onDaySelect}
                emptyMessage={t('calendar.noProgramForThisDay')}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
