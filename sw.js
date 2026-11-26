/* 2027法考看板 · 离线缓存 Service Worker（相对路径，根目录/子目录均可用） */
const CACHE = 'fakao-offline-v11';

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // 逐个缓存，单个失败不影响其余
      return Promise.all(['./', './index.html'].map(function (u) {
        return c.add(new Request(u, { cache: 'reload' })).catch(function () {});
      }));
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys()
      .then(function (ks) {
        return Promise.all(ks.filter(function (k) { return k !== CACHE; })
          .map(function (k) { return caches.delete(k); }));
      })
      .then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(function (r) {
        var cp = r.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, cp); }).catch(function () {});
        return r;
      })
      .catch(function () {
        return caches.match(e.request, { ignoreSearch: true })
          .then(function (r) { return r || caches.match('./index.html') || caches.match('./'); });
      })
  );
});
