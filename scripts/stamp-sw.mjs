// Carimba o service worker do build com a versão + hash do conteúdo, para o cache antigo
// ser descartado sozinho a cada publicação (antes era preciso trocar VERSION à mão).
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const hash = createHash('sha1');
for (const name of readdirSync('dist/build').sort()) hash.update(name);
hash.update(readFileSync('dist/index.html'));
const stamp = `ab-${version}-${hash.digest('hex').slice(0, 8)}`;
const path = 'dist/sw.js';
const source = readFileSync(path, 'utf8');
if (!/const VERSION = '[^']*';/.test(source)) throw new Error('sw.js sem a linha "const VERSION"');
writeFileSync(path, source.replace(/const VERSION = '[^']*';/, `const VERSION = '${stamp}';`));
console.log(`SW — versão do cache: ${stamp}`);
