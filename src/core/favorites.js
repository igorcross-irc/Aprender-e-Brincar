// Favoritos da criança (inspirado nos "Favoritos" do Escola Games): ela toca no ❤️ no fim da
// brincadeira e a brincadeira ganha um atalho na tela inicial. Guardado só no aparelho.
import { scoped } from './profiles.js';
const KEY = scoped('ab_favorites');
const MAX = 12;

export class Favorites {
  constructor({ storage = window.localStorage, isValid = () => true } = {}) {
    this.storage = storage;
    this.isValid = isValid;
  }

  list() {
    try {
      const value = JSON.parse(this.storage.getItem(KEY) || '[]');
      return Array.isArray(value) ? value.filter((id) => typeof id === 'string' && this.isValid(id)).slice(0, MAX) : [];
    } catch { return []; }
  }

  has(id) { return this.list().includes(id); }

  // Liga/desliga; ao passar de 12 sai o mais antigo. Devolve se agora é favorito.
  toggle(id) {
    if (!id || !this.isValid(id)) return false;
    const current = this.list();
    const next = current.includes(id) ? current.filter((item) => item !== id) : [id, ...current].slice(0, MAX);
    try { this.storage.setItem(KEY, JSON.stringify(next)); } catch {}
    return next.includes(id);
  }
}
