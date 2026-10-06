import { ageBandFromBirth, parseBirth } from '../core/age.js';

export class StorageManager {
  constructor() {
    this.SCORE_KEY = 'aprender_brincar_stars';
    this.CHILD_NAME_KEY = 'aprender_brincar_child_name';
    this.CHILD_AGE_KEY = 'aprender_brincar_child_age';
    this.CHILD_BIRTH_KEY = 'aprender_brincar_child_birth';
    this.AGE_IDS = ['6-12m', '12-18m', '18-24m', '2-3y', '3-4y', '4-5y'];
  }

  // Faixa etária escolhida pelo responsável; vazio enquanto o app não foi configurado.
  getChildAge() {
    // Com mês/ano de nascimento a faixa acompanha o crescimento sozinha.
    const fromBirth = ageBandFromBirth(this.getChildBirth());
    if (fromBirth) return fromBirth;
    try {
      const age = localStorage.getItem(this.CHILD_AGE_KEY);
      return this.AGE_IDS.includes(age) ? age : '';
    } catch { return ''; }
  }

  // 'AAAA-MM' ou vazio.
  getChildBirth() {
    try {
      const value = localStorage.getItem(this.CHILD_BIRTH_KEY) || '';
      return parseBirth(value) ? value : '';
    } catch { return ''; }
  }

  setChildBirth(value) {
    const clean = parseBirth(value) ? String(value) : '';
    try { if (clean) localStorage.setItem(this.CHILD_BIRTH_KEY, clean); else localStorage.removeItem(this.CHILD_BIRTH_KEY); } catch {}
    return clean;
  }

  setChildAge(ageId) {
    if (!this.AGE_IDS.includes(ageId)) return '';
    try { localStorage.setItem(this.CHILD_AGE_KEY, ageId); } catch {}
    return ageId;
  }

  getStars() {
    try {
      const value = parseInt(localStorage.getItem(this.SCORE_KEY) || '0', 10);
      return Number.isFinite(value) && value >= 0 ? value : 0;
    } catch { return 0; }
  }

  addStar() { return this.syncStars(this.getStars() + 1); }

  syncStars(value) {
    const safe = Math.max(0, Number.parseInt(value, 10) || 0);
    try { localStorage.setItem(this.SCORE_KEY, String(safe)); } catch {}
    return safe;
  }

  resetStars() { return this.syncStars(0); }

  getChildName() {
    try {
      const name = localStorage.getItem(this.CHILD_NAME_KEY);
      return name ? name.trim().slice(0, 15) : '';
    } catch { return ''; }
  }

  setChildName(name) {
    const clean = String(name || '').trim().slice(0, 15);
    try { localStorage.setItem(this.CHILD_NAME_KEY, clean); } catch {}
    return clean;
  }

  escapeHtml(str) {
    return String(str || '').replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
    }[m]));
  }
}