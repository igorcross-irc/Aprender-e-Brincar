const VERSION = 'ab-0.3.1';
const SHELL = [
  '/',
  '/manifest.json',
  '/assets/images/icon-master.png',
  '/assets/images/icon-home.png',
  '/assets/images/icon-settings.png',
  '/assets/images/icon-numeros.png',
  '/assets/images/icon-animais.png',
  '/assets/images/icon-alfabeto.png',
  '/assets/images/icon-desenhos.png'
];
const SHELL_CACHE = VERSION + '-shell';
const RUNTIME_CACHE = VERSION + '-runtime';
// Áudios e imagens têm nome fixo (podem ser regravados/substituídos); os demais arquivos de /assets/ têm hash do Vite.
const MUTABLE_ASSET = /^\/assets\/(audio|images)\//;

const isCacheable = (response) => response && response.ok && response.type === 'basic';

// Os arquivos do build têm hash no nome, então são descobertos a partir do HTML publicado.
// Usa '/' e não '/index.html': com cleanUrls o Vercel redireciona /index.html, e resposta redirecionada não serve para navegação.
async function buildAssets() {
  try {
    const response = await fetch('/', { cache: 'no-store' });
    if (!response.ok) return [];
    const html = await response.text();
    return [...new Set([...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map((match) => match[1]))];
  } catch (error) {
    return [];
  }
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(async (cache) => {
        await cache.addAll(SHELL);
        await cache.addAll(await buildAssets());
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => ![SHELL_CACHE, RUNTIME_CACHE].includes(key)).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

function putInRuntime(request, response) {
  if (!isCacheable(response)) return;
  const copy = response.clone();
  caches.open(RUNTIME_CACHE).then((cache) => cache.put(request, copy));
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) return;
  const url = new URL(request.url);

  if (url.pathname.startsWith('/assets/')) {
    // Asset ausente nunca recebe o index.html no lugar: o erro chega ao fallback do app e às auditorias.
    if (MUTABLE_ASSET.test(url.pathname)) {
      event.respondWith(
        caches.match(request).then((cached) => {
          const network = fetch(request).then((response) => { putInRuntime(request, response); return response; });
          if (cached) { event.waitUntil(network.catch(() => {})); return cached; }
          return network.catch(() => Response.error());
        })
      );
      return;
    }
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request).then((response) => { putInRuntime(request, response); return response; }).catch(() => Response.error()))
    );
    return;
  }

  event.respondWith(
    fetch(request).then((response) => { putInRuntime(request, response); return response; })
      .catch(() => caches.match(request).then((cached) => cached || (request.mode === 'navigate' ? caches.match('/') : Response.error())))
  );
});
