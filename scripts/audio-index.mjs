// Gera src/content/audio-files.js com a lista de MP3 existentes; roda antes do build.
import { readdirSync, writeFileSync } from 'node:fs';

const files = readdirSync('public/assets/audio').filter((name) => name.endsWith('.mp3')).sort();
const body = `// Gerado por scripts/audio-index.mjs — não editar à mão.\nexport const AUDIO_FILES = new Set(${JSON.stringify(files, null, 0).replace(/","/g, '", "')});\n`;
writeFileSync('src/content/audio-files.js', body);
console.log(`AUDIO INDEX — ${files.length} arquivos.`);
