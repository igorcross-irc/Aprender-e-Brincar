const KEY = 'aprender_brincar_progress_v1';
const DAY_MS = 86400000;
const LEGACY_SCORE_KEY = 'aprender_brincar_stars';
import { normalizeExperienceResult, getAccuracy } from './experience-result.js';
const DEFAULT = { version: 5, stars: 0, activities: {}, worlds: {}, rewards: {}, sessions: { total: 0, streak: 0, lastDay: null, activities: 0, lastSessionAt: null }, updatedAt: null };

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const legacyStars = Number.parseInt(localStorage.getItem(LEGACY_SCORE_KEY) || '0', 10);
      return { ...structuredClone(DEFAULT), stars: Number.isFinite(legacyStars) && legacyStars > 0 ? legacyStars : 0 };
    }
    const parsed = JSON.parse(raw);
    return { ...structuredClone(DEFAULT), ...parsed, activities: parsed.activities || {}, worlds: parsed.worlds || {}, rewards: parsed.rewards || {}, sessions: parsed.sessions || structuredClone(DEFAULT.sessions) };
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
    const current = this.state.activities[activityId] || { completions: 0, bestScore: 0, attempts: 0, correct: 0, mastery: 0 };
    const result = normalizeExperienceResult(extra);
    const accuracy = getAccuracy(result);

    if (result.mode === 'evaluate') {
      current.attempts += result.attempts;
      current.correct += Math.min(result.correct, result.attempts);
      current.mastery = Math.min(5, Math.round(((current.correct / Math.max(1,current.attempts)) * 5) * 10) / 10);
      const history = Array.isArray(current.accuracyHistory) ? current.accuracyHistory.slice(-7) : [];
      if (accuracy != null) history.push(accuracy);
      current.accuracyHistory = history;
      current.recentAccuracy = history.length ? Math.round(history.reduce((sum, value) => sum + Number(value || 0), 0) / history.length) : null;
      current.lastEvaluationAt = new Date().toISOString();
    }

    current.completions += 1;
    if (Number.isFinite(result.score)) current.bestScore = Math.max(current.bestScore, result.score);
    current.lastPlayedAt = new Date().toISOString();
    current.level = result.mode === 'evaluate' ? Math.min(5, Math.max(1, Math.round(current.mastery) + 1)) : Math.max(1, Number(current.level || 1));
    current.explored = true;
    current.explorationCount = Number(current.explorationCount || 0) + (result.mode === 'explore' ? 1 : 0);
    current.evaluationCount = Number(current.evaluationCount || 0) + (result.mode === 'evaluate' ? 1 : 0);
    current.lastScore = result.score;
    current.lastRounds = result.rounds;
    current.lastAttempts = result.attempts;
    current.lastCorrect = result.correct;
    current.lastMaxScore = result.maxScore;
    current.lastCompletedRounds = result.completedRounds;
    current.lastAssistance = result.assistance;
    current.lastDurationMs = result.durationMs;
    current.lastDifficulty = result.difficulty;
    current.accuracy = result.mode === 'evaluate' ? accuracy : (current.recentAccuracy ?? null);
    current.performance = result.mode === 'evaluate' ? (current.accuracy >= 85 ? 'advance' : current.accuracy >= 60 ? 'practice' : 'support') : 'explore';
    current.lastMode = result.mode;

    const now = new Date();
    const day = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
    const previous = this.state.sessions.lastDay;
    if (previous !== day) {
      const prevDate = previous ? new Date(`${previous}T00:00:00`) : null;
      const todayDate = new Date(`${day}T00:00:00`);
      const diff = prevDate ? Math.round((todayDate-prevDate)/DAY_MS) : 0;
      this.state.sessions.streak = diff === 1 ? this.state.sessions.streak + 1 : 1;
      this.state.sessions.lastDay = day;
    }
    this.state.sessions.total += 1;
    this.state.sessions.activities = Number(this.state.sessions.activities || 0) + 1;
    this.state.sessions.explorations = Number(this.state.sessions.explorations || 0) + (result.mode === 'explore' ? 1 : 0);
    this.state.sessions.evaluations = Number(this.state.sessions.evaluations || 0) + (result.mode === 'evaluate' ? 1 : 0);
    this.state.sessions.lastSessionAt = current.lastPlayedAt;
    this.state.activities[activityId] = current;
    this.persist();
    return current;
  }
  getActivity(activityId) { return this.state.activities[activityId] || null; }
  award(rewardId) { if (!rewardId) return false; if (this.state.rewards[rewardId]) return false; this.state.rewards[rewardId] = { earnedAt: new Date().toISOString() }; this.persist(); return true; }
  hasReward(rewardId) { return Boolean(this.state.rewards[rewardId]); }
  snapshot() { return structuredClone(this.state); }
}