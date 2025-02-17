import { useState } from 'react';
import { Exercise, ProgramDay } from '@/app/types/program';

// Add instructions to Exercise type
interface ExerciseWithInstructions extends Exercise {
  instructions?: string;
}

interface ProgramDayComponentProps {
  day: ProgramDay & { exercises?: ExerciseWithInstructions[] };
  dayName: string;
  date?: string;
  expandedExercises?: string[];
  onExerciseToggle?: (exerciseName: string) => void;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  compact?: boolean;
  onClick?: () => void;
}

export function ProgramDayComponent({
  day,
  dayName,
  date,
  expandedExercises = [],
  onExerciseToggle,
  onVideoClick,
  loadingVideoExercise,
  compact = false,
  onClick,
}: ProgramDayComponentProps) {
  return (
    <div 
      className="h-full space-y-6 mb-32"
      onClick={onClick}
    >
      {/* Header section */}
      <div className="bg-gray-900/95 backdrop-blur-sm py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h3 className="text-2xl font-medium text-white">
              {dayName}
            </h3>
            {day.isRestDay ? (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300">
                Recovery
              </span>
            ) : (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300">
                Activity
              </span>
            )}
          </div>
          <div className="flex items-center gap-6">
            {day.duration && (
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
                {day.duration} minutes
              </div>
            )}
            {date && <span className="text-sm text-gray-400">{date}</span>}
          </div>
        </div>

        <p className="text-gray-300 mt-4">{day.description}</p>
      </div>

      {/* Content section */}
      <div className="space-y-6">
        {/* Optional exercises message for rest days */}
        {day.isRestDay && day.exercises && day.exercises.length > 0 && (
          <div>
            <h4 className="text-indigo-400 font-medium">Optional Recovery Activities</h4>
            <p className="text-gray-400 text-sm mt-1">
              These gentle exercises can be performed at home to aid recovery. Listen to your body and only do what feels comfortable.
            </p>
          </div>
        )}

        {/* Exercise list - same for both rest days and workout days */}
        {day.exercises && day.exercises.length > 0 && (
          <div className="space-y-4">
            {day.exercises.map((exercise) => (
              <div
                key={exercise.name}
                onClick={() => onExerciseToggle?.(exercise.name)}
                className={`bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-700/50 transition-colors duration-200 ${
                  onExerciseToggle ? "cursor-pointer" : ""
                }`}
              >
                {/* Exercise Header - Always visible */}
                <div className="w-full px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">{exercise.name}</span>
                    {onExerciseToggle && (
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                          expandedExercises.includes(exercise.name)
                            ? "rotate-180"
                            : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    )}
                  </div>
                  {!expandedExercises.includes(exercise.name) && (
                    <div className="flex items-center gap-2">
                      {exercise.duration ? (
                        <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-900/80 text-gray-300">
                          {exercise.duration} min
                        </span>
                      ) : (
                        <>
                          {exercise.sets && (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-900/80 text-gray-300">
                              {exercise.sets} sets
                            </span>
                          )}
                          {exercise.repetitions && (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-900/80 text-gray-300">
                              {exercise.repetitions} reps
                            </span>
                          )}
                          {exercise.rest && exercise.rest !== 0 && (
                            <span className="px-2 py-1 rounded-md text-xs font-medium bg-gray-900/80 text-gray-300">
                              {exercise.rest}s rest
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Exercise Details - Only visible when expanded */}
                {(!onExerciseToggle ||
                  expandedExercises.includes(exercise.name)) && (
                  <div className="px-4 pb-4 space-y-3">
                    {exercise.description && (
                      <p className="text-gray-300 leading-relaxed">
                        {exercise.description}
                      </p>
                    )}
                    {/* Exercise parameters in expanded view */}
                    {((exercise.sets && exercise.repetitions) ||
                      exercise.duration ||
                      exercise.rest) && (
                      <div className="flex flex-wrap gap-2">
                        {exercise.duration ? (
                          <div className="px-3 py-1.5 rounded-lg bg-gray-900/80">
                            <span className="text-gray-300 text-sm">
                              {exercise.duration} minutes
                            </span>
                          </div>
                        ) : (
                          <>
                            {exercise.sets && (
                              <div className="px-3 py-1.5 rounded-lg bg-gray-900/80">
                                <span className="text-gray-300 text-sm">
                                  {exercise.sets} sets
                                </span>
                              </div>
                            )}
                            {exercise.repetitions && (
                              <div className="px-3 py-1.5 rounded-lg bg-gray-900/80">
                                <span className="text-gray-300 text-sm">
                                  {exercise.repetitions} reps
                                </span>
                              </div>
                            )}
                            {exercise.rest && exercise.rest !== 0 && (
                              <div className="px-3 py-1.5 rounded-lg bg-gray-900/80">
                                <span className="text-gray-300 text-sm">
                                  {exercise.rest} seconds rest
                                </span>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    )}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onVideoClick(exercise);
                      }}
                      className={`inline-flex items-center space-x-1 bg-indigo-500/90 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-md ${
                        compact ? "text-xs" : "text-sm"
                      } transition-colors duration-200 cursor-pointer`}
                    >
                      {loadingVideoExercise === exercise.name ? (
                        <div
                          className={`${
                            compact ? "w-3.5 h-3.5" : "w-4 h-4"
                          } border-t-2 border-white rounded-full animate-spin`}
                        />
                      ) : (
                        <svg
                          className={`${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`}
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
                      )}
                      <span>Watch Video</span>
                    </div>
                    {exercise.modification && (
                      <p className="text-yellow-300/90 text-sm leading-relaxed">
                        <span className="font-medium">Modification:</span>{" "}
                        {exercise.modification}
                      </p>
                    )}
                    {exercise.precaution && (
                      <p className="text-yellow-300/90 text-sm leading-relaxed">
                        <span className="font-medium">Precaution:</span>{" "}
                        {exercise.precaution}
                      </p>
                    )}
                    {exercise.instructions && (
                      <p className="text-gray-400 text-sm leading-relaxed">
                        <span className="font-medium">Instructions:</span>{" "}
                        {exercise.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}