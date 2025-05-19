const CACHE_NAME = 'handicap-cache-v1';
const FILES_TO_CACHE = [
  './',
  './index.html',
  './calculator.html',
  './manifest.json',
  './style.css',      // if you split out CSS
  './script.js',      // or inline your JS here
  './icons/DDGolf.png',
  './icons/DDGolf.png'
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', evt => {
  evt.respondWith(
    caches.match(evt.request)
      .then(resp => resp || fetch(evt.request))
  );
});
