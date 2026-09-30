import { getChildInterfacePolicy } from './child-interface-policy.js';
import { getAgeExperienceProfile } from './age-experience-policy.js';

const TOUCH_TARGET_BY_AGE = Object.freeze({
  '6-12m': 64,
  '12-18m': 64,
  '18-24m': 64,
  '2-3y': 60,
  '3-4y': 56,
  '4-5y': 56
});

export function getChildInteractionContract(ageId = '2-3y') {
  const interfacePolicy = getChildInterfacePolicy(ageId);
  const experienceProfile = getAgeExperienceProfile(ageId);
  return Object.freeze({
    ageId,
    voiceFirst: interfacePolicy.voiceFirst,
    showLabels: interfacePolicy.showLabels,
    instructionMode: interfacePolicy.instructionMode,
    maxChoices: interfacePolicy.maxChoices,
    visualScale: interfacePolicy.visualScale,
    touchTargetPx: TOUCH_TARGET_BY_AGE[ageId] || 56,
    feedbackMode: experienceProfile.feedback,
    feedbackDurationMs: experienceProfile.feedback === 'gentle' ? 600 : 700,
    pressure: Boolean(experienceProfile.pressure),
    textMode: experienceProfile.text
  });
}

export function getTouchTargetMinimum(ageId = '2-3y') {
  return getChildInteractionContract(ageId).touchTargetPx;
}
