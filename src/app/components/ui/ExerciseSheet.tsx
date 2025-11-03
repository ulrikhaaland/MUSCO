import React, { useEffect, useRef, useState } from 'react';
import { Exercise } from '@/app/types/program';
import { PlayIcon, SpinnerIcon } from '../icons';
import { useTranslation } from '@/app/i18n/TranslationContext';

interface ExerciseSheetProps {
  exercise: Exercise;
  onClose: () => void;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideo?: boolean;
}

/**
 * Full-page bottom sheet for mobile exercise details
 * Supports swipe-down-to-dismiss gesture
 */
export function ExerciseSheet({
  exercise,
  onClose,
  onVideoClick,
  loadingVideo = false,
}: ExerciseSheetProps) {
  const { t } = useTranslation();
  const sheetRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  // Handle touch start
  const handleTouchStart = (e: React.TouchEvent) => {
    // Only allow dragging if scrolled to top
    if (contentRef.current && contentRef.current.scrollTop === 0) {
      setIsDragging(true);
      setStartY(e.touches[0].clientY);
      setCurrentY(e.touches[0].clientY);
    }
  };

  // Handle touch move
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaY = e.touches[0].clientY - startY;
    
    // Only allow dragging down, not up
    if (deltaY > 0) {
      setCurrentY(e.touches[0].clientY);
      setTranslateY(deltaY);
    }
  };

  // Handle touch end
  const handleTouchEnd = () => {
    if (!isDragging) return;

    setIsDragging(false);
    const deltaY = currentY - startY;

    // If dragged down more than 150px, close the sheet
    if (deltaY > 150) {
      onClose();
    } else {
      // Reset position
      setTranslateY(0);
    }
  };

  // Reset scroll on open
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [exercise]);

  return (
    <div 
      className="fixed inset-0 z-[80] bg-black/60 flex items-end"
      onClick={onClose}
    >
      <div
        ref={sheetRef}
        className="relative w-full bg-gray-900 rounded-t-2xl flex flex-col max-h-[95vh] transition-transform"
        style={{
          transform: `translateY(${translateY}px)`,
          transition: isDragging ? 'none' : 'transform 0.3s ease-out',
        }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Handle bar and header */}
        <div className="sticky top-0 bg-gray-900 z-10 rounded-t-2xl">
          {/* Drag handle */}
          <div className="w-full flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-4 pb-3 flex items-start justify-between gap-3 border-b border-gray-800">
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base mb-1">{exercise.name}</h3>
              {exercise.bodyPart && (
                <span className="inline-block px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 text-xs border border-indigo-500/40">
                  {exercise.bodyPart}
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors p-1 flex-shrink-0"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div 
          ref={contentRef}
          className="flex-1 overflow-y-auto overscroll-contain"
        >
          <div className="p-4 space-y-4 pb-24">
            {/* Metrics */}
            <div className="flex flex-wrap gap-2">
              {exercise.sets && exercise.repetitions && (
                <span className="px-3 py-1.5 rounded bg-indigo-600/20 text-indigo-200 text-sm">
                  {exercise.sets} × {exercise.repetitions}
                </span>
              )}
              {exercise.duration && (
                <span className="px-3 py-1.5 rounded bg-indigo-600/20 text-indigo-200 text-sm">
                  {exercise.duration >= 60 
                    ? `${Math.floor(exercise.duration / 60)} min` 
                    : `${exercise.duration}s`}
                </span>
              )}
              {exercise.difficulty && (
                <span className="px-3 py-1.5 rounded bg-gray-800 text-gray-300 text-sm capitalize">
                  {exercise.difficulty}
                </span>
              )}
              {exercise.restBetweenSets && exercise.restBetweenSets !== 0 && (
                <span className="px-3 py-1.5 rounded bg-gray-800 text-gray-300 text-sm">
                  {t('program.rest', { seconds: exercise.restBetweenSets.toString() })}
                </span>
              )}
              {exercise.equipment && exercise.equipment.length > 0 && (
                <>
                  {exercise.equipment.map((eq, idx) => (
                    <span key={idx} className="px-3 py-1.5 rounded bg-amber-600/20 text-amber-300 text-sm border border-amber-500/30">
                      {eq}
                    </span>
                  ))}
                </>
              )}
            </div>

            {/* Description */}
            {exercise.description && (
              <div>
                <h4 className="text-indigo-300 font-medium mb-2 text-sm">Description</h4>
                <p className="text-gray-300 leading-relaxed text-sm">{exercise.description}</p>
              </div>
            )}

            {/* Steps */}
            {exercise.steps && exercise.steps.length > 0 && (
              <div>
                <h4 className="text-indigo-300 font-medium mb-2 text-sm">Instructions</h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  {exercise.steps.map((step, idx) => (
                    <div key={idx} className="leading-relaxed">{idx + 1}. {step}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Tips */}
            {exercise.tips && exercise.tips.length > 0 && (
              <div>
                <h4 className="text-yellow-300 font-medium mb-2 text-sm">Tips</h4>
                <div className="space-y-2 text-gray-300 text-sm">
                  {exercise.tips.map((tip, idx) => (
                    <div key={idx} className="leading-relaxed">• {tip}</div>
                  ))}
                </div>
              </div>
            )}

            {/* Modification */}
            {exercise.modification && (
              <div>
                <h4 className="text-yellow-300 font-medium mb-2 text-sm">{t('program.modification')}</h4>
                <p className="text-yellow-200/90 leading-relaxed text-sm">{exercise.modification}</p>
              </div>
            )}

            {/* Precaution */}
            {exercise.precaution && (
              <div>
                <h4 className="text-red-400 font-medium mb-2 text-sm">{t('program.precaution')}</h4>
                <p className="text-red-400/90 leading-relaxed text-sm">{exercise.precaution}</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Fixed Footer - Video Button */}
        {exercise.videoUrl && (
          <div className="sticky bottom-0 border-t border-gray-800 p-4 bg-gray-900">
            <button
              onClick={() => onVideoClick(exercise)}
              disabled={loadingVideo}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-3.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingVideo ? (
                <SpinnerIcon size="md" />
              ) : (
                <PlayIcon size="md" />
              )}
              <span>{t('program.watchVideo')}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

