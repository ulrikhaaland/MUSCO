import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
 * Full-screen mobile exercise details view
 * Rendered via portal to overlay chat interface
 */
export function ExerciseSheet({
  exercise,
  onClose,
  onVideoClick,
  loadingVideo = false,
}: ExerciseSheetProps) {
  const { t } = useTranslation();
  const contentRef = useRef<HTMLDivElement>(null);

  // Reset scroll on open
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  }, [exercise]);

  // Prevent body scroll when sheet is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const sheetContent = (
    <div className="fixed inset-0 z-[90] bg-gray-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 bg-gray-900 z-10 border-b border-gray-800">
        <div className="px-4 py-4 flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-semibold text-lg mb-1">{exercise.name}</h3>
            {exercise.bodyPart && (
              <span className="inline-block px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 text-xs border border-indigo-500/40">
                {exercise.bodyPart}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white active:text-white transition-colors p-2 -m-1 flex-shrink-0 touch-manipulation"
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
        style={{ WebkitOverflowScrolling: 'touch' }}
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
      </div>
        
      {/* Fixed Footer - Video Button and Close */}
      <div className="sticky bottom-0 border-t border-gray-800 p-4 bg-gray-900">
        {exercise.videoUrl ? (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onVideoClick(exercise)}
              disabled={loadingVideo}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-4 py-3.5 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingVideo ? (
                <SpinnerIcon size="md" />
              ) : (
                <PlayIcon size="md" />
              )}
              <span>{t('program.watchVideo')}</span>
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center p-3.5 rounded-lg bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white transition-colors touch-manipulation"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 p-3.5 rounded-lg bg-gray-800 hover:bg-gray-700 active:bg-gray-600 text-white transition-colors font-medium touch-manipulation"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <span>Close</span>
          </button>
        )}
      </div>
    </div>
  );

  // Render in portal to escape chat overlay DOM hierarchy
  if (typeof window === 'undefined') return null;
  return createPortal(sheetContent, document.body);
}

