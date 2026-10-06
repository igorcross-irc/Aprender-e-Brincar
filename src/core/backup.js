// Backup e restauração do que fica no aparelho (progresso, perfil, tempo de tela…).
// Gera um código de texto que o responsável guarda ou cola em outro aparelho, e pede ao
// navegador para não apagar os dados sozinho. Nada sai do aparelho sem o responsável levar.
const APP_ID = 'aprender-e-brincar';
const VERSION = 1;

// Só estas chaves entram: dados da criança e preferências. Nada de cache técnico.
export const BACKUP_KEYS = Object.freeze([
  'aprender_brincar_progress_v1',
  'aprender_brincar_progress_v1_backup',
  'aprender_brincar_stars',
  'aprender_brincar_child_name',
  'aprender_brincar_child_age',
  'aprender_brincar_child_birth',
  'aprender_brincar_screen_time_v1',
  'learning_recent_v1',
  'ab_kid_lock',
  'ab_muted',
  'ab_favorites'
]);

// Soma de verificação simples (FNV-1a) para pegar código copiado pela metade.
export function checksum(text) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = (hash * 0x01000193) >>> 0;
  }
  return hash.toString(16);
}

const utf8ToB64 = (text) => btoa(unescape(encodeURIComponent(text)));
const b64ToUtf8 = (b64) => decodeURIComponent(escape(atob(b64)));

export function createBackup(storage = window.localStorage, now = () => new Date()) {
  const data = {};
  BACKUP_KEYS.forEach((key) => {
    try { const value = storage.getItem(key); if (value != null) data[key] = value; } catch {}
  });
  const body = JSON.stringify({ app: APP_ID, version: VERSION, createdAt: now().toISOString(), data });
  return `AEB1.${checksum(body)}.${utf8ToB64(body)}`;
}

// Lê e confere o código; devolve { ok, data, createdAt } ou { ok:false, error }.
export function parseBackup(code) {
  try {
    const parts = String(code || '').trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'AEB1') return { ok: false, error: 'Código inválido.' };
    const body = b64ToUtf8(parts[2]);
    if (checksum(body) !== parts[1]) return { ok: false, error: 'O código está incompleto ou foi alterado.' };
    const parsed = JSON.parse(body);
    if (!parsed || parsed.app !== APP_ID || typeof parsed.data !== 'object' || !parsed.data) return { ok: false, error: 'Este código não é do Aprender & Brincar.' };
    const data = {};
    BACKUP_KEYS.forEach((key) => { if (typeof parsed.data[key] === 'string') data[key] = parsed.data[key]; });
    return { ok: true, data, createdAt: parsed.createdAt || null };
  } catch {
    return { ok: false, error: 'Não consegui ler o código.' };
  }
}

export function restoreBackup(code, storage = window.localStorage) {
  const result = parseBackup(code);
  if (!result.ok) return result;
  BACKUP_KEYS.forEach((key) => { try { storage.removeItem(key); } catch {} });
  Object.keys(result.data).forEach((key) => { try { storage.setItem(key, result.data[key]); } catch {} });
  return { ok: true, restored: Object.keys(result.data).length, createdAt: result.createdAt };
}

// Pede ao navegador para não limpar os dados do site quando faltar espaço (ou o Safari "esquecer" o site).
export async function requestPersistence() {
  try {
    if (!navigator.storage || !navigator.storage.persist) return 'unsupported';
    if (navigator.storage.persisted && await navigator.storage.persisted()) return 'granted';
    return (await navigator.storage.persist()) ? 'granted' : 'denied';
  } catch { return 'unsupported'; }
}
