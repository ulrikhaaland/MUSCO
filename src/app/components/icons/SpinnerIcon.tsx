import React from 'react';

interface SpinnerIconProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const SpinnerIcon: React.FC<SpinnerIconProps> = ({ 
  className = '', 
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  return (
    <div
      className={`${sizeClasses[size]} border-t-2 border-white rounded-full animate-spin ${className}`}
    />
  );
};

export default SpinnerIcon; 