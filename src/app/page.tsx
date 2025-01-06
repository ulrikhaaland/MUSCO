'use client';

import { Suspense, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import HumanViewer from './components/3d/HumanViewer';
import { Gender } from './types';

function HumanViewerWrapper() {
  const searchParams = useSearchParams();
  const initialGender = (searchParams?.get('gender') as Gender) || 'male';
  const [gender, setGender] = useState<Gender>(initialGender);

  const handleGenderChange = useCallback((newGender: Gender) => {
    console.log('Changing gender to:', newGender);
    setGender(newGender);
  }, []);

  return <HumanViewer gender={gender} onGenderChange={handleGenderChange} />;
}
export default function Page() {
  return (
    <div className="overflow-y-auto">
      <Suspense fallback={<div>Loading...</div>}>
        <HumanViewerWrapper />
      </Suspense>
    </div>
  );
}
