import React from 'react';
import { ExerciseProgram, UserProgram } from '@/app/types/program';
import { useTranslation } from '@/app/i18n/TranslationContext';
import { getWeekNumber } from '@/app/utils/dateutils';
import { ChevronDown } from '../icons';

interface WeekOverviewProps {
  program: ExerciseProgram;
  selectedWeek: number;
  hasMultipleWeeks: boolean;
  activeProgram?: UserProgram & { docId: string };
  timeFrame?: string;
  isExpanded: boolean;
  onToggle: () => void;
  isGenerating?: boolean;
}

export function WeekOverview({
  program,
  selectedWeek,
  hasMultipleWeeks,
  activeProgram,
  timeFrame,
  isExpanded,
  onToggle,
  isGenerating = false
}: WeekOverviewProps) {
  const { t } = useTranslation();
  const currentDate = new Date();

  const getDisplayWeekNumber = () => {
    // Calculate the actual ISO week number for the selected week
    if (hasMultipleWeeks && activeProgram?.programs) {
      const weekProgram = activeProgram.programs[selectedWeek - 1];
      return weekProgram?.createdAt ? getWeekNumber(new Date(weekProgram.createdAt)) : selectedWeek;
    } else if (program.createdAt) {
      const programStart = new Date(program.createdAt);
      const weekDate = new Date(programStart);
      weekDate.setDate(programStart.getDate() + ((selectedWeek - 1) * 7));
      return getWeekNumber(weekDate);
    }
    return getWeekNumber(currentDate);
  };

  return (
    <div className="mb-4">
      {/* Collapsed Snapshot Bar */}
      {!isExpanded && (
        <div 
          className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 border-l-4 border-indigo-600 cursor-pointer hover:bg-gray-700/50 transition-colors"
          onClick={onToggle}
        >
          <div className="p-6">
            {/* Row 1: Title and Dropdown Button */}
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <span className="w-3 h-3 rounded-full bg-indigo-600 mr-3"></span>
                {t('exerciseProgram.weekFocus')}
              </h3>
              <ChevronDown 
                className="text-gray-400" 
                size="lg"
                isRotated={isExpanded}
              />
            </div>
            {/* Row 2: Summary */}
            <div className="text-gray-300 text-sm">
              {isGenerating && !program.summary ? (
                <div className="space-y-2">
                  <div className="shimmer h-3 w-3/4 bg-gray-700 rounded" />
                  <div className="shimmer h-3 w-1/2 bg-gray-700 rounded" />
                </div>
              ) : (
                program.summary || t('exerciseProgram.weekFocus.summaryFallback')
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expanded Chunked View */}
      {isExpanded && (
        <div 
          className="bg-gray-800/50 rounded-xl overflow-hidden ring-1 ring-gray-700/50 border-l-4 border-indigo-600 cursor-pointer"
          onClick={onToggle}
        >
          <div className="p-6 space-y-6">
            {/* Header with close button */}
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <span className="w-3 h-3 rounded-full bg-indigo-600 mr-3"></span>
                {t('exerciseProgram.weekFocus')}
              </h3>
              <ChevronDown 
                className="text-gray-400" 
                size="lg"
                isRotated={isExpanded}
              />
            </div>
            
            {/* 🎯 Objective */}
            {(program.programOverview || isGenerating) && (
              <div>
                <h4 className="flex items-center text-md font-semibold text-white mb-3">
                  <svg className="w-5 h-5 mr-2 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  {t('exerciseProgram.overview.objective')}
                </h4>
                {isGenerating && !program.programOverview ? (
                  <div className="space-y-2">
                    <div className="shimmer h-4 w-full bg-gray-700 rounded" />
                    <div className="shimmer h-4 w-5/6 bg-gray-700 rounded" />
                    <div className="shimmer h-4 w-3/4 bg-gray-700 rounded" />
                  </div>
                ) : (
                  <p className="text-gray-300 leading-relaxed">
                    {program.programOverview}
                  </p>
                )}
              </div>
            )}

            {/* 🏋️ Key Moves */}
            {timeFrame && program.timeFrameExplanation && (
              <div>
                <h4 className="flex items-center text-md font-semibold text-white mb-3">
                  <svg className="w-5 h-5 mr-2 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  {t('exerciseProgram.overview.keyMoves')}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {program.timeFrameExplanation}
                </p>
              </div>
            )}

            {/* ⚠️ Avoid */}
            {program.whatNotToDo && (
              <div>
                <h4 className="flex items-center text-md font-semibold text-white mb-3">
                  <svg className="w-5 h-5 mr-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                                     {t('exerciseProgram.overview.whatNotToDo')}
                </h4>
                <p className="text-red-400 leading-relaxed">
                  {program.whatNotToDo}
                </p>
              </div>
            )}

            {/* ✅ Outcome */}
            {program.afterTimeFrame?.expectedOutcome && (
              <div>
                <h4 className="flex items-center text-md font-semibold text-white mb-3">
                  <svg className="w-5 h-5 mr-2 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {t('exerciseProgram.overview.expectedOutcome')}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {program.afterTimeFrame.expectedOutcome}
                </p>
              </div>
            )}

            {/* » Next Steps */}
            {program.afterTimeFrame?.nextSteps && (
              <div>
                <h4 className="flex items-center text-md font-semibold text-white mb-3">
                  <svg className="w-5 h-5 mr-2 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  </svg>
                  {t('exerciseProgram.overview.nextSteps')}
                </h4>
                <p className="text-gray-300 leading-relaxed">
                  {program.afterTimeFrame.nextSteps}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 