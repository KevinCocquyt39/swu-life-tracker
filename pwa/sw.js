const CACHE_NAME = "swu-life-tracker-v1";

const PRECACHE = ["./swu-life-tracker.html", "./manifest.json", "./icon.svg"];

// Install: cache local assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)),
  );
  self.skipWaiting();
});

// Activate: clear old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      ),
  );
  self.clients.claim();
});

// Fetch: cache-first for local assets, network-first for CDN
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const isLocal = url.origin === self.location.origin;

  if (isLocal) {
    // Cache-first for local files
    event.respondWith(
      caches.match(event.request).then(
        (cached) =>
          cached ||
          fetch(event.request).then((response) => {
            const clone = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(event.request, clone));
            return response;
          }),
      ),
    );
  } else {
    // Network-first for CDN (fonts, Vue), fall back to cache
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request)),
    );
  }
});
