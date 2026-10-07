// Modos do mundo de aprendizagem (ChoiceModes): métodos que o LearningWorldGame recebe (ver learning-world.js).
import { keepCorrectChoice } from '../../../core/child-choice-policy.js';
import { withArticle } from '../../../core/pt-grammar.js';

export class ChoiceModes {
  renderFindColor() {
    const poolSize = Math.min(this.items.length, this.options.difficulty >= 3 ? 5 : this.options.difficulty === 2 ? 4 : 3);
    const pool = this.shuffle(this.items).slice(0, poolSize);
    const target = pool[Math.floor(Math.random() * pool.length)];
    this.renderChoice('🎨 Encontre a Cor', `Onde está a cor ${target.label}?`, pool, target.id, target.audio);
    pool.forEach((item) => {
      const button = this.container.querySelector(`[data-answer="${CSS.escape(item.id)}"]`);
      if (button) {
        button.querySelector('.child-visual')?.remove();
        button.classList.add('color-swatch');
        button.style.backgroundColor = item.hex || '#fff';
        button.style.color = item.textDark ? '#1f2937' : '#fff';
        if (item.border) button.style.borderColor = '#94a3b8';
      }
    });
  }

  renderFindAnimal(soundMode) {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    // O animal pedido precisa estar sempre entre as opções.
    const others = this.shuffle(this.items.filter((item) => item.id !== target.id)).slice(0, 3);
    const pool = keepCorrectChoice([target, ...others], target.id, this.options.ageId);
    const prompt = soundMode ? 'Ouça com atenção. Quem fez esse som?' : `Onde está ${withArticle(target.label)}?`;
    this.renderChoice(soundMode ? '🔊 Quem Fez Esse Som?' : '🐾 Encontre o Animal', prompt, pool, target.id, null, 'Muito bem! Você encontrou!', 'Vamos ouvir e tentar novamente.');
    if (soundMode) window.setTimeout(() => this.audio?.prompt?.(null, target.sound || target.label), 1100);
  }

  renderShape() {
    const pool = this.shuffle(this.items).slice(0, 4);
    const target = pool[Math.floor(Math.random() * pool.length)];
    this.renderChoice('🔷 Mundo das Formas', `Encontre ${withArticle(target.label)}.`, pool, target.id);
  }

  renderOddOneOut() {
    const base = this.shuffle(this.items).slice(0, 3);
    const odd = this.shuffle(this.items.filter((item) => !base.some((b) => b.id === item.id)))[0];
    if (!odd) return this.renderChoice('🔎 Qual é Diferente?', 'Qual é diferente?', this.shuffle(this.items).slice(0, 4), this.items[0]?.id);
    this.renderChoice('🔎 Qual é Diferente?', 'Qual é diferente dos outros?', this.shuffle([...base, odd]), odd.id);
  }

  renderSize() {
    // Exatamente um objeto grande entre objetos pequenos.
    const big = this.shuffle(this.items.filter((item) => item.size === 'grande'))[0];
    const small = this.shuffle(this.items.filter((item) => item.size !== 'grande')).slice(0, 3);
    this.renderChoice('📏 Grande e Pequeno', 'Toque no que é grande.', this.shuffle([big, ...small]), big.id);
  }

  renderOpposites() {
    const item = this.items[Math.floor(Math.random() * this.items.length)];
    const options = this.shuffle(this.items.map((entry) => ({ id: entry.pair, label: entry.pair, icon: entry.pairIcon })));
    this.renderChoice('↔️ Opostos', `Qual é o contrário de ${item.label}?`, options, item.pair);
  }

  renderClassify() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const sameGroup = this.items.filter((item) => item.group === target.group && item.id !== target.id);
    const correct = sameGroup[0] || target;
    const distractors = this.shuffle(this.items.filter((item) => item.group !== target.group)).slice(0, 3);
    this.renderChoice('🐾 Classificar', `O que pertence ao mesmo grupo de ${target.label}?`, this.shuffle([correct, ...distractors]), correct.id);
  }

  renderSortGroups() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const same = this.items.filter((x) => x.group === target.group && x.id !== target.id)[0] || target;
    const others = this.shuffle(this.items.filter((x) => x.group !== target.group)).slice(0, 3);
    this.renderChoice('🧩 Quem Combina?', `Quem combina com ${target.label}?`, this.shuffle([same, ...others]), same.id);
  }

  renderMatchPairs() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pairMap = { bola:'boneca', boneca:'bola', carro:'aviao', aviao:'carro', casa:'arvore', arvore:'casa', maca:'banana', banana:'maca' };
    const correctId = pairMap[target.id] || target.id;
    const correct = this.items.find((item) => item.id === correctId) || target;
    const distractors = this.shuffle(this.items.filter((item) => item.id !== correct.id && item.id !== target.id)).slice(0, 3);
    this.renderChoice('🧩 Encontre o Par', `O que combina com ${target.label}?`, this.shuffle([correct, ...distractors]), correct.id);
  }

  renderVocabulary() {
    const target = this.items[Math.floor(Math.random() * this.items.length)];
    const pool = keepCorrectChoice(this.shuffle(this.items).slice(0, 4), target.id, this.options.ageId);
    if (!pool.some((x) => x.id === target.id)) pool[0] = target;
    this.renderChoice('🗣️ Palavras do Dia a Dia', `Onde está ${withArticle(target.label)}?`, pool, target.id, null, 'Muito bem!', 'Vamos tentar novamente.');
  }
}
