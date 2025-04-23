import React, { ReactNode } from 'react';

type ChipVariant = 'default' | 'active' | 'inactive' | 'highlight';
type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
}

export const Chip = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'right',
  onClick,
  className = '',
}: ChipProps) => {
  // Base classes for all variants
  const baseClasses = "rounded-xl text-xs font-medium transition-colors duration-200 flex items-center";
  
  // Size classes
  const sizeClasses = {
    sm: "px-2 py-0.5 h-fit",
    md: "px-3 py-1",
    lg: "px-4 py-1.5",
  };
  
  // Variant classes
  const variantClasses = {
    default: "bg-indigo-600/20 text-indigo-300 hover:bg-indigo-600/30",
    active: "bg-indigo-600/20 text-indigo-100 hover:bg-indigo-600/30",
    inactive: "bg-gray-700 text-gray-300",
    highlight: "bg-blue-500/20 text-blue-300 hover:bg-blue-500/30",
  };

  // Handle click with stop propagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <button
      onClick={onClick ? handleClick : undefined}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
    >
      {icon && iconPosition === 'left' && <span className="mr-1">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-1">{icon}</span>}
    </button>
  );
};

export default Chip; 