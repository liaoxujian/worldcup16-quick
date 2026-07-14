const CACHE = "worldcup16-pwa-v3";
const ASSETS = ["./", "./index.html", "./manifest.webmanifest", "./icon.svg"];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const isNavigation = event.request.mode === "navigate" || new URL(event.request.url).pathname.endsWith("/index.html");
  const fromNetwork = fetch(event.request).then(response => {
    const copy = response.clone();
    if (new URL(event.request.url).origin === self.location.origin) {
      caches.open(CACHE).then(cache => cache.put(event.request, copy));
    }
    return response;
  });
  event.respondWith(isNavigation
    ? fromNetwork.catch(() => caches.match("./index.html"))
    : caches.match(event.request).then(cached => cached || fromNetwork.catch(() => caches.match("./index.html"))));
});
