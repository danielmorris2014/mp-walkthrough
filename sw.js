// MP Walkthrough — minimal offline-first service worker.
// Bump CACHE_VERSION whenever index.html/icons change so every phone picks up the update.
var CACHE_VERSION = 'mp-walk-v83';

self.addEventListener('message', function (event) {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
  }
});

// Bypass GitHub Pages 10-minute HTTP max-age cache when installing a new version
function addFresh(cache, url) {
  var req = new Request(url, { cache: 'reload' });
  return fetch(req).then(function (resp) {
    if (!resp || !resp.ok) throw new Error('HTTP ' + (resp ? resp.status : 'err') + ' for ' + url);
    return cache.put(url, resp);
  }).catch(function () {
    return cache.add(url);
  });
}

// CORE = what the app needs to boot. Small (under 3MB), cached atomically.
// If ANY of these fail, the install fails and retries - correct behavior.
var CORE = [
  './',
  './index.html',
  './report-engine.js',
  './stamp-engine.js',
  './vendor/yjs/yjs.min.js',
  './sync-engine.js',
  './kit-data.js',
  './cutsheet-engine.js',
  './vendor/localforage/localforage.min.js',
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
  './labels.html',
  './data/directory.json.gz',
  './data/buf103.json.gz',
  './vendor/jsplumb/jsplumb.min.js',
  './vendor/xlsx/xlsx.full.min.js',
  './tools/cutsheet-parser.js',
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
      // 1) Core + HTML pages: bypass HTTP cache so rapid pushes never cache stale HTML
      var fastUrls = CORE.concat(['./guide.html', './buf103.html', './reference.html', './scan.html', './labels.html']);
      return Promise.all(fastUrls.map(function (url) {
        return addFresh(cache, url);
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (k) { return k === CACHE_VERSION ? null : caches.delete(k); }));
    }).then(function () { return self.clients.claim(); }).then(function () {
      // Warm HEAVY assets and training files in background after activating so updates finish in <1s
      return caches.open(CACHE_VERSION).then(function (cache) {
        return Promise.all(HEAVY.map(function (url) {
          return cache.match(url).then(function (hit) {
            return hit ? null : addFresh(cache, url).catch(function () {});
          });
        })).then(function () {
          return fetch('./training/manifest.json').then(function (r) { return r.json(); }).then(function (files) {
            return (files || []).reduce(function (p, url) {
              return p.then(function () {
                return cache.match(url).then(function (hit) {
                  return hit ? null : cache.add(url).catch(function () {});
                });
              });
            }, Promise.resolve());
          }).catch(function () {});
        });
      }).catch(function () {});
    })
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
        // CDN hiccups (404/500 during deployment) on same-origin GETs:
        // don't pass the error through - fall back to cached app shell
        // for navigations, or let non-navigations fail gracefully
        if (!resp.ok && new URL(event.request.url).origin === location.origin) {
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html').then(function (fallback) {
              return fallback || resp;
            });
          }
        }
        if (resp && resp.ok && !event.request.headers.get('range') && new URL(event.request.url).origin === location.origin) {
          var copy = resp.clone();
          caches.open(CACHE_VERSION).then(function (cache) { cache.put(event.request, copy); });
        }
        return resp;
      }).catch(function () {
        // offline + not cached: serve the app shell for navigations
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
