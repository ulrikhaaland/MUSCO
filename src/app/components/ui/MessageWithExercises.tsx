import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Exercise } from '@/app/types/program';
import { extractExerciseMarkers } from '@/app/utils/exerciseMarkerParser';
import { ExerciseDetailModal } from './ExerciseDetailModal';

interface MessageWithExercisesProps {
  content: string;
  exercises: Map<string, Exercise>;
  onVideoClick?: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  className?: string;
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
 * Renders message text with inline exercise chips
 * Exercises are clickable to show detail modal
 * Memoized to prevent re-renders during streaming from interrupting clicks
 */
export const MessageWithExercises = React.memo(function MessageWithExercises({
  content,
  exercises,
  onVideoClick,
  loadingVideoExercise,
  className,
}: MessageWithExercisesProps) {
  const [selectedExercise, setSelectedExercise] = React.useState<Exercise | null>(null);
  const selectedExerciseRef = React.useRef<Exercise | null>(null);
  const markers = extractExerciseMarkers(content);
  
  // Keep ref in sync with state
  React.useEffect(() => {
    selectedExerciseRef.current = selectedExercise;
  }, [selectedExercise]);
  
  // Debug: Log when modal state changes or component remounts
  React.useEffect(() => {
    if (selectedExercise) {
      console.log('[MessageWithExercises] Modal opened for:', selectedExercise.name);
    }
  }, [selectedExercise]);
  
  React.useEffect(() => {
    return () => {
      if (selectedExerciseRef.current) {
        console.log('[MessageWithExercises] Component unmounting while modal was open!');
      }
    };
  }, []);

  // If no markers, render markdown normally
  if (markers.length === 0) {
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

  // Replace [[Exercise Name]] with styled markdown + data attribute for click handling
  const contentWithChips = markers.reduce((text, marker) => {
    const replacement = `_${marker.name}_`;
    return text.replace(marker.fullMatch, replacement);
  }, content);

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
          const exerciseName = typeof children === 'string' ? children : String(children);
          const exercise = findExercise(exerciseName, exercises);
          
          // If exercise not found in database, render as plain italic text
          if (!exercise) {
            console.log('[MessageWithExercises] Exercise not found:', exerciseName);
            return <em>{children as any}</em>;
          }
          
          const handleTouch = (e: React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[MessageWithExercises] Touch event on:', exerciseName, '-> matched:', exercise.name);
            setSelectedExercise(exercise);
          };

          const handleMouseDown = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('[MessageWithExercises] MouseDown event on:', exerciseName, '-> matched:', exercise.name);
            setSelectedExercise(exercise);
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
        },
      }}
    >
      {contentWithChips}
    </ReactMarkdown>
    
    {/* Exercise Detail Modal */}
    {selectedExercise && (
      <ExerciseDetailModal
        key={selectedExercise.id || selectedExercise.name}
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onVideoClick={(ex) => {
          // Keep detail modal open, just trigger video
          onVideoClick?.(ex);
        }}
        loadingVideo={loadingVideoExercise === (selectedExercise.name || selectedExercise.id)}
      />
    )}
    </>
  );
});
// Cache bust: 1762011965
