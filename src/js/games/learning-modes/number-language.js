// Modos do mundo de aprendizagem (NumberLanguageModes): métodos que o LearningWorldGame recebe (ver learning-world.js).
import { keepCorrectChoice, getChoiceGridClass } from '../../../core/child-choice-policy.js';

export class NumberLanguageModes {
  renderCount() {
    const target = Math.floor(Math.random() * 5) + 1;
    const icon = ['🍎', '⭐', '🟢', '🦋', '🌸'][this.round % 5];
    const options = this.shuffle([target, ...this.shuffle([1, 2, 3, 4, 5].filter((n) => n !== target)).slice(0, 3)])
      .map((number) => ({ id: String(number), label: String(number), icon: String(number) }));
    this.shell('🔢 Vamos Contar', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <p class="text-xl font-black text-indigo-700 mb-4">Quantos ${icon} você vê?</p>
        <div class="flex flex-wrap justify-center gap-2 text-5xl bg-amber-50 rounded-3xl p-6 mb-5">${Array.from({ length: target }, () => `<span>${icon}</span>`).join('')}</div>
        <div class="grid ${getChoiceGridClass(this.options.ageId, options.length)} gap-3">${options.map((option) => `<button data-answer="${option.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-3xl font-black shadow touch-target">${option.label}</button>`).join('')}</div>
      </div>`, 'Conte os objetos e escolha a quantidade.');
    this.bindChoice(String(target), 'Muito bem!', 'Vamos contar novamente!', options);
  }

  renderNumberMatch() {
    const target = Math.floor(Math.random() * 5) + 1;
    const options = keepCorrectChoice(this.shuffle([1, 2, 3, 4, 5]).map((number) => ({ id: String(number), label: String(number) })), String(target), this.options.ageId);
    this.shell('🔢 Número e Quantidade', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center">
        <div class="text-6xl mb-4">${Array.from({ length: target }, () => '🍓').join(' ')}</div>
        <p class="text-xl font-black text-indigo-700 mb-4">Qual número combina com essa quantidade?</p>
        <div class="grid ${getChoiceGridClass(this.options.ageId, options.length)} gap-2">${options.map((option) => `<button data-answer="${option.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-3xl font-black shadow touch-target">${option.label}</button>`).join('')}</div>
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
        <div class="grid ${getChoiceGridClass(this.options.ageId, choices.length)} gap-3">${choices.map((c) => `<button data-answer="${c.id}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-4 shadow touch-target font-black">${c.label}</button>`).join('')}</div>
        <button id="speak-word" class="mt-4 bg-emerald-500 text-white font-black px-6 py-3 rounded-2xl touch-target">🔊 Ouvir palavra</button>
      </div>`, 'Bata palmas ou conte as partes da palavra.');
    this.container.querySelector('#speak-word').addEventListener('click', () => this.speak(item.label, item.audio));
    this.bindChoice(String(correct), `${item.parts.join(' - ')}. Muito bem!`, 'Vamos ouvir mais uma vez.', choices);
    this.audio?.prompt?.(item.audio, item.label);
  }

  renderSequence() {
    const sequence = this.shuffle(this.items)[0];
    const answer = sequence.answer;
    const distractors = [...new Set([...sequence.items, '🟢', '🟣', '🟠', '⭐'])].filter((x) => x !== answer);
    const choices = this.shuffle([answer, ...this.shuffle(distractors).slice(0, 3)]).map((x) => ({ id: x, label: x, icon: x }));
    this.shell('🔁 Complete a Sequência', `
      <div class="bg-white/95 rounded-3xl p-6 shadow-xl text-center"><p class="text-xl font-black text-indigo-700 mb-4">O que vem depois?</p>
      <div class="flex justify-center gap-3 text-5xl bg-sky-50 rounded-3xl p-6 mb-5">${sequence.items.map((x) => `<span>${x}</span>`).join('')}</div>
      <div class="grid ${getChoiceGridClass(this.options.ageId, choices.length)} gap-3">${choices.map((c) => `<button data-answer="${this.escape(c.id)}" class="learning-option bg-white border-4 border-indigo-100 rounded-2xl p-5 text-4xl shadow touch-target">${c.icon}</button>`).join('')}</div></div>`, 'Observe o padrão e escolha o que vem depois.');
    this.bindChoice(answer, 'Muito bem! Você descobriu o padrão.', 'Observe a sequência mais uma vez.', choices);
  }

  renderStory() {
    const story = this.story;
    const scene = story.scenes[this.round];
    const sentence = story.words?.[this.round] || story.title;
    const last = this.round >= this.totalRounds - 1;
    this.shell('📖 História Interativa', `<div class="bg-white/95 rounded-3xl p-7 shadow-xl text-center"><div class="text-8xl mb-4">${scene}</div><h3 class="text-2xl font-black text-indigo-700 mb-2">${this.escape(story.title)}</h3><p class="text-xl font-bold text-slate-700 mb-5">${this.escape(sentence)}</p><button id="story-next" class="bg-violet-500 text-white font-black px-8 py-4 rounded-2xl shadow touch-target">${last ? 'Fim! 🎉' : 'E depois? ▶️'}</button></div>`, 'Vamos ouvir a história juntos.', false);
    this.container.querySelector('#story-next').addEventListener('click', () => { if (this.roundLocked) return; this.score += 1; this.scheduleNext(500); });
    this.audio?.prompt?.(null, sentence);
  }
}
