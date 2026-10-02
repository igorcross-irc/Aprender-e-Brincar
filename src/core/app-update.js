// Atualizações do app Android pelos releases do GitHub.
//
// Cada release (ver .github/workflows/release.yml) publica:
//   update.json  { version, fingerprint, web: { file, sha256 }, android: { file, versionCode } }
//   web-<versão>.zip   o site inteiro (conteúdo, brincadeiras, falas, imagens)
//   aprender-e-brincar.apk
//
// Conteúdo: se a parte nativa do APK instalado é a mesma do release (impressão digital
// igual), o zip é baixado em segundo plano e aplicado na próxima vez que o app abrir.
// Nativo: se mudou, o conteúdo novo não é aplicado (poderia quebrar) e a Área da Família
// oferece o APK novo. Nenhum dado é enviado: só leituras públicas do GitHub.
import { Capacitor, CapacitorHttp, registerPlugin } from '@capacitor/core';
import { CapacitorUpdater } from '@capgo/capacitor-updater';

export const REPO = 'igorcross-irc/Aprender-e-Brincar';
const LATEST_RELEASE = `https://api.github.com/repos/${REPO}/releases/latest`;
const CHECKED_KEY = 'ab_update_checked_at';
const CHECK_EVERY_MS = 6 * 60 * 60 * 1000;

// eslint-disable-next-line no-undef
export const APP_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '0.0.0';

const AppInfo = registerPlugin('AppInfo');

export function compareVersions(a, b) {
  const pa = String(a).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  const pb = String(b).replace(/^v/, '').split('.').map((n) => parseInt(n, 10) || 0);
  for (let i = 0; i < 3; i++) {
    if ((pa[i] || 0) !== (pb[i] || 0)) return (pa[i] || 0) > (pb[i] || 0) ? 1 : -1;
  }
  return 0;
}

async function getJson(url) {
  // Requisição nativa: sem CORS e seguindo os redirecionamentos dos arquivos do GitHub.
  const response = await CapacitorHttp.get({ url, headers: { Accept: 'application/vnd.github+json, application/json, */*' } });
  if (response.status < 200 || response.status >= 300) throw new Error(`HTTP ${response.status}`);
  return typeof response.data === 'string' ? JSON.parse(response.data) : response.data;
}

export class AppUpdater {
  constructor({ storage = window.localStorage } = {}) {
    this.storage = storage;
    this.state = { status: 'idle', latest: null, apk: null, native: null, error: null };
    this.listeners = new Set();
  }

  get supported() { return Capacitor.isNativePlatform(); }

  onChange(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }

  set(patch) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((fn) => { try { fn(this.state); } catch {} });
  }

  async start() {
    if (!this.supported) return;
    // Obrigatório: sem isto o plugin acha que a versão nova travou e volta para a anterior.
    try { await CapacitorUpdater.notifyAppReady(); } catch {}
    let last = 0;
    try { last = Number(this.storage.getItem(CHECKED_KEY)) || 0; } catch {}
    if (Date.now() - last > CHECK_EVERY_MS) this.check().catch(() => {});
  }

  async check() {
    if (!this.supported || this.state.status === 'checking') return this.state;
    this.set({ status: 'checking', error: null });
    try {
      const native = await AppInfo.getNative();
      const release = await getJson(LATEST_RELEASE);
      const asset = (release.assets || []).find((item) => item.name === 'update.json');
      if (!asset) throw new Error('release sem update.json');
      const info = await getJson(asset.browser_download_url);
      const fileUrl = (name) => (release.assets || []).find((item) => item.name === name)?.browser_download_url;
      try { this.storage.setItem(CHECKED_KEY, String(Date.now())); } catch {}

      const apk = info.android && info.android.versionCode > (native.versionCode || 0) && fileUrl(info.android.file)
        ? { version: info.version, url: fileUrl(info.android.file) }
        : null;
      const sameNative = Boolean(info.fingerprint) && info.fingerprint === native.fingerprint;

      if (compareVersions(info.version, APP_VERSION) <= 0) {
        this.set({ status: apk ? 'apk' : 'current', latest: info.version, native, apk });
        return this.state;
      }
      if (!sameNative) {
        // Conteúdo novo precisa de um APK novo.
        this.set({ status: apk ? 'apk' : 'current', latest: info.version, native, apk });
        return this.state;
      }
      const zipUrl = info.web && fileUrl(info.web.file);
      if (!zipUrl) throw new Error('release sem o pacote do site');
      const { bundles = [] } = await CapacitorUpdater.list();
      let bundle = bundles.find((item) => item.version === info.version && item.status === 'success');
      if (!bundle) bundle = await CapacitorUpdater.download({ url: zipUrl, version: info.version, checksum: info.web.sha256 });
      await CapacitorUpdater.next({ id: bundle.id });
      this.set({ status: 'ready', latest: info.version, native, apk });
    } catch (error) {
      this.set({ status: 'error', error: error?.message || String(error) });
    }
    return this.state;
  }

  // Abre o APK no navegador do aparelho; o Android pergunta se quer instalar.
  // Quem chama deve liberar a trava (fixação de tela) antes.
  openApk() {
    if (this.state.apk?.url) window.location.href = this.state.apk.url;
  }
}
