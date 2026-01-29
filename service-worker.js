const CACHE_NAME = "pokecards-v5";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",

  /* FUENTE */
  "./fonts/PokemonSolid.ttf",

  /* ICONOS */
  "./icons/icon-192.png",
  "./icons/icon-512.png",

  /* SONIDOS */
  "./sounds/song1.mp3",
  "./sounds/song2.mp3",
  "./sounds/song3.mp3"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(cached => cached || fetch(e.request))
  );
});
