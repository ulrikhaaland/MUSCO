import { useState } from 'react';
import type {
  ExerciseProgram,
  ProgramDay,
} from '@/app/types/program';
import { TopBar } from './TopBar';
import { ProgramDaySummaryComponent } from './ProgramDaySummaryComponent';

interface ExerciseProgramCalendarProps {
  program: ExerciseProgram;
  onToggleView: () => void;
  dayName: (day: number) => string;
  onDaySelect?: (day: ProgramDay, dayName: string) => void;
}

export function ExerciseProgramCalendar({
  program,
  onToggleView,
  dayName,
  onDaySelect,
}: ExerciseProgramCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const getDayProgram = (date: Date): ProgramDay | undefined => {
    // Get the day of week (1 = Monday, 7 = Sunday)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();

    // Convert createdAt to Date if it's not already
    const programStartDate = new Date(program.createdAt);
    
    // Find the start of the week containing the program start date
    const programWeekStart = new Date(programStartDate);
    const programStartDayOfWeek = programStartDate.getDay() === 0 ? 7 : programStartDate.getDay();
    programWeekStart.setDate(programStartDate.getDate() - (programStartDayOfWeek - 1));
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
      (checkWeekStart.getTime() - programWeekStart.getTime()) / (7 * 24 * 60 * 60 * 1000)
    );

    // If the date is before program start week or after program end, return undefined
    if (weekDiff < 0 || weekDiff >= program.program.length) {
      return undefined;
    }

    // Get the program week
    const programWeek = program.program[weekDiff];
    if (!programWeek) return undefined;

    // Find the matching day in the week
    const day = programWeek.days.find((d) => d.day === dayOfWeek);
    if (!day) return undefined;

    return {
      ...day,
      description: programWeek.differenceReason
        ? `${day.description}\n\nWeek ${programWeek.week} changes: ${programWeek.differenceReason}`
        : day.description,
    };
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
      <div className="flex items-center justify-between px-4 py-2">
        <button
          onClick={() => setShowYearPicker(!showYearPicker)}
          className="text-xl font-semibold text-white hover:text-indigo-400 transition-colors"
        >
          {monthYear}
        </button>
        <div className="flex space-x-4">
          <button
            onClick={() => handleMonthChange(-1)}
            className="p-2 rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors"
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
            className="p-2 rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors"
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

    // Find the start of the week containing the program start date
    const programStartDate = new Date(program.createdAt);
    const programStartDayOfWeek = programStartDate.getDay() === 0 ? 7 : programStartDate.getDay();
    const programWeekStart = new Date(programStartDate);
    programWeekStart.setDate(programStartDate.getDate() - (programStartDayOfWeek - 1));
    programWeekStart.setHours(0, 0, 0, 0);

    // Calculate program end date based on the start of the program week
    const programEndDate = new Date(programWeekStart);
    programEndDate.setDate(programWeekStart.getDate() + (program.program.length * 7));

    // Calculate days for the visible calendar (max 6 weeks)
    for (let week = 0; week < 6; week++) {
      const currentWeek = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(startDate);
        const program = getDayProgram(date);
        
        // Check if the date falls within a program week
        const dateWeekStart = new Date(date);
        const dateDayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
        dateWeekStart.setDate(date.getDate() - (dateDayOfWeek - 1));
        dateWeekStart.setHours(0, 0, 0, 0);
        
        const isProgramDay = dateWeekStart >= programWeekStart && dateWeekStart < programEndDate;

        currentWeek.push({
          date,
          program,
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
              ({
                date,
                program,
                isCurrentMonth,
                isToday,
                isSelected,
                isProgramDay,
              }, dayIndex) => (
                <button
                  key={dayIndex}
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
                    ${isSelected ? 'bg-indigo-500/30 ring-2 ring-indigo-500' : ''}
                    ${isToday ? 'font-bold' : ''}
                    ${
                      program &&
                      !program.isRestDay &&
                      isCurrentMonth &&
                      !isSelected
                        ? 'hover:bg-gray-700/50'
                        : ''
                    }
                    transition-all duration-200
                  `}
                >
                  <div className="flex flex-col h-full">
                    <span
                      className={`
                        text-sm ${
                          isToday
                            ? 'text-indigo-400'
                            : isCurrentMonth
                            ? isProgramDay
                              ? 'text-gray-300'
                              : 'text-gray-500'
                            : 'text-gray-600'
                        }
                        ${isSelected ? 'text-indigo-300' : ''}
                        ${
                          program &&
                          !program.isRestDay &&
                          isCurrentMonth &&
                          isSelected
                            ? 'text-indigo-200 font-medium'
                            : ''
                        }
                      `}
                    >
                      {date.getDate()}
                    </span>
                    {program && isCurrentMonth && (
                      <div className="mt-auto">
                        {program.isRestDay ? (
                          <div className="text-xs text-gray-500 mt-1">Rest</div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="text-xs text-gray-400 mt-1">
                              Workout
                            </div>
                            <div
                              className={`h-1 w-8 rounded-full ${
                                isSelected
                                  ? 'bg-indigo-500'
                                  : 'bg-indigo-500/30'
                              }`}
                            ></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              )
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderSelectedDayProgram = () => {
    const dayProgram = getDayProgram(selectedDate);

    if (!dayProgram) {
      return (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
          <p className="text-gray-400 text-center">No program for this day</p>
        </div>
      );
    }

    // Get the day of week (1 = Monday, 7 = Sunday)
    const dayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();

    return (
      <div className="mt-6 space-y-4">
        <ProgramDaySummaryComponent
          day={dayProgram}
          dayName={dayName(dayOfWeek)}
          onClick={onDaySelect ? () => onDaySelect(dayProgram, dayName(dayOfWeek)) : undefined}
        />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 to-gray-800">
      <TopBar
        rightContent={
          <>
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
                d="M4 6h16M4 10h16M4 14h16M4 18h16"
              />
            </svg>
            <span className="ml-2">List</span>
          </>
        }
        onRightClick={onToggleView}
        className="fixed top-0 left-0 right-0 z-50"
      />

      <div className="h-screen overflow-y-auto pt-16">
        <div className="max-w-2xl mx-auto px-4 py-8">
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
