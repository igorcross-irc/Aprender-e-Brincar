renderAgeSelection() {
  this.container.innerHTML = `
    <div class="age-selection-container">
      <button id="btn-2-3" class="game-card-btn card-pink">
        <img src="/assets/images/icon-animais.png" class="card-img" alt="2 a 3 anos" />
        <span class="card-title">2 a 3 anos</span>
        <span class="card-tag">Primeiras Descobertas</span>
      </button>

      <button id="btn-4-5" class="game-card-btn card-blue">
        <img src="/assets/images/icon-numeros.png" class="card-img" alt="4 a 5 anos" />
        <span class="card-title">4 a 5 anos</span>
        <span class="card-tag">Aprendizado & Frases</span>
      </button>
    </div>
  `;

  document.getElementById('btn-2-3').addEventListener('click', () => {
    this.audio.play(null, 'Primeiras descobertas!');
    this.renderMenu2to3();
  });

  document.getElementById('btn-4-5').addEventListener('click', () => {
    this.audio.play(null, 'Hora de aprender!');
    this.renderMenu4to5();
  });
}