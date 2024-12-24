'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import HumanViewer from './components/3d/HumanViewer';
import { Gender } from './types';

function HumanViewerWrapper() {
  const searchParams = useSearchParams();
  const gender = (searchParams?.get('gender') as Gender) || 'male';
  
  return <HumanViewer gender={gender} />;
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HumanViewerWrapper />
    </Suspense>
  );
}
