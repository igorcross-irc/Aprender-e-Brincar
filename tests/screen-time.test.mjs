import test from 'node:test';
import assert from 'node:assert/strict';
import { memoryStorage } from './helpers.mjs';

globalThis.localStorage = memoryStorage();
globalThis.window = globalThis;
const { ScreenTime, defaultLimitFor, DEFAULT_LIMITS } = await import('../src/core/screen-time.js');

const fresh = (age, saved) => {
  globalThis.localStorage = memoryStorage(saved ? { aprender_brincar_screen_time_v1: JSON.stringify(saved) } : {});
  return new ScreenTime({ ageProvider: () => age });
};

test('padrão protetor por idade, sem o responsável configurar nada', () => {
  assert.equal(fresh('6-12m').limitMinutes, 10);
  assert.equal(fresh('2-3y').limitMinutes, 30);
  assert.equal(fresh('4-5y').limitMinutes, 45);
  Object.values(DEFAULT_LIMITS).forEach((minutes) => assert.ok(minutes > 0 && minutes <= 60));
  assert.equal(defaultLimitFor('desconhecida'), 30);
});

test('quem tinha "sem limite" gravado sem escolher volta ao padrão; escolha explícita é respeitada', () => {
  assert.equal(fresh('2-3y', { limitMinutes: 0, days: {} }).limitMinutes, 30);
  assert.equal(fresh('2-3y', { limitMinutes: 0, explicit: true, days: {} }).limitMinutes, 0);
  assert.equal(fresh('2-3y', { limitMinutes: 20, explicit: true, days: {} }).limitMinutes, 20);
});

test('mudar a idade muda o padrão; escolher fixa o valor', () => {
  let age = '12-18m';
  globalThis.localStorage = memoryStorage();
  const time = new ScreenTime({ ageProvider: () => age });
  assert.equal(time.limitMinutes, 10);
  age = '3-4y';
  assert.equal(time.limitMinutes, 40);
  time.setLimit(15);
  age = '4-5y';
  assert.equal(time.limitMinutes, 15);
  time.useDefaultLimit();
  assert.equal(time.limitMinutes, 45);
});

test('passar do limite e tempo extra', () => {
  const time = fresh('2-3y');
  const key = (() => { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; })();
  time.state.days[key] = 29 * 60000;
  assert.equal(time.isOverLimit(), false);
  time.state.days[key] = 30 * 60000;
  assert.equal(time.isOverLimit(), true);
  time.addExtraMinutes(10);
  assert.equal(time.isOverLimit(), false);
});
