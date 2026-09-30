import assert from 'node:assert/strict';
import { normalizeExperienceResult, getAccuracy } from '../src/core/experience-result.js';
import { LearningEngine } from '../src/core/learning-engine.js';
import { SkillProgress } from '../src/core/skill-progress.js';
import { getAgeExperienceConfig, isAgeCompatible } from '../src/core/age-experience-policy.js';
import { sanitizeProgressState, isProgressStateUsable } from '../src/core/experience-health.js';
import { getContentReadiness, getContentSummary, getCatalogIntegrity } from '../src/core/content-readiness.js';
import { ProgressStore } from '../src/core/progress-store.js';
import { getChildInterfacePolicy } from '../src/core/child-interface-policy.js';
import { getVisualKey, getChildVisual, childVisualLibrarySize } from '../src/core/child-visual-system.js';

const legacy = normalizeExperienceResult({ score: 3, rounds: 5 });
assert.equal(legacy.correct, 3);
assert.equal(legacy.attempts, 5);
assert.equal(getAccuracy(legacy), 60);

const memory = normalizeExperienceResult({
  score: 2, rounds: 3, correct: 3, attempts: 5, maxScore: 3, completedRounds: 3, difficulty: 4
});
assert.equal(memory.correct, 3);
assert.equal(memory.attempts, 5);
assert.equal(memory.maxScore, 3);
assert.equal(memory.difficulty, 4);
assert.equal(getAccuracy(memory), 60);

const overcounted = normalizeExperienceResult({ correct: 9, attempts: 4, maxScore: 9 });
assert.equal(overcounted.correct, 4);
assert.equal(getAccuracy(overcounted), 100);
assert.equal(getAccuracy({ mode: 'evaluate', attempts: 3, correct: 5 }), 100);

const exploration = normalizeExperienceResult({ mode: 'explore', score: 5, rounds: 5 });
assert.equal(exploration.mode, 'explore');
assert.equal(getAccuracy(exploration), null);

globalThis.localStorage = {
  data: new Map(),
  getItem(key) { return this.data.get(key) ?? null; },
  setItem(key, value) { this.data.set(key, String(value)); }
};

const activity = { id: 'test-activity', difficulty: 2 };
const progressStates = [
  {},
  { evaluationCount: 2, mastery: 4, accuracy: 90, recentAccuracy: 90, accuracyHistory: [80, 90], lastPlayedAt: new Date().toISOString() },
  { evaluationCount: 2, mastery: 1, accuracy: 40, recentAccuracy: 40, accuracyHistory: [55, 40], lastPlayedAt: new Date().toISOString() }
];
const engine = new LearningEngine({
  getActivity() { return this.state; },
  snapshot() { return { activities: { 'test-activity': this.state } }; },
  state: progressStates[0]
});
assert.equal(engine.getDifficulty(activity).level, 2);
assert.equal(getAgeExperienceConfig('6-12m', 5).level, 1);
assert.equal(getAgeExperienceConfig('4-5y', 5).level, 5);
assert.equal(getChildInterfacePolicy('6-12m').voiceFirst, true);
assert.equal(getChildInterfacePolicy('6-12m').showLabels, false);
assert.equal(getChildInterfacePolicy('2-3y').instructionMode, 'voice-supported');
assert.equal(getChildInterfacePolicy('4-5y').showLabels, true);
assert.equal(getVisualKey('Maçã'), 'apple');
assert.equal(getChildVisual('bola').icon, '⚽');
assert.ok(childVisualLibrarySize() >= 10);
assert.equal(isAgeCompatible({ ages: ['2-3y'] }, '2-3y'), true);
assert.equal(isAgeCompatible({ ages: ['2-3y'] }, '4-5y'), false);
engine.progress.state = progressStates[1];
assert.ok(engine.getDifficulty(activity).level >= 3);
engine.progress.state = progressStates[2];
assert.ok(engine.getDifficulty(activity).level <= 2);

const skillProgress = new SkillProgress({
  snapshot() {
    return {
      activities: {
        memory: { mastery: 4, completions: 4, attempts: 20, evaluationCount: 2 }
      }
    };
  }
});
const skills = skillProgress.get();
assert.equal(skills['memória'].mastery, 4);
assert.equal(skills['memória'].evaluations, 2);
assert.equal(skills['memória'].attempts, 20);
assert.equal(skillProgress.weakest(1)[0][0], 'memória');

const defaults = { version: 6, stars: 0, activities: {}, worlds: {}, rewards: {}, sessions: { total: 0, streak: 0 } };
const repaired = sanitizeProgressState({ stars: -4, activities: { bad: null, ok: { attempts: 4, correct: 9, mastery: 9 } }, sessions: { total: -2 } }, defaults);
assert.equal(repaired.stars, 0);
assert.equal(repaired.activities.bad, undefined);
assert.equal(repaired.activities.ok.correct, 4);
assert.equal(repaired.activities.ok.mastery, 5);
assert.equal(isProgressStateUsable(repaired), true);

const progress = new ProgressStore();
progress.complete('explore-then-evaluate', { mode: 'explore', attempts: 0, correct: 5, rounds: 5, durationMs: 12000 });
assert.equal(progress.getActivity('explore-then-evaluate').attempts, 0);
assert.equal(progress.getSessionSummary().totalDurationMs, 12000);
progress.complete('explore-then-evaluate', { mode: 'evaluate', attempts: 10, correct: 7, rounds: 10 });
assert.equal(progress.getActivity('explore-then-evaluate').correct, 7);
assert.equal(progress.getActivity('explore-then-evaluate').recentAccuracy, 70);
assert.equal(progress.getActivity('explore-then-evaluate').mastery, 3.5);
assert.equal(progress.grantReward('activity:test'), true);
assert.equal(progress.grantReward('activity:test'), false);
assert.equal(progress.getStars(), 1);
assert.equal(progress.getWorldProgress('test-world', ['explore-then-evaluate', 'missing']).percentage, 50);
assert.deepEqual(progress.getRecentActivityIds(2), ['explore-then-evaluate', 'explore-then-evaluate']);
assert.equal(progress.getSessionSummary().lastDurationMs, 0);
progress.complete('duration-check', { mode: 'explore', durationMs: 3500 });
assert.equal(progress.getSessionSummary().lastDurationMs, 3500);
assert.equal(progress.getLastSessionDurationMs(), 3500);
assert.equal(progress.getTotalMinutes(), 0);
assert.equal(progress.getRecentHistory(2).length, 2);
const recommendationEngine = new LearningEngine(progress);
const recommendationSummary = recommendationEngine.getRecommendationSummary('2-3y', null, 2);
assert.ok(Array.isArray(recommendationSummary));
assert.ok(recommendationSummary.every((item) => item.reasonCode && item.priority));
const journey = recommendationEngine.getJourneySummary();
assert.equal(journey.explored, 2);
assert.equal(journey.evaluated, 1);
assert.equal(journey.sessions, progress.snapshot().sessions.total);
assert.ok(journey.minutes >= 0);
assert.equal(getContentReadiness('rhymes').hasAudioPlan, true);
assert.equal(getContentReadiness('canvas').ready, true);
assert.ok(getContentSummary().total >= 1);
const integrity = getCatalogIntegrity();
assert.equal(integrity.valid, true, integrity.errors.join('; '));
console.log('CORE PASS — contrato, adaptação, idade, conteúdo e resiliência');
