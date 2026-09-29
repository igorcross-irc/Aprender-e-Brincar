import { activityCatalog } from '../content/activity-catalog.js';

const normalize = (value) => String(value || '').trim();

export function getContentReadiness(activityId) {
  const activity = activityCatalog.find((item) => item.id === activityId);
  if (!activity) return { ready: false, activityId, audioNeeds: [], message: 'Atividade não encontrada.' };
  const audioNeeds = (activity.audioNeeds || []).map(normalize).filter(Boolean);
  return {
    ready: true,
    activityId,
    title: activity.title,
    audioNeeds,
    hasAudioPlan: audioNeeds.length > 0,
    fallback: 'speech-synthesis',
    mode: audioNeeds.length ? 'audio-plus-fallback' : 'visual-plus-fallback'
  };
}

export function getContentSummary() {
  const total = activityCatalog.length;
  const withAudioPlan = activityCatalog.filter((item) => Array.isArray(item.audioNeeds) && item.audioNeeds.length).length;
  return { total, withAudioPlan, visualOnly: total - withAudioPlan };
}
