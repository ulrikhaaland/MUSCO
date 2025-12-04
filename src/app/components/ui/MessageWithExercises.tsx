import React, { useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import { Exercise } from '@/app/types/program';
import { extractExerciseMarkers } from '@/app/utils/exerciseMarkerParser';
import { extractBodyPartMarkers, findBodyPartByName, findGroupByName } from '@/app/utils/bodyPartMarkerParser';
import { ExerciseDetailModal } from './ExerciseDetailModal';
import { AnatomyPart } from '@/app/types/human';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { useTranslation } from '@/app/i18n';
import { translateBodyPartGroupName, translateAnatomyPart } from '@/app/utils/bodyPartTranslation';

// Touch tracking for distinguishing taps from scrolls
const SCROLL_THRESHOLD = 10; // px - movement beyond this is a scroll, not a tap

// Color schemes for badges - must use full class names for Tailwind
const BADGE_COLORS = {
  indigo: {
    base: 'bg-indigo-600/30 border-indigo-500/40',
    hover: 'hover:bg-indigo-600/50 hover:border-indigo-400',
    active: 'active:bg-indigo-600/70',
  },
  emerald: {
    base: 'bg-emerald-600/30 border-emerald-500/40',
    hover: 'hover:bg-emerald-600/50 hover:border-emerald-400',
    active: 'active:bg-emerald-600/70',
  },
  cyan: {
    base: 'bg-cyan-600/30 border-cyan-500/40',
    hover: 'hover:bg-cyan-600/50 hover:border-cyan-400',
    active: 'active:bg-cyan-600/70',
  },
} as const;

type BadgeColor = keyof typeof BADGE_COLORS;

/**
 * Clickable badge that distinguishes between taps and scrolls on mobile
 */
function ClickableBadge({
  children,
  onClick,
  color,
  ariaLabel,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  color: BadgeColor;
  ariaLabel?: string;
}) {
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartRef.current || !onClick) return;
    
    const touch = e.changedTouches[0];
    const dx = Math.abs(touch.clientX - touchStartRef.current.x);
    const dy = Math.abs(touch.clientY - touchStartRef.current.y);
    
    // Only trigger click if finger didn't move much (it's a tap, not a scroll)
    if (dx < SCROLL_THRESHOLD && dy < SCROLL_THRESHOLD) {
      e.preventDefault();
      e.stopPropagation();
      onClick();
    }
    
    touchStartRef.current = null;
  }, [onClick]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onClick) return;
    e.preventDefault();
    e.stopPropagation();
    onClick();
  }, [onClick]);

  const colorScheme = BADGE_COLORS[color];

  return (
    <span 
      className={`not-italic px-1.5 py-0.5 rounded ${colorScheme.base} text-white font-medium border select-none ${onClick ? `cursor-pointer ${colorScheme.hover} ${colorScheme.active}` : ''} transition-colors`}
      onMouseDown={onClick ? handleMouseDown : undefined}
      onTouchStart={onClick ? handleTouchStart : undefined}
      onTouchEnd={onClick ? handleTouchEnd : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      aria-label={ariaLabel}
      style={{ 
        WebkitTouchCallout: 'none',
        WebkitUserSelect: 'none',
        userSelect: 'none'
      }}
    >
      {children}
    </span>
  );
}

interface MessageWithExercisesProps {
  content: string;
  exercises: Map<string, Exercise>;
  onVideoClick?: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
  className?: string;
  selectedExercise?: Exercise | null;
  onExerciseSelect?: (exercise: Exercise | null) => void;
  // Body part click handler - part and group looked up from bodyPartGroups by name
  onBodyPartClick?: (part: AnatomyPart, group: BodyPartGroup) => void;
  // Group click handler - selects just the group
  onGroupClick?: (group: BodyPartGroup) => void;
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
  onBodyPartClick,
  onGroupClick,
}: MessageWithExercisesProps) {
  const { t } = useTranslation();
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
          
            // Render as clickable badge for exercises in database
            return (
              <ClickableBadge
                color="indigo"
                onClick={() => onExerciseSelect?.(exercise)}
                ariaLabel={`View ${exercise.name} details`}
              >
                {exercise.name}
              </ClickableBadge>
            );
          }
          
          // Check if this is a body part marker (could be a group or specific part)
          if (rawText.startsWith('bodypart:')) {
            const markerName = rawText.substring('bodypart:'.length);
            
            // First check if it's a group name
            const matchedGroup = findGroupByName(markerName);
            if (matchedGroup) {
              const translatedGroupName = translateBodyPartGroupName(matchedGroup, t);
              // Render as group badge (cyan/teal color to differentiate from body parts)
              return (
                <ClickableBadge
                  color="cyan"
                  onClick={onGroupClick ? () => onGroupClick(matchedGroup) : undefined}
                  ariaLabel={onGroupClick ? `Select ${translatedGroupName} region on model` : undefined}
                >
                  {translatedGroupName}
                </ClickableBadge>
              );
            }
            
            // Then check if it's a specific body part
            const result = findBodyPartByName(markerName);
            
            // If body part not found, render as plain text
            if (!result || !onBodyPartClick) {
              return <span>{markerName}</span>;
            }
            
            const { part, group } = result;
            const translatedPartName = translateAnatomyPart(part, t);
            
            // Render as clickable badge for body parts (emerald color)
            return (
              <ClickableBadge
                color="emerald"
                onClick={() => onBodyPartClick(part, group)}
                ariaLabel={`Select ${translatedPartName} on model`}
              >
                {translatedPartName}
              </ClickableBadge>
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
