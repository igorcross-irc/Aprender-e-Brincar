import { getAgeExperienceConfig } from './age-experience-policy.js';

export function resolveGameDifficulty(ageId = '2-3y', level = 1, options = {}) {
  const age = options.age || getAgeExperienceConfig(ageId, level);
  return Object.freeze({
    ageId,
    level: age.level,
    maxChoices: age.optionCount,
    sequenceLength: age.sequenceLength,
    maxLevel: age.maxLevel,
    visualDensity: age.visualDensity,
    touchTargetPx: age.touchTargetPx,
    rounds: age.rounds,
    assistance: age.assistance,
    audioFirst: age.audioFirst,
    feedback: age.feedback,
    pressure: age.pressure,
    text: age.text
  });
}

export function clampGameCount(count, difficulty, min = 2, max = 6) {
  const requested = Number(count) || min;
  return Math.max(min, Math.min(max, Math.round(requested)));
}

export function getGameChoiceCount(difficulty, base = 2, growth = 1, max = 6) {
  return clampGameCount(base + ((difficulty.level - 1) * growth), difficulty, base, Math.min(max, difficulty.maxChoices + 1));
}

export function getGameTextMode(difficulty) {
  return difficulty?.text || false;
}

export function shouldUseAudioFirst(difficulty) {
  return Boolean(difficulty?.audioFirst);
}

export function getGameRounds(difficulty, fallback = 3) {
  return Math.max(1, Number(difficulty?.rounds) || fallback);
}
