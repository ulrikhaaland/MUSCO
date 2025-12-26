'use client';

import { ExerciseQuestionnaire } from '@/app/components/ui/ExerciseQuestionnaire';
import { ProgramType, ExerciseQuestionnaireAnswers } from '../../../../shared/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DiagnosisAssistantResponse } from '@/app/types';
import { useUser } from '@/app/context/UserContext';
import { WeeklyLimitReachedError } from '@/app/services/questionnaire';
import { WeeklyLimitModal } from '@/app/components/ui/WeeklyLimitModal';
// Auth overlay is handled globally in layout via <AuthOverlay />

export default function QuestionnaireClient({
  programType,
}: {
  programType: ProgramType;
}) {
  const router = useRouter();
  const { onQuestionnaireSubmit } = useUser();
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType>(programType);
  const [weeklyLimitError, setWeeklyLimitError] = useState<{
    programType: ProgramType;
    nextAllowedDate: Date;
  } | null>(null);

  const handleClose = () => {
    router.back();
  };

  useEffect(() => {
    setSelectedProgramType(programType);
  }, [programType]);

  const handleSubmit = async (answers: ExerciseQuestionnaireAnswers) => {
    const diagnosis: DiagnosisAssistantResponse = {
      summary: '',
      selectedBodyGroup: null,
      selectedBodyPart: null,
      diagnosis:
        selectedProgramType !== ProgramType.Recovery
          ? 'No diagnosis, just an exercise program'
          : 'No diagnosis, just a recovery program',
      programType: selectedProgramType,
      painfulAreas: '' as any,
      avoidActivities: [] as any,
      timeFrame: '1 week',
      followUpQuestions: [],
      informationalInsights: '',
      onset: null,
      painScale: 0,
      mechanismOfInjury: null,
      aggravatingFactors: '' as any,
      relievingFactors: '' as any,
      priorInjury: null,
      painPattern: null,
      painLocation: null,
      painCharacter: null,
      assessmentComplete: false,
      redFlagsPresent: false,
      targetAreas: '' as any,
    };

    try {
      // Navigation is handled by UserContext.onQuestionnaireSubmit:
      // - Authenticated users: navigates to /program during generation
      // - Unauthenticated users: returns requiresAuth flag (auth overlay shown)
      await onQuestionnaireSubmit(diagnosis, answers);
    } catch (err) {
      if (err instanceof WeeklyLimitReachedError) {
        setWeeklyLimitError({
          programType: err.programType,
          nextAllowedDate: err.nextAllowedDate,
        });
      } else {
        console.error('Questionnaire submission failed', err);
      }
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ExerciseQuestionnaire
        onClose={handleClose}
        onSubmit={handleSubmit}
        generallyPainfulAreas={[]}
        programType={selectedProgramType}
        onProgramTypeChange={setSelectedProgramType}
        targetAreas={[]}
        fullBody={false}
      />

      {/* Auth overlay handled globally */}

      {/* Weekly limit modal */}
      {weeklyLimitError && (
        <WeeklyLimitModal
          isOpen={true}
          programType={weeklyLimitError.programType}
          nextAllowedDate={weeklyLimitError.nextAllowedDate}
          onClose={() => setWeeklyLimitError(null)}
        />
      )}
    </div>
  );
}


