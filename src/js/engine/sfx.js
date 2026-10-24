// Efeitos sonoros sintetizados (sem arquivos): toque, acerto, nova tentativa e comemoração.
let engine = null;

const PATTERNS = {
  tap: [[880, 0, 0.06, 'sine', 0.08]],
  success: [[523.25, 0, 0.12, 'triangle', 0.18], [659.25, 0.1, 0.12, 'triangle', 0.18], [783.99, 0.2, 0.22, 'triangle', 0.2]],
  retry: [[392, 0, 0.12, 'sine', 0.12], [329.63, 0.12, 0.18, 'sine', 0.1]],
  pop: [[660, 0, 0.05, 'square', 0.06], [990, 0.03, 0.06, 'sine', 0.08]],
  celebrate: [[523.25, 0, 0.12, 'triangle', 0.16], [659.25, 0.1, 0.12, 'triangle', 0.16], [783.99, 0.2, 0.12, 'triangle', 0.16], [1046.5, 0.3, 0.35, 'triangle', 0.2], [1318.5, 0.42, 0.3, 'sine', 0.08]]
};

export function setSfxEngine(audioEngine) { engine = audioEngine; }

// Nota musical curta com timbre suave (piano de brinquedo).
export function playNote(freq, duration = 0.5) {
  if (!engine || engine.isMuted) return;
  const ctx = engine.getContext?.();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume?.().catch?.(() => {});
  const now = ctx.currentTime;
  try {
    const osc = ctx.createOscillator();
    const overtone = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    overtone.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);
    overtone.frequency.setValueAtTime(freq * 2, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.25, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(gain);
    overtone.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now); overtone.start(now);
    osc.stop(now + duration + 0.05); overtone.stop(now + duration + 0.05);
  } catch {}
}

// Instrumentos sintetizados para o Estúdio dos Bichos: bumbo, tambor, xilofone e sininho.
let noiseBuffer = null;
export function playInstrument(kind, freq = 440, volume = 1) {
  if (!engine || engine.isMuted) return;
  const ctx = engine.getContext?.();
  if (!ctx) return;
  if (ctx.state === 'suspended') ctx.resume?.().catch?.(() => {});
  const now = ctx.currentTime;
  const tone = (type, f, start, dur, peak, sweepTo) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f, now + start);
    if (sweepTo) osc.frequency.exponentialRampToValueAtTime(sweepTo, now + start + dur);
    gain.gain.setValueAtTime(0.0001, now + start);
    gain.gain.exponentialRampToValueAtTime(peak * volume, now + start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(now + start);
    osc.stop(now + start + dur + 0.03);
  };
  try {
    if (kind === 'kick') { tone('sine', 150, 0, 0.32, 0.9, 45); tone('triangle', 90, 0, 0.12, 0.3, 50); }
    else if (kind === 'snare') {
      if (!noiseBuffer) { noiseBuffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * 0.25), ctx.sampleRate); const d = noiseBuffer.getChannelData(0); for (let i = 0; i < d.length; i += 1) d[i] = Math.random() * 2 - 1; }
      const src = ctx.createBufferSource(); const hp = ctx.createBiquadFilter(); const gain = ctx.createGain();
      src.buffer = noiseBuffer; hp.type = 'highpass'; hp.frequency.value = 1800;
      gain.gain.setValueAtTime(0.5 * volume, now); gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      src.connect(hp).connect(gain).connect(ctx.destination); src.start(now); src.stop(now + 0.2);
      tone('triangle', 210, 0, 0.1, 0.35, 150);
    } else if (kind === 'xylo') { tone('sine', freq, 0, 0.45, 0.5); tone('sine', freq * 3, 0, 0.12, 0.18); }
    else { tone('sine', freq, 0, 0.9, 0.4); tone('sine', freq * 2.76, 0, 0.5, 0.16); tone('sine', freq * 5.4, 0, 0.2, 0.07); }
  } catch {}
}

export function playSfx(name = 'tap') {
  const pattern = PATTERNS[name];
  if (!pattern || !engine || engine.isMuted) return;
  const ctx = engine.getContext?.();
  if (!ctx || ctx.state === 'suspended') return;
  const now = ctx.currentTime;
  for (const [freq, start, duration, type, volume] of pattern) {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now + start);
      gain.gain.setValueAtTime(0.0001, now + start);
      gain.gain.exponentialRampToValueAtTime(volume, now + start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + duration);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + start);
      osc.stop(now + start + duration + 0.02);
    } catch {}
  }
}

// Um "toque" suave em qualquer botão dá retorno imediato ao dedo da criança.
export function installTapSounds(root = document) {
  root.addEventListener('pointerdown', (event) => {
    if (event.target.closest?.('button:not(:disabled):not([data-no-tap])')) playSfx('tap');
  }, { capture: true, passive: true });
}
