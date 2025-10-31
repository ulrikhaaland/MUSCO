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
 * Renders message text with inline exercise chips
 * Exercises are clickable to show detail modal
 */
export function MessageWithExercises({
  content,
  exercises,
  onVideoClick,
  loadingVideoExercise,
  className,
}: MessageWithExercisesProps) {
  const [selectedExercise, setSelectedExercise] = React.useState<Exercise | null>(null);
  const markers = extractExerciseMarkers(content);
  
  // Debug: Log when modal state changes or component remounts
  React.useEffect(() => {
    if (selectedExercise) {
      console.log('[MessageWithExercises] Modal opened for:', selectedExercise.name);
    }
  }, [selectedExercise]);
  
  React.useEffect(() => {
    return () => {
      if (selectedExercise) {
        console.log('[MessageWithExercises] Component unmounting while modal was open!');
      }
    };
  }, [selectedExercise]);

  // If no markers, render markdown normally
  if (markers.length === 0) {
    return (
      <ReactMarkdown
        className={className}
        components={{
          ul: ({ children }) => (
            <ul className="list-none">
              {children as any}
            </ul>
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
          <ul className="list-none">
            {children as any}
          </ul>
        ),
        em: ({ children }) => {
          const exerciseName = typeof children === 'string' ? children : String(children);
          const exercise = exercises.get(exerciseName);
          
          // If exercise not found in database, render as plain italic text
          if (!exercise) {
            return <em>{children as any}</em>;
          }
          
          const handleTouch = (e: React.TouchEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedExercise(exercise);
          };

          const handleClick = (e: React.MouseEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setSelectedExercise(exercise);
          };
          
          // Render as clickable badge for exercises in database
          return (
            <span 
              className="not-italic px-1.5 py-0.5 rounded bg-indigo-600/30 text-white font-medium border border-indigo-500/40 select-none cursor-pointer hover:bg-indigo-600/50 hover:border-indigo-400 transition-colors active:bg-indigo-600/70"
              onClick={handleClick}
              onTouchStart={handleTouch}
              role="button"
              tabIndex={0}
              aria-label={`View ${exerciseName} details`}
              style={{ 
                WebkitTouchCallout: 'none',
                WebkitUserSelect: 'none',
                userSelect: 'none'
              }}
            >
              {children as any}
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
}
