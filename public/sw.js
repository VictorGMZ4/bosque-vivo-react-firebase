/* Replaced with content-versioned values by pwa-plugin.js during production builds. */
const VERSION = '__FLORA_VERSION__';
const PRECACHE = __FLORA_PRECACHE__;
const PREFIX = 'flora-viva-shell-';
const CACHE = PREFIX + VERSION;
const ASSETS = new Set(PRECACHE.map(path => new URL(path, self.location.origin).href));

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)));
  // A new worker waits until existing tabs close, preserving their hashed chunks.
});
self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith(PREFIX) && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  // Firebase, callable functions, auth, API requests and private documents never enter a cache.
  if (request.method !== 'GET' || url.origin !== self.location.origin) return;
  if (request.mode === 'navigate') {
    // Serve the version-matched application shell, never a cached API/server response.
    event.respondWith(caches.open(CACHE).then(cache => cache.match('/index.html')).then(shell => shell || fetch(request)));
    return;
  }
  if (!ASSETS.has(url.href)) return;
  // The preview server varies CORS headers by Origin. These allowlisted,
  // content-versioned public files have identical bytes for every requester.
  event.respondWith(caches.open(CACHE).then(cache => cache.match(request, {ignoreVary:true})).then(asset => asset || fetch(request)));
});
