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
import { BottomSheetFooter } from './BottomSheetFooter';

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
  const [userModifiedSheetHeight, setUserModifiedSheetHeight] = useState(false);
  const sheetRef = useRef<BottomSheetRef>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [controlsBottom, setControlsBottom] = useState('5rem');
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const {
    messages,
    isLoading,
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

  // Handle body part selection and deselection
  useEffect(() => {
    const hasContent = messages.length > 0 || followUpQuestions.length > 0;
    const loadingComplete = !isLoading || messages.length === 0;

    // Only manipulate sheet height if user hasn't modified it
    if (!userModifiedSheetHeight) {
      if (selectedGroup && loadingComplete && hasContent) {
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
        className="!bg-gray-900 [&>*]:!bg-gray-900 relative h-[100dvh]"
        ref={sheetRef}
        open={true}
        blocking={false}
        defaultSnap={({ maxHeight }) => Math.min(maxHeight * 0.15, 72)}
        snapPoints={getSnapPoints}
        expandOnContentDrag={false}
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
              setUserModifiedSheetHeight(true);
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
            onSheetHeightModified={setUserModifiedSheetHeight}
          />
        }
        footer={
          (selectedGroup || messages.length > 0) && (
            <BottomSheetFooter
              message={message}
              isLoading={isLoading}
              textareaRef={textareaRef}
              messagesRef={messagesRef}
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
