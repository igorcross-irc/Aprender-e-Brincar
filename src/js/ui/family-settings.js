import { activityCatalog } from '../../content/activity-catalog.js';
import { rewardCatalog } from '../../content/reward-catalog.js';
import { learningWorlds } from '../../content/world-catalog.js';
import { AGE_BANDS } from '../../core/activity-registry.js';
import { SCREEN_TIME_OPTIONS } from '../../core/screen-time.js';
import { canFullscreen, isStandalone, isNativeApp } from '../../core/kid-lock.js';
import { APP_VERSION } from '../../core/app-update.js';
import { createChallenge, GateGuard } from '../../core/parental-gate.js';
import { createBackup, restoreBackup, requestPersistence } from '../../core/backup.js';
import { packStatus, downloadPack, storageEstimate } from '../../core/offline-pack.js';
import { campoTotals, CAMPOS } from '../../core/bncc.js';
import { buildPrintableHtml } from '../../core/printables.js';
import { defaultLimitFor } from '../../core/screen-time.js';

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
    this.gateGuard = this.gateGuard || new GateGuard();
    const guard = this.gateGuard;
    const challenge = createChallenge();
    const answer = challenge.answer;
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="gate-title">
        <div class="text-5xl" aria-hidden="true">👨‍👩‍👧</div>
        <h3 id="gate-title" class="text-xl font-black text-slate-800">Área da Família</h3>
        <p class="text-sm text-slate-500 text-center">Para adultos. Responda a conta para entrar.</p>
        <div class="text-2xl font-black text-violet-700 bg-violet-50 px-6 py-2 rounded-xl">${challenge.text} = ?</div>
        <input type="number" id="gate-input" inputmode="numeric" aria-label="Resposta da conta" class="w-28 text-center text-2xl font-bold border-2 border-violet-200 rounded-xl p-2" />
        <p id="gate-error" class="text-sm text-rose-600 font-bold" role="alert" hidden>Resposta incorreta.</p>
        <div class="flex gap-2 w-full">
          <button id="btn-gate-cancel" class="flex-1 bg-slate-100 font-bold py-3 rounded-xl touch-target">Cancelar</button>
          <button id="btn-gate-confirm" class="flex-1 bg-violet-600 text-white font-bold py-3 rounded-xl touch-target">Entrar</button>
        </div>
      </div>`;
    document.body.appendChild(modal);
    const closeGate = () => { window.clearInterval(lockTimer); modal.remove(); previousFocus?.focus?.(); };
    const input = modal.querySelector('#gate-input');
    const errorEl = modal.querySelector('#gate-error');
    const confirmButton = modal.querySelector('#btn-gate-confirm');
    let lockTimer = null;
    // Depois de erros seguidos o portão fecha por um tempo e mostra a contagem.
    const showLock = () => {
      window.clearInterval(lockTimer);
      const tick = () => {
        const left = guard.remainingMs();
        if (left <= 0) { window.clearInterval(lockTimer); input.disabled = false; confirmButton.disabled = false; errorEl.hidden = true; return; }
        input.disabled = true; confirmButton.disabled = true;
        errorEl.hidden = false;
        errorEl.textContent = `Muitas tentativas. Tente de novo em ${Math.ceil(left / 1000)} s.`;
      };
      tick();
      lockTimer = window.setInterval(tick, 1000);
    };
    const confirm = () => {
      if (guard.isLocked()) return showLock();
      if (Number.parseInt(input.value, 10) === answer) { guard.success(); window.clearInterval(lockTimer); modal.remove(); this.openSettingsModal(); return; }
      input.value = '';
      const result = guard.fail();
      if (result.locked) return showLock();
      errorEl.textContent = 'Resposta incorreta.';
      errorEl.hidden = false;
      input.focus();
    };
    if (guard.isLocked()) showLock();
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
    return {
      stars: snapshot.stars || 0,
      explored: entries.filter((entry) => entry.progress.explored).length,
      total: activityCatalog.length,
      worlds: worlds.size,
      totalWorlds: learningWorlds.length,
      minutes: core.progress.getTotalMinutes(),
      streak: snapshot.sessions?.streak || 0,
      campos: campoTotals(activityCatalog, snapshot.activities || {}),
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
          <p class="family-hint">A Sociedade Brasileira de Pediatria e a OMS recomendam evitar telas antes dos 2 anos e, dos 2 aos 5, até 1 hora por dia, sempre com um adulto por perto. Por isso o app já vem com um limite pela idade (${defaultLimitFor(currentAge)} min). Você não precisa configurar nada, mas pode mudar.</p>
          <p class="family-label">Limite por dia</p>
          <div class="setup-ages family-limits">
            ${SCREEN_TIME_OPTIONS.map((minutes) => `<button data-limit="${minutes}" class="setup-age ${minutes === screenTime.limitMinutes ? 'selected' : ''}" aria-pressed="${minutes === screenTime.limitMinutes}">${minutes ? `${minutes} min${!screenTime.isCustom && minutes === screenTime.limitMinutes ? ' · padrão' : ''}` : 'Sem limite'}</button>`).join('')}
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
          <p class="family-hint">${app.audio.hasPortugueseVoice?.() ? 'Falas que ainda não foram gravadas usam a voz do aparelho.' : 'Este aparelho não tem voz em português: falas ainda não gravadas aparecem escritas na tela para você ler em voz alta. Em Ajustes do aparelho, instale uma voz em português para melhorar.'}</p>
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
          <p class="family-label">Onde mais brincou (campos de experiência da BNCC)</p>
          ${(() => { const max = Math.max(1, ...report.campos.map((campo) => campo.plays)); return `<ul class="campo-list">${report.campos.map((campo) => `<li><span class="campo-name"><span aria-hidden="true">${campo.icon}</span> ${esc(campo.title)}</span><span class="campo-bar" aria-hidden="true"><i style="width:${Math.round((campo.plays / max) * 100)}%"></i></span><b>${campo.plays}×</b></li>`).join('')}</ul>`; })()}
          <p class="family-hint">É só a contagem de quantas vezes brincou em cada campo da Base Nacional Comum Curricular da Educação Infantil. Serve para variar as brincadeiras, não para medir a criança.</p>
          <p class="family-label">Últimas brincadeiras</p>
          <ul class="family-history">
            ${report.recent.map((item) => {
              const when = item.completedAt ? new Date(item.completedAt).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '';
              return `<li><span>${esc(item.activity.title)}</span><small>${esc(when)}</small></li>`;
            }).join('') || '<li><span>A jornada ainda está começando.</span></li>'}
          </ul>
          <p class="family-label">Conquistas</p>
          <div class="reward-grid">${this.getRewards().map((reward) => `<div class="reward-chip ${reward.earned ? 'earned' : 'locked'}"><span>${reward.earned ? reward.icon : '🔒'}</span><div><strong>${esc(reward.title)}</strong><small>${esc(reward.description)}</small></div></div>`).join('')}</div>
          <p class="family-hint">Um retrato das brincadeiras, não uma avaliação. Não substitui acompanhamento profissional. Se tiver dúvidas sobre o desenvolvimento, converse com o pediatra.</p>
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
          <h4>Longe da tela</h4>
          <p class="family-hint">Brincar junto vale mais do que qualquer tela. Algumas ideias por campo de experiência:</p>
          <details class="ideas"><summary>Ideias para brincar em casa</summary>
            ${Object.values(CAMPOS).map((campo) => `<p class="family-label">${campo.icon} ${esc(campo.title)}</p><ul class="ideas-list">${(campo.ideas || []).map((idea) => `<li>${esc(idea)}</li>`).join('')}</ul>`).join('')}
          </details>
          ${isNativeApp() || currentAge === '6-12m' || currentAge === '12-18m' ? '' : '<button id="btn-print" class="family-button">🖨️ Imprimir fichas para colorir e contar</button>'}
        </section>

        <section class="family-section">
          <h4>Sem internet</h4>
          <p class="family-hint">Guarde as falas e imagens no aparelho para brincar em viagens e lugares sem sinal (cerca de 4 MB; use o Wi‑Fi).</p>
          <p id="pack-status" class="family-hint" aria-live="polite">Verificando…</p>
          <button id="btn-download-pack" class="family-button">⬇️ Baixar para usar sem internet</button>
        </section>

        <section class="family-section">
          <h4>Backup do progresso</h4>
          <p class="family-hint">As estrelas e o histórico ficam só neste aparelho. Guarde o código abaixo para recuperar tudo se trocar de aparelho ou se o navegador limpar os dados.</p>
          <p id="persist-status" class="family-hint" aria-live="polite"></p>
          <button id="btn-backup-copy" class="family-button">📋 Copiar código de backup</button>
          <button id="btn-backup-file" class="family-button">💾 Baixar arquivo de backup</button>
          <label class="family-label" for="backup-input">Restaurar a partir de um código</label>
          <textarea id="backup-input" rows="3" class="backup-input" placeholder="Cole aqui o código que começa com AEB1."></textarea>
          <p id="backup-msg" class="family-hint" aria-live="polite"></p>
          <button id="btn-backup-restore" class="family-button">Restaurar</button>
        </section>

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
    let selectedLimit = null; // só vira escolha do responsável se ele tocar num botão
    modal.querySelectorAll('[data-limit]').forEach((button) => button.addEventListener('click', () => {
      selectedLimit = Number(button.dataset.limit);
      if (selectedLimit === 0 && !confirm('Sem limite de tempo? Para crianças pequenas o recomendado é manter um limite. Quer mesmo desligar?')) { selectedLimit = null; return; }
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
    modal.querySelector('#btn-print')?.addEventListener('click', () => {
      const sheet = window.open('', '_blank');
      if (!sheet) { alert('Seu navegador bloqueou a janela. Permita pop-ups para imprimir.'); return; }
      sheet.document.write(buildPrintableHtml(currentAge, Math.random, app.storage.getChildName()));
      sheet.document.close();
    });
    // Sem internet
    const packText = modal.querySelector('#pack-status');
    const packButton = modal.querySelector('#btn-download-pack');
    const refreshPack = async () => {
      const status = await packStatus();
      if (!status.supported || isNativeApp()) {
        packText.textContent = isNativeApp() ? 'No aplicativo, tudo já vem dentro do pacote.' : 'Este navegador não permite guardar para usar sem internet.';
        packButton.hidden = true;
        return;
      }
      const room = await storageEstimate();
      packText.textContent = status.cached >= status.total ? '✅ Tudo guardado. Já dá para brincar sem internet.' : `${status.cached} de ${status.total} arquivos guardados${room ? ` · espaço livre ≈ ${Math.max(0, room.quotaMb - room.usageMb)} MB` : ''}.`;
      packButton.hidden = status.cached >= status.total;
    };
    refreshPack();
    packButton.addEventListener('click', async () => {
      packButton.disabled = true;
      const result = await downloadPack({ onProgress: ({ done, total }) => { packText.textContent = `Baixando… ${done} de ${total}`; } });
      packButton.disabled = false;
      if (result.failed) packText.textContent = `Guardei ${result.done} de ${result.total}. ${result.failed} falharam (sinal fraco?). Toque de novo para tentar o resto.`;
      else await refreshPack(); // confere de verdade o que ficou guardado
    });

    // Backup
    requestPersistence().then((state) => {
      const text = { granted: '🔒 O navegador prometeu não apagar os dados sozinho.', denied: '⚠️ O navegador pode apagar os dados se faltar espaço. Faça o backup abaixo.', unsupported: '' }[state] || '';
      const isApple = /iP(hone|ad|od)/.test(navigator.userAgent);
      modal.querySelector('#persist-status').textContent = text + (isApple && !isStandalone() ? ' No iPhone/iPad, adicione o app à Tela de Início para o Safari não esquecer o progresso.' : '');
    });
    const backupMsg = modal.querySelector('#backup-msg');
    modal.querySelector('#btn-backup-copy').addEventListener('click', async () => {
      const code = createBackup();
      try { await navigator.clipboard.writeText(code); backupMsg.textContent = 'Código copiado. Cole num lugar seguro (mensagem para você mesmo, e-mail…).'; }
      catch { modal.querySelector('#backup-input').value = code; backupMsg.textContent = 'Não consegui copiar sozinho: o código apareceu na caixa abaixo, copie de lá.'; }
    });
    modal.querySelector('#btn-backup-file').addEventListener('click', () => {
      const blob = new Blob([createBackup()], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `aprender-e-brincar-backup-${new Date().toISOString().slice(0, 10)}.txt`;
      document.body.appendChild(link); link.click(); link.remove();
      window.setTimeout(() => URL.revokeObjectURL(link.href), 4000);
      backupMsg.textContent = 'Arquivo baixado. Guarde-o em lugar seguro.';
    });
    modal.querySelector('#btn-backup-restore').addEventListener('click', () => {
      const code = modal.querySelector('#backup-input').value;
      if (!code.trim()) { backupMsg.textContent = 'Cole o código primeiro.'; return; }
      if (!confirm('Restaurar vai substituir o progresso deste aparelho pelo do backup. Continuar?')) return;
      const result = restoreBackup(code);
      if (!result.ok) { backupMsg.textContent = result.error; return; }
      backupMsg.textContent = 'Restaurado! Reiniciando…';
      window.setTimeout(() => window.location.reload(), 600);
    });

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
      if (selectedLimit != null) screenTime.setLimit(selectedLimit);
      const wantLock = modal.querySelector('#kid-lock-toggle').checked;
      if (wantLock !== kidLock.enabled) kidLock.setEnabled(wantLock);
      const wantSound = modal.querySelector('#sound-toggle').checked;
      if (wantSound === app.audio.isMuted) app.audio.toggleMute();
      modal.remove();
      app.renderHome();
    });
  }
}
