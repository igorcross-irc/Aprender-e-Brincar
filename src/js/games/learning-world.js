import { developmentContent } from '../../content/development-content.js';
import { childVisualMarkup } from '../../core/child-visual-system.js';

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
    this.roundLocked = false;
    this.advanceTimer = null;
    this.discoveryTouched = new Set();
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
    this.clearPending();
    this.mode = mode;
    this.round = 0;
    this.score = 0;
    this.completed = false;
    this.roundLocked = false;
    this.options = { difficulty: 1, mode: 'evaluate', ageId: '2-3y', ...options };
    this.voiceFirst = ['6-12m','12-18m','18-24m','2-3y'].includes(this.options.ageId);

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
    const level = Number(this.options.difficulty || 1);
    if (this.items.length > 0 && level > 1) {
      const target = Math.max(2, Math.min(this.items.length, level === 2 ? 5 : 7));
      this.items = this.shuffle(this.items).slice(0, target);
    }
    this.renderRound();
  }

  clearPending() {
    if (this.advanceTimer) window.clearTimeout(this.advanceTimer);
    this.advanceTimer = null;
    this.roundLocked = false;
    if (this.audio?.stop) this.audio.stop();
  }

  speak(text, audio = null) {
    this.audio?.play(audio, text);
  }

  shell(title, body, instruction = '', speakInstruction = true) {
    const difficulty = Number(this.options.difficulty || 1);
    const difficultyLabel = difficulty <= 1 ? '🌱 Descoberta' : difficulty === 2 ? '⭐ Explorar' : difficulty === 3 ? '🚀 Desafio' : '🏆 Avançado';
    this.container.innerHTML = `
      <div class="w-full max-w-3xl flex flex-col gap-4 my-auto">
        <div class="flex items-center justify-between gap-3">
          <button id="learning-back" class="bg-white/95 text-slate-700 px-4 py-3 rounded-full font-bold shadow touch-target">⬅️ Voltar</button>
          <div class="bg-white/90 rounded-full px-4 py-2 shadow font-black text-indigo-700">${title}</div>
          <div class="flex gap-2"><div class="hidden sm:block bg-violet-50 rounded-full px-3 py-2 shadow font-black text-violet-600">${difficultyLabel}</div><div class="bg-white/90 rounded-full px-4 py-2 shadow font-black text-amber-600">⭐ ${this.round + 1}/5</div></div>
        </div>
        ${instruction ? `<p class="child-instruction text-center text-slate-600 font-semibold px-3">${this.escape(instruction)}</p>` : ''}
        ${body}
      </div>`;
    if (instruction && speakInstruction && this.voiceFirst) window.setTimeout(() => this.speak(instruction), 120);
    this.container.querySelector('#learning-back')?.addEventListener('click', () => {
      this.clearPending();
      this.onBack();
    });
  }

  nextRound() {
    if (this.completed) return;
    this.round += 1;
    if (this.round >= 5) this.finish();
    else {
      this.roundLocked = false;
      this.discoveryTouched.clear();
      this.renderRound();
    }
  }

  scheduleNext(delay = 650) {
    if (this.completed || this.roundLocked) return;
    this.roundLocked = true;
    this.advanceTimer = window.setTimeout(() => {
      this.advanceTimer = null;
      this.roundLocked = false;
      this.nextRound();
    }, delay);
  }

  renderRound() {
    if (this.round >= 5) return this.finish();
    this.roundLocked = false;
    const renderers = {
      'discover-animals': () => this.renderDiscover('🐾 Descobrir Animais', 'Toque nos animais para ouvir. Quando quiser, toque em Continuar.', true),
      'discover-colors': () => this.renderDiscover('🎨 Descobrir Cores', 'Toque nas cores para ouvir o nome. Depois, toque em Continuar.', true),
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
      'baby-discover': () => this.renderDiscover('🌱 Descobertas do Bebê', 'Toque para descobrir. Não há respostas certas ou erradas. Toque em Continuar quando quiser.', true),
      'baby-colors': () => this.renderDiscover('🌈 Cores para Descobrir', 'Toque em uma cor para ouvir. Depois, toque em Continuar.', true),
      vocabulary: () => this.renderVocabulary(),
      'story-interactive': () => this.renderStory(),
      'music-rhythm': () => this.renderMusic(),
      'sort-groups': () => this.renderSortGroups()
    };
    const renderer = renderers[this.mode];
    if (!renderer) throw new Error(`Renderer ausente para modo de aprendizagem: ${this.mode}`);
    renderer();
  }

  renderDiscover(title, instruction, withAudio) {
    const poolSize = Math.min(this.items.length, this.options.difficulty >= 3 ? 5 : this.options.difficulty === 2 ? 4 : 3);
    const pool = this.shuffle(this.items).slice(0, poolSize);
    this.discoveryTouched.clear();
    this.shell(title, `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="grid grid-cols-2 gap-4">
          ${pool.map((item) => `
            <button data-discover="${this.escape(item.id)}" class="bg-sky-50 rounded-3xl p-6 min-h-[155px] shadow border-4 border-sky-100 touch-target transition">
              ${childVisualMarkup(item.label, { fallbackIcon: item.icon || '🎨', decorative: true, size: 'large' })}
              <span class="child-label font-black text-sky-800">${this.escape(item.label)}</span>
            </button>`).join('')}
        </div>
        <button id="discover-next" aria-label="Continuar" class="child-control mt-5 w-full bg-emerald-500 text-white font-black px-6 py-4 rounded-2xl shadow touch-target opacity-50" disabled>Continuar ▶️</button>
      </div>`, instruction);

    const next = this.container.querySelector('#discover-next');
    this.container.querySelectorAll('[data-discover]').forEach((button) => button.addEventListener('click', () => {
      const item = pool.find((entry) => entry.id === button.dataset.discover);
      if (!item || this.completed) return;
      this.discoveryTouched.add(item.id);
      button.classList.add('border-emerald-400', 'bg-emerald-50');
      if (withAudio && item.audio) {
        this.speak(item.label, item.audio);
        if (item.sound) window.setTimeout(() => this.speak(item.sound), 1200);
      } else {
        this.speak(item.sound ? `${item.label}. ${item.sound}` : item.label);
      }
      if (next) {
        next.disabled = false;
        next.classList.remove('opacity-50');
      }
    }));
    next?.addEventListener('click', () => {
      if (!this.discoveryTouched.size || this.roundLocked) return;
      this.score += 1;
      this.speak('Muito bem!');
      this.scheduleNext(700);
    });
  }

  renderChoice(title, prompt, options, correctId, audio = null, success = 'Muito bem!', retry = 'Vamos tentar novamente!') {
    this.shell(title, `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="child-instruction text-xl font-black text-indigo-700 mb-5">${this.escape(prompt)}</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${options.map((option) => `
            <button data-answer="${this.escape(option.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[145px] shadow-lg flex flex-col items-center justify-center gap-2 touch-target transition">
              ${childVisualMarkup(option.label, { fallbackIcon: option.icon || '✨', decorative: true, size: 'large' })}
              <span class="child-label font-black text-indigo-800 text-lg">${this.escape(option.label)}</span>
            </button>`).join('')}
        </div>
      </div>`, 'Escolha a resposta. Você pode tentar quantas vezes quiser.', false);
    this.speak(prompt, audio);
    this.bindChoice(correctId, success, retry, options);
  }

  bindChoice(correctId, success, retry, options = []) {
    this.container.querySelectorAll('.learning-option').forEach((button) => button.addEventListener('click', () => {
      if (this.roundLocked || this.completed) return;
      const correct = button.dataset.answer === String(correctId);
      if (correct) {
        this.roundLocked = true;
        this.score += 1;
        button.classList.add('border-emerald-400', 'bg-emerald-50');
        const option = options.find((item) => String(item.id) === String(correctId));
        if (option?.audio) this.speak(option.label, option.audio);
        else this.speak(success);
        this.advanceTimer = window.setTimeout(() => {
          this.advanceTimer = null;
          this.roundLocked = false;
          this.nextRound();
        }, option?.audio ? 900 : 600);
      } else {
        button.classList.add('border-rose-300', 'animate-shake');
        this.speak(retry);
        window.setTimeout(() => button.classList.remove('border-rose-300', 'animate-shake'), 450);
      }
    }));
  }

  renderFindColor() {
    const poolSize = Math.min(this.items.length, this.options.difficulty >= 3 ? 5 : this.options.difficulty === 2 ? 4 : 3);
    const pool = this.shuffle(this.items).slice(0, poolSize);
    const target = pool[Math.floor(Math.random() * pool.length)];
    this.renderChoice('🎨 Encontre a Cor', `Onde está a cor ${target.label}?`, pool, target.id, target.audio);
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
    this.renderChoice(soundMode ? '🔊 Quem Fez Esse Som?' : '🐾 Encontre o Animal', prompt, pool, target.id, null, 'Muito bem! Você encontrou!', 'Vamos ouvir e tentar novamente.');
    if (soundMode) window.setTimeout(() => this.speak(target.sound || target.label), 1100);
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
    this.renderChoice('🔎 Qual é Diferente?', 'Qual é diferente dos outros?', this.shuffle([...base, odd]), odd.id);
  }

  renderSize() {
    const pool = this.shuffle(this.items).slice(0, 4);
    const target = pool.find((item) => item.size === 'grande') || pool[0];
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
    this.bindChoice(String(target), 'Muito bem!', 'Vamos contar novamente!', options);
  }

  renderNumberMatch() {
    const target = Math.floor(Math.random() * 5) + 1;
    const options = this.shuffle([1, 2, 3, 4, 5]).map((number) => ({ id: String(number), label: String(number) }));
    this.shell('🔢 Número e Quantidade', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-6xl mb-4">${Array.from({ length: target }, () => '🍓').join(' ')}</div>
        <p class="text-xl font-black text-indigo-700 mb-4">Qual número combina com essa quantidade?</p>
        <div class="grid grid-cols-5 gap-2">${options.map((option) => `<button data-answer="${option.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-3xl font-black shadow touch-target">${option.label}</button>`).join('')}</div>
      </div>`, 'Observe a quantidade e escolha o número.');
    this.bindChoice(String(target), 'Muito bem!', 'Vamos contar novamente!', options);
  }

  renderSyllables() {
    const item = this.shuffle(this.items)[0];
    const correct = item.parts.length;
    const choices = this.shuffle([...new Set([correct, 1, 2, 3])]).slice(0, 3).map((count) => ({ id: String(count), label: `${count} ${count === 1 ? 'parte' : 'partes'}` }));
    this.shell('🗣️ Brincar com Sílabas', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-7xl mb-3">${item.icon}</div><p class="text-3xl font-black text-indigo-700 mb-2">${this.escape(item.label)}</p>
        <p class="text-slate-600 mb-4">Vamos ouvir e separar em partes.</p>
        <div class="flex justify-center flex-wrap gap-2 mb-5">${item.parts.map((part) => `<span class="bg-violet-100 text-violet-800 font-black px-4 py-2 rounded-xl">${part}</span>`).join('')}</div>
        <div class="grid grid-cols-3 gap-3">${choices.map((c) => `<button data-answer="${c.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-4 shadow touch-target font-black">${c.label}</button>`).join('')}</div>
        <button id="speak-word" class="mt-4 bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl touch-target">🔊 Ouvir palavra</button>
      </div>`, 'Bata palmas ou conte as partes da palavra.');
    this.container.querySelector('#speak-word').addEventListener('click', () => this.speak(item.label, item.audio));
    this.bindChoice(String(correct), `${item.parts.join(' - ')}. Muito bem!`, 'Vamos ouvir mais uma vez.', choices);
    this.speak(item.label, item.audio);
  }

  renderSequence() {
    const sequence = this.shuffle(this.items)[0];
    const answer = sequence.answer;
    const choices = this.shuffle([answer, ...['🟢', '🟣', '🟠', '⬜', '⭐'].filter((x) => x !== answer)]).slice(0, 4).map((x) => ({ id: x, label: x, icon: x }));
    this.shell('🔁 Complete a Sequência', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center"><p class="text-xl font-black text-indigo-700 mb-4">O que vem depois?</p>
      <div class="flex justify-center gap-3 text-5xl bg-sky-50 rounded-3xl p-6 mb-5">${sequence.items.map((x) => `<span>${x}</span>`).join('')}</div>
      <div class="grid grid-cols-4 gap-3">${choices.map((c) => `<button data-answer="${this.escape(c.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-4xl shadow touch-target">${c.icon}</button>`).join('')}</div></div>`, 'Observe o padrão e escolha o que vem depois.');
    this.bindChoice(answer, 'Muito bem! Você descobriu o padrão.', 'Observe a sequência mais uma vez.', choices);
  }

  renderAttention() {
    if (!this.items.length) return this.renderDiscover('👂 Atenção Auditiva', 'Vamos ouvir e descobrir!', true);
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pool = this.shuffle(this.items).slice(0, 4);
    if (!pool.some((item) => item.id === target.id)) pool[0] = target;
    this.shell('👂 Ouça e Encontre', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center"><div class="text-7xl mb-5">👂</div>
      <p class="text-lg font-bold text-slate-700 mb-5">Ouça com atenção e encontre o que você ouviu.</p>
      <button id="listen-again" class="bg-indigo-600 text-white font-black px-7 py-4 rounded-2xl shadow touch-target mb-5">🔊 Ouvir novamente</button>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">${pool.map((item) => `<button data-answer="${this.escape(item.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[140px] shadow touch-target"><span class="text-6xl">${item.icon}</span><span class="font-black">${this.escape(item.label)}</span></button>`).join('')}</div></div>`);
    this.container.querySelector('#listen-again').addEventListener('click', () => this.speak(target.label, target.audio));
    this.bindChoice(target.id, 'Muito bem! Você encontrou.', 'Vamos ouvir mais uma vez.', pool);
    this.speak(target.label, target.audio);
  }

  renderVocabulary() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pool = this.shuffle(this.items).slice(0, 4);
    if (!pool.some((x) => x.id === target.id)) pool[0] = target;
    this.renderChoice('🗣️ Palavras do Dia a Dia', `Onde está ${target.label.toLowerCase()}?`, pool, target.id, null, 'Muito bem!', 'Vamos tentar novamente.');
  }

  renderStory() {
    const story = this.items[this.round % this.items.length];
    const scene = story.scenes[this.round % story.scenes.length];
    this.shell('📖 História Interativa', `<div class="bg-white/95 rounded-3xl p-7 shadow-xl text-center"><div class="text-8xl mb-4">${scene}</div><h3 class="text-2xl font-black text-indigo-700 mb-2">${this.escape(story.title)}</h3><p class="text-slate-600 mb-5">O que aconteceu nesta parte?</p><button id="story-next" class="bg-violet-500 text-white font-black px-8 py-4 rounded-2xl shadow touch-target">Continuar ▶️</button></div>`, 'Vamos descobrir a história juntos.');
    this.container.querySelector('#story-next').addEventListener('click', () => { if (this.roundLocked) return; this.score += 1; this.scheduleNext(500); });
    this.speak(story.words?.[this.round % story.words.length] || story.title);
  }

  renderMusic() {
    const pattern = this.items[this.round % this.items.length];
    this.shell('🎵 Música e Ritmo', `<div class="bg-white/95 rounded-3xl p-7 shadow-xl text-center"><div class="text-7xl mb-4">${pattern.pattern.join(' ')}</div><h3 class="text-2xl font-black text-indigo-700">${this.escape(pattern.label)}</h3><p class="text-slate-600 my-4">Faça o ritmo junto comigo.</p><button id="music-done" class="bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl shadow touch-target">👏 Fiz o ritmo!</button></div>`, 'Observe, imite e brinque com o ritmo.');
    this.container.querySelector('#music-done').addEventListener('click', () => { if (this.roundLocked) return; this.score += 1; this.speak('Muito bem!'); this.scheduleNext(650); });
    this.speak(pattern.label);
  }

  renderSortGroups() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const same = this.items.filter((x) => x.group === target.group && x.id !== target.id)[0] || target;
    const others = this.shuffle(this.items.filter((x) => x.group !== target.group)).slice(0, 3);
    this.renderChoice('🧩 Quem Combina?', `Quem combina com ${target.label}?`, this.shuffle([same, ...others]), same.id);
  }

  renderDiscoverObjects() {
    const pool = this.shuffle(this.items).slice(0, 4);
    this.discoveryTouched.clear();
    this.shell('🔎 Descobrir Objetos', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p id="discover-object-feedback" class="text-xl font-black text-indigo-700 mb-5">Toque em qualquer objeto para descobrir o nome.</p>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          ${pool.map((item) => `
            <button data-object="${this.escape(item.id)}" class="learning-object bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[145px] shadow-lg flex flex-col items-center justify-center gap-2 touch-target transition">
              <span class="text-6xl">${item.icon || '✨'}</span>
              <span class="font-black text-indigo-800 text-lg">${this.escape(item.label)}</span>
            </button>`).join('')}
        </div>
        <button id="discover-object-next" class="mt-5 w-full bg-emerald-500 text-white font-black px-6 py-4 rounded-2xl shadow touch-target opacity-50" disabled>Continuar ▶️</button>
      </div>`, 'Não existe resposta errada aqui. Explore os objetos que quiser.');

    const next = this.container.querySelector('#discover-object-next');
    const feedback = this.container.querySelector('#discover-object-feedback');
    this.container.querySelectorAll('[data-object]').forEach((button) => button.addEventListener('click', () => {
      if (this.completed || this.roundLocked) return;
      const item = pool.find((entry) => entry.id === button.dataset.object);
      if (!item) return;
      this.discoveryTouched.add(item.id);
      this.container.querySelectorAll('[data-object]').forEach((entry) => entry.classList.remove('border-emerald-400', 'bg-emerald-50'));
      button.classList.add('border-emerald-400', 'bg-emerald-50');
      if (feedback) feedback.textContent = `Isso é um ${item.label}! 👏`;
      this.speak(item.label, item.audio);
      if (next) {
        next.disabled = false;
        next.classList.remove('opacity-50');
      }
    }));
    next?.addEventListener('click', () => {
      if (!this.discoveryTouched.size || this.roundLocked) return;
      this.score += 1;
      this.speak('Muito bem!');
      this.scheduleNext(700);
    });
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
    const options = this.shuffle(this.items).map((entry) => ({ id: entry.id, label: entry.label, icon: entry.pattern.join(' ') }));
    this.shell('🎵 Brinque com o Ritmo', `<div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center"><div class="text-7xl mb-4">${item.pattern.join(' ')}</div><p class="text-xl font-black text-indigo-700 mb-4">Observe o ritmo e escolha o mesmo padrão.</p><div class="grid grid-cols-2 gap-3">${options.map((entry) => `<button data-answer="${this.escape(entry.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 shadow touch-target font-black">${entry.icon}</button>`).join('')}</div></div>`, 'Você pode bater palmas junto.');
    this.bindChoice(item.id, 'Muito bem! Ritmo combinado.', 'Vamos observar de novo.', options);
  }

  renderMovement() {
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    this.shell('🏃 Desafio do Movimento', `<div class="bg-white/95 rounded-3xl p-8 shadow-xl text-center"><div class="text-8xl mb-5">${item.icon}</div><h3 class="text-3xl font-black text-indigo-700 mb-3">${this.escape(item.label)}</h3><p class="text-slate-600 mb-6">Faça o movimento e toque quando terminar.</p><button id="movement-done" class="bg-emerald-500 text-white font-black text-xl px-8 py-5 rounded-3xl shadow-lg touch-target">✅ Fiz!</button></div>`, 'Vamos brincar juntos!');
    this.container.querySelector('#movement-done').addEventListener('click', () => { if (this.roundLocked) return; this.score += 1; this.speak('Muito bem!'); this.scheduleNext(650); });
    this.speak(item.label);
  }

  finish() {
    if (this.completed) return;
    this.completed = true;
    this.clearPending();
    this.speak('Muito bem! Você terminou a brincadeira!');
    this.onComplete?.({ score: this.score, rounds: 5, mode: this.options.mode || 'evaluate' });
    this.container.innerHTML = `<div class="w-full max-w-md bg-white rounded-[2rem] p-8 shadow-2xl text-center my-auto"><div class="text-7xl mb-4">🌟</div><h2 class="text-3xl font-black text-indigo-700">Muito bem!</h2><p class="text-slate-600 mt-2 mb-2">Você completou esta brincadeira.</p><p class="text-indigo-600 font-black mb-6">${this.score} de 5 respostas corretas</p><div class="flex gap-3"><button id="learning-menu" class="flex-1 bg-slate-100 text-slate-700 font-black py-4 rounded-2xl touch-target">Menu</button><button id="learning-again" class="flex-1 bg-emerald-500 text-white font-black py-4 rounded-2xl touch-target">Jogar</button></div></div>`;
    this.container.querySelector('#learning-menu').addEventListener('click', () => this.onBack());
    this.container.querySelector('#learning-again').addEventListener('click', () => this.start(this.mode, this.options));
  }

  escape(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }
}
