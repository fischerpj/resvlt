const CACHE_NAME = 'quarto-pwa-v1';
const ASSETS_TO_CACHE = [
  '/resvlt/posts/refpwa.html',
  '/resvlt/posts/bcv_parser.js',
  '/resvlt/posts/refengine.js',
  '/resvlt/posts/refui_sole.js',
  '/resvlt/posts/lang/en.js',
  '/resvlt/posts/manifest.json'
];

// Install Event: Cache core files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate Event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.claim();
});

// Fetch Event: Serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  event.layer_url = event.request.url;
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request).catch(() => {
        // Optional: Return a fallback offline page if needed
      });
    })
  );
});