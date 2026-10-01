import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';

// Rimas e som inicial: a criança ouve uma palavra e escolhe a figura que combina pelo som.
const SETS = {
  rhymes: {
    title: '🎵 Rimas',
    prompt: (word) => `${word.label} rima com…?`,
    success: (word, answer) => `${word.label}, ${answer.label}! Rimou!`,
    words: [
      { label: 'Gato', icon: '🐱', answer: { label: 'Rato', icon: '🐭' } },
      { label: 'Mão', icon: '✋', answer: { label: 'Pão', icon: '🍞' } },
      { label: 'Abelha', icon: '🐝', answer: { label: 'Ovelha', icon: '🐑' } },
      { label: 'Queijo', icon: '🧀', answer: { label: 'Beijo', icon: '😘' } },
      { label: 'Pato', icon: '🦆', answer: { label: 'Sapato', icon: '👟' } },
      { label: 'Janela', icon: '🪟', answer: { label: 'Panela', icon: '🍲' } },
      { label: 'Leão', icon: '🦁', answer: { label: 'Avião', icon: '✈️' } },
      { label: 'Bolo', icon: '🎂', answer: { label: 'Rolo', icon: '🧻' } }
    ]
  },
  initial: {
    title: '🔤 Com Que Som Começa?',
    prompt: (word) => `${word.syllable}… ${word.label}. Qual começa igual?`,
    success: (word, answer) => `${word.syllable}! ${word.label} e ${answer.label}!`,
    words: [
      { label: 'Macaco', syllable: 'Ma', icon: '🐒', answer: { label: 'Maçã', icon: '🍎' } },
      { label: 'Bola', syllable: 'Bo', icon: '⚽', answer: { label: 'Bolo', icon: '🎂' } },
      { label: 'Gato', syllable: 'Ga', icon: '🐱', answer: { label: 'Galinha', icon: '🐔' } },
      { label: 'Sapo', syllable: 'Sa', icon: '🐸', answer: { label: 'Sapato', icon: '👟' } },
      { label: 'Banana', syllable: 'Ba', icon: '🍌', answer: { label: 'Baleia', icon: '🐳' } },
      { label: 'Carro', syllable: 'Ca', icon: '🚗', answer: { label: 'Casa', icon: '🏠' } },
      { label: 'Pato', syllable: 'Pa', icon: '🦆', answer: { label: 'Palhaço', icon: '🤡' } },
      { label: 'Lua', syllable: 'Lu', icon: '🌙', answer: { label: 'Luva', icon: '🧤' } }
    ]
  }
};

export class WordSoundsGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timer = null;
  }

  shuffle(list) {
    const result = [...list];
    for (let i = result.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
    return result;
  }

  start(setName = 'rhymes', level = 1, options = {}) {
    this.set = SETS[setName] || SETS.rhymes;
    this.setName = setName;
    this.ageId = options.ageId || '3-4y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.rounds = this.difficulty.rounds;
    this.queue = this.shuffle(this.set.words).slice(0, this.rounds);
    this.round = 0;
    this.correct = 0;
    this.attempts = 0;
    this.finished = false;
    this.render();
  }

  render() {
    if (this.round >= this.queue.length) return this.finish();
    const word = this.queue[this.round];
    const distractors = this.shuffle(this.set.words.filter((other) => other !== word).map((other) => other.answer)).slice(0, this.ageId === '4-5y' ? 3 : 2);
    const options = this.shuffle([word.answer, ...distractors]);
    const prompt = this.set.prompt(word);
    this.container.innerHTML = gameShellMarkup({
      backId: 'words-back',
      title: this.set.title,
      round: this.round,
      rounds: this.queue.length,
      body: `
        <button class="word-hero" id="words-hear" aria-label="Ouvir ${word.label}"><span aria-hidden="true">${word.icon}</span><strong>${word.label}</strong><small>🔊</small></button>
        <div class="word-options">${options.map((option, index) => `<button class="word-option" data-option="${index}" aria-label="${option.label}"><span aria-hidden="true">${option.icon}</span><small>${option.label}</small></button>`).join('')}</div>`
    });
    this.container.querySelector('#words-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.container.querySelector('#words-hear').addEventListener('click', () => this.audio?.play(null, prompt));
    this.audio?.prompt?.(null, prompt);
    let done = false;
    this.container.querySelectorAll('.word-option').forEach((button) => button.addEventListener('click', () => {
      if (done) return;
      const option = options[Number(button.dataset.option)];
      this.attempts += 1;
      if (option !== word.answer) {
        playSfx('retry');
        button.classList.add('animate-shake');
        this.audio?.play(null, `${option.label}? Escute de novo: ${prompt}`);
        window.setTimeout(() => button.classList.remove('animate-shake'), 450);
        return;
      }
      done = true;
      this.correct += 1;
      playSfx('success');
      button.classList.add('right');
      this.audio?.play(null, this.set.success(word, option));
      this.round += 1;
      this.timer = window.setTimeout(() => { if (this.container.querySelector('.word-options')) this.render(); }, 2200);
    }));
  }

  stop() {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = null;
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    const rounds = this.queue.length;
    this.onComplete?.({ mode: 'evaluate', score: this.correct, rounds, correct: this.correct, attempts: this.attempts, maxScore: rounds, completedRounds: rounds, difficulty: this.difficulty.level, ageId: this.ageId });
  }
}
