#!/usr/bin/env node
// Impressão digital da parte nativa do app Android (código Java, manifest, gradle,
// configuração e versões dos plugins Capacitor). Vai para public/native.json e,
// com o build, para dentro do APK.
//
// Uma atualização de conteúdo (OTA) só é aplicada se a impressão digital dela for
// igual à do APK instalado; se a parte nativa mudou, o app pede o APK novo.
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const files = [];
const walk = (dir) => {
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else files.push(path);
  }
};
walk('android/app/src/main/java');
['android/app/src/main/AndroidManifest.xml', 'android/app/build.gradle', 'android/build.gradle', 'android/variables.gradle', 'capacitor.config.json']
  .filter(existsSync)
  .forEach((path) => files.push(path));

const hash = createHash('sha256');
for (const path of files) hash.update(path).update('\0').update(readFileSync(path)).update('\0');

// Versões instaladas dos plugins nativos.
const lock = existsSync('package-lock.json') ? JSON.parse(readFileSync('package-lock.json', 'utf8')) : { packages: {} };
Object.entries(lock.packages || {})
  .filter(([name]) => /^node_modules\/@(capacitor|capgo)\//.test(name))
  .sort(([a], [b]) => a.localeCompare(b))
  .forEach(([name, info]) => hash.update(`${name}@${info.version}\n`));

const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
const fingerprint = hash.digest('hex').slice(0, 16);
writeFileSync('public/native.json', `${JSON.stringify({ version, fingerprint }, null, 2)}\n`);
console.log(`NATIVE — impressão digital ${fingerprint} (versão ${version}).`);
