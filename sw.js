/* =====================================================
   SERVICE WORKER - Mi Entrenamiento
   Network-first para HTML/JS/CSS, cache-first para el resto
===================================================== */

const CACHE_NAME = 'entrenamiento-v3';
const ARCHIVOS = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json'
];

// Instalar: precachea y activa inmediatamente
self.addEventListener('install', function(e) {
    self.skipWaiting();
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ARCHIVOS);
        })
    );
});

// Activar: borra cachés viejas y toma control de todas las pestañas
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys()
            .then(function(claves) {
                return Promise.all(
                    claves.filter(function(k) { return k !== CACHE_NAME; })
                          .map(function(k) { return caches.delete(k); })
                );
            })
            .then(function() { return self.clients.claim(); })
    );
});

// Fetch: network-first para HTML/JS/CSS, cache-first para el resto
self.addEventListener('fetch', function(e) {
    if (e.request.method !== 'GET') return;

    const url = new URL(e.request.url);
    const esApp = url.origin === location.origin;
    const esDinamico = /\.(html|js|css|json)$/i.test(url.pathname) || url.pathname.endsWith('/');

    if (esApp && esDinamico) {
        e.respondWith(
            fetch(e.request)
                .then(function(res) {
                    const copia = res.clone();
                    caches.open(CACHE_NAME).then(function(c) { c.put(e.request, copia); });
                    return res;
                })
                .catch(function() { return caches.match(e.request); })
        );
    } else {
        e.respondWith(
            caches.match(e.request).then(function(res) {
                return res || fetch(e.request);
            })
        );
    }
});

// Permite que la app fuerce la actualización
self.addEventListener('message', function(e) {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});

