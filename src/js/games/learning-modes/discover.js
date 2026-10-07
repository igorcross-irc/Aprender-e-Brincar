// Modos do mundo de aprendizagem (DiscoverModes): métodos que o LearningWorldGame recebe (ver learning-world.js).
import { childVisualMarkup } from '../../../core/child-visual-system.js';
import { showChildFeedback } from '../../../core/child-feedback-system.js';
import { keepCorrectChoice, getChoiceGridClass } from '../../../core/child-choice-policy.js';
import { withArticle } from '../../../core/pt-grammar.js';

export class DiscoverModes {
  renderDiscover(title, instruction, withAudio) {
    const poolSize = Math.min(this.items.length, this.interfacePolicy.maxChoices || 4, this.options.difficulty >= 3 ? 5 : this.options.difficulty === 2 ? 4 : 3);
    const pool = this.shuffle(this.items).slice(0, poolSize);
    this.discoveryTouched.clear();
    this.shell(title, `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="grid ${getChoiceGridClass(this.options.ageId, pool.length)} gap-4">
          ${pool.map((item) => `
            <button data-discover="${this.escape(item.id)}" class="bg-sky-50 rounded-3xl p-6 min-h-[155px] shadow border-4 border-sky-100 touch-target transition">
              ${item.hex ? `<span class="color-dot" style="background:${item.hex}" aria-hidden="true"></span>` : childVisualMarkup(item.label, { fallbackIcon: item.icon || '🎨', decorative: true, size: 'large' })}
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
      showChildFeedback(this.container, 'selected', 420);
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

  renderDiscoverObjects() {
    const pool = keepCorrectChoice(this.shuffle(this.items).slice(0, 4), null, this.options.ageId);
    this.discoveryTouched.clear();
    this.shell('🔎 Descobrir Objetos', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p id="discover-object-feedback" class="text-xl font-black text-indigo-700 mb-5">Toque em qualquer objeto para descobrir o nome.</p>
        <div class="grid ${getChoiceGridClass(this.options.ageId, pool.length)} gap-4">
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
    this.renderChoice('🧍 Meu Corpo', `Onde está ${withArticle(target.label)}?`, pool, target.id);
  }

  renderAttention() {
    if (!this.items.length) return this.renderDiscover('👂 Atenção Auditiva', 'Vamos ouvir e descobrir!', true);
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pool = keepCorrectChoice(this.shuffle(this.items).slice(0, 4), target.id, this.options.ageId);
    if (!pool.some((item) => item.id === target.id)) pool[0] = target;
    this.shell('👂 Ouça e Encontre', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center"><div class="text-7xl mb-5">👂</div>
      <p class="text-lg font-bold text-slate-700 mb-5">Ouça com atenção e encontre o que você ouviu.</p>
      <button id="listen-again" class="bg-indigo-600 text-white font-black px-7 py-4 rounded-2xl shadow touch-target mb-5">🔊 Ouvir novamente</button>
      <div class="grid ${getChoiceGridClass(this.options.ageId, pool.length)} gap-4">${pool.map((item) => `<button data-answer="${this.escape(item.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-3xl p-5 min-h-[140px] shadow touch-target"><span class="text-6xl">${item.icon}</span><span class="font-black">${this.escape(item.label)}</span></button>`).join('')}</div></div>`);
    this.container.querySelector('#listen-again').addEventListener('click', () => this.speak(target.label, target.audio));
    this.bindChoice(target.id, 'Muito bem! Você encontrou.', 'Vamos ouvir mais uma vez.', pool);
    this.audio?.prompt?.(target.audio, target.label);
  }
}
