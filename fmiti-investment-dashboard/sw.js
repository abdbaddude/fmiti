const CACHE = "fmiti-invest-v1.4";
const ASSETS = [
  "./",
  "./index.html",
  "./manifest.json",
  "./js/config.js",
  "./js/icons.js",
  "./js/state-intel.js",
  "./data-a.js",
  "./data-b.js",
  "./app.js",
  "./app-network.js"
];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", (e) => {
  e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
});
