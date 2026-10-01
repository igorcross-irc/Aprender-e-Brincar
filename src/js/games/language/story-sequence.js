import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playSfx } from '../../engine/sfx.js';
import { gameShellMarkup } from '../game-shell.js';

// História em sequência: as cenas aparecem embaralhadas e a criança toca na ordem em que aconteceram.
export class StorySequenceGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.timer = null;
  }

  start(stories = [], level = 1, options = {}) {
    this.stories = [...stories].sort(() => Math.random() - 0.5);
    this.ageId = options.ageId || '3-4y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    this.round = 0;
    this.correct = 0;
    this.attempts = 0;
    this.finished = false;
    this.render();
  }

  render() {
    if (this.round >= this.stories.length) return this.finish();
    const story = this.stories[this.round];
    const scenes = story.scenes.map((icon, index) => ({ icon, index, sentence: story.words[index] }));
    const shuffled = [...scenes].sort(() => Math.random() - 0.5);
    if (shuffled.every((scene, position) => scene.index === position)) shuffled.reverse();
    let next = 0;
    this.container.innerHTML = gameShellMarkup({
      backId: 'story-seq-back',
      title: `📖 ${story.title}`,
      round: this.round,
      rounds: this.stories.length,
      body: `
        <div class="story-slots">${scenes.map((_, index) => `<div class="story-slot" data-slot="${index}"><b>${index + 1}</b></div>`).join('')}</div>
        <p class="story-hint">O que aconteceu primeiro?</p>
        <div class="story-cards">${shuffled.map((scene) => `<button class="story-card" data-scene="${scene.index}" aria-label="Cena"><span aria-hidden="true">${scene.icon}</span></button>`).join('')}</div>`
    });
    this.container.querySelector('#story-seq-back').addEventListener('click', () => { this.stop(); this.onBack(); });
    this.audio?.prompt?.(null, `${story.title} Toque nas figuras na ordem da história. O que aconteceu primeiro?`);
    const hint = this.container.querySelector('.story-hint');
    this.container.querySelectorAll('.story-card').forEach((button) => button.addEventListener('click', () => {
      if (button.disabled) return;
      const scene = scenes[Number(button.dataset.scene)];
      this.attempts += 1;
      if (scene.index !== next) {
        playSfx('retry');
        button.classList.add('animate-shake');
        this.audio?.play(null, next === 0 ? 'Hum, o que aconteceu primeiro?' : 'E depois? Pense no que veio em seguida.');
        window.setTimeout(() => button.classList.remove('animate-shake'), 450);
        return;
      }
      this.correct += 1;
      playSfx('success');
      button.disabled = true;
      button.classList.add('used');
      const slot = this.container.querySelector(`[data-slot="${next}"]`);
      slot.classList.add('filled');
      slot.insertAdjacentHTML('beforeend', `<span aria-hidden="true">${scene.icon}</span>`);
      this.audio?.play(null, scene.sentence);
      next += 1;
      if (hint) hint.textContent = next < scenes.length ? 'E depois?' : 'Fim da história! 🎉';
      if (next < scenes.length) return;
      this.round += 1;
      this.timer = window.setTimeout(() => { if (this.container.querySelector('.story-cards')) this.render(); }, 2600);
    }));
  }

  stop() {
    if (this.timer) window.clearTimeout(this.timer);
    this.timer = null;
  }

  finish() {
    if (this.finished) return;
    this.finished = true;
    const rounds = this.stories.length;
    this.onComplete?.({ mode: 'evaluate', score: rounds, rounds, correct: this.correct, attempts: this.attempts, maxScore: rounds, completedRounds: rounds, difficulty: this.difficulty.level, ageId: this.ageId });
  }
}
