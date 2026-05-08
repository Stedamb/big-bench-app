const CACHE = "tiles-v1";
const TILE_HOSTS = ["basemaps.cartocdn.com", "tile.openstreetmap.org"];

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  if (!TILE_HOSTS.some((h) => url.hostname.includes(h))) return;
  event.respondWith(
    caches.match(event.request).then(
      (cached) =>
        cached ||
        fetch(event.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(event.request, copy));
          return res;
        }),
    ),
  );
});
