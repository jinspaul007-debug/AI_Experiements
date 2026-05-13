const CACHE_NAME = 'moneywise-v3';
const ASSETS = [
  './index.html',
  './css/style.css',
  './js/app.js',
  './js/api.js',
  './js/analytics.js',
  './manifest.json'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS)));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.github.com')) return;
  e.respondWith(
    fetch(e.request).catch(() => caches.match(e.request))
  );
});
