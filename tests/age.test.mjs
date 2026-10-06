import test from 'node:test';
import assert from 'node:assert/strict';
import { ageBandFromBirth, ageBandFromMonths, parseBirth, describeAge } from '../src/core/age.js';

const now = new Date(2026, 9, 6); // 6/10/2026

test('faixas pelos meses de vida', () => {
  const cases = [[0, '6-12m'], [11, '6-12m'], [12, '12-18m'], [17, '12-18m'], [18, '18-24m'], [23, '18-24m'], [24, '2-3y'], [35, '2-3y'], [36, '3-4y'], [47, '3-4y'], [48, '4-5y'], [90, '4-5y']];
  cases.forEach(([months, band]) => assert.equal(ageBandFromMonths(months), band, `${months} meses`));
});

test('a faixa avança sozinha com o passar do tempo', () => {
  assert.equal(ageBandFromBirth('2024-10', new Date(2026, 9, 6)), '2-3y'); // 2 anos
  assert.equal(ageBandFromBirth('2024-10', new Date(2026, 8, 30)), '18-24m'); // 1 ano e 11 meses
  assert.equal(ageBandFromBirth('2024-10', new Date(2027, 9, 6)), '3-4y');
});

test('datas inválidas, futuras ou absurdas são ignoradas', () => {
  for (const bad of ['', 'abc', '2026-13', '2026-00', '2027-01', '2010-01', '24-10', null, undefined]) assert.equal(parseBirth(bad, now), null, String(bad));
  assert.equal(ageBandFromBirth('lixo', now), '');
  assert.deepEqual(parseBirth('2026-10', now), { year: 2026, month: 10 });
});

test('descrição para o responsável', () => {
  assert.equal(describeAge('2024-07', now), '2 anos e 3 meses');
  assert.equal(describeAge('2025-10', now), '1 ano');
  assert.equal(describeAge('2026-08', now), '2 meses');
  assert.equal(describeAge('2026-10', now), 'recém-nascido');
});
