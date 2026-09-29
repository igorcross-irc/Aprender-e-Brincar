import { AGE_BANDS } from './activity-registry.js';

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

export const AGE_EXPERIENCE_PROFILES = Object.freeze({
  '6-12m': Object.freeze({
    id: '6-12m', label: 'Descoberta inicial', visualDensity: 'low', optionCount: 2,
    sequenceLength: 1, text: false, audioFirst: true, assistance: 'high', maxLevel: 1,
    feedback: 'gentle', pressure: false, rounds: 3
  }),
  '12-18m': Object.freeze({
    id: '12-18m', label: 'Descoberta guiada', visualDensity: 'low', optionCount: 3,
    sequenceLength: 1, text: false, audioFirst: true, assistance: 'high', maxLevel: 2,
    feedback: 'gentle', pressure: false, rounds: 4
  }),
  '18-24m': Object.freeze({
    id: '18-24m', label: 'Exploração ativa', visualDensity: 'medium', optionCount: 3,
    sequenceLength: 2, text: false, audioFirst: true, assistance: 'medium', maxLevel: 2,
    feedback: 'warm', pressure: false, rounds: 4
  }),
  '2-3y': Object.freeze({
    id: '2-3y', label: 'Descoberta e escolha', visualDensity: 'medium', optionCount: 4,
    sequenceLength: 2, text: 'short', audioFirst: true, assistance: 'medium', maxLevel: 3,
    feedback: 'warm', pressure: false, rounds: 5
  }),
  '3-4y': Object.freeze({
    id: '3-4y', label: 'Desafio em construção', visualDensity: 'medium-high', optionCount: 4,
    sequenceLength: 3, text: 'short', audioFirst: true, assistance: 'low', maxLevel: 4,
    feedback: 'celebrate', pressure: false, rounds: 5
  }),
  '4-5y': Object.freeze({
    id: '4-5y', label: 'Desafio e descoberta', visualDensity: 'high', optionCount: 5,
    sequenceLength: 4, text: 'full', audioFirst: false, assistance: 'low', maxLevel: 5,
    feedback: 'celebrate', pressure: false, rounds: 5
  })
});

export function getAgeExperienceProfile(ageId) {
  return AGE_EXPERIENCE_PROFILES[ageId] || AGE_EXPERIENCE_PROFILES['2-3y'];
}

export function getAgeExperienceLevel(ageId, level = 1) {
  const profile = getAgeExperienceProfile(ageId);
  return clamp(Number(level) || 1, 1, profile.maxLevel);
}

export function getAgeExperienceConfig(ageId, level = 1) {
  const profile = getAgeExperienceProfile(ageId);
  return Object.freeze({
    ...profile,
    level: getAgeExperienceLevel(ageId, level),
    ageLabel: AGE_BANDS.find((age) => age.id === ageId)?.label || profile.label
  });
}
