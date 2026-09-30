import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { playNote } from '../../engine/sfx.js';
import { gameShellMarkup, enableDoneButton } from '../game-shell.js';

const KEYS = [
  { note: 'Dó', freq: 261.63, color: '#ef4444', icon: '🐶' },
  { note: 'Ré', freq: 293.66, color: '#f97316', icon: '🐱' },
  { note: 'Mi', freq: 329.63, color: '#facc15', icon: '🐤' },
  { note: 'Fá', freq: 349.23, color: '#22c55e', icon: '🐸' },
  { note: 'Sol', freq: 392.0, color: '#06b6d4', icon: '🐳' },
  { note: 'Lá', freq: 440.0, color: '#3b82f6', icon: '🐘' },
  { note: 'Si', freq: 493.88, color: '#8b5cf6', icon: '🦋' },
  { note: 'Dó', freq: 523.25, color: '#ec4899', icon: '🐷' }
];
// "Brilha, brilha, estrelinha" em índices das teclas.
const SONG = [0, 0, 4, 4, 5, 5, 4, null, 3, 3, 2, 2, 1, 1, 0];

// Piano dos animais: tocar livremente ou ouvir uma música e imitar.
export class MusicKeysGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.songTimers = [];
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    const keyCount = ['6-12m', '12-18m', '18-24m'].includes(this.ageId) ? 5 : 8;
    this.keys = KEYS.slice(0, keyCount);
    this.taps = 0;
    this.target = 10;
    this.completed = false;
    this.container.innerHTML = gameShellMarkup({
      backId: 'music-back',
      title: '🎹 Piano dos Animais',
      body: `<div class="piano" style="--keys:${this.keys.length}">${this.keys.map((key, index) => `<button class="piano-key" data-no-tap data-key="${index}" style="--key:${key.color}" aria-label="Nota ${key.note}"><span aria-hidden="true">${key.icon}</span></button>`).join('')}</div>
             ${keyCount === 8 ? '<button id="music-song" class="music-song">🎵 Ouvir música</button>' : ''}`,
      done: { id: 'music-done', enabled: false }
    });
    this.container.querySelector('#music-back').addEventListener('click', () => { this.stopSong(); this.onBack(); });
    this.container.querySelectorAll('.piano-key').forEach((button) => button.addEventListener('pointerdown', () => this.press(Number(button.dataset.key), true)));
    this.container.querySelector('#music-song')?.addEventListener('click', () => this.playSong());
    this.container.querySelector('#music-done').addEventListener('click', () => this.finish());
    this.audio?.prompt?.(null, 'Toque nos animais para fazer música!');
  }

  press(index, byChild = false) {
    const key = this.keys[index];
    const button = this.container.querySelector(`[data-key="${index}"]`);
    if (!key || !button) return;
    playNote(key.freq);
    button.classList.remove('playing');
    void button.offsetWidth;
    button.classList.add('playing');
    if (!byChild) return;
    this.taps += 1;
    if (this.taps >= this.target) enableDoneButton(this.container.querySelector('#music-done'));
  }

  playSong() {
    this.stopSong();
    SONG.forEach((index, step) => {
      if (index == null) return;
      this.songTimers.push(window.setTimeout(() => {
        if (this.container.querySelector('.piano')) this.press(index);
      }, step * 420));
    });
  }

  stopSong() {
    this.songTimers.forEach((timer) => window.clearTimeout(timer));
    this.songTimers = [];
  }

  finish() {
    if (this.completed || this.taps < this.target) return;
    this.completed = true;
    this.stopSong();
    this.onComplete?.({ mode: 'explore', score: this.taps, rounds: 1, correct: 0, attempts: 0, maxScore: this.target, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId });
  }
}
