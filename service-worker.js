const CACHE_NAME = "pokecards-v3";

const APP_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

/* =========================
   INSTALAR
========================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

/* =========================
   ACTIVAR
========================= */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

/* =========================
   FETCH
========================= */
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);

  // 🚫 NO cachear API
  if (url.origin.includes("pokemontcg.io")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 🚫 NO cachear imágenes de cartas
  if (
    event.request.destination === "image" &&
    url.origin.includes("images.pokemontcg.io")
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // 📦 App → cache first
  event.respondWith(
    caches.match(event.request).then(
      cached => cached || fetch(event.request)
    )
  );
});
