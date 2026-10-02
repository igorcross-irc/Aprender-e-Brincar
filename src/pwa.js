import { Capacitor } from '@capacitor/core';

export function registerPWA() {
  // No app Android os arquivos já vêm dentro do pacote; cache do service worker só atrapalharia atualizações.
  if (!('serviceWorker' in navigator) || Capacitor.isNativePlatform()) return;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => console.warn('[PWA] registro falhou', error));
  });
}
