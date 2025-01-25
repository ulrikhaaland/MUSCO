import { useState } from 'react';
import type { ExerciseProgram, ProgramDay, Exercise } from './ExerciseProgramPage';
import { TopBar } from './TopBar';
import { ProgramDayComponent } from './ProgramDayComponent';

interface ExerciseProgramCalendarProps {
  program: ExerciseProgram;
  onBack: () => void;
  onToggleView: () => void;
  showCalendarView: boolean;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise: string | null;
}

export function ExerciseProgramCalendar({
  program,
  onBack,
  onToggleView,
  showCalendarView,
  onVideoClick,
  loadingVideoExercise,
}: ExerciseProgramCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);

  const getDayProgram = (date: Date): ProgramDay | undefined => {
    // Get the day of week (1 = Monday, 7 = Sunday)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    
    // Get the first day of the year
    const startOfYear = new Date(date.getFullYear(), 0, 1);
    
    // Calculate days since start of year
    const daysSinceStart = Math.floor((date.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate week number (0-based)
    const weekIndex = Math.floor(daysSinceStart / 7) % program.program.length;
    
    // Get the program week
    const programWeek = program.program[weekIndex];
    if (!programWeek) return undefined;
    
    // Find the matching day in the week
    const day = programWeek.days.find(d => d.day === dayOfWeek);
    if (!day) return undefined;
    
    return {
      ...day,
      description: programWeek.differenceReason 
        ? `${day.description}\n\nWeek ${programWeek.week} changes: ${programWeek.differenceReason}`
        : day.description
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
    const monthYear = selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' });

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
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => handleMonthChange(1)}
            className="p-2 rounded-full hover:bg-gray-800/80 text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
        {weekDays.map(day => (
          <div key={day} className="text-center py-2">
            <span className="text-sm font-medium text-gray-400">{day}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderCalendarDays = () => {
    const firstDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
    const lastDay = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
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
        const program = getDayProgram(date);
        currentWeek.push({
          date,
          program,
          isCurrentMonth: date.getMonth() === selectedDate.getMonth(),
          isToday: date.toDateString() === currentDateString,
          isSelected: date.toDateString() === selectedDate.toDateString(),
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
            {week.map(({ date, program, isCurrentMonth, isToday, isSelected }, dayIndex) => (
              <button
                key={dayIndex}
                onClick={() => handleDateClick(date)}
                className={`
                  relative aspect-square p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900
                  ${isCurrentMonth ? 'bg-gray-800/50' : 'bg-gray-900/30 text-gray-600'}
                  ${isSelected ? 'bg-indigo-500/30 ring-2 ring-indigo-500' : ''}
                  ${isToday ? 'font-bold' : ''}
                  ${program && !program.isRestDay && isCurrentMonth && !isSelected ? 'hover:bg-gray-700/50' : ''}
                  transition-all duration-200
                `}
              >
                <div className="flex flex-col h-full">
                  <span className={`
                    text-sm ${isToday ? 'text-indigo-400' : isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}
                    ${isSelected ? 'text-indigo-300' : ''}
                    ${program && !program.isRestDay && isCurrentMonth && isSelected ? 'text-indigo-200 font-medium' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  {program && isCurrentMonth && (
                    <div className="mt-auto">
                      {program.isRestDay ? (
                        <div className="text-xs text-gray-500 mt-1">Rest</div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="text-xs text-gray-400 mt-1">Workout</div>
                          <div className={`h-1 w-8 rounded-full ${isSelected ? 'bg-indigo-500' : 'bg-indigo-500/30'}`}></div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </button>
            ))}
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

    const formattedDate = selectedDate.toLocaleDateString('default', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });

    return (
      <div className="mt-6 space-y-4">
        <ProgramDayComponent
          day={dayProgram}
          dayName={`Day ${dayProgram.day}`}
          date={formattedDate}
          onVideoClick={onVideoClick}
          loadingVideoExercise={loadingVideoExercise}
          compact={true}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen h-[calc(100dvh)] from-gray-900 to-gray-800">
      <TopBar
        onBack={onBack}
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

      <div className="h-screen overflow-y-auto pt-16 pb-32">
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