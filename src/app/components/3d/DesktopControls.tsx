'use client';

import CropRotateIcon from '@mui/icons-material/CropRotate';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { Gender } from '../../types';

interface DesktopControlsProps {
  isRotating: boolean;
  isResetting: boolean;
  isReady: boolean;
  needsReset: boolean;
  hasSelection: boolean;
  currentGender: Gender;
  isChangingModel: boolean;
  onRotate: () => void;
  onReset: () => void;
  onSwitchModel: () => void;
}

export default function DesktopControls({
  isRotating,
  isResetting,
  isReady,
  needsReset,
  hasSelection,
  currentGender,
  isChangingModel,
  onRotate,
  onReset,
  onSwitchModel,
}: DesktopControlsProps) {
  return (
    <div
      className="absolute bottom-6 right-6 md:flex space-x-4 hidden"
      style={{ zIndex: 1000 }}
    >
      <button
        onClick={onRotate}
        disabled={isRotating || isResetting || !isReady}
        className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
          isRotating || isResetting || !isReady ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <CropRotateIcon className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`} />
        <span>{isRotating ? 'Rotating...' : 'Rotate Model'}</span>
      </button>

      <button
        onClick={onReset}
        disabled={isResetting || (!needsReset && !hasSelection)}
        className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
          isResetting || (!needsReset && !hasSelection) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <RestartAltIcon className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`} />
        <span>{isResetting ? 'Resetting...' : 'Reset View'}</span>
      </button>

      <button
        onClick={onSwitchModel}
        disabled={isChangingModel}
        className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
          isChangingModel ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {currentGender === 'male' ? (
          <MaleIcon className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`} />
        ) : (
          <FemaleIcon className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`} />
        )}
        <span>
          {isChangingModel ? 'Loading...' : `Switch to ${currentGender === 'male' ? 'Female' : 'Male'}`}
        </span>
      </button>
    </div>
  );
}


