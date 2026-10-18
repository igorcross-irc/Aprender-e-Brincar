// Cartões de comunicação da família: foto de verdade (a mamadeira, o cachorro, a vovó) e a voz de quem a criança conhece.
// Ficam no IndexedDB do aparelho. Um cartão pode trocar a figura e a voz de um cartão padrão (mesmo id) ou ser um cartão novo (id "c-…").
const DB_NAME = 'ab_comm_cards';
const STORE = 'cards';

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('sem IndexedDB'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}
const done = (db, req) => new Promise((resolve, reject) => { req.onsuccess = () => { db.close(); resolve(req.result); }; req.onerror = () => { db.close(); reject(req.error); }; });

export const commCards = {
  async list() { try { const db = await openDb(); return await done(db, db.transaction(STORE).objectStore(STORE).getAll()); } catch (error) { return []; } },
  async get(id) { const db = await openDb(); return done(db, db.transaction(STORE).objectStore(STORE).get(id)); },
  // Guarda o cartão inteiro (junta com o que já existe para não perder foto ou voz ao mudar só um deles).
  async save(card) {
    const old = (await this.get(card.id).catch(() => null)) || {};
    const db = await openDb();
    return done(db, db.transaction(STORE, 'readwrite').objectStore(STORE).put({ ...old, ...card, at: Date.now() }));
  },
  async remove(id) { const db = await openDb(); return done(db, db.transaction(STORE, 'readwrite').objectStore(STORE).delete(id)); },
  newId() { return `c-${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`; }
};

// Foto escolhida/tirada → JPEG quadrado de até 240 px (leve e sem dados da câmera, como localização).
export async function resizePhoto(file, size = 240) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((resolve, reject) => { const i = new Image(); i.onload = () => resolve(i); i.onerror = reject; i.src = url; });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const canvas = document.createElement('canvas');
    canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, size, size);
    ctx.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, size, size);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/jpeg', 0.8));
  } finally { URL.revokeObjectURL(url); }
}

// Junta os cartões padrão com os da família: troca figura/voz dos padrão e acrescenta os novos. Devolve cartões com photoUrl/voiceUrl.
export async function mergeCards(defaults) {
  const mine = await commCards.list();
  const byId = new Map(mine.map((c) => [c.id, c]));
  const urls = [];
  const url = (blob) => { if (!blob) return null; const u = URL.createObjectURL(blob); urls.push(u); return u; };
  const withMine = (card) => { const m = byId.get(card.id); return { ...card, ...(m ? { label: m.label || card.label, phrase: m.phrase || card.phrase } : {}), photoUrl: url(m?.photo), voiceUrl: url(m?.voice), custom: false }; };
  const cards = defaults.map(withMine);
  mine.filter((c) => c.id.startsWith('c-')).sort((a, b) => a.at - b.at).forEach((c) => cards.push({ id: c.id, icon: '⭐', label: c.label || 'Cartão', phrase: c.phrase || c.label || '', photoUrl: url(c.photo), voiceUrl: url(c.voice), custom: true }));
  return { cards, release: () => urls.forEach((u) => URL.revokeObjectURL(u)) };
}
