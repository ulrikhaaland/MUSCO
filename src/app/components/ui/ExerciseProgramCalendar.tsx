import { useState } from 'react';
import type { ExerciseProgram, ProgramDay } from '@/app/types/program';
import { ProgramDaySummaryComponent } from './ProgramDaySummaryComponent';
import { useUser } from '@/app/context/UserContext';

interface ExerciseProgramCalendarProps {
  program: ExerciseProgram; // This will still be the initially selected program
  dayName: (day: number) => string;
  onDaySelect?: (day: ProgramDay, dayName: string, programId: string) => void;
}

interface ProgramDayWithSource {
  day: ProgramDay;
  program: ExerciseProgram;
  dayOfWeek: number;
}

export function ExerciseProgramCalendar({
  program,
  dayName,
  onDaySelect,
}: ExerciseProgramCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const { userPrograms } = useUser();

  // Get all active programs from userPrograms
  const activePrograms = userPrograms
    .filter((up) => up.active)
    .flatMap((up) => up.programs);

  const getDayProgram = (date: Date): ProgramDayWithSource[] => {
    const result: ProgramDayWithSource[] = [];

    for (const activeProgram of activePrograms) {
      // Get the day of week (1 = Monday, 7 = Sunday)
      const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

      // Convert createdAt to Date if it's not already
      const programStartDate = new Date(activeProgram.createdAt);

      // Find the start of the week containing the program start date
      const programWeekStart = new Date(programStartDate);
      const programStartDayOfWeek =
        programStartDate.getDay() === 0 ? 7 : programStartDate.getDay();
      programWeekStart.setDate(
        programStartDate.getDate() - (programStartDayOfWeek - 1)
      );
      programWeekStart.setHours(0, 0, 0, 0);

      // Reset time part of the check date for accurate comparison
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      // Find the start of the week for the check date
      const checkWeekStart = new Date(checkDate);
      checkWeekStart.setDate(checkDate.getDate() - (dayOfWeek - 1));
      checkWeekStart.setHours(0, 0, 0, 0);

      // Calculate the difference in weeks from the program start week
      const weekDiff = Math.floor(
        (checkWeekStart.getTime() - programWeekStart.getTime()) /
          (7 * 24 * 60 * 60 * 1000)
      );

      // If the date is before program start week or after program end, skip this program
      if (weekDiff < 0 || weekDiff >= activeProgram.program.length) {
        continue;
      }

      // Get the program week
      const programWeek = activeProgram.program[weekDiff];
      if (!programWeek) continue;

      // Find the matching day in the week
      const day = programWeek.days.find((d) => d.day === dayOfWeek);
      if (!day) continue;

      // Add this program day to the result
      result.push({
        day: {
          ...day,
          description: programWeek.differenceReason
            ? `${day.description}\n\nWeek ${programWeek.week} changes: ${programWeek.differenceReason}`
            : day.description,
        },
        program: activeProgram,
        dayOfWeek,
      });
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
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
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
    const startDate = new Date(firstDay);
    // Adjust to start from Monday
    let dayOfWeek = startDate.getDay();
    // Convert Sunday (0) to 7 for easier calculation
    if (dayOfWeek === 0) dayOfWeek = 7;
    // Move back to the first Monday
    startDate.setDate(startDate.getDate() - (dayOfWeek - 1));

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
        startDate.setDate(startDate.getDate() + 1);
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
                dayIndex
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
                              Workout
                            </div>
                          ) : isRestOnly ? (
                            <div className="text-xs text-white mt-1 flex items-center justify-center opacity-65">
                              Rest
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
          <p className="text-gray-400 text-center">No program for this day</p>
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
              programTitle={programDay.program.title || 'Program'}
              isCalendarView={true}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col">
      <div className="py-3 px-4 flex items-center justify-between">
        {/* Empty spacer with same width as menu button to balance the title */}
        <div className="w-10"></div>
        <div className="flex flex-col items-center">
          <h1 className="text-app-title text-center">Calendar</h1>
        </div>
        {/* Space for menu button */}
        <div className="w-10"></div>
      </div>

      <div className="flex-1">
        <div className="max-w-2xl mx-auto px-4 pt-8 pb-8">
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
