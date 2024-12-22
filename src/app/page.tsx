'use client';

import dynamic from 'next/dynamic';
import { useSearchParams } from 'next/navigation';
import { Gender } from './types';

// Dynamically import the HumanViewer component with no SSR
const HumanViewer = dynamic(() => import('./components/3d/HumanViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div className="text-white text-xl">Loading Human Model...</div>
    </div>
  ),
});

export default function Home() {
  const searchParams = useSearchParams();
  const gender = (searchParams.get('gender') as Gender) || 'male';

  return (
    <main className="w-screen h-screen overflow-hidden bg-black">
      <HumanViewer gender={gender} />
    </main>
  );
}
