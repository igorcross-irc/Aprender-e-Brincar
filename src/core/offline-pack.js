// "Baixar para usar sem internet": busca as falas e imagens uma vez para o service worker
// guardá-las. Funciona em lotes pequenos, mostra progresso e pode ser repetido (só baixa o que falta).
import { AUDIO_FILES } from '../content/audio-files.js';
import { IMAGE_FILES } from '../content/asset-files.js';

export function packUrls() {
  const audio = [...AUDIO_FILES].map((name) => `/assets/audio/${encodeURIComponent(name)}`);
  return [...IMAGE_FILES, ...audio];
}

async function isCached(url) {
  try { return Boolean(await caches.match(url)); } catch { return false; }
}

// Quantos arquivos já estão guardados e quantos faltam.
export async function packStatus(urls = packUrls()) {
  if (!('caches' in window)) return { supported: false, total: urls.length, cached: 0 };
  let cached = 0;
  for (const url of urls) { if (await isCached(url)) cached += 1; }
  return { supported: true, total: urls.length, cached };
}

export async function downloadPack({ onProgress = () => {}, signal = { cancelled: false }, concurrency = 4 } = {}) {
  const urls = packUrls();
  const pending = [];
  for (const url of urls) { if (!(await isCached(url))) pending.push(url); }
  let done = urls.length - pending.length;
  let failed = 0;
  onProgress({ done, total: urls.length, failed });
  let next = 0;
  const worker = async () => {
    while (next < pending.length && !signal.cancelled) {
      const url = pending[next]; next += 1;
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        await response.arrayBuffer(); // o service worker guarda a resposta ao passar por ele
        done += 1;
      } catch { failed += 1; }
      onProgress({ done, total: urls.length, failed });
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return { done, total: urls.length, failed, cancelled: Boolean(signal.cancelled) };
}

export async function storageEstimate() {
  try {
    if (!navigator.storage || !navigator.storage.estimate) return null;
    const { usage = 0, quota = 0 } = await navigator.storage.estimate();
    return { usageMb: Math.round(usage / 1048576), quotaMb: Math.round(quota / 1048576) };
  } catch { return null; }
}
