const CACHE_NAME = 'bup-digital-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg'
];

// Install Event - Precache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Precaching static app shell assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[Service Worker] Precache warning:', err);
      });
    })
  );
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', name);
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Serve from Cache or Network with Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Only intercept GET requests
  if (req.method !== 'GET') {
    return;
  }

  // 2. Skip non-http(s) protocols (e.g., chrome-extension://)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 3. Skip cross-origin requests (e.g., Firestore, Gemini API, external CDN)
  // Let browser network handle external Google APIs directly without SW intervention
  if (url.origin !== self.location.origin) {
    return;
  }

  // 4. Skip Vite dev server internal assets and HMR requests
  if (
    url.pathname.startsWith('/@') || 
    url.pathname.includes('/node_modules/') || 
    url.search.includes('v=') ||
    url.pathname.endsWith('.tsx') ||
    url.pathname.endsWith('.ts')
  ) {
    return;
  }

  // Handle API requests (/api/*): Network-first with cached JSON fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(req.clone())
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(req);
          if (cachedResponse) {
            return cachedResponse;
          }
          // Fallback offline JSON response
          return new Response(
            JSON.stringify({
              offline: true,
              message: 'আপনি বর্তমানে অফলাইনে আছেন। ড্রাফট ও ডাউনলোডকৃত কপি সক্রিয় আছে।'
            }),
            {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            }
          );
        })
    );
    return;
  }

  // Static Assets / Page Navigation: Cache-First with Network Revalidation
  event.respondWith(
    caches.match(req).then((cachedResponse) => {
      const fetchPromise = fetch(req.clone())
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch((err) => {
          console.log('[Service Worker] Offline fallback for asset:', req.url);
        });

      return cachedResponse || fetchPromise || caches.match('/index.html');
    })
  );
});

// Listen for skip waiting command
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
