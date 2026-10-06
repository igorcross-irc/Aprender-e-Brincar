import test from 'node:test';
import assert from 'node:assert/strict';
import { createChallenge, GateGuard } from '../src/core/parental-gate.js';
import { memoryStorage } from './helpers.mjs';

test('conta tem resposta correta e números altos', () => {
  for (let i = 0; i < 200; i += 1) {
    const { text, answer } = createChallenge();
    const [a, b] = text.split(' × ').map(Number);
    assert.equal(a * b, answer);
    assert.ok(a >= 6 && a <= 12 && b >= 4 && b <= 9);
  }
});

test('3 erros seguidos bloqueiam por 30 s, depois 60 s, 120 s…', () => {
  let t = 1000;
  const guard = new GateGuard({ storage: memoryStorage(), now: () => t });
  assert.equal(guard.fail().locked, false);
  assert.equal(guard.fail().locked, false);
  const third = guard.fail();
  assert.equal(third.locked, true);
  assert.equal(third.remainingMs, 30000);
  t += 31000;
  assert.equal(guard.isLocked(), false);
  guard.fail(); guard.fail();
  assert.equal(guard.fail().remainingMs, 60000);
  t += 61000;
  guard.fail(); guard.fail();
  assert.equal(guard.fail().remainingMs, 120000);
});

test('o bloqueio tem teto de 10 minutos e sobrevive a recarregar a página', () => {
  let t = 0;
  const storage = memoryStorage();
  let guard = new GateGuard({ storage, now: () => t });
  for (let round = 0; round < 12; round += 1) { guard.fail(); guard.fail(); const r = guard.fail(); assert.ok(r.remainingMs <= 600000); t += 700000; }
  guard.fail(); guard.fail(); guard.fail();
  guard = new GateGuard({ storage, now: () => t });
  assert.equal(guard.isLocked(), true);
});

test('acertar zera erros e bloqueios', () => {
  const guard = new GateGuard({ storage: memoryStorage(), now: () => 0 });
  guard.fail(); guard.fail();
  guard.success();
  assert.equal(guard.fail().triesLeft, 2);
});
