# Changelog

## 2026-10-16 (3) — Cozinha Maluca (5º jogo-âncora)
- **Para brincar agora (início):** três jogos-âncora da idade, escolhidos entre os que a criança brincou há mais tempo e girando de dia para dia, em botões grandes só com figura. A corujinha ganhou movimento e fala o primeiro jogo.
- **Diário da Família (Área da Família):** o que a criança viveu (histórias e a favorita, desenhos que ganharam vida, pratos, construções, bichos descobertos, música criada, dias seguidos), três ideias de brincadeira fora da tela ligadas ao que ela fez e botão para copiar o resumo. Tudo local.
- **Voz da família:** pai, mãe ou avó gravam as páginas das histórias no próprio aparelho (IndexedDB) e o leitor toca essa voz no lugar da narração padrão; dá para regravar, ouvir, apagar e desligar. Teste: `npm run test:familia`.
- **Galeria e Meu Livro:** cada desenho que ganhou vida, prato servido e construção pronta vira uma foto pequena guardada no aparelho (últimas 40). Na Área da Família dá para ver e apagar; "Abrir o Meu Livro" monta capa, páginas com legenda e uma página final com o que a criança fez, para imprimir ou salvar em PDF pelo navegador. Isso entrega a galeria de obras que estava pendente no Ateliê.
- **Mais construções e caderno de receitas:** Torre de Blocos ganhou a escada e o farol (3 e 4 construções por visita aos 3–4 e 4–5 anos). O Diário mostra o caderno de receitas com as 10 receitas, as já feitas com a conta e as que faltam.
- **Parlendas e Gestos (12 meses a 5 anos, em Criar & Mexer):** rimas faladas do folclore brasileiro (Um, dois, feijão com arroz; A galinha do vizinho; Serra, serra, serrador; Batatinha quando nasce; Corre, cotia; Hoje é domingo; Mindinho, seu vizinho). Cada verso é falado com um gesto em figura, um pulso suave no ritmo e um botão de palmas livre. Até 2 anos só o gesto de palmas, sem texto; a partir de 3 anos o verso aparece escrito. Teste: `npm run test:parlendas`.
- **Cartões de comunicação da família:** na prancha "Eu quero…", o adulto troca a figura por uma foto de verdade (escolhida ou tirada no aparelho, guardada em 240 px), grava a própria voz em cada cartão e cria cartões novos (a vovó, o cachorro, a mamadeira). A criança toca e ouve quem ela conhece. Tudo no IndexedDB do aparelho.
- **Desempenho:** o código principal caiu de 476 kB para 299 kB porque os jogos-âncora (e as emoções) só baixam o próprio código quando abrem. `npm run audit:budget` passou a cobrar limites de tamanho no CI.
- **Como eu me sinto? (2 a 5 anos, em Falar & Comunicar):** o primeiro jogo de emoções. Aos 2–3 anos, tocar na carinha pedida (feliz, triste, bravo); aos 3–4, ver uma situação do dia a dia e achar a carinha certa (inclui assustado e com sono); aos 4–5, também escolher o que ajuda (abraço, respirar fundo, chamar um adulto, descansar; bater nunca ajuda). Carinhas em SVG, voz em tudo, nada de derrota: se errar, a carinha certa pisca. Roda igual no modo lite. Teste: `npm run test:sentimentos`.
- **Campos de experiência da BNCC no Diário:** cada atividade pertence a um ou mais dos cinco campos da Educação Infantil e o Diário mostra por onde a criança tem brincado, sem nota nem comparação.
- **Leitura em dupla:** uma pergunta curta por página para o adulto fazer em voz alta (ver, sentir, imaginar, lembrar). As 12 histórias ilustradas têm perguntas próprias; as novas usam perguntas gerais. Fica desligada e o adulto liga na Área da Família.
- **Hora de dormir:** botão no início que abre uma história calma e narrada (muda por dia), com tela escura, sem texto nem botões; passa as páginas sozinha, toca uma cantiga de ninar baixinha e termina na tela de boa noite com a corujinha dormindo, sem estrela nem festa.
- **Torre de Blocos (12 meses a 5 anos):** peças coloridas que caem, quicam e encaixam na grade. Até 2 anos: empilhar e derrubar tocando no sino. Aos 2–3 anos: contar as peças (voz dos números). Aos 3–5 anos: copiar construções (torre, casinha, ponte, castelo): aos 3–4 anos toca na peça e ela vai ao lugar certo, a próxima peça pisca; aos 4–5 anos arrasta a peça até o contorno. Peça no lugar errado só volta para a bandeja. Construções prontas ficam guardadas em `ab_blocos_v1`. Modo lite em blocos de CSS. Teste: `npm run test:blocos`.
- **Cozinha Maluca (3–5 anos):** um bichinho chega e pede um prato **por figura**; a criança prepara em etapas visuais: juntar ingredientes (na ordem das figurinhas), **contar colheres** (voz diz um, dois, três), **mexer** (tocando ou girando o dedo), **assar** (forno com contagem em anel e sininho) e **servir**. Dez receitas (sanduíche, suco de laranja, suco de morango, salada, salada de frutas, peixe assado, omelete, bolo de morango, bolo de cenoura, sopa), 2 pedidos aos 3–4 anos e 3 aos 4–5. Ingrediente errado só balança e volta; nada de derrota. O livro de receitas feitas fica guardado no aparelho. Teste: `npm run test:cozinha`.
- Fallback de emojis (iOS antigo) atualizado para os novos ingredientes.
- Teste da Fazendinha ficou mais robusto: espera os legumes crescerem e repete o toque quando um enfeite passa na frente do canteiro.

## 2026-10-16 (2) — Ateliê Mágico (4º jogo-âncora)
- **Ateliê Mágico:** 5 desenhos para pintar (borboleta, peixinho, jardim, casinha, trenzinho). A criança escolhe uma cor e toca nas partes; cada cor toca a sua nota. Ao pintar boa parte, o desenho **ganha vida** (asas batendo, rabo do peixe, roda do trem girando, fumaça subindo…) e toca uma música. Aos 18–24 meses as cores vêm sozinhas, em arco-íris. Um desenho por visita; o desenho pronto fica guardado no aparelho.
- Desenhos descritos em caminhos SVG: o mesmo dado serve ao PixiJS e ao modo lite (SVG puro). Teste: `npm run test:atelie`.

## 2026-10-16 — Estúdio dos Bichos (3º jogo-âncora) e histórias narradas
- **Estúdio dos Bichos:** banda de bichos (vaca, galinha, cachorro, gato) com instrumentos sintetizados no aparelho (bumbo, xilofone, tambor, sininho). Até 3 anos: tocar nos bichos (2 a 4 bichos, sem objetivo). A partir de 3 anos: sequenciador de quadradinhos com 4 trilhas (4 ou 8 passos), a música fica guardada no aparelho. Modo lite em HTML/CSS. Teste: `npm run test:studio`.
- **Narração provisória:** as 31 histórias narradas com a voz Kokoro `pf_dora` (grátis, offline). `scripts/narrate-kokoro.py`, `docs/NARRACAO.md`.
- **Ilustrações:** Patinho Feio e Sapo-Cururu (Canva). 11 de 31 ilustradas; o resto espera créditos de imagem.

## 2026-10-07 (4) — Hora da Historinha: 31 histórias de domínio público (9 já ilustradas)
- **Catálogo de 31 histórias** em domínio público ou tradição popular, 5 a 6 por faixa de idade (6–12 m a 4–5 anos): cantigas de roda para os bebês, fábulas de Esopo, contos de Perrault, Grimm, Andersen, Jacobs, Southey, Kipling, Beatrix Potter, Monteiro Lobato e folclore brasileiro (A Festa no Céu, O Curupira). Textos recontados por nós; direitos e créditos em `docs/HISTORIAS.md`.
- **Leitor** (`storybook.js`, HTML/CSS, funciona em aparelho antigo): estante de capas, páginas ilustradas, botão grande de avançar que pulsa ao fim da fala, deslizar o dedo, "Aa" (mostrar texto), "Auto" (vira sozinho), estrela nas já lidas e crédito do autor na última página.
- **9 histórias já ilustradas** (6–12 m completa, 12–18 m com 4 de 5); as outras 22 têm texto e cenas prontos e esperam créditos de imagem.
- **Narração**: o leitor usa MP3 por página quando existir e, enquanto isso, a voz do navegador. Fluxo pronto: `narration-plan.mjs`, `split-narration.py`. **Pendente**: a conta do ElevenLabs está sem créditos e sem acesso às vozes brasileiras (plano grátis).
- Novos scripts: `story-prompts.mjs`, `slice-panels.py`, `stories-index.mjs` (no prebuild), `stories-audit.mjs` (`npm run audit:stories`, também na integração contínua).

## 2026-10-07 (3) — Mundo das Cenas: Fundo do Mar (2º jogo-âncora)
- **Cena ilustrada de verdade**: fundo de recife em estilo chapado e vibrante, 15 bichos e objetos (peixe-palhaço, tartaruga, golfinho, caranguejo, estrela-do-mar, baleia, baiacu, água-viva, polvo, baú do tesouro, concha, cavalo-marinho, tubarão amigo, peixe-anjo e um cardume), feitos com IA (Figma) e recortados por `scripts/slice-sheet.py`. Originais sem perda em `design/scenes/originais/`.
- **Motor de cenas** (`src/js/games/scenes/`): uma cena nova é só um arquivo de dados (`sea-scene.js`) mais a arte. Raios de luz, bolhas que a criança estoura, plâncton brilhante, peixes que atravessam a tela, tubarão que espanta o cardume, golfinho que salta, baleia que solta jato e canta.
- **Cada bicho reage do seu jeito**: baiacu infla, polvo muda de cor, baú e concha abrem com brilho, estrela gira, cavalo-marinho faz looping, água-viva pula, caranguejo corre de lado.
- **Descobertas, sem pressa e sem derrota**: cada bicho tocado pela primeira vez entra numa fileira de medalhas no topo. Ao juntar 3 a 7 (conforme a idade) a cena comemora. O **peixinho guia** aparece se a criança parar e aponta um bicho que ela ainda não achou.
- **A cena muda a cada visita**: dia, entardecer e noite (com plâncton e água-viva brilhando). Descobertas ficam guardadas só no aparelho.
- **Modo lite** (`scene-lite.js`): mesma ilustração com figuras em HTML/CSS para aparelhos antigos.
- Novo `npm run test:scenes` (jogo completo em 3 idades, reação de cada bicho, modo lite) e etapa na integração contínua; `legacy-audit` e `play-all` conhecem a cena.
- `shouldUseLite()` passou para `src/engine/stage.js` (compartilhado pelos dois jogos).
- Documentos: `docs/FERRAMENTAS_DE_ARTE_IA.md` (o que testamos e como gerar mais arte) e fila de locuções atualizada.

## 2026-10-07 (2) — Fazendinha Viva: novo visual, horta, desbloqueios e modo lite
- **Novo visual** (estilo chapado e vibrante, inspirado em animação infantil brasileira): sol e lua com carinha, listras e bolinhas nos morros, celeiro com telhado de escamas, bandeirinhas, cerca colorida, textura leve de guache. Bichos redesenhados com acessórios (lenço, gravata-borboleta, coleira com sino), padrões e olhos grandes.
- **Horta**: depois de alimentar os bichos, a criança rega (arrastando o regador ou tocando na terra), vê o brotinho crescer e colhe cenoura, tomate ou abóbora. A colheita e os ovos vão para a mesma cesta e são contados em voz alta (até 6).
- **Dia inteiro**: manhã (bichos), tarde (horta), noite (todos dormem com cantiga, lua com carinha, vaga-lumes).
- **A fazenda cresce a cada visita** (guardado só no aparelho): 2ª visita borboletas, 3ª moinho, 4ª balão, 5ª arco-íris, 6ª pintinho que segue a galinha. Aparece "Olha só! Uma novidade na fazenda!".
- **Modo lite de verdade** (`farm-lite.js`, HTML/CSS): aparelhos antigos, sem WebGL, com pouca memória ou escolhido em Área da Família → Gráficos. Mesma ideia: tocar na comida de cada bicho até a noite chegar.
- Correção: camadas decorativas interceptavam os toques e os bichos/camas não respondiam; agora só o que é interativo recebe toque.
- Em telas estreitas a fazenda mostra no máximo 4 bichos, em fila, para não amontoar.
- Documentos novos: `docs/MONETIZACAO_E_ANUNCIOS.md` (marco para reabrir anúncios) e decisões em `docs/PLANO_JOGOS_PROFISSIONAIS.md`.

## 2026-10-07 — Novo motor gráfico e primeiro jogo-âncora: Fazendinha Viva
- **Motor 2D novo** (`src/engine/`): PixiJS (WebGL), animações com suavização (`tween.js`) e partículas (`particles.js`). Carrega só quando o jogo abre; aparelhos sem WebGL ou muito antigos caem automaticamente para as Bolhas.
- **Fazendinha Viva** (12 meses+, mundo Descobrir): cenário em camadas com sol, nuvens, celeiro, árvores e grama balançando; 5 bichos desenhados em vetor com respiração, piscadas, rabo e orelhas; arrastar a comida certa para cada bicho (balão mostra o que ele quer); erro nunca pune (o bicho balança a cabeça e a comida volta); dica automática após alguns segundos parado.
- O dia passa conforme os bichos comem (amanhecer → dia → pôr do sol → noite com lua, estrelas e vaga-lumes) e no fim todos dormem ao som de uma cantiga. A galinha põe ovos que a criança coleta e conta em voz alta (até 5).
- Até 18 meses basta tocar na comida; 2 bichos aos 12–24 m, até 5 aos 4–5 anos.
- Plano completo dos próximos jogos: `docs/PLANO_JOGOS_PROFISSIONAIS.md`.

## 2026-10-01 — Novas brincadeiras e jogos antigos padronizados
- **Esconde-esconde** (6 meses a 4 anos): um animal se esconde atrás de 1 a 5 esconderijos (conforme a idade); a criança toca para achar. Trabalha permanência do objeto.
- **Separar por Cor** (18 meses+) e **Encaixe as Formas** (12 meses+): um objeto aparece e a criança toca no cesto/buraco certo — sem arrastar. Até 3 anos a voz dá a pista ("No cesto vermelho!").
- **Rimas** (3+), **Com Que Som Começa?** (4+) e **Hora da História** (3+, tocar nas cenas na ordem) saíram de rascunho com jogos de verdade. Não há mais brincadeiras ocultas por falta de mecânica.
- Memória, Quebra-Cabeça, Balões e Desenhar usam o mesmo cabeçalho dos jogos novos, com bolinhas de progresso no lugar de "Nível 2 • 3 pares", "Jogadas" e "Tentativas".
- `test:play-all` aprendeu os jogos novos e aceita `--only id1,id2` para jogar só algumas brincadeiras.

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
