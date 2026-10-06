import test from 'node:test';
import assert from 'node:assert/strict';
import { createBackup, parseBackup, restoreBackup, BACKUP_KEYS, checksum } from '../src/core/backup.js';
import { memoryStorage } from './helpers.mjs';

const sample = () => memoryStorage({
  aprender_brincar_child_name: 'Isadora é "gênia" 🎈',
  aprender_brincar_child_age: '2-3y',
  aprender_brincar_stars: '12',
  aprender_brincar_progress_v1: JSON.stringify({ version: 8, stars: 12, activities: { memory: { completions: 3 } } }),
  ab_audio_index_v2: '["x.mp3"]',
  ab_update_checked_at: '123'
});

test('backup guarda só dados da criança e preferências, com acentos e emoji', () => {
  const code = createBackup(sample(), () => new Date('2026-10-06T10:00:00Z'));
  assert.ok(code.startsWith('AEB1.'));
  const parsed = parseBackup(code);
  assert.equal(parsed.ok, true);
  assert.equal(parsed.data.aprender_brincar_child_name, 'Isadora é "gênia" 🎈');
  assert.equal(parsed.data.ab_audio_index_v2, undefined);
  assert.equal(parsed.data.ab_update_checked_at, undefined);
  assert.equal(parsed.createdAt, '2026-10-06T10:00:00.000Z');
});

test('restaurar substitui o que havia e devolve os mesmos dados', () => {
  const code = createBackup(sample());
  const target = memoryStorage({ aprender_brincar_stars: '99', ab_muted: 'true', outra_coisa: 'fica' });
  const result = restoreBackup(code, target);
  assert.equal(result.ok, true);
  assert.equal(target.getItem('aprender_brincar_stars'), '12');
  assert.equal(target.getItem('ab_muted'), null);
  assert.equal(target.getItem('outra_coisa'), 'fica');
});

test('código adulterado, truncado ou de outro app é recusado sem mexer nos dados', () => {
  const code = createBackup(sample());
  const target = memoryStorage({ aprender_brincar_stars: '5' });
  for (const bad of ['', 'lixo', code.slice(0, -6), code.replace('AEB1', 'AEB2'), `${code.slice(0, 30)}${code[30] === 'B' ? 'C' : 'B'}${code.slice(31)}`]) {
    assert.equal(restoreBackup(bad, target).ok, false);
  }
  assert.equal(target.getItem('aprender_brincar_stars'), '5');
});

test('chaves desconhecidas dentro do código são ignoradas', () => {
  const body = JSON.stringify({ app: 'aprender-e-brincar', version: 1, data: { aprender_brincar_stars: '3', hacker_key: 'x' } });
  const code = `AEB1.${checksum(body)}.${Buffer.from(body).toString('base64')}`;
  const target = memoryStorage();
  assert.equal(restoreBackup(code, target).ok, true);
  assert.equal(target.getItem('hacker_key'), null);
  assert.ok(BACKUP_KEYS.includes('aprender_brincar_stars'));
});
