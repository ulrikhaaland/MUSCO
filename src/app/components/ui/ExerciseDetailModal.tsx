import React from 'react';
import { Exercise } from '@/app/types/program';
import { PlayIcon, SpinnerIcon } from '../icons';
import { useTranslation } from '@/app/i18n/TranslationContext';

interface ExerciseDetailModalProps {
  exercise: Exercise;
  onClose: () => void;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideo?: boolean;
}

/**
 * Full-screen modal showing exercise details
 */
export function ExerciseDetailModal({
  exercise,
  onClose,
  onVideoClick,
  loadingVideo = false,
}: ExerciseDetailModalProps) {
  const { t } = useTranslation();

  return (
    <div 
      className="fixed inset-0 z-[80] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-gray-800 rounded-xl border border-indigo-500/30"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-4 flex items-start justify-between">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-lg">{exercise.name}</h3>
            {exercise.bodyPart && (
              <span className="inline-block mt-1 px-2 py-0.5 rounded bg-indigo-600/20 text-indigo-300 text-xs border border-indigo-500/40">
                {exercise.bodyPart}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Metrics */}
          <div className="flex flex-wrap gap-2">
            {exercise.sets && exercise.repetitions && (
              <span className="px-3 py-1 rounded bg-indigo-600/20 text-indigo-200 text-sm">
                {exercise.sets} × {exercise.repetitions}
              </span>
            )}
            {exercise.duration && (
              <span className="px-3 py-1 rounded bg-indigo-600/20 text-indigo-200 text-sm">
                {exercise.duration >= 60 
                  ? `${Math.floor(exercise.duration / 60)} min` 
                  : `${exercise.duration}s`}
              </span>
            )}
            {exercise.difficulty && (
              <span className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm capitalize">
                {exercise.difficulty}
              </span>
            )}
            {exercise.restBetweenSets && exercise.restBetweenSets !== 0 && (
              <span className="px-3 py-1 rounded bg-gray-700 text-gray-300 text-sm">
                {t('program.rest', { seconds: exercise.restBetweenSets.toString() })}
              </span>
            )}
            {exercise.equipment && exercise.equipment.length > 0 && (
              <>
                {exercise.equipment.map((eq, idx) => (
                  <span key={idx} className="px-3 py-1 rounded bg-amber-600/20 text-amber-300 text-sm border border-amber-500/30">
                    {eq}
                  </span>
                ))}
              </>
            )}
          </div>

          {/* Description */}
          {exercise.description && (
            <div>
              <h4 className="text-indigo-300 font-medium mb-2">Description</h4>
              <p className="text-gray-300 leading-relaxed">{exercise.description}</p>
            </div>
          )}

          {/* Steps */}
          {exercise.steps && exercise.steps.length > 0 && (
            <div>
              <h4 className="text-indigo-300 font-medium mb-2">Instructions</h4>
              <div className="space-y-2 text-gray-300">
                {exercise.steps.map((step, idx) => (
                  <div key={idx} className="leading-relaxed">{idx + 1}. {step}</div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div>
              <h4 className="text-yellow-300 font-medium mb-2">Tips</h4>
              <div className="space-y-2 text-gray-300">
                {exercise.tips.map((tip, idx) => (
                  <div key={idx} className="leading-relaxed">• {tip}</div>
                ))}
              </div>
            </div>
          )}

          {/* Modification */}
          {exercise.modification && (
            <div>
              <h4 className="text-yellow-300 font-medium mb-2">{t('program.modification')}</h4>
              <p className="text-yellow-200/90 leading-relaxed">{exercise.modification}</p>
            </div>
          )}

          {/* Precaution */}
          {exercise.precaution && (
            <div>
              <h4 className="text-red-400 font-medium mb-2">{t('program.precaution')}</h4>
              <p className="text-red-400/90 leading-relaxed">{exercise.precaution}</p>
            </div>
          )}
        </div>
        
        {/* Fixed Footer - Video Button */}
        {exercise.videoUrl && (
          <div className="border-t border-gray-700 p-4 bg-gray-800">
            <button
              onClick={() => onVideoClick(exercise)}
              disabled={loadingVideo}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-3 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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

