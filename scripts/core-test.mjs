import assert from 'node:assert/strict';
import { normalizeExperienceResult, getAccuracy } from '../src/core/experience-result.js';
import { LearningEngine } from '../src/core/learning-engine.js';
import { SkillProgress } from '../src/core/skill-progress.js';
import { getAgeExperienceConfig } from '../src/core/age-experience-policy.js';

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

console.log('CORE PASS — contrato, adaptação, idade e agregação por habilidade');
