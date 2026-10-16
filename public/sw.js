// GitNote Progressive Web App Service Worker
// Cache version: bump when updating assets
const CACHE_NAME = 'gitnote-pwa-v1';

// Safe public app shell assets to precache on install
const PRECACHE_ASSETS = [
  '/',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/icon-maskable-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32x32.png',
  '/logo.png',
  '/gitnote-logo.png',
];

// Install: precache app shell and offline fallback
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => self.skipWaiting())
      .catch((err) => {
        console.warn('[GitNote SW] Precache failed:', err);
      })
  );
});

// Activate: clean up older cache versions
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch: secure routing & caching strategy
self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // 1. Only handle GET requests
  if (req.method !== 'GET') {
    return;
  }

  // 2. Ignore non-http/https schemes (e.g. chrome-extension:)
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // 3. SECURITY: NEVER cache Supabase API, Auth, or Storage requests
  // Protects user credentials, session tokens, and private academic resources
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('supabase.in')
  ) {
    return; // Passthrough directly to network
  }

  // 4. SECURITY: NEVER cache internal API or authentication routes
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/auth/')
  ) {
    return;
  }

  // 5. HTML Navigation Requests (Page Visits)
  // Strategy: Network-First with Cache fallback, then /offline
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((networkResponse) => {
          // If valid response, cache the page for offline viewing
          if (networkResponse && networkResponse.status === 200) {
            const copy = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(req, copy);
            });
          }
          return networkResponse;
        })
        .catch(async () => {
          // If offline, check if page was previously cached
          const cached = await caches.match(req);
          if (cached) {
            return cached;
          }
          // Otherwise return dedicated offline fallback page
          const offlinePage = await caches.match('/offline');
          return (
            offlinePage ||
            new Response(
              '<html><body><h1>Offline</h1><p>Please check your internet connection.</p></body></html>',
              {
                headers: { 'Content-Type': 'text/html' },
                status: 503,
              }
            )
          );
        })
    );
    return;
  }

  // 6. Static Next.js Bundles & Assets (/_next/static/, fonts, images)
  // Strategy: Stale-While-Revalidate for instant loading
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(req).then((cachedResponse) => {
        const fetchPromise = fetch(req)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200) {
              const copy = networkResponse.clone();
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(req, copy);
              });
            }
            return networkResponse;
          })
          .catch(() => cachedResponse);

        return cachedResponse || fetchPromise;
      })
    );
    return;
  }
});
