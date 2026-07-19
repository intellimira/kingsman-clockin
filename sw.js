/* ============================================
   KINGSMAN CLOCK IN/OUT — Service Worker
   Enables offline functionality (PWA)
   ============================================ */

const CACHE_NAME = 'kingsman-clock-v1';
const BASE = self.registration.scope;
const ASSETS_TO_CACHE = [
  '',
  'index.html',
  'style.css',
  'app.js',
  'config.js',
  'manifest.json',
  'klogo.jpg',
].map((path) => new URL(path, BASE).href);

// Install — Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Caching app assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external API calls (Sheets, webhooks)
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version, but also fetch fresh version in background
        event.waitUntil(
          fetch(event.request).then((networkResponse) => {
            if (networkResponse.ok) {
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, networkResponse);
              });
            }
          }).catch(() => {})
        );
        return cachedResponse;
      }

      // Not in cache — fetch from network
      return fetch(event.request).then((networkResponse) => {
        if (networkResponse.ok) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Offline and not cached — return offline page if HTML
        if (event.request.headers.get('accept').includes('text/html')) {
          return caches.match(new URL('index.html', BASE).href);
        }
      });
    })
  );
});
