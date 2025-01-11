"use client";

import { useEffect, useState } from 'react';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { Gender } from '@/app/types';

// Update keyframes to include slide in
const buttonTextKeyframes = `
@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-10px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes slideOutRight {
  from {
    opacity: 1;
    transform: translateX(0);
  }
  to {
    opacity: 0;
    transform: translateX(10px);
  }
}
`;

// Add the keyframes to the document
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = buttonTextKeyframes;
  document.head.appendChild(style);
}

interface MobileControlButtonsProps {
  isRotating: boolean;
  isResetting: boolean;
  isReady: boolean;
  needsReset: boolean;
  currentGender: Gender;
  controlsBottom: string;
  onRotate: () => void;
  onReset: () => void;
  onSwitchModel: () => void;
}

export default function MobileControlButtons({
  isRotating,
  isResetting,
  isReady,
  needsReset,
  currentGender,
  controlsBottom,
  onRotate,
  onReset,
  onSwitchModel,
}: MobileControlButtonsProps) {
  const [showButtonText, setShowButtonText] = useState(false);

  useEffect(() => {
    // Show text after 2 seconds
    const showTimer = setTimeout(() => {
      setShowButtonText(true);
    }, 500);

    // Hide text after 7 seconds (2s delay + 5s show time)
    const hideTimer = setTimeout(() => {
      setShowButtonText(false);
    }, 7000);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  return (
    <div
      className="md:hidden fixed right-4 flex flex-col gap-2 bg-[#111827] p-1.5 rounded-lg shadow-lg transition-all duration-300"
      style={{
        zIndex: 0,
        bottom: controlsBottom,
      }}
    >
      <div className="flex items-center gap-2">
        <button
          onClick={onRotate}
          disabled={isRotating || isResetting || !isReady}
          className={`text-white p-2 rounded-lg transition-colors duration-200 ${
            isRotating || isResetting || !isReady
              ? 'opacity-50'
              : 'hover:bg-white/10'
          }`}
        >
          <CropRotateIcon
            className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`}
          />
        </button>
        {showButtonText && (
          <div 
            className="text-white text-sm whitespace-nowrap bg-[#111827] px-2 py-1 rounded"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            Rotate model
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onReset}
          disabled={
            isResetting || (!needsReset) || !isReady
          }
          className={`text-white p-2 rounded-lg transition-colors duration-200 ${
            isResetting || (!needsReset)
              ? 'opacity-50'
              : 'hover:bg-white/10'
          }`}
        >
          <MyLocationIcon
            className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`}
          />
        </button>
        {showButtonText && (
          <div 
            className="text-white text-sm whitespace-nowrap bg-[#111827] px-2 py-1 rounded"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            Reset view
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onSwitchModel}
          disabled={!isReady}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          {currentGender === 'male' ? (
            <FemaleIcon className="h-5 w-5" />
          ) : (
            <MaleIcon className="h-5 w-5" />
          )}
        </button>
        {showButtonText && (
          <div 
            className="text-white text-sm whitespace-nowrap bg-[#111827] px-2 py-1 rounded"
            style={{
              animation: 'slideInRight 0.3s ease-out'
            }}
          >
            Switch gender
          </div>
        )}
      </div>
    </div>
  );
} 