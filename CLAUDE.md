# Aprender & Brincar — guia para o Claude

App infantil (6 meses a 5 anos) em PWA + Android (Capacitor). Feito para a Isadora e outras crianças. Leia `README.md` e `docs/CURRENT_STATE.md` para o panorama.

## Regras do responsável
- Português do Brasil em tudo que o usuário lê. Voz sempre **feminina**.
- Privacidade infantil (LGPD art. 14): sem conta, sem analytics, nada sai do aparelho (`docs/PRIVACY.md`).
- Não abrir pull request nem rodar HawkScan sem pedirem. Desenvolver na branch indicada na sessão e dar push.
- Sem créditos do ElevenLabs a voz provisória (Kokoro) é o paliativo.

## Voz / ElevenLabs
**Quando o usuário disser que há créditos (ou pedir para gerar falas): siga `docs/PLAYBOOK_VOZ_ELEVENLABS.md`.** Comandos: `npm run voice:status`, `npm run voice:import`, `npm run audio:coverage`, `npm run audit:audio`. Detalhes de vozes em `docs/VOZ.md`.

## Antes de entregar
`npm run test:unit && npm run test:core && npm run smoke && npm run audit:games && npm run audit:child-interface && npm run audit:audio && npm run build && node scripts/e2e-test.mjs && node scripts/legacy-audit.mjs`. Emoji novo exige `node scripts/emoji-images.mjs` (para iOS 9).
`npm run test:play-all` (≈ 25 min) antes de uma versão grande.

## Onde está o quê
`src/core` (regras puras e testáveis) · `src/content` (catálogo/conteúdo) · `src/js` (telas, jogos, áudio) · `tests/` (unitários) · `scripts/` (auditorias e ferramentas) · `docs/` (documentação; o `CHANGELOG.md` registra cada mudança).
Dados por criança usam chaves com sufixo de perfil (`src/core/profiles.js`); use `scoped()` ao criar chaves novas.
