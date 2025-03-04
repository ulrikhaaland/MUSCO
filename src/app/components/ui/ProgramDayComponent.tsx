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
  programTitle?: string;
  onTitleClick?: () => void;
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
  programTitle,
  onTitleClick,
}: ProgramDayComponentProps) {
  // State to track removed body parts
  const [removedBodyParts, setRemovedBodyParts] = useState<string[]>([]);
  
  // Get all unique body parts from exercises
  const allBodyParts = Array.from(
    new Set(
      day.exercises?.map(exercise => exercise.bodyPart).filter(Boolean) || []
    )
  ).sort();
  
  // Filter exercises based on removed body parts
  const filteredExercises = day.exercises?.filter(exercise => {
    // If exercise has no body part, show it
    if (!exercise.bodyPart) return true;
    
    // Only filter out if the exercise's body part is in the removed list
    return !removedBodyParts.includes(exercise.bodyPart);
  });
  
  // Toggle body part filter
  const toggleBodyPart = (bodyPart: string) => {
    setRemovedBodyParts(prev => {
      if (prev.includes(bodyPart)) {
        return prev.filter(part => part !== bodyPart);
      } else {
        return [...prev, bodyPart];
      }
    });
  };

  return (
    <div className="h-full space-y-6" onClick={onClick}>
      {/* Header section */}
      <div className="bg-gray-900/95 backdrop-blur-sm py-4">
        {programTitle && (
          <div className="mb-3">
            <button 
              className="text-lg font-medium text-indigo-300 hover:text-indigo-200 transition-colors flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                if (onTitleClick) onTitleClick();
              }}
            >
              {programTitle}
              {onTitleClick && (
                <svg className="w-4 h-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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

      {/* Body Parts Filter Section */}
      {allBodyParts.length > 0 && (
        <div className="">
          <h4 className="text-gray-300 font-medium mb-2">Target Body Parts:</h4>
          <div className="flex flex-wrap gap-2">
            {allBodyParts.map(bodyPart => (
              <button
                key={bodyPart}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBodyPart(bodyPart);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors duration-200 flex items-center gap-1
                  ${removedBodyParts.includes(bodyPart) 
                    ? 'bg-gray-700 text-gray-400' 
                    : 'bg-indigo-500/20 text-indigo-300 hover:bg-indigo-500/30'}`}
              >
                {bodyPart}
                {removedBodyParts.includes(bodyPart) ? (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content section */}
      <div className="space-y-6">
        {/* Optional exercises message for rest days */}
        {day.isRestDay && filteredExercises && filteredExercises.length > 0 && (
          <div>
            <h4 className="text-indigo-400 font-medium">
              Optional Recovery Activities
            </h4>
            <p className="text-gray-400 text-sm mt-1">
              These gentle exercises can be performed at home to aid recovery.
              Listen to your body and only do what feels comfortable.
            </p>
          </div>
        )}

        {/* Exercise list - same for both rest days and workout days */}
        {filteredExercises && filteredExercises.length > 0 ? (
          <div className="space-y-4 pb-32">
            {filteredExercises.map((exercise) => (
              <div
                key={exercise.name}
                onClick={() => onExerciseToggle?.(exercise.name)}
                className={`bg-gray-800/50 rounded-lg overflow-hidden hover:bg-gray-700/50 transition-colors duration-200 ${
                  onExerciseToggle ? 'cursor-pointer' : ''
                }`}
              >
                {/* Exercise Header - Always visible */}
                <div className="w-full px-4 py-3 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">
                      {exercise.name}
                    </span>
                    {onExerciseToggle && (
                      <svg
                        className={`w-5 h-5 text-gray-400 transform transition-transform duration-200 ${
                          expandedExercises.includes(exercise.name)
                            ? 'rotate-180'
                            : ''
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
                    <div className="flex flex-wrap items-center gap-2">
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
                      {exercise.bodyPart && (
                        <div className="flex flex-wrap gap-1 ml-1">
                          <span 
                            key={exercise.bodyPart} 
                            className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300"
                          >
                            {exercise.bodyPart}
                          </span>
                        </div>
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
                    {/* Body Parts in expanded view */}
                    {exercise.bodyPart && (
                      <div className="flex flex-wrap gap-1 ml-1">
                        <span 
                          key={exercise.bodyPart} 
                          className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-500/20 text-indigo-300"
                        >
                          {exercise.bodyPart}
                        </span>
                      </div>
                    )}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        onVideoClick(exercise);
                      }}
                      className={`inline-flex items-center space-x-1 bg-indigo-500/90 hover:bg-indigo-400 text-white px-3 py-1.5 rounded-md ${
                        compact ? 'text-xs' : 'text-sm'
                      } transition-colors duration-200 cursor-pointer`}
                    >
                      {loadingVideoExercise === exercise.name ? (
                        <div
                          className={`${
                            compact ? 'w-3.5 h-3.5' : 'w-4 h-4'
                          } border-t-2 border-white rounded-full animate-spin`}
                        />
                      ) : (
                        <svg
                          className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'}`}
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
                        <span className="font-medium">Modification:</span>{' '}
                        {exercise.modification}
                      </p>
                    )}
                    {exercise.precaution && (
                      <p className="text-yellow-300/90 text-sm leading-relaxed">
                        <span className="font-medium">Precaution:</span>{' '}
                        {exercise.precaution}
                      </p>
                    )}
                    {exercise.instructions && (
                      <p className="text-gray-400 text-sm leading-relaxed">
                        <span className="font-medium">Instructions:</span>{' '}
                        {exercise.instructions}
                      </p>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center">
            <p className="text-gray-400">
              No exercises available with the current filter. 
              {removedBodyParts.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRemovedBodyParts([]);
                  }}
                  className="text-indigo-400 hover:text-indigo-300 ml-2 underline"
                >
                  Reset filters
                </button>
              )}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
