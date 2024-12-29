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

interface AnatomyObject {
  objectId: string;
  name: string;
  children?: string[];
  description?: string;
  available?: boolean;
  shown?: boolean;
  parent?: string;
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
  const lastSelectedIdRef = useRef<string | null>(null);
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
  const [targetGender, setTargetGender] = useState<Gender | null>(null);
  const [modelContainerHeight, setModelContainerHeight] = useState('100dvh');

  const [isMobile, setIsMobile] = useState(false);
  const selectedPartsRef = useRef<BodyPartGroup | null>(null);
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

  const {
    humanRef,
    currentGender,
    needsReset,
    setNeedsReset,
    isReady,
    initialCameraRef,
  } = useHumanAPI({
    elementId: 'myViewer',
    initialGender: gender,
    selectedParts,
    selectedPart,
    setSelectedParts,
    setSelectedPart,
    onZoom: (objectId?: string) => handleZoom(objectId),
  });

  // Keep selectedPartsRef in sync
  useEffect(() => {
    selectedPartsRef.current = selectedParts;
  }, [selectedParts]);

  const handleZoom = (objectId?: string) => {
    // First get current camera info
    humanRef.current.send('camera.info', (camera) => {
      if (objectId) {
        // If a part group is selected, focus on those parts while maintaining camera properties
        humanRef.current.send('camera.set', {
          objectId: objectId,
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
        handleReset();
        // If no part group selected, reset to initial camera position
        // if (initialCameraRef.current) {
        //   humanRef.current.send('camera.set', {
        //     ...initialCameraRef.current,
        //     animate: true,
        //     animationDuration: 0.5,
        //   });
        // }
      }
    });
  };

  const getBodyPartIds = useCallback((partKeyword: string) => {
    const human = humanRef.current;
    if (!human) return;

    human.send('scene.info', (response: any) => {
      if (!response.objects) return;

      const objects = Object.values(response.objects) as AnatomyObject[];
      const allFoundIds: string[] = [];
      const searched = new Set<string>();

      // Helper function to get all descendant IDs of a node
      const getAllDescendantIds = (parentId: string): string[] => {
        const obj = objects.find((o) => o.objectId === parentId);
        if (!obj) return [];

        let ids = [obj.objectId];
        if (obj.children) {
          obj.children.forEach((childId) => {
            ids = [...ids, ...getAllDescendantIds(childId)];
          });
        }
        return ids;
      };

      // Helper function for deep search
      const deepSearch = (
        objectId: string,
        searchTerm: string,
        path: string[] = []
      ) => {
        if (searched.has(objectId)) return;
        searched.add(objectId);

        const obj = objects.find((o) => o.objectId === objectId);
        if (!obj) return;

        // Add current object's name to path
        const currentPath = [...path, obj.name];

        // Log the current path for debugging

        // Check if current object's name matches search term
        if (obj.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          const descendantIds = getAllDescendantIds(obj.objectId);
          allFoundIds.push(...descendantIds);
        }

        // Recursively search children
        if (obj.children) {
          obj.children.forEach((childId) => {
            deepSearch(childId, searchTerm, currentPath);
          });
        }
      };

      // Start search from each system root
      const systemIds = {
        muscular: 'human_19_male_muscular_system-muscular_system_ID',
        connective: 'human_19_male_connective_tissue-connective_tissue_ID',
        skeletal: 'human_19_male_skeletal_system-skeletal_system_ID',
      };

      Object.values(systemIds).forEach((systemId) => {
        deepSearch(systemId, partKeyword);
      });

      // Format and print unique IDs
      const uniqueIds = [...new Set(allFoundIds)].map((id) => {
        const formattedId = `'${id.replace('human_19_male_', '')}'`;
        return formattedId;
      });

      console.log('Found IDs:');
      for (const id of uniqueIds) {
        console.log(id + ',');
      }
    });
  }, []);

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
    viewerUrl.searchParams.set('initial.none', 'false');
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
      console.log('Human API ready, sending commands...');
      // First deselect all parts with an empty selection map
      // humanRef.current.send('scene.selectObjects', {
      //   replace: true,
      // });

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

  const handleBottomSheetHeight = (sheetHeight: number) => {
    const newHeight = `calc(100dvh - ${sheetHeight}px)`;
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
          style={{ height: isMobile ? modelContainerHeight : '100dvh' }}
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
        <button
          onClick={() => getBodyPartIds('bones of head')}
          className="absolute bottom-6 left-6 z-50 bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2"
        >
          <span>Get Part IDs</span>
        </button>

        {/* Mobile Controls */}
        {isMobile && (
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
            onHeightChange={handleBottomSheetHeight}
          />
        )}
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
