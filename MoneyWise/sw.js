const CACHE_NAME = 'moneywise-v3';
const ASSETS = [
    './',
    './index.html',
    './css/style.css',
    './js/app.js',
    './js/api.js',
    './js/analytics.js',
    './manifest.json'
];

self.addEventListener('install', (e) => {
    e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)));
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then(keys => 
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', (e) => {
    // Network-first for API calls, cache-first for static assets
    if (e.request.url.includes('api.github.com') || e.request.url.includes('cdn.')) {
        return; // Don't cache API calls or CDN resources
    }
    e.respondWith(
        fetch(e.request).then(res => {
            const clone = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(e.request, clone));
            return res;
        }).catch(() => caches.match(e.request))
    );
});
