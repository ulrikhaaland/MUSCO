import React, { useState } from 'react';
import { Exercise } from '@/app/types/program';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { PlayIcon, SpinnerIcon, ChevronDown } from '../icons';
import { formatMinutes } from '@/app/utils/timeUtils';

interface ExerciseChatCardProps {
  exercise: Exercise;
  onVideoClick: (exercise: Exercise) => void;
  loadingVideoExercise?: string | null;
}

/**
 * Compact exercise card optimized for inline chat display
 * Reuses core logic from ExerciseCard but with minimal UI footprint
 */
export default function ExerciseChatCard({
  exercise,
  onVideoClick,
  loadingVideoExercise = null,
}: ExerciseChatCardProps) {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const exerciseIdentifier = exercise.name || exercise.id || exercise.exerciseId;
  const isLoadingVideo = loadingVideoExercise === exerciseIdentifier;

  return (
    <div className="rounded-lg bg-gray-800/60 border border-indigo-500/30 overflow-hidden my-2 max-w-md">
      {/* Header - always visible */}
      <div 
        className="p-3 cursor-pointer hover:bg-gray-800/80 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Desktop Layout: horizontal */}
        <div className="hidden sm:flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="text-white font-medium text-sm mb-1 truncate">
              {exercise.name}
            </h4>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Metrics chips */}
              {exercise.duration ? (
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-200">
                  {formatMinutes(exercise.duration)}
                </span>
              ) : (
                exercise.sets && exercise.repetitions && (
                  <span className="text-xs px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-200">
                    {exercise.sets} × {exercise.repetitions}
                  </span>
                )
              )}
              {exercise.bodyPart && (
                <span className="text-xs px-2 py-0.5 rounded border border-indigo-500/40 text-indigo-300">
                  {exercise.bodyPart}
                </span>
              )}
            </div>
          </div>
          
          {/* Video button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVideoClick(exercise);
            }}
            className="flex-shrink-0 flex items-center gap-1 bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg text-xs transition-colors"
          >
            {isLoadingVideo ? (
              <SpinnerIcon size="sm" />
            ) : (
              <PlayIcon size="sm" />
            )}
            <span>{t('program.watchVideo')}</span>
          </button>
          
          {/* Expand indicator */}
          <ChevronDown 
            className="flex-shrink-0 text-gray-400 transition-transform" 
            isRotated={isExpanded}
          />
        </div>

        {/* Mobile Layout: stacked */}
        <div className="sm:hidden space-y-2">
          {/* Title and expand indicator */}
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-white font-medium text-sm flex-1">
              {exercise.name}
            </h4>
            <ChevronDown 
              className="flex-shrink-0 text-gray-400 transition-transform mt-0.5" 
              isRotated={isExpanded}
            />
          </div>

          {/* Metrics chips */}
          <div className="flex items-center gap-2 flex-wrap">
            {exercise.duration ? (
              <span className="text-xs px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-200">
                {formatMinutes(exercise.duration)}
              </span>
            ) : (
              exercise.sets && exercise.repetitions && (
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-600/30 text-indigo-200">
                  {exercise.sets} × {exercise.repetitions}
                </span>
              )
            )}
            {exercise.bodyPart && (
              <span className="text-xs px-2 py-0.5 rounded border border-indigo-500/40 text-indigo-300">
                {exercise.bodyPart}
              </span>
            )}
          </div>

          {/* Video button - full width on mobile */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVideoClick(exercise);
            }}
            className="w-full flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
          >
            {isLoadingVideo ? (
              <SpinnerIcon size="sm" />
            ) : (
              <PlayIcon size="sm" />
            )}
            <span>{t('program.watchVideo')}</span>
          </button>
        </div>
      </div>

      {/* Expandable details */}
      {isExpanded && (
        <div className="px-3 pb-3 border-t border-gray-700/50 pt-3 space-y-2">
          {/* Description */}
          {exercise.description && (
            <p className="text-gray-300 text-xs leading-relaxed">
              {exercise.description}
            </p>
          )}

          {/* Steps */}
          {exercise.steps && exercise.steps.length > 0 && (
            <div className="text-xs">
              <p className="text-indigo-300 font-medium mb-1">
                {t('program.viewInstructions')}:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-gray-300">
                {exercise.steps.slice(0, 3).map((step, idx) => (
                  <li key={idx} className="leading-snug">{step}</li>
                ))}
                {exercise.steps.length > 3 && (
                  <li className="text-gray-400 italic">
                    +{exercise.steps.length - 3} {t('program.moreSteps', { defaultValue: 'more steps' })}
                  </li>
                )}
              </ol>
            </div>
          )}

          {/* Tips */}
          {exercise.tips && exercise.tips.length > 0 && (
            <div className="text-xs">
              <p className="text-yellow-300 font-medium mb-1">
                {t('program.tips', { defaultValue: 'Tips' })}:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-300">
                {exercise.tips.slice(0, 2).map((tip, idx) => (
                  <li key={idx} className="leading-snug">{tip}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Precaution */}
          {exercise.precaution && (
            <p className="text-red-400/90 text-xs leading-relaxed">
              <span className="font-medium">{t('program.precaution')}:</span>{' '}
              {exercise.precaution}
            </p>
          )}
        </div>
      )}
    </div>
  );
}




