const CACHE = "tiles-v2";
const TILE_HOSTS = ["basemaps.cartocdn.com", "tile.openstreetmap.org"];
const MAX_ENTRIES = 500;

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name))),
    ),
  );
});

async function trimCache(cache) {
  const keys = await cache.keys();
  const overflow = keys.length - MAX_ENTRIES;
  if (overflow > 0) {
    await Promise.all(keys.slice(0, overflow).map((key) => cache.delete(key)));
  }
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!TILE_HOSTS.some((h) => url.hostname.includes(h))) return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((res) => {
          // Only cache genuine successes. Opaque cross-origin responses report
          // ok:false with status 0 but are the normal case for tile requests
          // (no CORS headers), so they're still cached; real HTTP errors on
          // non-opaque responses are excluded.
          if (res.type !== "opaque" && !res.ok) return res;
          const copy = res.clone();
          caches.open(CACHE).then((cache) =>
            cache.put(event.request, copy).then(() => trimCache(cache)),
          );
          return res;
        }),
    ),
  );
});
