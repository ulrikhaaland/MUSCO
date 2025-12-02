import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Exercise } from '@/app/types/program';
import { extractExerciseMarkers } from '@/app/utils/exerciseMarkerParser';
import { extractBodyPartMarkers } from '@/app/utils/bodyPartMarkerParser';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { AnatomyPart } from '@/app/types/human';

interface AvailableBodyPart {
  name: string;
  objectId: string;
}

interface MessageWithExercisesProps {
  content: string;
  exercises: Map<string, Exercise>;
  onVideoClick?: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  className?: string;
  selectedExercise?: Exercise | null;
  onExerciseSelect?: (exercise: Exercise | null) => void;
  // Body part selection support
  availableBodyParts?: AvailableBodyPart[];
  onBodyPartClick?: (part: AnatomyPart) => void;
}

/**
 * Helper to find exercise by name with fuzzy matching
 * Handles cases like "Military Press" matching database variations
 */
function findExercise(name: string, exercises: Map<string, Exercise>): Exercise | undefined {
  // Try exact match first
  if (exercises.has(name)) {
    return exercises.get(name);
  }
  
  // Try fuzzy match: check if database name starts with the search name
  const normalizedSearch = name.toLowerCase().trim();
  for (const [dbName, exercise] of exercises.entries()) {
    const normalizedDbName = dbName.toLowerCase().trim();
    
    // Check if database name starts with search term
    if (normalizedDbName.startsWith(normalizedSearch)) {
      return exercise;
    }
    
    // Check if search term is contained in database name (for partial matches)
    if (normalizedDbName.includes(normalizedSearch) || normalizedSearch.includes(normalizedDbName)) {
      return exercise;
    }
  }
  
  return undefined;
}

/**
 * Helper to find body part by name with fuzzy matching
 */
function findBodyPart(name: string, parts: AvailableBodyPart[]): AvailableBodyPart | undefined {
  const normalizedSearch = name.toLowerCase().trim();
  
  // Try exact match first
  const exactMatch = parts.find(p => p.name.toLowerCase() === normalizedSearch);
  if (exactMatch) return exactMatch;
  
  // Try fuzzy match
  for (const part of parts) {
    const normalizedName = part.name.toLowerCase().trim();
    if (normalizedName.includes(normalizedSearch) || normalizedSearch.includes(normalizedName)) {
      return part;
    }
  }
  
  return undefined;
}

/**
 * Renders message text with inline exercise and body part chips
 * Exercises are clickable to show detail modal
 * Body parts are clickable to select on 3D model
 * Memoized to prevent re-renders during streaming from interrupting clicks
 * Modal state is managed externally to survive component remounts
 */
export const MessageWithExercises = React.memo(function MessageWithExercises({
  content,
  exercises,
  onVideoClick,
  loadingVideoExercise,
  className,
  selectedExercise: externalSelectedExercise,
  onExerciseSelect,
  availableBodyParts = [],
  onBodyPartClick,
}: MessageWithExercisesProps) {
  const exerciseMarkers = extractExerciseMarkers(content);
  const bodyPartMarkers = extractBodyPartMarkers(content);
  const hasMarkers = exerciseMarkers.length > 0 || bodyPartMarkers.length > 0;

  // If no markers, render markdown normally
  if (!hasMarkers) {
    return (
      <ReactMarkdown
        className={className}
        components={{
          ul: ({ children }) => (
            <ul className="pl-0 md:pl-4" style={{ listStyle: 'none', listStyleType: 'none', margin: 0 }}>
              {children as any}
            </ul>
          ),
          li: ({ children }) => (
            <li className="ml-0 pl-4 md:pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400" style={{ listStyle: 'none', listStyleType: 'none', display: 'list-item' }}>
              {children as any}
            </li>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  }

  // Replace [[Exercise Name]] with _exercise:Name_ and {{Body Part}} with _bodypart:Name_
  let contentWithChips = content;
  
  // Replace exercise markers first
  exerciseMarkers.forEach((marker) => {
    contentWithChips = contentWithChips.replace(marker.fullMatch, `_exercise:${marker.name}_`);
  });
  
  // Replace body part markers
  bodyPartMarkers.forEach((marker) => {
    contentWithChips = contentWithChips.replace(marker.fullMatch, `_bodypart:${marker.name}_`);
  });

  return (
    <>
    <ReactMarkdown
      className={className}
      components={{
        ul: ({ children }) => (
          <ul className="pl-0 md:pl-4" style={{ listStyle: 'none', listStyleType: 'none', margin: 0 }}>
            {children as any}
          </ul>
        ),
        li: ({ children }) => (
          <li className="ml-0 pl-4 md:pl-6 relative before:content-['•'] before:absolute before:left-0 before:text-gray-400" style={{ listStyle: 'none', listStyleType: 'none', display: 'list-item' }}>
            {children as any}
          </li>
        ),
        em: ({ children }) => {
          const rawText = typeof children === 'string' ? children : String(children);
          
          // Check if this is an exercise marker
          if (rawText.startsWith('exercise:')) {
            const exerciseName = rawText.substring('exercise:'.length);
            const exercise = findExercise(exerciseName, exercises);
            
            // If exercise not found in database, render as plain text
            if (!exercise) {
              return <span>{exerciseName}</span>;
            }
            
            const handleTouch = (e: React.TouchEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onExerciseSelect?.(exercise);
            };

            const handleMouseDown = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onExerciseSelect?.(exercise);
            };
            
            // Render as clickable badge for exercises in database
            return (
              <span 
                className="not-italic px-1.5 py-0.5 rounded bg-indigo-600/30 text-white font-medium border border-indigo-500/40 select-none cursor-pointer hover:bg-indigo-600/50 hover:border-indigo-400 transition-colors active:bg-indigo-600/70"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouch}
                role="button"
                tabIndex={0}
                aria-label={`View ${exercise.name} details`}
                style={{ 
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                }}
              >
                {exercise.name}
              </span>
            );
          }
          
          // Check if this is a body part marker
          if (rawText.startsWith('bodypart:')) {
            const bodyPartName = rawText.substring('bodypart:'.length);
            const bodyPart = findBodyPart(bodyPartName, availableBodyParts);
            
            // If body part not found, render as plain text
            if (!bodyPart || !onBodyPartClick) {
              return <span>{bodyPartName}</span>;
            }
            
            const handleTouch = (e: React.TouchEvent) => {
              e.preventDefault();
              e.stopPropagation();
              // Create AnatomyPart from the available body part data
              const anatomyPart: AnatomyPart = {
                objectId: bodyPart.objectId,
                name: bodyPart.name,
                description: '',
                available: true,
                shown: true,
                selected: false,
                parent: '',
                children: [],
              };
              onBodyPartClick(anatomyPart);
            };

            const handleMouseDown = (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              const anatomyPart: AnatomyPart = {
                objectId: bodyPart.objectId,
                name: bodyPart.name,
                description: '',
                available: true,
                shown: true,
                selected: false,
                parent: '',
                children: [],
              };
              onBodyPartClick(anatomyPart);
            };
            
            // Render as clickable badge for body parts (different color from exercises)
            return (
              <span 
                className="not-italic px-1.5 py-0.5 rounded bg-emerald-600/30 text-white font-medium border border-emerald-500/40 select-none cursor-pointer hover:bg-emerald-600/50 hover:border-emerald-400 transition-colors active:bg-emerald-600/70"
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouch}
                role="button"
                tabIndex={0}
                aria-label={`Select ${bodyPart.name} on model`}
                style={{ 
                  WebkitTouchCallout: 'none',
                  WebkitUserSelect: 'none',
                  userSelect: 'none'
                }}
              >
                {bodyPart.name}
              </span>
            );
          }
          
          // Regular italic text
          return <em>{children as any}</em>;
        },
      }}
    >
      {contentWithChips}
    </ReactMarkdown>
    
    {/* Exercise Detail Modal - Controlled by external state */}
    {externalSelectedExercise && onExerciseSelect && (
      <ExerciseDetailModal
        key={externalSelectedExercise.id || externalSelectedExercise.name}
        exercise={externalSelectedExercise}
        onClose={() => onExerciseSelect(null)}
        onVideoClick={(ex) => {
          // Keep detail modal open, just trigger video
          onVideoClick?.(ex);
        }}
        loadingVideo={loadingVideoExercise === (externalSelectedExercise.name || externalSelectedExercise.id)}
      />
    )}
    </>
  );
});
