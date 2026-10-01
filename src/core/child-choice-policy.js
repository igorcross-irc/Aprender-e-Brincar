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

// Classes literais para o Tailwind gerar; no celular nunca passa de 2 colunas.
const GRID_CLASSES = { 2: 'grid-cols-2', 3: 'grid-cols-2 sm:grid-cols-3', 4: 'grid-cols-2 md:grid-cols-4', 5: 'grid-cols-2 sm:grid-cols-3 md:grid-cols-5' };

export function getChoiceGridClass(ageId = '2-3y', count = null) {
  return GRID_CLASSES[getChoiceGridColumns(ageId, count)];
}

export function getChoiceGridColumns(ageId = '2-3y', count = null) {
  const max = getChildMaxChoices(ageId);
  const actual = Math.min(max, Math.max(2, Number(count) || max));
  if (actual <= 2) return 2;
  if (actual <= 3) return 3;
  return actual <= 4 ? 4 : 5;
}
