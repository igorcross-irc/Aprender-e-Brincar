// Modos do mundo de aprendizagem (RhythmModes): métodos que o LearningWorldGame recebe (ver learning-world.js).
import { keepCorrectChoice, getChoiceGridClass } from '../../../core/child-choice-policy.js';

export class RhythmModes {
  renderMusic() {
    const pattern = this.items[this.round % this.items.length];
    this.shell('🎵 Música e Ritmo', `<div class="bg-white/95 rounded-3xl p-7 shadow-xl text-center"><div class="text-7xl mb-4">${pattern.pattern.join(' ')}</div><h3 class="text-2xl font-black text-indigo-700">${this.escape(pattern.label)}</h3><p class="text-slate-600 my-4">Faça o ritmo junto comigo.</p><button id="music-done" class="bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl shadow touch-target">👏 Fiz o ritmo!</button></div>`, 'Observe, imite e brinque com o ritmo.');
    this.container.querySelector('#music-done').addEventListener('click', () => { if (this.roundLocked) return; this.score += 1; this.speak('Muito bem!'); this.scheduleNext(650); });
    this.audio?.prompt?.(null, pattern.label);
  }

  renderRhythm() {
    const item = this.items[this.round % this.items.length];
    const options = keepCorrectChoice(this.shuffle(this.items).map((entry) => ({ id: entry.id, label: entry.label, icon: entry.pattern.join(' ') })), item.id, this.options.ageId);
    this.shell('🎵 Brinque com o Ritmo', `<div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center"><div class="text-7xl mb-4">${item.pattern.join(' ')}</div><p class="text-xl font-black text-indigo-700 mb-4">Observe o ritmo e escolha o mesmo padrão.</p><div class="grid ${getChoiceGridClass(this.options.ageId, options.length)} gap-3">${options.map((entry) => `<button data-answer="${this.escape(entry.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 shadow touch-target text-4xl">${entry.icon}</button>`).join('')}</div></div>`, 'Você pode bater palmas junto.');
    this.bindChoice(item.id, 'Muito bem! Ritmo combinado.', 'Vamos observar de novo.', options);
  }

  renderMovement() {
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    this.shell('🏃 Desafio do Movimento', `<div class="bg-white/95 rounded-3xl p-8 shadow-xl text-center"><div class="text-8xl mb-5">${item.icon}</div><h3 class="text-3xl font-black text-indigo-700 mb-3">${this.escape(item.label)}</h3><p class="text-slate-600 mb-6">Faça o movimento e toque quando terminar.</p><button id="movement-done" class="bg-emerald-500 text-white font-black text-xl px-8 py-5 rounded-3xl shadow-lg touch-target">✅ Fiz!</button></div>`, 'Vamos brincar juntos!');
    this.container.querySelector('#movement-done').addEventListener('click', () => { if (this.roundLocked) return; this.score += 1; this.speak('Muito bem!'); this.scheduleNext(650); });
    this.audio?.prompt?.(null, item.label);
  }
}
