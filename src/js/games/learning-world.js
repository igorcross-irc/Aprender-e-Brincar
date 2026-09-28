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
    this.options = {};
    this.completed = false;
  }

  shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  start(mode, options = {}) {
    this.mode = mode;
    this.round = 0;
    this.score = 0;
    this.completed = false;
    this.options = options;

    const sources = {
      'discover-animals': options.items || [],
      'discover-colors': options.items || [],
      'find-color': options.items || [],
      'find-animal': options.items || [],
      'sound-guess': options.items || [],
      attention: options.items || [],
      'shape-match': developmentContent.shapes,
      'odd-one-out': options.items || developmentContent.objects,
      'size-sort': options.items || developmentContent.objects,
      count: developmentContent.numbers,
      'number-match': developmentContent.numbers,
      syllables: developmentContent.syllables,
      sequence: developmentContent.sequences,
      'discover-objects': developmentContent.objectsAdvanced,
      'body-parts': developmentContent.bodyParts,
      'match-pairs': developmentContent.objects,
      'classify-animals': developmentContent.categories,
      opposites: developmentContent.opposites,
      rhythm: developmentContent.rhythms,
      'guided-movement': developmentContent.movements,
      'baby-discover': developmentContent.babyDiscoveries,
      'baby-colors': developmentContent.colorsAdvanced,
      vocabulary: developmentContent.vocabulary,
      'story-interactive': developmentContent.stories,
      'music-rhythm': developmentContent.musicPatterns,
      'sort-groups': developmentContent.categories
    };
    this.items = sources[mode] || [];
    this.renderRound();
  }

  speak(text, audio = null) {
    this.audio.play(audio, text);
  }

  shell(title, body, instruction = '') {
    this.container.innerHTML = `
      <div class="w-full max-w-3xl flex flex-col gap-4 my-auto">
        <div class="flex items-center justify-between gap-3">
          <button id="learning-back" class="bg-white/95 text-slate-700 px-4 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button>
          <div class="bg-white/90 rounded-full px-4 py-2 shadow font-black text-indigo-700">${title}</div>
          <div class="bg-white/90 rounded-full px-4 py-2 shadow font-black text-amber-600">⭐ ${this.round + 1}/5</div>
        </div>
        ${instruction ? `<p class="text-center text-slate-600 font-semibold px-3">${this.escape(instruction)}</p>` : ''}
        ${body}
      </div>`;
    this.container.querySelector('#learning-back')?.addEventListener('click', () => this.onBack());
  }

  nextRound() {
    this.round += 1;
    if (this.round >= 5) {
      this.finish();
    } else {
      this.renderRound();
    }
  }

  renderRound() {
    if (this.round >= 5) return this.finish();
    const renderers = {
      'discover-animals': () => this.renderDiscover('🐾 Descobrir Animais', 'Toque em um animal para descobrir e ouvir.', true),
      'discover-colors': () => this.renderDiscover('🎨 Descobrir Cores', 'Toque em uma cor para descobrir.', false),
      'find-color': () => this.renderFindColor(),
      'find-animal': () => this.renderFindAnimal(false),
      'sound-guess': () => this.renderFindAnimal(true),
      'shape-match': () => this.renderShape(),
      'odd-one-out': () => this.renderOddOneOut(),
      'size-sort': () => this.renderSize(),
      count: () => this.renderCount(),
      'number-match': () => this.renderNumberMatch(),
      syllables: () => this.renderSyllables(),
      sequence: () => this.renderSequence(),
      attention: () => this.renderAttention(),
      'discover-objects': () => this.renderDiscoverObjects(),
      'body-parts': () => this.renderBodyParts(),
      'match-pairs': () => this.renderMatchPairs(),
      'classify-animals': () => this.renderClassify(),
      opposites: () => this.renderOpposites(),
      rhythm: () => this.renderRhythm(),
      'guided-movement': () => this.renderMovement(),
      'baby-discover': () => this.renderDiscover('🌱 Descobertas do Bebê', 'Toque para descobrir. Não há respostas certas ou erradas.', true),
      'baby-colors': () => this.renderDiscover('🌈 Cores para Descobrir', 'Toque em uma cor e observe.', false),
      vocabulary: () => this.renderVocabulary(),
      'story-interactive': () => this.renderStory(),
      'music-rhythm': () => this.renderMusic(),
      'sort-groups': () => this.renderSortGroups()
    };
    (renderers[this.mode] || renderers['discover-animals'])();
  }

  renderDiscover(title, instruction, withAudio) {
    const pool = this.shuffle(this.items).slice(0, Math.min(4, this.items.length));
    this.shell(title, `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="grid grid-cols-2 gap-4">
          ${pool.map((item) => `
            <button data-discover="${this.escape(item.id)}" class="bg-sky-50 rounded-3xl p-6 min-h-[155px] shadow border-4 border-sky-100 touch-target">
              <span class="text-6xl block">${item.icon || '🎨'}</span>
              <span class="font-black text-sky-800">${this.escape(item.label)}</span>
            </button>`).join('')}
        </div>
      </div>`, instruction);
    this.container.querySelectorAll('[data-discover]').forEach((button) => button.addEventListener('click', () => {
      const item = pool.find((entry) => entry.id === button.dataset.discover);
      if (!item) return;
      this.speak(item.sound ? `${item.label}. ${item.sound}` : item.label, withAudio ? item.audio : null);
      this.nextRound();
    }));
  }

  renderChoice(title, prompt, options, correctId, audio = null, success = 'Muito bem!', retry = 'Vamos tentar novamente!') {
    this.shell(title, `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="text-xl font-black text-indigo-700 mb-5">${this.escape(prompt)}</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${options.map((option) => `
            <button data-answer="${this.escape(option.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[145px] shadow-lg flex flex-col items-center justify-center gap-2 touch-target">
              <span class="text-6xl">${option.icon || '✨'}</span>
              <span class="font-black text-indigo-800 text-lg">${this.escape(option.label)}</span>
            </button>`).join('')}
        </div>
      </div>`);
    if (audio) this.speak(prompt, audio);
    else this.speak(prompt);
    this.container.querySelectorAll('.learning-option').forEach((button) => button.addEventListener('click', () => {
      if (button.dataset.answer === String(correctId)) {
        this.score += 1;
        button.classList.add('border-emerald-400', 'bg-emerald-50');
        this.speak(success);
        setTimeout(() => this.nextRound(), 450);
      } else {
        button.classList.add('border-rose-300', 'animate-shake');
        this.speak(retry);
        setTimeout(() => button.classList.remove('border-rose-300', 'animate-shake'), 450);
      }
    }));
  }

  renderFindColor() {
    const pool = this.shuffle(this.items).slice(0, 4);
    const target = pool[Math.floor(Math.random() * pool.length)];
    this.renderChoice('🎨 Encontre a Cor', `Onde está a cor ${target.label}?`, pool, target.id);
    pool.forEach((item) => {
      const button = this.container.querySelector(`[data-answer="${CSS.escape(item.id)}"]`);
      if (button) {
        button.style.backgroundColor = item.hex || '#fff';
        button.style.color = item.textDark ? '#1f2937' : '#fff';
        if (item.border) button.style.borderColor = '#94a3b8';
      }
    });
  }

  renderFindAnimal(soundMode) {
    const pool = this.shuffle(this.items).slice(0, 4);
    const target = pool[Math.floor(Math.random() * pool.length)];
    const prompt = soundMode ? 'Ouça com atenção. Quem fez esse som?' : `Onde está o ${target.label}?`;
    this.renderChoice(soundMode ? '🔊 Quem Fez Esse Som?' : '🐾 Encontre o Animal', prompt, pool, target.id, soundMode ? target.audio : null);
  }

  renderShape() {
    const pool = this.shuffle(this.items).slice(0, 4);
    const target = pool[Math.floor(Math.random() * pool.length)];
    this.renderChoice('🔷 Mundo das Formas', `Encontre o ${target.label}.`, pool, target.id);
  }

  renderOddOneOut() {
    const base = this.shuffle(this.items).slice(0, 3);
    const odd = this.shuffle(this.items.filter((item) => !base.some((b) => b.id === item.id)))[0];
    if (!odd) return this.renderChoice('🔎 Qual é Diferente?', 'Qual é diferente?', this.shuffle(this.items).slice(0, 4), this.items[0]?.id);
    const options = this.shuffle([...base, odd]);
    this.renderChoice('🔎 Qual é Diferente?', 'Qual é diferente dos outros?', options, odd.id);
  }

  renderSize() {
    const pool = this.shuffle(this.items).slice(0, 4);
    const big = pool.find((item) => item.size === 'grande');
    const target = big || pool[0];
    this.renderChoice('📏 Grande e Pequeno', 'Toque no que é grande.', pool, target.id);
  }

  renderCount() {
    const target = Math.floor(Math.random() * 5) + 1;
    const icon = ['🍎', '⭐', '🟢', '🦋', '🌸'][this.round % 5];
    const options = this.shuffle([target, ...this.shuffle([1, 2, 3, 4, 5].filter((n) => n !== target)).slice(0, 3)])
      .map((number) => ({ id: String(number), label: String(number), icon: String(number) }));
    this.shell('🔢 Vamos Contar', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="text-xl font-black text-indigo-700 mb-4">Quantos ${icon} você vê?</p>
        <div class="flex flex-wrap justify-center gap-2 text-5xl bg-amber-50 rounded-3xl p-6 mb-5">${Array.from({ length: target }, () => `<span>${icon}</span>`).join('')}</div>
        <div class="grid grid-cols-4 gap-3">${options.map((option) => `<button data-answer="${option.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-3xl font-black shadow touch-target">${option.label}</button>`).join('')}</div>
      </div>`, 'Conte os objetos e escolha a quantidade.');
    this.bindChoice(String(target), 'Muito bem!', 'Vamos contar novamente!');
  }

  renderNumberMatch() {
    const target = Math.floor(Math.random() * 5) + 1;
    const icon = '🍓';
    const options = this.shuffle([1, 2, 3, 4, 5]).map((number) => ({ id: String(number), label: String(number) }));
    this.shell('🔢 Número e Quantidade', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-6xl mb-4">${Array.from({ length: target }, () => icon).join(' ')}</div>
        <p class="text-xl font-black text-indigo-700 mb-4">Qual número combina com essa quantidade?</p>
        <div class="grid grid-cols-5 gap-2">${options.map((option) => `<button data-answer="${option.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-3xl font-black shadow touch-target">${option.label}</button>`).join('')}</div>
      </div>`, 'Observe a quantidade e escolha o número.');
    this.bindChoice(String(target), 'Muito bem!', 'Vamos contar novamente!');
  }

  bindChoice(correctId, success, retry) {
    this.container.querySelectorAll('.learning-option').forEach((button) => button.addEventListener('click', () => {
      if (button.dataset.answer === String(correctId)) {
        this.score += 1;
        button.classList.add('border-emerald-400', 'bg-emerald-50');
        this.speak(success);
        setTimeout(() => this.nextRound(), 450);
      } else {
        button.classList.add('border-rose-300', 'animate-shake');
        this.speak(retry);
        setTimeout(() => button.classList.remove('border-rose-300', 'animate-shake'), 450);
      }
    }));
  }

  renderSyllables() {
    const item = this.shuffle(this.items)[0];
    const correct = item.parts.length;
    const choices = this.shuffle([...new Set([correct, 1, 2, 3])]).slice(0, 3);
    this.shell('🗣️ Brincar com Sílabas', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-7xl mb-3">${item.icon}</div>
        <p class="text-3xl font-black text-indigo-700 mb-2">${this.escape(item.label)}</p>
        <p class="text-slate-600 mb-4">Vamos ouvir e separar em partes.</p>
        <div class="flex justify-center flex-wrap gap-2 mb-5">${item.parts.map((part) => `<span class="bg-violet-100 text-violet-800 font-black px-4 py-2 rounded-xl">${part}</span>`).join('')}</div>
        <div class="grid grid-cols-3 gap-3">${choices.map((count) => `<button data-answer="${count}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-4 shadow touch-target font-black">${count} ${count === 1 ? 'parte' : 'partes'}</button>`).join('')}</div>
        <button id="speak-word" class="mt-4 bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl touch-target">🔊 Ouvir palavra</button>
      </div>`, 'Bata palmas ou conte as partes da palavra.');
    this.container.querySelector('#speak-word').addEventListener('click', () => this.speak(item.label));
    this.bindChoice(String(correct), `${item.parts.join(' - ')}. Muito bem!`, 'Vamos ouvir mais uma vez.');
  }

  renderSequence() {
    const sequence = this.shuffle(this.items)[0];
    const answer = sequence.answer;
    const distractors = ['🟢', '🟣', '🟠', '⬜', '⭐'].filter((item) => item !== answer);
    const choices = this.shuffle([answer, ...distractors]).slice(0, 4);
    this.shell('🔁 Complete a Sequência', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="text-xl font-black text-indigo-700 mb-4">O que vem depois?</p>
        <div class="flex justify-center gap-3 text-5xl bg-sky-50 rounded-3xl p-6 mb-5">${sequence.items.map((item) => `<span>${item}</span>`).join('')}</div>
        <div class="grid grid-cols-4 gap-3">${choices.map((item) => `<button data-answer="${this.escape(item)}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-4xl shadow touch-target">${item}</button>`).join('')}</div>
      </div>`, 'Observe o padrão e escolha o que vem depois.');
    this.bindChoice(answer, 'Muito bem! Você descobriu o padrão.', 'Observe a sequência mais uma vez.');
  }

  renderAttention() {
    if (!this.items.length) return this.renderDiscover('👂 Atenção Auditiva', 'Vamos ouvir!', false);
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pool = this.shuffle(this.items).slice(0, 4);
    if (!pool.some((item) => item.id === target.id)) pool[0] = target;
    this.shell('👂 Ouça e Encontre', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-7xl mb-5">👂</div>
        <p class="text-lg font-bold text-slate-700 mb-5">Ouça com atenção e encontre o que você ouviu.</p>
        <button id="listen-again" class="bg-indigo-600 text-white font-black px-7 py-4 rounded-2xl shadow touch-target mb-5">🔊 Ouvir novamente</button>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${pool.map((item) => `<button data-answer="${this.escape(item.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[140px] shadow touch-target"><span class="text-6xl">${item.icon}</span><span class="font-black">${this.escape(item.label)}</span></button>`).join('')}</div>
      </div>`);
    this.container.querySelector('#listen-again').addEventListener('click', () => this.speak(target.label, target.audio));
    this.bindChoice(target.id, 'Muito bem! Você encontrou.', 'Vamos ouvir mais uma vez.');
    this.speak(target.label, target.audio);
  }



  renderVocabulary() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pool = this.shuffle(this.items).slice(0, 4);
    if (!pool.some((x) => x.id === target.id)) pool[0] = target;
    this.renderChoice('🗣️ Palavras do Dia a Dia', `Onde está ${target.label.toLowerCase()}?`, pool, target.id);
  }

  renderStory() {
    const story = this.items[this.round % this.items.length];
    const scene = story.scenes[this.round % story.scenes.length];
    this.shell('📖 História Interativa', `
      <div class="bg-white/95 rounded-3xl p-7 shadow-xl text-center">
        <div class="text-8xl mb-4">${scene}</div>
        <h3 class="text-2xl font-black text-indigo-700 mb-2">${this.escape(story.title)}</h3>
        <p class="text-slate-600 mb-5">O que aconteceu nesta parte?</p>
        <button id="story-next" class="bg-violet-500 text-white font-black px-8 py-4 rounded-2xl shadow touch-target">Continuar ▶️</button>
      </div>`, 'Vamos descobrir a história juntos.');
    this.container.querySelector('#story-next').addEventListener('click', () => { this.score += 1; this.nextRound(); });
  }

  renderMusic() {
    const pattern = this.items[this.round % this.items.length];
    this.shell('🎵 Música e Ritmo', `
      <div class="bg-white/95 rounded-3xl p-7 shadow-xl text-center">
        <div class="text-7xl mb-4">${pattern.pattern.join(' ')}</div>
        <h3 class="text-2xl font-black text-indigo-700">${this.escape(pattern.label)}</h3>
        <p class="text-slate-600 my-4">Faça o ritmo junto comigo.</p>
        <button id="music-done" class="bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl shadow touch-target">👏 Fiz o ritmo!</button>
      </div>`, 'Observe, imite e brinque com o ritmo.');
    this.container.querySelector('#music-done').addEventListener('click', () => { this.score += 1; this.speak('Muito bem!'); setTimeout(() => this.nextRound(), 400); });
  }

  renderSortGroups() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const same = this.items.filter((x) => x.group === target.group && x.id !== target.id)[0] || target;
    const others = this.shuffle(this.items.filter((x) => x.group !== target.group)).slice(0, 3);
    this.renderChoice('🧩 Quem Combina?', `Quem combina com ${target.label}?`, this.shuffle([same, ...others]), same.id);
  }

  renderDiscoverObjects() {
    const pool = this.shuffle(this.items).slice(0, 4);
    this.renderChoice('🔎 Descobrir Objetos', 'Toque em um objeto para descobrir o nome.', pool, pool[0]?.id);
  }

  renderBodyParts() {
    const pool = this.shuffle(this.items).slice(0, 4);
    const target = pool[Math.floor(Math.random() * pool.length)];
    this.renderChoice('🧍 Meu Corpo', `Onde está a ${target.label.toLowerCase()}?`, pool, target.id);
  }

  renderMatchPairs() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pairMap = { bola:'boneca', boneca:'bola', carro:'aviao', aviao:'carro', casa:'arvore', arvore:'casa', maca:'banana', banana:'maca' };
    const correctId = pairMap[target.id] || target.id;
    const correct = this.items.find((item) => item.id === correctId) || target;
    const distractors = this.shuffle(this.items.filter((item) => item.id !== correct.id && item.id !== target.id)).slice(0, 3);
    this.renderChoice('🧩 Encontre o Par', `O que combina com ${target.label}?`, this.shuffle([correct, ...distractors]), correct.id);
  }

  renderClassify() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const sameGroup = this.items.filter((item) => item.group === target.group && item.id !== target.id);
    const correct = sameGroup[0] || target;
    const distractors = this.shuffle(this.items.filter((item) => item.group !== target.group)).slice(0, 3);
    this.renderChoice('🐾 Classificar', `O que pertence ao mesmo grupo de ${target.label}?`, this.shuffle([correct, ...distractors]), correct.id);
  }

  renderOpposites() {
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    const options = this.shuffle(this.items.map((entry) => ({ id: entry.pair, label: entry.pair, icon: entry.pairIcon })));
    this.renderChoice('↔️ Opostos', `Qual é o contrário de ${item.label}?`, options, item.pair);
  }

  renderRhythm() {
    const item = this.items[this.round % this.items.length];
    this.shell('🎵 Brinque com o Ritmo', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-7xl mb-4">${item.pattern.join(' ')}</div>
        <p class="text-xl font-black text-indigo-700 mb-4">Observe o ritmo e escolha o mesmo padrão.</p>
        <div class="grid grid-cols-2 gap-3">${this.shuffle(this.items).map((entry) => `<button data-answer="${this.escape(entry.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 shadow touch-target font-black">${entry.pattern.join(' ')}</button>`).join('')}</div>
      </div>`, 'Você pode bater palmas junto.');
    this.bindChoice(item.id, 'Muito bem! Ritmo combinado.', 'Vamos observar de novo.');
  }

  renderMovement() {
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    this.shell('🏃 Desafio do Movimento', `
      <div class="bg-white/95 rounded-3xl p-8 shadow-xl text-center">
        <div class="text-8xl mb-5">${item.icon}</div>
        <h3 class="text-3xl font-black text-indigo-700 mb-3">${this.escape(item.label)}</h3>
        <p class="text-slate-600 mb-6">Faça o movimento e toque quando terminar.</p>
        <button id="movement-done" class="bg-emerald-500 text-white font-black text-xl px-8 py-5 rounded-3xl shadow-lg touch-target">✅ Fiz!</button>
      </div>`, 'Vamos brincar juntos!');
    this.container.querySelector('#movement-done').addEventListener('click', () => {
      this.score += 1; this.speak('Muito bem!'); setTimeout(() => this.nextRound(), 500);
    });
    this.speak(item.label);
  }

  finish() {
    if (this.completed) return;
    this.completed = true;
    this.speak('Muito bem! Você terminou a brincadeira!');
    this.onComplete?.();
    this.container.innerHTML = `
      <div class="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl text-center my-auto">
        <div class="text-7xl mb-4">🌟</div>
        <h2 class="text-3xl font-black text-indigo-700">Muito bem!</h2>
        <p class="text-slate-600 mt-2 mb-2">Você completou esta brincadeira.</p>
        <p class="text-indigo-600 font-black mb-6">${this.score} de 5 respostas corretas</p>
        <div class="flex gap-3">
          <button id="learning-menu" class="flex-1 bg-slate-100 text-slate-700 font-black py-4 rounded-2xl touch-target">Menu</button>
          <button id="learning-again" class="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl touch-target">Jogar</button>
        </div>
      </div>`;
    this.container.querySelector('#learning-menu').addEventListener('click', () => this.onBack());
    this.container.querySelector('#learning-again').addEventListener('click', () => this.start(this.mode, this.options));
  }

  escape(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }
}
