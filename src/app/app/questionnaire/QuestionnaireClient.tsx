'use client';

import { useRouter } from 'next/navigation';
import { ExerciseQuestionnaire } from '@/app/components/ui/ExerciseQuestionnaire';
import { ProgramType, ExerciseQuestionnaireAnswers } from '@/../../shared/types';
import { useState, useEffect } from 'react';
import { DiagnosisAssistantResponse } from '@/app/types';
import { useUser } from '@/app/context/UserContext';
// Auth overlay is handled globally in layout via <AuthOverlay />

export default function QuestionnaireClient({
  programType,
}: {
  programType: ProgramType;
}) {
  const router = useRouter();
  const { onQuestionnaireSubmit } = useUser();
  const [selectedProgramType, setSelectedProgramType] = useState<ProgramType>(programType);

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
      const result = await onQuestionnaireSubmit(diagnosis, answers);
      if (!result?.requiresAuth) {
        router.push('/programs');
      }
    } catch (err) {
      console.error('Questionnaire submission failed', err);
    }
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ExerciseQuestionnaire
        onSubmit={handleSubmit}
        generallyPainfulAreas={[]}
        programType={selectedProgramType}
        onProgramTypeChange={setSelectedProgramType}
        targetAreas={[]}
        fullBody={false}
      />

      {/* Auth overlay handled globally */}
    </div>
  );
}


