import test from 'node:test';
import assert from 'node:assert/strict';
import { classify, parseCsv, sha1, slugify, AUDIO_DIR } from '../scripts/lib/voice-common.mjs';

test('slug igual ao do app (sem acento, minúsculo, hífens)', () => {
  assert.equal(slugify('Água Fria!'), 'agua-fria');
  assert.equal(slugify('  Muito bem!  '), 'muito-bem');
});

test('CSV com aspas, vírgulas e aspas duplas', () => {
  const rows = parseCsv('texto,arquivo\n"Oi, tudo bem?","oi.mp3"\n"Ele disse ""oi""","ele.mp3"\n');
  assert.deepEqual(rows, [{ texto: 'Oi, tudo bem?', arquivo: 'oi.mp3' }, { texto: 'Ele disse "oi"', arquivo: 'ele.mp3' }]);
});

test('classifica provisória, trocada e ausente pelo hash', () => {
  const file = 'muito-bem.mp3';
  const real = sha1(`${AUDIO_DIR}/${file}`);
  assert.equal(classify({ file, sha1: real }), 'provisional');
  assert.equal(classify({ file, sha1: 'outro-hash' }), 'replaced');
  assert.equal(classify({ file, text: 'x' }), 'provisional'); // sem hash: assume provisória
  assert.equal(classify({ file: 'nao-existe-mesmo.mp3', sha1: real }), 'missing');
});
