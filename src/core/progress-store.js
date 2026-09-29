const KEY = 'aprender_brincar_progress_v1';
const LEGACY_SCORE_KEY = 'aprender_brincar_stars';
const DEFAULT = { version: 3, stars: 0, activities: {}, worlds: {}, rewards: {}, updatedAt: null };

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const legacyStars = Number.parseInt(localStorage.getItem(LEGACY_SCORE_KEY) || '0', 10);
      return { ...structuredClone(DEFAULT), stars: Number.isFinite(legacyStars) && legacyStars > 0 ? legacyStars : 0 };
    }
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT), ...parsed, activities: parsed.activities || {}, worlds: parsed.worlds || {}, rewards: parsed.rewards || {} };
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
    current.level = Math.min(5, Math.max(1, current.completions + 1));
    current.explored = true;
    current.lastScore = Number.isFinite(extra.score) ? extra.score : current.lastScore || 0;
    this.state.activities[activityId] = current;
    this.persist();
    return current;
  }
  getActivity(activityId) { return this.state.activities[activityId] || null; }
  award(rewardId) { if (!rewardId) return false; if (this.state.rewards[rewardId]) return false; this.state.rewards[rewardId] = { earnedAt: new Date().toISOString() }; this.persist(); return true; }
  hasReward(rewardId) { return Boolean(this.state.rewards[rewardId]); }
  snapshot() { return structuredClone(this.state); }
}