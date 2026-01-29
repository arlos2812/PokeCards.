const CACHE_NAME = "pokecards-v6";

const ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",

  "./fonts/PokemonSolid.ttf",

  "./icons/icon-192.png",
  "./icons/icon-512.png",

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
  const url = new URL(e.request.url);

  /* 🔑 SI ES LA API, NO USAR CACHE */
  if (url.origin.includes("pokemontcg.io")) {
    e.respondWith(fetch(e.request));
    return;
  }

  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request))
  );
});
