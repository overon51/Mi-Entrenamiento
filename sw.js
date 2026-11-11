const CACHE_NAME = 'entrenamiento-A7'; // <-- Si actualizas, cambia este número
const ASSETS = [
    './',
    './index.html',
    './script.js',
    './style.css',
    './manifest.json',
    './Icons/nuevoicon-192.png',
    './Icons/nuevoicon-512.png'
];

// Instalar
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activar
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch
self.addEventListener('fetch', (e) => {
    if (e.request.method !== 'GET') return;

    // SI ES UNA NAVEGACIÓN (Abrir la app o compartir un enlace):
    // Le decimos que vaya a internet. Si falla (o es una URL con ?url=...), cargará el index.html
    if (e.request.mode === 'navigate') {
        e.respondWith(
            fetch(e.request).catch(() => {
                return caches.match('./index.html');
            })
        );
        return;
    }

    // Para el resto de cosas (CSS, JS, fotos), usa la caché primero
    e.respondWith(
        caches.match(e.request).then((response) => {
            return response || fetch(e.request).then((networkResponse) => {
                if (networkResponse && networkResponse.status === 200) {
                    const responseClone = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(e.request, responseClone);
                    });
                }
                return networkResponse;
            }).catch(() => {
                return caches.match('./index.html');
            });
        })
    );
});

// Escuchar cuando le damos al botón de actualizar
self.addEventListener('message', (e) => {
    if (e.data === 'SKIP_WAITING') self.skipWaiting();
});
