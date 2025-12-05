import React, { ReactNode } from 'react';

type ChipVariant = 'default' | 'active' | 'inactive' | 'filter' | 'warmup' | 'category' | 'subtle';
type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  backgroundColor?: string; // Custom Tailwind background color class
}

export const Chip = ({
  children,
  variant = 'default',
  size = 'md',
  icon,
  iconPosition = 'right',
  onClick,
  className = '',
  backgroundColor,
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
    // Filter chips (removable tags at top) - violet, interactive
    filter: "bg-violet-500/15 text-violet-300 border border-violet-500/40 hover:bg-violet-500/25 hover:border-violet-400/50",
    // Active/selected state - solid indigo
    active: "bg-indigo-600 text-white border border-indigo-500 hover:bg-indigo-500",
    // Disabled state
    inactive: "bg-gray-800/50 text-gray-500 border border-gray-700",
    // Warmup exercises - amber tint
    warmup: "bg-amber-500/15 text-amber-300 border border-amber-500/40",
    // Category labels on cards - neutral, subtle
    category: "bg-gray-700/60 text-gray-300 border border-gray-600/50",
    // Subtle variant - minimal presence
    subtle: "bg-gray-800/40 text-gray-400 border border-gray-700/40",
    // Default - general purpose
    default: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
  };

  // Handle click with stop propagation
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  // Get the variant classes and override background color if custom background color is provided
  const variantClass = backgroundColor 
    ? variantClasses[variant].replace(/bg-[^\\s]+/, backgroundColor) 
    : variantClasses[variant];

  return (
    <button
      onClick={onClick ? handleClick : undefined}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClass} ${onClick ? 'cursor-pointer' : 'cursor-default'} ${className}`}
    >
      {icon && iconPosition === 'left' && <span className="mr-1">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-1">{icon}</span>}
    </button>
  );
};

export default Chip; 