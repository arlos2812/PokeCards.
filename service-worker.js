const CACHE_NAME = "pokecards-v4";

/* ARCHIVOS DE LA APP (HTML NUEVO, SIN ESCANEAR) */
const APP_ASSETS = [
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

/* =========================
   INSTALL
========================= */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(APP_ASSETS);
    })
  );
  self.skipWaiting();
});

/* =========================
   ACTIVATE
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

  /* API Pokémon → network first */
  if (url.origin.includes("pokemontcg.io")) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, clone)
          );
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  /* FUENTES E IMÁGENES → cache first */
  if (
    event.request.destination === "image" ||
    event.request.destination === "font"
  ) {
    event.respondWith(
      caches.match(event.request).then(cached =>
        cached ||
        fetch(event.request).then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(event.request, clone)
          );
          return response;
        })
      )
    );
    return;
  }

  /* HTML / CSS / JS → cache first */
  event.respondWith(
    caches.match(event.request).then(cached =>
      cached || fetch(event.request)
    )
  );
});
