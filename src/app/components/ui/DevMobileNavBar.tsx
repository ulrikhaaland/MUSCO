'use client';

import React from 'react';

const DevMobileNavBar: React.FC = () => {
  return (
    <div 
      className="fixed bottom-0 left-0 right-0 h-14 bg-gray-200/95 dark:bg-gray-800/95 border-t border-gray-300 dark:border-gray-700 flex items-center justify-around px-4 shadow-lg backdrop-blur-sm z-[100]"
      // Prevent clicks from propagating through the bar
      onClick={(e) => e.stopPropagation()} 
      onTouchStart={(e) => e.stopPropagation()}
    >
      {/* Back Arrow */}
      <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
      
      {/* Forward Arrow */}
      <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
      
      {/* Share Icon */}
      <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
      </svg>
      
      {/* Bookmarks Icon */}
      <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
      </svg>
      
      {/* Tabs Icon */}
      <svg className="w-6 h-6 text-blue-500 dark:text-blue-400 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6z" />
      </svg>
    </div>
  );
};

export default DevMobileNavBar; 