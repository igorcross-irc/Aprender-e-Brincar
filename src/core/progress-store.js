const KEY = 'aprender_brincar_progress_v1';
const LEGACY_SCORE_KEY = 'aprender_brincar_stars';
const DEFAULT = { version: 1, stars: 0, activities: {}, updatedAt: null };

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const legacyStars = Number.parseInt(localStorage.getItem(LEGACY_SCORE_KEY) || '0', 10);
      return { ...structuredClone(DEFAULT), stars: Number.isFinite(legacyStars) && legacyStars > 0 ? legacyStars : 0 };
    }
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT), ...parsed, activities: parsed.activities || {} };
  } catch { return structuredClone(DEFAULT); }
}

export class ProgressStore {
  constructor() { this.state = read(); }
  persist() {
    this.state.updatedAt = new Date().toISOString();
    try { localStorage.setItem(KEY, JSON.stringify(this.state)); } catch {}
    return this.state;
  }
  getStars() { return Number.isFinite(this.state.stars) && this.state.stars >= 0 ? this.state.stars : 0; }
  addStar() { this.state.stars = this.getStars() + 1; this.persist(); return this.state.stars; }
  reset() { this.state = structuredClone(DEFAULT); this.persist(); return this.state; }
  complete(activityId, extra = {}) {
    if (!activityId) return null;
    const current = this.state.activities[activityId] || { completions: 0, bestScore: 0 };
    current.completions += 1;
    if (Number.isFinite(extra.score)) current.bestScore = Math.max(current.bestScore, extra.score);
    current.lastPlayedAt = new Date().toISOString();
    this.state.activities[activityId] = current;
    this.persist();
    return current;
  }
  getActivity(activityId) { return this.state.activities[activityId] || null; }
  snapshot() { return structuredClone(this.state); }
}