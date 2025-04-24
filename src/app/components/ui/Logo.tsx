'use client';

import Image from 'next/image';
import { useState } from 'react';

type LogoProps = {
  variant?: 'horizontal' | 'vertical';
};

export default function Logo({ variant = 'horizontal' }: LogoProps) {
  const [imgError, setImgError] = useState(false);

  const isVertical = variant === 'vertical';

  // Adjust sizes based on variant
  const imageSize = isVertical
    ? { height: 'h-32', width: 'w-32', sizes: '128px' }
    : { height: 'h-16', width: 'w-16', sizes: '64px' };
  const textSize = isVertical ? 'text-5xl' : 'text-3xl';

  if (isVertical) {
    return (
      <div className="flex items-center justify-center relative" style={{ height: '200px' }}>
        {/* Absolute positioned container for vertical logo */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {!imgError ? (
            <>
              {/* Simple structure with image and text */}
              <div className="flex flex-col items-center">
                <div 
                  style={{
                    width: '170px',
                    height: '170px',
                    position: 'relative',
                    marginBottom: '-12px', // Make image overlap with text
                    marginLeft: '74px'
                  }}
                >
                  <Image
                    src="/img/logo_biceps.png"
                    alt="bodAI Logo"
                    fill
                    sizes="160px"
                    className="drop-shadow-[0_10px_8px_rgba(79,70,229,0.15)]"
                    style={{ objectFit: 'contain' }}
                    priority
                    onError={() => {
                      console.error('Error loading logo image with Next Image');
                      setImgError(true);
                    }}
                  />
                </div>
                <div className="text-center">
                  <span className={`${textSize} font-bold text-white`}>
                    bod<span className="text-indigo-500 font-extrabold">AI</span>
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* Fallback version */}
              <div className="flex flex-col items-center">
                <div 
                  style={{
                    width: '160px',
                    height: '160px',
                    position: 'relative',
                    marginBottom: '-12px',
                    marginLeft: '74px'
                  }}
                >
                  <div className="h-full w-full bg-indigo-600 rounded-md flex items-center justify-center drop-shadow-[0_10px_8px_rgba(79,70,229,0.15)]">
                    <span className="text-white font-bold text-2xl">B</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`${textSize} font-bold text-white`}>
                    bod<span className="text-indigo-500 font-extrabold">AI</span>
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    );
  }

  // Original horizontal layout
  return (
    <div className="flex items-center justify-center py-2">
      {!imgError ? (
        <div className="flex items-center">
          <div
            className={`relative ${imageSize.height} ${imageSize.width} flex-shrink-0`}
          >
            <Image
              src="/img/logo_biceps.png"
              alt="bodAI Logo"
              fill
              sizes={imageSize.sizes}
              priority
              style={{ objectFit: 'contain' }}
              onError={() => {
                console.error('Error loading logo image with Next Image');
                setImgError(true);
              }}
            />
          </div>
          <span className={`${textSize} font-bold text-white ml-2`}>
            bod<span className="text-indigo-500 font-extrabold">AI</span>
          </span>
        </div>
      ) : (
        <div className="flex items-center">
          <div
            className={`${imageSize.height} ${imageSize.width} bg-indigo-600 rounded-md flex items-center justify-center flex-shrink-0`}
          >
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <span className={`${textSize} font-bold text-white ml-2`}>
            bod<span className="text-indigo-500 font-extrabold">AI</span>
          </span>
        </div>
      )}
    </div>
  );
}
