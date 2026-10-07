import test from 'node:test';
import assert from 'node:assert/strict';
import { developmentContent as c } from '../src/content/development-content.js';
import { activityCatalog } from '../src/content/activity-catalog.js';

const unique = (list, name) => { const ids = list.map((x) => x.id); assert.equal(new Set(ids).size, ids.length, `${name}: ids repetidos`); };

test('ids únicos em todas as listas de conteúdo', () => {
  Object.entries(c).forEach(([name, list]) => unique(list, name));
  unique(activityCatalog, 'catálogo');
});

test('todo item tem rótulo e ícone (ou padrão) preenchidos', () => {
  for (const name of ['shapes', 'objects', 'objectsAdvanced', 'bodyParts', 'vocabulary', 'babyDiscoveries', 'movements']) {
    c[name].forEach((item) => { assert.ok(item.label, `${name}/${item.id} sem label`); assert.ok(item.icon, `${name}/${item.id} sem ícone`); });
  }
});

test('"qual é diferente" tem grupos com 2+ itens para formar a rodada', () => {
  const groups = {};
  c.objects.forEach((o) => { (groups[o.group] ||= []).push(o); });
  const usable = Object.values(groups).filter((g) => g.length >= 2);
  assert.ok(usable.length >= 4, 'poucos grupos utilizáveis');
});

test('sílabas: as partes formam a palavra', () => {
  c.syllables.forEach((s) => assert.equal(s.parts.join(''), s.label, s.id));
});

test('sequências: a resposta existe no padrão e o padrão tem 4+ itens', () => {
  c.sequences.forEach((s) => { assert.ok(s.items.length >= 4, s.id); assert.ok(s.items.includes(s.answer), s.id); });
});

test('histórias têm uma fala para cada cena', () => {
  c.stories.forEach((s) => { assert.equal(s.scenes.length, s.words.length, s.id); assert.ok(s.scenes.length >= 3); });
});

test('o app tem conteúdo suficiente para repetir pouco', () => {
  assert.ok(c.objects.length >= 15);
  assert.ok(c.stories.length >= 8);
  assert.ok(c.syllables.length >= 10);
  assert.ok(c.sequences.length >= 8);
  assert.ok(c.opposites.length >= 8);
});

test('jogos da memória temáticos: figuras únicas, com rótulo e ícone, e pares suficientes', async () => {
  const { memoryThemes } = await import('../src/content/development-content.js');
  for (const [theme, items] of Object.entries(memoryThemes)) {
    assert.ok(items.length >= 6, `${theme}: poucas figuras`);
    assert.equal(new Set(items.map((i) => i.id)).size, items.length, `${theme}: ids repetidos`);
    assert.equal(new Set(items.map((i) => i.icon)).size, items.length, `${theme}: ícones repetidos (cartas iguais confundem)`);
    items.forEach((i) => { assert.ok(i.label && i.icon, `${theme}/${i.id}`); });
  }
});
