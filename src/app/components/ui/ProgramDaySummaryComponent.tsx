import { ProgramDay } from '@/app/types/program';
import Chip from './Chip';

interface ProgramDaySummaryComponentProps {
  day: ProgramDay;
  dayName: string;
  date?: string;
  onClick?: () => void;
  programTitle?: string;
  isCalendarView?: boolean;
  isHighlighted?: boolean;
}

export function ProgramDaySummaryComponent({
  day,
  dayName,
  date,
  onClick,
  programTitle,
  isCalendarView = false,
  isHighlighted = false,
}: ProgramDaySummaryComponentProps) {
  // Calculate exercise statistics
  const totalExercises = day.exercises?.length || 0;
  const warmupExercises = day.exercises?.filter(ex => ex.warmup)?.length || 0;

  return (
    <div>
    <div 
      className={`bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 transition-colors duration-200 ${onClick ? 'hover:bg-gray-700/50 cursor-pointer' : ''} ${isHighlighted ? 'shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)]' : ''}`}
      onClick={onClick}
    >
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              <h3 className="text-app-title text-white">
                {dayName}
              </h3>
              {day.isRestDay ? (
                <Chip variant="highlight" size="sm">Rest</Chip>
              ) : (
                <Chip variant="default" size="sm">Activity</Chip>
              )}
            </div>
            <div className="flex items-center gap-6">
              {day.duration !== undefined && day.duration > 0 && (
                <div className="flex items-center text-gray-400">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {day.duration === 0 ? 'No duration' : `${day.duration} minutes`}
                </div>
              )}
            </div>
          </div>
        </div>

        {isCalendarView && programTitle && (
          <div className="mb-2 text-sm font-medium text-indigo-300">
            {programTitle}
          </div>
        )}

        <p className="text-gray-300 text-sm mb-4">{day.description}</p>

        {/* Exercise breakdown */}
        <div className="space-y-2">
          {/* Exercise count and type breakdown */}
          <div className="flex flex-wrap gap-3">
            {totalExercises > 0 && (
              <div className="flex items-center text-gray-400 text-sm">
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                {day.isRestDay ? 
                  `${totalExercises} optional recovery ${totalExercises === 1 ? 'activity' : 'activities'}` :
                  `${totalExercises} ${totalExercises === 1 ? 'exercise' : 'exercises'}`
                }
              </div>
            )}
            {warmupExercises > 0 && (
              <div className="flex items-center text-orange-300/80 text-sm">
                <svg
                  className="w-4 h-4 mr-1.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z"
                  />
                </svg>
                {warmupExercises} warm-up
              </div>
            )}
          </div>

          {/* List all exercises */}
          {day.exercises?.length > 0 && (
            <div className="mt-3 space-y-1">
              {day.exercises?.map((exercise, index) => (
                <div key={index} className="flex items-center text-sm text-gray-400">
                  <span className="w-4 h-4 mr-2 flex items-center justify-center">
                    {exercise.warmup ? (
                      <span className="text-orange-400/80">⚡</span>
                    ) : (
                      <span className="text-indigo-400/80">•</span>
                    )}
                  </span>
                  <span className="truncate">{exercise.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
    </div>
  );
} 