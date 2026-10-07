import test from 'node:test';
import assert from 'node:assert/strict';
import { CAMPOS, camposFor, campoTotals, faixaBncc } from '../src/core/bncc.js';
import { activityCatalog } from '../src/content/activity-catalog.js';

test('toda brincadeira do catálogo aponta para pelo menos um campo de experiência', () => {
  for (const activity of activityCatalog) {
    const campos = camposFor(activity);
    assert.ok(campos.length >= 1, `${activity.id} sem campo`);
    campos.forEach((campo) => assert.ok(CAMPOS[campo.id]));
  }
});

test('totais contam só o que foi jogado', () => {
  const totals = campoTotals(activityCatalog, { memory: { completions: 3 }, movement: { completions: 2 } });
  const by = Object.fromEntries(totals.map((t) => [t.id, t.plays]));
  assert.equal(by.corpo, 2);
  assert.ok(by.escuta >= 3);
  assert.equal(campoTotals(activityCatalog, {}).reduce((sum, t) => sum + t.plays, 0), 0);
});

test('faixa da BNCC por idade do app', () => {
  assert.equal(faixaBncc('6-12m').code, 'EI01');
  assert.equal(faixaBncc('12-18m').code, 'EI01');
  assert.equal(faixaBncc('18-24m').code, 'EI02');
  assert.equal(faixaBncc('2-3y').code, 'EI02');
  assert.equal(faixaBncc('3-4y').code, 'EI02');
  assert.equal(faixaBncc('4-5y').code, 'EI03');
  assert.equal(faixaBncc('qualquer').code, 'EI02');
});
