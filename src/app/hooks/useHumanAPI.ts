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
  const currentSelectionRef = useRef<AnatomyPart[]>([]);
  const selectedPartGroupRef = useRef<BodyPartGroup | null>(null);
  const [currentGender, setCurrentGender] = useState<Gender>(initialGender);
  const [needsReset, setNeedsReset] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Update currentSelectionRef when selectedParts changes
  useEffect(() => {
    currentSelectionRef.current = selectedParts;
  }, [selectedParts]);

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
            console.log('=== scene.objectsSelected START ===');
            console.log('Event received:', event);
            console.log(
              'Current selectedParts from ref:',
              currentSelectionRef.current
            );
            console.log(
              'Current selectionEventRef:',
              selectionEventRef.current
            );
            console.log(
              'Current selectedPartGroup:',
              selectedPartGroupRef.current
            );

            const selectedId = Object.keys(event)[0];
            console.log('Selected ID:', selectedId);

            // Create a deselection map for the selected objects
            const deselectionMap = Object.keys(event).reduce((acc, key) => {
              if (event[key] === true) {
                acc[key] = false;
              }
              return acc;
            }, {} as Record<string, boolean>);

            // Deselect the specific objects
            if (Object.keys(deselectionMap).length === 1) {
              const neutralSelectedId = getNeutralId(selectedId);
              // Check if the selected part is already part of the current group
              const isPartOfCurrentGroup =
                selectedPartGroupRef.current &&
                (selectedPartGroupRef.current.ids.includes(neutralSelectedId) ||
                  selectedPartGroupRef.current.selectIds?.includes(
                    neutralSelectedId
                  ));

              if (isPartOfCurrentGroup) {
                // If it's part of current group, clear everything
                setSelectedPart(null);
                setSelectedParts([]);
                selectedPartGroupRef.current = null;
                currentSelectionRef.current = [];
                human.send('scene.selectObjects', { replace: true });
                selectionEventRef.current = null;
                return;
              }

              // Store the selection event before deselecting
              selectionEventRef.current = event;
              human.send('scene.selectObjects', deselectionMap);
            } else if (
              Object.keys(deselectionMap).length === 0 &&
              selectionEventRef.current
            ) {
              // We have a stored event and got a deselection, now process the selection
              const storedEvent = selectionEventRef.current;
              const storedId = Object.keys(storedEvent)[0];

              // Get scene info to find the selected part
              human.send('scene.info', (response: any) => {
                try {
                  const objects = response.objects;
                  if (!objects) {
                    console.error('No objects found in scene.info response');
                    return;
                  }

                  const objectsArray: AnatomyPart[] = Array.isArray(objects)
                    ? objects
                    : Object.values(objects);

                  const selectedPart = objectsArray.find(
                    (obj: AnatomyPart) => obj.objectId === storedId
                  );

                  if (!selectedPart) {
                    console.error('Selected part not found');
                    return;
                  }

                  // Check if part belongs to a group
                  const group = getPartGroup(selectedPart, bodyPartGroups);

                  if (group) {
                    console.log('Found group:', group.name);
                    const groupSelection = getGroupParts(group, objectsArray);
                    console.log('Group parts:', groupSelection);

                    // Store the group in ref
                    selectedPartGroupRef.current = group;

                    // Create selection map
                    const selectionMap = createSelectionMap(groupSelection);

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
                    const filteredParts = objectsArray.filter((obj) =>
                      groupSelection.includes(obj.objectId)
                    );
                    console.log(
                      'Setting selectedParts to (group):',
                      filteredParts
                    );
                    setSelectedParts(filteredParts);
                    console.log('selectionMap:', selectionMap);
                    // Select all parts in the group
                    human.send('scene.selectObjects', {
                      ...selectionMap,
                      replace: true,
                    });
                  } else {
                    // If no group, clear the group ref
                    selectedPartGroupRef.current = null;
                    // If no group, just select the individual part
                    setSelectedPart(selectedPart);
                    console.log('Setting selectedParts to (single):', [
                      selectedPart,
                    ]);
                    setSelectedParts([selectedPart]);

                    human.send('scene.selectObjects', {
                      [storedId]: true,
                      replace: true,
                    });
                  }

                  // Now call the original onObjectSelected with the stored event
                  if (onObjectSelected) {
                    onObjectSelected(storedEvent);
                  }
                } catch (error) {
                  console.error('Error processing selection:', error);
                }
              });

              // Clear the stored event
              selectionEventRef.current = null;
            }
            console.log('=== scene.objectsSelected END ===');
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
  }, [
    elementId,
    onReady,
    onObjectSelected,
    checkCameraPosition,
    selectedParts,
    setSelectedPart,
    setSelectedParts,
  ]);

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
