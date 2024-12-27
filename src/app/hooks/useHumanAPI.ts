import {
  useEffect,
  useRef,
  MutableRefObject,
  useCallback,
  useState,
} from 'react';
import { HumanAPI } from '../types/human';
import { Gender } from '../types';
import { AnatomyPart } from '../types/anatomy';

interface CameraPosition {
  position: {
    x: number;
    y: number;
    z: number;
  };
  target: {
    x: number;
    y: number;
    z: number;
  };
  up: {
    x: number;
    y: number;
    z: number;
  };
  zoom: number;
}

interface UseHumanAPIProps {
  elementId: string;
  onReady?: () => void;
  onObjectSelected?: (event: any) => void;
  initialGender: Gender;
  selectedParts: AnatomyPart[];
  setSelectedParts: (parts: AnatomyPart[]) => void;
  setSelectedPart: (part: AnatomyPart | null) => void;
}

export function useHumanAPI({
  elementId,
  onReady,
  onObjectSelected,
  initialGender,
  selectedParts,
  setSelectedParts,
  setSelectedPart,
}: UseHumanAPIProps): {
  humanRef: MutableRefObject<HumanAPI | null>;
  handleReset: () => void;
  currentGender: Gender;
  needsReset: boolean;
  setNeedsReset: (value: boolean) => void;
  isReady: boolean;
} {
  const humanRef = useRef<HumanAPI | null>(null);
  const initialCameraRef = useRef<CameraPosition | null>(null);
  const selectionEventRef = useRef<any>(null);
  const [currentGender, setCurrentGender] = useState<Gender>(initialGender);
  const [needsReset, setNeedsReset] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Function to check if camera has moved
  const checkCameraPosition = useCallback(() => {
    if (!humanRef.current || !initialCameraRef.current) return;

    humanRef.current.send('camera.info', (currentCamera: CameraPosition) => {
      const initial = initialCameraRef.current!;

      // Check if camera has moved significantly (allowing for small floating point differences)
      const hasMoved =
        Math.abs(currentCamera.position.x - initial.position.x) > 0.1 ||
        Math.abs(currentCamera.position.y - initial.position.y) > 0.1 ||
        Math.abs(currentCamera.position.z - initial.position.z) > 0.1 ||
        Math.abs(currentCamera.target.x - initial.target.x) > 0.1 ||
        Math.abs(currentCamera.target.y - initial.target.y) > 0.1 ||
        Math.abs(currentCamera.target.z - initial.target.z) > 0.1;

      setNeedsReset(hasMoved);
    });
  }, []);

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
      try {
        const human = new window.HumanAPI(elementId, {
          camera: {
            position: { z: -25 },
          },
        });
        human.send('scene.enableXray', () => {});

        humanRef.current = human;

        // Remove any existing event listeners first
        human.send('human.ready', null);
        human.send('camera.updated', null);
        if (onObjectSelected) {
          human.send('scene.objectsSelected', null);
        }

        human.on('human.ready', () => {
          console.log('Human API is ready');

          // Store initial camera position
          human.send('camera.info', (camera: CameraPosition) => {
            console.log('Initial camera info:', camera);
            initialCameraRef.current = camera;
          });

          // Enable isolate tool
          human.send('ui.setDisplay', {
            isolate: true,
            tools: true,
          });

          // Listen for camera changes
          human.on('camera.updated', checkCameraPosition);

          // Listen for object selection and enable xray mode
          human.on('scene.objectsSelected', (event) => {
            // Create a deselection map for the selected objects
            const deselectionMap = Object.keys(event).reduce((acc, key) => {
              if (event[key] === true) {
                acc[key] = false;
              }
              return acc;
            }, {} as Record<string, boolean>);

            // Deselect the specific objects
            if (Object.keys(deselectionMap).length === 1) {
              human.send('scene.selectObjects', deselectionMap);
              selectionEventRef.current = event;
            } else if (
              Object.keys(deselectionMap).length === 0 &&
              selectionEventRef.current
            ) {
              // Only call onObjectSelected with the stored event when we get the deselection event
              onObjectSelected!(selectionEventRef.current);
              selectionEventRef.current = null;
            }
          });

          setIsReady(true);
          onReady?.();
        });
      } catch (error) {
        console.error('Error initializing HumanAPI:', error);
      }
    };

    initializeViewer();

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
      // Remove event listeners
      if (humanRef.current) {
        humanRef.current.send('human.ready', null);
        humanRef.current.send('camera.updated', null);
        if (onObjectSelected) {
          humanRef.current.send('scene.objectsSelected', null);
        }
      }
      setIsReady(false);
    };
  }, [elementId, onReady, onObjectSelected, checkCameraPosition]);

  const handleReset = useCallback(() => {
    if (!humanRef.current || !initialCameraRef.current) return;

    humanRef.current.send('camera.set', {
      ...initialCameraRef.current,
      animate: true,
      animationDuration: 0.002,
    });

    // Reset the needs reset flag
    setNeedsReset(false);
  }, []);

  // Update currentGender when initialGender changes
  useEffect(() => {
    setCurrentGender(initialGender);
  }, [initialGender]);

  return {
    humanRef,
    handleReset,
    currentGender,
    needsReset,
    setNeedsReset,
    isReady,
  };
}
