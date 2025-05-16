import React, { ReactNode } from 'react';

interface InfoBadgeProps {
  label: string;
  icon?: ReactNode;
  value?: string | number;
  unit?: string;
  className?: string;
}

/**
 * A pill–shaped stat badge used for small inline metrics (e.g. duration, calories).
 */
export default function InfoBadge({
  label,
  icon,
  value,
  unit,
  className = '',
}: InfoBadgeProps) {
  return (
    <div
      role="text"
      aria-label={value !== undefined ? `${label}: ${value} ${unit ?? ''}` : label}
      className={`inline-flex items-center gap-3 px-4 py-2 rounded-full shadow-inner shadow-indigo-500/10 bg-gradient-to-br from-indigo-700/30 via-indigo-700/15 to-transparent ring-1 ring-indigo-500/30 backdrop-blur-md text-indigo-100/90 ${className}`}
    >
      <span className="text-sm font-medium tracking-tight whitespace-nowrap">{label}</span>
      {value !== undefined && (
        <>
          <span className="text-indigo-300/70">·</span>
          <span className="flex items-center whitespace-nowrap">
            {icon && <span className="mr-1.5 text-indigo-300/80 w-4 h-4">{icon}</span>}
            <span className="font-medium">{value}</span>
            {unit && <span className="ml-1 opacity-80">{unit}</span>}
          </span>
        </>
      )}
    </div>
  );
} 