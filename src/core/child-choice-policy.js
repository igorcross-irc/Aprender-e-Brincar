import { getChildInterfacePolicy } from './child-interface-policy.js';

export function getChildMaxChoices(ageId = '2-3y') {
  return Math.max(2, Number(getChildInterfacePolicy(ageId).maxChoices) || 4);
}

export function keepCorrectChoice(options = [], correctId, ageId = '2-3y') {
  const list = Array.isArray(options) ? [...options] : [];
  if (list.length <= getChildMaxChoices(ageId)) return list;

  const maxChoices = getChildMaxChoices(ageId);
  const correctIndex = list.findIndex((item) => String(item?.id) === String(correctId));
  if (correctIndex < 0) return list.slice(0, maxChoices);

  const correct = list[correctIndex];
  const alternatives = list.filter((_, index) => index !== correctIndex);
  return [correct, ...alternatives].slice(0, maxChoices);
}

export function getChoiceGridClass(ageId = '2-3y', count = null) {
  return `grid-cols-${getChoiceGridColumns(ageId, count)}`;
}

export function getChoiceGridColumns(ageId = '2-3y', count = null) {
  const max = getChildMaxChoices(ageId);
  const actual = Math.min(max, Math.max(2, Number(count) || max));
  if (actual <= 2) return 2;
  if (actual <= 3) return 3;
  return actual <= 4 ? 4 : 5;
}
