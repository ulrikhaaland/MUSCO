import { useState, useCallback, useRef } from 'react';
import { DiagnosisAssistantResponse } from '../types';
import { ExerciseQuestionnaireAnswers } from '../../../shared/types';
import { ExerciseProgram, ProgramDay } from '../types/program';
import {
  PartialProgram,
  ProgramMetadataResponse,
  IncrementalProgramStatus,
  IncrementalGenerationState,
} from '../types/incremental-program';
import { getSavedLocalePreference } from '../i18n/utils';

interface UseIncrementalProgramGenerationProps {
  userId?: string;
  programId?: string;
  onMetadataReady?: (metadata: ProgramMetadataResponse) => void;
  onDayGenerated?: (day: ProgramDay, dayNumber: number) => void;
  onComplete?: (program: ExerciseProgram) => void;
  onError?: (error: Error) => void;
}

interface GenerationContext {
  diagnosisData: DiagnosisAssistantResponse;
  userInfo: ExerciseQuestionnaireAnswers;
}

export function useIncrementalProgramGeneration({
  userId,
  programId,
  onMetadataReady,
  onDayGenerated,
  onComplete,
  onError,
}: UseIncrementalProgramGenerationProps = {}) {
  const [state, setState] = useState<IncrementalGenerationState>({
    status: IncrementalProgramStatus.Idle,
    currentDay: 0,
    partialProgram: null,
    error: null,
  });

  // Keep track of generation context
  const contextRef = useRef<GenerationContext | null>(null);
  const abortRef = useRef<boolean>(false);

  /**
   * Generate program metadata only
   */
  const generateMetadata = useCallback(
    async (
      diagnosisData: DiagnosisAssistantResponse,
      userInfo: ExerciseQuestionnaireAnswers
    ): Promise<ProgramMetadataResponse | null> => {
      const language = typeof window !== 'undefined' ? getSavedLocalePreference() : 'en';

      const response = await fetch('/api/programs/generate-incremental', {
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
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to generate program metadata');
      }

      const result = await response.json();
      return result.data as ProgramMetadataResponse;
    },
    [userId, programId]
  );

  /**
   * Generate a single day (1-7)
   */
  const generateDay = useCallback(
    async (
      dayNumber: number,
      previousDays: ProgramDay[],
      programMetadata: { title: string; programOverview: string }
    ): Promise<ProgramDay | null> => {
      if (!contextRef.current) {
        throw new Error('Generation context not set');
      }

      const language = typeof window !== 'undefined' ? getSavedLocalePreference() : 'en';

      const response = await fetch('/api/programs/generate-incremental', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_day',
          dayNumber,
          diagnosisData: contextRef.current.diagnosisData,
          userInfo: contextRef.current.userInfo,
          previousDays,
          programMetadata,
          userId,
          programId,
          language,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate day ${dayNumber}`);
      }

      const result = await response.json();
      return result.data as ProgramDay;
    },
    [userId, programId]
  );

  /**
   * Start the incremental generation process
   */
  const startGeneration = useCallback(
    async (
      diagnosisData: DiagnosisAssistantResponse,
      userInfo: ExerciseQuestionnaireAnswers
    ) => {
      // Reset abort flag
      abortRef.current = false;

      // Store context for subsequent day generation
      contextRef.current = { diagnosisData, userInfo };

      try {
        // Phase 1: Generate metadata only
        setState({
          status: IncrementalProgramStatus.GeneratingMetadata,
          currentDay: 0,
          partialProgram: null,
          error: null,
        });

        const metadataResult = await generateMetadata(diagnosisData, userInfo);
        if (!metadataResult || abortRef.current) return;

        // Notify metadata ready
        onMetadataReady?.(metadataResult);

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

        setState({
          status: IncrementalProgramStatus.GeneratingDay,
          currentDay: 0,
          partialProgram,
          error: null,
        });

        // Phase 2: Generate days 1-7 sequentially
        let currentDays: ProgramDay[] = [];
        const programMeta = {
          title: metadataResult.title,
          programOverview: metadataResult.programOverview,
        };

        for (let dayNum = 1; dayNum <= 7; dayNum++) {
          if (abortRef.current) break;

          // Update state to show we're generating this day
          setState((prev) => ({
            ...prev,
            currentDay: dayNum - 1, // Previous day is complete
            partialProgram: prev.partialProgram
              ? { ...prev.partialProgram, generatingDay: dayNum }
              : null,
          }));

          // Generate the day
          const dayResult = await generateDay(dayNum, currentDays, programMeta);

          if (!dayResult || abortRef.current) break;

          // Update state with new day
          currentDays = [...currentDays, dayResult];

          setState((prev) => ({
            ...prev,
            currentDay: dayNum,
            partialProgram: prev.partialProgram
              ? {
                  ...prev.partialProgram,
                  days: currentDays,
                  generatingDay: dayNum < 7 ? dayNum + 1 : null,
                  isComplete: dayNum === 7,
                }
              : null,
          }));

          // Notify day generated
          onDayGenerated?.(dayResult, dayNum);
        }

        // All days generated - build final program
        if (!abortRef.current && currentDays.length === 7) {
          const finalProgram: ExerciseProgram = {
            title: metadataResult.title,
            programOverview: metadataResult.programOverview,
            summary: metadataResult.summary,
            timeFrameExplanation: '',
            whatNotToDo: metadataResult.whatNotToDo,
            afterTimeFrame: metadataResult.afterTimeFrame,
            targetAreas: userInfo.targetAreas,
            bodyParts: userInfo.targetAreas,
            createdAt: new Date(),
            days: currentDays,
          };

          setState({
            status: IncrementalProgramStatus.Complete,
            currentDay: 7,
            partialProgram: {
              ...finalProgram,
              generatingDay: null,
              isComplete: true,
            } as PartialProgram,
            error: null,
          });

          onComplete?.(finalProgram);
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error('Unknown error');
        console.error('[incremental] Generation error:', err);
        
        setState((prev) => ({
          ...prev,
          status: IncrementalProgramStatus.Error,
          error: err.message,
        }));

        onError?.(err);
      }
    },
    [generateMetadata, generateDay, onMetadataReady, onDayGenerated, onComplete, onError]
  );

  /**
   * Abort the current generation
   */
  const abort = useCallback(() => {
    abortRef.current = true;
    setState((prev) => ({
      ...prev,
      status: IncrementalProgramStatus.Idle,
    }));
  }, []);

  /**
   * Reset the generation state
   */
  const reset = useCallback(() => {
    abortRef.current = true;
    contextRef.current = null;
    setState({
      status: IncrementalProgramStatus.Idle,
      currentDay: 0,
      partialProgram: null,
      error: null,
    });
  }, []);

  return {
    state,
    startGeneration,
    abort,
    reset,
    isGenerating:
      state.status === IncrementalProgramStatus.GeneratingMetadata ||
      state.status === IncrementalProgramStatus.GeneratingDay,
    isComplete: state.status === IncrementalProgramStatus.Complete,
    hasError: state.status === IncrementalProgramStatus.Error,
    partialProgram: state.partialProgram,
    currentDay: state.currentDay,
  };
}
