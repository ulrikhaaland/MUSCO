'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useRef,
  useEffect,
  MutableRefObject,
} from 'react';
import { AnatomyPart, HumanAPI } from '../types/human';
import { bodyPartGroups, BodyPartGroup } from '../config/bodyPartGroups';
import { createSelectionMap, getGenderedId } from '../utils/anatomyHelpers';
import { Gender } from '../types';

export enum ProgramIntention {
  Exercise = 'exercise',
  Recovery = 'recovery',
  None = 'none',
}

interface AppContextType {
  intention: ProgramIntention;
  intentionRef: MutableRefObject<ProgramIntention>;
  setIntention: (intention: ProgramIntention) => void;
  isSelectingExerciseBodyParts: boolean;
  isSelectingExerciseRef: MutableRefObject<boolean>;
  isSelectingRecoveryBodyParts: boolean;
  selectedExerciseGroups: BodyPartGroup[];
  selectedExerciseGroupsRef: MutableRefObject<BodyPartGroup[]>;
  selectedPainfulAreas: BodyPartGroup[];
  selectedPainfulAreasRef: MutableRefObject<BodyPartGroup[]>;
  selectedGroups: BodyPartGroup[];
  selectedGroupsRef: MutableRefObject<BodyPartGroup[]>;
  fullBodyRef: MutableRefObject<boolean>;
  completeExerciseSelection: () => void;
  completeRecoverySelection: () => void;
  resetSelectionState: () => void;
  completeReset: () => void;
  skipAuth: boolean;
  setSkipAuth: (skip: boolean) => void;
  // Navigation state
  shouldNavigateToProgram: boolean;
  setShouldNavigateToProgram: (should: boolean) => void;
  // 3D model selection state
  selectedPart: AnatomyPart | null;
  selectedPartRef: MutableRefObject<AnatomyPart | null>;
  setSelectedGroup: (
    group: BodyPartGroup | null,
    isObjectSelection?: boolean
  ) => void;
  setSelectedPart: (part: AnatomyPart | null) => void;
  humanRef: MutableRefObject<HumanAPI | null>;
  setHumanRef: (human: HumanAPI) => void;
  deselectGroup: (group: BodyPartGroup) => void;
  resetExerciseSelection: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [intention, setIntention] = useState<ProgramIntention>(
    ProgramIntention.None
  );
  const [isSelectingExerciseBodyParts, setIsSelectingExerciseBodyParts] =
    useState(false);
  const [isSelectingRecoveryBodyParts, setIsSelectingRecoveryBodyParts] =
    useState(false);
  const [selectedExerciseGroups, setSelectedExerciseGroups] = useState<
    BodyPartGroup[]
  >([]);
  const [selectedPainfulAreas, setSelectedPainfulAreas] = useState<
    BodyPartGroup[]
  >([]);
  const [selectedGroups, setSelectedGroups] = useState<BodyPartGroup[]>([]);
  const [selectedPart, setSelectedPart] = useState<AnatomyPart | null>(null);
  const [skipAuth, setSkipAuth] = useState(false);
  const [shouldNavigateToProgram, setShouldNavigateToProgram] = useState(true);
  const humanRef = useRef<HumanAPI | null>(null);

  // Refs to track state in event handlers
  const intentionRef = useRef(intention);
  const isSelectingExerciseRef = useRef(isSelectingExerciseBodyParts);
  const selectedExerciseGroupsRef = useRef(selectedExerciseGroups);
  const selectedPainfulAreasRef = useRef(selectedPainfulAreas);
  const selectedGroupsRef = useRef(selectedGroups);
  const selectedPartRef = useRef(selectedPart);
  const fullBodyRef = useRef(false);

  // Keep refs in sync with state
  useEffect(() => {
    intentionRef.current = intention;
  }, [intention]);

  useEffect(() => {
    isSelectingExerciseRef.current = isSelectingExerciseBodyParts;
  }, [isSelectingExerciseBodyParts]);

  useEffect(() => {
    selectedExerciseGroupsRef.current = selectedExerciseGroups;
  }, [selectedExerciseGroups]);

  useEffect(() => {
    selectedPainfulAreasRef.current = selectedPainfulAreas;
  }, [selectedPainfulAreas]);

  useEffect(() => {
    selectedGroupsRef.current = selectedGroups;
  }, [selectedGroups]);

  useEffect(() => {
    selectedPartRef.current = selectedPart;
  }, [selectedPart]);

  // Handle intention changes
  const handleSetIntention = useCallback((newIntention: ProgramIntention) => {
    console.log('handleSetIntention called with:', newIntention);

    resetSelectionState();
    setIntention(newIntention);

    // Set initial selection state based on intention
    switch (newIntention) {
      case ProgramIntention.Exercise:
        console.log('Setting exercise selection mode');
        // Skip the target area selection and go directly to painful areas
        setIsSelectingExerciseBodyParts(false);
        isSelectingExerciseRef.current = false;
        fullBodyRef.current = true; // Always use full body for target areas
        break;
      case ProgramIntention.Recovery:
        console.log('Setting recovery selection mode');
        setIsSelectingRecoveryBodyParts(true);
        break;
      default:
        console.log('Setting no selection mode');
    }
  }, []);

  const completeExerciseSelection = useCallback(() => {
    if (selectedExerciseGroups.length > 0 || fullBodyRef.current) {
      setIsSelectingExerciseBodyParts(false);
      isSelectingExerciseRef.current = false;
      // Clear the current visual selection state since we're moving to painful areas
      setSelectedGroups([]);
    }
  }, [selectedExerciseGroups.length]);

  const completeRecoverySelection = useCallback(() => {
    setIsSelectingRecoveryBodyParts(false);
  }, []);

  useEffect(() => {
    setIsSelectingExerciseBodyParts(isSelectingExerciseRef.current);
  }, [isSelectingExerciseRef.current]);

  const resetSelectionState = useCallback(() => {
    // Don't reset intention, only reset the current stage
    if (intention === ProgramIntention.Exercise) {
      if (!isSelectingExerciseRef.current) {
        // If we're in the painful areas selection stage, only reset painful areas
        setSelectedPainfulAreas([]);
        selectedPainfulAreasRef.current = [];
        setSelectedGroups([]);
        selectedGroupsRef.current = [];
        setSelectedPart(null);
        selectedPartRef.current = null;
        
        // Make sure isSelectingExerciseRef is set to false so the selected painful areas get updated properly
        isSelectingExerciseRef.current = false;
      } else {
        // Reset all selections
        setSelectedPainfulAreas([]);
        selectedPainfulAreasRef.current = [];
        // If we're in the exercise areas selection stage, reset exercise areas
        setSelectedExerciseGroups([]);
        selectedExerciseGroupsRef.current = [];
        setSelectedGroups([]);
        selectedGroupsRef.current = [];
        setSelectedPart(null);
        selectedPartRef.current = null;
        fullBodyRef.current = true;
      }
    } else if (intention === ProgramIntention.Recovery) {
      // For recovery, just reset the current selection
      setSelectedGroups([]);
      selectedGroupsRef.current = [];
      setSelectedPart(null);
      selectedPartRef.current = null;
    } else if (intention === ProgramIntention.None) {
      // For None intention, reset the single group and part selection
      setSelectedGroups([]);
      selectedGroupsRef.current = [];
      setSelectedPart(null);
      selectedPartRef.current = null;
    } else {
      // If no intention, reset everything
      setIntention(ProgramIntention.None);
      intentionRef.current = ProgramIntention.None;
      setIsSelectingExerciseBodyParts(false);
      isSelectingExerciseRef.current = false;
      setIsSelectingRecoveryBodyParts(false);
      setSelectedExerciseGroups([]);
      selectedExerciseGroupsRef.current = [];
      setSelectedPainfulAreas([]);
      selectedPainfulAreasRef.current = [];
      setSelectedGroups([]);
      selectedGroupsRef.current = [];
      setSelectedPart(null);
      selectedPartRef.current = null;
    }
  }, [intention, isSelectingExerciseRef.current]);

  // Add a complete reset function that resets everything unconditionally
  const completeReset = useCallback(() => {
    // Reset intention to the default
    setIntention(ProgramIntention.None);
    intentionRef.current = ProgramIntention.None;
    
    // Reset selection stages
    setIsSelectingExerciseBodyParts(false);
    isSelectingExerciseRef.current = false;
    setIsSelectingRecoveryBodyParts(false);
    
    // Clear all selections
    setSelectedExerciseGroups([]);
    selectedExerciseGroupsRef.current = [];
    setSelectedPainfulAreas([]);
    selectedPainfulAreasRef.current = [];
    setSelectedGroups([]);
    selectedGroupsRef.current = [];
    setSelectedPart(null);
    selectedPartRef.current = null;
    
    // Reset fullBody reference
    fullBodyRef.current = false;
    
    // Reset navigation state
    setShouldNavigateToProgram(true);
  }, []);

  // 3D model selection handlers
  const handleSetSelectedGroup = useCallback(
    (group: BodyPartGroup | null, isObjectSelection: boolean = false) => {
      console.log('handleSetSelectedGroup called with:', {
        group,
        isObjectSelection,
        currentIntention: intentionRef.current,
      });

      if (!group) {
        setSelectedGroups([]);
        setSelectedPart(null);
        if (isSelectingExerciseRef.current) fullBodyRef.current = true;
        return;
      }

      if (intentionRef.current === ProgramIntention.Exercise) {
        console.log('Exercise mode - handling group selection');
        console.log(
          'isSelectingExerciseBodyParts:',
          isSelectingExerciseRef.current
        );
        if (isSelectingExerciseRef.current) {
          // We're selecting target exercise areas
          setSelectedExerciseGroups((prev) => {
            const exists = prev.some((g) => g.id === group.id);
            // If it's an object selection, only add groups, never remove
            if (isObjectSelection && exists) {
              return prev;
            }
            const newGroups =
              exists && !isObjectSelection
                ? prev.filter((g) => g.id !== group.id)
                : [...prev, group];

            // Set fullBody to false when we have selections
            fullBodyRef.current = newGroups.length === 0;

            // Update selectedGroups to match exercise areas
            setSelectedGroups(newGroups);
            return newGroups;
          });
        } else {
          // We're selecting painful areas
          setSelectedPainfulAreas((prev) => {
            const exists = prev.some((g) => g.id === group.id);
            // If it's an object selection, only add groups, never remove
            if (isObjectSelection && exists) {
              return prev;
            }
            const newGroups =
              exists && !isObjectSelection
                ? prev.filter((g) => g.id !== group.id)
                : [...prev, group];

            // Update selectedGroups to match painful areas
            setSelectedGroups(newGroups);
            return newGroups;
          });
        }
        // In exercise mode, we don't allow part selection
        setSelectedPart(null);
      } else if (intentionRef.current === ProgramIntention.Recovery) {
        console.log('Recovery mode - handling group selection');
        if (isObjectSelection) {
          // For object selection in recovery mode
          const currentGroup = selectedGroups[0];
          if (currentGroup?.id === group.id) {
            // If clicking within the same group, handle part selection
            // The actual part selection will be handled by the useHumanAPI hook
            return;
          } else {
            // If clicking a different group, replace the current selection
            setSelectedGroups([group]);
            setSelectedPart(null);
          }
        } else {
          // For direct group selection (e.g., from UI), replace the current selection
          setSelectedGroups([group]);
          setSelectedPart(null);
        }
      } else if (intentionRef.current === ProgramIntention.None) {
        console.log('None intention - handling group selection');
        // In None mode, we only allow one group selection at a time
        if (isObjectSelection) {
          const currentGroup = selectedGroups[0];
          if (currentGroup?.id === group.id) {
            // If clicking within the same group, let the part selection be handled by useHumanAPI
            return;
          } else {
            // If clicking a different group, replace the current selection
            setSelectedGroups([group]);
            setSelectedPart(null);
          }
        } else {
          // For direct group selection (e.g., from UI), replace the current selection
          setSelectedGroups([group]);
          setSelectedPart(null);
        }
      } else {
        console.log('No intention set - group selection ignored');
      }
    },
    []
  );

  const handleSetSelectedPart = useCallback((part: AnatomyPart | null) => {
    setSelectedPart(part);
  }, []);

  const setHumanRef = (human: HumanAPI) => {
    humanRef.current = human;
  };

  const deselectGroup = useCallback((group: BodyPartGroup) => {
    if (!humanRef.current) return;

    // Get the current gender from the iframe's src attribute
    const iframe = document.getElementById('myViewer') as HTMLIFrameElement;
    const gender: Gender = iframe?.src.includes('5tOV') ? 'male' : 'female';
    if (isSelectingExerciseRef.current) {
      selectedExerciseGroupsRef.current =
        selectedExerciseGroupsRef.current.filter((g) => g.id !== group.id);
    } else {
      selectedPainfulAreasRef.current = selectedPainfulAreasRef.current.filter(
        (g) => g.id !== group.id
      );
    }
    // Only deselect IDs that aren't in the selection map
    const toDeselect = createSelectionMap(
      group.selectIds.map((id) => getGenderedId(id, gender)),
      gender,
      false
    );

    // Add male-specific deselections
    if (gender === 'male') {
      Object.assign(toDeselect, {
        [getGenderedId('muscular_system-right_cremaster_ID', gender)]: false,
        [getGenderedId('muscular_system-left_cremaster_ID', gender)]: false,
      });
    }

    // Send the deselection command
    humanRef.current.send('scene.selectObjects', {
      ...toDeselect,
      // replace: true,
    });
  }, []);

  function restartExerciseSelection(): void {
    isSelectingExerciseRef.current = true;
    resetSelectionState();
  }

  return (
    <AppContext.Provider
      value={{
        intention,
        intentionRef,
        setIntention: handleSetIntention,
        isSelectingExerciseBodyParts,
        isSelectingExerciseRef,
        isSelectingRecoveryBodyParts,
        selectedExerciseGroups,
        selectedExerciseGroupsRef,
        selectedPainfulAreas,
        selectedPainfulAreasRef,
        selectedGroups,
        selectedGroupsRef,
        fullBodyRef,
        completeExerciseSelection,
        completeRecoverySelection,
        resetSelectionState,
        completeReset,
        skipAuth,
        setSkipAuth,
        shouldNavigateToProgram,
        setShouldNavigateToProgram,
        selectedPart,
        selectedPartRef,
        setSelectedGroup: handleSetSelectedGroup,
        setSelectedPart: handleSetSelectedPart,
        humanRef,
        setHumanRef,
        deselectGroup,
        resetExerciseSelection: restartExerciseSelection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
