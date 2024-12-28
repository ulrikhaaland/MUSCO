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
import { bodyPartGroups, BodyPartGroup } from '../config/bodyPartGroups';
import {
  getPartGroup,
  getGroupParts,
  createSelectionMap,
  getNeutralId,
} from '../utils/anatomyHelpers';

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
  onObjectSelected: (event: any) => void;
  initialGender: Gender;
  selectedParts: BodyPartGroup | null;
  setSelectedParts: (parts: BodyPartGroup | null) => void;
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
  currentGender: Gender;
  needsReset: boolean;
  setNeedsReset: (value: boolean) => void;
  isReady: boolean;
} {
  const humanRef = useRef<HumanAPI | null>(null);
  const initialCameraRef = useRef<CameraPosition | null>(null);
  const selectionEventRef = useRef<any>(null);
  const selectedPartGroupRef = useRef<BodyPartGroup | null>(null);
  const [currentGender, setCurrentGender] = useState<Gender>(initialGender);
  const [needsReset, setNeedsReset] = useState(false);
  const [isReady, setIsReady] = useState(false);


  // Add logging when props change
  useEffect(() => {
    console.log('=== useHumanAPI Props Changed ===');
    console.log('selectedParts:', selectedParts);
  }, [selectedParts]);

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
    let isInitialized = false;

    const initializeViewer = () => {
      if (!window.HumanAPI) {
        console.log('Loading HumanAPI script...');
        script = document.createElement('script');
        script.src =
          'https://developer.biodigital.com/builds/api/human-api-3.0.0.min.js';
        script.async = true;
        script.onload = setupHumanAPI;
        document.body.appendChild(script);
      } else {
        console.log('HumanAPI already loaded, setting up...');
        setupHumanAPI();
      }
    };

    const setupHumanAPI = () => {
      try {
        console.log('=== Setting up HumanAPI ===');

        // Clean up existing instance if it exists
        if (humanRef.current) {
          console.log('Cleaning up existing HumanAPI instance');
          humanRef.current.send('human.ready', null);
          humanRef.current.send('camera.updated', null);
          humanRef.current.send('scene.objectsSelected', null);
          humanRef.current = null;
          setIsReady(false);
        }

        // Determine if we're on mobile
        const isMobile = window.innerWidth < 768;
        const cameraPosition = isMobile 
          ? { x: 0, y: 0, z: -50 } // More zoomed out for mobile
          : { x: 0, y: 0, z: -25 };
        
        console.log(`Setting initial camera position (${isMobile ? 'mobile' : 'desktop'}):`, cameraPosition);

        const human = new window.HumanAPI(elementId, {
          camera: {
            position: cameraPosition,
          },
        });
        console.log('Created HumanAPI instance:', human);

        // Set the ref immediately
        humanRef.current = human;
        console.log('Set humanRef.current:', humanRef.current);

        // Set up event listeners
        human.on('human.ready', () => {
          console.log('Human API is ready');

          // Enable features
          human.send('scene.enableXray', () => {});
          human.send('scene.disableHighlight', () => {});

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
            console.log('=== scene.objectsSelected event received ===');
            console.log('Event:', event);
            if (Object.values(event).every((value) => value === false)) {
              console.log('All objects deselected');
              setSelectedPart(null);
              setSelectedParts(null);
              selectedPartGroupRef.current = null;
              selectionEventRef.current = null;
              return;
            }

            if (Object.keys(event).length > 1) {
              return;
            }

            const selectedId = Object.keys(event)[0];
            const storedEvent = event;
            const storedId = Object.keys(storedEvent)[0];

            // Check if part belongs to a group
            const group = getPartGroup(selectedId, bodyPartGroups);

            if (group) {
              // Store the group in ref
              selectedPartGroupRef.current = group;

              // Get the current gender value directly from state
              const gender = initialGender;
              console.log('Creating selection map for gender:', gender);

              // Create selection map with current gender
              const selectionMap = createSelectionMap(
                group.selectIds || group.ids,
                gender
              );
              console.log('Selection map:', selectionMap);

              // Create a group part object
              const groupPart: AnatomyPart = {
                objectId: storedId,
                name: group.name,
                description: `${group.name} area`,
                available: true,
                shown: true,
                selected: true,
                parent: '',
                children: [],
              };

              // Set the selected part and parts
              setSelectedPart(groupPart);
              setSelectedParts(group);

              human.send('scene.selectObjects', {
                ...selectionMap,
                replace: false,
              });
            }

            // Now call the original onObjectSelected with the stored event
            if (onObjectSelected) {
              onObjectSelected(storedEvent);
            }

            // Clear the stored event
            selectionEventRef.current = null;
          });

          // Mark as ready and call onReady callback
          isInitialized = true;
          setIsReady(true);
          onReady?.();
        });
      } catch (error) {
        console.error('Error initializing HumanAPI:', error);
        setIsReady(false);
      }
    };

    console.log('Starting HumanAPI initialization...');
    initializeViewer();

    return () => {
      if (!isInitialized) {
        console.log('Cleaning up uninitialized HumanAPI...');
        if (script) {
          document.body.removeChild(script);
        }
        setIsReady(false);
        humanRef.current = null;
      }
    };
  }, [elementId, initialGender]); // Add initialGender to dependencies

  // Update currentGender when initialGender changes
  useEffect(() => {
    console.log('initialGender changed:', initialGender);
    setCurrentGender(initialGender);
  }, [initialGender]);

  // Add effect to log gender changes
  useEffect(() => {
    console.log('currentGender updated:', currentGender);
  }, [currentGender]);

  // Add resize handler
  useEffect(() => {
    const handleResize = () => {
      if (!humanRef.current) return;
      
      const isMobile = window.innerWidth < 768;
      const cameraPosition = isMobile 
        ? { x: 0, y: 0, z: -50 }
        : { x: 0, y: 0, z: -25 };

      console.log('Window resized, updating camera position:', cameraPosition);
      humanRef.current.send('camera.set', {
        position: cameraPosition,
        animate: true
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    humanRef,
    currentGender,
    needsReset,
    setNeedsReset,
    isReady,
  };
}
