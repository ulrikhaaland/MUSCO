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
import { Gender } from '@/app/types';
import { AnatomyPart } from '@/app/types/anatomy';
import { ChatMessages } from '../ui/ChatMessages';
import { usePartChat } from '@/app/hooks/usePartChat';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { BottomSheetHeader } from './BottomSheetHeader';

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
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [controlsBottom, setControlsBottom] = useState('5rem');
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
    isCollectingJson,
    followUpQuestions,
    messagesRef,
    resetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
  } = usePartChat({ selectedPart: selectedPart, selectedGroup: selectedGroup });

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
        const contentContainer = contentRef.current.querySelector('.flex-col.h-full');
        
        if (contentContainer) {
          const height = contentContainer.scrollHeight + headerHeight;
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

    return () => resizeObserver.disconnect();
  }, [messages, followUpQuestions, headerHeight]);

  // Handle body part selection and deselection
  useEffect(() => {
    const hasContent = messages.length > 0 || followUpQuestions.length > 0;
    const loadingComplete =
      (!isLoading && !isCollectingJson) || messages.length === 0;

    if (selectedGroup && loadingComplete && hasContent) {
      // Reset userClosedSheet when a part is selected and content is ready
      setUserClosedSheet(false);
      if (sheetRef.current) {
        setTimeout(() => {
          sheetRef.current.snapTo(({ maxHeight }) => contentHeight);
          setIsExpanded(true);
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
  }, [
    selectedGroup,
    isLoading,
    isCollectingJson,
    messages,
    followUpQuestions,
    contentHeight,
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

  const getSnapPoints = useCallback(() => {
    const viewportHeight = getViewportHeight();
    const minHeight = Math.min(viewportHeight * 0.15, 72);
    const hasContent = Boolean(selectedGroup) || messages.length > 0;

    if (!hasContent) {
      return [minHeight];
    }

    const contentWithPadding = contentHeight;

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
  }, [contentHeight, selectedGroup, messages.length]);

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
              isResetting || (!needsReset && selectedGroup === null) || !isReady
            }
            className={`text-white p-2 rounded-lg transition-colors duration-200 ${
              isResetting || (!needsReset && selectedGroup === null)
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
          const hasContent = Boolean(selectedGroup) || messages.length > 0;

          if (!hasContent) {
            return [minHeight];
          }

          const contentWithPadding = contentHeight;

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
        expandOnContentDrag={Boolean(selectedGroup) || messages.length > 0}
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
          <BottomSheetHeader
            messages={messages}
            isLoading={isLoading}
            selectedGroup={Boolean(selectedGroup)}
            sheetRef={sheetRef}
            getGroupDisplayName={getGroupDisplayName}
            getPartDisplayName={getPartDisplayName}
            resetChat={resetChat}
            getSnapPoints={getSnapPoints}
            getViewportHeight={getViewportHeight}
            setIsExpanded={setIsExpanded}
            onHeightChange={setHeaderHeight}
          />
        }
        className="!bg-gray-900 [&>*]:!bg-gray-900 relative h-[100dvh]"
      >
        <div
          ref={contentRef}
          className="px-4 flex flex-col h-full overflow-hidden"
        >
          {!selectedGroup && messages.length === 0 ? (
            <div className="h-[72px]" />
          ) : (
            /* Expanded Content */
            <div className="flex flex-col h-full">
              {/* Chat Messages */}
              <div className="flex-1 min-h-0 overflow-y-auto">
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

              {/* Message Input */}
              {(selectedGroup || messages.length > 0) && (
                <div className="mt-4 border-t border-gray-700 pt-2 pb-1 flex-shrink-0 bg-gray-900">
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (message.trim()) {
                        handleOptionClick({
                          title: '',
                          description: '',
                          question: message,
                        });
                        setMessage('');
                      }
                    }}
                    className="relative"
                  >
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        const textarea = textareaRef.current;
                        if (textarea) {
                          textarea.style.height = 'auto';
                          const newHeight = Math.min(
                            textarea.scrollHeight,
                            480
                          );
                          textarea.style.height = `${newHeight}px`;
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (message.trim()) {
                            handleOptionClick({
                              title: '',
                              description: '',
                              question: message,
                            });
                            setMessage('');
                          }
                        }
                      }}
                      rows={1}
                      placeholder="Type your message..."
                      className="w-full bg-gray-800 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                      disabled={isLoading}
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !message.trim()}
                      className={`absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-colors ${
                        isLoading || !message.trim()
                          ? 'text-gray-500 cursor-not-allowed'
                          : 'text-indigo-600 hover:text-indigo-500 hover:bg-gray-700/50'
                      }`}
                    >
                      {isLoading ? (
                        <svg
                          className="animate-spin h-6 w-6"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-6 w-6"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                          />
                        </svg>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </BottomSheetBase>
    </>
  );
}
