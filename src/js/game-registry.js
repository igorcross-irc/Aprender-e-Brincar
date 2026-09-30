import { LearningWorldGame } from './games/learning-world.js';
import { MemoryGame } from './games/memory.js';
import { CardsGame } from './games/cards.js';
import { CanvasGame } from './games/canvas.js';
import { PuzzleGame } from './games/puzzle.js';
import { BalloonPopGame } from './games/balloon-pop.js';
import { OddOneOutGame } from './games/independent/odd-one-out.js';
import { NumberOrderGame } from './games/independent/number-order.js';
import { ColorHuntGame } from './games/independent/color-hunt.js';
import { RhythmCopyGame } from './games/independent/rhythm-copy.js';
import { SoundSequenceGame } from './games/independent/sound-sequence.js';
import { vocabularyData } from '../data/vocabulary.js';
import { developmentContent } from '../content/development-content.js';
import { getAgeExperienceConfig } from '../core/age-experience-policy.js';

const WORLD = 'world';
const EXPLORATION = new Set(['discovery-sounds','discovery-animals','discovery-colors','discover-objects','baby-discover','baby-colors','movement','rhythm','guided-movement','canvas']);

export function createGameRegistry({ containerId, audio, storage }) {
  const definitions = new Map();

  const addWorld = (ids, mode, items = null) => ids.forEach((id) => definitions.set(id, { id, kind: WORLD, mode, items, exploration: EXPLORATION.has(id) }));
  const addGuided = (ids) => ids.forEach((id) => definitions.set(id, { id, kind: 'guided', exploration: EXPLORATION.has(id) }));
  const addIndependent = (ids, Game, items = null) => ids.forEach((id) => definitions.set(id, { id, kind: 'independent', Game, items, exploration: EXPLORATION.has(id) }));

  addWorld(['discovery-sounds','attention-auditory','attention-path'], 'attention', vocabularyData.animals);
  addWorld(['discovery-animals','animals'], 'discover-animals', vocabularyData.animals);
  addWorld(['discovery-colors','colors'], 'discover-colors', vocabularyData.colors);
  addWorld(['find-color'], 'find-color', vocabularyData.colors);
  addWorld(['find-animal','animal-homes'], 'find-animal', vocabularyData.animals);
  addWorld(['sound-guess','animal-sound-memory'], 'sound-guess', vocabularyData.animals);
  addWorld(['shape-match'], 'shape-match');
  addWorld(['size-sort','compare-sizes'], 'size-sort');
  addWorld(['count','count-more'], 'count');
  addWorld(['number-match'], 'number-match');
  addWorld(['sequence','shape-sequence'], 'sequence');
  addWorld(['syllables'], 'syllables');
  addWorld(['discover-objects','object-hunt'], 'discover-objects');
  addWorld(['body-parts'], 'body-parts');
  addWorld(['match-pairs','memory-objects'], 'match-pairs');
  addWorld(['classify-animals','animal-families','sort-groups'], 'classify-animals');
  addWorld(['opposites'], 'opposites');
  addWorld(['rhythm'], 'rhythm');
  addWorld(['guided-movement','movement-copy'], 'guided-movement');
  addWorld(['baby-discover'], 'baby-discover');
  addWorld(['baby-colors'], 'baby-colors');
  addWorld(['vocabulary','action-words'], 'vocabulary');
  addWorld(['story-interactive','story-choices'], 'story-interactive');
  addWorld(['music-rhythm'], 'music-rhythm');

  addIndependent(['odd-one-out'], OddOneOutGame);
  addIndependent(['number-order'], NumberOrderGame);
  addIndependent(['color-hunt-2'], ColorHuntGame, vocabularyData.colors);
  addIndependent(['rhythm-copy'], RhythmCopyGame, developmentContent.musicPatterns);
  addIndependent(['sound-sequence'], SoundSequenceGame, vocabularyData.animals);

  addGuided(['phrases','communication','phrase-builder-2','rhymes','sound-initial','story-sequence','movement']);

  definitions.set('canvas', { id:'canvas', kind:'canvas', Game:CanvasGame, exploration:true });
  definitions.set('memory', { id:'memory', kind:'memory', Game:MemoryGame });
  definitions.set('puzzle', { id:'puzzle', kind:'puzzle', Game:PuzzleGame });
  definitions.set('balloons', { id:'balloons', kind:'balloons', Game:BalloonPopGame });

  return {
    has(id) { return definitions.has(id); },
    get(id) { return definitions.get(id) || null; },
    mode(id) { return definitions.get(id)?.exploration ? 'explore' : 'evaluate'; },
    all() { return [...definitions.values()]; },
    launch(id, { adaptive = { level: 1 }, ageId = '2-3y', onWin, onBack }) {
      const def = definitions.get(id);
      if (!def) throw new Error(`Atividade sem registro de execução: ${id}`);
      const age = adaptive?.age || getAgeExperienceConfig(ageId, adaptive?.level || 1);
      const level = age.level;
      if (def.kind === WORLD) {
        const game = new LearningWorldGame(containerId, audio, onWin, onBack);
        if (def.items) audio?.preload?.(def.items.map((x) => x.audio).filter(Boolean));
        return game.start(def.mode, { items: def.items || undefined, difficulty: level, mode: def.exploration ? 'explore' : 'evaluate', age });
      }
      if (def.kind === 'independent') {
        const game = new def.Game(containerId, audio, onWin, onBack);
        return def.items ? game.start(def.items, level, { ageId, age }) : game.start(level, { ageId, age });
      }
      if (def.kind === 'canvas') return new def.Game(containerId, audio, onWin, onBack).start(level, { ageId, age });
      if (def.kind === 'memory') return new def.Game(containerId, audio, onWin, onBack).start(vocabularyData.animals, level, { ageId, age });
      if (def.kind === 'puzzle') return new def.Game(containerId, audio, onWin, onBack).start(vocabularyData.animals, level, { ageId, age });
      if (def.kind === 'balloons') return new def.Game(containerId, audio, onWin, onBack).start(level, { ageId, age });
      if (def.kind === 'guided') return { guided: true };
      throw new Error(`Tipo de execução desconhecido para ${id}: ${def.kind}`);
    }
  };
}

export function validateGameRegistry(registry, activities = []) {
  const errors = [];
  for (const activity of activities) {
    if (!registry.has(activity.id)) errors.push(`atividade sem registro: ${activity.id}`);
    const definition = registry.get(activity.id);
    if (definition?.kind === WORLD && !definition.mode) errors.push(`world sem modo: ${activity.id}`);
    if (definition?.kind === 'independent' && !definition.Game) errors.push(`independent sem renderer: ${activity.id}`);
  }
  return errors;
}
