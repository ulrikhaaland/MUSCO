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
import { BottomSheetFooter } from './BottomSheetFooter';
import MobileControlButtons from './MobileControlButtons';
import { AnatomyPart } from '@/app/types/human';
import { ProgramType } from '../../../../shared/types';
import { VideoModal } from '../ui/VideoModal';
import { ChatHistory } from '../ui/ChatHistory';
import { useApp } from '@/app/context/AppContext';
import { SUBSCRIPTIONS_ENABLED } from '@/app/lib/featureFlags';
import { translateBodyPartGroupName, translateAnatomyPart } from '@/app/utils/bodyPartTranslation';
import { useIsPwa } from '@/app/hooks/useIsPwa';

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
  onQuestionClick?: (question: Question) => void;
  onDiagnosis: (response: DiagnosisAssistantResponse) => void;
  hideBottomSheet?: boolean;
  overlayOpen?: boolean;
  onCloseOverlay?: () => void;
  onOpenOverlay?: () => void;
  onGenerateProgram?: (programType: ProgramType) => void;
  onBodyGroupSelected?: (groupName: string, keepChatOpen?: boolean) => void;
  onBodyPartSelected?: (partName: string, keepChatOpen?: boolean) => void;
  showQuestionnaire?: boolean;
  useAbsolutePosition?: boolean;
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
  onQuestionClick,
  onDiagnosis,
  overlayOpen,
  onCloseOverlay,
  onOpenOverlay,
  onGenerateProgram,
  onBodyGroupSelected,
  onBodyPartSelected,
  showQuestionnaire = false,
  useAbsolutePosition = false,
}: MobileControlsProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [controlsBottom] = useState('5rem');
  const isPwa = useIsPwa();
  
  // Get setSelectedPart and setSelectedGroup from AppContext for body part selection
  const { setSelectedPart, setSelectedGroup } = useApp();
  
  // Handler for body part click from chat - selects both the group and the part
  const handleBodyPartClick = (part: AnatomyPart, group: BodyPartGroup) => {
    // Close the chat overlay first so user sees the model
    onCloseOverlay?.();
    
    // Delay selection so animation happens after chat closes
    setTimeout(() => {
      // Only change group if it's different
      const currentGroup = selectedGroups[0];
      if (!currentGroup || currentGroup.id !== group.id) {
        // Pass skipPartReset=true since we're setting the part ourselves
        setSelectedGroup(group, true, true);
      }
      // Set the specific part
      setSelectedPart(part);
    }, 200);
  };
  
  // Handler for group click from chat - selects just the group
  const handleGroupClick = (group: BodyPartGroup) => {
    // Close the chat overlay first so user sees the model
    onCloseOverlay?.();
    
    // Delay selection so animation happens after chat closes
    setTimeout(() => {
      const currentGroup = selectedGroups[0];
      if (!currentGroup || currentGroup.id !== group.id) {
        setSelectedGroup(group, true);
      }
    }, 200);
  };
  
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
    resetChat: _resetChat,
    handleOptionClick,
    getGroupDisplayName,
    getPartDisplayName,
    assistantResponse,
    streamError,
    // Chat history
    currentChatId,
    loadChatSession,
    startNewChat,
    scrollTrigger,
    chatListRefreshTrigger,
    titleGeneratingForChatId,
  } = useChatContainer({
    selectedPart,
    selectedGroups,
    onGenerateProgram,
    onBodyGroupSelected,
    onBodyPartSelected,
  });
  
  // no app-level refs needed here

  // Overlay-only height bookkeeping
  // Header is now merged into footer, so no separate header height needed
  const [overlayFooterHeight, setOverlayFooterHeight] = useState(0);
  const [overlayContentHeight, setOverlayContentHeight] = useState(0);
  
  // Chat history panel state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const overlayFooterRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

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

  // Removed all keyboard detection logic - keeping things simple
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
      const next = Math.max(0, total - overlayFooterHeight);
      setOverlayContentHeight(next);
    };

    compute();

    const onResize = () => compute();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [overlayOpen, overlayFooterHeight]);

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

  // Scroll to bottom when overlay opens (so user sees latest messages)
  useEffect(() => {
    if (overlayOpen && scrollContainerRef.current) {
      // Wait for next frame to ensure DOM is rendered
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTop = scrollContainerRef.current.scrollHeight;
        }
      });
    }
  }, [overlayOpen]);

  // Lock body scroll when overlay is open
  useEffect(() => {
    if (!overlayOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [overlayOpen]);

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
            useAbsolutePosition={useAbsolutePosition}
          />
        )}
      {/* Removed bottom sheet UI; overlay replaces it */}

      {/* Full-screen Chat Overlay (mobile) */}
      {isMobile && overlayOpen && (
        <>
        <div
          ref={overlayRef}
          className="fixed inset-0 z-[80] flex flex-col bg-gray-900 md:hidden"
        >
          {/* Content */}
          <div
            ref={scrollContainerRef}
            data-rsbs-scroll
            className="flex-1 min-h-0 overflow-y-auto px-4 pb-2 chat-scrollbar"
            style={{ 
              height: overlayContentHeight,
              paddingTop: 'max(1rem, env(safe-area-inset-top, 0px))' 
            }}
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
                          className="px-4 py-2 text-sm font-medium rounded-full bg-[rgba(99,91,255,0.12)] border border-[rgba(99,91,255,0.35)] text-[#c8cbff] hover:bg-[rgba(99,91,255,0.2)] hover:border-[rgba(99,91,255,0.5)] active:bg-[rgba(99,91,255,0.25)] transition-colors duration-200"
                            title={template.description}
                        >
                            {template.label}
                        </button>
                        ))}
                        {/* Ask in chat button */}
                        <button
                          type="button"
                          onClick={() => textareaRef.current?.focus()}
                          className="px-4 py-2 text-sm font-medium rounded-full bg-transparent border border-[rgba(99,91,255,0.35)] text-[#c8cbff] hover:bg-[rgba(99,91,255,0.12)] hover:border-[rgba(99,91,255,0.5)] active:bg-[rgba(99,91,255,0.2)] transition-colors duration-200 flex items-center gap-1.5"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          {t('chat.askInChat')}
                        </button>
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
                    isSubscriber={!SUBSCRIPTIONS_ENABLED || Boolean(user?.profile?.isSubscriber)}
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
                    onBodyPartClick={handleBodyPartClick}
                    onGroupClick={handleGroupClick}
                    scrollTrigger={scrollTrigger}
                    footerHeight={overlayFooterHeight}
                  />
                </div>
            </div>

          {/* Footer with merged header */}
          <div ref={overlayFooterRef}>
              <BottomSheetFooter
                message={message}
                isLoading={isLoading}
                textareaRef={textareaRef}
                setMessage={setMessage}
                handleOptionClick={handleOptionClick}
                messagesCount={messages.length}
                onClose={onCloseOverlay}
                showHeaderContent={true}
                title={getGroupDisplayName()}
                subtitle={getPartDisplayName()}
                onNewChat={() => startNewChat()}
                onOpenHistory={() => setIsHistoryOpen(true)}
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
        <div 
          className={`md:hidden ${useAbsolutePosition ? 'absolute' : 'fixed'} inset-x-0 bottom-0 z-[50] bg-gray-900/80 backdrop-blur-sm border-t border-gray-800`}
          style={{ paddingBottom: isPwa ? '34px' : undefined }}
        >
            {(selectedGroups.length > 0 || selectedPart) ? (
              // Show selection info - entire area clickable
              <button
                onClick={onOpenOverlay}
                className="w-full flex items-center justify-between gap-3 text-left hover:bg-gray-800/40 active:bg-gray-700/40 px-3 py-3 transition-colors cursor-pointer group"
                aria-label="Open chat"
              >
                <div className="min-w-0 flex-1">
                  {/* Group name first (parent category) */}
                  <div className="text-sm text-white truncate">
                    {selectedGroups[0] 
                      ? translateBodyPartGroupName(selectedGroups[0], t)
                      : selectedPart ? translateAnatomyPart(selectedPart, t) : ''}
                  </div>
                  {/* Part name second (specific selection) */}
                  {selectedPart && (
                    <div className="text-xs text-gray-400 truncate">
                      {translateAnatomyPart(selectedPart, t)}
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

      {/* Chat History Panel */}
      <ChatHistory
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        currentChatId={currentChatId}
        onSelectChat={(chatId) => {
          loadChatSession(chatId);
        }}
        onNewChat={() => {
          startNewChat();
        }}
        refreshTrigger={chatListRefreshTrigger}
        titleGeneratingForChatId={titleGeneratingForChatId}
      />
    </>
  );
}