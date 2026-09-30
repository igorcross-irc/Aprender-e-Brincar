# Changelog

## 2026-09-30 — Fase 0 — Estabilização
- Corrigida a "Ordem dos Números": a resposta esperada pulava um número (4,5,6,7 → 9).
- Corrigidas "Descobrir Objetos" e "Caça aos Objetos", que nunca abriam (ReferenceError `safeOptions`).
- "Qual é Diferente?" recebia um número no lugar da lista de itens e não abria; agora mostra objetos iguais e um diferente.
- Fim de brincadeira unificado: jogos não abrem mais telas/modais próprios; o controlador mostra uma única tela de resultado com "Jogar de novo".
- Repetir uma brincadeira volta a mostrar resultado; a estrela só é exibida quando realmente concedida.
- A lousa não interrompe mais o desenho: a criança termina pelo botão "Pronto!".
- "Caça às Cores", "Qual é Diferente?" e "Ordem dos Números" falam a instrução; o nome da cor fica legível (inclusive branco).
- Atividades sem mecânica real (frases, comunicação, rimas, som inicial, história em sequência) ficam ocultas até serem implementadas (`DRAFT_ACTIVITY_IDS`).
- PWA: `manifest.json` movido para `public/`; service worker instala mesmo se um arquivo faltar, não guarda erros nem redirecionamentos e atualiza mídias em segundo plano.
- Cache no Vercel: arquivos com hash em `/build/` (imutáveis); `/assets/` (áudios e imagens) com cache de 1 dia.
- Manifest aceita qualquer orientação de tela.
- Testes: auditorias antigas corrigidas; novo `npm run test:e2e` joga as brincadeiras no Chromium em todas as idades.
- CI unificada em `build.yml` com `npm ci`, auditorias, build e E2E. `.gitignore` e `package-lock.json` versionados.

## 2026-09-28 — Fase 6 — Reengenharia do Universo
- Reescrito o motor universal LearningWorldGame.
- Corrigida lógica de respostas em múltiplos desafios.
- Corrigido o fluxo de montagem de frases e StorageManager.
- Ampliado catálogo com novas experiências de descoberta, associação, classificação, opostos, sons, ritmo e movimento.
- Criado src/content/audio-plan.js para consolidar futuras locuções.
- Mantidos os 329 áudios existentes como patrimônio reutilizável.
- Mantida separação entre atividades, jogos e experiências criativas.
- Reforçado o posicionamento educativo: estímulo lúdico, sem diagnóstico ou promessa de tratamento.

## 2026-09-28 — Fundação fases 0–5
- Criado núcleo de atividades e progresso local versionado.
- Adicionado catálogo por faixa etária.
- Removida dependência de Tailwind CDN.
- Adicionado PWA service worker.
- Melhorada segurança de interpolação do nome da criança.
- Adicionado baseline de acessibilidade e touch.
- Adicionado smoke check e workflow de CI.


## 2026-09-28 — Fase 7 — Universo Navegável
- Criado o Mapa do Aprender & Brincar.
- Adicionados 7 mundos temáticos.
- Atividades passaram a ter mundo principal.
- Criado fluxo idade → mundo → experiência.
- Área da Família ganhou resumo de progresso e privacidade.
- Melhorada a hierarquia visual dos cartões e navegação.
- Mantidos os jogos, atividades, áudio e assets existentes.


## 2026-09-28 — Fase 8 — Primeira camada de profundidade
- Ampliados datasets reutilizáveis de objetos, corpo, categorias, opostos, ritmos e movimentos.
- Conectadas novas experiências ao motor universal em vez de deixá-las como telas demonstrativas.
- Melhorada a garantia de opções válidas em associação e classificação.

## 2026-09-28 — Expansão do Universo
- Adicionadas experiências específicas para bebês.
- Ampliados vocabulário cotidiano, histórias interativas e música/ritmo.
- Expandido o catálogo de atividades e conectados os novos conteúdos aos mundos.
- Ampliado o plano central de futuras locuções.
- Mantidos os motores existentes e a arquitetura reutilizável.
