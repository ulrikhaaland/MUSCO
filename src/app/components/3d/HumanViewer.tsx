'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { DiagnosisAssistantResponse, Gender } from '../../types';
import PartPopup from '../ui/PartPopup';
import { useHumanAPI } from '@/app/hooks/useHumanAPI';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import MobileControls from './MobileControls';
import { ExerciseQuestionnaire } from '../ui/ExerciseQuestionnaire';
import { Question } from '@/app/types';
import { ExerciseQuestionnaireAnswers, ProgramType } from '../../../../shared/types';
import { useApp } from '@/app/context/AppContext';
import { useUser } from '@/app/context/UserContext';
import { logAnalyticsEvent } from '@/app/utils/analytics';

interface HumanViewerProps {
  gender: Gender;
  onGenderChange?: (gender: Gender) => void;
  shouldResetModel?: boolean;
}

export default function HumanViewer({
  gender,
  onGenderChange,
  shouldResetModel = false,
}: HumanViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const {
    selectedGroups,
    selectedExerciseGroupsRef,
    selectedPart,
    setSelectedGroup,
    setSelectedPart,
    selectedPainfulAreasRef,
    resetSelectionState,
    fullBodyRef,
  } = useApp();
  const lastSelectedIdRef = useRef<string | null>(null);
  const minChatWidth = 300;
  const maxChatWidth = 800;
  const [chatWidth, setChatWidth] = useState(384);
  const [isDragging, setIsDragging] = useState(false);
  const lastWidthRef = useRef(chatWidth);
  const rafRef = useRef<number | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [currentRotation, setCurrentRotation] = useState(0);
  const rotationAnimationRef = useRef<number | null>(null);
  const viewerWrapperRef = useRef<HTMLDivElement | null>(null);
  const [supportsKeyboardEnv, setSupportsKeyboardEnv] = useState(false);
  const [targetGender, setTargetGender] = useState<Gender | null>(null);
  const [modelContainerHeight, setModelContainerHeight] = useState('100svh');
  const [diagnosis, setDiagnosis] = useState<DiagnosisAssistantResponse | null>(
    null
  );
  const [isMobile, setIsMobile] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const { onQuestionnaireSubmit } = useUser();
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);

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

  // Detect support for stable viewport and keyboard inset env var
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const supports =
      typeof (window as any).CSS !== 'undefined' &&
      (window as any).CSS.supports?.(
        'height',
        'calc(100svh - env(keyboard-inset-height, 0px))'
      );
    setSupportsKeyboardEnv(Boolean(supports));
  }, []);

  // Remove previous paint nudge; use stable viewport strategy only

  const MODEL_IDS = {
    male: '5tOV',
    female: '5tOR',
  };

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
    [MODEL_IDS]
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
  }, [setSelectedGroup, setSelectedPart, setNeedsReset]);

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
  }, [selectedGroups, needsReset]);

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
        lastWidthRef.current = Math.min(
          Math.max(minChatWidth, newWidth),
          maxChatWidth
        );
        setChatWidth(lastWidthRef.current);
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
  }, [isRotating, currentRotation, isResetting]);

  // Clean up animation on unmount
  useEffect(() => {
    return () => {
      if (rotationAnimationRef.current) {
        cancelAnimationFrame(rotationAnimationRef.current);
      }
    };
  }, []);

  // Move window-dependent calculation to useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const initialWidth = Math.min(
        Math.max(minChatWidth, window.innerWidth / 2),
        maxChatWidth
      );
      setChatWidth(initialWidth);
    }
  }, []); // Empty dependency array means this runs once after mount

  const handleBottomSheetHeight = (sheetHeight: number) => {
    // Drive a CSS var to avoid React state reflows
    if (typeof document !== 'undefined') {
      document.documentElement.style.setProperty('--sheet-height', `${sheetHeight}px`);
    }
  };

  const handleQuestionClick = (question: Question) => {
    if (question.generate) {
      logAnalyticsEvent('open_questionnaire', { from: 'question_click' });
      if (diagnosis) {
        diagnosis.followUpQuestions = [];
        diagnosis.programType = ProgramType.Exercise;
      } else {
        const programType = question.programType ?? ProgramType.Exercise;
        const newDiagnosis: DiagnosisAssistantResponse = {
          diagnosis:
            question.programType === ProgramType.Exercise
              ? 'No diagnosis, just an exercise program'
              : 'No diagnosis, just a recovery program',
          programType: programType,
          painfulAreas: [
            ...(selectedGroups[0]?.name ? [selectedGroups[0].name] : []),
            ...(selectedPart?.name ? [selectedPart.name] : []),
          ],
          avoidActivities: [],
          onset: null,
          timeFrame: '1 week',
          followUpQuestions: [],
          informationalInsights: '',
          painScale: 0,
          mechanismOfInjury: null,
          aggravatingFactors: [],
          relievingFactors: [],
          priorInjury: null,
          painPattern: null,
          painLocation: null,
          painCharacter: null,
          assessmentComplete: false,
          redFlagsPresent: false,
          targetAreas: [],
        };
        setDiagnosis(newDiagnosis);
      }
      setShowQuestionnaire(true);
    }
  };

  const handleAreasSelected = () => {
    const newDiagnosis: DiagnosisAssistantResponse = {
      diagnosis:
        diagnosis?.programType === ProgramType.Exercise
          ? 'No diagnosis, just an exercise program'
          : 'No diagnosis, just a recovery program',
      programType: diagnosis?.programType ?? ProgramType.Exercise,
      painfulAreas: [
        ...selectedPainfulAreasRef.current.map((group) => group.name),
      ],
      avoidActivities: [],
      timeFrame: '1 week',
      followUpQuestions: [],
      informationalInsights: '',
      onset: null,
      painScale: 0,
      mechanismOfInjury: null,
      aggravatingFactors: [],
      relievingFactors: [],
      priorInjury: null,
      painPattern: null,
      painLocation: null,
      painCharacter: null,
      assessmentComplete: false,
      redFlagsPresent: false,
      targetAreas: [],
    };
    setDiagnosis(newDiagnosis);
    logAnalyticsEvent('open_questionnaire', { from: 'area_select' });
    setShowQuestionnaire(true);
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

  // Prevent parent scrolling
  useEffect(() => {
    const preventParentScroll = (e: WheelEvent) => {
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
  }, []);

  return (
    <div
      className="flex flex-col md:flex-row relative w-screen overflow-hidden"
      style={{ height: isMobile ? '100svh' : undefined }}
    >
      {/* Fullscreen overlay when dragging */}
      {isDragging && (
        <div className="fixed inset-0 z-50" style={{ cursor: 'ew-resize' }} />
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
          className="md:h-screen w-full"
          style={{
            height: isMobile ? 'calc(100svh - var(--sheet-height))' : '100dvh',
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

        {/* Controls - Desktop */}
        {!showQuestionnaire && (
          <div
            className="absolute bottom-6 right-6 md:flex space-x-4 hidden"
            style={{ zIndex: 1000 }}
          >
            <button
              onClick={handleRotate}
              disabled={isRotating || isResetting || !isReady}
              className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
                isRotating || isResetting || !isReady
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <CropRotateIcon
                className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`}
              />
              <span>{isRotating ? 'Rotating...' : 'Rotate Model'}</span>
            </button>
            <button
              onClick={() => handleReset(true)}
              disabled={
                isResetting || (!needsReset && selectedGroups.length === 0)
              }
              className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
                isResetting || (!needsReset && selectedGroups.length === 0)
                  ? 'opacity-50 cursor-not-allowed'
                  : ''
              }`}
            >
              <RestartAltIcon
                className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`}
              />
              <span>{isResetting ? 'Resetting...' : 'Reset View'}</span>
            </button>
            <button
              onClick={() => handleSwitchModel()}
              disabled={isChangingModel}
              className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
                isChangingModel ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {currentGender === 'male' ? (
                <MaleIcon
                  className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`}
                />
              ) : (
                <FemaleIcon
                  className={`h-5 w-5 ${isChangingModel ? 'animate-spin' : ''}`}
                />
              )}
              <span>
                {isChangingModel
                  ? 'Loading...'
                  : `Switch to ${currentGender === 'male' ? 'Female' : 'Male'}`}
              </span>
            </button>
          </div>
        )}
      </div>

      {/* Drag Handle - Desktop Only */}
      <div
        onMouseDown={startDragging}
        className="hidden md:block w-1 hover:w-2 bg-gray-800 hover:bg-indigo-600 cursor-ew-resize transition-all duration-150 active:bg-indigo-500 flex-shrink-0 z-40"
        style={{ touchAction: 'none' }}
      />

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
          />
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && (
        <MobileControls
          onAreasSelected={handleAreasSelected}
          isRotating={isRotating}
          isResetting={isResetting}
          isReady={isReady}
          needsReset={needsReset}
          selectedGroups={
            selectedGroups.length > 0
              ? selectedGroups
              : selectedExerciseGroupsRef.current
          }
          currentGender={currentGender}
          selectedPart={selectedPart}
          onRotate={handleRotate}
          onReset={handleReset}
          onSwitchModel={handleSwitchModel}
          onHeightChange={handleBottomSheetHeight}
          onQuestionClick={handleQuestionClick}
          hideBottomSheet={showQuestionnaire}
          onDiagnosis={setDiagnosis}
        />
      )}

      {/* Combined Overlay Container */}
      {showQuestionnaire && (
        <div className="fixed inset-0 bg-gray-900 z-[60]">
          <ExerciseQuestionnaire
            onClose={handleBack}
            onSubmit={handleQuestionnaireSubmit}
            generallyPainfulAreas={diagnosis?.painfulAreas ?? []}
            programType={diagnosis?.programType ?? ProgramType.Exercise}
            targetAreas={selectedExerciseGroupsRef.current}
            fullBody={fullBodyRef.current}
          />
        </div>
      )}
    </div>
  );
}