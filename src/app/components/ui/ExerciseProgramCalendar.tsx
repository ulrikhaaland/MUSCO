import { useState } from 'react';
import type { ExerciseProgram, ProgramDay } from './ExerciseProgramPage';
import { TopBar } from './TopBar';

interface ExerciseProgramCalendarProps {
  program: ExerciseProgram;
  onBack: () => void;
  onToggleView: () => void;
  showCalendarView: boolean;
}

export function ExerciseProgramCalendar({ program, onBack, onToggleView, showCalendarView }: ExerciseProgramCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);

  const getDayProgram = (date: Date): ProgramDay | undefined => {
    // Convert Sunday (0) to 7, and Monday-Saturday (1-6) to (1-6)
    const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay();
    return program.program.find(day => day.dayOfWeek === dayOfWeek);
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleMonthChange = (increment: number) => {
    const newDate = new Date(selectedDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setSelectedDate(newDate);
  };

  const handleVideoClick = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
  
    if (match && match[2].length === 11) {
      setVideoUrl(`https://www.youtube.com/embed/${match[2]}`);
    } else {
      setVideoUrl(url);
    }
  };

  const closeVideo = () => {
    setVideoUrl(null);
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
                  ${program && !program.isRestDay && isCurrentMonth ? 'bg-indigo-500/20 hover:bg-indigo-500/30 ring-1 ring-indigo-400/50' : 'hover:bg-gray-700/50'}
                  transition-all duration-200
                `}
              >
                <div className="flex flex-col h-full">
                  <span className={`
                    text-sm ${isToday ? 'text-indigo-400' : isCurrentMonth ? 'text-gray-300' : 'text-gray-600'}
                    ${isSelected ? 'text-indigo-300' : ''}
                    ${program && !program.isRestDay && isCurrentMonth ? 'text-indigo-200 font-medium' : ''}
                  `}>
                    {date.getDate()}
                  </span>
                  {program && isCurrentMonth && (
                    <div className="mt-auto">
                      {program.isRestDay ? (
                        <div className="text-xs text-gray-500 mt-1">Rest</div>
                      ) : (
                        <div className="flex flex-col items-center gap-0.5">
                          <div className="text-xs text-indigo-300/90 mt-1">Workout</div>
                          <div className="h-1 w-8 rounded-full bg-indigo-500/70"></div>
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

    if (dayProgram.isRestDay) {
      return (
        <div className="mt-6 p-4 bg-gray-800/50 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-semibold text-white">Rest Day</h3>
            <span className="text-sm text-gray-400">
              {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <p className="text-gray-300">{dayProgram.description}</p>
        </div>
      );
    }

    return (
      <div className="mt-6 space-y-4">
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 ring-1 ring-gray-700/50">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <h3 className="text-lg font-semibold text-white">Day {dayProgram.day}</h3>
              {dayProgram.duration && (
                <div className="flex items-center text-gray-400 ml-4">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm">{dayProgram.duration}</span>
                </div>
              )}
            </div>
            <span className="text-sm text-gray-400">
              {selectedDate.toLocaleDateString('default', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          <p className="text-gray-300 mb-4">{dayProgram.description}</p>
          <div className="space-y-4">
            {dayProgram.exercises.map((exercise, index) => (
              <div key={index} className="bg-gray-900/50 rounded-lg p-4 ring-1 ring-gray-700/30">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-white font-medium mb-2">{exercise.name}</h4>
                  {exercise.videoUrl && (
                    <button
                      onClick={() => handleVideoClick(exercise.videoUrl!)}
                      className="flex items-center space-x-1 bg-indigo-500/90 hover:bg-indigo-400 text-white px-2.5 py-1 rounded-md text-xs transition-colors duration-200"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span>Video</span>
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-300">{exercise.description}</p>
                {((exercise.sets && exercise.repetitions) || exercise.duration || exercise.rest) && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {exercise.duration ? (
                      <span className="px-2 py-1 bg-gray-800/80 rounded text-xs text-gray-300">
                        {exercise.duration}
                      </span>
                    ) : (
                      <>
                        {exercise.sets && (
                          <span className="px-2 py-1 bg-gray-800/80 rounded text-xs text-gray-300">
                            {exercise.sets} sets
                          </span>
                        )}
                        {exercise.repetitions && (
                          <span className="px-2 py-1 bg-gray-800/80 rounded text-xs text-gray-300">
                            {exercise.repetitions} reps
                          </span>
                        )}
                        {exercise.rest && exercise.rest !== "n/a" && (
                          <span className="px-2 py-1 bg-gray-800/80 rounded text-xs text-gray-300">
                            {exercise.rest} rest
                          </span>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
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

      {videoUrl && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-[9999]"
          onClick={closeVideo}
        >
          <div
            className="relative w-full max-w-4xl mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeVideo}
              className="absolute -top-12 right-0 text-white/80 hover:text-white p-2 transition-colors duration-200"
            >
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
            <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
              <div className="relative pt-[56.25%]">
                <iframe
                  className="absolute inset-0 w-full h-full"
                  src={videoUrl}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 