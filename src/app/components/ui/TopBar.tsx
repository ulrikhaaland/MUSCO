interface TopBarProps {
  onBack?: () => void;
  rightContent?: React.ReactNode;
  onRightClick?: () => void;
  className?: string;
}

export function TopBar({
  onBack,
  rightContent,
  onRightClick,
  className = '',
}: TopBarProps) {
  return (
    <div className={`bg-gray-900/80 backdrop-blur-sm px-4 py-3 ${className}`}>
      <div className="flex items-center justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-5 h-5"
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
            <span className="ml-2">Back</span>
          </button>
        )}
        {!onBack && <div />}
        {rightContent && onRightClick && (
          <button
            onClick={onRightClick}
            className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
          >
            {rightContent}
          </button>
        )}
      </div>
    </div>
  );
} 