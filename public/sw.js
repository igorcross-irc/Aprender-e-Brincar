// Troque VERSION a cada publicação que altere o shell para limpar caches antigos.
const VERSION = 'ab-0.7.0';
const SHELL = [
  '/',
  '/manifest.json',
  '/assets/images/icon-master.png',
  '/assets/images/icons/home.webp',
  '/assets/images/icons/settings.webp',
  '/assets/images/icons/listening.webp',
  '/assets/images/icons/star.webp',
  '/assets/images/icons/back.webp'
];
const SHELL_CACHE = VERSION + '-shell';
const RUNTIME_CACHE = VERSION + '-runtime';

// Guarda apenas respostas válidas; nunca um 404/500 ou um redirecionamento.
function cacheIfValid(request, response) {
  if (response && response.ok && !response.redirected && response.type === 'basic') {
    const copy = response.clone();
    caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy)).catch(() => {});
  }
  return response;
}

self.addEventListener('install', (event) => {
  // Um arquivo ausente não pode impedir a instalação do restante.
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then((cache) => Promise.allSettled(SHELL.map((url) => cache.add(url))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;
  const url = new URL(request.url);

  // Arquivos do build têm hash no nome: podem vir direto do cache.
  if (url.pathname.startsWith('/build/')) {
    event.respondWith(caches.match(request).then((cached) => cached || fetch(request).then((response) => cacheIfValid(request, response))));
    return;
  }

  // Áudios e imagens: responde do cache e atualiza em segundo plano.
  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const network = fetch(request).then((response) => cacheIfValid(request, response));
        if (cached) {
          event.waitUntil(network.catch(() => {}));
          return cached;
        }
        return network;
      })
    );
    return;
  }

  // Páginas e demais arquivos: rede primeiro, cache quando offline.
  event.respondWith(
    fetch(request)
      .then((response) => cacheIfValid(request, response))
      .catch(() => caches.match(request).then((cached) => cached || (request.mode === 'navigate' ? caches.match('/') : Response.error())))
  );
});
