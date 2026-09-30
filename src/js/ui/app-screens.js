import { AGE_BANDS } from '../../core/activity-registry.js';
import { activityCatalog } from '../../content/activity-catalog.js';
import { learningWorlds } from '../../content/world-catalog.js';
import { getAgeExperienceConfig } from '../../core/age-experience-policy.js';

const GAME_ICONS = {
  'discovery-sounds':'👂','discovery-animals':'🐾','discovery-colors':'🎨','attention-auditory':'👂',
  colors:'🎨','find-color':'🌈',animals:'🐶','find-animal':'🔎','sound-guess':'🔊','shape-match':'🔷',
  'odd-one-out':'🧩','size-sort':'📏',sequence:'🔁',count:'🔢','number-match':'🔢',balloons:'🎈',
  phrases:'🗣️',syllables:'👄',rhymes:'🎵','sound-initial':'🔤','story-sequence':'📖',
  communication:'💬',memory:'🧠',puzzle:'🧩',canvas:'🎨',movement:'🏃','discover-objects':'🔎',
  'body-parts':'🧍','match-pairs':'🧩','classify-animals':'🐾',opposites:'↔️','sound-sequence':'👂',
  rhythm:'🎵','guided-movement':'🏃','baby-discover':'🌱','baby-colors':'🌈','vocabulary':'🗣️','story-interactive':'📖','music-rhythm':'🎵','sort-groups':'🧩','object-hunt':'🔎','animal-families':'🐾','action-words':'🗣️','story-choices':'📖','phrase-builder-2':'💬','color-hunt-2':'🌈','shape-sequence':'🔷','compare-sizes':'📏','animal-sound-memory':'🔊','animal-homes':'🏠','count-more':'🔢','number-order':'🔢','memory-objects':'🧠','attention-path':'👀','rhythm-copy':'🎵','movement-copy':'🏃'
};
const AGE_LABELS = Object.fromEntries(AGE_BANDS.map((age) => [age.id, age.label]));

export class AppScreens {
  renderAgeSelection() {
    this.currentAge = null; this.currentWorld = null;
    const childName = this.storage.getChildName();
    this.container.innerHTML = `
      <div class="landing-stage w-full max-w-5xl my-auto page-enter">
        <div class="landing-splash" aria-hidden="true">
          <div class="landing-rainbow"></div>
          <div class="landing-splash-inner">
            <span class="landing-spark s1">✨</span><span class="landing-spark s2">🌟</span>
            <span class="landing-spark s3">🦋</span><span class="landing-spark s4">🫧</span>
            <div class="landing-splash-logo">🌈🧸</div>
            <div class="landing-splash-title">Aprender & Brincar</div>
            <div class="landing-splash-subtitle">Um mundo inteiro para descobrir! 🚀</div>
          </div>
        </div>
        <div class="w-full">
        <div class="hero-panel text-center mb-6">
          <div class="hero-orbit" aria-hidden="true">✨</div>
          <div class="text-6xl mb-2">🌈🧸✨</div>
          <p class="eyebrow">MAPA DE DESCOBERTAS</p>
          <h2 class="text-3xl md:text-4xl font-black text-indigo-700">${childName ? this.escape(childName)+', vamos brincar?' : 'Vamos descobrir juntos?'}</h2>
          <p class="text-slate-600 mt-2 max-w-xl mx-auto">Escolha uma idade para abrir os mundos. Você pode explorar livremente e voltar quando quiser.</p>
        </div>
        <div class="age-grid">
          ${AGE_BANDS.map((age) => `
            <button data-age="${age.id}" class="world-card bg-white p-5 rounded-[2rem] shadow-lg border-b-4 border-indigo-200 flex flex-col items-center gap-2 min-h-[165px] focus-visible:ring-4 focus-visible:ring-indigo-300">
              <span class="text-5xl">${this.ageIcon(age.id)}</span>
              <span class="text-xl font-black text-indigo-700">${age.label}</span>
              <span class="text-xs text-slate-500">Explorar • brincar • descobrir</span>
            </button>`).join('')}
        </div>
        </div>
      </div>`;
    this.container.querySelectorAll('[data-age]').forEach((button) => button.addEventListener('click', () => this.renderWorldMap(button.dataset.age)));
  }



  ageIcon(ageId) {
    return ({'6-12m':'🌱','12-18m':'🧸','18-24m':'🐾','2-3y':'🎨','3-4y':'🧠','4-5y':'🚀'})[ageId] || '🌈';
  }



  renderWorldMap(ageId) {
    this.currentAge = ageId; this.currentWorld = null;
    const worlds = learningWorlds.map((world) => ({
      ...world,
      activities: world.activityIds.map((id) => activityCatalog.find((a) => a.id === id)).filter(Boolean).filter((a) => a.ages.includes(ageId))
    })).filter((world) => world.activities.length);
    const worldProgress = (world) => this.core.progress.getWorldProgress(world.id, world.activities.map((a) => a.id));
    const childName = this.storage.getChildName();
    this.container.innerHTML = `
      <div class="w-full max-w-5xl flex flex-col gap-5 my-auto page-enter">
        <div class="page-toolbar">
          <button id="btn-back-age" class="nav-pill touch-target">⬅️ Idades</button>
          <div class="text-right"><div class="text-sm text-slate-500">${childName ? this.escape(childName)+', ' : ''}${AGE_LABELS[ageId]}</div><h2 class="text-2xl md:text-3xl font-black text-indigo-700">Escolha um mundo</h2></div>
        </div>
        <div class="world-path">
          ${worlds.map((world, index) => `
            <button data-world="${world.id}" class="world-card world-card-${world.color} bg-white rounded-[2rem] p-5 text-left shadow-xl border-2 border-white min-h-[185px] focus-visible:ring-4 focus-visible:ring-indigo-300">
              <div class="flex items-start justify-between"><span class="text-5xl">${world.icon}</span><span class="world-step">${index + 1}</span></div>
              <h3 class="text-xl font-black text-slate-800 mt-3">${world.title}</h3>
              <p class="text-sm text-slate-500 mt-1">${world.description}</p>
              <span class="inline-flex mt-3 bg-slate-100 rounded-full px-3 py-1 text-xs font-bold text-slate-600">${world.activities.length} brincadeiras</span>
              <div class="world-progress mt-3"><div class="world-progress-head"><span>${worldProgress(world).explored} de ${world.activities.length} descobertas</span><strong>${worldProgress(world).percentage}%</strong></div><div class="progress-track"><span style="width:${worldProgress(world).percentage}%"></span></div></div>
            </button>`).join('')}
        </div>
        <div class="bg-white/90 rounded-[1.75rem] p-4 shadow-sm border border-sky-100"><div class="flex items-center justify-between gap-3"><div><strong class="text-sky-800">🗺️ Minha jornada</strong><p class="text-xs text-slate-500 mt-1">Veja o que já foi explorado e descubra os próximos passos.</p></div><button id="btn-journey" class="bg-sky-600 text-white font-black px-4 py-2 rounded-xl touch-target">Ver jornada</button></div></div>
        <div class="text-center text-xs text-slate-500">💡 Não existe competição: cada descoberta vale por si.</div>
      </div>`;
    this.container.querySelector('#btn-back-age').addEventListener('click', () => this.renderAgeSelection());
    this.container.querySelector('#btn-journey')?.addEventListener('click', () => this.renderJourney());
    this.container.querySelectorAll('[data-world]').forEach((button) => button.addEventListener('click', () => this.renderWorld(button.dataset.world)));
  }




  renderJourney() {
    const snapshot = this.core.progress.snapshot();
    const entries = Object.entries(snapshot.activities || {}).map(([id, progress]) => ({ activity: activityCatalog.find((a) => a.id === id), progress })).filter((item) => item.activity);
    const explored = entries.length;
    const weakest = this.core.skills.weakest(4);
    const next = this.core.learning.recommend(this.currentAge, this.currentWorld, 3);
    const worldCount = new Set(entries.map(({activity}) => activity.world).filter(Boolean)).size;
    const totalCompletions = entries.reduce((sum, item) => sum + Number(item.progress.completions || 0), 0);
    const totalExplorations = entries.reduce((sum, item) => sum + Number(item.progress.explorationCount || 0), 0);
    const totalEvaluations = entries.reduce((sum, item) => sum + Number(item.progress.evaluationCount || 0), 0);
    const sessionSummary = this.core.progress.getSessionSummary();
    const totalMinutes = Math.round(sessionSummary.totalDurationMs / 60000);
    const profile = this.core.learning.getProfile();
    const improving = profile.improving || 0;
    const journeyStage = totalEvaluations === 0 ? 1 : improving > 0 ? 3 : profile.accuracy != null && profile.accuracy >= 85 ? 4 : 2;
    const ageExperience = getAgeExperienceConfig(this.currentAge || '2-3y', 1);
    const journeyStages = [
      ['🌱','Descobrir','Explorar livremente'],
      ['✨','Experimentar','Tocar, ouvir e brincar'],
      ['🧭','Praticar','Variar propostas quando fizer sentido'],
      ['🌟','Avançar','Encontrar novos desafios'],
      ['🌈','Celebrar','Perceber o caminho percorrido']
    ];
    this.container.innerHTML = `
      <div class="w-full max-w-4xl my-auto flex flex-col gap-5 page-enter">
        <div class="page-toolbar"><button id="journey-back" class="nav-pill touch-target">⬅️ Voltar</button><div class="text-right"><div class="text-4xl">🗺️</div><h2 class="text-2xl md:text-3xl font-black text-indigo-700">Minha jornada</h2></div></div>
        <div class="journey-map bg-white/95 rounded-[2rem] p-5 shadow-xl border border-sky-100"><div class="flex items-center justify-between gap-3 mb-4"><div><strong class="text-indigo-800">🗺️ Caminho de descobertas</strong><p class="text-xs text-slate-500 mt-1">${this.escape(ageExperience.label)} · ${this.escape(ageExperience.ageLabel)}</p></div><span class="text-2xl">🚀</span></div><div class="grid grid-cols-2 md:grid-cols-5 gap-2">${journeyStages.map(([icon,title,desc],index)=>`<div class="journey-node ${index+1===journeyStage?'active':''} ${index+1<journeyStage?'visited':''}"><span>${icon}</span><strong>${title}</strong><small>${desc}</small></div>`).join('')}</div></div><div class="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div class="bg-amber-50 rounded-2xl p-4 text-center"><div class="text-2xl">⭐</div><strong>${snapshot.stars || 0}</strong><small class="block text-slate-500">estrelas</small></div>
          <div class="bg-emerald-50 rounded-2xl p-4 text-center"><div class="text-2xl">🌱</div><strong>${explored}</strong><small class="block text-slate-500">experiências</small></div>
          <div class="bg-sky-50 rounded-2xl p-4 text-center"><div class="text-2xl">🌍</div><strong>${worldCount}</strong><small class="block text-slate-500">mundos visitados</small></div>
          <div class="bg-violet-50 rounded-2xl p-4 text-center"><div class="text-2xl">🔥</div><strong>${snapshot.sessions?.streak || 0}</strong><small class="block text-slate-500">dias seguidos</small></div>\n          <div class="bg-orange-50 rounded-2xl p-4 text-center"><div class="text-2xl">⏱️</div><strong>${totalMinutes}</strong><small class="block text-slate-500">minutos de brincadeira</small></div>
          <div class="bg-indigo-50 rounded-2xl p-4 text-center"><div class="text-2xl">🧭</div><strong>${profile.accuracy==null?'—':profile.accuracy+'%'}</strong><small class="block text-slate-500">média recente</small></div>
          <div class="bg-rose-50 rounded-2xl p-4 text-center"><div class="text-2xl">📈</div><strong>${improving}</strong><small class="block text-slate-500">em evolução</small></div>
        </div>
        <div class="bg-white/95 rounded-[2rem] p-5 shadow-xl"><h3 class="text-xl font-black text-indigo-700">🌟 O caminho já percorrido</h3><p class="text-sm text-slate-500 mt-1">${totalExplorations} exploração(ões) e ${totalEvaluations} atividade(s) com desempenho observado. Nada é bloqueado: a criança pode voltar, repetir e descobrir livremente.</p><div class="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          ${entries.slice().sort((a,b)=>(b.progress.lastPlayedAt||'').localeCompare(a.progress.lastPlayedAt||'')).slice(0,8).map(({activity,progress}) => `
            <button data-journey-game="${activity.id}" class="bg-slate-50 rounded-2xl p-4 text-left border border-slate-100 touch-target"><span class="text-2xl">${GAME_ICONS[activity.id] || '✨'}</span><strong class="block text-indigo-700 mt-1">${this.escape(activity.title)}</strong><small class="text-slate-500">${progress.accuracy == null ? 'Exploração livre' : progress.accuracy + '% observado'} · ${progress.completions || 0} vez(es)</small>${progress.accuracy != null && progress.recentAccuracy != null ? `<div class="progress-track mt-2"><span style="width:${Math.min(100, progress.recentAccuracy)}%"></span></div><small class="text-[10px] text-slate-400">${progress.recentAccuracy}% média recente</small>` : ""}</button>
          `).join('') || '<div class="text-sm text-slate-500">A jornada começa na primeira brincadeira. ✨</div>'}
        </div></div>
        <div class="bg-violet-50 rounded-[2rem] p-5 shadow-lg"><h3 class="text-xl font-black text-violet-800">🧠 Habilidades para explorar agora</h3><p class="text-sm text-violet-600 mt-1">São sugestões de exploração, não avaliações clínicas nem notas.</p><div class="grid gap-3 mt-3">
          ${weakest.map(([skill,data]) => { const pct=Math.min(100,Math.round((Number(data.mastery||0)/5)*100)); return `<div class="bg-white rounded-2xl p-3"><div class="flex justify-between gap-3 text-xs font-bold text-violet-700"><span>${this.escape(this.core.learning.labelDomain(skill))}</span><span>${data.mastery.toFixed(1)}/5</span></div><div class="progress-track mt-2"><span style="width:${pct}%"></span></div></div>`; }).join('') || '<span class="text-sm text-slate-500">Ainda estamos conhecendo seu caminho.</span>'}
        </div></div>
        <div class="bg-white rounded-[2rem] p-5 shadow-lg border border-indigo-100"><div class="flex items-center justify-between gap-3"><div><h3 class="text-xl font-black text-indigo-800">🧭 Perfil de aprendizagem</h3><p class="text-sm text-slate-500 mt-1">Uma leitura simples do caminho percorrido, sem notas clínicas.</p></div><span class="bg-indigo-50 text-indigo-700 font-black px-3 py-2 rounded-full text-xs">${profile.exploration} explorações</span></div><div class="mt-3 bg-indigo-50 rounded-2xl p-3 text-xs text-indigo-700">${improving ? `📈 ${improving} área(s) mostram melhora recente.` : "🌱 O perfil ainda está construindo uma linha de evolução."}</div><div class="grid md:grid-cols-2 gap-3 mt-4"><div class="bg-emerald-50 rounded-2xl p-4"><strong class="text-emerald-800">✨ Habilidades mais presentes</strong><div class="domain-list mt-2">${profile.strengths.map(([s,d])=>`<span>${this.escape(this.core.learning.labelDomain(s))} · ${d.mastery.toFixed(1)}/5</span>`).join('') || '<span>Ainda conhecendo</span>'}</div></div><div class="bg-violet-50 rounded-2xl p-4"><strong class="text-violet-800">🌱 Áreas para variar</strong><div class="domain-list mt-2">${profile.areas.map(([s,d])=>`<span>${this.escape(this.core.learning.labelDomain(s))} · ${d.mastery.toFixed(1)}/5</span>`).join('') || '<span>Ainda conhecendo</span>'}</div></div></div></div>
        <div class="journey-highlight bg-sky-50 rounded-[2rem] p-5 shadow-lg"><h3 class="text-xl font-black text-sky-800">✨ Próximas descobertas</h3><div class="journey-rail mt-4">${journeyStages.map(([icon,title,desc],i)=>`<div class="journey-node ${i+1===journeyStage?'active':''} ${i+1<journeyStage?'visited':''}"><span>${icon}</span><strong>${title}</strong><small>${desc}</small></div>`).join('')}</div></div><div class="grid gap-3 mt-3">
          ${next.map(({activity,reason}) => `<button data-journey-next="${activity.id}" class="bg-white rounded-2xl p-4 text-left border border-sky-100 shadow-sm touch-target"><span class="text-2xl">${GAME_ICONS[activity.id] || '✨'}</span><strong class="block text-indigo-700 mt-1">${this.escape(activity.title)}</strong><small class="text-slate-500">${this.escape(reason)}</small></button>`).join('') || '<span class="text-sm text-slate-500">Escolha livremente qualquer mundo para continuar.</span>'}
        </div></div>
      </div>`;
    this.container.querySelector('#journey-back').addEventListener('click', () => this.currentWorld ? this.renderWorld(this.currentWorld) : this.renderWorldMap(this.currentAge));
    this.container.querySelectorAll('[data-journey-game]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.journeyGame, this.currentAge)));
    this.container.querySelectorAll('[data-journey-next]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.journeyNext, this.currentAge)));
  }



  renderWorld(worldId) {
    const world = learningWorlds.find((item) => item.id === worldId);
    if (!world || !this.currentAge) return this.renderAgeSelection();
    this.currentWorld = worldId;
    const activities = world.activityIds.map((id) => activityCatalog.find((a) => a.id === id)).filter(Boolean).filter((a) => a.ages.includes(this.currentAge));
    this.container.innerHTML = `
      <div class="w-full max-w-5xl flex flex-col gap-5 my-auto page-enter">
        <div class="page-toolbar">
          <button id="btn-back-worlds" class="nav-pill touch-target">⬅️ Mundos</button>
          <div class="text-right"><div class="text-4xl">${world.icon}</div><h2 class="text-2xl font-black text-indigo-700">${world.title}</h2></div>
        </div>
        <div class="bg-white/90 rounded-[2rem] p-5 shadow-lg text-center">
          <p class="text-slate-600">${world.description}</p>
          <div class="mt-2 text-xs font-bold text-indigo-500">${activities.length} experiências para ${AGE_LABELS[this.currentAge]}</div>
        </div>
        <div class="bg-violet-50 rounded-[1.75rem] p-4 shadow-sm border border-violet-100">
          <div class="flex items-center justify-between gap-3">
            <div><strong class="text-violet-800">🧠 Sugestões para agora</strong><p class="text-xs text-violet-600 mt-1">O app adapta as próximas brincadeiras ao histórico local.</p></div>
            <span class="text-xs font-black text-violet-500">${this.core.progress.snapshot().sessions?.streak || 0} dia(s) de sequência</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-2 mt-3">
            ${this.core.learning.recommend(this.currentAge, worldId, 3).map(({activity,reason})=>`<button data-recommend="${activity.id}" class="bg-white rounded-xl p-3 text-left border border-violet-100 shadow-sm touch-target"><span class="font-black text-indigo-700">${GAME_ICONS[activity.id]||'✨'} ${this.escape(activity.title)}</span><span class="block text-[11px] text-slate-500 mt-1">${this.escape(reason)}</span></button>`).join('')}
          </div>
        </div>
        <div class="activity-grid">
          ${activities.map((activity) => {
            const progress = this.core.progress.getActivity(activity.id);
            return `
              <button data-game="${activity.id}" class="activity-card bg-white rounded-[1.75rem] p-5 text-left shadow-lg border-2 border-slate-100 min-h-[170px] focus-visible:ring-4 focus-visible:ring-indigo-300">
                <div class="flex justify-between items-start"><span class="text-4xl">${GAME_ICONS[activity.id] || '✨'}</span>${progress ? `<span class="text-xs font-black text-emerald-600">✓ nível ${progress.level || 1}</span>` : ''}</div>
                <h3 class="text-lg font-black text-indigo-800 mt-3">${this.escape(activity.title)}</h3>
                <p class="text-xs text-slate-500 mt-1">${activity.skills?.slice(0,2).map((x)=>this.escape(x)).join(' • ') || ''}</p>
                <div class="mt-3 flex gap-2"><span class="difficulty">${'⭐'.repeat(Math.min(activity.difficulty || 1,3))}</span><span class="text-[10px] text-slate-400">${activity.type === 'activity' ? 'livre' : activity.type === 'creative' ? 'criativa' : 'jogo'}</span></div>
                ${progress ? (() => { const pct=progress.accuracy==null ? Math.min(100,Number(progress.explorationCount||0)*20) : Math.min(100,Number(progress.accuracy||0)); return `<div class="progress-track mt-3"><span style="width:${pct}%"></span></div><div class="text-[10px] text-slate-400 mt-1">${progress.accuracy==null ? (progress.explorationCount||0)+' exploração(ões)' : (progress.accuracy||0)+'% observado · nível '+(progress.level||1)}</div>`; })() : ''}
              </button>`;
          }).join('')}
        </div>
      </div>`;
    this.container.querySelector('#btn-back-worlds').addEventListener('click', () => this.renderWorldMap(this.currentAge));
    this.container.querySelectorAll('[data-game]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.game, this.currentAge)));
    this.container.querySelectorAll('[data-recommend]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.recommend, this.currentAge)));
  }

  launchGame(gameId, ageId) { return this.app.experience.launchGame(gameId, ageId); }



  renderSessionResult(result) {
    const next = result.next || [];
    const current = activityCatalog.find((a) => a.id === result.activityId);
    const progress = result.progress || {};
    const outcome = result.outcome || null;
    this.container.innerHTML = `
      <div class="w-full max-w-2xl my-auto flex flex-col gap-5">
        <div class="bg-white/95 rounded-[2rem] p-7 shadow-xl text-center">
          <div class="text-6xl mb-2">🌟</div>
          <h2 class="text-3xl font-black text-indigo-700">Muito bem!</h2>
          <p class="text-slate-600 mt-2">${this.escape(current?.title || 'Brincadeira')} concluída.</p>
          ${outcome ? '<div class="mt-4 rounded-2xl bg-violet-50 border border-violet-100 p-4 text-left"><strong class="text-violet-800">' + this.escape(outcome.label) + '</strong><p class="text-sm text-slate-600 mt-1">' + this.escape(outcome.message) + '</p></div>' : ''}
          <div class="grid grid-cols-3 gap-2 mt-5">
            <div class="bg-amber-50 rounded-2xl p-3"><div class="text-2xl">⭐</div><strong>+1</strong><small class="block text-slate-500">estrela</small></div>
            <div class="bg-emerald-50 rounded-2xl p-3"><div class="text-2xl">🎯</div><strong>${progress.accuracy == null ? 'Exploração' : progress.accuracy + '%'}</strong><small class="block text-slate-500">aproveitamento</small></div>
            <div class="bg-violet-50 rounded-2xl p-3"><div class="text-2xl">🔥</div><strong>${this.core.progress.snapshot().sessions?.streak || 0}</strong><small class="block text-slate-500">dias</small></div>
          </div>
        </div>
        <div class="bg-violet-50 rounded-[2rem] p-5 shadow-lg">
          <h3 class="text-xl font-black text-violet-800">🎮 O que combina com você agora?</h3>
          <p class="text-sm text-violet-600 mt-1">Sugestões ajustadas ao que você acabou de brincar.</p>
          <div class="grid gap-3 mt-4">
            ${next.map(({activity,reason}) => `
              <button data-next="${activity.id}" class="bg-white rounded-2xl p-4 text-left shadow touch-target border-2 border-violet-100">
                <span class="text-2xl">${GAME_ICONS[activity.id] || '✨'}</span>
                <strong class="block text-indigo-700 mt-1">${this.escape(activity.title)}</strong>
                <small class="text-slate-500">${this.escape(reason)}</small>
              </button>`).join('') || '<div class="text-sm text-slate-500">Você já explorou bastante este mundo. Que tal escolher outra brincadeira?</div>'}
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button id="session-world" class="nav-pill touch-target">🗺️ Voltar ao mundo</button>
          <button id="session-continue" class="bg-indigo-600 text-white font-black rounded-xl py-3 touch-target">✨ Escolher outra</button>
        </div>
      </div>`;
    this.container.querySelectorAll('[data-next]').forEach((button) => button.addEventListener('click', () => this.launchGame(button.dataset.next, this.currentAge)));
    this.container.querySelector('#session-world').addEventListener('click', () => this.renderWorld(this.currentWorld));
    this.container.querySelector('#session-continue').addEventListener('click', () => this.renderWorld(this.currentWorld));
  }



  renderGuidedExperience(gameId,onWin,onBack,age={}) {
    const optionLimit = Math.max(2, Math.min(Number(age.optionCount || 4), 5));
    const guided={
      rhymes:['🎵','Rimas Divertidas','Encontre palavras que terminam de um jeito parecido.',['Gato','Rato','Bola','Mola']],
      'sound-initial':['🔤','Com Que Som Começa?','Ouça a palavra e observe seu começo.',['Macaco','Mala','Bola','Gato']],
      'story-sequence':['📖','Hora da História','Coloque as cenas na ordem e conte o que aconteceu.',['Primeiro','Depois','Por fim']],
      movement:['🏃','Mexa o Corpo!','Levante, imite e brinque junto.',['Bata palmas','Dê tchau','Pule','Dance']],
      'discover-objects':['🔎','Descobrir Objetos','Toque, veja e descubra nomes de coisas do dia a dia.',['Bola','Casa','Carro','Maçã']],
      'body-parts':['🧍','Meu Corpo','Vamos descobrir partes do corpo.',['Cabeça','Mão','Pé','Olho']],
      'match-pairs':['🧩','Encontre o Par','Procure coisas que combinam.',['Bola','Casa','Carro','Maçã']],
      'classify-animals':['🐾','Quem Pertence ao Grupo?','Observe e descubra o que combina.',['Animais','Comida','Brinquedos','Natureza']],
      opposites:['↔️','Opostos Divertidos','Brinque com ideias que são diferentes.',['Grande / pequeno','Alto / baixo','Cheio / vazio','Dia / noite']],
      'sound-sequence':['👂','Sequência de Sons','Ouça, lembre e tente repetir a sequência.',['Um som','Dois sons','Três sons','Ouvir de novo']],
      rhythm:['🎵','Brinque com o Ritmo','Imite o ritmo e movimente-se.',['Palmas','Tum tum','Palma e pausa','Dance']],
      'guided-movement':['🏃','Desafio do Movimento','Siga o comando e faça junto.',['Bata palmas','Pule','Gire','Dê tchau']]
    };
    const [icon,title,text,cards]=guided[gameId] || ['✨','Nova Brincadeira','Explore e descubra!',['Vamos brincar']];
    const visibleCards = cards.slice(0, optionLimit);
    this.container.innerHTML=`
      <div class="w-full max-w-2xl flex flex-col gap-5 my-auto">
        <div class="flex justify-between items-center gap-3"><button id="guided-back" class="nav-pill touch-target">⬅️ Voltar</button><h2 class="text-xl md:text-2xl font-black text-indigo-700">${icon} ${title}</h2></div>
        <div class="bg-white/95 rounded-[2rem] p-6 shadow-xl text-center">
          <p class="text-slate-600 font-semibold mb-5">${this.escape(text)}</p>
          <div class="grid grid-cols-2 gap-4">${visibleCards.map((label,index)=>`<button data-guided="${index}" class="activity-card bg-sky-50 border-4 border-sky-100 rounded-3xl p-6 min-h-[150px] shadow touch-target"><span class="text-5xl block">${['👏','👋','🦘','💃'][index%4]}</span><span class="font-black text-sky-800">${this.escape(label)}</span></button>`).join('')}</div>
        </div>
      </div>`;
    this.container.querySelector('#guided-back').addEventListener('click',onBack);
    let touched=0;
    this.container.querySelectorAll('[data-guided]').forEach((button)=>button.addEventListener('click',()=>{
      if(button.dataset.done==='1') return;
      button.dataset.done='1'; touched++; button.classList.add('border-emerald-400','bg-emerald-50'); this.audio.play(null,button.textContent.trim());
      if(touched>=visibleCards.length){onWin({score:touched,rounds:visibleCards.length});}
    }));
  }
}
