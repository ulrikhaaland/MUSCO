'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Gender } from '../../types';
import { AnatomyPart } from '../../types/anatomy';
import PartPopup from '../ui/PartPopup';
import { useHumanAPI } from '@/app/hooks/useHumanAPI';
import { bodyPartGroups } from '@/app/config/bodyPartGroups';
import {
  getPartGroup,
  getGroupParts,
  createSelectionMap,
  getGenderedId,
} from '@/app/utils/anatomyHelpers';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import MobileControls from './MobileControls';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';

interface HumanViewerProps {
  gender: Gender;
  onGenderChange?: (gender: Gender) => void;
}

export default function HumanViewer({
  gender,
  onGenderChange,
}: HumanViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedParts, setSelectedParts] = useState<BodyPartGroup | null>(
    null
  );
  const [selectedPart, setSelectedPart] = useState<AnatomyPart | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const lastSelectedIdRef = useRef<string | null>(null);
  const deselectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minChatWidth = 300;
  const maxChatWidth = 800;
  const [chatWidth, setChatWidth] = useState(384);
  const [isDragging, setIsDragging] = useState(false);
  const lastWidthRef = useRef(chatWidth);
  const rafRef = useRef<number | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const rotationAnimationRef = useRef<number | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const isSelectingGroupRef = useRef(false);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);
  const [targetGender, setTargetGender] = useState<Gender | null>(null);
  const [modelContainerHeight, setModelContainerHeight] = useState('100vh');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const MODEL_IDS = {
    male: '5tOV',
    female: '5rlW',
  };

  const handlePartSelect = useCallback(
    (part: AnatomyPart, position: { clientX: number; clientY: number }) => {
      console.log('handlePartSelect called with:', { part, position });
      setSelectedPart(part);
      setPopupPosition({
        x: position.clientX,
        y: position.clientY,
      });
    },
    []
  );

  const handleObjectSelected = useCallback(
    (event: any) => {
      // Update UI position for the popup
      const mouseEvent = window.event as MouseEvent;
      if (mouseEvent && selectedPart) {
        handlePartSelect(selectedPart, {
          clientX: mouseEvent.clientX,
          clientY: mouseEvent.clientY,
        });
      }

      console.log('=== handleObjectSelected END ===');
    },
    [handlePartSelect, selectedPart]
  );

  const { humanRef, currentGender, needsReset, setNeedsReset, isReady } =
    useHumanAPI({
      elementId: 'myViewer',
      onObjectSelected: handleObjectSelected,
      initialGender: gender,
      selectedParts,
      setSelectedParts,
      setSelectedPart,
    });

  // Create viewer URL
  const getViewerUrl = useCallback((modelGender: Gender) => {
    const viewerUrl = new URL('https://human.biodigital.com/viewer/');
    viewerUrl.searchParams.set('id', MODEL_IDS[modelGender]);
    viewerUrl.searchParams.set('ui-anatomy-descriptions', 'false');
    viewerUrl.searchParams.set('ui-anatomy-pronunciations', 'false');
    viewerUrl.searchParams.set('ui-anatomy-labels', 'false');
    viewerUrl.searchParams.set('ui-audio', 'false');
    viewerUrl.searchParams.set('ui-chapter-list', 'false');
    viewerUrl.searchParams.set('ui-fullscreen', 'false');
    viewerUrl.searchParams.set('ui-help', 'false');
    viewerUrl.searchParams.set('ui-info', 'false');
    viewerUrl.searchParams.set('ui-label-list', 'false');
    viewerUrl.searchParams.set('ui-layers', 'false');
    viewerUrl.searchParams.set('ui-loader', 'circle');
    viewerUrl.searchParams.set('ui-media-controls', 'false');
    viewerUrl.searchParams.set('ui-menu', 'false');
    viewerUrl.searchParams.set('ui-nav', 'false');
    viewerUrl.searchParams.set('ui-search', 'false');
    viewerUrl.searchParams.set('ui-tools', 'false');
    viewerUrl.searchParams.set('ui-tutorial', 'false');
    viewerUrl.searchParams.set('ui-undo', 'false');
    viewerUrl.searchParams.set('ui-whiteboard', 'false');
    viewerUrl.searchParams.set('ui-zoom', 'false');
    viewerUrl.searchParams.set('initial.none', 'true');
    viewerUrl.searchParams.set('disable-scroll', 'false');
    viewerUrl.searchParams.set('uaid', 'LzCgB');
    viewerUrl.searchParams.set('paid', 'o_26b5a0fa');
    viewerUrl.searchParams.set('be-annotations', 'false');
    viewerUrl.searchParams.set('ui-annotations', 'false');
    viewerUrl.searchParams.set('ui-navigation', 'false');
    viewerUrl.searchParams.set('ui-controls', 'false');
    return viewerUrl.toString();
  }, []);

  const [viewerUrl, setViewerUrl] = useState(() => getViewerUrl(gender));
  const [isChangingModel, setIsChangingModel] = useState(false);

  const handleSwitchModel = useCallback(() => {
    setIsChangingModel(true);
    const newGender: Gender = currentGender === 'male' ? 'female' : 'male';
    setTargetGender(newGender);
    setViewerUrl(getViewerUrl(newGender));

    // Reset states
    setSelectedPart(null);
    setSelectedParts(null);
    setCurrentRotation(0);

    // Call the parent's gender change handler
    onGenderChange?.(newGender);

    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('gender', newGender);
    window.history.pushState({}, '', url.toString());
  }, [currentGender, getViewerUrl, onGenderChange]);

  // Clear target gender when model change is complete
  useEffect(() => {
    if (!isChangingModel) {
      setTargetGender(null);
    }
  }, [isChangingModel]);

  const handleReset = useCallback(() => {
    if (isResetting) return;

    setIsResetting(true);
    console.log('=== handleReset START ===');
    console.log('humanRef.current:', humanRef.current);
    console.log('isReady:', isReady);

    // Use scene.reset to reset everything to initial state
    if (humanRef.current) {
      if (!isReady) {
        console.log('Human API not ready, waiting...');
        setIsResetting(false);
        return;
      }

      console.log('Human API ready, sending commands...');
      // First deselect all parts with an empty selection map
      humanRef.current.send('scene.selectObjects', {
        replace: true,
      });

      // Then reset the scene
      setTimeout(() => {
        console.log('Sending scene.reset command...');
        humanRef.current?.send('scene.reset', () => {
          console.log('Scene reset callback executed');
          // Reset all our state after the scene has been reset
          setCurrentRotation(0);
          setSelectedPart(null);
          setSelectedParts(null);
          lastSelectedIdRef.current = null;
          setNeedsReset(false);

          // Clear reset state after a short delay to allow for animation
          setTimeout(() => {
            setIsResetting(false);
          }, 200);
        });
      }, 100);
    } else {
      console.log('humanRef.current is null!');
      setIsResetting(false);
    }
  }, [isResetting, setNeedsReset, isReady]);

  // Update reset button state when parts are selected
  useEffect(() => {
    setNeedsReset(selectedParts !== null || needsReset);
  }, [selectedParts, needsReset]);

  const startDragging = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';

    const handleMouseMove = (e: MouseEvent) => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      rafRef.current = requestAnimationFrame(() => {
        const newWidth = window.innerWidth - e.clientX;
        lastWidthRef.current = Math.min(
          Math.max(minChatWidth, newWidth),
          maxChatWidth
        );
        setChatWidth(lastWidthRef.current);
      });
    };

    const stopDragging = () => {
      setIsDragging(false);
      document.body.style.cursor = 'default';
      document.body.style.userSelect = 'auto';
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopDragging);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragging);
  }, []);

  const handleRotate = useCallback(() => {
    const human = humanRef.current;
    if (!human || isRotating || isResetting) return;

    setIsRotating(true);
    const startRotation = currentRotation % 360; // Normalize to 0-360
    const targetRotation = startRotation === 0 ? 180 : 360; // Always rotate forward to 180 or 360

    let currentAngle = 0;
    const rotationStep = 2; // Rotate 2 degrees per frame

    const animate = () => {
      if (currentAngle < 180) {
        // Always rotate 180 degrees
        human.send('camera.orbit', {
          yaw: rotationStep, // Always positive for clockwise rotation
        });
        currentAngle += rotationStep;
        rotationAnimationRef.current = requestAnimationFrame(animate);
      } else {
        // If we've completed a full 360, reset to 0
        setCurrentRotation(targetRotation === 360 ? 0 : targetRotation);
        setIsRotating(false);
        rotationAnimationRef.current = null;
      }
    };

    rotationAnimationRef.current = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
        rotationAnimationRef.current = null;
      }
    };
  }, [isRotating, currentRotation, isResetting]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
      }
    };
  }, []);

  // Move window-dependent calculation to useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialWidth = Math.min(
        Math.max(minChatWidth, window.innerWidth / 2),
        maxChatWidth
      );
      setChatWidth(initialWidth);
    }
  }, []); // Empty dependency array means this runs once after mount

  const handleZoom = useCallback(() => {
    if (!humanRef.current || !isReady) return;

    // First get current camera info
    humanRef.current.send('camera.info', (camera) => {
      if (selectedParts) {
        // If a part group is selected, focus on those parts while maintaining camera properties
        humanRef.current.send('camera.set', {
          objectId: getGenderedId(selectedParts.selectIds[0], currentGender),
          position: {
            ...camera.position,
            z: camera.position.z * 0.7, // Zoom in by reducing z distance by 30%
          },
          target: camera.target,
          up: camera.up,
          animate: true,
          animationDuration: 0.5,
        });
      } else {
        // If no part group selected, just zoom in while maintaining camera orientation
        humanRef.current.send('camera.set', {
          position: {
            ...camera.position,
            z: camera.position.z * 0.8, // Zoom in by reducing z distance by 20%
          },
          target: camera.target,
          up: camera.up,
          animate: true,
          animationDuration: 0.5,
        });
      }
    });
  }, [selectedParts, isReady]);

  const handleBottomSheetHeight = (sheetHeight: number) => {
    const newHeight = `calc(100vh - ${sheetHeight}px)`;
    if (newHeight !== modelContainerHeight) {
      setModelContainerHeight(newHeight);
    }
  };

  return (
    <div className="flex flex-col md:flex-row relative h-screen w-screen overflow-hidden">
      {/* Fullscreen overlay when dragging */}
      {isDragging && (
        <div className="fixed inset-0 z-50" style={{ cursor: 'ew-resize' }} />
      )}

      {/* Model Viewer Container */}
      <div
        className="flex-1 relative bg-black flex flex-col"
        style={{ minWidth: `${minChatWidth}px` }}
      >
        {isChangingModel && (
          <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
            <div className="text-white text-xl">
              Loading{' '}
              {targetGender?.charAt(0).toUpperCase() + targetGender?.slice(1)}{' '}
              Model...
            </div>
          </div>
        )}
        {/* Mobile: subtract 72px for controls, Desktop: full height */}
        <div
          className="md:h-screen w-full relative"
          style={{ height: '100vh - 140px' }}
        >
          <iframe
            id="myViewer"
            ref={iframeRef}
            src={viewerUrl}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            allow="fullscreen"
            allowFullScreen
            onLoad={() => {
              console.log('=== iframe loaded ===');
              console.log('viewerUrl:', viewerUrl);
              setIsChangingModel(false);
            }}
          />
        </div>

        {/* Controls - Desktop */}
        <div
          className="absolute bottom-6 right-6 md:flex space-x-4 hidden"
          style={{ zIndex: 1000 }}
        >
          <button
            onClick={handleRotate}
            disabled={isRotating || isResetting || !isReady}
            className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
              isRotating || isResetting || !isReady
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <CropRotateIcon
              className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`}
            />
            <span>{isRotating ? 'Rotating...' : 'Rotate Model'}</span>
          </button>
          <button
            onClick={handleReset}
            disabled={isResetting || (!needsReset && selectedParts === null)}
            className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
              isResetting || (!needsReset && selectedParts === null)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <RestartAltIcon
              className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`}
            />
            <span>{isResetting ? 'Resetting...' : 'Reset View'}</span>
          </button>
          <button
            onClick={handleSwitchModel}
            disabled={isChangingModel}
            className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
              isChangingModel ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {currentGender === 'male' ? (
              <MaleIcon
                className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`}
              />
            ) : (
              <FemaleIcon
                className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`}
              />
            )}
            <span>
              {isChangingModel
                ? 'Loading...'
                : `Switch to ${currentGender === 'male' ? 'Female' : 'Male'}`}
            </span>
          </button>
        </div>

        {/* Mobile Controls */}
        <MobileControls
          isRotating={isRotating}
          isResetting={isResetting}
          isReady={isReady}
          needsReset={needsReset}
          selectedParts={selectedParts}
          isChangingModel={isChangingModel}
          currentGender={currentGender}
          selectedPart={selectedPart}
          onRotate={handleRotate}
          onReset={handleReset}
          onSwitchModel={handleSwitchModel}
          onZoom={handleZoom}
          onHeightChange={handleBottomSheetHeight}
        />
      </div>

      {/* Drag Handle - Desktop Only */}
      <div
        onMouseDown={startDragging}
        className="hidden md:block w-1 hover:w-2 bg-gray-800 hover:bg-indigo-600 cursor-ew-resize transition-all duration-150 active:bg-indigo-500 flex-shrink-0 z-40"
        style={{ touchAction: 'none' }}
      />

      {/* Right side - Popup with animation - Desktop Only */}
      <div
        className={`hidden md:block flex-shrink-0 transform ${
          isDragging ? '' : 'transition-all duration-300 ease-in-out'
        } ${'translate-x-0 opacity-100'}`}
        style={{
          width: `${chatWidth}px`,
          minWidth: `${minChatWidth}px`,
          maxWidth: `${maxChatWidth}px`,
        }}
      >
        <div className="h-full border-l border-gray-800">
          <PartPopup
            part={selectedPart}
            onClose={() => {
              console.log('Closing popup');
              setSelectedPart(null);
              setSelectedParts(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
