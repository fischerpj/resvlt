const CACHE_NAME = 'quarto-pwa-v1';

const ASSETS_TO_CACHE = [
  './refpwa.html'
//  '/resvlt/posts/bcv_parser.js'
//  '/resvlt/posts/refengine.js',
//  '/resvlt/posts/refui_sole.js',
//  '/resvlt/posts/lang/en.js',
//  '/resvlt/posts/manifest.json'];
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => response || fetch(e.request))
  );
});