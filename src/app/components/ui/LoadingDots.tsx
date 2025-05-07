'use client';

import { useState, useEffect } from 'react';

export function LoadingDots() {
  const [dots, setDots] = useState('.');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prevDots => {
        if (prevDots === '...') return '.';
        if (prevDots === '..') return '...';
        return '..';
      });
    }, 250);

    return () => clearInterval(interval);
  }, []);

  return <span>{dots}</span>;
} 