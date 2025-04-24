'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Logo() {
  const [imgError, setImgError] = useState(false);
  
  return (
    <div className="flex items-center justify-center py-2">
      {!imgError ? (
        <div className="flex items-center">
          <div className="relative h-16 w-16 flex-shrink-0">
            <Image
              src="/img/logo_biceps.png"
              alt="bodAI Logo"
              fill
              sizes="64px"
              priority
              style={{ objectFit: 'contain' }}
              onError={() => {
                console.error('Error loading logo image with Next Image');
                setImgError(true);
              }}
            />
          </div>
          <span className="text-3xl font-bold text-white ml-2">
            bod<span className="text-indigo-500 font-extrabold">AI</span>
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          <div className="h-16 w-16 bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className="text-3xl font-bold text-white ml-2">
            bod<span className="text-indigo-500 font-extrabold">AI</span>
          </span>
        </div>
      )}
    </div>
  );
} 