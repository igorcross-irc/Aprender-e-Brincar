/** 
 * Motor de áudio do Aprender e Brincar.
 * Prioridade: MP3 próprio -> voz do navegador.
 * O motor também tenta localizar automaticamente um MP3 pelo texto curto,
 * o que evita depender de SpeechSynthesis para palavras e comandos já gravados.
 */
const AUDIO_BASE = '/assets/audio/';

export class ResilientAudioEngine {
  constructor() {
    this.isMuted = this.getSafeMuteState();
    this.speech = window.speechSynthesis || null;
    this.ctx = null;
    this.buffers = new Map();
    this.loading = new Map();
    this.missing = new Set();
    this.current = null;
    this.playToken = 0;
    this.installUnlock();
  }

  getSafeMuteState() {
    try { return localStorage.getItem('ab_muted') === 'true'; } catch (e) { return false; }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try { localStorage.setItem('ab_muted', String(this.isMuted)); } catch (e) {}
    if (this.isMuted) this.stop();
    return this.isMuted;
  }

  installUnlock() {
    const unlock = () => {
      const ctx = this.getContext();
      if (ctx?.state === 'suspended') ctx.resume().catch(() => {});
      try {
        if (!ctx) return;
        const buf = ctx.createBuffer(1, 1, 22050);
        const src = ctx.createBufferSource();
        src.buffer = buf;
        src.connect(ctx.destination);
        src.start(0);
      } catch (e) {}
    };
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach((evt) => window.addEventListener(evt, unlock, { once: true, passive: true }));
  }

  getContext() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    return this.ctx;
  }

  normalize(audioPath) {
    if (!audioPath) return null;
    const name = String(audioPath).split('/').pop();
    return name.endsWith('.mp3') ? name : `${name}.mp3`;
  }

  slugify(text) {
    return String(text || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  inferAudioName(text) {
    const value = String(text || '').trim();
    if (!value || value.length > 32 || value.includes('?')) return null;
    const slug = this.slugify(value);
    return slug ? `${slug}.mp3` : null;
  }

  async load(name) {
    if (this.buffers.has(name)) return this.buffers.get(name);
    if (this.missing.has(name)) return null;
    if (this.loading.has(name)) return this.loading.get(name);

    const ctx = this.getContext();
    if (!ctx) return null;

    const job = fetch(AUDIO_BASE + encodeURIComponent(name), { cache: 'force-cache' })
      .then((res) => {
        const type = res.headers.get('content-type') || '';
        if (!res.ok || type.includes('text/html')) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
      .then((buffer) => {
        this.buffers.set(name, buffer);
        return buffer;
      })
      .catch((err) => {
        this.missing.add(name);
        console.warn(`[áudio] MP3 indisponível: ${name}`, err.message || err);
        return null;
      })
      .finally(() => this.loading.delete(name));

    this.loading.set(name, job);
    return job;
  }

  preload(names = []) {
    [...new Set(names.map((n) => this.normalize(n)).filter(Boolean))].forEach((name) => this.load(name));
  }

  stop() {
    this.playToken += 1;
    if (this.current) {
      try { this.current.stop(); } catch (e) {}
      this.current = null;
    }
    try { this.speech?.cancel(); } catch (e) {}
  }

  async play(audioPath, fallbackText) {
    if (this.isMuted) return false;

    this.stop();
    const token = this.playToken;
    const explicitName = this.normalize(audioPath);
    const inferredName = explicitName ? null : this.inferAudioName(fallbackText);
    const name = explicitName || inferredName;

    if (name) {
      const ctx = this.getContext();
      if (ctx?.state === 'suspended') {
        try { await ctx.resume(); } catch (e) {}
      }
      const buffer = await this.load(name);
      if (token !== this.playToken) return false;
      if (buffer && ctx) {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(ctx.destination);
        src.onended = () => { if (this.current === src) this.current = null; };
        this.current = src;
        src.start(0);
        return true;
      }
    }

    if (token !== this.playToken) return false;
    this.speak(fallbackText);
    return false;
  }

  speak(text) {
    if (!text || !this.speech || this.isMuted) return;
    try {
      this.speech.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      const voices = this.speech.getVoices();
      const voice = voices.find((v) => v.lang?.toLowerCase().startsWith('pt-br')) || voices.find((v) => v.lang?.toLowerCase().startsWith('pt'));
      if (voice) utterance.voice = voice;
      this.speech.speak(utterance);
    } catch (e) {
      console.warn('Erro na síntese de voz:', e);
    }
  }
}
