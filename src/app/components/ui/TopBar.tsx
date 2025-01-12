interface TopBarProps {
  onBack: () => void;
  className?: string;
  rightContent?: React.ReactNode;
  rightText?: string;
  onRightClick?: () => void;
}

export function TopBar({ onBack, className = '', rightContent, rightText = 'Calendar', onRightClick }: TopBarProps) {
  return (
    <div className={`fixed top-0 left-0 right-0 z-50 bg-gray-900/90 backdrop-blur-sm ${className}`}>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-4 flex items-center justify-between text-white">
          <button
            onClick={onBack}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Back
          </button>
          <button 
            onClick={onRightClick}
            className="flex items-center hover:opacity-80 transition-opacity duration-200"
          >
            {rightContent}
          </button>
        </div>
      </div>
    </div>
  );
} 