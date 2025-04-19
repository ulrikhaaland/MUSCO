import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  isHoverable?: boolean;
  isClickable?: boolean;
  className?: string;
  tag?: ReactNode;
  title?: ReactNode;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
}

export const Card = ({ 
  children, 
  onClick,
  isHoverable = true,
  isClickable = false,
  className = '',
  tag,
  title,
  headerContent,
  footerContent
}: CardProps) => {
  const baseClasses = "bg-gray-800/95 rounded-xl overflow-hidden shadow-lg box-shadow-card transition-all duration-200";
  
  // Enhanced hover effect with subtle elevation and lighting
  const hoverClasses = isHoverable 
    ? "hover:bg-gray-750/95 hover:shadow-xl hover:translate-y-[-1px]" 
    : "";
  
  // Clickable classes - removed splash effect
  const clickableClasses = isClickable 
    ? "cursor-pointer" 
    : "";
  
  return (
    <div
      className={`${baseClasses} ${hoverClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
    >
      {/* Header section - conditional render */}
      {(title || tag || headerContent) && (
        <div className="w-full px-4 py-4 flex flex-col gap-2">
          {/* Title and tag row */}
          {(title || tag) && (
            <div className="flex justify-between gap-2">
              {title && (
                <h3 className="text-white font-medium text-lg line-clamp-2 max-w-[75%] tracking-tight md:tracking-normal">
                  {title}
                </h3>
              )}
              {tag && (
                <div className="flex-shrink-0">
                  {tag}
                </div>
              )}
            </div>
          )}
          
          {/* Additional header content */}
          {headerContent && (
            <div className="flex flex-wrap items-center gap-4">
              {headerContent}
            </div>
          )}
        </div>
      )}
      
      {/* Main content */}
      <div className="px-4 pb-4 space-y-4">
        {children}
      </div>
      
      {/* Footer section - conditional render */}
      {footerContent && (
        <div className="px-4 pb-4">
          {footerContent}
        </div>
      )}
    </div>
  );
};

// Add Card.Section component for consistent inner padding/spacing
Card.Section = function CardSection({ 
  children,
  className = '',
}: { 
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`space-y-4 ${className}`}>
      {children}
    </div>
  );
};

export default Card; 