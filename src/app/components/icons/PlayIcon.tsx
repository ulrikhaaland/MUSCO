import React from 'react';

interface PlayIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const PlayIcon: React.FC<PlayIconProps> = ({ 
  className = '', 
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <svg
      className={`${sizeClasses[size]} opacity-85 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
};

export default PlayIcon; 