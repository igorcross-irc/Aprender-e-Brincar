// Perfis de crianças (irmãos): cada criança tem o próprio progresso, estrelas, idade, favoritos
// e tempo de tela. O perfil 1 usa as chaves de sempre (sem sufixo), então quem já usava o app
// não perde nada. Os outros usam a chave + ":p2", ":p3"… Trocar de criança recarrega o app,
// e todo o resto lê as chaves da criança ativa já na partida (sem estado para sincronizar).
const REGISTRY_KEY = 'ab_profiles_v1';
export const MAX_PROFILES = 6;
export const AVATARS = Object.freeze(['🦉', '🐻', '🐰', '🦁', '🐼', '🐸']);

// Dados de cada criança.
export const PER_CHILD_KEYS = Object.freeze([
  'aprender_brincar_progress_v1',
  'aprender_brincar_progress_v1_backup',
  'aprender_brincar_stars',
  'aprender_brincar_child_name',
  'aprender_brincar_child_age',
  'aprender_brincar_child_birth',
  'aprender_brincar_screen_time_v1',
  'aprender_brincar_learning_session_v1',
  'learning_recent_v1',
  'ab_favorites'
]);

// Do aparelho/família (valem para todas as crianças).
export const GLOBAL_KEYS = Object.freeze([REGISTRY_KEY, 'ab_kid_lock', 'ab_muted']);

export const DEFAULT_ID = 'p1';

export function keyFor(base, id) {
  return !id || id === DEFAULT_ID ? base : `${base}:${id}`;
}

// 'aprender_brincar_progress_v1:p2' → { base, id }; chave desconhecida → null.
export function splitKey(key) {
  const match = /^(.*?)(?::(p\d+))?$/.exec(String(key));
  if (!match || !PER_CHILD_KEYS.includes(match[1])) return null;
  return { base: match[1], id: match[2] || DEFAULT_ID };
}

function fresh() { return { v: 1, active: DEFAULT_ID, profiles: [{ id: DEFAULT_ID, avatar: AVATARS[0] }] }; }

export class ProfileRegistry {
  constructor(storage = (typeof localStorage !== 'undefined' ? localStorage : null)) {
    this.storage = storage;
    this.state = this.read();
  }

  read() {
    try {
      const value = JSON.parse(this.storage.getItem(REGISTRY_KEY) || 'null');
      if (value && Array.isArray(value.profiles) && value.profiles.length) {
        const profiles = value.profiles.filter((p) => p && /^p\d+$/.test(p.id)).slice(0, MAX_PROFILES)
          .map((p) => ({ id: p.id, avatar: AVATARS.includes(p.avatar) ? p.avatar : AVATARS[0] }));
        if (profiles.length) {
          const active = profiles.some((p) => p.id === value.active) ? value.active : profiles[0].id;
          return { v: 1, active, profiles };
        }
      }
    } catch {}
    return fresh();
  }

  save() { try { this.storage.setItem(REGISTRY_KEY, JSON.stringify(this.state)); } catch {} }

  list() { return this.state.profiles.map((p) => ({ ...p })); }

  get activeId() { return this.state.active; }

  get count() { return this.state.profiles.length; }

  key(base, id = this.state.active) { return keyFor(base, id); }

  canAdd() { return this.state.profiles.length < MAX_PROFILES; }

  // Cria uma criança nova (sem ativá-la). Devolve o perfil ou null.
  add() {
    if (!this.canAdd()) return null;
    let n = 2;
    while (this.state.profiles.some((p) => p.id === `p${n}`)) n += 1;
    const used = new Set(this.state.profiles.map((p) => p.avatar));
    const avatar = AVATARS.find((a) => !used.has(a)) || AVATARS[(n - 1) % AVATARS.length];
    const profile = { id: `p${n}`, avatar };
    this.state.profiles.push(profile);
    this.save();
    return { ...profile };
  }

  setActive(id) {
    if (!this.state.profiles.some((p) => p.id === id)) return false;
    this.state.active = id;
    this.save();
    return true;
  }

  // Apaga a criança e todos os dados dela. Não deixa apagar a última.
  remove(id) {
    if (this.state.profiles.length <= 1 || !this.state.profiles.some((p) => p.id === id)) return false;
    PER_CHILD_KEYS.forEach((base) => { try { this.storage.removeItem(keyFor(base, id)); } catch {} });
    this.state.profiles = this.state.profiles.filter((p) => p.id !== id);
    if (this.state.active === id) this.state.active = this.state.profiles[0].id;
    this.save();
    return true;
  }

  // Resumo de cada criança para a tela "Quem vai brincar?" e a Área da Família.
  summaries() {
    const read = (base, id) => { try { return this.storage.getItem(keyFor(base, id)) || ''; } catch { return ''; } };
    return this.state.profiles.map((p) => {
      let stars = 0;
      try { stars = Number(JSON.parse(read('aprender_brincar_progress_v1', p.id) || '{}').stars) || Number(read('aprender_brincar_stars', p.id)) || 0; } catch {}
      return { ...p, name: read('aprender_brincar_child_name', p.id), age: read('aprender_brincar_child_age', p.id), birth: read('aprender_brincar_child_birth', p.id), stars };
    });
  }
}

// Registro compartilhado do app (a página sempre lê o mesmo localStorage).
let shared = null;
export function registry() {
  if (!shared) shared = new ProfileRegistry();
  return shared;
}
export function activeProfileId() { return registry().activeId; }
// Chave da criança ativa: use no lugar da chave fixa.
export function scoped(base) { return registry().key(base); }

// "Quem vai brincar?" aparece uma vez por abertura do app quando há mais de uma criança.
const CHOSEN_KEY = 'ab_who_chosen';
export function needsWhoPlays() {
  if (registry().count < 2) return false;
  try { return sessionStorage.getItem(CHOSEN_KEY) !== '1'; } catch { return false; }
}
export function markWhoChosen() { try { sessionStorage.setItem(CHOSEN_KEY, '1'); } catch {} }
