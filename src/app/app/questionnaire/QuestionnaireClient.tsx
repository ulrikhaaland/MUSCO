'use client';

import { useRouter } from 'next/navigation';
import { ExerciseQuestionnaire } from '@/app/components/ui/ExerciseQuestionnaire';
import { ProgramType, ExerciseQuestionnaireAnswers } from '@/../../shared/types';
import { DiagnosisAssistantResponse } from '@/app/types';
import { useUser } from '@/app/context/UserContext';

export default function QuestionnaireClient({
  programType,
}: {
  programType: ProgramType;
}) {
  const router = useRouter();
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


