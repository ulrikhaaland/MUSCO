'use client';

import {
  useState,
  useEffect,
  useRef,
  useCallback,
  RefAttributes,
  ComponentType,
} from 'react';
import { BottomSheet, BottomSheetRef } from 'react-spring-bottom-sheet';
import type { BottomSheetProps } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import {
  DiagnosisAssistantResponse,
  Gender,
  Question,
  ChatMessage,
} from '@/app/types';
import { ChatMessages } from '../ui/ChatMessages';
import { usePartChat } from '@/app/hooks/usePartChat';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { BottomSheetHeader } from './BottomSheetHeader';
import { BottomSheetFooter } from './BottomSheetFooter';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import MobileControlButtons from './MobileControlButtons';
import { AnatomyPart } from '@/app/types/human';
import { ExerciseSelection } from '../ui/ExerciseSelection';
import { useApp, ProgramIntention } from '@/app/context/AppContext';
import { ExerciseFooter } from './ExerciseFooter';
import { useTranslation } from '@/app/i18n';

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
  selectedGroups: BodyPartGroup[];
  currentGender: Gender;
  selectedPart: AnatomyPart | null;
  onRotate: () => void;
  onReset: (resetSelectionState?: boolean) => void;
  onSwitchModel: () => void;
  onHeightChange?: (height: number) => void;
  onQuestionClick?: (question: Question) => void;
  onDiagnosis: (response: DiagnosisAssistantResponse) => void;
  hideBottomSheet?: boolean;
  onAreasSelected: () => void;
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
  selectedGroups,
  currentGender,
  selectedPart,
  onRotate,
  onReset,
  onSwitchModel,
  onHeightChange,
  onQuestionClick,
  onDiagnosis,
  hideBottomSheet,
  onAreasSelected,
}: MobileControlsProps) {
  const { t } = useTranslation();
  const [isMobile, setIsMobile] = useState(false);
  const hasInitiallyExpanded = useRef(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [userModifiedSheetHeight, setUserModifiedSheetHeight] = useState(false);
  const [currentSnapPoint, setCurrentSnapPoint] = useState<SnapPoint>(
    SnapPoint.MINIMIZED
  );
  const previousSnapPointRef = useRef<SnapPoint>(SnapPoint.MINIMIZED);
  const sheetRef = useRef<BottomSheetRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [, setFooterHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [controlsBottom, setControlsBottom] = useState('5rem');
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { intention, selectedExerciseGroupsRef, fullBodyRef } = useApp();

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
    streamError,
  } = usePartChat({
    selectedPart: selectedPart,
    selectedGroups: selectedGroups,
  });

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
      // Get the overlay element (main bottom sheet container)
      const overlay = document.querySelector('[data-rsbs-overlay="true"]');
      const header = document.querySelector('[data-rsbs-header="true"]');
      const footer = document.querySelector('[data-rsbs-footer]');

      if (overlay && header) {
        // Get the exact height of the overlay element directly
        const overlayHeight = (overlay as HTMLElement).getBoundingClientRect()
          .height;

        // Just use the actual height of the overlay element
        const totalHeight = overlayHeight;

        // For informational purposes only, still calculate content height
        const headerHeight = header.getBoundingClientRect().height;
        const footerHeight = footer?.getBoundingClientRect().height ?? 0;
        setFooterHeight(footerHeight);
        const contentHeight = totalHeight - headerHeight - footerHeight;

        if (contentHeight > 0) {
          setContentHeight(contentHeight);
        } else {
          if (contentRef.current) {
            // Get the container that holds all content (messages and input)
            const contentContainer = contentRef.current.querySelector(
              '#bottom-sheet-content'
            );

            // Find the footer element in the bottom sheet
            const footer = document.querySelector('[data-rsbs-footer]');
            const footerHeight = footer?.getBoundingClientRect().height ?? 0;
            setFooterHeight(footerHeight);
            if (contentContainer) {
              const localContentHeight = (
                contentContainer as HTMLElement
              ).getBoundingClientRect().height;
              const height = localContentHeight + headerHeight + footerHeight;
              setContentHeight(height);
            }
          }
        }
      } else if (contentRef.current) {
        // Fallback to our original approach if overlay elements aren't found

        const footer = document.querySelector('[data-rsbs-footer]');
        const footerHeight = footer?.getBoundingClientRect().height ?? 0;
        setFooterHeight(footerHeight);

        // Fixed reasonable height that doesn't expand too much
        const fixedContentHeight = 200 + Math.min(200, messages.length * 50);
        const totalHeight = fixedContentHeight + headerHeight + footerHeight;

        setContentHeight(totalHeight);
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
    const hasContent =
      messages.length > 0 ||
      followUpQuestions.length > 0 ||
      fullBodyRef.current;

    const loadingComplete = !isLoading || messages.length === 0;
    // Only manipulate sheet height if user hasn't modified it
    if (!userModifiedSheetHeight) {
      if (
        (selectedGroups.length > 0 ||
          selectedExerciseGroupsRef.current.length > 0 ||
          fullBodyRef.current) &&
        loadingComplete &&
        hasContent &&
        getSnapPointIndex(currentSnapPoint) < 2 &&
        !hasInitiallyExpanded.current
      ) {
        if (sheetRef.current) {
          let snapPoint = getSnapPoints()[1];

          if (contentHeight < snapPoint) {
            snapPoint = contentHeight;
          }
          setTimeout(
            () => {
              if (sheetRef.current) {
                sheetRef.current.snapTo(({ maxHeight }) => snapPoint);
                hasInitiallyExpanded.current = true;
              }
            },
            intention === ProgramIntention.Exercise ? 1000 : 300
          );
        }
      } else if (
        selectedGroups.length > 0 &&
        isLoading &&
        messages.length === 1
      ) {
        // First message is loading, expand to third snap point
        if (sheetRef.current) {
          const snapPoints = getSnapPoints();
          const thirdPoint = snapPoints[2]; // viewportHeight * 0.78
          setTimeout(() => {
            sheetRef.current.snapTo(() => thirdPoint);
          }, 200);
        }
      } else if (selectedGroups.length === 0 && messages.length === 0) {
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
    selectedGroups,
    isLoading,
    messages,
    followUpQuestions,
    contentHeight,
    userModifiedSheetHeight,
  ]);

  // Track if keyboard is likely open based on viewport changes
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const initialViewportHeightRef = useRef<number | null>(null);
  const lastViewportHeightRef = useRef<number | null>(null);

  // Update model height whenever sheet height changes, but only if keyboard isn't affecting viewport
  const updateModelHeight = useCallback((sheetHeight: number) => {
    if (onHeightChange && !keyboardOpen) {
      onHeightChange(sheetHeight);
    }
  }, [onHeightChange, keyboardOpen]);

  // Detect keyboard open/close based on viewport height changes
  useEffect(() => {
    const handleResize = () => {
      const currentHeight = window.innerHeight;
      
      // Capture initial height
      if (initialViewportHeightRef.current === null) {
        initialViewportHeightRef.current = currentHeight;
        lastViewportHeightRef.current = currentHeight;
        return;
      }

      // Detect significant viewport height change (likely keyboard)
      const heightDiff = Math.abs(currentHeight - initialViewportHeightRef.current);
      const isKeyboardLikelyOpen = heightDiff > 150; // Threshold for keyboard detection
      
      if (isKeyboardLikelyOpen !== keyboardOpen) {
        setKeyboardOpen(isKeyboardLikelyOpen);
      }
      
      lastViewportHeightRef.current = currentHeight;
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [keyboardOpen]);

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
    const hasContent =
      Boolean(selectedGroups.length > 0) ||
      messages.length > 0 ||
      fullBodyRef.current;

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
    if (!selectedGroups.length && userModifiedSheetHeight) {
      setUserModifiedSheetHeight(false);
    }
  }, [selectedGroups.length, userModifiedSheetHeight]);

  // Handle resending a message when it was interrupted
  const handleResendMessage = (message: ChatMessage) => {
    if (message.role === 'user') {
      handleOptionClick({
        title: '',
        question: message.content,
      });
    }
  };

  return (
    <>
      {/* Mobile Controls - Positioned relative to bottom sheet */}
      {isMobile &&
        currentSnapPoint !== SnapPoint.FULL &&
        currentSnapPoint !== SnapPoint.EXPANDED && (
          <MobileControlButtons
            isRotating={isRotating}
            isResetting={isResetting}
            isReady={isReady}
            needsReset={needsReset}
            currentGender={currentGender}
            controlsBottom={controlsBottom}
            onRotate={onRotate}
            onReset={() => onReset(intention !== ProgramIntention.Exercise)}
            onSwitchModel={onSwitchModel}
          />
        )}

      {/* Expand/Collapse Buttons - Fixed to bottom right */}
      {isMobile &&
        intention !== ProgramIntention.Exercise &&
        sheetRef.current &&
        (selectedGroups.length > 0 || messages.length > 0) && (
          <div className="mobile-controls-toggle md:hidden fixed right-2 bottom-4 flex bg-transparent rounded-lg z-10">
            <button
              onClick={() => {
                if (sheetRef.current) {
                  const currentHeight = sheetRef.current.height;
                  const snapPoints = getSnapPoints();
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
              aria-label={t('mobile.controls.minimize')}
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
              aria-label={t('mobile.controls.expand')}
            >
              <ExpandLessIcon className="h-6 w-6" />
            </button>
          </div>
        )}

      {/* Bottom Sheet */}
      <BottomSheetBase
        className={`!bg-gray-900 [&>*]:!bg-gray-900 relative h-[100vh] ${
          hideBottomSheet ? 'pointer-events-none opacity-0' : ''
        }`}
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
        maxHeight={
          intention === ProgramIntention.Exercise ? contentHeight : null
        }
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
        onSpringEnd={() => {
          if (sheetRef.current) {
            const currentHeight = sheetRef.current.height;

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
            resetChat={() => {
              if (intention === ProgramIntention.Exercise) {
                onReset(true);
                resetChat();
              } else {
                resetChat();
              }
            }}
            onHeightChange={setHeaderHeight}
            isMinimized={currentSnapPoint === SnapPoint.MINIMIZED}
          />
        }
        footer={
          (selectedGroups.length > 0 ||
            messages.length > 0 ||
            fullBodyRef.current) &&
          (intention === ProgramIntention.Exercise ? (
            <ExerciseFooter
              onReset={onReset}
              onAreasSelected={onAreasSelected}
            />
          ) : (
            <BottomSheetFooter
              message={message}
              isLoading={isLoading}
              textareaRef={textareaRef}
              setMessage={setMessage}
              handleOptionClick={handleOptionClick}
              messagesCount={messages.length}
            />
          ))
        }
      >
        <div ref={contentRef} className="flex-1 flex flex-col h-full">
          {!selectedGroups.length &&
          messages.length === 0 &&
          !fullBodyRef.current ? (
            <div className="h-[72px]" />
          ) : (
            /* Expanded Content */
            <div
              id="bottom-sheet-content"
              className="flex-1 flex px-4 py-2 flex-col"
              onWheel={(e) => {
                // Stop wheel events from propagating to parent containers
                e.stopPropagation();
              }}
            >
              {/* Show either ChatMessages or ExerciseSelection based on intention */}
              {intention === ProgramIntention.Exercise ? (
                <ExerciseSelection />
              ) : (
                <div className="flex-1 min-h-0">
                  <ChatMessages
                    messages={messages}
                    isLoading={isLoading}
                    streamError={streamError}
                    followUpQuestions={followUpQuestions}
                    onQuestionClick={handleQuestionSelect}
                    part={selectedPart}
                    messagesRef={messagesRef}
                    isMobile={isMobile}
                    onResend={handleResendMessage}
                    containerHeight={contentHeight}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </BottomSheetBase>
    </>
  );
}
