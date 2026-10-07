import test from 'node:test';
import assert from 'node:assert/strict';
import { Favorites } from '../src/core/favorites.js';
import { seasonFor } from '../src/core/seasons.js';
import { buildPrintableHtml, printableAges } from '../src/core/printables.js';
import { memoryStorage } from './helpers.mjs';

test('favoritos: liga, desliga, limita a 12 e ignora ids inválidos', () => {
  const fav = new Favorites({ storage: memoryStorage(), isValid: (id) => id.startsWith('ok') });
  assert.equal(fav.toggle('ok1'), true);
  assert.equal(fav.has('ok1'), true);
  assert.equal(fav.toggle('ok1'), false);
  assert.equal(fav.toggle('lixo'), false);
  for (let i = 0; i < 20; i += 1) fav.toggle(`ok${i + 10}`);
  assert.equal(fav.list().length, 12);
  assert.equal(fav.list()[0], 'ok29');
});

test('favoritos: dado corrompido no armazenamento vira lista vazia', () => {
  const storage = memoryStorage({ ab_favorites: '{quebrado' });
  assert.deepEqual(new Favorites({ storage }).list(), []);
  storage.setItem('ab_favorites', '"texto"');
  assert.deepEqual(new Favorites({ storage }).list(), []);
});

test('datas especiais', () => {
  assert.equal(seasonFor(new Date(2026, 9, 6)).id, 'crianca');
  assert.equal(seasonFor(new Date(2026, 5, 20)).id, 'junina');
  assert.equal(seasonFor(new Date(2026, 11, 24)).id, 'natal');
  assert.equal(seasonFor(new Date(2026, 1, 10)), null);
});

test('fichas para imprimir: 4 atividades, nome escapado e quantidade por idade', () => {
  for (const age of printableAges()) {
    const html = buildPrintableHtml(age, () => 0.42, '<b>Isa</b>');
    assert.equal((html.match(/<section>/g) || []).length, 4, age);
    assert.ok(!html.includes('<b>Isa</b>'));
    assert.ok(html.includes('&lt;b&gt;Isa'));
    assert.ok(!html.includes('<script'), 'ficha sem script embutido (CSP)');
  }
  const small = buildPrintableHtml('18-24m', () => 0.1);
  const big = buildPrintableHtml('4-5y', () => 0.1);
  assert.ok((big.match(/class="circle"/g) || []).length > (small.match(/class="circle"/g) || []).length);
});
