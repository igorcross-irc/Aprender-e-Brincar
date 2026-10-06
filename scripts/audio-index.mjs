// Gera src/content/audio-files.js com a lista de MP3 existentes; roda antes do build.
import { readdirSync, writeFileSync } from 'node:fs';

const files = readdirSync('public/assets/audio').filter((name) => name.endsWith('.mp3')).sort();
const body = `// Gerado por scripts/audio-index.mjs — não editar à mão.\nexport const AUDIO_FILES = new Set(${JSON.stringify(files, null, 0).replace(/","/g, '", "')});\n`;
writeFileSync('src/content/audio-files.js', body);
console.log(`AUDIO INDEX — ${files.length} arquivos.`);

// Imagens do app (para o "Baixar para usar sem internet"). Sem as de design e sem as duplicatas PNG de aparelhos antigos.
import { readdirSync as ls, statSync as st } from 'node:fs';
import { join } from 'node:path';
const walk = (dir) => ls(dir).flatMap((name) => { const path = join(dir, name); return st(path).isDirectory() ? walk(path) : [path]; });
const images = walk('public/assets/images').filter((path) => /\.(webp|svg|png)$/.test(path) && !path.includes('/emoji/') && !path.endsWith('icon-master.png'))
  .map((path) => path.replace(/^public/, '')).sort();
writeFileSync('src/content/asset-files.js', `// Gerado por scripts/audio-index.mjs — não editar à mão.\nexport const IMAGE_FILES = ${JSON.stringify(images)};\n`);
console.log(`ASSET INDEX — ${images.length} imagens.`);
