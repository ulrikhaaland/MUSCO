import React, { useEffect, useState } from "react";

interface SafeAreaProps {
  children: React.ReactNode;
  className?: string;
}

export function SafeArea({ children, className }: SafeAreaProps) {
  const [isMobile, setIsMobile] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      const userAgent = navigator.userAgent;
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
      setIsMobile(isMobileDevice);
      setIsAndroid(/Android/i.test(userAgent));
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return (
    <div
      className={`
        min-h-screen flex flex-col bg-gray-900
        ${isMobile ? "pb-[calc(env(safe-area-inset-bottom)+4rem)]" : ""}
        ${isAndroid ? "android-safe-area" : ""}
        ${className || ''}
      `}
      style={{
        WebkitOverflowScrolling: "touch",
        ...(isAndroid && {
          paddingBottom: 'calc(env(safe-area-inset-bottom) + 4rem)',
          backgroundColor: '#111827'
        })
      }}
    >
      {children}
      {isAndroid && (
        <div 
          className="fixed left-0 right-0 bottom-0 bg-gray-900" 
          style={{ 
            height: '100px',
            zIndex: -1,
            transform: 'translateY(70px)'
          }}
        />
      )}
    </div>
  );
}
