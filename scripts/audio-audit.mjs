import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const root = process.cwd();
const audio = readFileSync(resolve(root, 'src/js/engine/audio-engine.js'), 'utf8');
const catalog = readFileSync(resolve(root, 'src/content/activity-catalog.js'), 'utf8');

const requiredEngineTokens = ['inferAudioName', 'preload', 'diagnostics', 'speechSynthesis', 'pt-BR', 'encodeURIComponent'];
for (const token of requiredEngineTokens) {
  if (!audio.includes(token)) throw new Error('AUDIO AUDIT FAIL — engine sem ' + token);
}

const explicitPaths = [...catalog.matchAll(/audio:\s*'([^']+)'/g)].map((m) => m[1]).filter(Boolean);
const missing = explicitPaths.filter((name) => !existsSync(resolve(root, 'public/assets/audio', name)));
if (missing.length) {
  throw new Error('AUDIO AUDIT FAIL — ' + missing.length + ' arquivos declarados no catálogo não existem: ' + missing.slice(0, 10).join(', '));
}

if (!audio.includes('fetchArrayBuffer(AUDIO_BASE + encodeURIComponent(name))')) {
  throw new Error('AUDIO AUDIT FAIL — carregamento não usa caminho codificado');
}
if (!audio.includes('this.speech?.cancel()')) {
  throw new Error('AUDIO AUDIT FAIL — fala anterior não é cancelada');
}

console.log('AUDIO AUDIT OK — ' + explicitPaths.length + ' referências explícitas verificadas.');
