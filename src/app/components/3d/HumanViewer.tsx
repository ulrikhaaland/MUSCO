'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Gender } from '../../types';
import { AnatomyPart, SelectedPartInfo } from '../../types/anatomy';
import PartPopup from '../ui/PartPopup';
import { HumanAPI, HumanAPIConstructor } from '@/app/types/human';

declare global {
  interface Window {
    HumanAPI: HumanAPIConstructor;
  }
}

interface HumanViewerProps {
  gender: Gender;
}

export default function HumanViewer({ gender }: HumanViewerProps) {
  const humanRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const controls = useRef<any>(null);
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

  const MODEL_IDS = {
    male: '5rlY',
    female: '5rlW',
  };

  const handleReset = () => {
    console.log('Reset clicked, humanRef.current:', humanRef.current);
    if (humanRef.current) {
      humanRef.current.send('scene.reset');
      humanRef.current.send('camera.reset');
      // humanRef.current.send('camera.zoom', { distance: 'default' });
      setSelectedParts([]);
      setSelectedPart(null);
    }
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

  useEffect(() => {
    selectedPartsRef.current = selectedParts;
  }, [selectedParts]);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const initializeViewer = () => {
      if (!window.HumanAPI) {
        script = document.createElement('script');
        script.src =
          'https://developer.biodigital.com/builds/api/human-api-3.0.0.min.js';
        script.async = true;
        script.onload = setupHumanAPI;
        document.body.appendChild(script);
      } else {
        setupHumanAPI();
      }
    };

    const setupHumanAPI = () => {
      if (iframeRef.current) {
        try {
          const human = new window.HumanAPI('myViewer', {
            camera: {
              position: { z: -25 },
            },
          });

          humanRef.current = human;

          human.on('human.ready', () => {
            console.log('Human API is ready');

            // Enable isolate tool
            human.send('ui.setDisplay', {
              isolate: true,
              tools: true,
            });

            human.on('scene.objectsSelected', (event: any) => {
              console.log('scene.objectsSelected', event);

              const selectedId = Object.keys(event)[0];
              const isSelected = event[selectedId];

              // Clear any pending deselection timeout
              if (deselectionTimeoutRef.current) {
                clearTimeout(deselectionTimeoutRef.current);
                deselectionTimeoutRef.current = null;
              }

              // If this is a deselection, wait a bit to see if it's part of a selection sequence
              if (!isSelected && selectedId === lastSelectedIdRef.current) {
                deselectionTimeoutRef.current = setTimeout(() => {
                  handleReset();
                  lastSelectedIdRef.current = null;
                }, 50); // Small delay to catch part-switching sequence
                return;
              }

              // If this is a new selection, update the last selected ID
              if (isSelected) {
                lastSelectedIdRef.current = selectedId;
              }

              if (selectedId && human) {
                // Clear any previous selections first
                human.send('scene.selectObjects', {
                  ids: [], // Clear all selections
                  clear: true,
                });

                // Then select only the new part
                human.send('scene.selectObjects', {
                  ids: [selectedId],
                  clear: true,
                });

                // First focus camera on the part
                human.send('camera.set', {
                  objectId: selectedId,
                  animate: true,
                  animationStyle: 'around',
                  animationDuration: selectedParts.length === 0 ? 0.5 : 0.1,
                });

                human.send('scene.info', (response: any) => {
                  console.log('Part info:', response);

                  const objects = response.objects;
                  if (!objects) {
                    console.error('No objects found in scene.info response');
                    return;
                  }

                  const objectsArray: AnatomyPart[] = Array.isArray(objects)
                    ? objects
                    : Object.values(objects);

                  // Only get the single selected part
                  const selectedPart = objectsArray.find(
                    (obj: AnatomyPart) => obj.objectId === selectedId
                  );

                  if (selectedPart) {
                    // Update state with only the new selected part
                    setSelectedParts([selectedPart]);

                    const mouseEvent = window.event as MouseEvent;
                    console.log(
                      'Showing popup for part:',
                      selectedPart,
                      'at position:',
                      {
                        x: mouseEvent.clientX,
                        y: mouseEvent.clientY,
                      }
                    );

                    handlePartSelect(selectedPart, {
                      clientX: mouseEvent.clientX,
                      clientY: mouseEvent.clientY,
                    });
                  }
                });
              }
            });
          });
        } catch (error) {
          console.error('Error initializing HumanAPI:', error);
        }
      }
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.onload = initializeViewer;
    }

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
      if (controls.current) {
        controls.current.dispose();
      }
    };
  }, [handlePartSelect]);

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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (deselectionTimeoutRef.current) {
        clearTimeout(deselectionTimeoutRef.current);
      }
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

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

  useEffect(() => {
    const handleResize = () => {
      setChatWidth(
        Math.min(Math.max(minChatWidth, window.innerWidth / 2), maxChatWidth)
      );
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
        <button
          onClick={handleReset}
          className="absolute bottom-6 right-6 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2"
          style={{ zIndex: 1000 }}
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
            onClose={() => {
              console.log('Closing popup');
              setSelectedPart(null);
            }}
          />
        </div>
      </div>
    </div>
  );
}
