import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { VOICE_PRIORITY } from '../src/content/voice-priority.js';
import { pickMimeType } from '../src/core/voice-store.js';

test('toda fala prioritária existe como MP3 e não se repete', () => {
  const files = VOICE_PRIORITY.map((item) => item.file);
  assert.equal(new Set(files).size, files.length);
  files.forEach((file) => assert.ok(existsSync(`public/assets/audio/${file}`), `${file} não existe`));
  VOICE_PRIORITY.forEach((item) => assert.ok(item.text.trim().length > 0));
});

test('escolhe o primeiro formato de gravação suportado', () => {
  assert.equal(pickMimeType((t) => t === 'audio/mp4'), 'audio/mp4'); // Safari
  assert.equal(pickMimeType((t) => t.startsWith('audio/webm')), 'audio/webm;codecs=opus'); // Chrome
  assert.equal(pickMimeType(() => false), '');
  assert.equal(pickMimeType(() => { throw new Error('x'); }), '');
});
