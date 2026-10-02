// Ponte com o app Android (Capacitor), carregada só dentro do app.
//
// O site nunca importa @capacitor/core no topo de um módulo: ao registrar plugins ele
// cria um Proxy, que não existe no iOS 9, e o site inteiro pararia nos aparelhos antigos.
// Dentro do app, a ponte nativa já cria window.Capacitor antes da página carregar.
//
// Os plugins voltam embrulhados ({ plugin }): o Proxy do Capacitor responde a qualquer
// propriedade, inclusive "then", e uma Promise resolvida com ele tentaria chamá-lo.
export const isNativeApp = () => Boolean(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());

let core = null;
const plugins = {};

export function capacitorCore() {
  if (!core) core = import('@capacitor/core');
  return core;
}

export function nativePlugin(name) {
  if (!plugins[name]) plugins[name] = capacitorCore().then(({ registerPlugin }) => ({ plugin: registerPlugin(name) }));
  return plugins[name];
}

export function capacitorUpdater() {
  return import('@capgo/capacitor-updater').then((module) => ({ plugin: module.CapacitorUpdater }));
}
