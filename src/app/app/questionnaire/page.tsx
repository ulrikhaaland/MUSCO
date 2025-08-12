'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { ExerciseQuestionnaire } from '@/app/components/ui/ExerciseQuestionnaire';
import { ProgramType, ExerciseQuestionnaireAnswers } from '@/../../shared/types';
import { DiagnosisAssistantResponse } from '@/app/types';
import { useUser } from '@/app/context/UserContext';

function toProgramType(param: string | null): ProgramType {
  if (!param) return ProgramType.Exercise;
  const v = param.toLowerCase();
  return v === 'recovery' ? ProgramType.Recovery : ProgramType.Exercise;
}

export default function QuestionnairePage() {
  const router = useRouter();
  const search = useSearchParams();
  const programType = toProgramType(search.get('type'));
  const { onQuestionnaireSubmit } = useUser();

  const handleSubmit = async (answers: ExerciseQuestionnaireAnswers) => {
    const diagnosis: DiagnosisAssistantResponse = {
      diagnosis:
        programType === ProgramType.Exercise
          ? 'No diagnosis, just an exercise program'
          : 'No diagnosis, just a recovery program',
      programType,
      painfulAreas: [],
      avoidActivities: [],
      timeFrame: '1 week',
      followUpQuestions: [],
      informationalInsights: '',
      onset: null,
      painScale: 0,
      mechanismOfInjury: null,
      aggravatingFactors: [],
      relievingFactors: [],
      priorInjury: null,
      painPattern: null,
      painLocation: null,
      painCharacter: null,
      assessmentComplete: false,
      redFlagsPresent: false,
      targetAreas: [],
    };

    try {
      const result = await onQuestionnaireSubmit(diagnosis, answers);
      if (!result?.requiresAuth) {
        router.push('/programs');
      }
    } catch (err) {
      // Silently fail; the component handles its own UI
      console.error('Questionnaire submission failed', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800">
      <ExerciseQuestionnaire
        onClose={() => router.back()}
        onSubmit={handleSubmit}
        generallyPainfulAreas={[]}
        programType={programType}
        targetAreas={[]}
        fullBody={false}
      />
    </div>
  );
}


