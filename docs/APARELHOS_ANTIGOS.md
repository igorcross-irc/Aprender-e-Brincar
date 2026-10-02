# Aparelhos antigos

O site funciona em aparelhos antigos sem versão separada: o build gera duas versões do código e o navegador escolhe sozinho.

| Aparelho | Versão que roda |
| --- | --- |
| iPhone/iPad com iOS 9 a 10.2 (ex.: iPad 2, iPad 3, iPad mini 1) | legada (ES5) |
| iOS 10.3 a 13, Android 5+ com Chrome antigo, Safari/Chrome/Firefox antigos | legada ou moderna, conforme o navegador |
| Aparelhos atuais | moderna (sem nenhuma mudança) |

## Como funciona
- **JavaScript**: `@vitejs/plugin-legacy` (em `vite.config.js`) traduz o código para ES5 e inclui os complementos que faltam (Promise, Array.from, structuredClone…). Os scripts `nomodule` só rodam em navegadores antigos.
- **Toque**: aparelhos sem Pointer Events (iOS < 13) usam `src/legacy/pointer-shim.js`, que traduz toque/mouse para os eventos que os jogos usam.
- **Layout**: `scripts/postcss-legacy.cjs` gera, no build, alternativas para grade (`display: grid`), espaçamento (`gap` em flex), `inset`, `:is()`, `clamp/min/max`. Elas só valem quando `src/legacy/compat.js` marca o `<html>` com `.no-grid` / `.no-flexgap` (o recurso não existe no aparelho).
- **Cartões quadrados**: sem `aspect-ratio` (iOS < 15), `compat.js` iguala a altura à largura (lista `SQUARE_SELECTORS`).
- **Imagens**: sem WebP (iOS < 14), `compat.js` troca `.webp` por `.png`. Toda imagem nova em WebP precisa da cópia: `python3 scripts/webp-to-png.py`.
- **Áudio**: sem `fetch`, os MP3 carregam por XMLHttpRequest; sem `String.normalize`, os acentos são tirados à mão para achar o MP3 certo.

## Limitações conhecidas no iOS 9
- Sem modo offline (service worker só existe a partir do iOS 11.3).
- Fonte Nunito não carrega (só existe em woff2); usa a fonte do sistema.
- Sem tela cheia pelo navegador: use **Adicionar à Tela de Início** (abre sem barras) e o **Acesso Guiado** (Ajustes → Geral → Acessibilidade → Acesso Guiado) para a criança não sair.
- Aparelhos dessa época são lentos: animações podem ficar menos suaves.

## Testar
```bash
npm run audit:legacy                  # ES5, PNGs, simulação de iPad antigo no Chromium
node scripts/play-all.mjs --legacy    # joga todas as brincadeiras na versão legada
```
A simulação desliga Pointer Events, `gap`, `aspect-ratio` e WebP e roda só a versão ES5. O teste final continua sendo no aparelho real.
