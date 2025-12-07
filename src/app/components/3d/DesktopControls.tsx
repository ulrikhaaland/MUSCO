'use client';

import CropRotateIcon from '@mui/icons-material/CropRotate';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import InfoIcon from '@mui/icons-material/Info';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { Gender } from '../../types';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/app/i18n';

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
  explainerEnabled?: boolean;
  onToggleExplainer?: () => void;
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
  explainerEnabled,
  onToggleExplainer,
}: DesktopControlsProps) {
  const { t } = useTranslation();
  const [showLabels, setShowLabels] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setShowLabels(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  const labelBase = 'overflow-hidden whitespace-nowrap transition-all duration-200';
  const collapsed = 'max-w-0 opacity-0 ml-0';
  const expanded = 'max-w-xs opacity-100 ml-2';

  // Expand labels when hovering the controls container; collapse 3s after leaving
  const collapseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const handleMouseEnterContainer = () => {
    if (collapseTimerRef.current) {
      clearTimeout(collapseTimerRef.current);
      collapseTimerRef.current = null;
    }
    setShowLabels(true);
  };
  const handleMouseLeaveContainer = () => {
    if (collapseTimerRef.current) clearTimeout(collapseTimerRef.current);
    collapseTimerRef.current = null;
    setShowLabels(false); // collapse immediately on leave
  };
  return (
    <div
      className="absolute bottom-6 right-6 md:flex md:flex-col md:gap-3 hidden bg-surface-base/80 p-2 rounded-lg shadow-lg backdrop-blur-md"
      style={{ zIndex: 30 }}
      onMouseEnter={handleMouseEnterContainer}
      onMouseLeave={handleMouseLeaveContainer}
    >
      <button
        onClick={onRotate}
        disabled={isRotating || isResetting || !isReady}
        className={`text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center hover:bg-white/10 ${
          isRotating || isResetting || !isReady ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <CropRotateIcon className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`} />
        <span className={`${labelBase} ${showLabels ? expanded : collapsed}`}>
          {isRotating ? t('desktopControls.rotating') : t('desktopControls.rotateModel')}
        </span>
      </button>

      <button
        onClick={onReset}
        disabled={isResetting || (!needsReset && !hasSelection)}
        className={`text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center hover:bg-white/10 ${
          isResetting || (!needsReset && !hasSelection) ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <RestartAltIcon className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`} />
        <span className={`${labelBase} ${showLabels ? expanded : collapsed}`}>
          {isResetting ? t('desktopControls.resetting') : t('desktopControls.resetView')}
        </span>
      </button>

      {typeof onToggleExplainer === 'function' && (
        <button
          aria-label="Toggle explainer"
          onClick={onToggleExplainer}
          className={`text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center hover:bg-white/10`}
        >
          {explainerEnabled ? (
            <InfoIcon className="h-5 w-5" />
          ) : (
            <InfoOutlinedIcon className="h-5 w-5" />
          )}
          <span className={`${labelBase} ${showLabels ? expanded : collapsed}`}>
            {explainerEnabled ? t('desktopControls.explainerOn') : t('desktopControls.explainerOff')}
          </span>
        </button>
      )}

      <button
        onClick={onSwitchModel}
        disabled={isChangingModel}
        className={`text-white px-3 py-2 rounded-lg transition-colors duration-200 flex items-center hover:bg-white/10 ${
          isChangingModel ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {currentGender === 'male' ? (
          <MaleIcon className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`} />
        ) : (
          <FemaleIcon className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`} />
        )}
        <span className={`${labelBase} ${showLabels ? expanded : collapsed}`}>
          {isChangingModel ? t('desktopControls.loading') : t(currentGender === 'male' ? 'desktopControls.switchToFemale' : 'desktopControls.switchToMale')}
        </span>
      </button>
    </div>
  );
}


