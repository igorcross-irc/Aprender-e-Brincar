# Estado Atual — 06/10/2026

Aplicação pública (PWA) de brincadeiras educativas para crianças de 6 meses a 5 anos. Referência de uso: criança de 2 anos (faixa 2–3 anos). Detalhes de cada mudança em `docs/CHANGELOG.md`.

## Como a criança usa
1. Na primeira abertura, o responsável informa nome (opcional) e idade.
2. O início mostra saudação, os mundos da idade e o álbum de adesivos.
3. Cada mundo lista brincadeiras em blocos grandes; toda instrução é falada e o botão 🔊 repete.
4. Toda brincadeira termina numa única tela de comemoração: de novo, outra, voltar.

## Área da Família (verificação para adultos)
Perfil (nome/idade), tempo de tela com limite diário (padrão por idade), som, resumo e histórico, "onde mais brincou" pelos campos de experiência da BNCC, ideias para brincar junto e fichas para imprimir, baixar para usar sem internet, backup/restauração, conquistas, instalação do app, privacidade e "zerar progresso". O portão tem bloqueio crescente após erros.

## Arquitetura
- Vite + Tailwind; fonte Nunito empacotada; sem chamadas externas.
- `src/js/ui/app-screens.js`: telas da criança. `src/js/ui/family-settings.js`: Área da Família.
- `src/js/controllers/experience-controller.js`: inicia/encerra brincadeiras, sessão, resultado e limpeza.
- `src/js/game-registry.js`: mapeia cada atividade para seu motor. Motores: `learning-world.js` (26 modos), `games/independent/*`, `games/toddler/*` (bolhas, contar, piano, prancha, esconde-esconde, separar/encaixar), `games/language/*` (rimas, som inicial, história em sequência), memória, quebra-cabeça, balões, lousa, frases.
- `src/content/activity-catalog.js`: catálogo; `DRAFT_ACTIVITY_IDS` mantém fora do app o que ainda não tem mecânica real (hoje vazio) e `DUPLICATE_ACTIVITY_IDS` esconde cópias.
- `src/core/screen-time.js`: tempo de tela. `src/js/engine/sfx.js`: sons sintetizados. `src/js/engine/audio-engine.js`: MP3 + voz do navegador.
- PWA: `public/sw.js` (shell tolerante, mídia com atualização em segundo plano), `public/manifest.json`.

## Qualidade
- `npm run test:e2e`: abre todas as brincadeiras em todas as idades e joga os fluxos completos no Chromium (verificação principal).
- `npm run test:play-all`: robô que joga todas as brincadeiras até o fim e detecta travamentos (≈25 min; rodar antes de publicar).
- `test:core`, `smoke`, `audit:*`: verificações de contrato e conteúdo.
- CI: `.github/workflows/build.yml`.

## Próximos passos sugeridos
- Gerar as 141 falas que faltam com a voz Dora (≈ 1.500 caracteres; ver `docs/VOZ.md`) e, depois, "Grave a sua voz" na Área da Família.
- Ligar a assinatura do pacote de atualização (`docs/SEGURANCA.md`).
- Músicas, livrinhos ilustrados e jogos da memória temáticos (`docs/INSPIRACAO_ESCOLA_GAMES.md`).
- Ilustrações próprias no lugar dos emojis (mesmos caminhos de `public/assets/images/visual-library/`).
- Refatorar os jogos antigos (`learning-world.js`, `cards.js`, etc.) para a moldura `game-shell.js`.

## Limite clínico
As experiências são educativas e lúdicas. Não fazem diagnóstico, triagem clínica ou promessa de tratamento.
