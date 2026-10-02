import { isNativeApp } from './core/native.js';

export function registerPWA() {
  // No app Android os arquivos já vêm dentro do pacote; cache do service worker só atrapalharia atualizações.
  if (!('serviceWorker' in navigator) || isNativeApp()) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('[PWA] registro falhou', error));
  });
}
