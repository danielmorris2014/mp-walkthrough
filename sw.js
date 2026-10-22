// MP Walkthrough — minimal offline-first service worker.
// Bump CACHE_VERSION whenever index.html/icons change so every phone picks up the update.
var CACHE_VERSION = 'mp-walk-v67';

self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// CORE = what the app needs to boot. Small (under 3MB), cached atomically.
// If ANY of these fail, the install fails and retries - correct behavior.
var CORE = [
  './',
  './index.html',
  './report-engine.js',
  './stamp-engine.js',
  './sync-engine.js',
  './kit-data.js',
  './chrome.css',
  './manifest.webmanifest',
  './icons/apple-touch-icon.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './flashcards.html',
  './data/glossary.json.gz'
];

// HEAVY = large datasets + OCR engine + guide. Cached individually with
// per-file error tolerance: one failure doesn't block the rest (the v66
// bug: 17MB atomic addAll stalled phones on "downloading update").
var HEAVY = [
  './guide.html',
  './buf103.html',
  './reference.html',
  './scan.html',
  './ocr.html',
  './labels.html',
  './data/directory.json.gz',
  './data/buf103.json.gz',
  './vendor/zxing/reader.js',
  './vendor/zxing/zxing_reader.wasm',
  './vendor/tesseract/tesseract.min.js',
  './vendor/tesseract/worker.min.js',
  './vendor/tesseract/tesseract-core-simd-lstm.wasm.js',
  './vendor/tesseract/eng.traineddata.gz',
  './vendor/leaflet/leaflet.js',
  './vendor/leaflet/leaflet.css',
  './vendor/leaflet/images/layers.png',
  './vendor/leaflet/images/layers-2x.png',
  './vendor/leaflet/images/marker-icon.png',
  './vendor/leaflet/images/marker-icon-2x.png',
  './vendor/leaflet/images/marker-shadow.png',
  './training/manifest.json'
];

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      // 1) Core: atomic - if this fails, retry the whole install (correct)
      return cache.addAll(CORE).then(function () {
        // 2) Heavy: individual, tolerant - one failure doesn't block others
        return Promise.all(HEAVY.map(function (url) {
          return cache.add(url).catch(function (e) {
            // file will be runtime-cached on first use instead
          });
        }));
      }).then(function () {
        // 3) Training manifest: 80 small course files, optional
        return fetch('./training/manifest.json').then(function (r) { return r.json(); }).then(function (files) {
          // cache at most 40 per install (spread the load); rest runtime-cache
          return Promise.all(files.slice(0, 40).map(function (url) {
            return cache.add(url).catch(function () {});
          }));
        }).catch(function () { /* training needs one online open */ });
      });
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE_VERSION ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  // media streams over Range requests return 206 partials - caching one
  // under the full URL would corrupt offline playback. Never cache media.
  var u = event.request.url;
  if (/\.(mp4|m4v|webm|mp3|wav)(\?|$)/i.test(u)) return;
  event.respondWith(
    caches.match(event.request).then(function (cached) {
      if (cached) return cached;
      return fetch(event.request).then(function (resp) {
        if (resp && resp.ok && !event.request.headers.get('range') && new URL(event.request.url).origin === location.origin) {
          var copy = resp.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(event.request, copy); });
        }
        return resp;
      }).catch(function () {
        // offline + not cached: return a helpful offline page for navigation
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
