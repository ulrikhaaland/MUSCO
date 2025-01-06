'use client';

import { useRef, useState, useCallback, useEffect } from 'react';
import { Gender } from '../../types';
import { AnatomyPart } from '../../types/anatomy';
import PartPopup from '../ui/PartPopup';
import { useHumanAPI } from '@/app/hooks/useHumanAPI';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import MobileControls from './MobileControls';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { ExerciseQuestionnaire } from '../ui/ExerciseQuestionnaire';
import { Question } from '@/app/types';
import { generateExerciseProgram } from '@/app/api/assistant/assistant';
import { ExerciseProgramPage } from '../ui/ExerciseProgramPage';

interface HumanViewerProps {
  gender: Gender;
  onGenderChange?: (gender: Gender) => void;
}

export default function HumanViewer({
  gender,
  onGenderChange,
}: HumanViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [selectedGroup, setSelectedGroup] = useState<BodyPartGroup | null>(
    null
  );
  const [selectedPart, setSelectedPart] = useState<AnatomyPart | null>(null);
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
  const [isResetting, setIsResetting] = useState(false);
  const [targetGender, setTargetGender] = useState<Gender | null>(null);
  const [modelContainerHeight, setModelContainerHeight] = useState('100dvh');

  const [isMobile, setIsMobile] = useState(false);
  const selectedPartsRef = useRef<BodyPartGroup | null>(null);
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const MODEL_IDS = {
    male: '5tOV',
    female: '5rlW',
  };

  const {
    humanRef,
    currentGender,
    needsReset,
    setNeedsReset,
    isReady,
    initialCameraRef,
    previousSelectedPartGroupRef,
  } = useHumanAPI({
    elementId: 'myViewer',
    initialGender: gender,
    setSelectedGroup,
    setSelectedPart,
    onZoom: (objectId?: string) => handleZoom(objectId),
  });

  // Keep selectedPartsRef in sync
  useEffect(() => {
    selectedPartsRef.current = selectedGroup;
  }, [selectedGroup]);

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
          animationDuration: 0.1,
        });
      } else {
        handleReset();
        // If no part group selected, reset to initial camera position
        // if (initialCameraRef.current) {
        //   humanRef.current.send('camera.set', {
        //     ...initialCameraRef.current,
        //     animate: true,
        //     animationDuration: 0.5,
        //   });
        // }
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
      return viewerUrl.toString();
    },
    [MODEL_IDS]
  );

  const [viewerUrl, setViewerUrl] = useState(() => getViewerUrl(gender));
  const [isChangingModel, setIsChangingModel] = useState(false);
  const [diagnosis, setDiagnosis] = useState<string | null>(null);
  const [isGeneratingProgram, setIsGeneratingProgram] = useState(false);
  const [exerciseProgram, setExerciseProgram] = useState<any>(null);

  const handleSwitchModel = useCallback(() => {
    setIsChangingModel(true);
    const newGender: Gender = currentGender === 'male' ? 'female' : 'male';
    setTargetGender(newGender);
    setViewerUrl(getViewerUrl(newGender));

    // Reset states
    resetValues();

    // Call the parent's gender change handler
    onGenderChange?.(newGender);

    // Update URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.set('gender', newGender);
    window.history.pushState({}, '', url.toString());
  }, [currentGender, getViewerUrl, onGenderChange]);

  // Clear target gender when model change is complete
  useEffect(() => {
    if (!isChangingModel) {
      setTargetGender(null);
    }
  }, [isChangingModel]);

  const resetValues = () => {
    previousSelectedPartGroupRef.current = null;

    setCurrentRotation(0);
    setSelectedPart(null);
    setSelectedGroup(null);
    lastSelectedIdRef.current = null;
    setNeedsReset(false);
  };

  const handleReset = useCallback(() => {
    if (isResetting) return;

    setIsResetting(true);

    // Use scene.reset to reset everything to initial state
    if (humanRef.current) {
      humanRef.current.on('camera.updated', () => {});
      setTimeout(() => {
        humanRef.current?.send('scene.reset', () => {
          // Reset all our state after the scene has been reset
          resetValues();

          // Clear reset state after a short delay to allow for animation
          setTimeout(() => {
            setIsResetting(false);
          }, 500);
        });
      }, 100);
    } else {
      setIsResetting(false);
    }
  }, [isResetting, setNeedsReset, isReady, humanRef]);

  // Update reset button state when parts are selected
  useEffect(() => {
    setNeedsReset(selectedGroup !== null || needsReset);
  }, [selectedGroup, needsReset]);

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
    const newHeight = `calc(100dvh - ${sheetHeight}px)`;
    if (newHeight !== modelContainerHeight) {
      setModelContainerHeight(newHeight);
    }
  };

  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(
    null
  );

  const handleQuestionClick = (question: Question) => {
    if (question.generate) {
      setDiagnosis(question.diagnosis);
      setSelectedQuestion(question);
      setShowQuestionnaire(true);
    }
  };

  const handleBack = () => {
    resetValues();
    setShowQuestionnaire(false);
    setExerciseProgram(null);
    setIsGeneratingProgram(false);
  };

  const handleQuestionnaireSubmit = async (
    answers: Record<string, string | number | string[]>
  ) => {
    // Show program page with loading state immediately
    setShowQuestionnaire(false);
    setIsGeneratingProgram(true);

    try {
      const program = await generateExerciseProgram(
        selectedQuestion?.diagnosis ?? '',
        {
          selectedBodyGroup: selectedGroup?.name,
          selectedBodyPart: selectedPart?.name,
          age: String(answers.age),
          pastExercise: String(answers.pastExercise),
          plannedExercise: String(answers.plannedExercise),
          painAreas: Array.isArray(answers.painAreas) ? answers.painAreas : [],
          exercisePain: String(answers.exercisePain).toLowerCase() === 'true',
          painfulAreas: Array.isArray(answers.painfulAreas)
            ? answers.painfulAreas
            : [],
          trainingType: String(answers.trainingType),
          trainingLocation: String(answers.trainingLocation),
        }
      );
      console.log('=== program ===', program);
      setExerciseProgram(program);
    } catch (error) {
      console.error('Error generating exercise program:', error);
    } finally {
      setIsGeneratingProgram(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row relative h-screen w-screen overflow-hidden">
      {/* Fullscreen overlay when dragging */}
      {isDragging && (
        <div
          className="fixed inset-0 z-50"
          style={{ cursor: 'ew-resize' }}
        />
      )}

      {/* Model Viewer Container */}
      <div className="flex-1 relative bg-black flex flex-col" style={{ minWidth: `${minChatWidth}px` }}>
        {isChangingModel && (
          <div className="absolute inset-0 z-50 bg-black flex items-center justify-center">
            <div className="text-white text-xl">
              Loading{' '}
              {targetGender?.charAt(0).toUpperCase() + targetGender?.slice(1)}{' '}
              Model...
            </div>
          </div>
        )}
        {/* Iframe interaction blocker when overlays are shown */}
        {(showQuestionnaire || isGeneratingProgram || exerciseProgram) && (
          <div className="absolute inset-0 z-[1000]" />
        )}
        {/* Mobile: subtract 72px for controls, Desktop: full height */}
        <div
          className="md:h-screen w-full relative"
          style={{ height: isMobile ? modelContainerHeight : '100dvh' }}
        >
          <iframe
            id="myViewer"
            ref={iframeRef}
            src={viewerUrl}
            className="absolute inset-0 w-full h-full border-0 bg-black"
            allow="fullscreen"
            allowFullScreen
            onLoad={() => {
              console.log('=== iframe loaded ===');
              console.log('viewerUrl:', viewerUrl);
              setIsChangingModel(false);
            }}
          />
        </div>

        {/* Controls - Desktop */}
        <div className="absolute bottom-6 right-6 md:flex space-x-4 hidden" style={{ zIndex: 1000 }}>
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
            onClick={handleReset}
            disabled={
              isResetting || (!needsReset && selectedGroup === null)
            }
            className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
              isResetting || (!needsReset && selectedGroup === null)
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
            onClick={handleSwitchModel}
            disabled={isChangingModel}
            className={`bg-indigo-600/80 hover:bg-indigo-500/80 text-white px-4 py-2 rounded-lg shadow-lg transition-colors duration-200 flex items-center space-x-2 ${
              isChangingModel ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {currentGender === 'male' ? (
              <MaleIcon
                className={`h-5 w-5 ${
                  isChangingModel ? 'animate-spin' : ''
                }`}
              />
            ) : (
              <FemaleIcon
                className={`h-5 w-5 ${
                  isChangingModel ? 'animate-spin' : ''
                }`}
              />
            )}
            <span>
              {isChangingModel
                ? 'Loading...'
                : `Switch to ${
                    currentGender === 'male' ? 'Female' : 'Male'
                  }`}
            </span>
          </button>
        </div>
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
        } ${'translate-x-0 opacity-100'}`}
        style={{
          width: `${chatWidth}px`,
          minWidth: `${minChatWidth}px`,
          maxWidth: `${maxChatWidth}px`,
        }}
      >
        <div className="h-full border-l border-gray-800">
          <PartPopup
            part={selectedPart}
            group={selectedGroup}
            onClose={() => {}}
            onQuestionClick={handleQuestionClick}
          />
        </div>
      </div>

      {/* Mobile Controls */}
      {isMobile && (
        <MobileControls
          isRotating={isRotating}
          isResetting={isResetting}
          isReady={isReady}
          needsReset={needsReset}
          selectedGroup={selectedGroup}
          isChangingModel={isChangingModel}
          currentGender={currentGender}
          selectedPart={selectedPart}
          onRotate={handleRotate}
          onReset={handleReset}
          onSwitchModel={handleSwitchModel}
          onHeightChange={handleBottomSheetHeight}
          onQuestionClick={handleQuestionClick}
        />
      )}

      {/* Questionnaire Overlay */}
      {showQuestionnaire && !isGeneratingProgram && !exerciseProgram && (
        <div 
          className="fixed inset-0 z-[1001]" 
          style={{ 
            touchAction: 'pan-y pinch-zoom',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="absolute inset-0 bg-gray-900 bg-opacity-95" />
          <div className="relative h-full overflow-y-auto">
            <ExerciseQuestionnaire
              onClose={handleBack}
              onSubmit={handleQuestionnaireSubmit}
            />
          </div>
        </div>
      )}

      {/* Exercise Program Overlay */}
      {(isGeneratingProgram || exerciseProgram) && (
        <div 
          className="fixed inset-0 z-[1001]"
          style={{ 
            touchAction: 'pan-y pinch-zoom',
            WebkitOverflowScrolling: 'touch'
          }}
        >
          <div className="absolute inset-0 bg-gray-900 bg-opacity-95" />
          <div className="relative h-full overflow-y-auto">
            <ExerciseProgramPage
              onBack={handleBack}
              isLoading={isGeneratingProgram}
              program={exerciseProgram}
            />
          </div>
        </div>
      )}
    </div>
  );
}
