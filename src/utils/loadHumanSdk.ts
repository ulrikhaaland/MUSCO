let sdkPromise: Promise<typeof window.HumanAPI> | null = null;

export async function loadHumanSdk(): Promise<typeof window.HumanAPI> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('window is undefined'));
  }

  if (window.HumanAPI) {
    return Promise.resolve(window.HumanAPI);
  }

  if (sdkPromise) {
    return sdkPromise;
  }

  sdkPromise = new Promise((resolve, reject) => {
    let script = document.getElementById('biodigital-sdk') as HTMLScriptElement | null;

    const handleLoad = () => {
      if (window.HumanAPI) {
        resolve(window.HumanAPI);
      } else {
        reject(new Error('HumanAPI failed to load'));
      }
    };

    const handleError = () => {
      reject(new Error('Failed to load BioDigital SDK'));
    };

    if (script) {
      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
    } else {
      script = document.createElement('script');
      script.id = 'biodigital-sdk';
      script.src = 'https://developer.biodigital.com/builds/api/human-api-3.0.0.min.js';
      script.async = true;
      script.addEventListener('load', handleLoad);
      script.addEventListener('error', handleError);
      document.body.appendChild(script);
    }
  });

  return sdkPromise;
}
