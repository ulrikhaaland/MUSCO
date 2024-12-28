import { useState, useEffect, useRef, RefAttributes, ComponentType } from 'react';
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet';
import type { BottomSheetProps } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { Gender } from '@/app/types';
import { AnatomyPart } from '@/app/types/anatomy';
import { ChatMessages } from '../ui/ChatMessages';
import { usePartChat } from '@/app/hooks/usePartChat';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';

interface MobileControlsProps {
  isRotating: boolean;
  isResetting: boolean;
  isReady: boolean;
  needsReset: boolean;
  selectedParts: BodyPartGroup | null;
  isChangingModel: boolean;
  currentGender: Gender;
  selectedPart: AnatomyPart | null;
  onRotate: () => void;
  onReset: () => void;
  onSwitchModel: () => void;
  onZoom: () => void;
}

// Use BottomSheet directly
const BottomSheetBase = BottomSheet as ComponentType<BottomSheetProps & RefAttributes<BottomSheetRef>>;

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
  onZoom,
}: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const sheetRef = useRef<BottomSheetRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const updateContentHeight = () => {
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        setContentHeight(height);
      }
    };

    // Update height when messages change
    updateContentHeight();

    // Set up a ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(updateContentHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [messages]); // Update when messages change

  const handleExpandToggle = () => {
    if (sheetRef.current) {
      if (isExpanded) {
        // Collapse to minimum height
        sheetRef.current.snapTo(({ snapPoints }) => Math.min(...snapPoints));
      } else {
        // Expand to maximum height
        sheetRef.current.snapTo(({ snapPoints }) => Math.max(...snapPoints));
      }
      setIsExpanded(!isExpanded);
    }
  };

  if (!isMobile) return null;

  return (
    <>
      {/* Controls - Mobile */}
      <div className="md:hidden fixed right-1 bottom-[76px] flex flex-col gap-2 bg-black/50 p-1.5 rounded-lg" style={{ zIndex: 1 }}>
        <button
          onClick={onRotate}
          disabled={isRotating || isResetting || !isReady}
          className={`text-white p-2 rounded-lg transition-colors duration-200 ${
            isRotating || isResetting || !isReady ? 'opacity-50' : 'hover:bg-white/10'
          }`}
        >
          <CropRotateIcon className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={onReset}
          disabled={isResetting || (!needsReset && selectedParts === null)}
          className={`text-white p-2 rounded-lg transition-colors duration-200 ${
            isResetting || (!needsReset && selectedParts === null)
              ? 'opacity-50'
              : 'hover:bg-white/10'
          }`}
        >
          <MyLocationIcon className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`} />
        </button>
        <button
          onClick={onZoom}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          <ZoomInIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onSwitchModel}
          className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
        >
          {currentGender === 'male' ? (
            <FemaleIcon className="h-5 w-5" />
          ) : (
            <MaleIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Bottom Sheet */}
      <BottomSheetBase
        ref={sheetRef}
        open={true}
        blocking={false}
        skipInitialTransition
        defaultSnap={({ maxHeight }) => Math.min(maxHeight * 0.15, 72)}
        snapPoints={({ maxHeight }) => {
          const minHeight = Math.min(maxHeight * 0.15, 72);
          const contentWithPadding = contentHeight + 96; // Account for header and padding
          
          // If content is smaller than minHeight, only use minHeight
          if (contentWithPadding <= minHeight) {
            return [minHeight];
          }
          
          // If content is smaller than 40% of screen, use content height as max
          if (contentWithPadding < maxHeight * 0.4) {
            return [minHeight, contentWithPadding];
          }
          
          // Otherwise use standard snap points
          return [
            minHeight,
            maxHeight * 0.4,
            maxHeight * 0.8
          ];
        }}
        expandOnContentDrag
        onSpringStart={(event) => {
          if (event.type === 'SNAP' && sheetRef.current) {
            const currentHeight = sheetRef.current.height;
            const maxHeight = window.innerHeight;
            setIsExpanded(currentHeight > Math.min(maxHeight * 0.15, 72));
          }
        }}
        onSpringEnd={(event) => {
          if (event.type === 'SNAP' && sheetRef.current) {
            const currentHeight = sheetRef.current.height;
            const maxHeight = window.innerHeight;
            setIsExpanded(currentHeight > Math.min(maxHeight * 0.15, 72));
          }
        }}
        header={
          <div className="h-12 w-full flex justify-between items-center">
            <div className="flex flex-col items-start">
              <h2 className="text-sm text-gray-400">
                Musculoskeletal Assistant
              </h2>
              <h3 className="text-lg font-bold text-white -mt-1">
                {getDisplayName()}
              </h3>
            </div>
            <div className="flex items-center gap-2 ml-4">
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
              <button 
                onClick={handleExpandToggle}
                className="flex justify-center items-center w-8 h-8 hover:bg-gray-800 rounded-full transition-colors"
              >
                <ExpandLessIcon className={`text-white h-6 w-6 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>
            </div>
          </div>
        }
        className="!bg-gray-900 [&>*]:!bg-gray-900"
      >
        <div ref={contentRef} className="px-4 flex flex-col h-full overflow-hidden">
          {/* Expanded Content */}
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            {/* Chat Messages */}
            <div className="flex-1 min-h-0 overflow-hidden">
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
      </BottomSheetBase>
    </>
  );
}
