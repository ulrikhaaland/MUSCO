import React, { ReactNode } from 'react';

type ChipVariant = 'default' | 'active' | 'inactive' | 'warmup' | 'category' | 'subtle' | 'cardio' | 'recovery' | 'strength';
type ChipSize = 'sm' | 'md' | 'lg';

interface ChipProps {
  children: ReactNode;
  variant?: ChipVariant;
  size?: ChipSize;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  onClick?: (e: React.MouseEvent) => void;
  className?: string;
  backgroundColor?: string;
}

// Base styles (without hover)
const baseVariantStyles: Record<ChipVariant, string> = {
  default: "bg-indigo-500/15 text-indigo-300 border border-indigo-500/30",
  active: "bg-indigo-600 text-white border border-indigo-500",
  inactive: "bg-gray-800/50 text-gray-500 border border-gray-700",
  warmup: "bg-amber-500/15 text-amber-300 border border-amber-500/40",
  category: "bg-gray-700/60 text-gray-300 border border-gray-600/50",
  subtle: "bg-gray-800/40 text-gray-400 border border-gray-700/40",
  cardio: "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30",
  recovery: "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30",
  strength: "bg-violet-500/15 text-violet-300 border border-violet-500/30",
};

// Hover styles (applied only when onClick is provided)
const hoverStyles: Record<ChipVariant, string> = {
  default: "hover:bg-indigo-500/25 hover:border-indigo-400/50",
  active: "hover:bg-indigo-500",
  inactive: "hover:bg-gray-700/60 hover:text-gray-400 hover:border-gray-600",
  warmup: "hover:bg-amber-500/25 hover:border-amber-400/50",
  category: "hover:bg-gray-600/70 hover:border-gray-500/60",
  subtle: "hover:bg-gray-700/50 hover:border-gray-600/50",
  cardio: "hover:bg-emerald-500/25 hover:border-emerald-400/50",
  recovery: "hover:bg-cyan-500/25 hover:border-cyan-400/50",
  strength: "hover:bg-violet-500/25 hover:border-violet-400/50",
};

const sizeStyles: Record<ChipSize, string> = {
  sm: "px-2 py-0.5 h-fit",
  md: "px-3 py-1",
  lg: "px-4 py-1.5",
};

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
  const baseClasses = "rounded-xl text-xs font-medium transition-colors duration-200 flex items-center";
  
  const variantClass = backgroundColor 
    ? baseVariantStyles[variant].replace(/bg-[^\s]+/, backgroundColor) 
    : baseVariantStyles[variant];
  
  const interactiveClasses = onClick 
    ? `cursor-pointer ${hoverStyles[variant]}` 
    : 'cursor-default';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <button
      onClick={onClick ? handleClick : undefined}
      className={`${baseClasses} ${sizeStyles[size]} ${variantClass} ${interactiveClasses} ${className}`}
    >
      {icon && iconPosition === 'left' && <span className="mr-1">{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span className="ml-1">{icon}</span>}
    </button>
  );
};

export default Chip;
