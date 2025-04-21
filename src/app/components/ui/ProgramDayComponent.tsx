import { useState, useRef, useEffect, useCallback } from 'react';
import { Exercise, ProgramDay } from '@/app/types/program';
import Card from './Card';
import Chip from './Chip';

interface ProgramDayComponentProps {
  day: ProgramDay;
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
  // State to track expanded description of exercises
  const [expandedDescriptions, setExpandedDescriptions] = useState<string[]>([]);
  // State to track visible instructions
  const [visibleInstructions, setVisibleInstructions] = useState<string[]>([]);
  // State to track if title is being hovered
  const [isTitleHovered, setIsTitleHovered] = useState(false);
  // State to track if body parts container is overflowing
  const [isBodyPartsOverflowing, setIsBodyPartsOverflowing] = useState(false);
  // State to track if activity badge is hovered
  const [isActivityBadgeHovered, setIsActivityBadgeHovered] = useState(false);
  // State to track if activity badge is pressed
  const [isActivityBadgePressed, setIsActivityBadgePressed] = useState(false);
  // State to track viewport width for responsive adjustments
  const [isMobile, setIsMobile] = useState(false);
  // Ref for body parts container
  const bodyPartsRef = useRef<HTMLDivElement>(null);
  // Ref to track current overflow state to avoid dependency loops
  const isOverflowingRef = useRef(false);
  
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
  
  // Check for overflow using ResizeObserver instead of direct effect
  const checkOverflow = useCallback(() => {
    if (bodyPartsRef.current) {
      const isOverflowing = bodyPartsRef.current.scrollWidth > bodyPartsRef.current.clientWidth;
      
      // Only update state if the overflow status has changed
      if (isOverflowing !== isOverflowingRef.current) {
        isOverflowingRef.current = isOverflowing;
        setIsBodyPartsOverflowing(isOverflowing);
      }
    }
  }, []);
  
  // Check if body parts container is overflowing
  useEffect(() => {
    checkOverflow();
    
    // Set up resize observer
    const resizeObserver = new ResizeObserver(() => {
      checkOverflow();
    });
    
    if (bodyPartsRef.current) {
      resizeObserver.observe(bodyPartsRef.current);
    }
    
    return () => {
      resizeObserver.disconnect();
    };
  }, [checkOverflow]);

  // Check if viewport is mobile sized
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);
  
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

  // Function to truncate description at a character limit (100 chars) while respecting word boundaries
  const getTruncatedDescription = (description: string, charLimit = 100) => {
    if (description.length <= charLimit) return description;
    
    // Find the last space within the character limit
    const lastSpaceIndex = description.lastIndexOf(' ', charLimit);
    
    // If no space found, just cut at the character limit
    if (lastSpaceIndex === -1) return description.substring(0, charLimit) + '...';
    
    // Otherwise cut at the last space
    return description.substring(0, lastSpaceIndex) + '...';
  };

  // Toggle expanded description
  const toggleDescriptionExpand = (exerciseId: string) => {
    setExpandedDescriptions(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  // Toggle instructions visibility
  const toggleInstructionsVisibility = (exerciseId: string) => {
    setVisibleInstructions(prev => {
      if (prev.includes(exerciseId)) {
        return prev.filter(id => id !== exerciseId);
      } else {
        return [...prev, exerciseId];
      }
    });
  };

  // Render all body parts with horizontal scrolling
  const renderBodyParts = () => {
    return allBodyParts.map(bodyPart => (
      <Chip
        key={bodyPart}
        onClick={() => toggleBodyPart(bodyPart)}
        variant={removedBodyParts.includes(bodyPart) ? 'inactive' : 'default'}
        icon={
          removedBodyParts.includes(bodyPart) ? (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          ) : (
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        }
      >
        {bodyPart}
      </Chip>
    ));
  };

  // Render exercise information chips
  const renderExerciseChips = (exercise: Exercise) => {
    const chips = [];
    
    if (exercise.duration) {
      chips.push(
        <Chip key="duration" size="sm">
          {exercise.duration} min
        </Chip>
      );
    } else {
      if (exercise.sets && exercise.repetitions) {
        chips.push(
          <Chip key="sets-reps" size="sm">
            {exercise.sets} × {exercise.repetitions}
          </Chip>
        );
      }
      if (exercise.rest && exercise.rest !== 0) {
        chips.push(
          <Chip key="rest" size="sm">
            {exercise.rest}s rest
          </Chip>
        );
      }
    }
    
    return chips;
  };

  return (
    <div className="h-full px-0 space-y-8" onClick={onClick}>
      {/* Header section */}
      <div className="bg-gray-900/95 backdrop-blur-sm py-4 mb-8 -mx-6 px-6">
        {programTitle && (
          <div className="mb-8">
            <button 
              className={`text-lg font-medium text-indigo-200 transition-all flex items-center py-2 -ml-2 pl-2 pr-3 rounded-xl ${isTitleHovered ? 'bg-indigo-900/30 text-indigo-100' : ''} hover:bg-indigo-900/30 hover:text-indigo-100 active:bg-indigo-900/50 active:scale-[0.99] w-auto`}
              onClick={(e) => {
                e.stopPropagation();
                if (onTitleClick) onTitleClick();
              }}
              onMouseEnter={() => setIsTitleHovered(true)}
              onMouseLeave={() => setIsTitleHovered(false)}
            >
              {programTitle}
              {onTitleClick && (
                <svg 
                  className={`w-5 h-5 ml-2 transition-transform duration-200 ${isTitleHovered ? 'translate-x-1' : ''}`} 
                  viewBox="0 0 20 20" 
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>
        )}
        
        {/* Combined Activity/Duration Badge */}
        <div className="mb-8">
          <button 
            className={`inline-flex items-center px-4 py-2 rounded-xl bg-indigo-900/40 text-indigo-100 transition-all ${
              isActivityBadgeHovered ? 'bg-indigo-800/50 shadow-sm translate-y-[-2px]' : ''
            } ${
              isActivityBadgePressed ? 'shadow-inner-sm' : ''
            } hover:bg-indigo-800/50 hover:shadow-sm hover:translate-y-[-2px] active:translate-y-0 active:bg-indigo-800/60 active:shadow-inner-sm`}
            onMouseEnter={() => setIsActivityBadgeHovered(true)}
            onMouseLeave={() => setIsActivityBadgeHovered(false)}
            onMouseDown={() => setIsActivityBadgePressed(true)}
            onMouseUp={() => setIsActivityBadgePressed(false)}
            onTouchStart={() => setIsActivityBadgePressed(true)}
            onTouchEnd={() => setIsActivityBadgePressed(false)}
          >
            {day.isRestDay ? (
              <span className="text-sm font-medium">Recovery</span>
            ) : (
              <span className="text-sm font-medium">Activity</span>
            )}
            
            {day.duration && (
              <>
                <span className="mx-2 text-indigo-300">·</span>
                <div className="flex items-center text-indigo-100">
                  <svg
                    className="w-4 h-4 mr-1.5 opacity-90"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.75}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {day.duration} minutes
                </div>
              </>
            )}
          </button>
        </div>

        <p className="text-gray-50 mb-2 leading-relaxed">{day.description}</p>
      </div>

      {/* Body Parts Filter Section */}
      {allBodyParts.length > 0 && (
        <div className="mb-8">
          <h4 className="text-gray-50 font-medium mb-4">Target Body Parts:</h4>
          <div className="relative max-w-full overflow-hidden">
            <div 
              ref={bodyPartsRef}
              className="flex overflow-x-auto hide-scrollbar pb-2 max-w-full"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              <div className="flex gap-2 min-w-min pr-8">
                {renderBodyParts()}
              </div>
            </div>
            {isBodyPartsOverflowing && (
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-gray-900/90 from-30% via-gray-900/70 via-60% to-transparent pointer-events-none" style={{ right: '-2px' }} />
            )}
          </div>
        </div>
      )}

      {/* Content section */}
      <div className="space-y-8 pb-32">
        {/* Optional exercises message for rest days */}
        {day.isRestDay && filteredExercises && filteredExercises.length > 0 && (
          <div className="mb-8">
            <h4 className="text-indigo-300 font-medium">
              Optional Recovery Activities
            </h4>
            <p className="text-gray-300 text-sm mt-1">
              These gentle exercises can be performed at home to aid recovery.
              Listen to your body and only do what feels comfortable.
            </p>
          </div>
        )}

        {/* Exercise list - same for both rest days and workout days */}
        {filteredExercises && filteredExercises.length > 0 ? (
          <div className="space-y-8 pb-32">
            {filteredExercises.map((exercise) => {
              const exerciseId = exercise.id || exercise.exerciseId || exercise.name;
              const isExpanded = !onExerciseToggle || expandedExercises.includes(exercise.name);
              
              return (
                <Card
                  key={exercise.id || exercise.exerciseId || `${exercise.name}-${exercise.bodyPart}`}
                  onClick={() => onExerciseToggle?.(exercise.name)}
                  isClickable={!!onExerciseToggle}
                  title={
                    <span className={isMobile ? 'tracking-tighter' : 'tracking-tight'}>
                      {exercise.name}
                    </span>
                  }
                  tag={
                    exercise.bodyPart && (
                      <Chip size="sm">
                        {exercise.bodyPart}
                      </Chip>
                    )
                  }
                  headerContent={
                    !expandedExercises.includes(exercise.name) && renderExerciseChips(exercise)
                  }
                >
                  {/* Exercise Details - Only visible when expanded */}
                  {isExpanded && (
                    <Card.Section>
                      {exercise.description && (
                        <div className="text-gray-50 leading-relaxed">
                          {expandedDescriptions.includes(exerciseId) 
                            ? exercise.description 
                            : getTruncatedDescription(exercise.description)}
                          {exercise.description.length > 100 && (
                            <button 
                              className="ml-1 text-indigo-300 hover:text-indigo-200 text-sm font-medium"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleDescriptionExpand(exerciseId);
                              }}
                            >
                              {expandedDescriptions.includes(exerciseId) 
                                ? 'See less' 
                                : 'See more'}
                            </button>
                          )}
                        </div>
                      )}
                      
                      {/* Exercise parameters in expanded view */}
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
                          {loadingVideoExercise === exercise.name ? (
                            <div
                              className={`${
                                compact ? 'w-3.5 h-3.5' : 'w-4 h-4'
                              } border-t-2 border-white rounded-full animate-spin`}
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
                          )}
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
                        <p className="text-yellow-200/90 text-sm leading-relaxed">
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
                                toggleInstructionsVisibility(exerciseId);
                              }}
                              className="text-indigo-300 hover:text-indigo-200 text-sm font-medium inline-flex items-center"
                            >
                              {visibleInstructions.includes(exerciseId) 
                                ? (
                                  <>
                                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7" />
                                    </svg>
                                    Hide Instructions
                                  </>
                                ) 
                                : (
                                  <>
                                    <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                    View Instructions
                                  </>
                                )}
                            </button>
                          </div>
                          {visibleInstructions.includes(exerciseId) && (
                            <div className="mt-3 pl-6 relative bg-gray-800/40 p-4 mx-2 rounded-r-xl">
                              <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-gradient-to-b from-indigo-700/80 via-indigo-700/50 to-indigo-700/20 rounded-full"></div>
                              <ol className="list-decimal pl-5 space-y-2">
                                {exercise.steps.map((step, index) => (
                                  <li key={index} className="leading-[1.4]">{step}</li>
                                ))}
                              </ol>
                            </div>
                          )}
                        </div>
                      )}
                    </Card.Section>
                  )}
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="py-8 text-center">
            <p className="text-gray-300">
              No exercises available with the current filter. 
              {removedBodyParts.length > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setRemovedBodyParts([]);
                  }}
                  className="text-indigo-300 hover:text-indigo-200 ml-2 underline"
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

// Add this to your global CSS
/*
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}
.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tracking-tighter {
  letter-spacing: -0.025em;
}
.shadow-inner-sm {
  box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.2);
}
.box-shadow-card {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06), inset 0 0 0 1px rgba(255, 255, 255, 0.04);
}
*/
