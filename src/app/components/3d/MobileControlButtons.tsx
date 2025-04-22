'use client';

import CropRotateIcon from '@mui/icons-material/CropRotate';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { Gender } from '@/app/types';
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
  return (
    <>
      <div
        className="md:hidden fixed right-4 flex flex-col gap-2 bg-[#111827] p-1.5 rounded-lg shadow-lg transition-all duration-300"
        style={{
          bottom: controlsBottom,
        }}
      >
        <button
          onClick={onRotate}
          disabled={isRotating || isResetting || !isReady}
          className={`rotate-button text-white p-2 rounded-lg transition-colors duration-200 ${
            isRotating || isResetting || !isReady
              ? 'opacity-50'
              : 'hover:bg-white/10'
          }`}
        >
          <CropRotateIcon
            className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`}
          />
        </button>

        <button
          onClick={onReset}
          disabled={isResetting || !needsReset || !isReady}
          className={`reset-button text-white p-2 rounded-lg transition-colors duration-200 ${
            isResetting || !needsReset ? 'opacity-50' : 'hover:bg-white/10'
          }`}
        >
          <MyLocationIcon
            className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`}
          />
        </button>

        <button
          onClick={onSwitchModel}
          disabled={!isReady}
          className={`gender-button text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 ${
            !isReady ? 'opacity-50' : ''
          }`}
        >
          {currentGender === 'male' ? (
            <FemaleIcon className="h-5 w-5" />
          ) : (
            <MaleIcon className="h-5 w-5" />
          )}
        </button>
      </div>
    </>
  );
}
