// Backup e restauração do que fica no aparelho (progresso, perfil, tempo de tela…).
// Gera um código de texto que o responsável guarda ou cola em outro aparelho, e pede ao
// navegador para não apagar os dados sozinho. Nada sai do aparelho sem o responsável levar.
const APP_ID = 'aprender-e-brincar';
const VERSION = 1;

// Só entram dados das crianças e preferências. Nada de cache técnico nem sessão em andamento.
// Cada criança (perfil) tem as mesmas chaves com o sufixo do perfil (ver profiles.js).
import { PER_CHILD_KEYS, GLOBAL_KEYS, ProfileRegistry, keyFor, splitKey } from './profiles.js';
const TRANSIENT = new Set(['aprender_brincar_learning_session_v1']);
const PER_CHILD_BACKUP = PER_CHILD_KEYS.filter((key) => !TRANSIENT.has(key));
export const BACKUP_KEYS = Object.freeze([...PER_CHILD_BACKUP, ...GLOBAL_KEYS]);

export function isAllowedKey(key) {
  if (GLOBAL_KEYS.includes(key)) return true;
  const parts = splitKey(key);
  return Boolean(parts && !TRANSIENT.has(parts.base));
}

// Todas as chaves que existem agora para as crianças cadastradas.
function currentKeys(storage) {
  const ids = new ProfileRegistry(storage).list().map((profile) => profile.id);
  return [...GLOBAL_KEYS, ...ids.flatMap((id) => PER_CHILD_BACKUP.map((base) => keyFor(base, id)))];
}

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
  currentKeys(storage).forEach((key) => {
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
    Object.keys(parsed.data).forEach((key) => { if (isAllowedKey(key) && typeof parsed.data[key] === 'string') data[key] = parsed.data[key]; });
    return { ok: true, data, createdAt: parsed.createdAt || null };
  } catch {
    return { ok: false, error: 'Não consegui ler o código.' };
  }
}

export function restoreBackup(code, storage = window.localStorage) {
  const result = parseBackup(code);
  if (!result.ok) return result;
  currentKeys(storage).forEach((key) => { try { storage.removeItem(key); } catch {} });
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
