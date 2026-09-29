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

export function getCatalogIntegrity() {
  const errors = [];
  const ids = new Set();
  for (const activity of activityCatalog) {
    if (!activity?.id) { errors.push('atividade sem id'); continue; }
    if (ids.has(activity.id)) errors.push(`id duplicado: ${activity.id}`);
    ids.add(activity.id);
    if (!Array.isArray(activity.ages) || !activity.ages.length) errors.push(`sem faixa etária: ${activity.id}`);
    if (!Array.isArray(activity.skills) || !activity.skills.length) errors.push(`sem habilidade: ${activity.id}`);
    if (!activity.world) errors.push(`sem mundo: ${activity.id}`);
    if (activity.audioNeeds && (!Array.isArray(activity.audioNeeds) || activity.audioNeeds.some((item) => !String(item || '').trim()))) errors.push(`plano de áudio inválido: ${activity.id}`);
  }
  return { valid: errors.length === 0, errors, total: activityCatalog.length };
}

export function getContentSummary() {
  const total = activityCatalog.length;
  const withAudioPlan = activityCatalog.filter((item) => Array.isArray(item.audioNeeds) && item.audioNeeds.length).length;
  return { total, withAudioPlan, visualOnly: total - withAudioPlan };
}
