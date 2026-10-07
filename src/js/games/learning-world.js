import { developmentContent } from '../../content/development-content.js';
import { childVisualMarkup } from '../../core/child-visual-system.js';
import { getChildInterfacePolicy } from '../../core/child-interface-policy.js';
import { showChildFeedback } from '../../core/child-feedback-system.js';
import { getChoiceGridClass } from '../../core/child-choice-policy.js';
import { DiscoverModes } from './learning-modes/discover.js';
import { ChoiceModes } from './learning-modes/choice.js';
import { NumberLanguageModes } from './learning-modes/number-language.js';
import { RhythmModes } from './learning-modes/rhythm.js';

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
    this.interfacePolicy = getChildInterfacePolicy(this.options.ageId);
    this.voiceFirst = this.interfacePolicy.voiceFirst;

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
    this.totalRounds = 5;
    const level = Number(this.options.difficulty || 1);
    if (this.items.length > 0 && level > 1) {
      const target = Math.max(2, Math.min(this.items.length, level === 2 ? 5 : 7));
      this.items = this.shuffle(this.items).slice(0, target);
    }
    // Histórias: uma história inteira por partida, uma cena por rodada.
    if (mode === 'story-interactive' && this.items.length) {
      this.story = this.shuffle(this.items)[0];
      this.totalRounds = this.story.scenes.length;
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
    if (this.options.title) title = `${String(title).split(' ')[0]} ${this.escape(this.options.title)}`;
    const difficulty = Number(this.options.difficulty || 1);
    const difficultyLabel = difficulty <= 1 ? '🌱 Descoberta' : difficulty === 2 ? '⭐ Explorar' : difficulty === 3 ? '🚀 Desafio' : '🏆 Avançado';
    this.container.innerHTML = `
      <div class="w-full max-w-3xl flex flex-col gap-4 my-auto">
        <div class="flex items-center justify-between gap-3">
          <button id="learning-back" class="game-back" aria-label="Voltar">⬅️</button>
          <div class="bg-white/90 rounded-full px-4 py-2 shadow font-black text-indigo-700">${title}</div>
          <div class="flex gap-2"><div class="hidden sm:block bg-violet-50 rounded-full px-3 py-2 shadow font-black text-violet-600">${difficultyLabel}</div><div class="bg-white/90 rounded-full px-4 py-2 shadow font-black text-amber-600">⭐ ${this.round + 1}/${this.totalRounds}</div></div>
        </div>
        ${instruction ? `<p class="child-instruction text-center text-slate-600 font-semibold px-3">${this.escape(instruction)}</p>` : ''}
        ${body}
      </div>`;
    if (instruction && speakInstruction) {
      if (this.voiceFirst) window.setTimeout(() => this.audio?.prompt?.(null, instruction), 120);
      else if (this.audio) this.audio.lastPrompt = { audioPath: null, text: instruction };
    }
    this.container.querySelector('#learning-back')?.addEventListener('click', () => {
      this.clearPending();
      this.onBack();
    });
  }

  nextRound() {
    if (this.completed) return;
    this.round += 1;
    if (this.round >= this.totalRounds) this.finish();
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
    if (this.round >= this.totalRounds) return this.finish();
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

  renderChoice(title, prompt, options, correctId, audio = null, success = 'Muito bem!', retry = 'Ops, tente de novo!') {
    const maxChoices = this.interfacePolicy?.maxChoices || 4;
    const correct = options.find((item) => String(item.id) === String(correctId));
    const alternatives = options.filter((item) => String(item.id) !== String(correctId));
    const safeOptions = correct ? [correct, ...this.shuffle(alternatives).slice(0, Math.max(1, maxChoices - 1))] : options.slice(0, maxChoices);
    this.shell(title, `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="child-instruction text-xl font-black text-indigo-700 mb-5">${this.escape(prompt)}</p>
        <div class="grid ${getChoiceGridClass(this.options.ageId, safeOptions.length)} gap-4">
          ${safeOptions.map((option) => `
            <button data-answer="${this.escape(option.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[145px] shadow-lg flex flex-col items-center justify-center gap-2 touch-target transition">
              ${childVisualMarkup(option.label, { fallbackIcon: option.icon || '✨', decorative: true, size: 'large' })}
              <span class="child-label font-black text-indigo-800 text-lg">${this.escape(option.label)}</span>
            </button>`).join('')}
        </div>
      </div>`, 'Escolha a resposta. Você pode tentar quantas vezes quiser.', false);
    this.audio?.prompt?.(audio, prompt);
    this.bindChoice(correctId, success, retry, safeOptions);
  }

  bindChoice(correctId, success, retry, options = []) {
    this.container.querySelectorAll('.learning-option').forEach((button) => button.addEventListener('click', () => {
      if (this.roundLocked || this.completed) return;
      const correct = button.dataset.answer === String(correctId);
      if (correct) {
        this.roundLocked = true;
        this.score += 1;
        showChildFeedback(this.container, 'success', 650);
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
        showChildFeedback(this.container, 'retry', 500);
        button.classList.add('border-rose-300', 'animate-shake');
        this.speak(retry);
        window.setTimeout(() => button.classList.remove('border-rose-300', 'animate-shake'), 450);
      }
    }));
  }

  finish() {
    if (this.completed) return;
    this.completed = true;
    this.clearPending();
    this.speak('Muito bem! Você terminou a brincadeira!');
    // A tela de resultado é responsabilidade do controlador de experiência.
    this.onComplete?.({ score: this.score, rounds: this.totalRounds, correct: this.score, completedRounds: this.totalRounds, mode: this.options.mode || 'evaluate' });
  }

  escape(value = '') {
    return String(value).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));
  }
}

// Os modos ficam em arquivos separados (learning-modes/) e entram na classe como métodos.
[DiscoverModes, ChoiceModes, NumberLanguageModes, RhythmModes].forEach((Modes) => {
  Object.getOwnPropertyNames(Modes.prototype).filter((name) => name !== 'constructor').forEach((name) => {
    Object.defineProperty(LearningWorldGame.prototype, name, Object.getOwnPropertyDescriptor(Modes.prototype, name));
  });
});
