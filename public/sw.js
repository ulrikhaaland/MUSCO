// Service Worker for Musco App

const CACHE_NAME = 'musco-app-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png',
  '/img/logo.png',
  '/login',
  '/auth/shared-link'
];

// Handle navigation for specific URLs (auth deep links)
function handleNavigationRequest(event) {
  const url = new URL(event.request.url);
  
  // Check if the request is for a sign-in link (contains OobCode parameter for Firebase auth)
  if (url.searchParams.has('oobCode') || 
      url.pathname === '/auth/shared-link' ||
      url.pathname.startsWith('/__/auth/')) {
    
    // Don't cache auth requests, always fetch from network
    return fetch(event.request);
  }
  
  // Continue with standard cache/network strategy for other requests
  return null;
}

// Install event - cache basic resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
  
  // Force this service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  const cacheAllowlist = [CACHE_NAME];

  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheAllowlist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control of all clients immediately
  event.waitUntil(self.clients.claim());
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  // Special handling for navigation requests (page loads)
  if (event.request.mode === 'navigate') {
    const navigationResponse = handleNavigationRequest(event);
    if (navigationResponse) {
      event.respondWith(navigationResponse);
      return;
    }
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Clone the request
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone the response
            const responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                // Don't cache API requests, auth requests, or dynamic content
                if (!event.request.url.includes('/api/') && 
                    !event.request.url.includes('/__/auth/') &&
                    !event.request.url.includes('/auth/') &&
                    !event.request.url.includes('oobCode=')) {
                  cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        );
      })
  );
});

// Listen for message events (e.g., from the main app)
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
}); 