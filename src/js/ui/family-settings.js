import { activityCatalog } from '../../content/activity-catalog.js';
import { rewardCatalog } from '../../content/reward-catalog.js';
import { learningWorlds } from '../../content/world-catalog.js';
import { AGE_BANDS } from '../../core/activity-registry.js';
import { SCREEN_TIME_OPTIONS } from '../../core/screen-time.js';
import { canFullscreen, isStandalone, isNativeApp } from '../../core/kid-lock.js';
import { APP_VERSION } from '../../core/app-update.js';

// Área da Família: tudo que é para adultos fica aqui, atrás da verificação.
export class FamilySettings {
  constructor(app) { this.app = app; }

  evaluateRewards(activityId) {
    const snapshot = this.app.core.progress.snapshot();
    const explored = Object.values(snapshot.activities || {}).filter((item) => item.explored).length;
    const worlds = new Set();
    Object.entries(snapshot.activities || {}).forEach(([id, item]) => {
      if (!item.explored) return;
      const activity = activityCatalog.find((a) => a.id === id);
      if (activity?.world) worlds.add(activity.world);
    });
    const candidates = [];
    if (explored >= 1) candidates.push('first-discovery');
    if (explored >= 5) candidates.push('five-discoveries');
    if (explored >= 10) candidates.push('ten-discoveries');
    if (worlds.size >= 3) candidates.push('world-explorer');
    if ((snapshot.activities?.[activityId]?.completions || 0) >= 2) candidates.push('repeat-player');
    candidates.forEach((id) => this.app.core.progress.award(id));
  }

  getRewards() {
    const snapshot = this.app.core.progress.snapshot();
    return rewardCatalog.map((reward) => ({ ...reward, earned: Boolean(snapshot.rewards?.[reward.id]) }));
  }

  openParentalGate() {
    const previousFocus = document.activeElement;
    const n1 = Math.floor(Math.random() * 8) + 3;
    const n2 = Math.floor(Math.random() * 4) + 2;
    const answer = n1 * n2;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="gate-title">
        <div class="text-5xl" aria-hidden="true">👨‍👩‍👧</div>
        <h3 id="gate-title" class="text-xl font-black text-slate-800">Área da Família</h3>
        <p class="text-sm text-slate-500 text-center">Para adultos. Responda a conta para entrar.</p>
        <div class="text-2xl font-black text-violet-700 bg-violet-50 px-6 py-2 rounded-xl">${n1} × ${n2} = ?</div>
        <input type="number" id="gate-input" inputmode="numeric" aria-label="Resposta da conta" class="w-28 text-center text-2xl font-bold border-2 border-violet-200 rounded-xl p-2" />
        <p id="gate-error" class="text-sm text-rose-600 font-bold" hidden>Resposta incorreta.</p>
        <div class="flex gap-2 w-full">
          <button id="btn-gate-cancel" class="flex-1 bg-slate-100 font-bold py-3 rounded-xl touch-target">Cancelar</button>
          <button id="btn-gate-confirm" class="flex-1 bg-violet-600 text-white font-bold py-3 rounded-xl touch-target">Entrar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const closeGate = () => { modal.remove(); previousFocus?.focus?.(); };
    const input = modal.querySelector('#gate-input');
    const confirm = () => {
      if (Number.parseInt(input.value, 10) === answer) { modal.remove(); this.openSettingsModal(); return; }
      input.value = '';
      modal.querySelector('#gate-error').hidden = false;
      input.focus();
    };
    modal.querySelector('#btn-gate-cancel').addEventListener('click', closeGate);
    modal.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeGate();
      if (event.key === 'Enter') confirm();
    });
    modal.querySelector('#btn-gate-confirm').addEventListener('click', confirm);
    input.focus();
  }

  buildReport() {
    const { core } = this.app;
    const snapshot = core.progress.snapshot();
    const entries = Object.entries(snapshot.activities || {})
      .map(([id, progress]) => ({ activity: activityCatalog.find((a) => a.id === id), progress }))
      .filter((entry) => entry.activity);
    const worlds = new Set(entries.filter((entry) => entry.progress.explored).map((entry) => entry.activity.world));
    const domains = {};
    entries.forEach(({ activity, progress }) => {
      (activity.developmentDomains || []).forEach((domain) => { domains[domain] = (domains[domain] || 0) + Number(progress.completions || 0); });
    });
    return {
      stars: snapshot.stars || 0,
      explored: entries.filter((entry) => entry.progress.explored).length,
      total: activityCatalog.length,
      worlds: worlds.size,
      totalWorlds: learningWorlds.length,
      minutes: core.progress.getTotalMinutes(),
      streak: snapshot.sessions?.streak || 0,
      topDomains: Object.entries(domains).sort((a, b) => b[1] - a[1]).slice(0, 6),
      recent: core.progress.getRecentHistory(8).map((item) => ({ ...item, activity: activityCatalog.find((a) => a.id === item.activityId) })).filter((item) => item.activity)
    };
  }

  openSettingsModal() {
    const { app } = this;
    const esc = (value) => app.escape(value);
    const report = this.buildReport();
    const currentAge = app.storage.getChildAge();
    const canInstall = app.pwa?.canInstall?.();
    const { screenTime } = app;
    const week = screenTime.lastDays(7);
    const weekMax = Math.max(15, ...week.map((day) => day.minutes));
    const { kidLock } = app;
    const isApple = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const lockTip = isNativeApp()
      ? 'No app, a trava fixa a tela: Início, Recentes e Voltar ficam bloqueados. Para mais segurança, ative em Configurações → Segurança → Fixar app a opção "Pedir PIN para liberar". Emergência: segure Voltar + Recentes.'
      : isApple
      ? 'Para travar de vez no iPhone/iPad: adicione o app à Tela de Início (Compartilhar → Adicionar à Tela de Início) e ative o Acesso Guiado em Ajustes → Acessibilidade → Acesso Guiado. Depois, abra o app e aperte 3 vezes o botão lateral (ou Início).'
      : /Android/.test(navigator.userAgent)
        ? 'Para travar de vez no Android: ative Configurações → Segurança → Fixar app (ou "Fixação de tela") e fixe este app pelo botão de apps recentes. Para sair, segure Voltar + Recentes.'
        : 'No computador, Esc não sai da tela cheia: é preciso segurar Esc por 2 segundos.';
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card family-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
        <div class="family-head">
          <h3 id="settings-title">👨‍👩‍👧 Área da Família</h3>
          <button id="btn-close-settings" class="touch-target" aria-label="Fechar">✕</button>
        </div>

        <section class="family-section">
          <h4>Perfil</h4>
          <label for="child-name-input">Nome ou apelido</label>
          <input type="text" id="child-name-input" value="${esc(app.storage.getChildName())}" maxlength="15" autocomplete="off" />
          <p class="family-label">Idade</p>
          <div class="setup-ages family-ages">
            ${AGE_BANDS.map((age) => `<button data-family-age="${age.id}" class="setup-age ${age.id === currentAge ? 'selected' : ''}" aria-pressed="${age.id === currentAge}">${esc(age.label)}</button>`).join('')}
          </div>
          <p class="family-hint">A idade define quais brincadeiras aparecem e o nível de ajuda.</p>
        </section>

        <section class="family-section">
          <h4>Tempo de tela</h4>
          <p class="family-label">Limite por dia</p>
          <div class="setup-ages family-limits">
            ${SCREEN_TIME_OPTIONS.map((minutes) => `<button data-limit="${minutes}" class="setup-age ${minutes === screenTime.limitMinutes ? 'selected' : ''}" aria-pressed="${minutes === screenTime.limitMinutes}">${minutes ? `${minutes} min` : 'Sem limite'}</button>`).join('')}
          </div>
          <p class="family-hint">Hoje: ${screenTime.minutesToday()} min${screenTime.limitMinutes ? ` de ${screenTime.allowedToday()} min` : ''}. Ao atingir o limite, a brincadeira atual termina e o app sugere um descanso.</p>
          ${screenTime.isOverLimit() ? '<button id="btn-extra-time" class="family-button">+10 minutos hoje</button>' : ''}
          <p class="family-label">Últimos 7 dias</p>
          <div class="week-bars">${week.map((day) => `<div class="week-bar"><span style="height:${Math.round((day.minutes / weekMax) * 100)}%"></span><small>${esc(day.label)}</small><b>${day.minutes}</b></div>`).join('')}</div>
        </section>

        <section class="family-section">
          <h4>Modo criança</h4>
          <label class="family-toggle"><input type="checkbox" id="kid-lock-toggle" ${kidLock.enabled ? 'checked' : ''} /> Tela cheia e travas</label>
          <p class="family-hint">${isNativeApp() ? 'O app fica em tela cheia e se fixa na tela no primeiro toque.' : canFullscreen() || isStandalone() ? 'O app abre em tela cheia no primeiro toque e volta sozinho se a criança sair. Também bloqueia o botão Voltar, o toque longo e o zoom.' : 'Este navegador não permite tela cheia em sites. Bloqueamos o botão Voltar, o toque longo e o zoom.'}</p>
          ${kidLock.active ? `<button id="btn-exit-fullscreen" class="family-button">${isNativeApp() ? 'Liberar o aparelho agora' : 'Sair da tela cheia agora'}</button>` : ''}
          <p class="family-hint">${esc(lockTip)}</p>
        </section>

        <section class="family-section">
          <h4>Som</h4>
          <label class="family-toggle"><input type="checkbox" id="sound-toggle" ${app.audio.isMuted ? '' : 'checked'} /> Sons e voz ligados</label>
        </section>

        <section class="family-section">
          <h4>Resumo</h4>
          <div class="family-stats">
            <div><strong>${report.stars}</strong><small>estrelas</small></div>
            <div><strong>${report.explored}/${report.total}</strong><small>brincadeiras</small></div>
            <div><strong>${report.worlds}/${report.totalWorlds}</strong><small>mundos</small></div>
            <div><strong>${report.minutes}</strong><small>minutos</small></div>
            <div><strong>${report.streak}</strong><small>dias seguidos</small></div>
          </div>
          <p class="family-label">Áreas mais exercitadas</p>
          <div class="domain-list">${report.topDomains.map(([domain, count]) => `<span>${esc(domain)} · ${count}</span>`).join('') || '<span>Ainda sem dados</span>'}</div>
          <p class="family-label">Últimas brincadeiras</p>
          <ul class="family-history">
            ${report.recent.map((item) => {
              const when = item.completedAt ? new Date(item.completedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
              return `<li><span>${esc(item.activity.title)}</span><small>${esc(when)}</small></li>`;
            }).join('') || '<li><span>A jornada ainda está começando.</span></li>'}
          </ul>
          <p class="family-label">Conquistas</p>
          <div class="reward-grid">${this.getRewards().map((reward) => `<div class="reward-chip ${reward.earned ? 'earned' : 'locked'}"><span>${reward.earned ? reward.icon : '🔒'}</span><div><strong>${esc(reward.title)}</strong><small>${esc(reward.description)}</small></div></div>`).join('')}</div>
          <p class="family-hint">Um retrato das brincadeiras, não uma avaliação. Não substitui acompanhamento profissional.</p>
        </section>

        ${canInstall ? `<section class="family-section"><h4>Instalar</h4><p class="family-hint">Instale para abrir em tela cheia e brincar sem internet.</p><button id="btn-install" class="family-button">📲 Instalar aplicativo</button></section>` : ''}

        ${app.updater?.supported ? `<section class="family-section">
          <h4>Atualizações</h4>
          <p class="family-hint">Versão ${esc(APP_VERSION)}. O conteúdo novo chega sozinho pela internet e entra na próxima vez que o app abrir.</p>
          <p id="update-status" class="family-hint" aria-live="polite"></p>
          <button id="btn-check-update" class="family-button">Procurar atualização</button>
          <button id="btn-install-apk" class="family-button" hidden>Baixar e instalar o app novo</button>
        </section>` : ''}

        <section class="family-section">
          <h4>Privacidade</h4>
          <p class="family-hint">Nome, idade e progresso ficam guardados só neste aparelho. O app não tem anúncios, cadastro, rastreamento nem envio de dados. Apagar os dados do navegador ou usar "Zerar progresso" remove tudo.</p>
        </section>

        <button id="btn-reset-stars" class="family-danger">Zerar progresso</button>
        <button id="btn-save-settings" class="family-save">Salvar e voltar</button>
      </div>`;
    document.body.appendChild(modal);

    let selectedAge = currentAge;
    modal.querySelectorAll('[data-family-age]').forEach((button) => button.addEventListener('click', () => {
      selectedAge = button.dataset.familyAge;
      modal.querySelectorAll('[data-family-age]').forEach((item) => {
        item.classList.toggle('selected', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
    }));
    let selectedLimit = screenTime.limitMinutes;
    modal.querySelectorAll('[data-limit]').forEach((button) => button.addEventListener('click', () => {
      selectedLimit = Number(button.dataset.limit);
      modal.querySelectorAll('[data-limit]').forEach((item) => {
        item.classList.toggle('selected', item === button);
        item.setAttribute('aria-pressed', String(item === button));
      });
    }));
    modal.querySelector('#btn-extra-time')?.addEventListener('click', () => {
      screenTime.addExtraMinutes(10);
      modal.remove();
      app.renderHome();
    });
    modal.querySelector('#btn-close-settings').addEventListener('click', () => modal.remove());
    const updateStatus = modal.querySelector('#update-status');
    if (updateStatus) {
      const texts = {
        idle: '',
        checking: 'Procurando…',
        current: 'Tudo em dia.',
        ready: 'Atualização baixada: entra na próxima vez que o app abrir.',
        apk: 'Há uma versão nova do aplicativo. Ela precisa ser instalada.',
        error: 'Não deu para verificar agora (sem internet?).'
      };
      const render = (state) => {
        updateStatus.textContent = texts[state.status] ?? '';
        modal.querySelector('#btn-install-apk').hidden = !state.apk;
      };
      render(app.updater.state);
      const off = app.updater.onChange(render);
      new MutationObserver(() => { if (!modal.isConnected) off(); }).observe(document.body, { childList: true });
      modal.querySelector('#btn-check-update').addEventListener('click', () => app.updater.check());
      modal.querySelector('#btn-install-apk').addEventListener('click', () => {
        // Com o app fixado na tela o Android não abre o instalador: libera antes.
        kidLock.pause();
        setTimeout(() => app.updater.openApk(), 400);
      });
    }
    modal.querySelector('#btn-exit-fullscreen')?.addEventListener('click', () => { kidLock.pause(); modal.remove(); });
    modal.querySelector('#btn-install')?.addEventListener('click', async () => { await app.pwa.promptInstall(); modal.remove(); });
    modal.querySelector('#btn-reset-stars').addEventListener('click', () => {
      if (!confirm('Tem certeza que deseja apagar todo o progresso?')) return;
      app.core.resetProgress();
      app.updateScoreUI();
      modal.remove();
      app.renderHome();
    });
    modal.querySelector('#btn-save-settings').addEventListener('click', () => {
      app.storage.setChildName(modal.querySelector('#child-name-input').value);
      if (selectedAge) app.storage.setChildAge(selectedAge);
      screenTime.setLimit(selectedLimit);
      const wantLock = modal.querySelector('#kid-lock-toggle').checked;
      if (wantLock !== kidLock.enabled) kidLock.setEnabled(wantLock);
      const wantSound = modal.querySelector('#sound-toggle').checked;
      if (wantSound === app.audio.isMuted) app.audio.toggleMute();
      modal.remove();
      app.renderHome();
    });
  }
}
