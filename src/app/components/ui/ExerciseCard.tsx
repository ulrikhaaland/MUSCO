import { ReactNode, useState, useEffect } from 'react';
import { Exercise } from '@/app/types/program';
import Card from './Card';
import Chip from './Chip';

interface ExerciseCardProps {
  exercise: Exercise;
  isExpanded?: boolean; // Controls whether details are shown
  onToggle?: () => void; // Called when the card header is clicked
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  compact?: boolean;
}

export default function ExerciseCard({
  exercise,
  isExpanded = true,
  onToggle,
  onVideoClick,
  loadingVideoExercise = null,
  compact = false,
}: ExerciseCardProps) {
  // Detect mobile viewport
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkIsMobile = () => setIsMobile(window.innerWidth < 768);
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  // Local UI state per exercise card
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  const getTruncatedDescription = (description: string, charLimit = 100) => {
    if (description.length <= charLimit) return description;
    const lastSpaceIndex = description.lastIndexOf(' ', charLimit);
    if (lastSpaceIndex === -1)
      return description.substring(0, charLimit) + '...';
    return description.substring(0, lastSpaceIndex) + '...';
  };

  const renderExerciseChips = (ex: Exercise): ReactNode[] => {
    const chips: ReactNode[] = [];

    if (ex.duration) {
      chips.push(
        <Chip key="duration" size="sm">
          {ex.bodyPart === "Cardio" 
            ? `${ex.duration} min` // For cardio exercises, duration is always in minutes
            : ex.duration >= 60
              ? `${Math.floor(ex.duration / 60)} min${ex.duration % 60 > 0 ? ` ${ex.duration % 60} sec` : ''}`
              : `${ex.duration} sec`}
        </Chip>
      );
    } else {
      if (ex.sets && ex.repetitions) {
        chips.push(
          <Chip key="sets-reps" size="lg">
            {ex.sets} × {ex.repetitions}
          </Chip>
        );
      }
      if (ex.restBetweenSets && ex.restBetweenSets !== 0) {
        chips.push(
          <Chip key="restBetweenSets" size="lg">
            {ex.restBetweenSets}s rest
          </Chip>
        );
      }
    }

    return chips;
  };

  const exerciseId = exercise.id || exercise.exerciseId || exercise.name;

  return (
    <Card
      key={exerciseId}
      onClick={onToggle}
      isClickable={!!onToggle}
      title={
        <span className={isMobile ? 'tracking-tighter' : 'tracking-tight'}>
          {exercise.name}
          {onToggle && (
            <svg
              className={`inline-block ml-2 w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          )}
        </span>
      }
      tag={
        exercise.bodyPart && (
          <Chip
            size="md"
            backgroundColor={exercise.warmup ? 'bg-amber-600' : ''}
          >
            {exercise.bodyPart}
          </Chip>
        )
      }
    >
      {isExpanded ? (
        <Card.Section>
          {exercise.description && (
            <div className="text-gray-50 leading-relaxed">
              {isDescriptionExpanded
                ? exercise.description
                : getTruncatedDescription(exercise.description)}
              {exercise.description.length > 100 && (
                <button
                  className="ml-1 text-indigo-300 hover:text-indigo-200 text-sm font-medium"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsDescriptionExpanded((prev) => !prev);
                  }}
                >
                  {isDescriptionExpanded ? 'See less' : 'See more'}
                </button>
              )}
            </div>
          )}

          {/* Parameters row */}
          <div className="flex flex-wrap gap-4 items-center">
            {renderExerciseChips(exercise)}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onVideoClick(exercise);
              }}
              className={`inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl ${
                compact ? 'text-xs' : 'text-sm'
              } transition-colors duration-200 cursor-pointer ml-auto`}
            >
              {(() => {
                const exerciseIdentifier =
                  exercise.name || exercise.id || exercise.exerciseId;
                return loadingVideoExercise === exerciseIdentifier ? (
                  <div
                    className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} border-t-2 border-white rounded-full animate-spin`}
                  />
                ) : (
                  <svg
                    className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} opacity-85`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                );
              })()}
              <span>Watch Video</span>
            </div>
          </div>

          {exercise.modification && (
            <p className="text-yellow-200/90 text-sm leading-relaxed">
              <span className="font-medium">Modification:</span>{' '}
              {exercise.modification}
            </p>
          )}

          {exercise.precaution && (
            <p className="text-red-400/90 text-sm leading-relaxed">
              <span className="font-medium">Precaution:</span>{' '}
              {exercise.precaution}
            </p>
          )}

          {exercise.steps && exercise.steps.length > 0 && (
            <div className="text-gray-300 text-sm leading-relaxed mt-4">
              <div className="flex items-center">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowInstructions((prev) => !prev);
                  }}
                  className="text-indigo-300 hover:text-indigo-200 text-sm font-medium inline-flex items-center"
                >
                  {showInstructions ? (
                    <>
                      <svg
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                      Hide Instructions
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4 mr-1"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                      View Instructions
                    </>
                  )}
                </button>
              </div>
              {showInstructions && (
                <div className="mt-3 pl-6 relative bg-gray-800/40 p-4 mx-2 rounded-r-xl">
                  <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-indigo-700/80 via-indigo-700/50 to-indigo-700/20 rounded-full" />
                  <ol className="list-decimal pl-5 space-y-2">
                    {exercise.steps.map((step, index) => (
                      <li key={index} className="leading-[1.4]">
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          )}
        </Card.Section>
      ) : null}
      {/* Show chips at the bottom when collapsed */}
      {!isExpanded && (
        <Card.Section className="mt-auto">
          <div className="flex flex-wrap gap-2 items-center">
            <div className="flex flex-wrap gap-2 justify-start">
              {renderExerciseChips(exercise)}
            </div>
            <div
              onClick={(e) => {
                e.stopPropagation();
                onVideoClick(exercise);
              }}
              className={`inline-flex items-center space-x-1 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-xl ${
                compact ? 'text-xs' : 'text-sm'
              } transition-colors duration-200 cursor-pointer ml-auto`}
            >
              {(() => {
                const exerciseIdentifier =
                  exercise.name || exercise.id || exercise.exerciseId;
                return loadingVideoExercise === exerciseIdentifier ? (
                  <div
                    className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} border-t-2 border-white rounded-full animate-spin`}
                  />
                ) : (
                  <svg
                    className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} opacity-85`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                );
              })()}
              <span>Watch Video</span>
            </div>
          </div>
        </Card.Section>
      )}
    </Card>
  );
}
