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
import { ChatMessage, Question, DiagnosisAssistantResponse } from '../types';
import { useAuth } from './AuthContext';
import { bodyPartGroups, BodyPartGroup } from '../config/bodyPartGroups';
import { createSelectionMap, getGenderedId } from '../utils/anatomyHelpers';
import { Gender } from '../types';

export enum ProgramIntention {
  Recovery = 'recovery',
  None = 'none',
}

interface AppContextType {
  intention: ProgramIntention;
  intentionRef: MutableRefObject<ProgramIntention>;
  setIntention: (intention: ProgramIntention) => void;
  isSelectingRecoveryBodyParts: boolean;
  selectedGroups: BodyPartGroup[];
  selectedGroupsRef: MutableRefObject<BodyPartGroup[]>;
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
  resetExerciseSelection: () => void; // kept for API compatibility; no-op
  // persistence helpers
  saveViewerState: () => void;
  restoreViewerState: () => void;
  // chat persistence
  saveChatState: (snapshot: ChatSnapshot) => void;
  restoreChatState: () => ChatSnapshot | null;
  clearChatState: () => void;
}

export interface ChatSnapshot {
  messages: ChatMessage[];
  followUpQuestions?: Question[];
  assistantResponse?: DiagnosisAssistantResponse | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [intention, setIntention] = useState<ProgramIntention>(
    ProgramIntention.None
  );
  const [isSelectingRecoveryBodyParts, setIsSelectingRecoveryBodyParts] =
    useState(false);
  const [selectedGroups, setSelectedGroups] = useState<BodyPartGroup[]>([]);
  const [selectedPart, setSelectedPart] = useState<AnatomyPart | null>(null);
  const [skipAuth, setSkipAuth] = useState(false);
  const [shouldNavigateToProgram, setShouldNavigateToProgram] = useState(true);
  const humanRef = useRef<HumanAPI | null>(null);

  // Refs to track state in event handlers
  const intentionRef = useRef(intention);
  const selectedGroupsRef = useRef(selectedGroups);
  const selectedPartRef = useRef(selectedPart);
  const fullBodyRef = useRef(false); // retained only for compatibility; unused

  // Keep refs in sync with state
  useEffect(() => {
    intentionRef.current = intention;
  }, [intention]);

  // No exercise mode – remove exercise-related sync effects

  useEffect(() => {
    selectedGroupsRef.current = selectedGroups;
  }, [selectedGroups]);

  useEffect(() => {
    selectedPartRef.current = selectedPart;
  }, [selectedPart]);

  // Auto-save viewer state to localStorage whenever selection changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    // Don't save if nothing is selected (avoid saving empty state on initial mount)
    if (selectedGroups.length === 0 && !selectedPart) return;
    
    try {
      const snapshot = {
        intention,
        selectedGroupIds: selectedGroups.map((g) => g.id),
        selectedPart,
      };
      console.log('[AppContext] Auto-saving viewer state:', snapshot);
      window.localStorage.setItem('viewerState', JSON.stringify(snapshot));
    } catch (e) {
      console.warn('Failed to auto-save viewer state', e);
    }
  }, [selectedGroups, selectedPart, intention]);

  // Handle intention changes
  const handleSetIntention = useCallback((newIntention: ProgramIntention) => {
    resetSelectionState();
    setIntention(newIntention);

    // Set initial selection state based on intention
    switch (newIntention) {
      case ProgramIntention.Recovery:
        setIsSelectingRecoveryBodyParts(true);
        break;
      default:
    }
  }, []);

  const completeRecoverySelection = useCallback(() => {
    setIsSelectingRecoveryBodyParts(false);
  }, []);

  const resetSelectionState = useCallback(() => {
    // Clear localStorage to prevent hydration from restoring old state
    try {
      window.localStorage.removeItem('viewerState');
      window.sessionStorage.removeItem('viewerState');
    } catch (e) {
      console.warn('Failed to clear viewer state', e);
    }
    
    // Don't reset intention, only reset the current stage
    if (intention === ProgramIntention.Recovery) {
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
      setIsSelectingRecoveryBodyParts(false);
      setSelectedGroups([]);
      selectedGroupsRef.current = [];
      setSelectedPart(null);
      selectedPartRef.current = null;
    }
  }, [intention]);

  // Add a complete reset function that resets everything unconditionally
  const completeReset = useCallback(() => {
    // Reset intention to the default
    setIntention(ProgramIntention.None);
    intentionRef.current = ProgramIntention.None;
    
    // Reset selection stages
    setIsSelectingRecoveryBodyParts(false);
    
    // Clear all selections
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
        return;
      }

      if (intentionRef.current === ProgramIntention.Recovery) {
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
    selectedGroupsRef.current = selectedGroupsRef.current.filter(
      (g) => g.id !== group.id
    );
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
    // no-op after retiring exercise mode
    resetSelectionState();
  }

  // Persist and restore viewer selection state across auth/subscription flows
  const saveViewerState = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const snapshot = {
        intention: intentionRef.current,
        selectedGroupIds: selectedGroupsRef.current.map((g) => g.id),
        selectedPart: selectedPartRef.current,
      } as const;
      window.sessionStorage.setItem('viewerState', JSON.stringify(snapshot));
      // Also save to localStorage for page reload persistence
      window.localStorage.setItem('viewerState', JSON.stringify(snapshot));
      // Also store current path so we can navigate back after auth/checkout
      try {
        window.sessionStorage.setItem('previousPath', window.location.pathname);
      } catch {}
    } catch (e) {
      console.warn('Failed to save viewer state', e);
    }
  }, []);

  const restoreViewerState = useCallback(() => {
    if (typeof window === 'undefined') return;
    // Try sessionStorage first (for auth flow), then localStorage (for page reload)
    const raw = window.sessionStorage.getItem('viewerState') || window.localStorage.getItem('viewerState');
    console.log('[AppContext] Restoring viewer state from storage:', raw);
    if (!raw) return;
    try {
      const data = JSON.parse(raw) as {
        intention: ProgramIntention;
        selectedGroupIds: string[];
        selectedPart: AnatomyPart | null;
      };
      
      console.log('[AppContext] Parsed viewer state:', data);

      // Helper to map ids -> BodyPartGroup objects
      const idToGroup = new Map(
        Object.values(bodyPartGroups).map((g) => [g.id, g] as const)
      );
      const mapIds = (ids: string[]) => ids.map((id) => idToGroup.get(id)).filter(Boolean) as BodyPartGroup[];

      // Apply state
      setIntention(data.intention);
      setSelectedGroups(mapIds(data.selectedGroupIds));
      setSelectedPart(data.selectedPart ?? null);
      
      console.log('[AppContext] Applied state - groups:', mapIds(data.selectedGroupIds), 'part:', data.selectedPart);

      // Clear sessionStorage (one-shot for auth flow), but keep localStorage (for future reloads)
      window.sessionStorage.removeItem('viewerState');
    } catch (e) {
      console.warn('Failed to restore viewer state', e);
    }
  }, []);

  // Chat persistence in sessionStorage; if logged in, also mirror to localStorage for extra safety
  const CHAT_KEY = 'chatState';
  const saveChatState = useCallback((snapshot: ChatSnapshot) => {
    try {
      const json = JSON.stringify(snapshot);
      window.sessionStorage.setItem(CHAT_KEY, json);
      if (user?.uid) {
        window.localStorage.setItem(`${CHAT_KEY}:${user.uid}`, json);
      }
    } catch (e) {
      console.warn('Failed to save chat state', e);
    }
  }, [user?.uid]);

  const restoreChatState = useCallback((): ChatSnapshot | null => {
    try {
      const fromSession = window.sessionStorage.getItem(CHAT_KEY);
      if (fromSession) return JSON.parse(fromSession) as ChatSnapshot;
      if (user?.uid) {
        const fromLocal = window.localStorage.getItem(`${CHAT_KEY}:${user.uid}`);
        if (fromLocal) return JSON.parse(fromLocal) as ChatSnapshot;
      }
    } catch (e) {
      console.warn('Failed to restore chat state', e);
    }
    return null;
  }, [user?.uid]);

  const clearChatState = useCallback(() => {
    try {
      window.sessionStorage.removeItem(CHAT_KEY);
      if (user?.uid) {
        window.localStorage.removeItem(`${CHAT_KEY}:${user.uid}`);
      }
    } catch {}
  }, [user?.uid]);

  return (
    <AppContext.Provider
      value={{
        intention,
        intentionRef,
        setIntention: handleSetIntention,
        isSelectingRecoveryBodyParts,
        selectedGroups,
        selectedGroupsRef,
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
        // state persistence helpers
        saveViewerState,
        restoreViewerState,
        saveChatState,
        restoreChatState,
        clearChatState,
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
