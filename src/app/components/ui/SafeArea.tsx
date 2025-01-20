import React, { useEffect, useState } from 'react';

interface SafeAreaProps {
  children: React.ReactNode;
}

export function SafeArea({ children }: SafeAreaProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      );
    };

    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  return (
    <div 
      className={`
        min-h-screen flex flex-col
        ${isMobile ? 'pb-[calc(env(safe-area-inset-bottom)+4rem)]' : ''}
      `}
      style={{ 
        height: isMobile ? '100dvh' : '100vh',
        WebkitOverflowScrolling: 'touch'
      }}
    >
      {children}
    </div>
  );
} 