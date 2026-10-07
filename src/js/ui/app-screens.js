import { playSfx } from '../engine/sfx.js';
import { AGE_BANDS } from '../../core/activity-registry.js';
import { activityCatalog } from '../../content/activity-catalog.js';
import { learningWorlds } from '../../content/world-catalog.js';
import { childVisualMarkup } from '../../core/child-visual-system.js';
import { childMascotMarkup } from '../../core/child-mascot.js';

export const GAME_ICONS = {
  'discovery-sounds': '👂', 'discovery-animals': '🐾', 'discovery-colors': '🎨', 'attention-auditory': '👂',
  colors: '🎨', 'find-color': '🌈', animals: '🐶', 'find-animal': '🔎', 'sound-guess': '🔊', 'shape-match': '🔷',
  'odd-one-out': '🧩', 'size-sort': '📏', sequence: '🔁', count: '🔢', 'number-match': '🔢', balloons: '🎈',
  phrases: '🗣️', syllables: '👄', rhymes: '🎵', 'sound-initial': '🔤', 'story-sequence': '📖',
  communication: '🙋', memory: '🧠', puzzle: '🧩', canvas: '🖍️', movement: '🏃', 'discover-objects': '🔎',
  'body-parts': '🧍', 'match-pairs': '🧦', 'classify-animals': '🐾', opposites: '↔️', 'sound-sequence': '👂',
  rhythm: '🥁', 'guided-movement': '🤸', 'baby-discover': '🌱', 'baby-colors': '🌈', vocabulary: '🗣️',
  'story-interactive': '📖', 'music-rhythm': '🎵', 'sort-groups': '🧺', 'object-hunt': '🔎', 'animal-families': '🐣',
  'action-words': '🏃', 'story-choices': '📚', 'phrase-builder-2': '💬', 'color-hunt-2': '🌈', 'shape-sequence': '🔷',
  'compare-sizes': '📏', 'animal-sound-memory': '🔊', 'animal-homes': '🏠', 'count-more': '🔢', 'number-order': '🔢',
  'memory-objects': '🧠', 'attention-path': '👀', 'rhythm-copy': '👏', 'movement-copy': '🙆',
  farm: '🚜', bubbles: '🫧', 'count-tap': '👆', 'music-keys': '🎹', peekaboo: '🙈', 'color-sort': '🧺', 'shape-sort': '🔷'
};

// Ilustrações próprias (public/assets/images/icons); o que não estiver aqui usa o emoji de GAME_ICONS.
const ICON_BASE = '/assets/images/icons/';
export const GAME_IMAGES = {
  balloons: 'balloon', puzzle: 'puzzle', memory: 'cards', 'music-keys': 'music', canvas: 'art',
  'shape-match': 'shapes', 'shape-sort': 'shapes', count: 'numbers', 'count-tap': 'numbers', animals: 'animals'
};
const WORLD_IMAGES = {
  discover: 'discovery', language: 'sound', 'colors-shapes': 'shapes', 'animals-sounds': 'animals',
  'numbers-logic': 'numbers', 'memory-attention': 'cards', 'create-move': 'creative'
};
const imageTag = (name) => `<img src="${ICON_BASE}${name}.webp" alt="" draggable="false" />`;
export const gameIconMarkup = (id) => (GAME_IMAGES[id] ? imageTag(GAME_IMAGES[id]) : GAME_ICONS[id] || '✨');

export const AGE_LABELS = Object.fromEntries(AGE_BANDS.map((age) => [age.id, age.label]));

const CONFETTI_COLORS = ['#f472b6', '#facc15', '#34d399', '#60a5fa', '#a78bfa', '#fb923c'];

function worldActivities(world, ageId) {
  return world.activityIds
    .map((id) => activityCatalog.find((activity) => activity.id === id))
    .filter((activity) => activity && activity.ages.includes(ageId));
}

// Telas da criança: poucas palavras, alvos grandes, voz em tudo e nenhum número para adultos.
export class AppScreens {
  childAge() {
    return this.storage.getChildAge() || '2-3y';
  }

  renderHome() {
    this.container.scrollTop = 0;
    if (!this.storage.getChildAge()) return this.renderSetup();
    if (this.screenTime?.isOverLimit()) return this.renderRest();
    const ageId = this.childAge();
    this.currentAge = ageId;
    this.currentWorld = null;
    this.audio.clearPrompt?.();
    const name = this.storage.getChildName();
    const greeting = name ? `Oi, ${name}! Vamos brincar?` : 'Oi! Vamos brincar?';
    const worlds = learningWorlds
      .map((world) => ({ ...world, activities: worldActivities(world, ageId) }))
      .filter((world) => world.activities.length);

    this.container.innerHTML = `
      <div class="screen page-enter">
        <section class="home-hero">
          ${childMascotMarkup({ size: 'medium', mood: 'happy' })}
          <h2 class="home-greeting">${this.escape(greeting)}</h2>
        </section>
        <div class="world-grid">
          ${worlds.map((world) => `
            <button data-world="${world.id}" class="world-tile world-${world.color}" aria-label="${this.escape(world.title)}">
              <span class="world-tile-deco" aria-hidden="true">${world.icon}</span>
              <span class="world-tile-icon ${WORLD_IMAGES[world.id] ? 'has-image' : ''}" aria-hidden="true">${WORLD_IMAGES[world.id] ? imageTag(WORLD_IMAGES[world.id]) : world.icon}</span>
              <span class="world-tile-title">${this.escape(world.title)}</span>
            </button>`).join('')}
          <button id="btn-album" class="world-tile album-tile" aria-label="Meus adesivos">
            <span class="world-tile-deco" aria-hidden="true">⭐</span>
            <span class="world-tile-icon has-image" aria-hidden="true">${imageTag('trophy')}</span>
            <span class="world-tile-title">Meus adesivos</span>
          </button>
        </div>
      </div>`;
    this.container.querySelectorAll('[data-world]').forEach((button) => button.addEventListener('click', () => this.renderWorld(button.dataset.world)));
    this.container.querySelector('#btn-album').addEventListener('click', () => this.renderAlbum());
    this.audio.prompt?.(null, greeting);
  }

  // Mantido para compatibilidade com chamadas antigas: a idade vem do perfil.
  renderAgeSelection() { return this.renderHome(); }
  renderWorldMap() { return this.renderHome(); }

  renderWorld(worldId) {
    this.container.scrollTop = 0;
    if (this.screenTime?.isOverLimit()) return this.renderRest();
    const world = learningWorlds.find((item) => item.id === worldId);
    if (!world) return this.renderHome();
    const ageId = this.childAge();
    this.currentAge = ageId;
    this.currentWorld = worldId;
    const snapshot = this.core.progress.snapshot();
    const activities = worldActivities(world, ageId);

    this.container.innerHTML = `
      <div class="screen page-enter">
        <div class="screen-bar">
          <button id="btn-back-worlds" class="round-button" aria-label="Voltar para os mundos">⬅️</button>
          <h2 class="screen-title"><span class="title-icon" aria-hidden="true">${WORLD_IMAGES[world.id] ? imageTag(WORLD_IMAGES[world.id]) : world.icon}</span> ${this.escape(world.title)}</h2>
        </div>
        <div class="activity-grid world-${world.color}">
          ${activities.map((activity) => {
            const earned = Boolean(snapshot.rewards?.[`activity:${activity.id}`]);
            return `
              <button data-game="${activity.id}" class="activity-tile" aria-label="${this.escape(activity.title)}">
                ${earned ? '<span class="activity-tile-star" aria-hidden="true">⭐</span>' : ''}
                <span class="activity-tile-icon ${GAME_IMAGES[activity.id] ? 'has-image' : ''}" aria-hidden="true">${gameIconMarkup(activity.id)}</span>
                <span class="activity-tile-title">${this.escape(activity.title)}</span>
              </button>`;
          }).join('')}
        </div>
      </div>`;
    this.container.querySelector('#btn-back-worlds').addEventListener('click', () => this.renderHome());
    this.container.querySelectorAll('[data-game]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.game, ageId)));
    this.audio.prompt?.(null, world.title);
  }

  // Álbum: cada brincadeira concluída pela primeira vez vira um adesivo.
  renderAlbum() {
    this.container.scrollTop = 0;
    const ageId = this.childAge();
    const snapshot = this.core.progress.snapshot();
    const activities = activityCatalog.filter((activity) => activity.ages.includes(ageId));
    const earned = activities.filter((activity) => snapshot.rewards?.[`activity:${activity.id}`]);
    this.container.innerHTML = `
      <div class="screen page-enter">
        <div class="screen-bar">
          <button id="album-back" class="round-button" aria-label="Voltar">⬅️</button>
          <h2 class="screen-title"><span class="title-icon" aria-hidden="true">${imageTag('trophy')}</span> Meus adesivos</h2>
        </div>
        <p class="album-count">${earned.length} de ${activities.length}</p>
        <div class="sticker-grid">
          ${activities.map((activity, index) => {
            const has = earned.includes(activity);
            return `<button class="sticker ${has ? 'earned' : 'locked'}" ${has ? `data-sticker="${activity.id}"` : 'disabled'} style="--tilt:${(index % 5) * 3 - 6}deg" aria-label="${has ? this.escape(activity.title) : 'Adesivo ainda não conquistado'}"><span aria-hidden="true">${GAME_ICONS[activity.id] || '✨'}</span></button>`;
          }).join('')}
        </div>
      </div>`;
    this.container.querySelector('#album-back').addEventListener('click', () => this.renderHome());
    this.container.querySelectorAll('[data-sticker]').forEach((button) => button.addEventListener('click', () => {
      const activity = activityCatalog.find((item) => item.id === button.dataset.sticker);
      if (activity) this.audio.play(null, activity.title);
    }));
    this.audio.prompt?.(null, earned.length ? 'Seus adesivos!' : 'Brinque para ganhar adesivos!');
  }

  // Limite diário atingido: descanso gentil; só um adulto libera mais tempo.
  renderRest() {
    this.container.scrollTop = 0;
    const name = this.storage.getChildName();
    const message = name ? `Hora de descansar, ${name}! Até mais tarde!` : 'Hora de descansar um pouco!';
    this.container.innerHTML = `
      <div class="screen page-enter">
        <section class="result-card rest-card">
          <div class="rest-moon" aria-hidden="true">🌙</div>
          ${childMascotMarkup({ size: 'large', mood: 'celebrate' })}
          <h2 class="result-title">${this.escape(message)}</h2>
          <p class="result-subtitle">Os olhinhos precisam brincar de outro jeito agora. 💤</p>
          <button id="rest-family" class="rest-family">Área da família</button>
        </section>
      </div>`;
    this.container.querySelector('#rest-family').addEventListener('click', () => this.openParentalGate());
    this.audio.prompt?.(null, message);
  }

  renderSessionResult(result) {
    this.container.scrollTop = 0;
    const name = this.storage.getChildName();
    const message = name ? `Muito bem, ${name}!` : 'Muito bem!';
    const next = (result.next || [])[0]?.activity || null;
    const confetti = Array.from({ length: 28 }, (_, index) => {
      const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
      const left = Math.round((index / 28) * 100 + Math.random() * 3);
      const delay = (Math.random() * 0.6).toFixed(2);
      return `<i style="left:${left}%;background:${color};animation-delay:${delay}s"></i>`;
    }).join('');

    this.container.innerHTML = `
      <div class="screen page-enter">
        <section class="result-card">
          <div class="confetti" aria-hidden="true">${confetti}</div>
          ${childMascotMarkup({ size: 'large', mood: 'celebrate' })}
          <h2 class="result-title">${this.escape(message)}</h2>
          ${result.starAwarded
            ? `<div class="result-star" aria-label="Você ganhou uma estrela">⭐</div><div class="result-sticker"><span aria-hidden="true">${GAME_ICONS[result.activityId] || '✨'}</span> Novo adesivo!</div>`
            : '<p class="result-subtitle">Você brincou de novo! 🎉</p>'}
          <div class="result-actions">
            <button id="session-again" class="big-action action-again"><span aria-hidden="true">🔁</span><small>De novo</small></button>
            ${next ? `<button id="session-next" data-next="${next.id}" class="big-action action-next"><span aria-hidden="true">${GAME_ICONS[next.id] || '▶️'}</span><small>Outra</small></button>` : ''}
            <button id="session-world" class="big-action action-home"><span aria-hidden="true">🏠</span><small>Voltar</small></button>
          </div>
        </section>
      </div>`;
    this.container.querySelector('#session-again').addEventListener('click', () => this.launchGame(result.activityId, this.currentAge));
    this.container.querySelector('#session-next')?.addEventListener('click', () => this.launchGame(next.id, this.currentAge));
    this.container.querySelector('#session-world').addEventListener('click', () => this.currentWorld ? this.renderWorld(this.currentWorld) : this.renderHome());
    playSfx('celebrate');
    this.audio.prompt?.(null, message);
    if (result.starAwarded) this.flyStarToCounter?.();
    if (this.screenTime?.isOverLimit()) {
      const resultCard = this.container.querySelector('.result-card');
      window.setTimeout(() => { if (resultCard?.isConnected) this.renderRest(); }, 3500);
    }
  }

  renderGuidedExperience(gameId, onWin, onBack, age = {}) {
    this.container.scrollTop = 0;
    const optionLimit = Math.max(2, Math.min(Number(age.optionCount || 4), 5));
    const guided = {
      movement: ['🏃', 'Mexa o Corpo!', 'Levante, imite e brinque junto.', ['Bata palmas', 'Dê tchau', 'Pule', 'Dance']]
    };
    const [icon, title, text, cards] = guided[gameId] || ['✨', 'Nova Brincadeira', 'Explore e descubra!', ['Vamos brincar']];
    const visibleCards = cards.slice(0, optionLimit);
    this.container.innerHTML = `
      <div class="w-full max-w-2xl flex flex-col gap-5 my-auto">
        <div class="flex justify-between items-center gap-3"><button id="guided-back" class="game-back" aria-label="Voltar">⬅️</button><h2 class="text-xl md:text-2xl font-black text-indigo-700">${icon} ${title}</h2></div>
        <div class="bg-white/95 rounded-[2rem] p-6 shadow-xl text-center">
          <p class="child-instruction text-slate-600 font-semibold mb-5">${this.escape(text)}</p>
          <div class="grid grid-cols-2 gap-4">${visibleCards.map((label, index) => `<button data-guided="${index}" class="activity-card bg-sky-50 border-4 border-sky-100 rounded-3xl p-6 min-h-[150px] shadow touch-target">${childVisualMarkup(label, { fallbackIcon: ['👏', '👋', '🦘', '💃'][index % 4], decorative: true, size: 'large' })}<span class="child-label font-black text-sky-800">${this.escape(label)}</span></button>`).join('')}</div>
        </div>
      </div>`;
    this.audio?.prompt?.(null, text);
    this.container.querySelector('#guided-back').addEventListener('click', onBack);
    let touched = 0;
    this.container.querySelectorAll('[data-guided]').forEach((button) => button.addEventListener('click', () => {
      if (button.dataset.done === '1') return;
      button.dataset.done = '1';
      touched += 1;
      button.classList.add('border-emerald-400', 'bg-emerald-50');
      this.audio.play(null, button.textContent.trim());
      if (touched >= visibleCards.length) onWin({ score: touched, rounds: visibleCards.length, mode: 'explore' });
    }));
  }

  // Primeira abertura: configuração feita pelo responsável.
  renderSetup({ onDone = null } = {}) {
    this.container.scrollTop = 0;
    const currentName = this.storage.getChildName();
    const currentAge = this.storage.getChildAge();
    this.container.innerHTML = `
      <div class="screen page-enter">
        <section class="setup-card">
          ${childMascotMarkup({ size: 'medium', mood: 'curious' })}
          <h2 class="setup-title">Boas-vindas ao Aprender & Brincar</h2>
          <p class="setup-text">Para o responsável: configure uma vez e entregue para a criança brincar.</p>
          <label class="setup-label" for="setup-name">Nome ou apelido da criança <span>(opcional)</span></label>
          <input id="setup-name" type="text" maxlength="15" autocomplete="off" class="setup-input" value="${this.escape(currentName)}" placeholder="Ex.: Bia" />
          <p class="setup-label">Idade</p>
          <div class="setup-ages" role="radiogroup" aria-label="Idade da criança">
            ${AGE_BANDS.map((age) => `<button data-setup-age="${age.id}" role="radio" aria-checked="${age.id === currentAge}" class="setup-age ${age.id === currentAge ? 'selected' : ''}">${this.escape(age.label)}</button>`).join('')}
          </div>
          <p class="setup-privacy">🔒 Tudo fica guardado só neste aparelho. Sem anúncios, sem cadastro e sem envio de dados.</p>
          <button id="setup-start" class="setup-start" ${currentAge ? '' : 'disabled'}>Começar</button>
        </section>
      </div>`;
    let selectedAge = currentAge;
    const start = this.container.querySelector('#setup-start');
    this.container.querySelectorAll('[data-setup-age]').forEach((button) => button.addEventListener('click', () => {
      selectedAge = button.dataset.setupAge;
      this.container.querySelectorAll('[data-setup-age]').forEach((item) => {
        const active = item === button;
        item.classList.toggle('selected', active);
        item.setAttribute('aria-checked', String(active));
      });
      start.disabled = false;
    }));
    start.addEventListener('click', () => {
      if (!selectedAge) return;
      this.storage.setChildName(this.container.querySelector('#setup-name').value);
      this.storage.setChildAge(selectedAge);
      if (onDone) onDone();
      else this.renderHome();
    });
  }
}
