import { resolveGameDifficulty } from '../../../core/game-difficulty-policy.js';
import { gameShellMarkup, enableDoneButton } from '../game-shell.js';

export const COMMUNICATION_CARDS = [
  { id: 'agua', icon: '💧', label: 'Água', phrase: 'Eu quero água' },
  { id: 'comer', icon: '🍎', label: 'Comer', phrase: 'Eu quero comer' },
  { id: 'colo', icon: '🤗', label: 'Colo', phrase: 'Eu quero colo' },
  { id: 'brincar', icon: '🧸', label: 'Brincar', phrase: 'Eu quero brincar' },
  { id: 'mais', icon: '➕', label: 'Mais', phrase: 'Mais, por favor' },
  { id: 'sono', icon: '😴', label: 'Sono', phrase: 'Estou com sono' },
  { id: 'banheiro', icon: '🚽', label: 'Banheiro', phrase: 'Quero ir ao banheiro' },
  { id: 'doi', icon: '🤕', label: 'Dói', phrase: 'Está doendo' },
  { id: 'feliz', icon: '😀', label: 'Feliz', phrase: 'Estou feliz' },
  { id: 'triste', icon: '😢', label: 'Triste', phrase: 'Estou triste' },
  { id: 'nao', icon: '🙅', label: 'Não', phrase: 'Não, obrigado' },
  { id: 'sim', icon: '👍', label: 'Sim', phrase: 'Sim!' }
];
const CARD_COUNT = { '18-24m': 6, '2-3y': 8, '3-4y': 12, '4-5y': 12 };

// Prancha de comunicação: a criança toca num cartão e o app fala o pedido por ela.
export class CommunicationBoardGame {
  constructor(containerId, audio, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audio;
    this.onComplete = onComplete;
    this.onBack = onBack;
  }

  start(level = 1, options = {}) {
    this.ageId = options.ageId || '2-3y';
    this.difficulty = resolveGameDifficulty(this.ageId, level, options);
    const cards = COMMUNICATION_CARDS.slice(0, CARD_COUNT[this.ageId] || 8);
    this.used = new Set();
    this.completed = false;
    this.container.innerHTML = gameShellMarkup({
      backId: 'talk-back',
      title: '💬 Eu Quero…',
      body: `<div class="talk-board">${cards.map((card) => `<button class="talk-card" data-talk="${card.id}" aria-label="${card.phrase}"><span aria-hidden="true">${card.icon}</span><small>${card.label}</small></button>`).join('')}</div>`,
      done: { id: 'talk-done', enabled: false }
    });
    this.container.querySelector('#talk-back').addEventListener('click', () => this.onBack());
    this.container.querySelectorAll('[data-talk]').forEach((button) => button.addEventListener('click', () => {
      const card = cards.find((item) => item.id === button.dataset.talk);
      if (!card) return;
      this.container.querySelectorAll('.talk-card.speaking').forEach((item) => item.classList.remove('speaking'));
      button.classList.add('speaking');
      this.audio?.play(null, card.phrase);
      this.used.add(card.id);
      if (this.used.size >= 3) enableDoneButton(this.container.querySelector('#talk-done'));
    }));
    this.container.querySelector('#talk-done').addEventListener('click', () => this.finish());
    this.audio?.prompt?.(null, 'O que você quer dizer? Toque num cartão.');
  }

  finish() {
    if (this.completed || this.used.size < 3) return;
    this.completed = true;
    this.onComplete?.({ mode: 'explore', score: this.used.size, rounds: 1, correct: 0, attempts: 0, maxScore: this.used.size, completedRounds: 1, difficulty: this.difficulty.level, ageId: this.ageId });
  }
}
