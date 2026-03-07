import React from 'react';

interface VideoModalProps {
  videoUrl: string;
  onClose: () => void;
  exerciseName?: string;
  showNavigation?: boolean;
  onNavigate?: (direction: 'next' | 'prev') => void;
  currentIndex?: number;
  totalCount?: number;
}

/**
 * Reusable full-screen video modal
 * Handles both Firebase storage videos and YouTube embeds
 */
export function VideoModal({
  videoUrl,
  onClose,
  exerciseName,
  showNavigation = false,
  onNavigate,
  currentIndex = 0,
  totalCount = 0,
}: VideoModalProps) {
  const showPreviousButton = showNavigation && currentIndex > 0;
  const showNextButton = showNavigation && currentIndex < totalCount - 1;
  const isFirebaseVideo = videoUrl.includes('firebasestorage.googleapis.com');
  const exercisePositionLabel =
    totalCount > 1 ? `${currentIndex + 1} / ${totalCount}` : null;
  const firebasePlayerStyle: React.CSSProperties = {
    height: 'min(80vh, 860px)',
    width: 'min(95vw, calc(min(80vh, 860px) * 9 / 16))',
  };

  return (
    <div
      className="fixed inset-0 z-[100] bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22)_0%,_rgba(10,10,14,0.96)_45%,_rgba(2,2,4,0.98)_100%)] backdrop-blur-md"
      onClick={onClose}
    >
      <div
        className="relative flex h-full w-full items-center justify-center p-3 sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full max-w-7xl">
          <div className="absolute -inset-8 -z-10 rounded-[2.25rem] bg-indigo-500/20 blur-3xl" />

          {(exerciseName || exercisePositionLabel) && (
            <div className="mb-3 flex items-center justify-between rounded-2xl border border-white/15 bg-black/35 px-4 py-2 text-white/90 shadow-[0_20px_44px_rgba(0,0,0,0.35)] backdrop-blur-xl">
              <div className="truncate pr-2 text-sm font-semibold sm:text-base">
                {exerciseName ?? 'Exercise Video'}
              </div>
              {exercisePositionLabel && (
                <div className="rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-xs font-medium text-white/75">
                  {exercisePositionLabel}
                </div>
              )}
            </div>
          )}

          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-black/65 shadow-[0_28px_70px_rgba(0,0,0,0.6)] ring-1 ring-white/10">
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/[0.06] via-transparent to-black/30" />

        {/* Navigation buttons */}
        {showNavigation && onNavigate && (
          <div className="pointer-events-none absolute inset-x-0 top-1/2 z-[10001] flex -translate-y-1/2 justify-between px-2 sm:px-4">
            {showPreviousButton && (
              <button
                onClick={() => onNavigate('prev')}
                className="pointer-events-auto rounded-full border border-white/20 bg-black/70 p-2.5 text-white/90 shadow-lg backdrop-blur-md transition-colors duration-200 hover:bg-black/90 hover:text-white"
                aria-label="Previous video"
              >
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>
            )}
            
            {!showPreviousButton && <div></div>}
            
            {showNextButton && (
              <button
                onClick={() => onNavigate('next')}
                className="pointer-events-auto rounded-full border border-white/20 bg-black/70 p-2.5 text-white/90 shadow-lg backdrop-blur-md transition-colors duration-200 hover:bg-black/90 hover:text-white"
                aria-label="Next video"
              >
                <svg
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-2 top-2 z-[10001] rounded-full border border-white/20 bg-black/70 p-2 text-white/90 shadow-lg backdrop-blur-md transition-colors duration-200 hover:bg-black/90 hover:text-white sm:right-3 sm:top-3"
          aria-label="Close video"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Video player */}
        {isFirebaseVideo ? (
          <div className="w-full py-2 sm:py-4">
            <div
              className="relative mx-auto overflow-hidden rounded-xl bg-black"
              style={firebasePlayerStyle}
            >
              <video
                className="absolute inset-0 h-full w-full object-contain"
                src={videoUrl}
                controls
                autoPlay
                playsInline
              />
            </div>
          </div>
        ) : (
          <div className="w-full">
            <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
              <iframe
                className="absolute inset-0 w-full h-full rounded-lg"
                src={videoUrl}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
