export class LearningSession {
  constructor(learning, progress, reward = null) {
    this.learning = learning;
    this.progress = progress;
    this.reward = reward;
    this.active = null;
  }

  start({ ageId, worldId = null, goal = 'explore' } = {}) {
    this.active = {
      id: crypto.randomUUID?.() || `session-${Date.now()}`,
      ageId,
      worldId,
      goal,
      startedAt: new Date().toISOString(),
      completed: [],
      stars: 0
    };
    return this.snapshot();
  }

  ensure(ageId, worldId = null) {
    if (!this.active || this.active.ageId !== ageId || this.active.worldId !== worldId) {
      return this.start({ ageId, worldId });
    }
    return this.snapshot();
  }

  chooseNext(limit = 3) {
    if (!this.active) return [];
    const suggestions = this.learning.recommend(this.active.ageId, this.active.worldId, limit + 2);
    const played = new Set(this.active.completed);
    return suggestions.filter(item => !played.has(item.activity.id)).slice(0, limit);
  }

  complete(activityId, result = {}) {
    if (!this.active) return { completed: false, reason: 'no-session' };
    if (this.active.completed.includes(activityId)) {
      return { completed: false, duplicate: true, session: this.snapshot() };
    }

    const score = Number(result.score ?? 0);
    const rounds = Math.max(1, Number(result.rounds) || 5);
    const progress = this.progress.complete(activityId, { score, rounds });
    if (this.reward) this.reward();
    this.active.completed.push(activityId);
    this.active.stars += 1;

    return {
      completed: true,
      activityId,
      progress,
      next: this.chooseNext(3),
      session: this.snapshot()
    };
  }

  summary() {
    if (!this.active) return null;
    const durationMs = Math.max(0, Date.now() - new Date(this.active.startedAt).getTime());
    return {
      ...this.snapshot(),
      durationSeconds: Math.round(durationMs / 1000),
      completedCount: this.active.completed.length,
      next: this.chooseNext(3)
    };
  }

  end() {
    const result = this.summary();
    this.active = null;
    return result;
  }

  snapshot() {
    return this.active ? structuredClone(this.active) : null;
  }
}
