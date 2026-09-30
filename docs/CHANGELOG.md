# Changelog

## 2026-09-30 — Salto de estabilização (sobre a staging etapa-3-5)
Status: IMPLEMENTADO e TESTADO localmente (suíte + navegador). Não validado no deploy do Vercel. Não promovido.
- Corrigidas 3 atividades que quebravam ao abrir: `discover-objects` e `object-hunt` (variável `safeOptions` fora de escopo) e `odd-one-out` (registrado sem conteúdo).
- `odd-one-out` passa a montar rodadas com um grupo principal (animais) e um item de outro grupo (objetos), reaproveitando conteúdo existente.
- PWA: `manifest.json` movido para `public/` (o Vite gerava um nome com hash e o Service Worker falhava ao instalar). O Service Worker agora pré-carrega o build, só guarda respostas válidas, não devolve HTML no lugar de asset ausente e atualiza áudios/imagens em segundo plano.
- Cache HTTP: `immutable` mantido só para arquivos com hash; áudios e imagens (nome fixo) passam a ser revalidados.
- Catálogo: `guided-movement` recebeu o mundo `create-move`.
- Testes: `core-test` e `game-audit` atualizados para o código atual (estavam desatualizados e falhavam também na main).
- Nova auditoria no navegador (`npm run test:browser`): abre todas as atividades em todas as idades, verifica a jornada infantil, a persistência e o PWA offline. Incluída nos workflows do GitHub Actions.
- Adicionados `package-lock.json` (exigido pelo `npm ci` da workflow de staging) e `.gitignore`.

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
