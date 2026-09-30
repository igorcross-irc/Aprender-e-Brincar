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

function read() {
  try {
    const value = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (value && typeof value === 'object') return { limitMinutes: 0, days: {}, extraMinutes: {}, ...value };
  } catch {}
  return { limitMinutes: 0, days: {}, extraMinutes: {} };
}

export class ScreenTime {
  constructor() {
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

  get limitMinutes() { return Number(this.state.limitMinutes) || 0; }

  setLimit(minutes) {
    this.state.limitMinutes = SCREEN_TIME_OPTIONS.includes(Number(minutes)) ? Number(minutes) : 0;
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
