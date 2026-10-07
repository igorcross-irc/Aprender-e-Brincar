import test from 'node:test';
import assert from 'node:assert/strict';
import { ProfileRegistry, keyFor, splitKey, PER_CHILD_KEYS, MAX_PROFILES, AVATARS } from '../src/core/profiles.js';
import { createBackup, restoreBackup, parseBackup } from '../src/core/backup.js';
import { memoryStorage } from './helpers.mjs';

test('o perfil 1 usa as chaves de sempre; os outros ganham sufixo', () => {
  assert.equal(keyFor('aprender_brincar_stars', 'p1'), 'aprender_brincar_stars');
  assert.equal(keyFor('aprender_brincar_stars', undefined), 'aprender_brincar_stars');
  assert.equal(keyFor('aprender_brincar_stars', 'p3'), 'aprender_brincar_stars:p3');
  assert.deepEqual(splitKey('ab_favorites:p2'), { base: 'ab_favorites', id: 'p2' });
  assert.deepEqual(splitKey('ab_favorites'), { base: 'ab_favorites', id: 'p1' });
  assert.equal(splitKey('chave_qualquer:p2'), null);
});

test('começa com uma criança (quem já usava o app não perde nada)', () => {
  const reg = new ProfileRegistry(memoryStorage({ aprender_brincar_stars: '7' }));
  assert.equal(reg.count, 1);
  assert.equal(reg.activeId, 'p1');
  assert.equal(reg.key('aprender_brincar_stars'), 'aprender_brincar_stars');
  assert.equal(reg.summaries()[0].stars, 7);
});

test('adicionar, trocar e persistir', () => {
  const storage = memoryStorage();
  const reg = new ProfileRegistry(storage);
  const kid = reg.add();
  assert.equal(kid.id, 'p2');
  assert.notEqual(kid.avatar, reg.list()[0].avatar);
  assert.ok(reg.setActive('p2'));
  assert.equal(reg.key('ab_favorites'), 'ab_favorites:p2');
  assert.equal(new ProfileRegistry(storage).activeId, 'p2'); // sobrevive a recarregar
  assert.equal(reg.setActive('p9'), false);
});

test('limite de crianças e ids sempre novos', () => {
  const reg = new ProfileRegistry(memoryStorage());
  for (let i = 1; i < MAX_PROFILES; i += 1) assert.ok(reg.add());
  assert.equal(reg.add(), null);
  assert.equal(reg.canAdd(), false);
  reg.remove('p3');
  assert.equal(reg.add().id, 'p3');
  assert.ok(reg.list().every((p) => AVATARS.includes(p.avatar)));
});

test('apagar remove só os dados daquela criança e nunca a última', () => {
  const storage = memoryStorage({ aprender_brincar_stars: '5', 'aprender_brincar_stars:p2': '9', 'ab_favorites:p2': '["memory"]', ab_muted: 'true' });
  const reg = new ProfileRegistry(storage);
  reg.add(); reg.setActive('p2');
  assert.equal(reg.remove('p2'), true);
  assert.equal(storage.getItem('aprender_brincar_stars:p2'), null);
  assert.equal(storage.getItem('ab_favorites:p2'), null);
  assert.equal(storage.getItem('aprender_brincar_stars'), '5');
  assert.equal(storage.getItem('ab_muted'), 'true');
  assert.equal(reg.activeId, 'p1'); // a criança apagada estava ativa
  assert.equal(reg.remove('p1'), false); // última
});

test('registro corrompido volta ao padrão', () => {
  for (const bad of ['{', '[]', '{"profiles":[]}', '{"profiles":[{"id":"x"}]}', 'null']) {
    const reg = new ProfileRegistry(memoryStorage({ ab_profiles_v1: bad }));
    assert.equal(reg.count, 1, bad);
    assert.equal(reg.activeId, 'p1');
  }
});

test('resumo mostra nome, idade e estrelas de cada criança', () => {
  const storage = memoryStorage({
    aprender_brincar_child_name: 'Isa', aprender_brincar_progress_v1: JSON.stringify({ stars: 12 }),
    'aprender_brincar_child_name:p2': 'Léo', 'aprender_brincar_child_age:p2': '3-4y', 'aprender_brincar_stars:p2': '4'
  });
  const reg = new ProfileRegistry(storage); reg.add();
  const [a, b] = reg.summaries();
  assert.deepEqual([a.name, a.stars, b.name, b.age, b.stars], ['Isa', 12, 'Léo', '3-4y', 4]);
});

test('backup leva todas as crianças e restaura tudo', () => {
  const storage = memoryStorage({
    aprender_brincar_child_name: 'Isa', 'aprender_brincar_child_name:p2': 'Léo', 'aprender_brincar_progress_v1:p2': '{"stars":3}',
    aprender_brincar_learning_session_v1: '{"em":"andamento"}', ab_audio_index_v2: '[]'
  });
  const reg = new ProfileRegistry(storage); reg.add();
  const code = createBackup(storage);
  const parsed = parseBackup(code);
  assert.equal(parsed.data['aprender_brincar_child_name:p2'], 'Léo');
  assert.equal(parsed.data.aprender_brincar_learning_session_v1, undefined);
  assert.equal(parsed.data.ab_audio_index_v2, undefined);
  const other = memoryStorage({ 'aprender_brincar_child_name:p2': 'antigo' });
  assert.equal(restoreBackup(code, other).ok, true);
  assert.equal(other.getItem('aprender_brincar_child_name:p2'), 'Léo');
  assert.equal(new ProfileRegistry(other).count, 2);
});

test('toda chave por criança listada existe em PER_CHILD_KEYS sem duplicar', () => {
  assert.equal(new Set(PER_CHILD_KEYS).size, PER_CHILD_KEYS.length);
});

test('escolher o bichinho de uma criança', () => {
  const storage = memoryStorage();
  const reg = new ProfileRegistry(storage);
  assert.equal(reg.setAvatar('p1', '🐼'), true);
  assert.equal(new ProfileRegistry(storage).list()[0].avatar, '🐼');
  assert.equal(reg.setAvatar('p1', '💩'), false);
  assert.equal(reg.setAvatar('p9', '🐼'), false);
});
