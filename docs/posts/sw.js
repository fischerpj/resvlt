const CACHE_NAME = 'quarto-pwa-v1';

const ASSETS_TO_CACHE = [
  './refpwa.html'
  // '/resvlt/posts/bcv_parser.js',
  // '/resvlt/posts/refengine.js',
  // '/resvlt/posts/refui_sole.js',
  // '/resvlt/posts/lang/en.js',
  // '/resvlt/posts/manifest.json'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
