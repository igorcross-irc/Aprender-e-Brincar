// Voz da família: pai, mãe ou avó gravam a narração das histórias no próprio aparelho.
// Os áudios ficam no IndexedDB (nada sai do aparelho) e o leitor prefere a voz da família à voz padrão.
const DB_NAME = 'ab_family_voice';
const STORE = 'clips';
const WHO_KEY = 'ab_family_voice_who';
const OFF_KEY = 'ab_family_voice_off';

const key = (storyId, page) => `${storyId}:${page}`;

function openDb() {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') return reject(new Error('sem IndexedDB'));
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function run(mode, fn) {
  return openDb().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const out = fn(tx.objectStore(STORE));
    tx.oncomplete = () => { db.close(); resolve(out && 'result' in out ? out.result : undefined); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
  }));
}

export const familyVoice = {
  // Gravar precisa de microfone e MediaRecorder; aparelhos muito antigos só tocam o que já existe.
  canRecord() {
    return typeof MediaRecorder !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof indexedDB !== 'undefined';
  },
  canPlay() { return typeof indexedDB !== 'undefined'; },

  who() { try { return localStorage.getItem(WHO_KEY) || ''; } catch (error) { return ''; } },
  setWho(name) { try { localStorage.setItem(WHO_KEY, String(name || '').slice(0, 20)); } catch (error) { /* sem armazenamento */ } },
  enabled() { try { return localStorage.getItem(OFF_KEY) !== '1'; } catch (error) { return true; } },
  setEnabled(on) { try { if (on) localStorage.removeItem(OFF_KEY); else localStorage.setItem(OFF_KEY, '1'); } catch (error) { /* sem armazenamento */ } },

  async save(storyId, page, blob) {
    await run('readwrite', (s) => s.put({ blob, type: blob.type, at: Date.now() }, key(storyId, page)));
  },
  async remove(storyId, page) { await run('readwrite', (s) => s.delete(key(storyId, page))); },
  async removeStory(storyId, pages) { for (let p = 0; p < pages; p += 1) await this.remove(storyId, p); },
  async clear() { await run('readwrite', (s) => s.clear()); },

  async get(storyId, page) {
    return openDb().then((db) => new Promise((resolve, reject) => {
      const req = db.transaction(STORE, 'readonly').objectStore(STORE).get(key(storyId, page));
      req.onsuccess = () => { db.close(); resolve(req.result || null); };
      req.onerror = () => { db.close(); reject(req.error); };
    }));
  },

  // Quais páginas de uma história já têm gravação: { 0: true, 2: true }.
  async pagesWithClips(storyId, pages) {
    const found = {};
    try { for (let p = 0; p < pages; p += 1) { if (await this.get(storyId, p)) found[p] = true; } } catch (error) { /* sem gravações */ }
    return found;
  },

  // Endereços tocáveis das páginas gravadas { página: blobUrl } — vazio se o responsável desligou a voz da família.
  async urlsFor(storyId, pages) {
    if (!this.enabled() || !this.canPlay()) return {};
    const urls = {};
    try {
      for (let p = 0; p < pages; p += 1) {
        const clip = await this.get(storyId, p);
        if (clip?.blob) urls[p] = URL.createObjectURL(clip.blob);
      }
    } catch (error) { /* sem gravações */ }
    return urls;
  },

  // Quantas histórias têm ao menos uma página gravada (para o diário).
  async countStories(storyIds) {
    let n = 0;
    for (const id of storyIds) { try { if (await this.get(id, 0)) n += 1; } catch (error) { break; } }
    return n;
  }
};

// Grava do microfone até stop(); devolve { stop(): Promise<Blob>, cancel() }.
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'];
  const mime = types.find((t) => typeof MediaRecorder.isTypeSupported === 'function' && MediaRecorder.isTypeSupported(t)) || '';
  const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = (e) => { if (e.data && e.data.size) chunks.push(e.data); };
  const release = () => stream.getTracks().forEach((t) => t.stop());
  rec.start();
  return {
    stop: () => new Promise((resolve) => { rec.onstop = () => { release(); resolve(new Blob(chunks, { type: rec.mimeType || mime || 'audio/webm' })); }; rec.stop(); }),
    cancel: () => { try { rec.onstop = null; rec.stop(); } catch (error) { /* já parou */ } release(); }
  };
}
