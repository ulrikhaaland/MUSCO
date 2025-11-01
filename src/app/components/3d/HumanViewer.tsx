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
import { bodyPartGroups, BodyPartGroup } from '@/app/config/bodyPartGroups';

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
}

export default function HumanViewer({
  gender,
  onGenderChange,
  shouldResetModel = false,
  hideNav,
}: HumanViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { locale } = useTranslation();
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
  const minChatWidth = 300;
  const maxChatWidth = 800;
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
  const [explainerEnabled, setExplainerEnabled] = useState(true);
  const isExplainerActive = explainerEnabled && !isMobile;
  const [isChatOverlayOpen, setIsChatOverlayOpen] = useState(false);

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
  // Load and persist explainer toggle preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const raw = window.localStorage.getItem('explainer_enabled');
      if (raw === '0') setExplainerEnabled(false);
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
  });

  // Create a loading label immediately upon selection (runs after HumanAPI init)
  useEffect(() => {
    if (!humanRef?.current) return;
    const human = humanRef.current;
    const labelId = 'explainer_label';

    // If disabled (or on mobile) or rate-limited, do not show a loading bubble
    if (!exploreOn || !selectedPart || explainer?.rateLimited || !isExplainerActive) {
      try { human.send('labels.destroy', labelId); } catch {}
      return;
    }

    try { human.send('labels.destroy', labelId); } catch {}

    try {
      human.send('labels.create', {
        objectId: selectedPart.objectId,
        labelId,
        title: selectedPart.name,
        description: 'Loading…',
        labelOffset: [24, -8],
        pinGlow: true,
        flyTo: false,
        collapseDescription: false,
      });
    } catch {}
  }, [exploreOn, selectedPart, explainer, isExplainerActive, humanRef]);

  // Update the label when explainer text arrives
  useEffect(() => {
    if (!humanRef?.current) return;
    const human = humanRef.current;
    const labelId = 'explainer_label';
    if (!exploreOn || !selectedPart) return;
    if (!explainer || explainer.rateLimited || !isExplainerActive) return;
    if (!explainer.text) return;

    try {
      human.send('labels.update', {
        labelId,
        title: selectedPart.name,
        description: explainer.text,
        pinGlow: false,
        labelOffset: [24, -8],
        flyTo: false,
        collapseDescription: false,
      });
    } catch {}
  }, [exploreOn, selectedPart, explainer, isExplainerActive, humanRef]);

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
    [hideNav]
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

      // Reset the context state
      if (shouldResetSelectionState == true) {
        resetSelectionState();

        // Use scene.reset to reset everything to initial state
        if (humanRef.current) {
          humanRef.current.send('scene.disableXray', () => {});

          setTimeout(() => {
            humanRef.current?.send('scene.reset', () => {
              // Reset all our state after the scene has been reset

              resetValues();

              // Clear reset state after a short delay to allow for animation
              setTimeout(() => {
                isResettingRef.current = false;
                setIsResetting(false);
              }, 500);
            });
          }, 100);
        } else {
          isResettingRef.current = false;
          setIsResetting(false);
        }
      } else if (shouldResetSelectionState == false) {
        humanRef.current.send('camera.set', {
          position: initialCameraRef.current?.position,
          target: initialCameraRef.current?.target,
          up: initialCameraRef.current?.up,
          animate: true,
        });
        setTimeout(() => {
          isResettingRef.current = false;
          setIsResetting(false);
        }, 500);
      } else {
        // Use scene.reset to reset everything to initial state
        if (humanRef.current) {
          humanRef.current.send('scene.disableXray', () => {});

          setTimeout(() => {
            humanRef.current?.send('scene.reset', () => {
              // Reset all our state after the scene has been reset

              resetValues();

              // Clear reset state after a short delay to allow for animation
              setTimeout(() => {
                isResettingRef.current = false;
                setIsResetting(false);
              }, 500);
            });
          }, 100);
        } else {
          isResettingRef.current = false;
          setIsResetting(false);
        }
      }
    },
    [isResettingRef, setNeedsReset, isReady, humanRef, resetSelectionState]
  );

  // Update reset button state when parts are selected
  useEffect(() => {
    setNeedsReset(selectedGroups.length > 0 || needsReset);
  }, [selectedGroups, needsReset, setNeedsReset]);

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
        const maxAllowed = Math.min(maxChatWidth, window.innerWidth - minChatWidth);
        const clampedWidth = Math.min(Math.max(minChatWidth, newWidth), maxAllowed);
        lastWidthRef.current = clampedWidth;
        setChatWidth(clampedWidth);
        setIsAtMinWidth(clampedWidth <= minChatWidth);
        setIsAtMaxWidth(clampedWidth >= maxAllowed);
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
  }, []);

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
    const half = Math.floor(window.innerWidth / 2);
    const maxAllowed = Math.min(maxChatWidth, window.innerWidth - minChatWidth);
    let desired = half;
    if (isDesktop) {
      try {
        const stored = window.localStorage.getItem(DESKTOP_SPLIT_KEY);
        if (stored != null) {
          const parsed = parseInt(stored, 10);
          if (!Number.isNaN(parsed)) desired = parsed;
        }
      } catch {}
    }
    const clamped = Math.min(Math.max(minChatWidth, desired), maxAllowed);
    setChatWidth(clamped);
    lastWidthRef.current = clamped;
    setIsAtMinWidth(clamped <= minChatWidth);
    setIsAtMaxWidth(clamped >= maxAllowed);
  }, []);

  // Keep lastWidthRef synced
  useEffect(() => {
    lastWidthRef.current = chatWidth;
  }, [chatWidth]);

  // Clamp stored width on resize and persist
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => {
      if (window.innerWidth < 768) return; // only relevant on desktop
      const maxAllowed = Math.min(maxChatWidth, window.innerWidth - minChatWidth);
      const clamped = Math.min(Math.max(minChatWidth, lastWidthRef.current), maxAllowed);
      if (clamped !== lastWidthRef.current) {
        lastWidthRef.current = clamped;
        setChatWidth(clamped);
        setIsAtMinWidth(clamped <= minChatWidth);
        setIsAtMaxWidth(clamped >= maxAllowed);
        try {
          window.localStorage.setItem(DESKTOP_SPLIT_KEY, String(clamped));
        } catch {}
      }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const handleBottomSheetHeight = (sheetHeight: number) => {
    // Drive a CSS var to avoid React state reflows
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sheet-height', `${sheetHeight}px`);
    }
  };

  // Handler for body group selection from assistant (diagnosis flow without pre-selected part)
  const handleBodyGroupSelected = useCallback((groupName: string) => {
    console.log('[HumanViewer] Assistant selected body group:', groupName);
    const configKey = BODY_GROUP_NAME_TO_CONFIG[groupName];
    if (configKey && bodyPartGroups[configKey]) {
      const group = bodyPartGroups[configKey];
      console.log('[HumanViewer] Mapping to config:', configKey, group.name);
      setSelectedGroup(group);
      // Optionally zoom to the group using the API
      if (humanAPI) {
        humanAPI.camera.zoomToObject(group.zoomId);
      }
    } else {
      console.warn('[HumanViewer] No mapping found for body group:', groupName);
    }
  }, [setSelectedGroup, humanAPI]);

  // Handler for specific body part selection from assistant
  const handleBodyPartSelected = useCallback((partName: string) => {
    console.log('[HumanViewer] Assistant selected body part:', partName);
    // For now, just log. We could add more specific zooming logic here if needed
    // The specific part is more for the diagnosis data than the 3D model selection
    // The model already highlights the group, and the diagnosis tracks the specific part
  }, []);

  // Handler for program generation triggered from chat
  const handleGenerateProgram = useCallback((programType: ProgramType, diagnosisData?: DiagnosisAssistantResponse | null) => {
    logAnalyticsEvent('open_questionnaire', { from: 'chat_button' });
    
    // Use passed diagnosis data (from chat) or fall back to state
    const currentDiagnosis = diagnosisData || diagnosis;
    
    if (currentDiagnosis) {
      // Use existing diagnosis data, just update programType and clear follow-ups
      console.log('[HumanViewer] Using diagnosis data:', currentDiagnosis);
      setDiagnosis({
        ...currentDiagnosis,
        followUpQuestions: [],
        programType: programType,
      });
      } else {
      // Create new diagnosis if none exists
      console.log('[HumanViewer] No diagnosis data, creating new');
        const newDiagnosis: DiagnosisAssistantResponse = {
        summary: null,
          diagnosis:
          (programType === ProgramType.Exercise || programType === ProgramType.ExerciseAndRecovery)
              ? 'No diagnosis, just an exercise program'
              : 'No diagnosis, just a recovery program',
          programType: programType,
        painfulAreas: [selectedGroups[0]?.name, selectedPart?.name].filter(Boolean).join(', ') || null,
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
  }, [diagnosis, selectedGroups, selectedPart]);

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
    diagnosis.timeFrame = '1 week';
    logAnalyticsEvent('submit_questionnaire');

    try {
      const result = await onQuestionnaireSubmit(diagnosis, answers);

      if (result.requiresAuth) {
        // Keep the questionnaire open, the auth form will be shown by the parent component
        return;
      }
      logAnalyticsEvent('program_generation_started', {
        programId: result.programId,
      });
    } catch (error) {
      console.error('Error in questionnaire submission:', error);
      // Handle other errors appropriately
      // You might want to show an error message to the user here
    }
  };

  const fadeInKeyframes = `
  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  @keyframes slideOut {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(-20px);
    }
  }
  `;

  // Add the keyframes to the document
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = fadeInKeyframes;
    document.head.appendChild(style);
  }

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
    <div className={`flex flex-col ${hideNav ? 'w-full h-[500px]' : 'w-screen h-[100dvh]'} overflow-hidden`}>
      {!hideNav && <NavigationMenu mobileFloatingButton />}
      <div className="flex-1 flex flex-col md:flex-row relative min-h-0">
        {/* Fullscreen overlay when dragging */}
        {isDragging && (
          <div className={`fixed inset-0 ${hideNav ? 'z-30' : 'z-50'}`} style={{ cursor: 'ew-resize' }} />
        )}

        {/* Model Viewer Container */}
        <div
          className="flex-1 relative bg-black flex flex-col"
          style={{ minWidth: `${minChatWidth}px` }}
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
              height: hideNav ? '100%' : (isMobile ? 'calc(100svh - var(--sheet-height))' : '100%'),
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
            }}
          />
        </div>

        {isMobile && hideNav && (
          <div className="absolute inset-x-0 bottom-0 z-40 pointer-events-none">
            <div className="w-full bg-gray-900/90 border-t border-gray-800 backdrop-blur-sm">
              <div className="max-w-6xl mx-auto px-4 py-4">
                <div className="w-16 h-1.5 rounded-full bg-white/20 mx-auto mb-2" />
                <p className="text-white text-sm text-center font-medium">Click a bodypart to get started</p>
              </div>
            </div>
          </div>
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
        className="hidden md:block w-1 hover:w-2 bg-gray-800 hover:bg-indigo-600 cursor-ew-resize transition-all duration-150 active:bg-indigo-500 flex-shrink-0 z-30 relative group"
        style={{ touchAction: 'none' }}
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
      </div>

      {/* Right side - Popup with animation - Desktop Only */}
      <div
        className={`hidden md:block flex-shrink-0 transform ${
          isDragging ? '' : 'transition-all duration-300 ease-in-out'
        } ${'translate-x-0 opacity-100'} overflow-y-auto`}
        style={{
          width: `${chatWidth}px`,
          minWidth: `${minChatWidth}px`,
          maxWidth: `${maxChatWidth}px`,
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
          />
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && !hideNav && (
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
          onHeightChange={handleBottomSheetHeight}
          onQuestionClick={handleQuestionClick}
          hideBottomSheet={showQuestionnaire}
          onDiagnosis={setDiagnosis}
          onGenerateProgram={handleGenerateProgram}
          onBodyGroupSelected={handleBodyGroupSelected}
          onBodyPartSelected={handleBodyPartSelected}
          overlayOpen={!showQuestionnaire && isChatOverlayOpen}
          onCloseOverlay={() => setIsChatOverlayOpen(false)}
        />
      )}

      {/* Combined Overlay Container */}
      {showQuestionnaire && (
        <div className="fixed inset-0 bg-gray-900 z-[60]">
          <ExerciseQuestionnaire
            onClose={handleBack}
            onSubmit={handleQuestionnaireSubmit}
            generallyPainfulAreas={
              // Use actual selected body parts from 3D viewer, not LLM output
              selectedGroups.length > 0
                ? selectedGroups.map(g => g.name)
                : selectedPart
                  ? [selectedPart.name]
                  : []
            }
            programType={diagnosis?.programType ?? ProgramType.Exercise}
            targetAreas={selectedGroups}
            fullBody={false}
          />
        </div>
      )}

      {/* Mobile footer with selection info and chat button */}
      {isMobile && !hideNav && !showQuestionnaire && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[50] bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
          <div className="px-3 py-2 flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-sm text-white truncate">
                {selectedPart?.name || selectedGroups[0]?.name || 'Select an area'}
              </div>
              {selectedGroups.length > 0 && (
                <div className="text-xs text-gray-400 truncate">
                  {selectedGroups.map((g) => g.name).join(', ')}
                </div>
              )}
            </div>
            <button
              onClick={() => setIsChatOverlayOpen(true)}
              className="flex-shrink-0 px-3 py-1.5 text-sm rounded-full bg-indigo-600 text-white hover:bg-indigo-500 active:bg-indigo-700 transition-colors"
              aria-label="Open chat"
            >
              Chat
            </button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}