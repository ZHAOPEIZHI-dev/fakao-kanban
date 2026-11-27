/* 2027娉曡€冪湅鏉?路 绂荤嚎缂撳瓨 Service Worker锛堢浉瀵硅矾寰勶紝鏍圭洰褰?瀛愮洰褰曞潎鍙敤锛?*/
const CACHE = 'fakao-offline-v15';

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      // 閫愪釜缂撳瓨锛屽崟涓け璐ヤ笉褰卞搷鍏朵綑
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
