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
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
import { Gender } from '@/app/types';
import { AnatomyPart } from '@/app/types/anatomy';
import { ChatMessages } from '../ui/ChatMessages';
import { usePartChat } from '@/app/hooks/usePartChat';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';

interface MobileControlsProps {
  isRotating: boolean;
  isResetting: boolean;
  isReady: boolean;
  needsReset: boolean;
  selectedParts: BodyPartGroup | null;
  isChangingModel: boolean;
  currentGender: Gender;
  selectedPart: AnatomyPart | null;
  onRotate: () => void;
  onReset: () => void;
  onSwitchModel: () => void;
  onHeightChange?: (height: number) => void;
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
  selectedParts,
  isChangingModel,
  currentGender,
  selectedPart,
  onRotate,
  onReset,
  onSwitchModel,
  onHeightChange,
}: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [contentHeight, setContentHeight] = useState(0);
  const [userClosedSheet, setUserClosedSheet] = useState(false);
  const sheetRef = useRef<BottomSheetRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsBottom, setControlsBottom] = useState('5rem');

  const {
    messages,
    isLoading,
    isCollectingJson,
    followUpQuestions,
    messagesRef,
    resetChat,
    handleOptionClick,
    getDisplayName,
  } = usePartChat({ selectedPart: selectedPart, selectedGroup: selectedParts });

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
        const height = contentRef.current.scrollHeight;
        setContentHeight(height);
      }
    };

    // Update height when messages change
    updateContentHeight();

    // Set up a ResizeObserver to watch for content changes
    const resizeObserver = new ResizeObserver(updateContentHeight);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }

    return () => resizeObserver.disconnect();
  }, [messages]); // Update when messages change

  // Handle body part selection and deselection
  useEffect(() => {
    const hasContent = messages.length > 0 || followUpQuestions.length > 0;
    const loadingComplete = !isLoading && !isCollectingJson;

    if (selectedPart && loadingComplete && hasContent) {
      // Reset userClosedSheet when a part is selected and content is ready
      setUserClosedSheet(false);
      if (sheetRef.current) {
        setTimeout(() => {
          sheetRef.current.snapTo(({ maxHeight }) => maxHeight * 0.4);
          setIsExpanded(true);
        }, 10);
      }
    } else if (!selectedPart) {
      // Part was deselected
      setIsDragging(true);
      if (sheetRef.current) {
        sheetRef.current.snapTo(({ maxHeight }) =>
          Math.min(maxHeight * 0.15, 72)
        );
      }
    }
  }, [selectedPart, isLoading, isCollectingJson, messages, followUpQuestions]);

  const handleExpandToggle = () => {
    if (sheetRef.current) {
      if (isExpanded) {
        // Collapse to minimum height
        sheetRef.current.snapTo(({ snapPoints }) => Math.min(...snapPoints));
        setUserClosedSheet(true);
        setIsFullscreen(false); // Reset fullscreen state when collapsing
      } else {
        // Expand to previous height (full if was fullscreen, otherwise 40%)
        const targetHeight = isFullscreen
          ? getViewportHeight()
          : getViewportHeight() * 0.4;
        sheetRef.current.snapTo(() => targetHeight);
        setUserClosedSheet(false);
      }
      setIsExpanded(!isExpanded);
    }
  };

  const handleFullscreenToggle = () => {
    if (sheetRef.current) {
      if (isFullscreen) {
        // Return to previous height
        sheetRef.current.snapTo(({ maxHeight }) => maxHeight * 0.4);
      } else {
        // Go full screen
        sheetRef.current.snapTo(() => getViewportHeight());
      }
      setIsFullscreen(!isFullscreen);
      setIsExpanded(true);
      setUserClosedSheet(false);
    }
  };

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

  const getSnapPoints = useCallback(() => {
    const viewportHeight = getViewportHeight();
    const minHeight = Math.min(viewportHeight * 0.15, 72);
    const hasContent = Boolean(selectedPart) || messages.length > 0;

    if (!hasContent) {
      return [minHeight];
    }

    const contentWithPadding = contentHeight + 96;

    if (contentWithPadding <= minHeight) {
      return [minHeight];
    }

    if (contentWithPadding < viewportHeight * 0.4) {
      return [minHeight, contentWithPadding];
    }

    return [
      minHeight,
      viewportHeight * 0.4,
      viewportHeight * 0.78,
      viewportHeight,
    ];
  }, [contentHeight, selectedPart, messages.length]);

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

  return (
    <>
      {/* Mobile Controls - Positioned relative to bottom sheet */}
      {isMobile && (
        <div
          className="md:hidden fixed right-4 flex flex-col gap-2 bg-[#111827] p-1.5 rounded-lg shadow-lg transition-all duration-300"
          style={{
            zIndex: 0,
            bottom: controlsBottom,
          }}
        >
          <button
            onClick={onRotate}
            disabled={isRotating || isResetting || !isReady}
            className={`text-white p-2 rounded-lg transition-colors duration-200 ${
              isRotating || isResetting || !isReady
                ? 'opacity-50'
                : 'hover:bg-white/10'
            }`}
          >
            <CropRotateIcon
              className={`h-5 w-5 ${isRotating ? 'animate-spin' : ''}`}
            />
          </button>
          <button
            onClick={onReset}
            disabled={
              isResetting || (!needsReset && selectedParts === null) || !isReady
            }
            className={`text-white p-2 rounded-lg transition-colors duration-200 ${
              isResetting || (!needsReset && selectedParts === null)
                ? 'opacity-50'
                : 'hover:bg-white/10'
            }`}
          >
            <MyLocationIcon
              className={`h-5 w-5 ${isResetting ? 'animate-spin' : ''}`}
            />
          </button>
          {/* <button
            onClick={onZoom}
            disabled={!isReady}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            <ZoomInIcon className="h-5 w-5" />
          </button> */}
          <button
            onClick={onSwitchModel}
            disabled={!isReady}
            className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
          >
            {currentGender === 'male' ? (
              <FemaleIcon className="h-5 w-5" />
            ) : (
              <MaleIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      )}

      {/* Bottom Sheet */}
      <BottomSheetBase
        ref={sheetRef}
        open={true}
        blocking={false}
        defaultSnap={({ maxHeight }) => Math.min(maxHeight * 0.15, 72)}
        snapPoints={({ maxHeight }) => {
          const viewportHeight = maxHeight;
          const minHeight = Math.min(viewportHeight * 0.15, 72);
          const hasContent = Boolean(selectedPart) || messages.length > 0;

          if (!hasContent) {
            return [minHeight];
          }

          const contentWithPadding = contentHeight + 96;

          if (contentWithPadding <= minHeight) {
            return [minHeight];
          }

          if (contentWithPadding < viewportHeight * 0.4) {
            return [minHeight, contentWithPadding];
          }

          return [
            minHeight,
            viewportHeight * 0.4,
            viewportHeight * 0.78,
            viewportHeight,
          ];
        }}
        expandOnContentDrag={Boolean(selectedPart) || messages.length > 0}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={() => setIsDragging(false)}
        onSpringStart={(event) => {
          if (!isDragging) {
            setIsDragging(true);
            setTimeout(() => {
              setIsDragging(false);
            }, 100);
          }
          if (sheetRef.current) {
            const currentHeight = sheetRef.current.height;
            const viewportHeight = getViewportHeight();
            setIsExpanded(currentHeight > Math.min(viewportHeight * 0.15, 72));
            updateModelHeight(currentHeight);
          }
        }}
        onSpringEnd={(event) => {
          if (sheetRef.current) {
            const currentHeight = sheetRef.current.height;
            const viewportHeight = getViewportHeight();
            const minHeight = Math.min(viewportHeight * 0.15, 72);
            const isNowExpanded = currentHeight > minHeight;

            setIsExpanded(isNowExpanded);
            updateModelHeight(currentHeight);

            if (!isNowExpanded && isExpanded) {
              setUserClosedSheet(true);
            }
          }
        }}
        header={
          <div className="h-12 w-full flex justify-between items-center">
            <div className="flex flex-col items-start">
              <h2 className="text-sm text-gray-400">
                Musculoskeletal Assistant
              </h2>
              <h3 className="text-lg font-bold text-white ">
                {getDisplayName()}
              </h3>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {messages.length > 0 &&
                messages.some((m) => m.role === 'assistant' && m.content) &&
                !isLoading && (
                  <button
                    onClick={resetChat}
                    className="text-white hover:text-white p-1 rounded-full hover:bg-gray-800 transition-colors"
                    aria-label="Reset Chat"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
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
                )}
              {(selectedPart || messages.length > 0) && (
                <div className="flex flex-col">
                  {sheetRef.current && (
                    <>
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
                              sheetRef.current.snapTo(() => nextPoint);
                              setIsExpanded(true);
                            }
                          }
                        }}
                        disabled={(() => {
                          if (!sheetRef.current) return true;
                          const currentHeight = sheetRef.current.height;
                          const snapPoints = getSnapPoints();
                          return !snapPoints.some(
                            (point) => point > currentHeight + 2
                          );
                        })()}
                        className="flex justify-center items-center w-8 h-8 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        aria-label="Expand"
                      >
                        <ExpandLessIcon className="text-white h-6 w-6" />
                      </button>
                      <button
                        onClick={() => {
                          if (sheetRef.current) {
                            const currentHeight = sheetRef.current.height;
                            const snapPoints = getSnapPoints();
                            const minHeight = Math.min(
                              getViewportHeight() * 0.15,
                              72
                            );

                            // Find next smaller snap point
                            const nextPoint = [...snapPoints]
                              .reverse()
                              .find((point) => point < currentHeight - 2);
                            if (nextPoint) {
                              sheetRef.current.snapTo(() => nextPoint);
                              setIsExpanded(nextPoint > minHeight);
                            }
                          }
                        }}
                        disabled={(() => {
                          if (!sheetRef.current) return true;
                          const currentHeight = sheetRef.current.height;
                          const snapPoints = getSnapPoints();
                          return !snapPoints.some(
                            (point) => point < currentHeight - 2
                          );
                        })()}
                        className="flex justify-center items-center w-8 h-8 hover:bg-gray-800 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                        aria-label="Minimize"
                      >
                        <ExpandLessIcon className="text-white h-6 w-6 rotate-180" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        }
        className="!bg-gray-900 [&>*]:!bg-gray-900 relative h-[100dvh]"
      >
        <div
          ref={contentRef}
          className="px-4 flex flex-col h-full overflow-hidden"
        >
          {!selectedPart && messages.length === 0 ? (
            <div className="h-[72px]" />
          ) : (
            /* Expanded Content */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
              {/* Chat Messages */}
              <div className="flex-1 min-h-0 overflow-hidden">
                <ChatMessages
                  messages={messages}
                  isLoading={isLoading}
                  isCollectingJson={isCollectingJson}
                  followUpQuestions={followUpQuestions}
                  onQuestionClick={handleOptionClick}
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
