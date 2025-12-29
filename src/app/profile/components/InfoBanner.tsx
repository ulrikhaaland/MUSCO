'use client';

import { ReactNode } from 'react';

interface InfoBannerProps {
  title: string;
  subtitle: string;
  badge?: string;
  icon?: ReactNode;
}

/**
 * A reusable info banner component with a gradient background.
 * Used for displaying important information in a visually appealing way.
 */
export default function InfoBanner({ title, subtitle, badge, icon }: InfoBannerProps) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/40 to-gray-800/40 backdrop-blur-sm rounded-2xl shadow-xl ring-1 ring-indigo-500/20 p-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex-shrink-0 mt-1 text-indigo-400">
              {icon}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-white mb-1">{title}</h2>
            <p className="text-gray-400 text-sm">{subtitle}</p>
          </div>
        </div>
        {badge && (
          <div className="bg-indigo-500/20 text-indigo-300 px-4 py-2 rounded-full text-sm font-medium ring-1 ring-indigo-500/30">
            {badge}
          </div>
        )}
      </div>
    </div>
  );
}


