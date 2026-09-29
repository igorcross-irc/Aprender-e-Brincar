import assert from 'node:assert/strict';
import { normalizeExperienceResult, getAccuracy } from '../src/core/experience-result.js';

const legacy = normalizeExperienceResult({ score: 3, rounds: 5 });
assert.equal(legacy.correct, 3);
assert.equal(legacy.attempts, 5);
assert.equal(getAccuracy(legacy), 60);

const memory = normalizeExperienceResult({
  score: 2,
  rounds: 3,
  correct: 3,
  attempts: 5,
  maxScore: 3,
  completedRounds: 3,
  difficulty: 4
});
assert.equal(memory.correct, 3);
assert.equal(memory.attempts, 5);
assert.equal(memory.maxScore, 3);
assert.equal(memory.difficulty, 4);
assert.equal(getAccuracy(memory), 60);

const exploration = normalizeExperienceResult({ mode: 'explore', score: 5, rounds: 5 });
assert.equal(exploration.mode, 'explore');
assert.equal(getAccuracy(exploration), null);

const bounded = normalizeExperienceResult({ score: 99, correct: 99, attempts: 4, maxScore: 4 });
assert.equal(bounded.correct, 4);
assert.equal(getAccuracy(bounded), 100);

console.log('CORE PASS — contrato de resultado e precisão semântica');
