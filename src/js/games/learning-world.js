import { developmentContent } from '../../content/development-content.js';

export class LearningWorldGame {
  constructor(containerId, audioEngine, onComplete, onBack) {
    this.container = document.getElementById(containerId);
    this.audio = audioEngine;
    this.onComplete = onComplete;
    this.onBack = onBack;
    this.round = 0;
    this.score = 0;
    this.mode = 'discover';
    this.items = [];
    this.current = null;
  }

  shuffle(items) {
    return [...items].sort(() => Math.random() - 0.5);
  }

  start(mode, options = {}) {
    this.mode = mode;
    this.round = 0;
    this.score = 0;
    this.options = options;
    if (mode === 'discover-animals') this.items = options.items || [];
    if (mode === 'discover-colors') this.items = options.items || [];
    if (mode === 'find-color') this.items = options.items || [];
    if (mode === 'find-animal') this.items = options.items || [];
    if (mode === 'shape-match') this.items = developmentContent.shapes;
    if (mode === 'odd-one-out') this.items = options.items || developmentContent.objects;
    if (mode === 'size-sort') this.items = options.items || developmentContent.objects;
    if (mode === 'count') this.items = developmentContent.numbers;
    if (mode === 'number-match') this.items = developmentContent.numbers;
    if (mode === 'syllables') this.items = developmentContent.syllables;
    if (mode === 'sequence') this.items = developmentContent.sequences;
    if (mode === 'sound-guess') this.items = options.items || [];
    if (mode === 'attention') this.items = options.items || [];
    this.renderRound();
  }

  speak(text, audio = null) {
    this.audio.play(audio, text);
  }

  shell(title, body) {
    this.container.innerHTML = `
      <div class="w-full max-w-3xl flex flex-col gap-4 my-auto">
        <div class="flex items-center justify-between gap-3">
          <button id="learning-back" class="bg-white/95 text-slate-700 px-4 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button>
          <div class="bg-white/90 rounded-full px-4 py-2 shadow font-black text-indigo-700">${title}</div>
          <div class="bg-white/90 rounded-full px-4 py-2 shadow font-black text-amber-600">⭐ ${this.round}/5</div>
        </div>
        ${body}
      </div>`;
    this.container.querySelector('#learning-back')?.addEventListener('click', () => this.onBack());
  }

  renderRound() {
    if (this.round >= 5) return this.finish();
    if (this.mode === 'discover-animals' || this.mode === 'discover-colors') return this.renderDiscover();
    if (this.mode === 'find-color') return this.renderFindColor();
    if (this.mode === 'find-animal' || this.mode === 'sound-guess') return this.renderFindAnimal();
    if (this.mode === 'shape-match') return this.renderShape();
    if (this.mode === 'odd-one-out') return this.renderOddOneOut();
    if (this.mode === 'size-sort') return this.renderSize();
    if (this.mode === 'count') return this.renderCount();
    if (this.mode === 'number-match') return this.renderNumberMatch();
    if (this.mode === 'syllables') return this.renderSyllables();
    if (this.mode === 'sequence') return this.renderSequence();
    if (this.mode === 'attention') return this.renderAttention();
    return this.renderDiscover();
  }

  chooseCorrect(item, options, title, feedback = 'Muito bem!') {
    this.shell(title, `
      <div class="bg-white/95 rounded-3xl p-5 shadow-xl text-center">
        <p class="text-lg font-bold text-slate-700 mb-4">${this.escape(this.prompt || 'Escolha a resposta.')}</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${options.map((option) => `
            <button data-answer="${option.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[145px] shadow-lg flex flex-col items-center justify-center gap-2 touch-target">
              <span class="text-6xl">${option.icon || '✨'}</span>
              <span class="font-black text-indigo-800 text-lg">${this.escape(option.label)}</span>
            </button>`).join('')}
        </div>
      </div>`);
    this.container.querySelectorAll('.learning-option').forEach((button) => button.addEventListener('click', () => {
      const correct = button.dataset.answer === item.id;
      if (correct) {
        this.score++;
        this.round++;
        button.classList.add('border-emerald-400', 'bg-emerald-50');
        this.speak(feedback, item.audio);
        setTimeout(() => this.renderRound(), 500);
      } else {
        button.classList.add('border-rose-300');
        this.speak('Vamos tentar de novo!');
        setTimeout(() => button.classList.remove('border-rose-300'), 450);
      }
    }));
  }

  renderDiscover() {
    const pool = this.shuffle(this.items).slice(0, 4);
    const item = pool[Math.floor(Math.random() * pool.length)];
    this.prompt = this.mode === 'discover-colors' ? 'Toque para descobrir a cor.' : 'Toque para descobrir e ouvir.';
    this.shell(this.mode === 'discover-colors' ? '🎨 Descobrindo Cores' : '🐾 Descobrindo Animais', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="text-slate-600 font-semibold mb-5">${this.prompt}</p>
        <div class="grid grid-cols-2 gap-4">
          ${pool.map((x) => `<button data-discover="${x.id}" class="bg-sky-50 rounded-3xl p-6 min-h-[155px] shadow border-4 border-sky-100 touch-target">
            <span class="text-6xl block">${x.icon || '🎨'}</span><span class="font-black text-sky-800">${this.escape(x.label)}</span>
          </button>`).join('')}
        </div>
      </div>`);
    this.container.querySelectorAll('[data-discover]').forEach((button) => {
      button.addEventListener('click', () => {
        const x = pool.find((item) => item.id === button.dataset.discover);
        if (!x) return;
        this.speak(x.sound ? `${x.label}. ${x.sound}` : x.label, x.audio);
        this.round++;
        setTimeout(() => this.renderRound(), 650);
      });
    });
  }

  renderFindColor() {
    const pool = this.shuffle(this.items).slice(0, 4);
    this.current = pool[Math.floor(Math.random() * pool.length)];
    this.prompt = `Onde está a cor ${this.current.label}?`;
    this.chooseCorrect(this.current, pool, '🎨 Encontre a Cor');
    this.speak(this.prompt);
    pool.forEach((x) => {
      const btn = this.container.querySelector(`[data-answer="${x.id}"]`);
      if (btn) { btn.style.backgroundColor = x.hex; btn.style.color = x.textDark ? '#1f2937' : '#fff'; }
    });
  }

  renderFindAnimal() {
    const pool = this.shuffle(this.items).slice(0, 4);
    this.current = pool[Math.floor(Math.random() * pool.length)];
    this.prompt = this.mode === 'sound-guess' ? 'Ouça. Qual animal é esse?' : `Onde está o ${this.current.label}?`;
    this.chooseCorrect(this.current, pool, this.prompt);
    this.speak(this.mode === 'sound-guess' ? 'Ouça com atenção.' : this.prompt, this.current.audio);
  }

  renderShape() {
    const pool = this.shuffle(this.items).slice(0, 4);
    this.current = pool[Math.floor(Math.random() * pool.length)];
    this.prompt = `Encontre o ${this.current.label}.`;
    this.chooseCorrect(this.current, pool, '🔷 Formas');
    this.speak(this.prompt);
  }

  renderOddOneOut() {
    const base = this.shuffle(this.items).slice(0, 3);
    const odd = this.shuffle(this.items.filter((x) => !base.some((b) => b.id === x.id)))[0];
    const options = this.shuffle([...base, odd]);
    this.current = odd;
    this.prompt = 'Qual é diferente dos outros?';
    this.chooseCorrect(odd, options, '🔎 Descubra o Diferente');
    this.speak(this.prompt);
  }

  renderSize() {
    const pool = this.shuffle(this.items).slice(0, 4);
    const big = pool.find((x) => x.size === 'grande') || pool[0];
    this.current = big;
    this.prompt = 'Toque no que é grande.';
    this.chooseCorrect(big, pool, '📏 Grande e Pequeno');
    this.speak(this.prompt);
  }

  renderCount() {
    const target = Math.floor(Math.random() * 5) + 1;
    const icons = ['🍎','⭐','🟢','🦋','🌸'][this.round % 5];
    const options = [target, ...this.shuffle([1,2,3,4,5].filter((n) => n !== target)).slice(0,3)].map((n) => ({ id: String(n), label: String(n), icon: String(n) }));
    this.current = options.find((x) => x.id === String(target));
    this.prompt = `Quantos ${icons} você vê?`;
    this.shell('🔢 Contar', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="text-xl font-black text-indigo-700 mb-4">${this.prompt}</p>
        <div class="flex flex-wrap justify-center gap-2 text-5xl bg-amber-50 rounded-3xl p-6 mb-5">${Array.from({length: target}, () => `<span>${icons}</span>`).join('')}</div>
        <div class="grid grid-cols-4 gap-3">${options.map((o) => `<button data-answer="${o.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-3xl font-black shadow touch-target">${o.label}</button>`).join('')}</div>
      </div>`);
    this.bindAnswer(String(target));
    this.speak(this.prompt);
  }

  renderNumberMatch() {
    const target = Math.floor(Math.random() * 5) + 1;
    const icons = '🍓';
    const options = this.shuffle([1,2,3,4,5]).map((n) => ({ id: String(n), label: String(n), icon: String(n) }));
    this.current = options.find((x) => x.id === String(target));
    this.prompt = `Qual número representa ${target} ${icons}?`;
    this.shell('🔢 Número e Quantidade', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-6xl mb-4">${Array.from({length: target}, () => icons).join(' ')}</div>
        <p class="text-xl font-black text-indigo-700 mb-4">Qual número?</p>
        <div class="grid grid-cols-5 gap-2">${options.map((o) => `<button data-answer="${o.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-3xl font-black shadow touch-target">${o.label}</button>`).join('')}</div>
      </div>`);
    this.bindAnswer(String(target));
    this.speak('Qual número combina com a quantidade?');
  }

  bindAnswer(correctId) {
    this.container.querySelectorAll('.learning-option').forEach((button) => button.addEventListener('click', () => {
      if (button.dataset.answer === correctId) {
        this.score++; this.round++; this.speak('Muito bem!'); setTimeout(() => this.renderRound(), 500);
      } else { button.classList.add('border-rose-300'); this.speak('Vamos contar novamente!'); setTimeout(() => button.classList.remove('border-rose-300'), 450); }
    }));
  }

  renderSyllables() {
    const item = this.shuffle(this.items)[0];
    this.current = item;
    this.prompt = `Vamos separar ${item.label} em partes.`;
    const options = this.shuffle(this.items).slice(0, 3);
    this.shell('🗣️ Sílabas e Palavras', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-7xl mb-3">${item.icon}</div>
        <p class="text-2xl font-black text-indigo-700 mb-2">${item.label}</p>
        <p class="text-slate-600 mb-5">Quantas partes ouvimos?</p>
        <div class="grid grid-cols-3 gap-3">${options.map((x) => `<button data-answer="${x.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-4 shadow touch-target font-black">${x.parts.length} sílabas</button>`).join('')}</div>
        <button id="speak-word" class="mt-4 bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl touch-target">🔊 Ouvir palavra</button>
      </div>`);
    this.container.querySelector('#speak-word').addEventListener('click', () => this.speak(item.label));
    this.container.querySelectorAll('.learning-option').forEach((button) => button.addEventListener('click', () => {
      const correct = button.dataset.answer === item.id;
      if (correct) { this.score++; this.round++; this.speak(`${item.parts.join(' - ')}. Muito bem!`); setTimeout(() => this.renderRound(), 700); }
      else this.speak('Vamos ouvir mais uma vez.');
    }));
    this.speak(this.prompt);
  }

  renderSequence() {
    const sequence = this.shuffle(this.items)[0];
    const answer = sequence.answer;
    this.current = { id: answer, label: answer, icon: answer };
    const choices = this.shuffle([answer, '❌', '🟢', '🟣'].filter((x, i, a) => a.indexOf(x) === i)).slice(0, 4);
    this.shell('🔁 Sequências', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="text-xl font-black text-indigo-700 mb-4">O que vem depois?</p>
        <div class="flex justify-center gap-3 text-5xl bg-sky-50 rounded-3xl p-6 mb-5">${sequence.items.map((x) => `<span>${x}</span>`).join('')}</div>
        <div class="grid grid-cols-4 gap-3">${choices.map((x) => `<button data-answer="${x}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-4xl shadow touch-target">${x}</button>`).join('')}</div>
      </div>`);
    this.bindAnswer(answer);
    this.speak('O que vem depois?');
  }

  renderAttention() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pool = this.shuffle(this.items).slice(0, 4);
    if (!pool.some((x) => x.id === target.id)) pool[0] = target;
    this.current = target;
    this.prompt = 'Ouça com atenção e encontre o que você ouviu.';
    this.shell('👂 Atenção Auditiva', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-7xl mb-5">👂</div>
        <p class="text-lg font-bold text-slate-700 mb-5">${this.prompt}</p>
        <button id="listen-again" class="bg-indigo-600 text-white font-black px-7 py-4 rounded-2xl shadow touch-target mb-5">🔊 Ouvir novamente</button>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${pool.map((x) => `<button data-answer="${x.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[140px] shadow touch-target"><span class="text-6xl">${x.icon}</span><span class="font-black">${this.escape(x.label)}</span></button>`).join('')}</div>
      </div>`);
    this.container.querySelector('#listen-again').addEventListener('click', () => this.speak(target.label, target.audio));
    this.bindAnswer(target.id);
    this.speak(target.label, target.audio);
  }

  finish() {
    this.speak('Muito bem! Você terminou a brincadeira!');
    this.container.innerHTML = `
      <div class="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl text-center my-auto">
        <div class="text-7xl mb-4">🌟</div>
        <h2 class="text-3xl font-black text-indigo-700">Muito bem!</h2>
        <p class="text-slate-600 mt-2 mb-6">Você completou esta brincadeira.</p>
        <div class="flex gap-3">
          <button id="learning-menu" class="flex-1 bg-slate-100 text-slate-700 font-black py-4 rounded-2xl touch-target">Menu</button>
          <button id="learning-again" class="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl touch-target">Jogar</button>
        </div>
      </div>`;
    this.onComplete?.();
    this.container.querySelector('#learning-menu').addEventListener('click', () => this.onBack());
    this.container.querySelector('#learning-again').addEventListener('click', () => this.start(this.mode, this.options));
  }

  escape(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
  }
}
