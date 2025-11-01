import {
  useEffect,
  useRef,
  MutableRefObject,
  useCallback,
  useState,
} from 'react';
import { AnatomyPart, HumanAPI } from '../types/human';
import { Gender } from '../types';
import { bodyPartGroups, BodyPartGroup } from '../config/bodyPartGroups';
import {
  getPartGroup,
  createSelectionMap,
  getNeutralId,
  getGenderedId,
} from '../utils/anatomyHelpers';
import { ProgramIntention, useApp } from '../context/AppContext';
import { loadHumanSdk } from '../utils/loadHumanSdk';
import { diffSelect } from '../utils/selectionDelta';
import { throttle } from '../utils/throttle';

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
  onZoom?: (objectId?: string) => void;
}

export function useHumanAPI({
  elementId,
  onReady,
  initialGender,
  onZoom,
}: UseHumanAPIProps): {
  humanRef: MutableRefObject<HumanAPI | null>;
  currentGender: Gender;
  needsReset: boolean;
  setNeedsReset: (value: boolean) => void;
  isReady: boolean;
  initialCameraRef: MutableRefObject<CameraPosition | null>;
  previousSelectedPartGroupRef: MutableRefObject<BodyPartGroup | null>;
  isResettingRef: MutableRefObject<boolean>;
  resetModel: () => void;
} {
  const {
    humanRef,
    setHumanRef,
    setSelectedGroup,
    setSelectedPart,
    intentionRef,
    selectedGroupsRef,
    selectedPartRef,
  } = useApp();
  const initialCameraRef = useRef<CameraPosition | null>(null);
  const selectionEventRef = useRef<any>(null);
  const previousSelectedPartGroupRef = useRef<BodyPartGroup | null>(null);
  // Remove local selectedPartRef - we use the one from AppContext now
  const selectedPartIdRef = useRef<string | null>(null);
  const isResettingRef = useRef<boolean>(false);
  const isXrayEnabledRef = useRef<boolean>(false);
  const canSelectRef = useRef<boolean>(true);
  const disableSelectionHandlerRef = useRef<boolean>(false);
  const lastPickTimeRef = useRef<number>(0);
  const PICK_RATE_LIMIT = 500; // ms between allowed picks
  const isPickRateLimitedRef = useRef<boolean>(false);
  const prevSelection = useRef<Record<string, boolean>>({});
  const didHydrateFromContextRef = useRef<boolean>(false);

  const [currentGender, setCurrentGender] = useState<Gender>(initialGender);
  const [needsReset, setNeedsReset] = useState(false);
  const [isReady, setIsReady] = useState(false);

  // Add refs for coordination between event handlers
  const isLowerBackPickRef = useRef<boolean>(false);
  const pendingObjectSelectedEventRef = useRef<any>(null);
  const isPendingObjectSelectedRef = useRef<boolean>(false);
  const PICK_WAIT_TIMEOUT = 100; // ms to wait for pick to complete
  const expectingProgrammaticSelectionRef = useRef<boolean>(false);
  const programmaticSelectionIdRef = useRef<string | null>(null);

  // Zoom helper – trigger on all viewports (desktop and mobile)
  const zoomIfMobile = useCallback(
    (objectId?: string) => {
      if (typeof window !== 'undefined') {
        onZoom?.(objectId);
      }
    },
    [onZoom]
  );

  // Add a function to reset the model state
  const resetModel = useCallback((resetSelectionState: boolean = false) => {
    if (!humanRef.current || isResettingRef.current) return;

    isResettingRef.current = true;

    // Disable X-ray if it's enabled
    if (isXrayEnabledRef.current) {
      humanRef.current.send('scene.disableXray', () => {});
      isXrayEnabledRef.current = false;
    }

    // Reset camera to initial position
    if (initialCameraRef.current) {
      humanRef.current.send('camera.set', {
        position: initialCameraRef.current.position,
        target: initialCameraRef.current.target,
        up: initialCameraRef.current.up,
        animate: true,
      });
    }

    // Use scene.reset to reset everything to initial state
    humanRef.current.send('scene.reset', () => {
      // Clear any selections
      previousSelectedPartGroupRef.current = null;
      selectedPartIdRef.current = null;
      selectedPartRef.current = null;

      if (resetSelectionState) {
        setSelectedPart(null);
        setSelectedGroup(null, false);
      }

      // Reset needs reset flag
      setNeedsReset(false);

      // Clear reset state after animation completes
      setTimeout(() => {
        isResettingRef.current = false;
      }, 500);
    });
  }, []);

  // Add rate limiting for infinite loop detection
  const callTimestamps: number[] = [];
  const CALL_WINDOW = 1000; // 1 second window
  const MAX_CALLS_DEFAULT = 10;
  const MAX_CALLS_RECOVERY = 5;
  // Function to check if camera has moved

  useEffect(() => {
    let isInitialized = false;

    const initializeViewer = async () => {
      try {
        await loadHumanSdk();
        setupHumanAPI();
      } catch (error) {
        console.error('Failed to load Human SDK:', error);
      }
    };

    const setupHumanAPI = () => {
      try {
        // Clean up existing instance if it exists
        if (humanRef.current) {
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

        const human = new window.HumanAPI(elementId, {
          camera: {
            position: cameraPosition,
          },
        });

        // Set the ref using context's setter
        setHumanRef(human);

        // Set up event listeners
        human.on('human.ready', () => {
          human.send('scene.disableHighlight', () => {});

          // Store initial camera position
          human.send('camera.info', (camera: CameraPosition) => {
            initialCameraRef.current = camera;
          });

          const onCam = throttle(() => {
            if (!isResettingRef.current) setNeedsReset(true);
          });
          human.on('camera.updated', onCam);

          human.on('scene.objectsSelected', onObjectSelected);

          human.on('scene.picked', onObjectPicked);

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

    initializeViewer();

    return () => {
      if (!isInitialized) {
        setIsReady(false);
        humanRef.current = null;
      }
    };
  }, [elementId, initialGender]); // Add initialGender to dependencies

  // Update currentGender when initialGender changes
  useEffect(() => {
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

      humanRef.current.send('camera.set', {
        position: cameraPosition,
        animate: true,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Hydrate model selection from AppContext state (after restoreViewerState)
  // Track the current selection to detect when it changes (e.g., after restore)
  const prevSelectedGroupsLengthRef = useRef(0);
  const prevSelectedPartIdRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!isReady || !humanRef.current) return;
    
    const currentGroupsLength = selectedGroupsRef.current.length;
    const currentPartId = selectedPartRef.current?.objectId || null;
    
    // Detect if selection state changed from empty to populated (restoration scenario)
    const selectionChanged = 
      (prevSelectedGroupsLengthRef.current === 0 && currentGroupsLength > 0) ||
      (prevSelectedPartIdRef.current === null && currentPartId !== null);
    
    // Reset hydration flag if selection was restored
    if (selectionChanged && didHydrateFromContextRef.current) {
      didHydrateFromContextRef.current = false;
    }
    
    // Update tracking refs
    prevSelectedGroupsLengthRef.current = currentGroupsLength;
    prevSelectedPartIdRef.current = currentPartId;
    
    // Skip if already hydrated
    if (didHydrateFromContextRef.current) return;
    
    const hasState =
      selectedGroupsRef.current.length > 0 ||
      !!selectedPartRef.current;
    if (!hasState) return;

    const gender = currentGender;

    let selectionMap: Record<string, boolean> = {};
    let zoomId: string | null = null;

    console.log('[useHumanAPI] Hydration - selectedPartRef:', selectedPartRef.current);
    console.log('[useHumanAPI] Hydration - selectedGroupsRef:', selectedGroupsRef.current);

    // Priority: If a specific part is present, select ONLY the part (not the group)
    if (selectedPartRef.current) {
      // Select only the specific part
      console.log('[useHumanAPI] Selecting specific part:', selectedPartRef.current.objectId);
      selectionMap = { [selectedPartRef.current.objectId]: true } as Record<string, boolean>;
      zoomId = selectedPartRef.current.objectId;
      if (!isXrayEnabledRef.current) {
        humanRef.current.send('scene.enableXray', () => {});
        isXrayEnabledRef.current = true;
      }
    } else if (selectedGroupsRef.current.length > 0) {
      // Only select the group if there's no specific part
      const group = selectedGroupsRef.current[0];
      console.log('[useHumanAPI] Selecting group:', group.name);
      selectionMap = createSelectionMap(group.selectIds, gender);
      zoomId = getGenderedId(group.zoomId, gender);
      if (!isXrayEnabledRef.current) {
        humanRef.current.send('scene.enableXray', () => {});
        isXrayEnabledRef.current = true;
      }
    }

    console.log('[useHumanAPI] Selection map:', selectionMap);

    if (Object.keys(selectionMap).length) {
      // Set the programmatic selection flag to prevent event handlers from overriding
      expectingProgrammaticSelectionRef.current = true;
      if (selectedPartRef.current) {
        programmaticSelectionIdRef.current = selectedPartRef.current.objectId;
      }
      
      prevSelection.current = {};
      humanRef.current.send('scene.selectObjects', { ...selectionMap, replace: true });
      Object.assign(prevSelection.current, selectionMap);
      didHydrateFromContextRef.current = true;
      
      // Clear the programmatic flag after a delay (to allow event to process)
      setTimeout(() => {
        expectingProgrammaticSelectionRef.current = false;
        programmaticSelectionIdRef.current = null;
      }, 1000);
      
      if (zoomId) {
        zoomIfMobile(zoomId);
      }
    }
  }, [isReady, currentGender, selectedGroupsRef, selectedPartRef, zoomIfMobile]);

  function onObjectPicked(event: any) {
    if (!event.position) return;

    // Apply rate limiting
    const now = Date.now();
    if (now - lastPickTimeRef.current < PICK_RATE_LIMIT) {
      // Flag that we're currently rate-limited
      isPickRateLimitedRef.current = true;

      // Reset the rate limit flag after the timeout expires
      setTimeout(
        () => {
          isPickRateLimitedRef.current = false;
        },
        PICK_RATE_LIMIT - (now - lastPickTimeRef.current)
      );

      return;
    }

    // Update last pick time
    lastPickTimeRef.current = now;
    isPickRateLimitedRef.current = false;

    const pickedId = event.objectId;
    if (!pickedId) return;

    // Previously we only processed latissimus dorsi and gluteus picks to prevent accidental selections.
    // However, this blocked valid selections for other body parts (e.g., abdomen muscles).
    // We now allow all muscle picks to pass through. Special handling for the lower back is
    // still applied further below using position checks. If needed, narrow this with a more
    // generic exclusion list rather than hard-coding two muscles.

    const pos = event.position;
    if (!pos) {
      console.warn('No 3D intersection returned from scene.pick');
      return;
    }

    // A click around y-axis 100-111 from the BACK should trigger lower-back handling.
    // Use pos.z < 0 as a cheap back-side heuristic (works in default coordinate system).
    const isBackSide = pos.z < 0;
    const isLikelyLowerBack = isBackSide && pos.y < 111 && pos.y > 100;
    console.debug('onObjectPicked', {
      isLikelyLowerBack,
      posY: pos.y,
      posZ: pos.z,
      pickedId,
    });

    // Set flag for object selected to check
    isLowerBackPickRef.current = isLikelyLowerBack;

    // Only apply special handling if it's the lower back and pelvis isn't already selected
    if (
      isLikelyLowerBack &&
      previousSelectedPartGroupRef.current?.id !== 'pelvis'
    ) {
      const gender = initialGender;
      const lowerBackId = getGenderedId(
        'connective_tissue-articular_cartilage_of_right_inferior_articular_facet_of_L3_vertebra_ID',
        gender
      );

      // Set flags to indicate we're expecting a programmatic selection
      expectingProgrammaticSelectionRef.current = true;
      programmaticSelectionIdRef.current = lowerBackId;

      // Select the lower back
      prevSelection.current = {};
      humanRef.current?.send('scene.selectObjects', {
        [lowerBackId]: true,
        replace: true,
      });
      prevSelection.current[lowerBackId] = true;

      // Clear any pending onObjectSelected event
      pendingObjectSelectedEventRef.current = null;
      isPendingObjectSelectedRef.current = false;
    }

    // Reset the flag after a timeout
    setTimeout(() => {
      isLowerBackPickRef.current = false;
    }, PICK_WAIT_TIMEOUT);
  }

  function onObjectSelected(event: any) {
    if (event.mode === 'query') return;

    console.debug('[DBG] onObjectSelected', event);

    // If we're rate limited, process immediately
    if (isPickRateLimitedRef.current) {
      processObjectSelected(event);
      return;
    }

    // Check if this is a programmatic selection we were expecting
    if (
      expectingProgrammaticSelectionRef.current &&
      programmaticSelectionIdRef.current
    ) {
      const selectedIds = Object.keys(event);
      if (selectedIds.includes(programmaticSelectionIdRef.current)) {
        console.log('Processing programmatic lower back selection');
        // Process this event immediately
        processObjectSelected(event);
        // Reset the flags
        expectingProgrammaticSelectionRef.current = false;
        programmaticSelectionIdRef.current = null;
        return;
      }
    }

    // Get the selected object ID
    const selectedIds = Object.keys(event);
    if (selectedIds.length > 0) {
      const selectedId = selectedIds[0];

      // Process immediately if:
      // 1. The ID is NOT latissimus_dorsi or gluteus, OR
      // 2. Pelvis is already selected
      const notSpecialMuscle =
        !selectedId.includes('latissimus_dorsi') &&
        !selectedId.includes('gluteus');
      const isPelvisSelected =
        previousSelectedPartGroupRef.current?.id === 'pelvis';

      if (
        notSpecialMuscle ||
        isPelvisSelected ||
        isPickRateLimitedRef.current
      ) {
        processObjectSelected(event);
        return;
      }
    }

    // Otherwise, store the event and set the pending flag
    pendingObjectSelectedEventRef.current = event;
    isPendingObjectSelectedRef.current = true;

    // Wait for onObjectPicked to complete
    setTimeout(() => {
      // Skip if this was handled by a lower back pick
      if (isLowerBackPickRef.current) {
        console.log('Skipping onObjectSelected due to lower back pick');
        pendingObjectSelectedEventRef.current = null;
        isPendingObjectSelectedRef.current = false;
        return;
      }

      // Process the event if still pending
      if (
        isPendingObjectSelectedRef.current &&
        pendingObjectSelectedEventRef.current
      ) {
        processObjectSelected(pendingObjectSelectedEventRef.current);
        pendingObjectSelectedEventRef.current = null;
        isPendingObjectSelectedRef.current = false;
      }
    }, PICK_WAIT_TIMEOUT);
  }

  // Extract the main processing logic to a separate function
  function processObjectSelected(event: any) {
    // Check if handler is temporarily disabled - only relevant for None intention
    if (
      disableSelectionHandlerRef.current &&
      intentionRef.current === ProgramIntention.None
    ) {
      return;
    }

    // Add timestamp for this call
    const now = Date.now();
    callTimestamps.push(now);

    // Remove timestamps older than our window
    while (callTimestamps.length > 0 && callTimestamps[0] < now - CALL_WINDOW) {
      callTimestamps.shift();
    }

    const maxCalls =
      intentionRef.current === ProgramIntention.Recovery
        ? MAX_CALLS_RECOVERY
        : MAX_CALLS_DEFAULT;

    // Check for infinite loop
    if (callTimestamps.length >= maxCalls) {
      return;
    }

    // Process the event based on intention
    switch (intentionRef.current) {
      case ProgramIntention.Recovery:
        handleOnObjectSelectedRecovery(event);
        break;
      case ProgramIntention.None:
        handleOnObjectSelectedNone(event);
        break;
    }
  }

  function handleOnObjectSelectedNone(event: any) {
    console.log('[handleOnObjectSelectedNone] Called with event:', event);
    console.log('[handleOnObjectSelectedNone] expectingProgrammaticSelection:', expectingProgrammaticSelectionRef.current);
    console.log('[handleOnObjectSelectedNone] programmaticSelectionId:', programmaticSelectionIdRef.current);
    
    // Skip if this is a programmatic selection (e.g., from hydration)
    if (expectingProgrammaticSelectionRef.current) {
      console.log('[handleOnObjectSelectedNone] Skipping - programmatic selection');
      return;
    }
    
    if (isResettingRef.current) {
      if (isXrayEnabledRef.current) {
        isXrayEnabledRef.current = false;
      }
      return;
    }
    const objects = Object.keys(event);

    const selectedId = objects[0];

    // Check for deselection (all values are false)
    const isDeselection = Object.values(event).every(
      (value) => value === false
    );

    // Update selectedPartIdRef after knowing deselection status
    if (isDeselection) {
      // Preserve previously stored part id for potential reset branch
      // Do not clear until after potential reset handling
    } else {
      selectedPartIdRef.current = selectedId;
    }

    if (objects.length > 1) {
      return;
    }

    // If not in current group, proceed with group selection
    const group = getPartGroup(selectedId);

    // Special-case: if the clicked part belongs to shoulder or back master groups, highlight ONLY that part.
    const specialGroupIds = new Set([
      'left_shoulder',
      'right_shoulder',
      'back',
    ]);
    const selectedNeutralId = getNeutralId(selectedId);

    const isShoulderBackPart = Object.values(bodyPartGroups).some(
      (g) =>
        specialGroupIds.has(g.id) &&
        g.parts.some((p) => p.objectId === selectedNeutralId)
    );

    if (group && isShoulderBackPart) {
      // Ensure X-ray is on for clarity
      if (!isXrayEnabledRef.current) {
        humanRef.current?.send('scene.enableXray', () => {});
        isXrayEnabledRef.current = true;
      }



      // Update state – keep grouping info but point to the individual part
      setSelectedGroup(group, true);

      const partMeta = group.parts.find(
        (p) => p.objectId === selectedNeutralId
      );
      const groupPart: AnatomyPart = {
        objectId: selectedId,
        name: partMeta?.name ?? 'Selected Part',
        description: partMeta ? `${partMeta.name} area` : 'Selected area',
        available: true,
        shown: true,
        selected: true,
        parent: '',
        children: [],
        group: group.name,
      };

      selectedPartRef.current = groupPart;
      setSelectedPart(groupPart);

      // Zoom exactly to the clicked object (mobile only)
      zoomIfMobile(getGenderedId(selectedId, currentGender));

      // Track selection & group for future deselection logic
      previousSelectedPartGroupRef.current = group;
      prevSelection.current = { [selectedId]: true };



      // Exit early – skip standard grouping logic
      return;
    }

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
            (part) => getGenderedId(part.objectId, gender) === selectedId
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
          [getGenderedId('muscular_system-right_cremaster_ID', gender)]: false,
          [getGenderedId('muscular_system-left_cremaster_ID', gender)]: false,
        });
      }

      // Process regular deselection map
      Object.assign(
        deselectionMap,
        group.deselectIds.reduce((acc, id) => {
          const genderedId = getGenderedId(id, gender);
          acc[genderedId] = false;
          return acc;
        }, {})
      );

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
          // First, enable X-ray if not enabled
          if (!isXrayEnabledRef.current) {
            humanRef.current?.send('scene.enableXray', () => {});
            isXrayEnabledRef.current = true;
          }

          // Find the part for the group part object
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

          // Send selection and update state with a small delay to prevent race conditions
          safeSelectObjects({ [selectedId]: true }, { replace: true }, true);

          // Update selected part
          selectedPartRef.current = groupPart;
          setSelectedPart(groupPart);

          // Zoom to the part (mobile only)
          zoomIfMobile(selectedId);

          return;
        }
      } else {
        // set timeout 50ms
        setTimeout(() => {
          console.debug('[None] Potential group reset branch', {
            isDeselection,
            inXray: isXrayEnabledRef.current,
            clickedId: selectedId,
            currentSelectedPart: selectedPartRef.current?.objectId,
          });
          if (
            isDeselection &&
            isXrayEnabledRef.current &&
            selectedId === selectedPartRef.current?.objectId &&
            previousSelectedPartGroupRef.current &&
            selectedPartIdRef.current
          ) {
            console.debug('[None] Resetting to group view');
            setSelectedPart(null);
            selectedPartRef.current = null;
            selectionEventRef.current = null;
            isXrayEnabledRef.current = false;
            zoomIfMobile(getGenderedId(group.zoomId, gender));
            return;
          } else {
            // humanRef.current?.send('scene.enableXray', () => {});
            // isXrayEnabledRef.current = true;
          }
        }, 100);
        if (previousSelectedPartGroupRef.current?.id !== group.id) {
          setSelectedGroup(group, true);
          selectedPartRef.current = null;
        }

        if (!selectedPartRef.current)
          safeSelectObjects(
            {
              [selectedId]: false,
            },
            {},
            true
          );

        const fullSelectionMap = { ...selectionMap, ...deselectionMap };
        prevSelection.current = {};
        humanRef.current?.send('scene.selectObjects', {
          ...fullSelectionMap,
          replace: true,
        });
        Object.assign(prevSelection.current, fullSelectionMap);

        if (!isXrayEnabledRef.current) {
          humanRef.current?.send('scene.enableXray', () => {});
          isXrayEnabledRef.current = true;
        }
      }

      // Store the group in ref
      previousSelectedPartGroupRef.current = group;
      if (!selectedPartRef.current)
        zoomIfMobile(getGenderedId(group.zoomId, gender));
    }

    // Clear the stored event
    selectionEventRef.current = null;
  }

  // Exercise-specific handler removed

  function handleOnObjectSelectedRecovery(event: any) {
    if (isResettingRef.current) {
      if (isXrayEnabledRef.current) {
        isXrayEnabledRef.current = false;
      }
      return;
    }
    selectedPartIdRef.current = null;
    const objects = Object.keys(event);

    const selectedId = objects[0];

    // Check for deselection (all values are false)
    const isDeselection = Object.values(event).every(
      (value) => value === false
    );

    if (!isDeselection) selectedPartIdRef.current = selectedId;

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
            (part) => getGenderedId(part.objectId, gender) === selectedId
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
          [getGenderedId('muscular_system-right_cremaster_ID', gender)]: false,
          [getGenderedId('muscular_system-left_cremaster_ID', gender)]: false,
        });
      }
      // 'connective_tissue-connective_tissue_of_vertebral_column_ID',
      // 'connective_tissue-intervertebral_discs_ID',
      // 'connective_tissue-anterior_longitudinal_ligament_ID',
      // 'skeletal_system-cervical_vertebrae_ID',
      // 'skeletal_system-thoracic_vertebrae_ID',
      if (group.id !== 'back') {
        Object.assign(deselectionMap, {
          [getGenderedId(
            'connective_tissue-connective_tissue_of_vertebral_column_ID',
            gender
          )]: false,
          [getGenderedId('connective_tissue-intervertebral_discs_ID', gender)]:
            false,
          [getGenderedId(
            'connective_tissue-anterior_longitudinal_ligament_ID',
            gender
          )]: false,
          [getGenderedId('skeletal_system-cervical_vertebrae_ID', gender)]:
            false,
          [getGenderedId('skeletal_system-thoracic_vertebrae_ID', gender)]:
            false,
        });
      }

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
          const selectionMap = { [selectedId]: true };
          const delta = diffSelect(prevSelection.current, selectionMap);
          if (Object.keys(delta).length) {
            humanRef.current?.send('scene.selectObjects', {
              ...delta,
              replace: false,
            });
            Object.assign(prevSelection.current, delta);
          }
          if (!isXrayEnabledRef.current) {
            humanRef.current?.send('scene.enableXray', () => {});
            isXrayEnabledRef.current = true;
          }

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
          zoomIfMobile(selectedId);
        }
      } else {
        // set timeout 50ms
        setTimeout(() => {
          if (
            isDeselection &&
            isXrayEnabledRef.current &&
            selectedId === selectedPartRef.current.objectId &&
            previousSelectedPartGroupRef.current &&
            !selectedPartIdRef.current
          ) {
            humanRef.current?.send('scene.disableXray', () => {});
            isXrayEnabledRef.current = false;
            setSelectedPart(null);
            selectedPartRef.current = null;
            selectionEventRef.current = null;
            isXrayEnabledRef.current = false;
            zoomIfMobile(getGenderedId(group.zoomId, gender));
            return;
          }
        }, 100);

        setSelectedGroup(group, true);

        humanRef.current?.send('scene.showObjects', {
          ...selectionMap,
          ...deselectionMap,
          replace: true,
        });
        const newSelectionMap = { ...prevSelection.current };
        delete newSelectionMap[selectedId];
        const delta = diffSelect(prevSelection.current, newSelectionMap);
        if (Object.keys(delta).length) {
          humanRef.current?.send('scene.selectObjects', {
            ...delta,
            replace: false,
          });
          Object.assign(prevSelection.current, delta);
        }
      }

      // Store the group in ref
      previousSelectedPartGroupRef.current = group;
      if (!selectedPartRef.current)
        zoomIfMobile(getGenderedId(group.zoomId, gender));
    }

    // Clear the stored event
    selectionEventRef.current = null;
  }

  // Exercise selection map helper removed
  // Create a helper function to safely send scene.selectObjects commands
  const safeSelectObjects = (
    selectionMap: Record<string, boolean>,
    options = {},
    withSafeSelect = false
  ) => {
    if (!humanRef.current) return;

    // Disable the selection handler temporarily
    if (withSafeSelect) {
      disableSelectionHandlerRef.current = true;
    }

    // Check if this is a replace operation
    const isReplace = (options as any)?.replace === true;

    if (isReplace) {
      // Full reset - clear previous selection tracking
      prevSelection.current = {};
      // Send the selection command with replace
      humanRef.current.send('scene.selectObjects', {
        ...selectionMap,
        ...options,
      });
      // Update tracking with new selection
      Object.assign(prevSelection.current, selectionMap);
    } else {
      // Use delta selection
      const delta = diffSelect(prevSelection.current, selectionMap);
      if (Object.keys(delta).length) {
        humanRef.current.send('scene.selectObjects', {
          ...delta,
          replace: false,
          ...options,
        });
        // Update tracking with delta changes
        Object.assign(prevSelection.current, delta);
      }
    }

    // Re-enable the handler after a short delay
    setTimeout(() => {
      if (withSafeSelect) {
        disableSelectionHandlerRef.current = false;
      }
    }, 100);
  };

  return {
    humanRef,
    currentGender,
    needsReset,
    setNeedsReset,
    isReady,
    initialCameraRef,
    previousSelectedPartGroupRef,
    isResettingRef,
    resetModel,
  };
}
