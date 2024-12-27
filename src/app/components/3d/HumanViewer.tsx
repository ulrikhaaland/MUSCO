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
} from '@/app/utils/anatomyHelpers';

interface HumanViewerProps {
  gender: Gender;
}

export default function HumanViewer({ gender }: HumanViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedParts, setSelectedParts] = useState<AnatomyPart[]>([]);
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
  const [xRayEnabled, setXRayEnabled] = useState(false);

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
      console.log('=== handleObjectSelected START ===');
      console.log('Event received:', event);
      console.log('Current selectedParts:', selectedParts);
      console.log('Current selectedPart:', selectedPart);
      console.log('Stack trace:', new Error().stack);

      const selectedId = Object.keys(event)[0];
      console.log('Selected ID:', selectedId);

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

  const {
    humanRef,
    handleReset: hookHandleReset,
    currentGender,
    needsReset,
    setNeedsReset,
    isReady,
  } = useHumanAPI({
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

  // Effect to handle xRay mode
  useEffect(() => {
    if (xRayEnabled) {
      humanRef.current?.send('scene.enableXray', () => {});
    } else {
      humanRef.current?.send('scene.disableXray', () => {});
    }
  }, [xRayEnabled]);

  // Monitor state changes
  useEffect(() => {
    console.log('=== HumanViewer State Change ===');
    console.log('selectedParts:', selectedParts);
    console.log('selectedPart:', selectedPart);
    console.log('Stack trace:', new Error().stack);
  }, [selectedParts, selectedPart]);

  const handleSwitchModel = useCallback(() => {
    setIsChangingModel(true);
    const newGender: Gender = currentGender === 'male' ? 'female' : 'male';
    setViewerUrl(getViewerUrl(newGender));

    // Reset states
    setSelectedPart(null);
    setSelectedParts([]);
    setCurrentRotation(0);

    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('gender', newGender);
    window.history.pushState({}, '', url.toString());
  }, [currentGender, getViewerUrl]);

  const handleReset = useCallback(() => {
    if (isResetting) return;

    setIsResetting(true);

    // Use scene.reset to reset everything to initial state
    if (humanRef.current) {
      if (xRayEnabled) {
        setXRayEnabled(false);
      }
      humanRef.current.send('scene.reset', () => {
        // Reset all our state after the scene has been reset
        setCurrentRotation(0);
        setSelectedPart(null);
        setSelectedParts([]);
        lastSelectedIdRef.current = null;
        setNeedsReset(false);

        // Clear reset state after a short delay to allow for animation
        setTimeout(() => {
          setIsResetting(false);
        }, 200);
      });
    }
  }, [isResetting, setNeedsReset, xRayEnabled]);

  // Update reset button state when parts are selected
  useEffect(() => {
    setNeedsReset(selectedParts.length > 0 || needsReset);
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

  return (
    <div
      className="relative flex"
      style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}
    >
      {/* Fullscreen overlay when dragging */}
      {isDragging && (
        <div className="fixed inset-0 z-50" style={{ cursor: 'ew-resize' }} />
      )}

      {/* Left side - Human Model */}
      <div
        className="flex-1 relative"
        style={{ minWidth: `${minChatWidth}px` }}
      >
        {isChangingModel && (
          <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
            <div className="text-white text-xl">
              Loading {currentGender === 'male' ? 'Female' : 'Male'} Model...
            </div>
          </div>
        )}
        <iframe
          id="myViewer"
          ref={iframeRef}
          src={viewerUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          allow="fullscreen"
          allowFullScreen
          onLoad={() => setIsChangingModel(false)}
        />
        <div
          className="absolute bottom-6 right-6 flex space-x-4"
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M15.24 5.148a7 7 0 1 1-9.092 9.092.75.75 0 0 1 1.06-1.06 5.5 5.5 0 1 0 7.122-7.123.75.75 0 1 1 1.06-1.06 7 7 0 0 1-.15.15ZM3.75 10a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.5-4.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{isRotating ? 'Rotating...' : 'Rotate Model'}</span>
          </button>
          <button
            onClick={handleReset}
            disabled={
              isResetting || (!needsReset && selectedParts.length === 0)
            }
            className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
              isResetting || (!needsReset && selectedParts.length === 0)
                ? 'opacity-50 cursor-not-allowed'
                : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                clipRule="evenodd"
              />
            </svg>
            <span>{isResetting ? 'Resetting...' : 'Reset View'}</span>
          </button>
          <button
            onClick={handleSwitchModel}
            disabled={isChangingModel}
            className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
              isChangingModel ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                clipRule="evenodd"
              />
            </svg>
            <span>
              {isChangingModel
                ? 'Loading...'
                : `Switch to ${currentGender === 'male' ? 'Female' : 'Male'}`}
            </span>
          </button>
        </div>
      </div>

      {/* Drag Handle */}
      <div
        onMouseDown={startDragging}
        className="w-1 hover:w-2 bg-gray-800 hover:bg-indigo-600 cursor-ew-resize transition-all duration-150 active:bg-indigo-500 flex-shrink-0 z-40"
        style={{ touchAction: 'none' }}
      />

      {/* Right side - Popup with animation */}
      <div
        className={`flex-shrink-0 transform ${
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
            selectedParts={selectedParts}
            onClose={() => {
              console.log('Closing popup');
              setSelectedPart(null);
              setSelectedParts([]);
            }}
          />
        </div>
      </div>
    </div>
  );
}
