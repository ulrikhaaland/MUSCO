'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Gender } from '../../types';
import { AnatomyPart } from '../../types/anatomy';
import PartPopup from '../ui/PartPopup';
import { useHumanAPI } from '@/app/hooks/useHumanAPI';
import { bodyPartGroups } from '@/app/config/bodyPartGroups';
import { getPartGroup, getGroupParts, createSelectionMap } from '@/app/utils/anatomyHelpers';

interface HumanViewerProps {
  gender: Gender;
}

export default function HumanViewer({ gender }: HumanViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const selectedPartsRef = useRef<AnatomyPart[]>([]);
  const [selectedParts, setSelectedParts] = useState<AnatomyPart[]>([]);
  const [selectedPart, setSelectedPart] = useState<AnatomyPart | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const lastSelectedIdRef = useRef<string | null>(null);
  const deselectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const minChatWidth = 300;
  const maxChatWidth = 800;
  const [chatWidth, setChatWidth] = useState(() => {
    if (typeof window !== 'undefined') {
      return Math.min(
        Math.max(minChatWidth, window.innerWidth / 2),
        maxChatWidth
      );
    }
    return 384;
  });
  const [isDragging, setIsDragging] = useState(false);
  const lastWidthRef = useRef(chatWidth);
  const rafRef = useRef<number | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const rotationAnimationRef = useRef<number | null>(null);

  const MODEL_IDS = {
    male: '5rlY',
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

  const handleObjectSelected = useCallback((event: any) => {
    console.log('scene.objectsSelected', event);

    const selectedId = Object.keys(event)[0];
    const isSelected = event[selectedId];

    // Clear any pending deselection timeout
    if (deselectionTimeoutRef.current) {
      clearTimeout(deselectionTimeoutRef.current);
      deselectionTimeoutRef.current = null;
    }

    // If this is a deselection and we're not in the middle of a selection sequence
    if (!isSelected && selectedId === lastSelectedIdRef.current) {
      deselectionTimeoutRef.current = setTimeout(() => {
        // Just clear the selection state without resetting the model
        setSelectedPart(null);
        setSelectedParts([]);
        lastSelectedIdRef.current = null;
      }, 50);
      return;
    }

    // If this is a new selection, update the last selected ID
    if (isSelected && selectedId) {
      lastSelectedIdRef.current = selectedId;
      const human = humanRef.current;

      if (human) {
        // First, get info about all objects in the scene
        human.send('scene.info', (response: any) => {
          try {
            console.log('Scene info:', response);

            const objects = response.objects;
            if (!objects) {
              console.error('No objects found in scene.info response');
              return;
            }

            const objectsArray: AnatomyPart[] = Array.isArray(objects)
              ? objects
              : Object.values(objects);

            const selectedPart = objectsArray.find(
              (obj: AnatomyPart) => obj.objectId === selectedId
            );

            if (!selectedPart) return;

            // Log detailed information about the selected part
            console.log('Selected part:', {
              id: selectedPart.objectId,
              name: selectedPart.name,
              description: selectedPart.description
            });

            const group = getPartGroup(selectedPart, bodyPartGroups);

            if (group) {
              // Log group information
              console.log(`Part belongs to group: ${group.name}`);
              // Get all parts in the group
              const groupSelection = getGroupParts(group, objectsArray);
              console.log(`${group.name} parts found:`, groupSelection);

              // Create selection map
              const selectionMap = createSelectionMap(groupSelection);

              // Select all parts in the group
              human.send('scene.selectObjects', selectionMap);

              // Create a group part object
              const groupPart: AnatomyPart = {
                objectId: selectedId,
                name: group.name,
                description: `${group.name} area`,
                available: true,
                shown: true,
                selected: true,
                parent: '',
                children: []
              };

              setSelectedPart(groupPart);
              setSelectedParts(objectsArray.filter(obj => 
                groupSelection.includes(obj.objectId)
              ));

              // Update the UI with the group part instead of the selected part
              const mouseEvent = window.event as MouseEvent;
              if (mouseEvent) {
                handlePartSelect(groupPart, {
                  clientX: mouseEvent.clientX,
                  clientY: mouseEvent.clientY,
                });
              }
            } else {
              // If it's not part of a group, just select the individual part
              const selectionMap = {
                [selectedId]: true
              };
              
              human.send('scene.selectObjects', selectionMap);
              setSelectedPart(selectedPart);
              setSelectedParts([selectedPart]);

              // Update the UI with the individual part
              const mouseEvent = window.event as MouseEvent;
              if (mouseEvent) {
                handlePartSelect(selectedPart, {
                  clientX: mouseEvent.clientX,
                  clientY: mouseEvent.clientY,
                });
              }
            }
          } catch (error) {
            console.error('Error handling selection:', error);
          }
        });
      }
    }
  }, [handlePartSelect]);

  const { humanRef, handleReset } = useHumanAPI({
    elementId: 'myViewer',
    onObjectSelected: handleObjectSelected
  });

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
    if (!human || isRotating) return;

    setIsRotating(true);
    const startRotation = currentRotation % 360;  // Normalize to 0-360
    const targetRotation = startRotation === 0 ? 180 : 0;

    // Set up the callback first
    const onComplete = () => {
      setCurrentRotation(targetRotation);
      setIsRotating(false);
      console.log('Camera rotation complete');
    };

    // Then send the camera command
    human.send('camera.set', {
      position: targetRotation === 180 ? 
        { x: 0, y: 0, z: 25 } :  // Back view
        { x: 0, y: 0, z: -25 },  // Front view
      target: { x: 0, y: 0, z: 0 },  // Always look at center
      up: { x: 0, y: 1, z: 0 },      // Keep "up" direction
      animate: true,
      animationDuration: 1.0
    });

    // Update state after animation duration
    setTimeout(onComplete, 1000);
  }, [isRotating, currentRotation]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
      }
    };
  }, []);

  const viewerUrl = new URL('https://human.biodigital.com/viewer/');
  viewerUrl.searchParams.set('id', MODEL_IDS[gender]);
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
        <iframe
          id="myViewer"
          ref={iframeRef}
          src={viewerUrl.toString()}
          style={{
            width: '100%',
            height: '100%',
            border: 'none',
            display: 'block',
          }}
          allow="fullscreen"
          allowFullScreen
        />
        <div className="absolute bottom-6 right-6 flex space-x-4" style={{ zIndex: 1000 }}>
          <button
            onClick={handleRotate}
            disabled={isRotating}
            className={`bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
              isRotating ? 'opacity-75 cursor-not-allowed' : ''
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
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2"
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
            <span>Reset View</span>
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
