# Changelog

## 2026-09-30 — Revisão completa jogando tudo
Novo `npm run test:play-all`: um robô joga todas as brincadeiras de todas as idades até o fim (tenta as opções como uma criança), detecta travamentos, erros de JavaScript e grava o texto de cada rodada em `play-all-report.json`. Primeira passada: 19 travamentos em 173 jogadas. Corrigido:
- **Travamentos**: em "Encontre o Animal", "Quem Fez Esse Som?" e similares o animal pedido às vezes não estava entre as opções; em "Complete a Sequência" e "Sequência de Sons" a resposta certa podia ser sorteada para fora.
- **Conclusão atrasada**: um jogo que terminava depois de a criança sair (ex.: quebra-cabeça) abria a comemoração por cima de outra tela.
- **"Grande e Pequeno"** podia ter dois objetos grandes (só um aceito) ou nenhum; agora sempre um grande. Carro passou a ser "grande".
- **Gramática**: artigo correto nas perguntas ("Onde está a galinha?", "Encontre a estrela", "Onde está o pé?").
- **"Descobrir Cores"** mostrava três paletas iguais; agora mostra as cores.
- **Ícones provisórios** (SVGs com emoji pequeno dentro de um círculo) desligados até existirem ilustrações finais.
- **Histórias** agora narram frases de verdade, uma história completa por partida.
- **13 brincadeiras duplicadas** (mesma mecânica com outro nome, ex.: "Onde Vive o Animal?" abria "Encontre o Animal") saíram da lista; faixas etárias sobrepostas ajustadas; "Opostos" passou para 3+ anos.
- Título dentro do jogo agora é o mesmo do cartão; ritmos com ícones legíveis.
- E2E cobre a Área da Família (verificação, nome, idade, som, zerar progresso).

## 2026-09-30 — Fase 4 — Família e qualidade
- **Tempo de tela opcional** (15 a 60 min/dia) na Área da Família; conta só com o app visível. Ao atingir o limite, a brincadeira atual termina e aparece a tela "Hora de descansar"; só um adulto libera +10 minutos.
- Relatório com gráfico dos últimos 7 dias de uso.
- Sair de uma brincadeira pelo meio (casinha ou voltar) interrompe timers, sons e ouvintes do jogo (`ExperienceController.stopActive`).
- Áudio: índice dos MP3 gerado no build (`scripts/audio-index.mjs` → `src/content/audio-files.js`). O motor usa qualquer MP3 existente, inclusive perguntas, e vai direto para a voz do navegador quando não há gravação — sem downloads que falham.
- `npm run audio:coverage` gera `docs/AUDIO_COVERAGE.md` com as falas que ainda precisam de gravação e o nome exato de cada arquivo.
- Desempenho medido em perfil de celular lento (CPU 6× mais lenta, rede 1,6 Mbps): início em ~1,6 s, 180 KB transferidos.
- E2E cobre saída no meio do jogo, limite de tempo e liberação pelo adulto.

## 2026-09-30 — Fase 3 — Brincadeiras mais profundas
- **Bolhas** (todas as idades): bolhas com animais sobem pela tela; estourar diz o nome do animal.
- **Contar Tocando** (12 meses+): cada objeto tocado ganha um número falado — correspondência um a um; quantidade máxima cresce com a idade.
- **Piano dos Animais** (todas as idades): teclas coloridas com notas sintetizadas e "Brilha, brilha, estrelinha" para ouvir e imitar.
- **Eu Quero…** (18 meses+): prancha de comunicação que fala pedidos e sentimentos pela criança; substitui o rascunho de comunicação.
- **Montar Frases** e **Frases em Ação** reativadas com o montador de frases existente.
- **Álbum de adesivos** no início: cada brincadeira concluída pela primeira vez vira um adesivo; o resultado mostra "Novo adesivo!".
- Moldura comum para brincadeiras novas (`game-shell.js`) com bolinhas de progresso e botão "Pronto!".
- E2E cobre as novas brincadeiras e o álbum.

## 2026-09-30 — Fase 2 — Visual
- Nova mascote: corujinha roxa em SVG com expressões (feliz, curiosa, comemorando).
- Fonte Nunito (arredondada) empacotada no app — funciona offline e sem chamar serviços externos.
- Mundos com fundo decorado (bolhas e ícone gigante) e ícones flutuando.
- Telas de jogo padronizadas: botão de voltar redondo, cartões arredondados com sombra, alinhamento no topo.
- "Encontre a Cor" mostra só a cor; cartas da memória com verso de estrela.
- Grades de escolha nunca passam de 2 colunas no celular.
- Sons sintetizados (sem arquivos) para toque, acerto, nova tentativa, balão e comemoração — respeitam o som desligado.

## 2026-09-30 — Fase 1 — Pensado para a criança
- Primeira abertura pede ao responsável nome (opcional) e idade; a criança não escolhe mais a faixa etária.
- Início mostra saudação pelo nome e os mundos da idade configurada, em blocos grandes e coloridos.
- Removidos das telas da criança: porcentagens, "aproveitamento", dias seguidos, perfil de aprendizagem, sugestões com justificativas e a tela de jornada.
- Área da Família reúne perfil (nome/idade), som, resumo, histórico, conquistas, instalação do app, privacidade e "zerar progresso".
- Botão 🔊 no cabeçalho repete a última instrução (`audio.prompt` / `audio.replayPrompt`); todas as brincadeiras registram sua instrução.
- Fim de brincadeira com confete, mascote, estrela voando até o contador e três botões grandes: de novo, outra, voltar.
- Tempo de brincadeira passa a ser medido (antes era sempre 0).
- Telas voltam ao topo ao navegar.
- Novo `docs/PRIVACY.md` com as regras de privacidade infantil.

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
