// Política de segurança de conteúdo (CSP) no index.html do build: só roda código e carrega mídia do
// próprio app. Os scripts embutidos que o Vite gera (suporte a aparelhos antigos) entram pelo hash.
// 'unsafe-inline' fica ao lado dos hashes: navegadores novos o ignoram (valem os hashes) e os muito
// antigos (iOS 9), que não entendem hash, continuam funcionando.
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';

const path = 'dist/index.html';
let html = readFileSync(path, 'utf8');
html = html.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>\s*/g, '');

const hashes = [...html.matchAll(/<script(?![^>]*\ssrc=)[^>]*>([\s\S]*?)<\/script>/g)]
  .map((match) => match[1])
  .filter((body) => body.trim())
  .map((body) => `'sha256-${createHash('sha256').update(body).digest('base64')}'`);

const policy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' ${[...new Set(hashes)].join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self' blob: data:",
  "connect-src 'self'",
  "worker-src 'self'",
  "manifest-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'none'"
].join('; ');

const meta = `<meta http-equiv="Content-Security-Policy" content="${policy}">`;
if (!/<head[^>]*>/.test(html)) throw new Error('index.html sem <head>');
html = html.replace(/<head[^>]*>/, (open) => `${open}\n  ${meta}`);
writeFileSync(path, html);
console.log(`CSP — ${new Set(hashes).size} scripts embutidos liberados por hash.`);
