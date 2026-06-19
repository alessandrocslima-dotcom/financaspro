const CACHE = 'financaspro-v3';
const ASSETS = [
  '/financaspro/',
  '/financaspro/index.html',
  'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting()) // ativa imediatamente sem esperar fechar
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim()) // assume controle de todas as abas
  );
});

self.addEventListener('fetch', e => {
  // Estratégia: network first, cache como fallback
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if(res && res.status === 200 && res.type !== 'opaque') {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
        }
        return res;
      })
      .catch(() => caches.match(e.request)
        .then(cached => cached || caches.match('/financaspro/index.html'))
      )
  );
});

// Notifica o app quando há uma nova versão instalada
self.addEventListener('message', e => {
  if(e.data === 'skipWaiting') self.skipWaiting();
});
