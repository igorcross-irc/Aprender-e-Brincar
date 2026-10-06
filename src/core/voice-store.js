// Gravações da voz da família ("Grave a sua voz"), guardadas só neste aparelho no IndexedDB.
// Nada é enviado a lugar nenhum; o microfone só liga enquanto o responsável segura a gravação.
const DB_NAME = 'ab_voice';
const STORE = 'clips';
const MAX_CLIPS = 60;
export const MAX_CLIP_MS = 6000;

export function voiceStoreSupported() {
  return typeof indexedDB !== 'undefined' && indexedDB !== null;
}

export function recordingSupported() {
  return Boolean(typeof navigator !== 'undefined' && navigator.mediaDevices && navigator.mediaDevices.getUserMedia && typeof window !== 'undefined' && window.MediaRecorder);
}

// Primeiro formato que o navegador sabe gravar (Chrome/Firefox: webm/ogg; Safari: mp4).
export function pickMimeType(isSupported = (type) => window.MediaRecorder?.isTypeSupported?.(type)) {
  const candidates = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg;codecs=opus', 'audio/ogg'];
  return candidates.find((type) => { try { return isSupported(type); } catch { return false; } }) || '';
}

function open() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function run(mode, work) {
  return open().then((db) => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    let result;
    tx.oncomplete = () => { db.close(); resolve(result); };
    tx.onerror = () => { db.close(); reject(tx.error); };
    tx.onabort = () => { db.close(); reject(tx.error); };
    work(tx.objectStore(STORE), (value) => { result = value; });
  }));
}

export class VoiceStore {
  constructor() { this.supported = voiceStoreSupported(); }

  async names() {
    if (!this.supported) return [];
    try { return await run('readonly', (store, set) => { const req = store.getAllKeys(); req.onsuccess = () => set(req.result.map(String)); }); }
    catch { return []; }
  }

  async get(name) {
    if (!this.supported) return null;
    try { return await run('readonly', (store, set) => { const req = store.get(name); req.onsuccess = () => set(req.result || null); }); }
    catch { return null; }
  }

  async put(name, blob) {
    if (!this.supported || !blob || !blob.size) return false;
    try {
      const names = await this.names();
      if (!names.includes(name) && names.length >= MAX_CLIPS) return false;
      await run('readwrite', (store) => { store.put({ blob, mime: blob.type || '', at: Date.now() }, name); });
      return true;
    } catch { return false; }
  }

  async remove(name) {
    if (!this.supported) return false;
    try { await run('readwrite', (store) => { store.delete(name); }); return true; } catch { return false; }
  }

  async clear() {
    if (!this.supported) return;
    try { await run('readwrite', (store) => { store.clear(); }); } catch {}
  }
}

// Gravação curta: devolve { stop() → Promise<Blob>, cancel() }. Para sozinha em MAX_CLIP_MS.
export async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
  const mimeType = pickMimeType();
  const recorder = new window.MediaRecorder(stream, mimeType ? { mimeType } : undefined);
  const chunks = [];
  let resolveStop;
  const finished = new Promise((resolve) => { resolveStop = resolve; });
  recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunks.push(event.data); };
  recorder.onstop = () => {
    stream.getTracks().forEach((track) => track.stop()); // o microfone desliga na hora
    resolveStop(new Blob(chunks, { type: recorder.mimeType || mimeType || 'audio/webm' }));
  };
  recorder.start();
  const timer = window.setTimeout(() => { if (recorder.state !== 'inactive') recorder.stop(); }, MAX_CLIP_MS);
  return {
    stop: () => { window.clearTimeout(timer); if (recorder.state !== 'inactive') recorder.stop(); return finished; },
    cancel: () => { window.clearTimeout(timer); chunks.length = 0; if (recorder.state !== 'inactive') recorder.stop(); },
    finished
  };
}
