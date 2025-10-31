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

  return (
    <div
      className="fixed inset-0 bg-black/95 backdrop-blur-sm flex items-center justify-center z-[90]"
      onClick={onClose}
    >
      <div
        className="relative w-full h-full flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Navigation buttons */}
        {showNavigation && onNavigate && (
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 sm:px-8 z-[10001]">
            {showPreviousButton && (
              <button
                onClick={() => onNavigate('prev')}
                className="bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 shadow-lg"
                aria-label="Previous video"
              >
                <svg
                  className="w-8 h-8"
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
                className="bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 shadow-lg"
                aria-label="Next video"
              >
                <svg
                  className="w-8 h-8"
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
          className="absolute top-16 right-6 bg-black/70 rounded-full p-3 text-white/90 hover:text-white hover:bg-black/90 transition-colors duration-200 z-[10001] shadow-lg"
          aria-label="Close video"
        >
          <svg
            className="w-8 h-8"
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
        
        {/* Exercise name display */}
        {exerciseName && (
          <div className="absolute top-4 left-0 right-0 text-center">
            <h2 className="text-xl md:text-2xl font-bold text-white/90 px-4">
              {exerciseName}
              {totalCount > 1 && (
                <span className="text-white/60 text-sm ml-2">
                  {currentIndex + 1} / {totalCount}
                </span>
              )}
            </h2>
          </div>
        )}
        
        {/* Video player */}
        {videoUrl.includes('firebasestorage.googleapis.com') ? (
          <div className="w-full h-full flex items-center justify-center">
            <video
              className="max-h-full max-w-full h-full object-contain"
              src={videoUrl}
              controls
              autoPlay
              playsInline
            />
          </div>
        ) : (
          <div className="w-full max-w-7xl px-4">
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
  );
}

