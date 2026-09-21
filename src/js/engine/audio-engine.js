/**
 * Motor de áudio do Aprender e Brincar.
 *
 * - Toca os arquivos mp3 de /assets/audio/ (Web Audio API: baixa uma vez,
 *   guarda decodificado na memória e toca sem atraso nos próximos toques).
 * - Se o mp3 não existir ou falhar, cai para a voz do navegador (speechSynthesis).
 * - Destrava o áudio no primeiro toque (exigência do Safari/iPhone e do Chrome).
 * - Só uma fala por vez: começar um som novo interrompe o anterior.
 */
const AUDIO_BASE = '/assets/audio/';

export class ResilientAudioEngine {
  constructor() {
    this.isMuted = this.getSafeMuteState();
    this.speech = window.speechSynthesis || null;
    this.ctx = null;
    this.buffers = new Map();   // nome do arquivo -> AudioBuffer já decodificado
    this.loading = new Map();   // nome do arquivo -> Promise em andamento
    this.missing = new Set();   // arquivos que falharam (não tenta de novo)
    this.current = null;        // fonte de áudio tocando agora
    this.playToken = 0;         // evita que um som atrasado atropele um mais novo

    this.installUnlock();
  }

  getSafeMuteState() {
    try {
      return localStorage.getItem('ab_muted') === 'true';
    } catch (e) {
      return false;
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('ab_muted', this.isMuted.toString());
    } catch (e) {}
    if (this.isMuted) this.stop();
    return this.isMuted;
  }

  // ---------- Destravar áudio no primeiro toque ----------
  installUnlock() {
    const unlock = () => {
      this.getContext();
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
      // Toca 1 frame de silêncio: é o que "abre" o áudio no iOS.
      try {
        const buf = this.ctx.createBuffer(1, 1, 22050);
        const src = this.ctx.createBufferSource();
        src.buffer = buf;
        src.connect(this.ctx.destination);
        src.start(0);
      } catch (e) {}
    };
    ['pointerdown', 'touchend', 'click', 'keydown'].forEach((evt) =>
      window.addEventListener(evt, unlock, { once: true, passive: true })
    );
  }

  getContext() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    }
    return this.ctx;
  }

  // ---------- Carregar mp3 ----------
  normalize(audioPath) {
    if (!audioPath) return null;
    const name = String(audioPath).split('/').pop();
    return name.endsWith('.mp3') ? name : `${name}.mp3`;
  }

  async load(name) {
    if (this.buffers.has(name)) return this.buffers.get(name);
    if (this.missing.has(name)) return null;
    if (this.loading.has(name)) return this.loading.get(name);

    const ctx = this.getContext();
    if (!ctx) return null;

    const job = fetch(AUDIO_BASE + encodeURIComponent(name))
      .then((res) => {
        const type = res.headers.get('content-type') || '';
        // Se o servidor devolver a página inicial (HTML) no lugar do mp3, é arquivo inexistente.
        if (!res.ok || type.includes('text/html')) throw new Error(`HTTP ${res.status}`);
        return res.arrayBuffer();
      })
      .then((data) => new Promise((resolve, reject) => ctx.decodeAudioData(data, resolve, reject)))
      .then((buffer) => {
        this.buffers.set(name, buffer);
        return buffer;
      })
      .catch((err) => {
        console.warn(`[áudio] não foi possível carregar ${name}:`, err.message || err);
        this.missing.add(name);
        return null;
      })
      .finally(() => this.loading.delete(name));

    this.loading.set(name, job);
    return job;
  }

  /** Baixa vários mp3 antes de precisar deles (ex.: ao abrir um jogo). */
  preload(names = []) {
    names.map((n) => this.normalize(n)).filter(Boolean).forEach((n) => this.load(n));
  }

  // ---------- Tocar ----------
  stop() {
    this.playToken++;
    if (this.current) {
      try { this.current.stop(); } catch (e) {}
      this.current = null;
    }
    if (this.speech) this.speech.cancel();
  }

  async play(audioPath, fallbackText) {
    if (this.isMuted) return;

    this.stop();
    const token = this.playToken;
    const name = this.normalize(audioPath);

    if (name) {
      const ctx = this.getContext();
      if (ctx && ctx.state === 'suspended') {
        try { await ctx.resume(); } catch (e) {}
      }
      const buffer = await this.load(name);
      if (token !== this.playToken) return;   // outro som começou enquanto carregava

      if (buffer && ctx) {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.connect(ctx.destination);
        src.onended = () => { if (this.current === src) this.current = null; };
        this.current = src;
        src.start(0);
        return;
      }
    }

    this.speak(fallbackText);
  }

  // ---------- Plano B: voz do navegador ----------
  speak(text) {
    if (!text || !this.speech) return;
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'pt-BR';
      utterance.rate = 0.85;
      utterance.pitch = 1.1;
      const voice = this.speech.getVoices().find((v) => v.lang && v.lang.toLowerCase().startsWith('pt-br'));
      if (voice) utterance.voice = voice;
      this.speech.speak(utterance);
    } catch (e) {
      console.warn('Erro na síntese de voz:', e);
    }
  }
}
