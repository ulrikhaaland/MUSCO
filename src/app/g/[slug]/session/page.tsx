'use client';
import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { SingleDayProgramView } from '@/app/components/ui/SingleDayProgramView';

export default function GymSingleDaySessionPage() {
  const searchParams = useSearchParams();
  const data = useMemo(() => {
    try { return JSON.parse(searchParams?.get('t') || '{}'); } catch { return null; }
  }, [searchParams]);
  if (!data) return <div className="min-h-screen bg-gray-900 text-white p-6">Invalid session.</div>;
  const t = (k: string) => k;
  return (
    <div className="bg-gray-900 text-white min-h-screen">
      <SingleDayProgramView result={data} t={t} />
    </div>
  );
}





