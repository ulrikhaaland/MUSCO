// Singleton loader for BioDigital Human SDK
// Prevents script churn and handles concurrent loading

import type { HumanAPIConstructor } from '../types/human';

let sdkPromise: Promise<HumanAPIConstructor> | null = null;

export function loadHumanSdk(): Promise<HumanAPIConstructor> {
  // Return existing promise if already loading/loaded
  if (sdkPromise) {
    return sdkPromise;
  }

  // Check if already loaded
  if (window.HumanAPI) {
    return Promise.resolve(window.HumanAPI);
  }

  // Check if script tag already exists
  const existingScript = document.getElementById('biodigital-sdk');
  if (existingScript) {
    // Script exists but HumanAPI not ready yet, wait for it
    sdkPromise = new Promise((resolve, reject) => {
      const checkReady = () => {
        if (window.HumanAPI) {
          resolve(window.HumanAPI);
        } else {
          setTimeout(checkReady, 10);
        }
      };
      
      // Also listen for error events
      existingScript.addEventListener('error', reject);
      checkReady();
    });
    return sdkPromise;
  }

  // Create new script and promise
  sdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.id = 'biodigital-sdk';
    script.src = 'https://developer.biodigital.com/builds/api/human-api-3.0.0.min.js';
    script.async = true;
    
    script.onload = () => {
      if (window.HumanAPI) {
        resolve(window.HumanAPI);
      } else {
        reject(new Error('HumanAPI not available after script load'));
      }
    };
    
    script.onerror = () => {
      // Reset promise so future calls can retry
      sdkPromise = null;
      reject(new Error('Failed to load Human SDK'));
    };
    
    document.body.appendChild(script);
  });

  return sdkPromise;
} 