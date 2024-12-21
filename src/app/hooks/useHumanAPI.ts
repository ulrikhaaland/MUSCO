import { useEffect, useRef, MutableRefObject } from 'react';
import { HumanAPI } from '../types/human';

interface UseHumanAPIProps {
  elementId: string;
  onReady?: () => void;
  onObjectSelected?: (event: any) => void;
}

export function useHumanAPI({ 
  elementId, 
  onReady, 
  onObjectSelected 
}: UseHumanAPIProps): {
  humanRef: MutableRefObject<HumanAPI | null>;
  handleReset: () => void;
} {
  const humanRef = useRef<HumanAPI | null>(null);

  useEffect(() => {
    let script: HTMLScriptElement | null = null;

    const initializeViewer = () => {
      if (!window.HumanAPI) {
        script = document.createElement('script');
        script.src = 'https://developer.biodigital.com/builds/api/human-api-3.0.0.min.js';
        script.async = true;
        script.onload = setupHumanAPI;
        document.body.appendChild(script);
      } else {
        setupHumanAPI();
      }
    };

    const setupHumanAPI = () => {
      try {
        const human = new window.HumanAPI(elementId, {
          camera: {
            position: { z: -25 },
          },
        });

        humanRef.current = human;

        human.on('human.ready', () => {
          console.log('Human API is ready');

          // Enable isolate tool
          human.send('ui.setDisplay', {
            isolate: true,
            tools: true,
          });

          onReady?.();

          if (onObjectSelected) {
            human.on('scene.objectsSelected', onObjectSelected);
          }
        });
      } catch (error) {
        console.error('Error initializing HumanAPI:', error);
      }
    };

    initializeViewer();

    return () => {
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, [elementId, onReady, onObjectSelected]);

  const handleReset = () => {
    console.log('Reset clicked, humanRef.current:', humanRef.current);
    if (humanRef.current) {
      // First reset all colors
      humanRef.current.send('scene.uncolorObject', {
        id: '*', // Uncolor all objects
      });

      // Disable X-ray mode
      humanRef.current.send('scene.disableXray');

      // Reset the scene
      humanRef.current.send('scene.reset');

      // Reset the camera
      humanRef.current.send('camera.reset');
    }
  };

  return { humanRef, handleReset };
} 