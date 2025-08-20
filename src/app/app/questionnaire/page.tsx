import { Suspense } from 'react';
import QuestionnaireClient from './QuestionnaireClient';
import { ProgramType } from '../../../../shared/types';

function toProgramType(param?: string | null): ProgramType {
  if (!param) return ProgramType.Exercise;
  const v = String(param).toLowerCase();
  if (v === 'recovery') return ProgramType.Recovery;
  if (v === 'exercise_and_recovery' || v === 'exercise+recovery' || v === 'exercise-and-recovery') {
    return ProgramType.ExerciseAndRecovery;
  }
  return ProgramType.Exercise;
}

export default async function QuestionnairePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const typeParam = Array.isArray(params?.type)
    ? params?.type?.[0]
    : (params?.type as string | undefined);
  const programType = toProgramType(typeParam);
  return (
    <Suspense fallback={null}>
      <QuestionnaireClient programType={programType} />
    </Suspense>
  );
}



