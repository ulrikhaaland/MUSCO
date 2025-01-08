import { ReactNode } from 'react';

interface TopBarProps {
  onBack: () => void;
  rightContent?: ReactNode;
  backText?: string;
}

export function TopBar({ onBack, rightContent, backText = "Back to chat" }: TopBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-10 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800/50">
      <div className="flex items-center justify-between p-6">
        <button
          onClick={onBack}
          className="flex items-center text-gray-400 hover:text-white transition-colors duration-200"
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
          <span className="text-sm font-medium">{backText}</span>
        </button>
        {rightContent}
      </div>
    </div>
  );
} 