import { scoped } from './profiles.js';
const KEY = scoped('aprender_brincar_progress_v1');
const BACKUP_KEY = scoped('aprender_brincar_progress_v1_backup');
const DAY_MS = 86400000;
const HISTORY_LIMIT = 30;
const LEGACY_SCORE_KEY = scoped('aprender_brincar_stars');
import { normalizeExperienceResult, getAccuracy } from './experience-result.js';
import { sanitizeProgressState } from './experience-health.js';
const DEFAULT = { version: 8, stars: 0, activities: {}, worlds: {}, rewards: {}, history: [], sessions: { total: 0, streak: 0, lastDay: null, activities: 0, explorations: 0, evaluations: 0, totalDurationMs: 0, lastDurationMs: 0, lastSessionAt: null }, updatedAt: null };

function parseStored(raw) { try { return raw ? JSON.parse(raw) : null; } catch { return null; } }

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      const legacyStars = Number.parseInt(localStorage.getItem(LEGACY_SCORE_KEY) || '0', 10);
      return sanitizeProgressState({ ...structuredClone(DEFAULT), stars: Number.isFinite(legacyStars) && legacyStars > 0 ? legacyStars : 0 }, DEFAULT);
    }
    const parsed = parseStored(raw);
    if (parsed) return sanitizeProgressState(parsed, DEFAULT);
    const backup = parseStored(localStorage.getItem(BACKUP_KEY));
    if (backup) {
      const recovered = sanitizeProgressState(backup, DEFAULT);
      try { localStorage.setItem(KEY, JSON.stringify(recovered)); } catch {}
      return recovered;
    }
    return structuredClone(DEFAULT);
  } catch { return structuredClone(DEFAULT); }
}

export class ProgressStore {
  constructor() { this.state = read(); }
  persist(previous = null) {
    this.state.updatedAt = new Date().toISOString();
    try {
      const existing = localStorage.getItem(KEY);
      if (existing) { try { localStorage.setItem(BACKUP_KEY, existing); } catch {} }
      localStorage.setItem(KEY, JSON.stringify(this.state));
      return true;
    } catch {
      if (previous) this.state = previous;
      return false;
    }
  }
  getStars() { return Number.isFinite(this.state.stars) && this.state.stars >= 0 ? this.state.stars : 0; }
  addStar() { const previous = structuredClone(this.state); this.state.stars = this.getStars() + 1; this.persist(previous); return this.state.stars; }
  reset() { this.state = structuredClone(DEFAULT); this.persist(); return this.state; }
  getHistory(limit = 10) { return Array.isArray(this.state.history) ? this.state.history.slice(0, Math.max(0, Number(limit) || 0)) : []; }
  getRecentHistory(limit = 10) { return this.getHistory(limit).map((item) => ({ ...item, activityId: String(item.activityId || ''), accuracy: item.accuracy == null ? null : Math.max(0, Math.min(100, Number(item.accuracy))), completedAt: item.completedAt || null })); }
  complete(activityId, extra = {}) {
    if (!activityId) return null;
    const current = this.state.activities[activityId] || { completions: 0, bestScore: 0, attempts: 0, correct: 0, mastery: 0 };
    const result = normalizeExperienceResult(extra);
    const accuracy = getAccuracy(result);

    if (result.mode === 'evaluate') {
      current.attempts += result.attempts;
      current.correct += Math.min(result.correct, result.attempts);
      const history = Array.isArray(current.accuracyHistory) ? current.accuracyHistory.slice(-7) : [];
      if (accuracy != null) history.push(accuracy);
      current.accuracyHistory = history;
      current.recentAccuracy = history.length ? Math.round(history.reduce((sum, value) => sum + Number(value || 0), 0) / history.length) : null;
      current.mastery = current.recentAccuracy == null ? 0 : Math.round((current.recentAccuracy / 20) * 10) / 10;
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
    const day = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,"0")}-${String(now.getDate()).padStart(2,"0")}`;
    const previous = this.state.sessions.lastDay;
    if (previous !== day) {
      const prevDate = previous ? new Date(`${previous}T00:00:00`) : null;
      const todayDate = new Date(`${day}T00:00:00`);
      const diff = prevDate ? Math.round((todayDate-prevDate)/DAY_MS) : 0;
      this.state.sessions.streak = diff === 1 ? this.state.sessions.streak + 1 : 1;
      this.state.sessions.lastDay = day;
    }
    this.state.sessions.total += 1;
    this.state.sessions.activities += 1;
    this.state.sessions.explorations += result.mode === 'explore' ? 1 : 0;
    this.state.sessions.evaluations += result.mode === 'evaluate' ? 1 : 0;
    this.state.sessions.totalDurationMs = Math.max(0, Number(this.state.sessions.totalDurationMs) || 0) + Math.max(0, Number(result.durationMs) || 0);
    this.state.sessions.lastDurationMs = Math.max(0, Number(result.durationMs) || 0);
    this.state.sessions.lastSessionAt = current.lastPlayedAt;
    this.state.activities[activityId] = current;
    this.state.history = [{ activityId, mode: result.mode, accuracy, difficulty: result.difficulty, completedAt: current.lastPlayedAt }].concat(this.getHistory(HISTORY_LIMIT - 1));
    this.persist();
    return current;
  }
  addHistoryEntry(entry = {}) {
    if (!entry.activityId) return false;
    const item = { activityId: String(entry.activityId), mode: entry.mode === 'evaluate' ? 'evaluate' : 'explore', accuracy: Number.isFinite(Number(entry.accuracy)) ? Math.max(0, Math.min(100, Number(entry.accuracy))) : null, completedAt: entry.completedAt || new Date().toISOString() };
    const previous = structuredClone(this.state);
    this.state.history = [item, ...this.getHistory(HISTORY_LIMIT - 1)];
    return this.persist(previous);
  }
  getActivity(activityId) { return this.state.activities[activityId] || null; }
  getRecentActivityIds(limit = 5) {
    return this.getHistory(limit).map((item) => item.activityId).filter(Boolean);
  }
  clearHistory() {
    const previous = structuredClone(this.state);
    this.state.history = [];
    return this.persist(previous);
  }
  getLastSessionDurationMs() { return Math.max(0, Number(this.state.sessions?.lastDurationMs) || 0); }
  getTotalMinutes() { return Math.round(Math.max(0, Number(this.state.sessions?.totalDurationMs) || 0) / 60000); }
  getSessionSummary() {
    const sessions = this.state.sessions || {};
    return {
      totalActivities: Math.max(0, Number(sessions.activities) || 0),
      explorations: Math.max(0, Number(sessions.explorations) || 0),
      evaluations: Math.max(0, Number(sessions.evaluations) || 0),
      streak: Math.max(0, Number(sessions.streak) || 0),
      totalDurationMs: Math.max(0, Number(sessions.totalDurationMs) || 0),
      lastDurationMs: Math.max(0, Number(sessions.lastDurationMs) || 0),
      lastSessionAt: sessions.lastSessionAt || null
    };
  }
  getWorldProgress(worldId, activityIds = []) {
    const ids = Array.isArray(activityIds) ? activityIds.filter(Boolean) : [];
    const activities = ids.map((id) => this.state.activities[id]).filter(Boolean);
    const explored = activities.filter((item) => item.explored).length;
    return { worldId, total: ids.length, explored, percentage: ids.length ? Math.round((explored / ids.length) * 100) : 0 };
  }
  award(rewardId) { if (!rewardId || this.state.rewards[rewardId]) return false; const previous = structuredClone(this.state); this.state.rewards[rewardId] = { earnedAt: new Date().toISOString() }; return this.persist(previous); }
  grantReward(rewardId) { if (!rewardId || this.state.rewards[rewardId]) return false; const previous = structuredClone(this.state); this.state.rewards[rewardId] = { earnedAt: new Date().toISOString() }; this.state.stars = this.getStars() + 1; return this.persist(previous); }
  hasReward(rewardId) { return Boolean(this.state.rewards[rewardId]); }
  snapshot() { return structuredClone(this.state); }
}
