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
  getGenderedId,
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
  initialGender: Gender;
  setSelectedGroup: (parts: BodyPartGroup | null) => void;
  setSelectedPart: (part: AnatomyPart | null) => void;

  onZoom?: (objectId?: string) => void;
}

export function useHumanAPI({
  elementId,
  onReady,
  initialGender,
  setSelectedGroup,
  setSelectedPart,
  onZoom,
}: UseHumanAPIProps): {
  humanRef: MutableRefObject<HumanAPI | null>;
  currentGender: Gender;
  needsReset: boolean;
  setNeedsReset: (value: boolean) => void;
  isReady: boolean;
  initialCameraRef: MutableRefObject<CameraPosition | null>;
  previousSelectedPartGroupRef: MutableRefObject<BodyPartGroup | null>;
} {
  const humanRef = useRef<HumanAPI | null>(null);
  const initialCameraRef = useRef<CameraPosition | null>(null);
  const selectionEventRef = useRef<any>(null);
  const previousSelectedPartGroupRef = useRef<BodyPartGroup | null>(null);
  const selectedPartRef = useRef<AnatomyPart | null>(null);
  const isXrayEnabledRef = useRef<boolean>(false);
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
          isXrayEnabledRef.current = false;
        }

        // Determine if we're on mobile
        const isMobile = window.innerWidth < 768;
        const cameraPosition = isMobile
          ? { x: 0, y: 0, z: -50 } // More zoomed out for mobile
          : { x: 0, y: 0, z: -25 };

        console.log(
          `Setting initial camera position (${
            isMobile ? 'mobile' : 'desktop'
          }):`,
          cameraPosition
        );

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

          // human.on('scene.picked', function (pick) {
          //   if (pick.objectId) {
          //     const group = getPartGroup(pick.objectId);
          //     if (group && group.id === 'back') {
          //       human.send('labels.create', {
          //         objectId: pick.objectId,
          //         title: 'Looking for the lower back?',
          //         description:
          //         '<button onclick="window.selectLowerBack()">Select Lower Back</button>',
          //       position: pick.position,
          //       theme: 'context',
          //       pinType: 'plus',
          //       labelOffset: [-32, 0],
          //       hideWire: false,
          //       pinGlow: true,
          //       occludable: true,
          //       collapseDescription: false,
          //       flyTo: false,
          //       });
          //     }
          //   }
          // });
          human.send('scene.disableHighlight', () => {});

          // Store initial camera position
          human.send('camera.info', (camera: CameraPosition) => {
            console.log('Initial camera info:', camera);
            initialCameraRef.current = camera;
          });

          // Listen for object selection and enable xray mode
          human.on('scene.objectsSelected', (event) => {
            console.log('=== scene.objectsSelected event received ===');
            console.log('Event:', event);

            const objects = Object.keys(event);

            const selectedId = objects[0];

            // Check for deselection (all values are false)
            const isDeselection = Object.values(event).every(
              (value) => value === false
            );

            console.log('isDeselection', isDeselection);
            // if (isDeselection && selectedPartRef.current) {
            //   return;
            //   console.log('All objects deselected');

            //   setTimeout(() => {
            //     if (
            //       !selectedPartRef.current ||
            //       selectedPartRef.current.objectId === selectedId
            //     ) {
            //       previousSelectedPartGroupRef.current = null;
            //       setTimeout(() => {
            //         onZoom?.(null);
            //       }, 500);
            //       setSelectedPart(null);
            //       setSelectedGroup(null);
            //       selectedPartRef.current = null;
            //       selectionEventRef.current = null;
            //       human.send('scene.disableXray', () => {});
            //       isXrayEnabledRef.current = false;
            //     }
            //   }, 0);
            //   return;
            // } else if (selectedPartRef.current?.objectId === selectedId) {
            //   return;
            // }

            if (objects.length > 1) {
              return;
            }

            // If not in current group, proceed with group selection
            const group = getPartGroup(selectedId);

            if (group) {
              // Get the current gender value directly from state
              const gender = initialGender;

              // Create selection map with current gender
              const selectionMap = createSelectionMap(group.selectIds, gender);

              const deselectionMap = {};

              let hasFoundGroup = false;
              // deselect all parts
              Object.values(bodyPartGroups).forEach((group) => {
                // Skip if current group contains the selected ID

                if (
                  !hasFoundGroup &&
                  group.parts.some(
                    (part) =>
                      getGenderedId(part.objectId, gender) === selectedId
                  )
                ) {
                  hasFoundGroup = true;
                  return;
                }

                // Only deselect IDs that aren't in the selection map
                const toDeselect = createSelectionMap(
                  group.selectIds.filter(
                    (id) => !selectionMap[getGenderedId(id, gender)]
                  ),
                  gender,
                  false
                );

                Object.assign(deselectionMap, toDeselect);
              });
              if (gender === 'male') {
                Object.assign(deselectionMap, {
                  [getGenderedId('muscular_system-right_cremaster_ID', gender)]:
                    false,
                  [getGenderedId('muscular_system-left_cremaster_ID', gender)]:
                    false,
                });
              }

              // let zoomID;

              const selectedIdNeutral = getNeutralId(selectedId);

              const isPartOfPreviousGroup =
                previousSelectedPartGroupRef.current?.parts.some(
                  (part) => part.objectId === selectedIdNeutral
                );

              if (
                previousSelectedPartGroupRef.current &&
                !isDeselection &&
                isPartOfPreviousGroup
              ) {
                const hasSelectedPartOfSelectedGroup =
                  previousSelectedPartGroupRef.current.parts.some(
                    (part) => part.objectId === selectedIdNeutral
                  );

                if (hasSelectedPartOfSelectedGroup) {
                  human.send('scene.selectObjects', {
                    [selectedId]: true,
                    replace: false,
                  });
                  if (!isXrayEnabledRef.current) {
                    human.send('scene.enableXray', () => {});
                    isXrayEnabledRef.current = true;
                  }
                  // zoomID = selectedId;

                  const part = group.parts.find(
                    (part) => part.objectId === selectedIdNeutral
                  );
                  // Create a group part object
                  const groupPart: AnatomyPart = {
                    objectId: selectedId,
                    name: part.name,
                    description: `${part.name} area`,
                    available: true,
                    shown: true,
                    selected: true,
                    parent: '',
                    children: [],
                    group: group.name,
                  };

                  selectedPartRef.current = groupPart;
                  setSelectedPart(groupPart);
                }
              } else {
                // zoomID = getGenderedId(group.zoomId, gender);

                // set timeout 50ms
                setTimeout(() => {
                  if (
                    isDeselection &&
                    isXrayEnabledRef.current &&
                    selectedId === selectedPartRef.current.objectId
                  ) {
                    human.send('scene.disableXray', () => {});
                    isXrayEnabledRef.current = false;
                    setSelectedPart(null);
                    selectedPartRef.current = null;
                    selectionEventRef.current = null;
                    isXrayEnabledRef.current = false;
                    return;
                  }
                }, 50);

                setSelectedGroup(group);

                human.send('scene.showObjects', {
                  ...selectionMap,
                  ...deselectionMap,
                  replace: true,
                });
                human.send('scene.selectObjects', {
                  [selectedId]: false,
                });
              }

              console.log('selectedPart', selectedPartRef.current);

              // Set the selected part and parts

              // Store the group in ref
              previousSelectedPartGroupRef.current = group;
              onZoom?.(getGenderedId(group.zoomId, gender));

              // setTimeout(() => {
              //   human.send('scene.enableXray', () => {});
              // }, 500);
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
        animate: true,
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
    initialCameraRef,
    previousSelectedPartGroupRef,
  };
}
