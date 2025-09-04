'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EXERCISE_MODALITIES, WORKOUT_DURATIONS } from '@/app/types/program';

export default function GymFunnelPage({ params, searchParams }: any) {
  const slug = params.slug as string;
  const router = useRouter();
  const [modality, setModality] = useState<string>('Strength');
  const [experience, setExperience] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [duration, setDuration] = useState<string>(WORKOUT_DURATIONS[1]);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/programs/single-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gymSlug: slug, modality, experience, duration }),
      });
      if (!res.ok) throw new Error('request_failed');
      const data = await res.json();
      router.push(`/g/${slug}/session?t=${encodeURIComponent(JSON.stringify(data))}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold text-center">Gym session</h1>
        <div>
          <label className="block mb-2">Modality</label>
          <div className="grid grid-cols-3 gap-2">
            {EXERCISE_MODALITIES.map((m) => (
              <button key={m} className={`px-3 py-2 rounded ${modality===m?'bg-indigo-600':'bg-gray-800'}`} onClick={()=>setModality(m)}>{m}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2">Experience</label>
          <div className="grid grid-cols-3 gap-2">
            {(['Beginner','Intermediate','Advanced'] as const).map((e)=> (
              <button key={e} className={`px-3 py-2 rounded ${experience===e?'bg-indigo-600':'bg-gray-800'}`} onClick={()=>setExperience(e)}>{e}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="block mb-2">Duration</label>
          <div className="grid grid-cols-2 gap-2">
            {WORKOUT_DURATIONS.map((d)=> (
              <button key={d} className={`px-3 py-2 rounded ${duration===d?'bg-indigo-600':'bg-gray-800'}`} onClick={()=>setDuration(d)}>{d}</button>
            ))}
          </div>
        </div>
        <button disabled={loading} onClick={submit} className="w-full py-3 rounded bg-indigo-600 disabled:opacity-50">{loading?'Loading...':'Generate session'}</button>
      </div>
    </div>
  );
}


