// Modo criança: tela cheia e travas para a criança não sair do app sem querer.
// O navegador só permite tela cheia depois de um toque, então ela entra no
// primeiro toque e volta sozinha se a criança sair. Só a Área da Família desliga.
// Nada aqui substitui o bloqueio do sistema (Acesso Guiado no iOS, Fixar app no
// Android), que é o único jeito de impedir o botão Início.

import { isNativeApp, nativePlugin } from './native.js';

const STORAGE_KEY = 'ab_kid_lock';

// App Android (Capacitor): a trava é nativa — fixa o app na tela, esconde as barras
// e engole o botão Voltar (android/app/src/main/java/.../KidLockPlugin.java).
const nativeKidLock = () => nativePlugin('KidLock').then(({ plugin }) => plugin);
export { isNativeApp };

const root = () => document.documentElement;

function fullscreenElement() {
  return document.fullscreenElement || document.webkitFullscreenElement || null;
}

export function canFullscreen() {
  const el = root();
  return Boolean(el.requestFullscreen || el.webkitRequestFullscreen);
}

// Aberto pela Tela de Início (iOS) ou instalado (Android/desktop): já sem barras.
export function isStandalone() {
  return Boolean(window.navigator.standalone || window.matchMedia?.('(display-mode: fullscreen), (display-mode: standalone)').matches);
}

export class KidLock {
  constructor({ storage = window.localStorage } = {}) {
    this.storage = storage;
    this.paused = false; // adulto saiu da tela cheia pela Área da Família
    this.wakeLock = null;
    this.overlay = null;
    this.pinned = false;
    this.enabled = this.readEnabled();
  }

  readEnabled() {
    try { return this.storage.getItem(STORAGE_KEY) !== 'off'; } catch { return true; }
  }

  get active() { return this.enabled && !this.paused; }

  start() {
    // Primeiro toque em qualquer lugar: entra em tela cheia (ou fixa o app no Android).
    const onGesture = () => {
      if (!this.active) return;
      if (isNativeApp()) { if (!this.pinned) this.pinApp(); return; }
      if (!fullscreenElement()) this.enterFullscreen();
    };
    document.addEventListener('pointerup', onGesture, true);
    document.addEventListener('touchend', onGesture, true);
    document.addEventListener('click', onGesture, true);

    // Saiu da tela cheia (Esc, gesto do sistema): mostra o convite para voltar.
    const onChange = () => {
      if (fullscreenElement()) { this.hideReturn(); this.lockKeys(); }
      else if (this.active && canFullscreen() && !isStandalone()) this.showReturn();
    };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange);

    // Botão Voltar (Android, navegador): mantém sempre uma entrada extra no histórico.
    this.trapHistory();
    window.addEventListener('popstate', () => { if (this.active) this.trapHistory(); });

    // Menu de contexto, toque longo, arrastar imagens e zoom de pinça.
    document.addEventListener('contextmenu', (event) => { if (this.active) event.preventDefault(); });
    document.addEventListener('dragstart', (event) => { if (this.active) event.preventDefault(); });
    document.addEventListener('gesturestart', (event) => { if (this.active) event.preventDefault(); });
    document.addEventListener('touchmove', (event) => { if (this.active && event.touches?.length > 1) event.preventDefault(); }, { passive: false });

    // Fechar a aba no computador pede confirmação.
    window.addEventListener('beforeunload', (event) => {
      if (!this.active || isNativeApp()) return;
      event.preventDefault();
      event.returnValue = '';
    });

    // No app Android a fixação não depende de toque: trava já ao abrir.
    if (isNativeApp() && this.active) this.pinApp();

    // Tela não apaga enquanto a criança brinca.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState !== 'visible') return;
      this.keepAwake();
      if (isNativeApp()) this.refreshPinned();
    });
    this.keepAwake();
  }

  async pinApp() {
    this.pinned = true; // evita pedir de novo a cada toque enquanto o sistema responde
    try { this.pinned = Boolean((await (await nativeKidLock()).lock()).pinned); } catch { this.pinned = false; }
  }

  // Adulto pode ter soltado pelo sistema (Voltar + Recentes): o próximo toque fixa de novo.
  async refreshPinned() {
    try { this.pinned = Boolean((await (await nativeKidLock()).getStatus()).pinned); } catch {}
  }

  trapHistory() {
    try { window.history.pushState({ kidLock: true }, ''); } catch {}
  }

  async enterFullscreen() {
    const el = root();
    try {
      if (el.requestFullscreen) await el.requestFullscreen({ navigationUI: 'hide' });
      else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    } catch {}
    try { await window.screen?.orientation?.lock?.(window.screen.orientation.type); } catch {}
    this.keepAwake();
  }

  // Chromium no computador: Esc deixa de sair; é preciso segurar Esc por 2 segundos.
  lockKeys() {
    try { navigator.keyboard?.lock?.(['Escape'])?.catch?.(() => {}); } catch {}
  }

  async keepAwake() {
    if (!this.active || !navigator.wakeLock || this.wakeLock) return;
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener?.('release', () => { this.wakeLock = null; });
    } catch { this.wakeLock = null; }
  }

  showReturn() {
    // Adulto na Área da Família (ou numa confirmação dela): o próximo toque já volta.
    if (this.overlay || document.querySelector('.modal-overlay')) return;
    const overlay = document.createElement('div');
    overlay.className = 'kid-lock-return';
    overlay.innerHTML = '<button type="button" class="kid-lock-button" aria-label="Continuar brincando"><span aria-hidden="true">▶</span></button>';
    overlay.querySelector('button').addEventListener('click', () => this.enterFullscreen());
    document.body.appendChild(overlay);
    this.overlay = overlay;
  }

  hideReturn() {
    this.overlay?.remove();
    this.overlay = null;
  }

  // Área da Família: liga/desliga de vez.
  setEnabled(enabled) {
    this.enabled = Boolean(enabled);
    this.paused = false;
    try { this.storage.setItem(STORAGE_KEY, this.enabled ? 'on' : 'off'); } catch {}
    if (!this.enabled) this.release();
  }

  // Área da Família: sai da tela cheia agora; volta a travar ao recarregar o app.
  pause() {
    this.paused = true;
    this.release();
  }

  release() {
    this.hideReturn();
    if (isNativeApp()) {
      this.pinned = false;
      nativeKidLock().then((plugin) => plugin.unlock()).catch(() => {});
      return;
    }
    try { navigator.keyboard?.unlock?.(); } catch {}
    try { this.wakeLock?.release?.(); } catch {}
    this.wakeLock = null;
    if (!fullscreenElement()) return;
    try {
      if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
      else document.webkitExitFullscreen?.();
    } catch {}
  }
}
