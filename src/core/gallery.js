import { captureStage } from '../engine/snapshot.js';

// Galeria de obras da criança: uma foto de cada coisa que ela termina (desenho vivo, prato servido, construção).
// Fica no IndexedDB do aparelho; só aparece na Área da Família e no Meu Livro. Guarda as últimas MAX obras.
const DB_NAME = 'ab_gallery';
const STORE = 'works';
const MAX = 40;

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('sem IndexedDB'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const tx = (db, mode) => db.transaction(STORE, mode).objectStore(STORE);
const wrap = (db, req) => new Promise((resolve, reject) => { req.onsuccess = () => { db.close(); resolve(req.result); }; req.onerror = () => { db.close(); reject(req.error); }; });

export const gallery = {
  async add({ kind, label, blob }) {
    const db = await openDb();
    const store = tx(db, 'readwrite');
    store.add({ kind, label, blob, at: Date.now() });
    await new Promise((resolve, reject) => { store.transaction.oncomplete = resolve; store.transaction.onerror = () => reject(store.transaction.error); });
    db.close();
    const all = await this.list();
    for (const old of all.slice(MAX)) await this.remove(old.id);
  },

  // Mais novas primeiro.
  async list() {
    const db = await openDb();
    const rows = await wrap(db, tx(db, 'readonly').getAll());
    return rows.sort((a, b) => b.at - a.at);
  },

  async remove(id) { const db = await openDb(); await wrap(db, tx(db, 'readwrite').delete(id)); },
  async clear() { const db = await openDb(); await wrap(db, tx(db, 'readwrite').clear()); },

  // Tira a foto da cena e guarda; qualquer falha é silenciosa. `alive()` evita guardar depois que o jogo fechou.
  async saveStage(app, kind, label, { crop = null, alive = () => true } = {}) {
    if (!app || !alive()) return false;
    const blob = await captureStage(app, { crop });
    if (!blob || !alive()) return false;
    try { await this.add({ kind, label, blob }); return true; } catch (error) { return false; }
  }
};
