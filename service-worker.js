const CACHE_NAME = "pokecards-v6";

/* Archivos estáticos */
const STATIC_ASSETS = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json"
];

/* ===== INSTALL ===== */
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

/* ===== ACTIVATE ===== */
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

/* ===== FETCH ===== */
self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  /* 🚫 NO interceptar la API */
  if (url.origin.includes("api.pokemontcg.io")) {
    return;
  }

  /* 🖼️ Cache-first SOLO para imágenes */
  if (req.destination === "image") {
    event.respondWith(
      caches.match(req).then(res => {
        return (
          res ||
          fetch(req).then(fetchRes => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(req, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
    );
    return;
  }

  /* 📄 Cache-first para archivos estáticos */
  event.respondWith(
    caches.match(req).then(res => res || fetch(req))
  );
});
