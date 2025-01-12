'use client';

import {
  useState,
  useEffect,
  useRef,
  RefAttributes,
  ComponentType,
  useCallback,
} from 'react';
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet';
import type { BottomSheetProps } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import CropRotateIcon from '@mui/icons-material/CropRotate';
import MaleIcon from '@mui/icons-material/Male';
import FemaleIcon from '@mui/icons-material/Female';
import { DiagnosisAssistantResponse, Gender, Question } from '@/app/types';
import { AnatomyPart } from '@/app/types/anatomy';
import { ChatMessages } from '../ui/ChatMessages';
import { usePartChat } from '@/app/hooks/usePartChat';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { BottomSheetHeader } from './BottomSheetHeader';
import { BottomSheetFooter } from './BottomSheetFooter';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MobileControlButtons from './MobileControlButtons';
import { Steps } from 'intro.js-react';
import 'intro.js/introjs.css';

enum SnapPoint {
  MINIMIZED = 0, // minHeight (15% or 72px)
  PREVIEW = 1, // 40% of viewport height
  EXPANDED = 2, // 78% of viewport height
  FULL = 3, // 100% of viewport height
}

interface MobileControlsProps {
  isRotating: boolean;
  isResetting: boolean;
  isReady: boolean;
  needsReset: boolean;
  selectedGroup: BodyPartGroup | null;
  isChangingModel: boolean;
  currentGender: Gender;
  selectedPart: AnatomyPart | null;
  onRotate: () => void;
  onReset: () => void;
  onSwitchModel: () => void;
  onHeightChange?: (height: number) => void;
  onQuestionClick?: (question: Question) => void;
  onDiagnosis: (response: DiagnosisAssistantResponse) => void;
  hideBottomSheet?: boolean;
}

// Use BottomSheet directly
const BottomSheetBase = BottomSheet as ComponentType<
  BottomSheetProps & RefAttributes<BottomSheetRef>
>;

export default function MobileControls({
  isRotating,
  isResetting,
  isReady,
  needsReset,
  selectedGroup,
  isChangingModel,
  currentGender,
  selectedPart,
  onRotate,
  onReset,
  onSwitchModel,
  onHeightChange,
  onQuestionClick,
  onDiagnosis,
  hideBottomSheet,
}: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [userModifiedSheetHeight, setUserModifiedSheetHeight] = useState(false);
  const [currentSnapPoint, setCurrentSnapPoint] = useState<SnapPoint>(
    SnapPoint.MINIMIZED
  );
  const previousSnapPointRef = useRef<SnapPoint>(SnapPoint.MINIMIZED);
  const sheetRef = useRef<BottomSheetRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [controlsBottom, setControlsBottom] = useState('5rem');
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [bottomSheetTourEnabled, setBottomSheetTourEnabled] = useState(false);

  const {
    messages,
    isLoading,
    followUpQuestions,
    messagesRef,
    resetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    assistantResponse,
  } = usePartChat({ selectedPart: selectedPart, selectedGroup: selectedGroup });

  const bottomSheetSteps = [
    {
      element: '[data-rsbs-header] .flex-col',
      intro: 'Here you can see the selected body group, and right below it, the selected body part.',
      position: 'bottom',
    },
    {
      element: '[data-rsbs-header] button',
      intro: 'Use this button to reset the chat and start over.',
      position: 'bottom',
    },
    {
      element: '[data-rsbs-scroll]',
      intro: 'Click on suggested questions to learn more about the selected body part.',
      position: 'bottom',
    },
    {
      element: '[data-rsbs-footer] textarea',
      intro: 'Type your questions here to learn more about anatomy, exercises, and treatment options.',
      position: 'top',
    },
    {
      element: '.mobile-controls-toggle',
      intro: 'Use these buttons to expand or minimize the chat area.',
      position: 'left',
    },
  ];

  const onBottomSheetTourExit = () => {
    if (selectedGroup) {
      setBottomSheetTourEnabled(false);
      localStorage.setItem('bottomSheetTourShown', 'true');
    }
  };

  useEffect(() => {
    if (selectedGroup) {
      const tourShown = localStorage.getItem('bottomSheetTourShown');
      if (!tourShown) {
        setTimeout(() => {
          setBottomSheetTourEnabled(true);
        }, 1000);
      }
    }
  }, [selectedGroup]);

  // Get the actual viewport height accounting for mobile browser UI
  const getViewportHeight = () => {
    return window.innerHeight * 0.01 * 100; // Convert to dvh equivalent
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const updateContentHeight = () => {
      if (contentRef.current) {
        // Get the container that holds all content (messages and input)
        const contentContainer = contentRef.current.querySelector(
          '#bottom-sheet-content'
        );

        // Find the footer element in the bottom sheet
        const footer = document.querySelector('[data-rsbs-footer]');
        const footerHeight = footer?.getBoundingClientRect().height ?? 0;

        if (contentContainer) {
          const localContentHeight = contentContainer.scrollHeight;
          const height = localContentHeight + headerHeight + footerHeight;
          setContentHeight(height);
        }
      }
    };

    // Update height when messages or follow-up questions change
    updateContentHeight();

    // Set up a ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(updateContentHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    // Also observe the footer for height changes
    const footer = document.querySelector('[data-rsbs-footer]');
    if (footer) {
      resizeObserver.observe(footer);
    }

    return () => resizeObserver.disconnect();
  }, [messages, followUpQuestions, headerHeight]);

  const getSnapPointIndex = (snapPoint: SnapPoint) => {
    if (snapPoint === SnapPoint.MINIMIZED) return 0;
    if (snapPoint === SnapPoint.PREVIEW) return 1;
    if (snapPoint === SnapPoint.EXPANDED) return 2;
    if (snapPoint === SnapPoint.FULL) return 3;
    return 0;
  };

  // Handle body part selection and deselection
  useEffect(() => {
    const hasContent = messages.length > 0 || followUpQuestions.length > 0;
    const loadingComplete = !isLoading || messages.length === 0;
    // Only manipulate sheet height if user hasn't modified it
    if (!userModifiedSheetHeight) {
      if (
        selectedGroup &&
        loadingComplete &&
        hasContent &&
        getSnapPointIndex(currentSnapPoint) < 2
      ) {
        if (sheetRef.current) {
          let snapPoint = getSnapPoints()[1];
          if (contentHeight < snapPoint) {
            snapPoint = contentHeight;
          }
          setTimeout(() => {
            sheetRef.current.snapTo(({ maxHeight }) => snapPoint);
          }, 200);
        }
      } else if (selectedGroup && isLoading && messages.length === 1) {
        // First message is loading, expand to third snap point
        if (sheetRef.current) {
          const snapPoints = getSnapPoints();
          const thirdPoint = snapPoints[2]; // viewportHeight * 0.78
          setTimeout(() => {
            sheetRef.current.snapTo(() => thirdPoint);
          }, 200);
        }
      } else if (!selectedGroup && messages.length === 0) {
        // Part was deselected
        setIsDragging(true);
        if (sheetRef.current) {
          sheetRef.current.snapTo(({ maxHeight }) =>
            Math.min(maxHeight * 0.15, 72)
          );
        }
      }
    }
  }, [
    selectedGroup,
    isLoading,
    messages,
    followUpQuestions,
    contentHeight,
    userModifiedSheetHeight,
  ]);

  // Update model height whenever sheet height changes
  const updateModelHeight = (sheetHeight: number) => {
    if (onHeightChange) {
      onHeightChange(sheetHeight);
    }
  };

  useEffect(() => {
    // Track bottom sheet height changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'attributes' &&
          mutation.attributeName === 'style'
        ) {
          const element = mutation.target as HTMLElement;
          const height = element.getBoundingClientRect().height;
          updateModelHeight(height);
        }
      });
    });

    if (sheetRef.current) {
      const element = sheetRef.current as unknown as HTMLElement;
      observer.observe(element, {
        attributes: true,
        attributeFilter: ['style'],
      });
    }

    return () => observer.disconnect();
  }, []);

  // Track height changes only during drag or animation
  useEffect(() => {
    let rafId: number;
    let lastHeight = 0;

    const checkHeight = () => {
      if (sheetRef.current) {
        const currentHeight = sheetRef.current.height;
        if (currentHeight !== lastHeight) {
          lastHeight = currentHeight;
          updateModelHeight(currentHeight);
          setControlsBottom(`calc(${currentHeight}px + 1rem)`);
        }
      }
      rafId = requestAnimationFrame(checkHeight);
    };

    // Run the animation frame loop continuously to track height changes
    rafId = requestAnimationFrame(checkHeight);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  const getSnapPoints = (): number[] => {
    const viewportHeight = getViewportHeight();
    const minHeight = Math.min(viewportHeight * 0.15, 72);
    const hasContent = Boolean(selectedGroup) || messages.length > 0;

    if (!hasContent) {
      return [minHeight];
    }

    // if (contentHeight <= minHeight) {
    //   return [minHeight];
    // }

    let secondSnapPoint = viewportHeight * 0.4;
    if (messages.length === 0) {
      secondSnapPoint = contentHeight;
    }

    return [minHeight, secondSnapPoint, viewportHeight * 0.78, viewportHeight];
  };

  // Track height changes only during drag or animation
  useEffect(() => {
    let rafId: number;
    let lastHeight = 0;

    const checkHeight = () => {
      if (sheetRef.current) {
        const currentHeight = sheetRef.current.height;
        if (currentHeight !== lastHeight) {
          lastHeight = currentHeight;
          updateModelHeight(currentHeight);
          setControlsBottom(`calc(${currentHeight}px + 1rem)`);
        }
      }
      rafId = requestAnimationFrame(checkHeight);
    };

    // Run the animation frame loop continuously to track height changes
    rafId = requestAnimationFrame(checkHeight);

    return () => {
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Remove the old controls position effect since we're handling it in the RAF loop
  useEffect(() => {
    const updateControlsPosition = () => {
      if (sheetRef.current) {
        setControlsBottom(`calc(${sheetRef.current.height}px + 1rem)`);
      }
    };
    updateControlsPosition();
  }, []); // Just set initial position

  const handleQuestionSelect = (question: Question) => {
    if (question.generate && onQuestionClick) {
      onQuestionClick(question);
    } else {
      handleOptionClick(question);
    }
  };

  // Store previous snap point when hiding
  useEffect(() => {
    if (hideBottomSheet) {
      previousSnapPointRef.current = currentSnapPoint;
    } else {
      // Restore previous height when becoming visible again
      if (
        sheetRef.current &&
        previousSnapPointRef.current !== currentSnapPoint
      ) {
        const snapPoints = getSnapPoints();
        const targetHeight = snapPoints[previousSnapPointRef.current];
        setTimeout(() => {
          sheetRef.current?.snapTo(() => targetHeight);
          setCurrentSnapPoint(previousSnapPointRef.current);
        }, 0);
      }
    }
  }, [hideBottomSheet]);

  useEffect(() => {
    if (assistantResponse) {
      onDiagnosis(assistantResponse);
    }
  }, [assistantResponse]);

  useEffect(() => {
    if (!selectedGroup && userModifiedSheetHeight) {
      setUserModifiedSheetHeight(false);
    }
  }, [selectedGroup, userModifiedSheetHeight]);

  return (
    <>
      <Steps
        enabled={bottomSheetTourEnabled}
        steps={bottomSheetSteps}
        initialStep={0}
        onExit={onBottomSheetTourExit}
        options={{
          showBullets: false,
          showProgress: true,
          hideNext: false,
          hidePrev: false,
          nextLabel: 'Next →',
          prevLabel: '← Back',
          doneLabel: 'Got it',
          tooltipClass: 'bg-gray-900 text-white',
          highlightClass: 'intro-highlight',
          exitOnOverlayClick: false,
          exitOnEsc: true,
          scrollTo: false,
        }}
      />

      {/* Mobile Controls - Positioned relative to bottom sheet */}
      {isMobile && currentSnapPoint !== SnapPoint.FULL && (
        <MobileControlButtons
          isRotating={isRotating}
          isResetting={isResetting}
          isReady={isReady}
          needsReset={needsReset}
          currentGender={currentGender}
          controlsBottom={controlsBottom}
          onRotate={onRotate}
          onReset={onReset}
          onSwitchModel={onSwitchModel}
        />
      )}

      {/* Expand/Collapse Buttons - Fixed to bottom right */}
      {isMobile &&
        sheetRef.current &&
        (selectedGroup || messages.length > 0) && (
          <div className="mobile-controls-toggle md:hidden fixed right-2 bottom-4 flex bg-transparent rounded-lg z-10">
            <button
              onClick={() => {
                if (sheetRef.current) {
                  const currentHeight = sheetRef.current.height;
                  const snapPoints = getSnapPoints();
                  const minHeight = Math.min(getViewportHeight() * 0.15, 72);

                  // Find next smaller snap point
                  const nextPoint = [...snapPoints]
                    .reverse()
                    .find((point) => point < currentHeight - 2);
                  if (nextPoint) {
                    if (nextPoint === snapPoints[0]) {
                      setCurrentSnapPoint(SnapPoint.MINIMIZED);
                    }
                    setUserModifiedSheetHeight(true);
                    sheetRef.current.snapTo(() => nextPoint);
                  }
                }
              }}
              disabled={(() => {
                if (!sheetRef.current) return true;
                const currentHeight = sheetRef.current.height;
                const snapPoints = getSnapPoints();
                return !snapPoints.some((point) => point < currentHeight - 2);
              })()}
              className={`text-white p-1 bg-transparent rounded-lg transition-colors duration-200 ${
                (() => {
                  if (!sheetRef.current) return true;
                  const currentHeight = sheetRef.current.height;
                  const snapPoints = getSnapPoints();
                  return !snapPoints.some((point) => point < currentHeight - 2);
                })()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Minimize"
            >
              <ExpandLessIcon className="h-6 w-6 rotate-180" />
            </button>
            <button
              onClick={() => {
                if (sheetRef.current) {
                  const currentHeight = sheetRef.current.height;
                  const snapPoints = getSnapPoints();

                  // Find next larger snap point
                  const nextPoint = snapPoints.find(
                    (point) => point > currentHeight + 2
                  );
                  if (nextPoint) {
                    if (nextPoint === snapPoints[1]) {
                      setCurrentSnapPoint(SnapPoint.PREVIEW);
                    }
                    setUserModifiedSheetHeight(true);
                    sheetRef.current.snapTo(() => nextPoint);
                  }
                }
              }}
              disabled={(() => {
                if (!sheetRef.current) return true;
                const currentHeight = sheetRef.current.height;
                const snapPoints = getSnapPoints();
                return !snapPoints.some((point) => point > currentHeight + 2);
              })()}
              className={`text-white p-1 bg-transparent rounded-lg transition-colors duration-200 ${
                (() => {
                  if (!sheetRef.current) return true;
                  const currentHeight = sheetRef.current.height;
                  const snapPoints = getSnapPoints();
                  return !snapPoints.some((point) => point > currentHeight + 2);
                })()
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:bg-white/10'
              }`}
              aria-label="Expand"
            >
              <ExpandLessIcon className="h-6 w-6" />
            </button>
          </div>
        )}

      {/* Bottom Sheet */}
      <BottomSheetBase
        className={`!bg-gray-900 [&>*]:!bg-gray-900 relative h-[100dvh] ${
          hideBottomSheet ? 'pointer-events-none opacity-0' : ''
        } ${bottomSheetTourEnabled ? 'z-[999999]' : ''}`}
        ref={sheetRef}
        open={!hideBottomSheet}
        blocking={false}
        defaultSnap={({ maxHeight }) => {
          const minHeight = Math.min(maxHeight * 0.15, 72);
          // Use previous snap point if available, otherwise use minimum height
          if (previousSnapPointRef.current !== SnapPoint.MINIMIZED) {
            const snapPoints = getSnapPoints();
            return snapPoints[previousSnapPointRef.current];
          }
          return minHeight;
        }}
        snapPoints={getSnapPoints}
        expandOnContentDrag={false}
        onSpringStart={(event) => {
          const source = (event as any).source;
          if (
            source === 'dragging' &&
            currentSnapPoint !== SnapPoint.MINIMIZED
          ) {
            setUserModifiedSheetHeight(true);
          }
          if (!isDragging) {
            setIsDragging(true);
            setTimeout(() => {
              setIsDragging(false);
            }, 100);
          }
          if (sheetRef.current) {
            const currentHeight = sheetRef.current.height;
            const viewportHeight = getViewportHeight();
            updateModelHeight(currentHeight);

            // Find which snap point we're closest to
            const snapPoints = getSnapPoints();
            const closestPointIndex = snapPoints.reduce(
              (prevIndex, curr, index, arr) => {
                const prev = arr[prevIndex];
                return Math.abs(curr - currentHeight) <
                  Math.abs(prev - currentHeight)
                  ? index
                  : prevIndex;
              },
              0
            );
            if (closestPointIndex !== currentSnapPoint) {
              setCurrentSnapPoint(closestPointIndex as SnapPoint);
            }
          }
        }}
        onSpringEnd={(event) => {
          if (sheetRef.current) {
            const currentHeight = sheetRef.current.height;
            const viewportHeight = getViewportHeight();
            const minHeight = Math.min(viewportHeight * 0.15, 72);
            const isNowExpanded = currentHeight > minHeight;

            updateModelHeight(currentHeight);

            // Update current snap point at the end of animation
            const snapPoints = getSnapPoints();
            const closestPointIndex = snapPoints.reduce(
              (prevIndex, curr, index, arr) => {
                const prev = arr[prevIndex];
                return Math.abs(curr - currentHeight) <
                  Math.abs(prev - currentHeight)
                  ? index
                  : prevIndex;
              },
              0
            );
            setCurrentSnapPoint(closestPointIndex as SnapPoint);
          }
        }}
        header={
          <BottomSheetHeader
            messages={messages}
            isLoading={isLoading}
            getGroupDisplayName={getGroupDisplayName}
            getPartDisplayName={getPartDisplayName}
            resetChat={resetChat}
            onHeightChange={setHeaderHeight}
            isMinimized={currentSnapPoint === SnapPoint.MINIMIZED}
          />
        }
        footer={
          (selectedGroup || messages.length > 0) && (
            <BottomSheetFooter
              message={message}
              isLoading={isLoading}
              textareaRef={textareaRef}
              setMessage={setMessage}
              handleOptionClick={handleOptionClick}
            />
          )
        }
      >
        <div ref={contentRef} className="flex-1 flex flex-col h-full">
          {!selectedGroup && messages.length === 0 ? (
            <div className="h-[72px]" />
          ) : (
            /* Expanded Content */
            <div
              id="bottom-sheet-content"
              className="flex-1 flex px-4 py-2 flex-col"
            >
              {/* Chat Messages */}
              <div className="flex-1 min-h-0">
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  followUpQuestions={followUpQuestions}
                  onQuestionClick={handleQuestionSelect}
                  part={selectedPart}
                  messagesRef={messagesRef}
                  isMobile={isMobile}
                />
              </div>
            </div>
          )}
        </div>
      </BottomSheetBase>
    </>
  );
}
