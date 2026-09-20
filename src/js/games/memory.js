export class MemoryGame {
  constructor(containerId, audioEngine, onComplete) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
  }

  start(items, level = 1) {
    this.container.innerHTML = '';
    this.matchedPairs = 0;
    this.flippedCards = [];

    // Define quantidade de pares de acordo com o nível
    const pairCount = level === 1 ? 2 : level === 2 ? 4 : 6;
    const selected = items.slice(0, pairCount);
    const deck = [...selected, ...selected].sort(() => Math.random() - 0.5);

    const grid = document.createElement('div');
    grid.className = `memory-grid level-${level}`;

    deck.forEach((item, index) => {
      const card = document.createElement('button');
      card.className = 'memory-card';
      card.dataset.id = item.id;
      card.dataset.index = index;
      card.innerHTML = `<span class="card-back">❓</span><span class="card-front">${item.icon || '🎨'}</span>`;
      
      card.addEventListener('click', () => this.flipCard(card, item));
      grid.appendChild(card);
    });

    this.container.appendChild(grid);
  }

  flipCard(card, item) {
    if (this.flippedCards.length === 2 || card.classList.contains('flipped')) return;

    card.classList.add('flipped');
    this.flippedCards.push({ card, item });
    this.audio.play(item.audio, item.label);

    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    const [first, second] = this.flippedCards;

    if (first.item.id === second.item.id) {
      this.matchedPairs++;
      this.flippedCards = [];
      this.audio.play('par_correto.mp3', 'Muito bem! Você encontrou um par!');

      if (this.matchedPairs === this.cards.length / 2) {
        setTimeout(() => {
          if (this.onComplete) this.onComplete();
        }, 1000);
      }
    } else {
      setTimeout(() => {
        first.card.classList.remove('flipped');
        second.card.classList.remove('flipped');
        this.flippedCards = [];
      }, 1200);
    }
  }
}