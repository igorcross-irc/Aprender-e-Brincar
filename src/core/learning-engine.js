import { activityCatalog } from '../content/activity-catalog.js';
import { getAgeExperienceConfig, getAgeExperienceLevel } from './age-experience-policy.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export class LearningEngine {
  constructor(progressStore) {
    this.progress = progressStore;
    this.historyKey = 'learning_recent_v1';
    this.skills = null;
  }

  setSkillProgress(skillProgress) { this.skills = skillProgress; return this; }

  getDifficulty(activity, ageId = '2-3y') {
    const p = this.progress.getActivity(activity.id) || {};
    const base = clamp(Number(activity.difficulty || 1), 1, 5);
    const accuracy = p.accuracy == null ? null : Number(p.accuracy);
    const recentAccuracy = p.recentAccuracy == null ? accuracy : Number(p.recentAccuracy);
    const evaluations = Number(p.evaluationCount || 0);
    const history = Array.isArray(p.accuracyHistory) ? p.accuracyHistory : [];
    const previous = history.length > 1 ? Number(history.at(-2)) : null;
    const current = history.length ? Number(history.at(-1)) : recentAccuracy;
    const trend = current != null && previous != null ? current - previous : 0;
    let level = base;
    if (evaluations >= 2) {
      if (recentAccuracy != null && recentAccuracy >= 85) level += 1;
      else if (recentAccuracy != null && recentAccuracy < 50) level -= 1;
      if (trend >= 15) level += 1;
      else if (trend <= -15) level -= 1;
      level = clamp(level, base - 1, base + 1);
    }
    const daysSince = p.lastPlayedAt ? (Date.now() - new Date(p.lastPlayedAt).getTime()) / 86400000 : Infinity;
    const stale = daysSince > 21 && evaluations > 0;
    if (stale && recentAccuracy != null && recentAccuracy < 75) level -= 1;
    const bounded = getAgeExperienceLevel(ageId, clamp(level, 1, 5));
    return { level: bounded, label: ['', 'Descoberta', 'Explorar', 'Desafio', 'Avançado', 'Especialista'][bounded], accuracy, recentAccuracy, mastery: p.mastery == null ? 0 : Number(p.mastery), evaluations, trend, stale, age: getAgeExperienceConfig(ageId, bounded) };
  }

  recentIds(limit = 6) {
    try { return JSON.parse(localStorage.getItem(this.historyKey) || '[]').filter(Boolean).slice(0, limit); }
    catch { return []; }
  }

  remember(activityId) {
    try {
      const ids = this.recentIds(12).filter((id) => id !== activityId);
      localStorage.setItem(this.historyKey, JSON.stringify([activityId, ...ids].slice(0, 12)));
    } catch {}
  }

  recommend(ageId, worldId, limit = 3) {
    const snapshot = this.progress.snapshot();
    const recentIds = this.recentIds(5);
    const weakSkills = new Set((this.skills?.weakest?.(5) || []).map(([skill]) => skill));
    const sessionRecent = new Set((snapshot.history || []).slice(0, 5).map((item) => item.activityId));
    return activityCatalog.filter((activity) => activity.ages?.includes(ageId) && (!worldId || activity.world === worldId)).map((activity) => {
      const progress = snapshot.activities?.[activity.id];
      const mastery = Number(progress?.mastery || 0);
      const evaluations = Number(progress?.evaluationCount || 0);
      const days = progress?.lastPlayedAt ? (Date.now() - new Date(progress.lastPlayedAt).getTime()) / 86400000 : 999;
      const accuracy = progress?.accuracy == null ? null : Number(progress.accuracy);
      const recentAccuracy = progress?.recentAccuracy == null ? accuracy : Number(progress.recentAccuracy);
      const skillBoost = (activity.skills || []).some((skill) => weakSkills.has(skill)) ? 22 : 0;
      const performanceBoost = recentAccuracy != null && recentAccuracy < 60 ? 18 : recentAccuracy != null && recentAccuracy >= 85 ? -8 : 0;
      const recoveryBoost = recentAccuracy != null && accuracy != null && recentAccuracy > accuracy + 10 ? 8 : 0;
      const novelty = evaluations === 0 ? 55 : 18;
      const repetitionPenalty = recentIds.includes(activity.id) ? 35 : 0;
      const sessionPenalty = sessionRecent.has(activity.id) ? 18 : 0;
      const score = novelty + Math.min(days, 30) + (5 - mastery) * 9 + skillBoost + performanceBoost + recoveryBoost - Number(progress?.completions || 0) * 2 - repetitionPenalty - sessionPenalty;
      const reasonCode = evaluations === 0 ? 'new' : recentAccuracy != null && recentAccuracy < 60 ? 'reinforce' : recoveryBoost ? 'improving' : 'vary';
      const reason = { new: 'Nova descoberta', reinforce: 'Vamos reforçar esta habilidade', improving: 'Você está evoluindo', vary: 'Boa hora para variar' }[reasonCode];
      const priority = reasonCode === 'reinforce' ? 'support' : reasonCode === 'improving' ? 'progress' : reasonCode === 'new' ? 'discover' : 'variety';
      return { activity, score, reason, reasonCode, priority, difficulty: this.getDifficulty(activity, ageId) };
    }).sort((a, b) => b.score - a.score).slice(0, limit);
  }

  getRecommendationSummary(ageId, worldId, limit = 3) {
    return this.recommend(ageId, worldId, limit).map(({ activity, reason, reasonCode, priority, difficulty }) => ({ activityId: activity.id, title: activity.title, reason, reasonCode, priority, difficulty: difficulty.level }));
  }

  getJourneySummary() {
    const snapshot = this.progress.snapshot();
    const entries = Object.values(snapshot.activities || {});
    const explored = entries.filter((item) => item.explored).length;
    const evaluated = entries.filter((item) => Number(item.evaluationCount || 0) > 0).length;
    const worlds = new Set(activityCatalog.filter((activity) => snapshot.activities?.[activity.id]?.explored).map((activity) => activity.world).filter(Boolean)).size;
    return { explored, evaluated, worlds, sessions: Number(snapshot.sessions?.total || 0), minutes: Math.round(Number(snapshot.sessions?.totalDurationMs || 0) / 60000) };
  }

  getProfile() {
    const snapshot = this.progress.snapshot();
    const skills = this.skills?.get?.() || {};
    const ranked = Object.entries(skills).sort((a, b) => b[1].mastery - a[1].mastery);
    const strengths = ranked.filter(([, value]) => value.evaluations > 0).slice(0, 3);
    const areas = ranked.filter(([, value]) => value.evaluations > 0).sort((a, b) => a[1].mastery - b[1].mastery).slice(0, 3);
    const entries = Object.values(snapshot.activities || {});
    const evaluated = entries.filter((p) => Number(p.evaluationCount || 0) > 0);
    const exploration = entries.reduce((sum, p) => sum + Number(p.explorationCount || 0), 0);
    const accuracy = evaluated.length ? Math.round(evaluated.reduce((sum, p) => sum + Number(p.recentAccuracy ?? p.accuracy ?? 0), 0) / evaluated.length) : null;
    const improving = evaluated.filter((p) => Array.isArray(p.accuracyHistory) && p.accuracyHistory.length >= 2 && Number(p.accuracyHistory.at(-1)) > Number(p.accuracyHistory.at(-2))).length;
    return { strengths, areas, exploration, evaluated: evaluated.length, accuracy, improving, streak: Number(snapshot.sessions?.streak || 0) };
  }

  getOutcome(activityId) {
    const p = this.progress.getActivity(activityId) || {};
    const accuracy = p.accuracy == null ? null : Number(p.accuracy);
    if (accuracy == null) return { type: 'explore', label: 'Exploração', message: 'Vamos conhecer mais antes de aumentar o desafio.' };
    if (accuracy >= 85) return { type: 'advance', label: 'Avançando', message: 'Já está dominando este desafio. Podemos experimentar algo um pouco mais difícil.' };
    if (accuracy >= 60) return { type: 'practice', label: 'Praticar', message: 'Está no caminho. Repetir ou variar ajuda a consolidar.' };
    return { type: 'support', label: 'Reforçar', message: 'Vamos voltar a uma proposta mais simples e tentar novamente.' };
  }

  labelDomain(domain) { return domain; }
}
