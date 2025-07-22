import React from 'react';

interface ChevronDownProps {
  className?: string;
  isRotated?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const ChevronDown: React.FC<ChevronDownProps> = ({ 
  className = '', 
  isRotated = false,
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4', 
    lg: 'w-5 h-5'
  };

  return (
    <svg
      className={`transition-transform duration-200 ${isRotated ? 'rotate-180' : ''} ${sizeClasses[size]} ${className}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );
};

export default ChevronDown; 