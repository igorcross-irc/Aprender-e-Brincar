// Portão para adultos da Área da Família: conta que uma criança pequena não resolve e
// bloqueio crescente depois de erros seguidos (30 s, 1 min, 2 min… até 10 min).
const KEY = 'ab_gate_guard';
const FREE_TRIES = 3;
const BASE_LOCK_MS = 30000;
const MAX_LOCK_MS = 10 * 60000;

// Multiplicação com números altos o bastante para quem ainda não tem tabuada de cor.
export function createChallenge(random = Math.random) {
  const a = 6 + Math.floor(random() * 7); // 6..12
  const b = 4 + Math.floor(random() * 6); // 4..9
  return { text: `${a} × ${b}`, answer: a * b };
}

export class GateGuard {
  constructor({ storage = window.localStorage, now = () => Date.now() } = {}) {
    this.storage = storage;
    this.now = now;
    this.state = this.read();
  }

  read() {
    try {
      const value = JSON.parse(this.storage.getItem(KEY) || 'null');
      if (value && typeof value === 'object') {
        return { fails: Math.max(0, Number(value.fails) || 0), lockedUntil: Math.max(0, Number(value.lockedUntil) || 0), rounds: Math.max(0, Number(value.rounds) || 0) };
      }
    } catch {}
    return { fails: 0, lockedUntil: 0, rounds: 0 };
  }

  save() { try { this.storage.setItem(KEY, JSON.stringify(this.state)); } catch {} }

  remainingMs() { return Math.max(0, this.state.lockedUntil - this.now()); }

  isLocked() { return this.remainingMs() > 0; }

  // Registra um erro; a partir do 3º seguido, bloqueia (cada bloqueio dura o dobro do anterior).
  fail() {
    this.state.fails += 1;
    if (this.state.fails >= FREE_TRIES) {
      const lock = Math.min(MAX_LOCK_MS, BASE_LOCK_MS * Math.pow(2, this.state.rounds));
      this.state.lockedUntil = this.now() + lock;
      this.state.rounds += 1;
      this.state.fails = 0;
    }
    this.save();
    return { locked: this.isLocked(), triesLeft: Math.max(0, FREE_TRIES - this.state.fails), remainingMs: this.remainingMs() };
  }

  success() {
    this.state = { fails: 0, lockedUntil: 0, rounds: 0 };
    this.save();
  }
}
