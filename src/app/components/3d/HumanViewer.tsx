'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { DiagnosisAssistantResponse, Gender } from '../../types';
import PartPopup from '../ui/PartPopup';
import { NavigationMenu } from '@/app/components/ui/NavigationMenu';
import { useTranslation } from '@/app/i18n';
import { useHumanAPI } from '@/app/hooks/useHumanAPI';
import DesktopControls from './DesktopControls';
import MobileControls from './MobileControls';
import { ExerciseQuestionnaire } from '../ui/ExerciseQuestionnaire';
import { Question } from '@/app/types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../../shared/types';
import { useApp, ProgramIntention } from '@/app/context/AppContext';
import { useUser } from '@/app/context/UserContext';
import { useAuth } from '@/app/context/AuthContext';
import { logAnalyticsEvent } from '@/app/utils/analytics';
import { useExplainSelection } from '@/app/hooks/useExplainSelection';
import { bodyPartGroups } from '@/app/config/bodyPartGroups';
import { findGroupByName, findBodyPartByName } from '@/app/utils/bodyPartMarkerParser';
import { WeeklyLimitReachedError } from '@/app/services/questionnaire';
import { WeeklyLimitModal } from '../ui/WeeklyLimitModal';
import { translatePartDirectionPrefix } from '@/app/utils/bodyPartTranslation';
import { ExplainerTooltip } from '../ui/ExplainerTooltip';

const MODEL_IDS: Record<Gender, string> = {
  male: '5tOV',
  female: '5tOR',
};

const DESKTOP_SPLIT_KEY = 'hv:desktop_split_px';

// Map assistant's body group names to bodyPartGroups config keys
const BODY_GROUP_NAME_TO_CONFIG: Record<string, keyof typeof bodyPartGroups> = {
  'Neck': 'neck',
  'Shoulders': 'chest', // chest config includes shoulder area
  'Arms': 'chest', // arms are part of upper body, use chest for now
  'Chest': 'chest',
  'Abdomen': 'abdomen',
  'Back': 'back',
  'Hips & Glutes': 'glutes',
  'Legs': 'glutes', // legs are connected to glutes in the model
};

interface HumanViewerProps {
  gender: Gender;
  onGenderChange?: (gender: Gender) => void;
  shouldResetModel?: boolean;
  hideNav?: boolean;
  enableMobileChat?: boolean;
  fillHeight?: boolean;
}

export default function HumanViewer({
  gender,
  onGenderChange,
  shouldResetModel = false,
  hideNav,
  enableMobileChat,
  fillHeight,
}: HumanViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { locale, t } = useTranslation();
  const {
    intention,
    selectedGroups,
    selectedPart,
    setSelectedGroup,
    setSelectedPart,
    resetSelectionState,
    restoreViewerState,
  } = useApp();
  const lastSelectedIdRef = useRef<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const minChatWidthAbsolute = 250; // absolute minimum in pixels for edge cases
  
  // Get the available width (container width in embedded mode, window width in fullscreen)
  const getAvailableWidth = useCallback(() => {
    if (typeof window === 'undefined') return 800;
    if (hideNav && containerRef.current) {
      return containerRef.current.getBoundingClientRect().width;
    }
    return window.innerWidth;
  }, [hideNav]);
  
  // Dynamic bounds: 25% min, 75% max of available width for both chat and model
  const getMinChatWidth = useCallback(() => {
    const availableWidth = getAvailableWidth();
    return Math.max(minChatWidthAbsolute, Math.floor(availableWidth * 0.25));
  }, [getAvailableWidth]);
  const getMaxChatWidth = useCallback(() => {
    const availableWidth = getAvailableWidth();
    return Math.floor(availableWidth * 0.75);
  }, [getAvailableWidth]);
  const [chatWidth, setChatWidth] = useState(384);
  const [isDragging, setIsDragging] = useState(false);
  const [isAtMinWidth, setIsAtMinWidth] = useState(false);
  const [isAtMaxWidth, setIsAtMaxWidth] = useState(false);
  const lastWidthRef = useRef(chatWidth);
  const rafRef = useRef<number | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const rotationAnimationRef = useRef<number | null>(null);
  const viewerWrapperRef = useRef<HTMLDivElement | null>(null);
  const [targetGender, setTargetGender] = useState<Gender | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisAssistantResponse | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { onQuestionnaireSubmit } = useUser();
  const { loading: authLoading } = useAuth();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [explainerEnabled, setExplainerEnabled] = useState(false);
  const [weeklyLimitError, setWeeklyLimitError] = useState<{
    programType: ProgramType;
    nextAllowedDate: Date;
  } | null>(null);
  const [isQuestionnaireSubmitting, setIsQuestionnaireSubmitting] = useState(false);
  const isExplainerActive = explainerEnabled && !isMobile;
  const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(false);
  const [isChatHistoryOpen, setIsChatHistoryOpen] = useState(false);
  
  // Custom explainer tooltip position (captured from click)
  const [explainerPosition, setExplainerPosition] = useState<{ x: number; y: number } | null>(null);
  const [isCameraMoving, setIsCameraMoving] = useState(false);
  const cameraMovingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track iframe load state for HumanAPI initialization
  const [iframeReady, setIframeReady] = useState(true);

  // Explore explainer state
  // Using BioDigital labels for anchoring; no manual screen position needed
  const exploreOn = intention === ProgramIntention.None; // explore mode when no program intention
  const languagePref = (locale?.toLowerCase() === 'nb' ? 'NB' : 'EN') as 'EN' | 'NB';
  const explainer = useExplainSelection({
    exploreOn: exploreOn && isExplainerActive,
    selectedPart: selectedPart
      ? {
          id: selectedPart.objectId,
          displayName: selectedPart.name,
          partType: 'muscle',
          side: 'unknown',
        }
      : null,
    language: languagePref,
    readingLevel: 'standard',
    // When re-enabling explainer (desktop only), force a re-fetch for the active selection
    refreshKey: isExplainerActive ? (selectedPart ? 1 : 0) : -1,
  });
  // Load and persist explainer toggle preference (defaults OFF, remembers ON)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('explainer_enabled');
      if (raw === '1') setExplainerEnabled(true);
    } catch {}
  }, []);

  const toggleExplainer = useCallback(() => {
    setExplainerEnabled((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem('explainer_enabled', next ? '1' : '0');
      } catch {}
      return next;
    });
  }, []);


  // moved below useHumanAPI

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    // Initial check with a small delay to ensure hydration is complete
    const timeoutId = setTimeout(() => {
      checkMobile();
    }, 100);

    // Also check immediately for immediate feedback
    checkMobile();
    
    window.addEventListener('resize', checkMobile);
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  // Restore viewer state after returning from auth/subscription
  useEffect(() => {
    restoreViewerState();
  }, [restoreViewerState]);

  // Detect support for stable viewport and keyboard inset env var (unused)

  // Remove previous paint nudge; use stable viewport strategy only

  

  const {
    humanRef,
    currentGender,
    needsReset,
    setNeedsReset,
    isReady,
    initialCameraRef,
    previousSelectedPartGroupRef,
    isResettingRef,
    resetModel,
  } = useHumanAPI({
    elementId: 'myViewer',
    initialGender: gender,
    onZoom: (objectId?: string) => handleZoom(objectId),
    iframeReady,
  });

  // Track mouse position globally (iframe clicks don't bubble, so we track last known position)
  const lastMousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    return () => document.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Set explainer position when a part is selected (using last known mouse position)
  const prevSelectedPartRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (!selectedPart) {
      setExplainerPosition(null);
      prevSelectedPartRef.current = null;
      return;
    }
    
    // Only update position when selection changes (not on every render)
    if (selectedPart.objectId !== prevSelectedPartRef.current) {
      prevSelectedPartRef.current = selectedPart.objectId;
      
      // Use last mouse position for tooltip placement
      if (isExplainerActive) {
        // Use mouse position if available, otherwise center of viewer
        const pos = lastMousePosRef.current;
        const hasValidPos = pos.x > 0 || pos.y > 0;
        
        if (hasValidPos) {
          setExplainerPosition({ x: pos.x, y: pos.y });
        } else {
          // Fallback: position near center-left of the viewer
          const viewerRect = viewerWrapperRef.current?.getBoundingClientRect();
          if (viewerRect) {
            setExplainerPosition({
              x: viewerRect.left + viewerRect.width * 0.4,
              y: viewerRect.top + viewerRect.height * 0.4,
            });
          }
        }
      }
    }
  }, [selectedPart, isExplainerActive]);

  // Track camera movement to hide tooltip during rotation/zoom
  useEffect(() => {
    if (!humanRef?.current || !isExplainerActive) return;
    
    const human = humanRef.current;
    
    const onCameraUpdate = () => {
      setIsCameraMoving(true);
      
      // Clear existing timeout
      if (cameraMovingTimeoutRef.current) {
        clearTimeout(cameraMovingTimeoutRef.current);
      }
      
      // Set timeout to mark camera as stopped
      cameraMovingTimeoutRef.current = setTimeout(() => {
        setIsCameraMoving(false);
      }, 150);
    };
    
    human.on('camera.updated', onCameraUpdate);
    
    return () => {
      if (cameraMovingTimeoutRef.current) {
        clearTimeout(cameraMovingTimeoutRef.current);
      }
    };
  }, [humanRef, isExplainerActive]);

  const handleZoom = (objectId?: string) => {
    // First get current camera info
    humanRef.current.send('camera.info', (camera) => {
      if (objectId) {
        // If a part group is selected, focus on those parts while maintaining camera properties
        humanRef.current.send('camera.set', {
          objectId: objectId,
          position: {
            ...camera.position,
            // z: camera.position.z * 0.7, // Zoom in by reducing z distance by 30%
          },
          target: camera.target,
          up: camera.up,
          animate: true,
          animationDuration: 0.5,
        });
      }
    });
  };

  // Create viewer URL
  const getViewerUrl = useCallback(
    (modelGender: Gender) => {
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
      // Allow viewer scroll/zoom; we gate wheel to the iframe via our own handlers
      viewerUrl.searchParams.set('disable-scroll', 'false');
      viewerUrl.searchParams.set('uaid', 'LzCgB');
      viewerUrl.searchParams.set('paid', 'o_26b5a0fa');
      viewerUrl.searchParams.set('be-annotations', 'false');
      viewerUrl.searchParams.set('ui-annotations', 'false');
      viewerUrl.searchParams.set('ui-navigation', 'false');
      viewerUrl.searchParams.set('ui-controls', 'false');
      viewerUrl.searchParams.set('ui-logo', 'false');
      return viewerUrl.toString();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const [viewerUrl, setViewerUrl] = useState(() => getViewerUrl(gender));
  const [isChangingModel, setIsChangingModel] = useState(false);

  const resetValues = useCallback(() => {
    previousSelectedPartGroupRef.current = null;
    setCurrentRotation(0);
    setSelectedPart(null);
    setSelectedGroup(null, false);
    lastSelectedIdRef.current = null;
    setNeedsReset(false);
  }, [previousSelectedPartGroupRef, setSelectedGroup, setSelectedPart, setNeedsReset]);

  const handleSwitchModel = useCallback(() => {
    setIsChangingModel(true);
    setIframeReady(false); // Mark iframe as not ready until it reloads
    const newGender: Gender = currentGender === 'male' ? 'female' : 'male';
    setTargetGender(newGender);
    setViewerUrl(getViewerUrl(newGender));
    logAnalyticsEvent('switch_model', { gender: newGender });

    // Reset states
    resetValues();

    // Call the parent's gender change handler
    onGenderChange?.(newGender);
  }, [currentGender, getViewerUrl, onGenderChange, resetValues]);

  // Recompute viewer URL if embed context (hideNav) changes
  useEffect(() => {
    setViewerUrl(getViewerUrl(currentGender));
  }, [getViewerUrl, currentGender]);

  // Clear target gender when model change is complete
  useEffect(() => {
    if (!isChangingModel) {
      setTargetGender(null);
    }
  }, [isChangingModel]);

  const handleReset = useCallback(
    (shouldResetSelectionState?: boolean) => {
      if (isResettingRef.current) return;

      isResettingRef.current = true;
      setIsResetting(true);
      logAnalyticsEvent('reset_model');

      const clearResettingState = () => {
        setTimeout(() => {
          isResettingRef.current = false;
          setIsResetting(false);
        }, 500);
      };

      const performSceneReset = () => {
        if (!humanRef.current) {
          isResettingRef.current = false;
          setIsResetting(false);
          return;
        }

        humanRef.current.send('scene.disableXray', () => {});
        setTimeout(() => {
          humanRef.current?.send('scene.reset', () => {
            resetValues();
            clearResettingState();
          });
        }, 100);
      };

      // Camera-only reset (no selection state change)
      if (shouldResetSelectionState === false) {
        humanRef.current.send('camera.set', {
          position: initialCameraRef.current?.position,
          target: initialCameraRef.current?.target,
          up: initialCameraRef.current?.up,
          animate: true,
        });
        clearResettingState();
        return;
      }

      // Full reset with selection state
      if (shouldResetSelectionState === true) {
        resetSelectionState();
        setIsChatOverlayOpen(false);
      }

      performSceneReset();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isResettingRef, setNeedsReset, isReady, humanRef, resetSelectionState]
  );

  // Update reset button state when parts are selected
  useEffect(() => {
    setNeedsReset(selectedGroups.length > 0 || needsReset);
  }, [selectedGroups, needsReset, setNeedsReset]);

  // Reset split to optimal sizes based on screen width (50/50 default)
  const resetSplitSizes = useCallback(() => {
    const availableWidth = getAvailableWidth();
    const minChat = getMinChatWidth();
    const maxChat = getMaxChatWidth();
    
    // Default to 50% split
    const optimalChatWidth = Math.floor(availableWidth * 0.5);

    // Ensure within bounds (25%-75% of available width)
    const finalWidth = Math.min(Math.max(minChat, optimalChatWidth), maxChat);

    setChatWidth(finalWidth);
    lastWidthRef.current = finalWidth;
    setIsAtMinWidth(finalWidth <= minChat);
    setIsAtMaxWidth(finalWidth >= maxChat);

    // Persist to localStorage
    try {
      window.localStorage.setItem(DESKTOP_SPLIT_KEY, String(finalWidth));
    } catch {}

    logAnalyticsEvent('reset_split_sizes', { width: finalWidth, availableWidth });
  }, [getMinChatWidth, getMaxChatWidth, getAvailableWidth]);

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
        // In embedded mode, use container's right edge; otherwise use window width
        const rightEdge = hideNav && containerRef.current
          ? containerRef.current.getBoundingClientRect().right
          : window.innerWidth;
        const newWidth = rightEdge - e.clientX;
        const minChat = getMinChatWidth();
        const maxChat = getMaxChatWidth();
        const clampedWidth = Math.min(Math.max(minChat, newWidth), maxChat);
        lastWidthRef.current = clampedWidth;
        setChatWidth(clampedWidth);
        setIsAtMinWidth(clampedWidth <= minChat);
        setIsAtMaxWidth(clampedWidth >= maxChat);
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
      try {
        if (typeof window !== 'undefined' && window.innerWidth >= 768) {
          window.localStorage.setItem(DESKTOP_SPLIT_KEY, String(lastWidthRef.current));
        }
      } catch {}
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopDragging);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', stopDragging);
  }, [getMinChatWidth, getMaxChatWidth, hideNav]);

  const handleRotate = useCallback(() => {
    const human = humanRef.current;
    if (!human || isRotating || isResetting) return;

    setNeedsReset(true);
    logAnalyticsEvent('rotate_model');

    setIsRotating(true);
    const startRotation = currentRotation % 360; // Normalize to 0-360
    const targetRotation = startRotation === 0 ? 180 : 360; // Always rotate forward to 180 or 360

    let currentAngle = 0;
    const rotationStep = 10; // Rotate 2 degrees per frame

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
  }, [isRotating, currentRotation, isResetting, humanRef, setNeedsReset]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
      }
    };
  }, []);

  // Initialize chat width from localStorage (desktop only) and clamp to viewport
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isDesktop = window.innerWidth >= 768;
    if (!isDesktop) return;

    const availableWidth = getAvailableWidth();
    const minChat = getMinChatWidth();
    const maxChat = getMaxChatWidth();
    let desired: number;

    // Check if user has a saved preference
    try {
      const stored = window.localStorage.getItem(DESKTOP_SPLIT_KEY);
      if (stored != null) {
        const parsed = parseInt(stored, 10);
        if (!Number.isNaN(parsed)) {
          desired = parsed;
        } else {
          // No valid saved preference, default to 50% split
          desired = Math.floor(availableWidth * 0.5);
        }
      } else {
        // No saved preference, default to 50% split
        desired = Math.floor(availableWidth * 0.5);
      }
    } catch {
      // Fallback to 50/50 if something goes wrong
      desired = Math.floor(availableWidth * 0.5);
    }

    const clamped = Math.min(Math.max(minChat, desired), maxChat);
    setChatWidth(clamped);
    lastWidthRef.current = clamped;
    setIsAtMinWidth(clamped <= minChat);
    setIsAtMaxWidth(clamped >= maxChat);
  }, [getMinChatWidth, getMaxChatWidth, getAvailableWidth]);

  // Keep lastWidthRef synced
  useEffect(() => {
    lastWidthRef.current = chatWidth;
  }, [chatWidth]);

  // Clamp stored width on resize and persist
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      if (window.innerWidth < 768) return; // only relevant on desktop
      const minChat = getMinChatWidth();
      const maxChat = getMaxChatWidth();
      const clamped = Math.min(Math.max(minChat, lastWidthRef.current), maxChat);
      if (clamped !== lastWidthRef.current) {
        lastWidthRef.current = clamped;
        setChatWidth(clamped);
        setIsAtMinWidth(clamped <= minChat);
        setIsAtMaxWidth(clamped >= maxChat);
        try {
          window.localStorage.setItem(DESKTOP_SPLIT_KEY, String(clamped));
        } catch {}
      }
      // Also update boundary states even if width didn't change
      setIsAtMinWidth(clamped <= minChat);
      setIsAtMaxWidth(clamped >= maxChat);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [getMinChatWidth, getMaxChatWidth]);

  // Handler for body group selection from follow-up questions or assistant response
  // Uses the same findGroupByName utility as chat message badges for consistency
  const handleBodyGroupSelected = useCallback((groupName: string, keepChatOpen?: boolean) => {
    console.log('[HumanViewer] Body group selection requested:', groupName, 'keepChatOpen:', keepChatOpen);
    
    // Find the group first to check if already selected
    const group = findGroupByName(groupName);
    const legacyConfigKey = !group ? BODY_GROUP_NAME_TO_CONFIG[groupName] : null;
    const targetGroup = group || (legacyConfigKey ? bodyPartGroups[legacyConfigKey] : null);
    
    if (!targetGroup) {
      console.warn('[HumanViewer] No mapping found for body group:', groupName);
      return;
    }
    
    // Early return if this group is already selected
    const currentGroup = selectedGroups[0];
    if (currentGroup?.id === targetGroup.id) {
      console.log('[HumanViewer] Group already selected, skipping:', targetGroup.name);
      return;
    }
    
    // Close the mobile chat overlay first so user sees the model (unless keepChatOpen is true)
    if (!keepChatOpen) {
      setIsChatOverlayOpen(false);
    }
    
    // Delay selection so user sees the model before selection happens
    const delay = keepChatOpen ? 0 : 200;
    setTimeout(() => {
      console.log('[HumanViewer] Selecting group:', targetGroup.name);
      setSelectedGroup(targetGroup, true);
      
      // Zoom to the group using the HumanAPI
      if (humanRef?.current && targetGroup.zoomId) {
        try {
          humanRef.current.send('camera.set', {
            objectId: targetGroup.zoomId,
          });
        } catch (error) {
          console.error('[HumanViewer] Error zooming to group:', error);
        }
      }
    }, delay);
  }, [setSelectedGroup, humanRef, selectedGroups]);

  // Handler for specific body part selection from follow-up questions or assistant response
  // Uses the same findBodyPartByName utility as chat message badges for consistency
  const handleBodyPartSelected = useCallback((partName: string, keepChatOpen?: boolean) => {
    console.log('[HumanViewer] Body part selection requested:', partName, 'keepChatOpen:', keepChatOpen);
    
    // Find the part first to check if already selected
    const result = findBodyPartByName(partName);
    if (!result) {
      console.warn('[HumanViewer] No mapping found for body part:', partName);
      return;
    }
    
    const { part, group } = result;
    
    // Early return if this exact part is already selected
    if (selectedPart?.objectId === part.objectId) {
      console.log('[HumanViewer] Part already selected, skipping:', part.name);
      return;
    }
    
    // Close the mobile chat overlay first so user sees the model (unless keepChatOpen is true)
    if (!keepChatOpen) {
      setIsChatOverlayOpen(false);
    }
    
    // Delay selection so user sees the model before selection happens
    const delay = keepChatOpen ? 0 : 200;
    setTimeout(() => {
      console.log('[HumanViewer] Selecting part:', part.name, 'in group:', group.name);
      
      // Only change group if different
      const currentGroup = selectedGroups[0];
      if (!currentGroup || currentGroup.id !== group.id) {
        // Pass skipPartReset=true since we're setting the part ourselves
        setSelectedGroup(group, true, true);
      }
      // Set the specific part
      setSelectedPart(part);
      
      // Zoom to the part using the HumanAPI
      if (humanRef?.current && part.objectId) {
        try {
          humanRef.current.send('camera.set', {
            objectId: part.objectId,
          });
        } catch (error) {
          console.error('[HumanViewer] Error zooming to part:', error);
        }
      }
    }, delay);
  }, [setSelectedGroup, setSelectedPart, humanRef, selectedGroups, selectedPart]);

  // Handler for program generation triggered from chat
  const handleGenerateProgram = useCallback((
    programType: ProgramType, 
    diagnosisData?: DiagnosisAssistantResponse | null,
    chatMode?: 'diagnosis' | 'explore'
  ) => {
    logAnalyticsEvent('open_questionnaire', { from: 'chat_button' });
    
    // Use passed diagnosis data (from chat) or fall back to state
    const currentDiagnosis = diagnosisData || diagnosis;
    
    // In diagnosis mode, use selected body group as painful area
    // In explore mode, no painful areas (user is just browsing)
    // Only one body group can be selected at a time
    const selectedBodyGroupName = selectedGroups[0]?.name || null;
    const painfulAreasFromSelection = chatMode === 'diagnosis' ? selectedBodyGroupName : null;
    
    if (currentDiagnosis) {
      // Use existing painfulAreas from diagnosis, or fall back to selected body parts in diagnosis mode
      const painfulAreas = currentDiagnosis.painfulAreas || painfulAreasFromSelection;
      setDiagnosis({
        ...currentDiagnosis,
        painfulAreas,
        followUpQuestions: [],
        programType: programType,
      });
      } else {
        const newDiagnosis: DiagnosisAssistantResponse = {
        summary: null,
        selectedBodyGroup: null,
        selectedBodyPart: null,
          diagnosis:
          (programType === ProgramType.Exercise || programType === ProgramType.ExerciseAndRecovery)
              ? 'No diagnosis, just an exercise program'
              : 'No diagnosis, just a recovery program',
          programType: programType,
        painfulAreas: painfulAreasFromSelection,
        avoidActivities: null,
          onset: null,
          timeFrame: '1 week',
          followUpQuestions: [],
          informationalInsights: '',
          painScale: 0,
          mechanismOfInjury: null,
        aggravatingFactors: null,
        relievingFactors: null,
          priorInjury: null,
          painPattern: null,
          painLocation: null,
          painCharacter: null,
          assessmentComplete: false,
          redFlagsPresent: false,
        targetAreas: null,
        };
        setDiagnosis(newDiagnosis);
      }
      setShowQuestionnaire(true);
  }, [diagnosis, selectedGroups]);

  const handleQuestionClick = (question: Question) => {
    if (question.generate) {
      const programType = question.programType ?? ProgramType.Exercise;
      handleGenerateProgram(programType);
    }
  };



  const handleBack = () => {
    if (showQuestionnaire) {
      setShowQuestionnaire(false);
    }
  };

  const handleQuestionnaireSubmit = async (
    answers: ExerciseQuestionnaireAnswers
  ) => {
    // Prevent double-clicks
    if (isQuestionnaireSubmitting) return;
    
    setIsQuestionnaireSubmitting(true);
    diagnosis.timeFrame = '1 week';
    logAnalyticsEvent('submit_questionnaire');

    try {
      const result = await onQuestionnaireSubmit(diagnosis, answers);

      if (result.requiresAuth) {
        // Keep the questionnaire open, the auth form will be shown by the parent component
        setIsQuestionnaireSubmitting(false);
        return;
      }
      logAnalyticsEvent('program_generation_started', {
        programId: result.programId,
      });
      // Note: Don't reset isQuestionnaireSubmitting here since we navigate away
    } catch (error) {
      setIsQuestionnaireSubmitting(false);
      if (error instanceof WeeklyLimitReachedError) {
        setWeeklyLimitError({
          programType: error.programType,
          nextAllowedDate: error.nextAllowedDate,
        });
      } else {
        console.error('Error in questionnaire submission:', error);
      }
    }
  };

  // Use effect to reset the model when shouldResetModel prop changes
  useEffect(() => {
    if (shouldResetModel && isReady && resetModel) {
      resetModel();
    }
  }, [shouldResetModel, isReady, resetModel]);

  // Prevent wheel from bubbling when not embedded on landing; when embedded (hideNav),
  // consume wheel over the iframe EXCEPT when Shift is held (to allow zoom).
  useEffect(() => {
    const preventParentScroll = (e: WheelEvent) => {
      // If embedded on landing, consume wheel events over the viewer iframe to avoid page shifts
      if (hideNav) {
        if (iframeRef.current && e.target instanceof Element) {
          if (iframeRef.current.contains(e.target)) {
            // When user holds Shift, allow the event through for viewer zooming
            if (e.shiftKey) {
              return;
            }
            e.preventDefault();
            e.stopPropagation();
            return;
          }
        }
        return; // otherwise let page scroll
      }
      // Only prevent default if we're not in a scrollable element with actual overflow
      if (e.target instanceof Element) {
        let target = e.target;
        let preventScroll = true;

        // Check if any parent element is scrollable and should handle the event
        while (target !== document.body) {
          const style = window.getComputedStyle(target);
          const overflowY = style.getPropertyValue('overflow-y');

          if (overflowY === 'auto' || overflowY === 'scroll') {
            // This is a scrollable container - check if it can actually scroll
            const hasVerticalOverflow =
              target.scrollHeight > target.clientHeight;

            if (hasVerticalOverflow) {
              // Check if we're at the top or bottom boundary
              const isAtTop = target.scrollTop === 0;
              const isAtBottom =
                Math.abs(
                  target.scrollHeight - target.scrollTop - target.clientHeight
                ) < 1;

              // Only prevent if at boundaries and trying to scroll beyond them
              if ((isAtTop && e.deltaY < 0) || (isAtBottom && e.deltaY > 0)) {
                // Still prevent scroll if trying to scroll past limits
                preventScroll = true;
              } else {
                // This container can handle the scroll - don't prevent
                preventScroll = false;
                break;
              }
            }
            // Even if no overflow, we want to capture wheel events on scrollable elements
            // to prevent them from bubbling to parent
            else {
              e.stopPropagation();
            }
          }

          target = target.parentElement as Element;
          if (!target) break;
        }

        if (preventScroll) {
          e.preventDefault();
        }
      }
    };

    // Add the event listener with passive: false to allow preventDefault
    document.addEventListener('wheel', preventParentScroll, { passive: false });

    return () => {
      document.removeEventListener('wheel', preventParentScroll);
    };
  }, [hideNav]);

  return (
    <div className={`flex flex-col ${hideNav ? (fillHeight ? 'w-full h-full' : 'w-full h-[500px]') : 'w-screen h-[100dvh]'} overflow-hidden relative`}>
      {!hideNav && <NavigationMenu mobileFloatingButton />}
      <div ref={containerRef} className="flex-1 flex flex-col md:flex-row relative min-h-0">
        {/* Fullscreen overlay when dragging */}
        {isDragging && (
          <div className={`fixed inset-0 ${hideNav ? 'z-30' : 'z-50'}`} style={{ cursor: 'ew-resize' }} />
        )}

        {/* Model Viewer Container */}
        <div
          className="flex-1 relative bg-black flex flex-col"
          style={{ minWidth: `${minChatWidthAbsolute}px` }}
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
        {/* Mobile: stable visual viewport height; Desktop: full height */}
          <div
            className="w-full"
            style={{
              height: hideNav ? '100%' : (isMobile ? '100svh' : '100%'),
              position: 'relative',
              top: 0,
              left: 0,
              right: 0,
              overscrollBehavior: isMobile ? 'none' : undefined,
              zIndex: 0,
            }}
            ref={viewerWrapperRef}
          >
          <iframe
            id="myViewer"
            ref={iframeRef}
            src={viewerUrl}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            allow="fullscreen"
            allowFullScreen
            onLoad={() => {
              setIsChangingModel(false);
              setIframeReady(true); // Signal to useHumanAPI that iframe is ready
            }}
          />
        </div>

        {isMobile && hideNav && !enableMobileChat && (
          <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-none">
            <div className="w-full bg-gray-900/90 border-t border-gray-800 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="w-16 h-1.5 rounded-full bg-white/20 mx-auto mb-2" />
                <p className="text-white text-sm text-center font-medium">Click a bodypart to get started</p>
              </div>
            </div>
          </div>
        )}
 
        {/* Backdrop for chat history - Desktop */}
        {isChatHistoryOpen && (
          <div 
            className="hidden md:block absolute inset-0 bg-black/60 backdrop-blur-sm z-[90] transition-opacity"
            onClick={() => setIsChatHistoryOpen(false)}
          />
        )}

        {/* Controls - Desktop */}
        {!showQuestionnaire && !authLoading && (
          <DesktopControls
            isRotating={isRotating}
            isResetting={isResetting}
            isReady={isReady}
            needsReset={needsReset}
            hasSelection={selectedGroups.length > 0}
            currentGender={currentGender}
            isChangingModel={isChangingModel}
            onRotate={handleRotate}
            onReset={() => handleReset(true)}
            onSwitchModel={handleSwitchModel}
            explainerEnabled={explainerEnabled}
            onToggleExplainer={toggleExplainer}
          />
        )}
      </div>

      {/* Drag Handle - Desktop Only */}
      <div
        onMouseDown={startDragging}
        onDoubleClick={resetSplitSizes}
        className="hidden md:block w-1 hover:w-2 bg-gray-800 hover:bg-indigo-600 cursor-ew-resize transition-all duration-150 active:bg-indigo-500 flex-shrink-0 z-30 relative group"
        style={{ touchAction: 'none' }}
        title="Drag to resize, double-click to reset"
      >
        {/* Resize Icon - Custom Bidirectional Arrows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <svg
            className="w-12 h-12 text-gray-400 group-hover:text-white transition-colors"
            viewBox="0 0 48 48"
            fill="currentColor"
          >
            {/* Left Arrow - show when NOT at min width (can expand left) */}
            {!isAtMinWidth && <path d="M14 24l-6-6v4H2v4h6v4z" />}
            {/* Right Arrow - show when NOT at max width (can shrink right) */}
            {!isAtMaxWidth && <path d="M34 24l6-6v4h6v4h-6v4z" />}
            {/* Center vertical line */}
            <rect x="22" y="12" width="4" height="24" rx="2" />
          </svg>
        </div>

        {/* Reset Button - appears on hover */}
        <button
          onClick={resetSplitSizes}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-auto bg-gray-800 hover:bg-indigo-600 rounded-full p-2 shadow-lg"
          title="Reset to optimal sizes"
          aria-label="Reset split sizes"
        >
          <svg
            className="w-4 h-4 text-white"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {/* Right side - Popup with animation - Desktop Only */}
      <div
        className={`hidden md:block flex-shrink-0 transform ${
          isDragging ? '' : 'transition-all duration-300 ease-in-out'
        } ${'translate-x-0 opacity-100'} overflow-y-auto`}
        style={{
          width: `${chatWidth}px`,
          minWidth: `${minChatWidthAbsolute}px`,
          maxWidth: '75%',
        }}
      >
        <div className="h-full border-l border-gray-800 overflow-y-auto">
            <PartPopup
              part={selectedPart}
              groups={selectedGroups}
              onClose={() => {}}
              onQuestionClick={handleQuestionClick}
              onGenerateProgram={handleGenerateProgram}
              onBodyGroupSelected={handleBodyGroupSelected}
              onBodyPartSelected={handleBodyPartSelected}
              onHistoryOpenChange={setIsChatHistoryOpen}
            />
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && (!hideNav || enableMobileChat) && isReady && (
        <MobileControls
          isRotating={isRotating}
          isResetting={isResetting}
          isReady={isReady}
          needsReset={needsReset}
          selectedGroups={selectedGroups}
          currentGender={currentGender}
          selectedPart={selectedPart}
          onRotate={handleRotate}
          onReset={handleReset}
          onSwitchModel={handleSwitchModel}
          onQuestionClick={handleQuestionClick}
          hideBottomSheet={showQuestionnaire}
          onDiagnosis={setDiagnosis}
          onGenerateProgram={handleGenerateProgram}
          onBodyGroupSelected={handleBodyGroupSelected}
          onBodyPartSelected={handleBodyPartSelected}
          overlayOpen={!showQuestionnaire && isChatOverlayOpen}
          onCloseOverlay={() => setIsChatOverlayOpen(false)}
          onOpenOverlay={() => setIsChatOverlayOpen(true)}
          showQuestionnaire={showQuestionnaire}
          useAbsolutePosition={hideNav}
        />
      )}

      {/* Combined Overlay Container */}
      {showQuestionnaire && (
        <div className="fixed inset-0 bg-gray-900 z-[60]">
          <ExerciseQuestionnaire
            onClose={handleBack}
            onSubmit={handleQuestionnaireSubmit}
            generallyPainfulAreas={
              // Use painful areas from diagnosis (set based on chat mode)
              // Only diagnosis mode sets painful areas from selected body parts
              // Don't split - body group names can contain commas (e.g., "Lower Back, Pelvis & Hip Region")
              diagnosis?.painfulAreas ? [diagnosis.painfulAreas] : []
            }
            programType={diagnosis?.programType ?? ProgramType.Exercise}
            targetAreas={selectedGroups}
            fullBody={false}
            diagnosisText={diagnosis?.diagnosis}
            isSubmitting={isQuestionnaireSubmitting}
          />
        </div>
      )}

      {/* Weekly limit modal */}
      {weeklyLimitError && (
        <WeeklyLimitModal
          isOpen={true}
          programType={weeklyLimitError.programType}
          nextAllowedDate={weeklyLimitError.nextAllowedDate}
          onClose={() => setWeeklyLimitError(null)}
        />
      )}
      </div>

      {/* Custom Explainer Tooltip - Desktop Only (rendered at root to avoid clipping) */}
      {isExplainerActive && selectedPart && explainerPosition && !isCameraMoving && (
        <ExplainerTooltip
          title={translatePartDirectionPrefix(selectedPart, t)}
          text={exploreOn ? (explainer?.text ?? null) : null}
          isLoading={exploreOn && !explainer?.text && !explainer?.rateLimited}
          screenPosition={explainerPosition}
          maxX={viewerWrapperRef.current?.getBoundingClientRect().right ?? (typeof window !== 'undefined' ? window.innerWidth - chatWidth - 16 : undefined)}
          onClose={() => setSelectedPart(null)}
        />
      )}
    </div>
  );
}