import { useState } from 'react';
import type { ExerciseProgram, ProgramDay } from '@/app/types/program';
import { ProgramDaySummaryComponent } from './ProgramDaySummaryComponent';
import { useUser } from '@/app/context/UserContext';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { TextButton } from './TextButton';
import {
  getStartOfWeek,
  getDayOfWeekMondayFirst,
  addDays,
} from '@/app/utils/dateutils';

interface ExerciseProgramCalendarProps {
  program: ExerciseProgram; // This will still be the initially selected program
  dayName: (day: number) => string;
  onDaySelect?: (day: ProgramDay, dayName: string, programId: string) => void;
}

interface ProgramDayWithSource {
  day: ProgramDay;
  program: ExerciseProgram;
  userProgram: any; // Will contain the UserProgram with title
  dayOfWeek: number;
}

export function ExerciseProgramCalendar({
  program: _program,
  dayName,
  onDaySelect,
}: ExerciseProgramCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const { userPrograms } = useUser();
  const { t } = useTranslation();

  // Get all active user programs
  const activeUserPrograms = userPrograms.filter((up) => up.active);

  const getDayProgram = (date: Date): ProgramDayWithSource[] => {
    const result: ProgramDayWithSource[] = [];

    for (const userProgram of activeUserPrograms) {
      for (const activeProgram of userProgram.programs) {
        // Get the day of week (1 = Monday, 7 = Sunday) using standardized utility
        const dayOfWeek = getDayOfWeekMondayFirst(date);

        // Convert createdAt to Date if it's not already
        const programStartDate = new Date(activeProgram.createdAt);

        // Find the start of the week containing the program start date using standardized utility
        const programWeekStart = getStartOfWeek(programStartDate);

        // Reset time part of the check date for accurate comparison
        const checkDate = new Date(date);
        checkDate.setHours(0, 0, 0, 0);

        // Find the start of the week for the check date using standardized utility
        const checkWeekStart = getStartOfWeek(checkDate);

        // Calculate the difference in weeks from the program start week
        const weekDiff = Math.floor(
          (checkWeekStart.getTime() - programWeekStart.getTime()) /
            (7 * 24 * 60 * 60 * 1000)
        );

        // Since each program now represents one week, we check if this is the right week
        // If weekDiff is not 0, this program doesn't apply to this date
        if (weekDiff !== 0) {
          continue;
        }

        // Find the matching day in the week
        const day = activeProgram.days.find((d) => d.day === dayOfWeek);
        if (!day) continue;

        // Add this program day to the result
        result.push({
          day: {
            ...day,
            description: day.description,
          },
          program: activeProgram,
          userProgram,
          dayOfWeek,
        });
      }
    }

    return result;
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  const goToCurrentDay = () => {
    setSelectedDate(new Date());
  };

  const isCurrentDay = () => {
    const today = new Date();
    return selectedDate.toDateString() === today.toDateString();
  };

  const renderHeader = () => {
    const monthYear = selectedDate.toLocaleString('default', {
      month: 'long',
      year: 'numeric',
    });

    return (
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700/50">
        <button
          onClick={() => setShowYearPicker(!showYearPicker)}
          className="text-xl font-semibold text-white hover:text-indigo-400 transition-colors"
        >
          {monthYear}
        </button>

        <TextButton onClick={goToCurrentDay} disabled={isCurrentDay()}>
          {t('calendar.today')}
        </TextButton>

        <div className="flex space-x-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-3 rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors disabled:opacity-60"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-3 rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors disabled:opacity-60"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>
    );
  };

  const renderWeekDays = () => {
    const weekDays = [
      t('calendar.weekdays.mon'),
      t('calendar.weekdays.tue'),
      t('calendar.weekdays.wed'),
      t('calendar.weekdays.thu'),
      t('calendar.weekdays.fri'),
      t('calendar.weekdays.sat'),
      t('calendar.weekdays.sun'),
    ];
    return (
      <div className="grid grid-cols-7 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center py-2">
            <span className="text-sm font-medium text-gray-400">{day}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarDays = () => {
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
    // Get the Monday of the week containing the first day of the month
    const startDate = getStartOfWeek(firstDay);

    const weeks = [];
    const today = new Date();
    const currentDateString = today.toDateString();

    // Calculate days for the visible calendar (max 6 weeks)
    for (let week = 0; week < 6; week++) {
      const currentWeek = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        const programDays = getDayProgram(date);
        const isProgramDay = programDays.length > 0;

        currentWeek.push({
          date,
          programDays,
          isCurrentMonth: date.getMonth() === selectedDate.getMonth(),
          isToday: date.toDateString() === currentDateString,
          isSelected: date.toDateString() === selectedDate.toDateString(),
          isProgramDay,
        });
        const nextDate = addDays(startDate, 1);
        startDate.setTime(nextDate.getTime());
      }
      weeks.push(currentWeek);

      // Break if we've gone past the last day of the month and completed the week
      if (startDate > lastDay && startDate.getDay() === 1) {
        break;
      }
    }

    return (
      <div className="grid gap-px bg-gray-800/30">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7">
            {week.map(
              (
                {
                  date,
                  programDays,
                  isCurrentMonth,
                  isToday,
                  isSelected,
                  isProgramDay,
                },
                _dayIndex
              ) => {
                // Check if there are any workout days (non-rest days)
                const hasWorkout = programDays.some((p) => !p.day.isRestDay);
                // Only show "Rest" if there are no workout days and at least one rest day
                const isRestOnly =
                  !hasWorkout && programDays.some((p) => p.day.isRestDay);

                return (
                  <button
                    key={date.toDateString()}
                    onClick={() => handleDateClick(date)}
                    className={`
                      relative aspect-square p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
                      ${
                        isCurrentMonth
                          ? isProgramDay
                            ? 'bg-gray-800/50'
                            : 'bg-gray-900/50'
                          : 'bg-gray-900/30 text-gray-600'
                      }
                      ${
                        isSelected
                          ? 'bg-indigo-600/40 border-2 border-indigo-400'
                          : ''
                      }
                      ${
                        isProgramDay && isCurrentMonth && !isSelected
                          ? 'hover:bg-gray-700/50'
                          : !isProgramDay && isCurrentMonth && !isSelected
                            ? 'hover:bg-gray-800/40'
                            : ''
                      }
                      transition-all duration-200
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <div
                        className={`
                        flex justify-center items-center flex-grow
                        ${isToday ? 'relative' : ''}
                      `}
                      >
                        <span
                          className={`
                            text-sm relative z-10 ${
                              isToday
                                ? 'text-indigo-300 font-semibold'
                                : isSelected
                                  ? 'text-white font-semibold'
                                  : isCurrentMonth
                                    ? isProgramDay
                                      ? 'text-gray-100'
                                      : 'text-gray-300'
                                    : 'text-gray-600'
                            }
                          `}
                        >
                          {date.getDate()}
                        </span>
                      </div>
                      {isProgramDay && isCurrentMonth && (
                        <div className="mt-auto">
                          {hasWorkout ? (
                            <div className="text-xs text-white mt-1 flex items-center justify-center opacity-65">
                              {t('calendar.workout')}
                            </div>
                          ) : isRestOnly ? (
                            <div className="text-xs text-white mt-1 flex items-center justify-center opacity-65">
                              {t('calendar.rest')}
                            </div>
                          ) : null}
                        </div>
                      )}
                    </div>
                  </button>
                );
              }
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSelectedDayProgram = () => {
    const programDays = getDayProgram(selectedDate);

    if (programDays.length === 0) {
      return (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
          <p className="text-gray-400 text-center">
            {t('calendar.noProgramForThisDay')}
          </p>
        </div>
      );
    }

    // Format the date for display

    return (
      <div className="mt-8 space-y-8">
        {programDays.map((programDay, index) => (
          <div key={index} className="space-y-2">
            <ProgramDaySummaryComponent
              day={programDay.day}
              dayName={dayName(programDay.dayOfWeek)}
              onClick={
                onDaySelect
                  ? () =>
                      onDaySelect(
                        programDay.day,
                        dayName(programDay.dayOfWeek),
                        programDay.program.createdAt.toString()
                      )
                  : undefined
              }
              programTitle={programDay.userProgram.title || 'Program'}
              isCalendarView={true}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 pt-6 pb-24 md:pb-8">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-gray-700/50">
            {renderHeader()}
            <div className="p-4">
              {renderWeekDays()}
              {renderCalendarDays()}
            </div>
          </div>
          {renderSelectedDayProgram()}
        </div>
      </div>
    </div>
  );
}
