'use client';

import { useState, useEffect, useRef } from 'react';
import {
  DiagnosisAssistantResponse,
  Gender,
  Question,
  ChatMessage,
} from '@/app/types';
import { ChatMessages } from '../ui/ChatMessages';
import { useChatContainer } from '@/app/hooks/useChatContainer';
import { BodyPartGroup } from '@/app/config/bodyPartGroups';
import { BottomSheetHeader } from './BottomSheetHeader';
import { BottomSheetFooter } from './BottomSheetFooter';
import MobileControlButtons from './MobileControlButtons';
import { AnatomyPart } from '@/app/types/human';
import { ProgramType } from '../../../../shared/types';
import { VideoModal } from '../ui/VideoModal';
import { useApp } from '@/app/context/AppContext';

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
  overlayOpen?: boolean;
  onCloseOverlay?: () => void;
  onOpenOverlay?: () => void;
  onGenerateProgram?: (programType: ProgramType) => void;
  onBodyGroupSelected?: (groupName: string) => void;
  onBodyPartSelected?: (partName: string) => void;
  showQuestionnaire?: boolean;
}

// Bottom sheet fully removed; overlay-only implementation

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
  overlayOpen,
  onCloseOverlay,
  onOpenOverlay,
  onGenerateProgram,
  onBodyGroupSelected,
  onBodyPartSelected,
  showQuestionnaire = false,
}: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [controlsBottom] = useState('5rem');
  
  // Get setSelectedPart from AppContext for body part selection
  const { setSelectedPart } = useApp();
  
  // Use consolidated chat container logic
  const {
    router,
    user,
    t,
    message,
    setMessage,
    textareaRef,
    videoUrl,
    loadingVideoExercise,
    currentExercise,
    handleVideoClick,
    handleCloseVideo,
    globalTemplateQuestions,
    messages,
    isLoading,
    rateLimited,
    followUpQuestions,
    exerciseResults,
    inlineExercises,
    messagesRef,
    resetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    assistantResponse,
    streamError,
    availableBodyPartNames,
  } = useChatContainer({
    selectedPart,
    selectedGroups,
    onGenerateProgram,
    onBodyGroupSelected,
    onBodyPartSelected,
  });
  
  // no app-level refs needed here

  // Overlay-only height bookkeeping
  const [overlayHeaderHeight, setOverlayHeaderHeight] = useState(0);
  const [overlayFooterHeight, setOverlayFooterHeight] = useState(0);
  const [overlayContentHeight, setOverlayContentHeight] = useState(0);
  const overlayFooterRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef<{ startY: number; lastY: number; dragging: boolean }>({ startY: 0, lastY: 0, dragging: false });

  // Use the largest, stable viewport height captured at mount to avoid keyboard-induced jumps
  const initialViewportHeightRef = useRef<number>(0);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initialViewportHeightRef.current = window.innerHeight;
    }
  }, []);

  const getViewportHeight = () => {
    // Use 100svh which is stable across keyboard toggles on modern iOS
    if (typeof window !== 'undefined' && (window as any).CSS?.supports?.('height', '100svh')) {
      // Approximate svh via visualViewport when available
      return window.visualViewport?.height || window.innerHeight;
    }
    return initialViewportHeightRef.current || window.innerHeight;
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);


  // no sheet content height bookkeeping needed in overlay

  // (no snap points in overlay)

  // No bottom sheet mechanics: selection changes don't manipulate any sheet

  // No model height coupling needed in overlay mode

  // (removed)

  // Track height changes only during drag or animation
  // (removed)

  // (removed)

  // Removed all keyboard detection logic - keeping things simple

  // Track height changes only during drag or animation
  // (removed)

  // Remove the old controls position effect since we're handling it in the RAF loop
  // Keep default controlsBottom

  const handleQuestionSelect = (question: Question) => {
    if (question.generate && onQuestionClick) {
      onQuestionClick(question);
    } else {
      handleOptionClick(question);
    }
  };

  // no bottom sheet state to store/restore

  useEffect(() => {
    if (assistantResponse) {
      console.log('[MobileControls] Updating diagnosis:', assistantResponse);
      onDiagnosis(assistantResponse);
    }
  }, [assistantResponse, onDiagnosis]);

  // nothing to reset related to sheet drag state

  // Handle resending a message when it was interrupted
  const handleResendMessage = (message: ChatMessage) => {
    if (message.role === 'user') {
      handleOptionClick({
        title: '',
        question: message.content,
      });
    }
  };

  // Overlay: compute stable content height = svh - header - footer
  useEffect(() => {
    const compute = () => {
      const total = getViewportHeight();
      const next = Math.max(0, total - overlayHeaderHeight - overlayFooterHeight);
      setOverlayContentHeight(next);
      if (onHeightChange) {
        // Drive CSS var in parent for viewer sizing (overlay covers full height)
        onHeightChange(overlayOpen ? total : 0);
      }
    };

    compute();

    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [overlayOpen, overlayHeaderHeight, overlayFooterHeight, onHeightChange]);

  // Track scroll position to preserve it when returning from questionnaire
  const scrollPositionRef = useRef<number>(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Save scroll position before opening questionnaire
  useEffect(() => {
    if (showQuestionnaire && scrollContainerRef.current) {
      scrollPositionRef.current = scrollContainerRef.current.scrollTop;
    }
  }, [showQuestionnaire]);

  // Restore scroll position when returning from questionnaire
  useEffect(() => {
    if (!showQuestionnaire && scrollContainerRef.current && scrollPositionRef.current > 0) {
      // Wait for next frame to ensure DOM is ready
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollPositionRef.current;
        }
      });
    }
  }, [showQuestionnaire]);

  // Update scroll position ref when user scrolls
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    scrollPositionRef.current = target.scrollTop;
  };

  // Observe overlay footer height
  useEffect(() => {
    if (!overlayOpen) return;
    const element = overlayFooterRef.current;
    if (!element) return;
    const ro = new ResizeObserver(() => {
      setOverlayFooterHeight(element.getBoundingClientRect().height || 0);
    });
    ro.observe(element);
    // Set initial
    setOverlayFooterHeight(element.getBoundingClientRect().height || 0);
    return () => ro.disconnect();
  }, [overlayOpen]);

  return (
    <>
      {/* Mobile Controls - Positioned relative to bottom sheet */}
      {isMobile && !overlayOpen && (
          <MobileControlButtons
            isRotating={isRotating}
            isResetting={isResetting}
            isReady={isReady}
            needsReset={needsReset}
            currentGender={currentGender}
            controlsBottom={controlsBottom}
            onRotate={onRotate}
            onReset={() => onReset(true)}
            onSwitchModel={onSwitchModel}
          />
        )}
      {/* Removed bottom sheet UI; overlay replaces it */}

      {/* Full-screen Chat Overlay (mobile) */}
      {isMobile && overlayOpen && (
        <>
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[80] flex flex-col bg-gray-900 md:hidden"
          onTouchStart={(e) => {
            const container = e.currentTarget.querySelector('[data-rsbs-scroll]') as HTMLElement | null;
            const atTop = container ? container.scrollTop <= 0 : true;
            if (!atTop) return; // only start drag when content is scrolled to top
            const y = e.touches[0]?.clientY ?? 0;
            dragStateRef.current = { startY: y, lastY: y, dragging: true };
          }}
          onTouchMove={(e) => {
            const state = dragStateRef.current;
            if (!state.dragging) return;
            const y = e.touches[0]?.clientY ?? 0;
            const dy = Math.max(0, y - state.startY);
            state.lastY = y;
            // translate overlay down up to 120px for feedback
            const translate = Math.min(120, dy);
            (overlayRef.current as HTMLElement).style.transform = `translateY(${translate}px)`;
          }}
          onTouchEnd={() => {
            const state = dragStateRef.current;
            if (!state.dragging) return;
            state.dragging = false;
            const totalDy = Math.max(0, state.lastY - state.startY);
            // threshold to close
            if (totalDy > 80) {
              onCloseOverlay?.();
            } else {
              if (overlayRef.current) {
                (overlayRef.current as HTMLElement).style.transition = 'transform 150ms ease-out';
                (overlayRef.current as HTMLElement).style.transform = 'translateY(0)';
                setTimeout(() => {
                  if (overlayRef.current) (overlayRef.current as HTMLElement).style.transition = '';
                }, 160);
              }
            }
          }}
        >
          {/* Header */}
          <div className="relative">
          <BottomSheetHeader
            messages={messages}
            isLoading={isLoading}
            getGroupDisplayName={getGroupDisplayName}
            getPartDisplayName={getPartDisplayName}
            resetChat={() => {
              resetChat();
            }}
              onHeightChange={(h) => setOverlayHeaderHeight(Math.max(0, h - 28))}
              isMinimized={false}
            />
          </div>

          {/* Content */}
          <div
            ref={scrollContainerRef}
            data-rsbs-scroll
            className="flex-1 min-h-0 overflow-y-auto px-4 pt-1 pb-2 chat-scrollbar"
            style={{ height: overlayContentHeight }}
            onWheel={(e) => e.stopPropagation()}
            onScroll={handleScroll}
          >
                <div className="flex-1 min-h-0">
                  {messages.length === 0 && selectedGroups.length === 0 && !isLoading && (
                    <div className="mb-3 rounded-lg border border-gray-800 bg-gray-900/60 p-4">
                      <div className="text-base font-medium text-white mb-2">{t('mobile.chat.startOrSelect')}</div>
                      <div className="text-sm text-gray-400 mb-3">{t('mobile.chat.askAnything')}</div>
                      <div className="flex flex-wrap gap-2">
                        {globalTemplateQuestions.map((template) => (
                        <button
                            key={template.question}
                          type="button"
                            onClick={() => handleOptionClick({ 
                              title: template.title, 
                              question: template.question, 
                              chatMode: template.chatMode 
                            })}
                          className="px-4 py-2 text-sm font-medium rounded-full bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600"
                            title={template.description}
                        >
                            {template.label}
                        </button>
                        ))}
                      </div>
                    </div>
                  )}
                  <ChatMessages
                    messages={messages}
                    isLoading={isLoading}
                    streamError={streamError}
                    rateLimited={rateLimited}
                    onSubscribeClick={() => {
                      try {
                        window.sessionStorage.setItem('previousPath', window.location.pathname);
                        window.sessionStorage.setItem('loginContext', 'subscribe');
                      } catch {}
                      router.push('/subscribe');
                    }}
                    onLoginClick={() => {
                      try {
                        window.sessionStorage.setItem('previousPath', window.location.pathname);
                        window.sessionStorage.setItem('loginContext', 'rateLimit');
                      } catch {}
                      router.push('/login');
                    }}
                    isLoggedIn={Boolean(user)}
                    isSubscriber={Boolean(user?.profile?.isSubscriber)}
                    followUpQuestions={followUpQuestions}
                    exerciseResults={exerciseResults}
                    inlineExercises={inlineExercises}
                    onQuestionClick={handleQuestionSelect}
                    onVideoClick={handleVideoClick}
                    loadingVideoExercise={loadingVideoExercise}
                    part={selectedPart}
                    messagesRef={messagesRef}
                    isMobile={isMobile}
                    onResend={handleResendMessage}
                    containerHeight={overlayContentHeight}
                    availableBodyPartNames={availableBodyPartNames}
                    onBodyPartClick={setSelectedPart}
                  />
                </div>
            </div>

          {/* Footer */}
          <div ref={overlayFooterRef}>
              <BottomSheetFooter
                message={message}
                isLoading={isLoading}
                textareaRef={textareaRef}
                setMessage={setMessage}
                handleOptionClick={handleOptionClick}
                messagesCount={messages.length}
                onClose={onCloseOverlay}
              />
          </div>
        </div>
        </>
      )}
      
      {/* Video Modal */}
      {videoUrl && (
        <VideoModal
          videoUrl={videoUrl}
          onClose={handleCloseVideo}
          exerciseName={currentExercise?.name}
        />
      )}

      {/* Mobile Footer - Always visible when not in overlay or questionnaire */}
      {isMobile && !overlayOpen && !showQuestionnaire && (
        <div className="md:hidden fixed inset-x-0 bottom-0 z-[50] bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
            {(selectedGroups.length > 0 || selectedPart) ? (
              // Show selection info - entire area clickable
              <button
                onClick={onOpenOverlay}
                className="w-full flex items-center justify-between gap-3 text-left hover:bg-gray-800/40 active:bg-gray-700/40 px-3 py-3 transition-colors cursor-pointer group"
                aria-label="Open chat"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm text-white truncate">
                    {selectedPart?.name || selectedGroups[0]?.name}
                  </div>
                  {selectedGroups.length > 0 && (
                    <div className="text-xs text-gray-400 truncate">
                      {selectedGroups.map((g) => g.name).join(', ')}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="px-3 py-1.5 text-sm rounded-full bg-indigo-600 text-white group-hover:bg-indigo-500 group-active:bg-indigo-700 transition-colors">
                    {t('mobile.chat.button')}
                  </div>
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ) : (
              // Show empty state - same layout as selection view for consistency
              <button
                onClick={onOpenOverlay}
                className="w-full flex items-center justify-between gap-3 text-left hover:bg-gray-800/40 active:bg-gray-700/40 px-3 py-3 transition-colors cursor-pointer group"
                aria-label="Open chat"
              >
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-white group-hover:text-indigo-400 transition-colors">
                    {t('mobile.chat.selectBodyPart')}
                  </div>
                  <div className="text-xs text-gray-400 group-hover:text-gray-300 transition-colors">
                    {t('mobile.chat.tapToStart')}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="px-3 py-1.5 text-sm rounded-full bg-indigo-600 text-white group-hover:bg-indigo-500 group-active:bg-indigo-700 transition-colors">
                    {t('mobile.chat.button')}
                  </div>
                  <svg 
                    className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            )}
        </div>
      )}
    </>
  );
}