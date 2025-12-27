/**
 * Service for incremental program generation.
 * 
 * Flow:
 * 1. Generate metadata first (title, overview, etc.)
 * 2. Generate days 1-7 one at a time
 */

import { DiagnosisAssistantResponse } from '../types';
import { ExerciseQuestionnaireAnswers } from '../../../shared/types';
import { ExerciseProgram, ProgramDay } from '../types/program';
import {
  PartialProgram,
  ProgramMetadataResponse,
} from '../types/incremental-program';
import { getSavedLocalePreference } from '../i18n/utils';
import { Locale } from '../i18n/translations';

export interface IncrementalProgramCallbacks {
  onMetadataReady?: (partialProgram: PartialProgram) => void | Promise<void>;
  onDayGenerated?: (day: ProgramDay, dayNumber: number, partialProgram: PartialProgram) => void | Promise<void>;
  onComplete?: (program: ExerciseProgram) => void | Promise<void>;
  onError?: (error: Error, partialProgram: PartialProgram | null) => void;
}

/**
 * Generate a program incrementally, calling callbacks as each day is generated.
 */
export async function generateProgramIncrementally(
  diagnosisData: DiagnosisAssistantResponse,
  userInfo: ExerciseQuestionnaireAnswers,
  callbacks: IncrementalProgramCallbacks,
  options?: {
    userId?: string;
    programId?: string;
    abortSignal?: AbortSignal;
  }
): Promise<ExerciseProgram | null> {
  const language: Locale = typeof window !== 'undefined' ? getSavedLocalePreference() : 'en';
  const { userId, programId, abortSignal } = options || {};

  try {
    // Phase 1: Generate metadata only
    const metadataResponse = await fetch('/api/programs/generate-incremental', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'generate_metadata',
        diagnosisData,
        userInfo,
        userId,
        programId,
        language,
      }),
      signal: abortSignal,
    });

    if (!metadataResponse.ok) {
      const errorData = await metadataResponse.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate program metadata');
    }

    const metadataResult = (await metadataResponse.json()).data as ProgramMetadataResponse;

    // Create initial partial program with metadata only (no days yet)
    let partialProgram: PartialProgram = {
      title: metadataResult.title,
      programOverview: metadataResult.programOverview,
      summary: metadataResult.summary,
      whatNotToDo: metadataResult.whatNotToDo,
      afterTimeFrame: metadataResult.afterTimeFrame,
      targetAreas: userInfo.targetAreas,
      bodyParts: userInfo.targetAreas,
      createdAt: new Date(),
      days: [],
      generatingDay: 1,
      isComplete: false,
    };

    // Notify that metadata is ready
    await callbacks.onMetadataReady?.(partialProgram);

    // Phase 2: Generate days 1-7 sequentially
    const programMeta = {
      title: metadataResult.title,
      programOverview: metadataResult.programOverview,
      weeklyPlan: (metadataResult as any).weeklyPlan || [],
    };

    for (let dayNum = 1; dayNum <= 7; dayNum++) {
      // Check for abort
      if (abortSignal?.aborted) {
        return null;
      }

      const dayResponse = await fetch('/api/programs/generate-incremental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_day',
          dayNumber: dayNum,
          diagnosisData,
          userInfo,
          previousDays: partialProgram.days,
          programMetadata: programMeta,
          userId,
          programId,
          language,
        }),
        signal: abortSignal,
      });

      if (!dayResponse.ok) {
        const errorData = await dayResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate day ${dayNum}`);
      }

      const dayResult = (await dayResponse.json()).data as ProgramDay;

      // Update partial program
      partialProgram = {
        ...partialProgram,
        days: [...partialProgram.days, dayResult],
        generatingDay: dayNum < 7 ? dayNum + 1 : null,
        isComplete: dayNum === 7,
      };

      // Notify day generated
      await callbacks.onDayGenerated?.(dayResult, dayNum, partialProgram);
    }

    // Build final program
    const finalProgram: ExerciseProgram = {
      title: partialProgram.title,
      programOverview: partialProgram.programOverview,
      summary: partialProgram.summary,
      timeFrameExplanation: '',
      whatNotToDo: partialProgram.whatNotToDo,
      afterTimeFrame: partialProgram.afterTimeFrame,
      targetAreas: partialProgram.targetAreas,
      bodyParts: partialProgram.bodyParts,
      createdAt: partialProgram.createdAt,
      days: partialProgram.days,
    };

    await callbacks.onComplete?.(finalProgram);
    return finalProgram;
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error during generation');
    console.error('[incremental] Generation error:', err);
    callbacks.onError?.(err, null);
    return null;
  }
}

/**
 * Convert a PartialProgram to an ExerciseProgram (for display purposes)
 * Missing days will have placeholder data (empty exercises = shimmer)
 */
export function partialToDisplayProgram(partial: PartialProgram): ExerciseProgram {
  // Build complete 7-day array with placeholders for missing days
  const allDays: ProgramDay[] = [];
  
  for (let dayNum = 1; dayNum <= 7; dayNum++) {
    const existingDay = partial.days.find((d) => d.day === dayNum);
    if (existingDay) {
      allDays.push(existingDay);
    } else {
      // Create placeholder - will show shimmer
      allDays.push({
        day: dayNum,
        description: '',
        dayType: 'strength',
        exercises: [], // Empty - will show shimmer
        duration: 0,
      });
    }
  }

  return {
    title: partial.title,
    programOverview: partial.programOverview,
    summary: partial.summary,
    timeFrameExplanation: '',
    whatNotToDo: partial.whatNotToDo,
    afterTimeFrame: partial.afterTimeFrame,
    targetAreas: partial.targetAreas,
    bodyParts: partial.bodyParts,
    createdAt: partial.createdAt,
    days: allDays,
  };
}
