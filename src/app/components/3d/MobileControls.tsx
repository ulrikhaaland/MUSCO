import { useState, useEffect } from 'react';
import { BottomSheet } from 'react-spring-bottom-sheet';
import type { BottomSheetProps } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Gender } from '@/app/types';
import { AnatomyPart } from '@/app/types/anatomy';
import { ChatMessages } from '../ui/ChatMessages';
import { usePartChat } from '@/app/hooks/usePartChat';

interface MobileControlsProps {
  isRotating: boolean;
  isResetting: boolean;
  isReady: boolean;
  needsReset: boolean;
  selectedParts: AnatomyPart[];
  isChangingModel: boolean;
  currentGender: Gender;
  selectedPart: AnatomyPart | null;
  onRotate: () => void;
  onReset: () => void;
  onSwitchModel: () => void;
}

const Sheet = BottomSheet as React.ComponentType<BottomSheetProps>;

export default function MobileControls({
  isRotating,
  isResetting,
  isReady,
  needsReset,
  selectedParts,
  isChangingModel,
  currentGender,
  selectedPart,
  onRotate,
  onReset,
  onSwitchModel,
}: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(true);
  const {
    messages,
    isLoading,
    isCollectingJson,
    followUpQuestions,
    messagesRef,
    resetChat,
    handleOptionClick,
    getDisplayName,
  } = usePartChat({ selectedPart });

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleRotateWithCollapse = () => {
    onRotate();
    setIsOpen(false);
    // Re-open after a short delay
    setTimeout(() => setIsOpen(true), 100);
  };

  const handleResetWithCollapse = () => {
    onReset();
    setIsOpen(false);
    // Re-open after a short delay
    setTimeout(() => setIsOpen(true), 100);
  };

  const handleSwitchModelWithCollapse = () => {
    onSwitchModel();
    setIsOpen(false);
    // Re-open after a short delay
    setTimeout(() => setIsOpen(true), 100);
  };

  if (!isMobile) return null;

  return (
    <Sheet
      open={isOpen}
      onDismiss={() => setIsOpen(false)}
      blocking={false}
      skipInitialTransition
      defaultSnap={({ maxHeight }) => Math.min(maxHeight * 0.15, 72)}
      snapPoints={({ maxHeight }) => [
        Math.min(maxHeight * 0.15, 72),
        maxHeight * 0.4,
        maxHeight * 0.8
      ]}
      expandOnContentDrag
      header={
        <div className="h-6 w-full flex justify-center items-center">
          <ExpandLessIcon className="text-white" />
        </div>
      }
      className="!bg-gray-900 [&>*]:!bg-gray-900"
    >
      <div className="p-4 flex flex-col h-full">
        {/* Basic Controls */}
        <div className="flex justify-around items-center flex-shrink-0">
          <button
            onClick={handleRotateWithCollapse}
            disabled={isRotating || isResetting || !isReady}
            className={`p-3 rounded-full bg-indigo-600/80 ${
              isRotating || isResetting || !isReady ? 'opacity-50' : 'active:bg-indigo-700'
            }`}
          >
            <CropRotateIcon className={`h-6 w-6 text-white ${isRotating ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleResetWithCollapse}
            disabled={isResetting || (!needsReset && selectedParts.length === 0)}
            className={`p-3 rounded-full bg-indigo-600/80 ${
              isResetting || (!needsReset && selectedParts.length === 0)
                ? 'opacity-50'
                : 'active:bg-indigo-700'
            }`}
          >
            <RestartAltIcon className={`h-6 w-6 text-white ${isResetting ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleSwitchModelWithCollapse}
            disabled={isChangingModel}
            className={`p-3 rounded-full bg-indigo-600/80 ${
              isChangingModel ? 'opacity-50' : 'active:bg-indigo-700'
            }`}
          >
            {currentGender === 'male' ? (
              <MaleIcon className={`h-6 w-6 text-white ${isChangingModel ? 'animate-spin' : ''}`} />
            ) : (
              <FemaleIcon className={`h-6 w-6 text-white ${isChangingModel ? 'animate-spin' : ''}`} />
            )}
          </button>
        </div>

        {/* Expanded Content */}
        <div className="mt-4 flex-1 min-h-0 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-start mb-6 flex-shrink-0">
            <div>
              <h2 className="text-sm text-gray-400 mb-1">
                Musculoskeletal Assistant
              </h2>
              <h3 className="text-xl font-bold text-white">
                {getDisplayName()}
              </h3>
            </div>
            <button 
              onClick={resetChat} 
              className="text-gray-400 hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
              aria-label="Reset Chat"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 min-h-0">
            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              isCollectingJson={isCollectingJson}
              followUpQuestions={followUpQuestions}
              onQuestionClick={handleOptionClick}
              part={selectedPart}
              messagesRef={messagesRef}
            />
          </div>
        </div>
      </div>
    </Sheet>
  );
} 