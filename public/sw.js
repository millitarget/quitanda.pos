const CACHE_NAME = 'restaurant-orders-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/styles.css',
  '/styles/globals.css'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch strategy: network-first for HTML/CSS/JS to avoid stale UI
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const isNavigation = request.mode === 'navigate';
  const isStaticAsset = request.destination === 'script' || request.destination === 'style' || request.destination === 'document';

  if (isNavigation || isStaticAsset) {
    event.respondWith(
      (async () => {
        try {
          const networkResponse = await fetch(request);
          // Update cache with fresh response
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, networkResponse.clone());
          return networkResponse;
        } catch (err) {
          const cached = await caches.match(request);
          return cached || caches.match('/');
        }
      })()
    );
  } else {
    // For other requests, try cache first then network
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control immediately
  self.clients.claim();
});

// Force waiting SW to activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
});
