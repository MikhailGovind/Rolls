// Rolls service worker — app shell cached for offline; CDN assets cached as they're used.
const V = 'rolls-v1';
const SHELL = [
  './app.dc.html', './Opening Screen.dc.html', './Frame Logging Screen.dc.html',
  './support.js', './themes.js', './store.js', './manifest.webmanifest',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png',
];
const RUNTIME_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'unpkg.com', 'basemaps.cartocdn.com'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(V).then((c) => Promise.allSettled(SHELL.map((u) => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V && k !== V + '-rt').map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin === self.location.origin) {
    // app shell: network first (so updates land), cache fallback (so it opens offline)
    e.respondWith(fetch(req).then((res) => { const cp = res.clone(); caches.open(V).then((c) => c.put(req, cp)); return res; }).catch(() => caches.match(req).then((r) => r || caches.match('./app.dc.html'))));
    return;
  }
  if (RUNTIME_HOSTS.some((h) => url.hostname.endsWith(h))) {
    // libraries, fonts, map tiles, earth texture: cache first, refresh in background
    e.respondWith(caches.open(V + '-rt').then((c) => c.match(req).then((hit) => {
      const net = fetch(req).then((res) => { if (res && res.ok) c.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })));
  }
});
