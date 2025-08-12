import { Suspense } from 'react';
import QuestionnaireClient from './QuestionnaireClient';
import { ProgramType } from '../../../../shared/types';

function toProgramType(param?: string | null): ProgramType {
  if (!param) return ProgramType.Exercise;
  const v = String(param).toLowerCase();
  return v === 'recovery' ? ProgramType.Recovery : ProgramType.Exercise;
}

export default function QuestionnairePage({
  searchParams,
}: {
  searchParams: { type?: string };
}) {
  const programType = toProgramType(searchParams?.type);
  return (
    <Suspense fallback={null}>
      <QuestionnaireClient programType={programType} />
    </Suspense>
  );
}



