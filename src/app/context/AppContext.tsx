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
import { AnatomyPart } from '../types/human';
import { BodyPartGroup } from '../config/bodyPartGroups';

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
  completeExerciseSelection: () => void;
  completeRecoverySelection: () => void;
  resetSelectionState: () => void;
  // 3D model selection state
  selectedPart: AnatomyPart | null;
  selectedPartRef: MutableRefObject<AnatomyPart | null>;
  setSelectedGroup: (
    group: BodyPartGroup | null,
    isObjectSelection?: boolean
  ) => void;
  setSelectedPart: (part: AnatomyPart | null) => void;
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

  // Refs to track state in event handlers
  const intentionRef = useRef(intention);
  const isSelectingExerciseRef = useRef(isSelectingExerciseBodyParts);
  const selectedExerciseGroupsRef = useRef(selectedExerciseGroups);
  const selectedPainfulAreasRef = useRef(selectedPainfulAreas);
  const selectedGroupsRef = useRef(selectedGroups);
  const selectedPartRef = useRef(selectedPart);

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
        setIsSelectingExerciseBodyParts(true);
        isSelectingExerciseRef.current = true;
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
    if (selectedExerciseGroups.length > 0) {
      setIsSelectingExerciseBodyParts(false);
      isSelectingExerciseRef.current = false;
      // Clear the current visual selection state since we're moving to painful areas
      setSelectedGroups([]);
    }
  }, [selectedExerciseGroups.length]);

  const completeRecoverySelection = useCallback(() => {
    setIsSelectingRecoveryBodyParts(false);
  }, []);

  const resetSelectionState = useCallback(() => {
    // Don't reset intention, only reset the current stage
    if (intention === ProgramIntention.Exercise) {
      if (!isSelectingExerciseBodyParts) {
        // If we're in the painful areas selection stage, only reset painful areas
        setSelectedPainfulAreas([]);
        selectedPainfulAreasRef.current = [];
        setSelectedGroups([]);
        selectedGroupsRef.current = [];
        setSelectedPart(null);
        selectedPartRef.current = null;
      } else {
        // If we're in the exercise areas selection stage, reset exercise areas
        setSelectedExerciseGroups([]);
        selectedExerciseGroupsRef.current = [];
        setSelectedGroups([]);
        selectedGroupsRef.current = [];
        setSelectedPart(null);
        selectedPartRef.current = null;
      }
    } else if (intention === ProgramIntention.Recovery) {
      // For recovery, just reset the current selection
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
  }, [intention, isSelectingExerciseBodyParts]);

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
      } else {
        console.log('No intention set - group selection ignored');
      }
    },
    []
  );

  const handleSetSelectedPart = useCallback((part: AnatomyPart | null) => {
    setSelectedPart(part);
  }, []);

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
        completeExerciseSelection,
        completeRecoverySelection,
        resetSelectionState,
        // 3D model selection values
        selectedPart,
        selectedPartRef,
        setSelectedGroup: handleSetSelectedGroup,
        setSelectedPart: handleSetSelectedPart,
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
