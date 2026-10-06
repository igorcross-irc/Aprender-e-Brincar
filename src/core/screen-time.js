// Tempo de tela diário: conta só enquanto o app está visível e guarda os últimos 14 dias no aparelho.
const KEY = 'aprender_brincar_screen_time_v1';
const TICK_MS = 15000;
const KEEP_DAYS = 14;
export const SCREEN_TIME_OPTIONS = [0, 15, 20, 30, 45, 60];

function today(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Limite padrão por idade, para o responsável não precisar configurar nada.
// A Sociedade Brasileira de Pediatria e a OMS desaconselham telas antes dos 2 anos e
// sugerem até 1 hora por dia dos 2 aos 5; o app fica bem abaixo disso por padrão.
export const DEFAULT_LIMITS = Object.freeze({ '6-12m': 10, '12-18m': 10, '18-24m': 15, '2-3y': 30, '3-4y': 40, '4-5y': 45 });

export function defaultLimitFor(ageId) { return DEFAULT_LIMITS[ageId] || 30; }

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (value && typeof value === 'object') {
      const state = { days: {}, extraMinutes: {}, ...value };
      // Versões antigas guardavam 0 ("sem limite") sem o responsável ter escolhido: volta ao padrão por idade.
      if (!state.explicit) state.limitMinutes = null;
      return state;
    }
  } catch {}
  return { limitMinutes: null, explicit: false, days: {}, extraMinutes: {} };
}

export class ScreenTime {
  constructor({ ageProvider = () => '' } = {}) {
    this.ageProvider = ageProvider;
    this.state = read();
    this.timer = null;
    this.listeners = new Set();
  }

  persist() {
    const keep = Object.keys(this.state.days).sort().slice(-KEEP_DAYS);
    this.state.days = Object.fromEntries(keep.map((day) => [day, this.state.days[day]]));
    this.state.extraMinutes = { [today()]: this.state.extraMinutes?.[today()] || 0 };
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch {}
  }

  start() {
    if (this.timer) return;
    this.timer = window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      const day = today();
      this.state.days[day] = (this.state.days[day] || 0) + TICK_MS;
      this.persist();
      if (this.isOverLimit()) this.listeners.forEach((listener) => listener());
    }, TICK_MS);
  }

  onLimit(listener) { this.listeners.add(listener); }

  // True quando o responsável escolheu um valor; senão vale o padrão da idade.
  get isCustom() { return Boolean(this.state.explicit) && this.state.limitMinutes != null; }

  get limitMinutes() {
    if (this.isCustom) return Number(this.state.limitMinutes) || 0;
    return defaultLimitFor(this.ageProvider());
  }

  setLimit(minutes) {
    this.state.limitMinutes = SCREEN_TIME_OPTIONS.includes(Number(minutes)) ? Number(minutes) : defaultLimitFor(this.ageProvider());
    this.state.explicit = true;
    this.persist();
  }

  useDefaultLimit() {
    this.state.limitMinutes = null;
    this.state.explicit = false;
    this.persist();
  }

  minutesToday() { return Math.floor((this.state.days[today()] || 0) / 60000); }

  allowedToday() { return this.limitMinutes + (Number(this.state.extraMinutes?.[today()]) || 0); }

  isOverLimit() { return this.limitMinutes > 0 && this.minutesToday() >= this.allowedToday(); }

  addExtraMinutes(minutes = 10) {
    const day = today();
    this.state.extraMinutes = { [day]: (Number(this.state.extraMinutes?.[day]) || 0) + minutes };
    this.persist();
  }

  // Minutos por dia dos últimos 7 dias, do mais antigo ao mais recente.
  lastDays(count = 7) {
    return Array.from({ length: count }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (count - 1 - index));
      const key = today(date);
      return { day: key, label: date.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', ''), minutes: Math.floor((this.state.days[key] || 0) / 60000) };
    });
  }
}
