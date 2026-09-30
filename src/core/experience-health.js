const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export function sanitizeProgressState(input, defaults) {
  const state = { ...structuredClone(defaults), ...(input || {}) };
  state.stars = Number.isFinite(Number(state.stars)) ? Math.max(0, Math.floor(Number(state.stars))) : 0;
  state.activities = state.activities && typeof state.activities === 'object' ? state.activities : {};
  state.worlds = state.worlds && typeof state.worlds === 'object' ? state.worlds : {};
  state.rewards = state.rewards && typeof state.rewards === 'object' ? state.rewards : {};
  state.history = Array.isArray(state.history) ? state.history.filter((entry) => entry && typeof entry === 'object' && entry.activityId).slice(0, 30).map((entry) => ({
    activityId: String(entry.activityId),
    mode: entry.mode === 'evaluate' ? 'evaluate' : 'explore',
    accuracy: Number.isFinite(Number(entry.accuracy)) ? clamp(Number(entry.accuracy), 0, 100) : null,
    difficulty: Number.isFinite(Number(entry.difficulty)) ? clamp(Number(entry.difficulty), 1, 5) : undefined,
    completedAt: entry.completedAt || null
  })) : [];
  state.sessions = { ...structuredClone(defaults.sessions), ...(state.sessions || {}) };
  state.sessions.total = Math.max(0, Number(state.sessions.total) || 0);
  state.sessions.activities = Math.max(0, Number(state.sessions.activities) || 0);
  state.sessions.explorations = Math.max(0, Number(state.sessions.explorations) || 0);
  state.sessions.evaluations = Math.max(0, Number(state.sessions.evaluations) || 0);
  state.sessions.streak = Math.max(0, Number(state.sessions.streak) || 0);
  state.sessions.totalDurationMs = Math.max(0, Number(state.sessions.totalDurationMs) || 0);
  state.sessions.lastDurationMs = Math.max(0, Number(state.sessions.lastDurationMs) || 0);
  state.sessions.lastSessionAt = state.sessions.lastSessionAt || null;

  for (const [id, item] of Object.entries(state.activities)) {
    if (!item || typeof item !== 'object') { delete state.activities[id]; continue; }
    item.completions = Math.max(0, Number(item.completions) || 0);
    item.explorationCount = Math.max(0, Number(item.explorationCount) || 0);
    item.evaluationCount = Math.max(0, Number(item.evaluationCount) || 0);
    item.attempts = Math.max(0, Number(item.attempts) || 0);
    item.correct = clamp(Number(item.correct) || 0, 0, item.attempts);
    item.mastery = clamp(Number(item.mastery) || 0, 0, 5);
    if (Array.isArray(item.accuracyHistory)) item.accuracyHistory = item.accuracyHistory.filter(Number.isFinite).slice(-8).map((v) => clamp(Number(v), 0, 100));
  }
  return state;
}

export function isProgressStateUsable(state) {
  return Boolean(state && typeof state === 'object' && state.activities && state.sessions && Array.isArray(state.history));
}
