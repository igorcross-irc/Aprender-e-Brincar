# Plano — Jogos e aplicativos de nível profissional

Data: 07/10/2026 · Status: proposta para decisão (nenhum código alterado)

## 1. Diagnóstico honesto do que existe hoje

O app atual é uma boa **fundação** (privacidade, tempo de tela, modo criança no Android, áudio em português, testes automáticos, suporte a aparelhos antigos), mas o conteúdo é de **protótipo**:

| Hoje | Por que parece amador |
|---|---|
| Arte = emojis (e PNGs de emoji nos aparelhos antigos) | Sem identidade, sem personagem, sem "mundo" |
| ~50 atividades com 5–6 motores genéricos (`learning-world.js` faz 26 modos) | Muitas "telas de escolher uma opção" com troca de figura |
| Sessões de 30–60 s, sem história nem progressão | Não existe motivo para voltar amanhã |
| Feedback = som sintetizado + animação CSS curta | Falta "suco" (partículas, física, câmera, música reativa) |
| Sem animação de personagem | A criança não se apega a nada |

Regra do documento mestre ("não criar centenas de jogos isolados") continua certa. A mudança é de **estratégia**: em vez de 50 minijogos rasos, **6 jogos-âncora profundos**, cada um com mundo próprio, personagens animados, progressão e semanas de conteúdo.

> Resposta curta à pergunta: sim, dá para planejar nesse nível. O que decide o resultado é a **arte e a animação**, não o código. Seção 6 explica as opções.

## 2. O que significa "profissional" (barra de qualidade)

Referências de mercado: Toca Boca, Sago Mini, Khan Academy Kids, Lingokids, Pok Pok, Duck Duck Moose.

1. **Direção de arte única**: um guia de estilo (paleta, formas, espessura de traço, iluminação, expressões faciais) que todo asset obedece.
2. **Personagens com vida**: idle, reação ao toque, comemorar, dormir, olhar para o dedo da criança. Animação por esqueleto (Rive/Spine) ou quadro a quadro.
3. **Suco em cada toque**: squash & stretch, partículas, easing físico, vibração leve (haptics), câmera que reage, música que muda com a ação.
4. **Mundo, não tela**: cenas com camadas de paralaxe, ciclo dia/noite, clima, detalhes escondidos, coisas que se mexem sozinhas.
5. **Sem derrota e sem texto**: erro nunca pune; a criança nunca precisa ler (já é regra do projeto).
6. **Progressão real**: o mundo cresce a cada visita (horta, casa, cidade), coleções, surpresas diárias, sem ranking nem pressão.
7. **Som profissional**: música em camadas, efeitos desenhados (não só sintetizados), voz humana gravada (já há 329 locuções + fila de gravação).
8. **Orçamento de desempenho**: 60 fps em aparelho médio de 2019, jogo abre em <3 s, <40 MB por jogo, carregamento sob demanda.
9. **Ética**: zero anúncio, zero compra dentro do jogo para criança, zero rastreamento (mantém `docs/PRIVACY.md`).
10. **Validação com criança real**: teste de 15 minutos com 5 crianças de cada faixa antes de fechar cada jogo.

## 3. Os 6 jogos-âncora

Cada um declara uma faixa principal, mas tem **modo bebê** (só causa e efeito) e **modo avançado** (metas e sequências).

### 3.1 Fazendinha Viva (2–5 anos, também 12 m+ em modo toque livre)
Uma fazenda em cena ampla, com paralaxe, que muda do amanhecer à noite.
- **Loop**: acordar os bichos → alimentar (combinar comida e animal) → coletar ovos/leite (contar) → regar a horta → ver crescer → vender na feirinha → decorar.
- **Aprendizado embutido**: vocabulário (bichos, comidas, cores), contagem 1–10, causa e efeito, sequência (semente → broto → fruto), sons.
- **Profundidade**: 12 animais com 8 animações cada, clima, estações, 40 itens de decoração desbloqueáveis, mini-eventos (pintinho nasce, chuva, arco-íris).
- **Substitui**: "Animais", "Encontre o animal", "Quem fez esse som" e afins, que viram **parte natural** do jogo.

### 3.2 Cozinha Maluca (3–5 anos)
Cozinha de brinquedo com física: lavar, cortar (com faca segura), misturar, assar, servir clientes bichinhos.
- Receitas em etapas visuais (sequência), medir "1, 2, 3 colheres" (contagem), formas e cores dos ingredientes.
- Clientes têm personalidade e pedido por **figura**, nunca por texto.
- 30 receitas em 3 níveis; livro de receitas que a família pode ver.

### 3.3 Trem das Letras e Números (4–5 anos, ponte para 6–7)
Trem que atravessa mundos (floresta, praia, cidade) em rolagem lateral com paralaxe; cada estação ensina uma letra ou quantidade.
- Alfabetização em português brasileiro: **som antes do nome**, sílabas, rimas, primeira palavra escrita pela criança traçando.
- Traçado de letras com feedback de caminho (estilo Duck Duck Moose), tolerante a mão pequena.
- Vagões que a criança monta e personaliza.

### 3.4 Estúdio dos Bichos (todas as idades)
Banda de animais; cada um toca um instrumento real gravado.
- Piano/tambor/xilofone livres → **sequenciador visual** de 4 trilhas para 3–5 anos.
- Música reativa: as cenas dançam no ritmo; grava e guarda a "música da criança".
- Substitui "Piano dos Animais", "Copie o ritmo", "Ritmo musical".

### 3.5 Ateliê Mágico (2–5 anos)
- Pincéis reais (aquarela, giz, glitter, carimbos, borracha) com física de tinta, não só traço vetorial.
- **Desenhos que ganham vida**: páginas para colorir cujo desenho se anima depois de pintado.
- Galeria de obras da criança, exportável para a família (arquivo local).
- Substitui "lousa" e "quebra-cabeça" (que ganha peças com ilustração real e encaixe satisfatório).

### 3.6 Mundo das Cenas (12 m–4 anos)
A evolução de "escolha o animal / o que está atrás": **cenas ricas para explorar** (fundo do mar, floresta, quintal, noite, espaço) com 40–60 pontos tocáveis cada, que reagem, falam o nome, e escondem surpresas encadeadas.
- Sem objetivo imposto: a criança explora; um "olhinho" do mascote sugere o próximo detalhe se ela parar.
- Cada cena tem 1 mini-missão opcional (achar 5 bolhas azuis → peixe-balão aparece).
- É o jogo mais barato de produzir e o que mais aproveita arte de cenário.

### Jogos de apoio (aproveitam o que já existe, com arte nova)
Memória (cartas ilustradas e animadas), Esconde-esconde (com personagem), Bolhas (física + partículas), Comunicação (prancha com símbolos próprios). Passam a ser **minijogos dentro dos mundos**, não itens soltos no menu.

## 4. Aplicativos além dos jogos

1. **Companheiro** (mascote): personagem que cumprimenta, sugere, comemora, dorme. Base de toda a identidade. Precisa de nome, história, design e conjunto de animações.
2. **Diário da Família**: marcos observados (sem diagnóstico), semana em resumo, "o que brincou e o que gostou", sugestões de brincadeira offline. Exportável em PDF. Tudo local.
3. **Histórias com a voz da família**: pai, mãe ou avó gravam a narração das histórias no próprio aparelho; a criança escuta quem ela ama. É um diferencial forte e totalmente local.
4. **Livro de Histórias Vivas**: 10 histórias curtas animadas, narradas, com 1 escolha interativa por página.
5. **Linha 6–8 anos (alfabetização e matemática)**: app irmão com fônica, leitura guiada e operações, usando o mesmo motor e o Trem das Letras como ponte. É o crescimento natural quando a criança passa dos 5.
6. **Painel do Educador** (opcional, fase tardia): turmas, sem dados pessoais sensíveis, para escolas e fonoaudiólogos usarem em sessão.

## 5. Arquitetura técnica

Mantém: Vite, PWA, Capacitor/Android, kid-lock, tempo de tela, áudio, testes e2e.

Adiciona:

| Necessidade | Escolha proposta | Observação |
|---|---|---|
| Render 2D com partículas e paralaxe | **PixiJS** (WebGL com fallback canvas) | Validar versão x aparelho antes de fechar |
| Física (blocos, comida, tinta) | Matter.js | Leve, 2D |
| Animação de personagem | **Rive** (ou Lottie) | Arquivos pequenos, estados interativos |
| Áudio em camadas | Web Audio / Howler | Loops de música + stems |
| Cenas, receitas e histórias | **Dados em JSON** + editor simples | Conteúdo novo sem mexer em código |
| Assets | Atlas de sprites WebP/AVIF, carga por jogo | Orçamento de MB por jogo |

**Ponto de atenção — aparelhos antigos.** O projeto promete iOS 9 e Android 5. Os jogos-âncora **não vão rodar bem** nesses aparelhos. Proposta: detecção de capacidade na abertura; aparelho moderno recebe os jogos-âncora, aparelho antigo continua com o catálogo atual (modo "lite"). Isso preserva a promessa sem travar a qualidade.

Estrutura sugerida: `src/engine/` (cena, câmera, partículas, áudio em camadas), `src/games/<jogo>/` (regras + dados), `public/assets/<jogo>/` (atlas + áudio). Cada jogo-âncora implementa o contrato de atividade já existente, então progresso, tempo de tela e relatórios continuam funcionando.

## 6. Arte — o fator decisivo

Código eu entrego. A qualidade final depende de como a arte é produzida. Opções:

| Opção | Qualidade | Custo | Risco |
|---|---|---|---|
| A. Ilustrador/animador contratado | Máxima | Maior | Prazo |
| B. Arte gerada por IA em estilo único + refino por designer | Alta, se houver curadoria | Médio | Inconsistência entre personagens; direitos de uso a conferir |
| C. Vetor procedural/SVG feito no código | Média, bem limpa | Menor | Tem teto estético |
| D. Mistura: A/B para personagens e capas, C para cenários e partículas | Alta | Médio | Recomendado |

O projeto já usou Canva para a figura da vaca. Neste ambiente também há conectores de Figma, Canva, Adobe e ElevenLabs (alguns exigem autorização na conta antes de usar). Dá para montar um fluxo: guia de estilo no Figma → geração/curadoria de personagens → exportação para atlas → animação no Rive.

**Recomendação: opção D**, começando por **um** personagem e **um** cenário para provar o estilo antes de multiplicar.

## 7. Roadmap proposto

**Fase 0 — Fundamentos (2 semanas)**
- Decidir nome e design do mascote; criar o guia de estilo.
- Escolher fonte de arte (seção 6).
- Prova técnica: PixiJS + Rive + física rodando em um Android de entrada e em um iPhone antigo; medir fps e MB.

**Fase 1 — Fatia vertical da Fazendinha Viva (4–6 semanas)**
- 1 cenário, 4 animais animados, loop completo (alimentar → coletar → plantar), ciclo dia/noite, música, vozes.
- Teste com crianças reais. **Só continua se a fatia passar na barra de qualidade da seção 2.**

**Fase 2 — Completar a Fazendinha e lançar como "jogo-âncora 1" (4–6 semanas)**
- 12 animais, horta, decoração, eventos, progressão. Integração com Área da Família e Diário.

**Fase 3 — Mundo das Cenas + Estúdio dos Bichos (6–8 semanas)**
- Os dois de maior reaproveitamento de arte e áudio.

**Fase 4 — Ateliê Mágico e Histórias Vivas (6–8 semanas)**

**Fase 5 — Cozinha Maluca e Trem das Letras (8–10 semanas)**

**Fase 6 — Linha 6–8 anos e Painel do Educador (a definir)**

Os prazos assumem arte entregue em paralelo; sem artista dedicado, a Fase 1 dobra.

## 8. Critérios para aprovar cada jogo-âncora

- [ ] Passa a barra de qualidade da seção 2 (10 itens)
- [ ] 60 fps em aparelho de referência; abre em <3 s; dentro do orçamento de MB
- [ ] Criança de 2 anos brinca 10 min sem ajuda e sem frustração
- [ ] Nenhum texto necessário; todas as instruções faladas
- [ ] Funciona offline; sem rede, sem rastreamento
- [ ] Testes e2e e robô `play-all` cobrem o novo jogo
- [ ] Descrição para a família do que ele desenvolve, sem promessa clínica

## 9. Decisões tomadas (07/10/2026)
1. **Arte:** feita por nós dois (você e eu) e por ferramentas de IA. Pipeline escolhido: vetor desenhado no código (pequeno, consistente e animável) para personagens e cenários, em estilo chapado e vibrante inspirado em animação infantil brasileira (formas geométricas, bolinhas, listras, acessórios coloridos). IA entra para referências, texturas, ícones e capas, sempre com curadoria; gerações que gastam créditos só com aval.
2. **Idade:** foco em 6 meses a 5 anos. A linha de 6 a 8 anos **sai do plano** (já existem apps escolares que atendem bem). Máximo de **5, no limite 6 jogos-âncora**.
3. **Aparelhos antigos:** **modo lite mantido.** Cada jogo-âncora terá uma versão lite em HTML/CSS (iOS 9, Android 5, sem WebGL, pouca memória ou escolha da família em Área da Família → Gráficos).
4. **Modelo:** sem anúncios por enquanto; ver `docs/MONETIZACAO_E_ANUNCIOS.md` para o marco que reabre a discussão.
5. **Primeiro jogo:** Fazendinha Viva (feita; ver `docs/CHANGELOG.md`).

### Lista fechada de jogos-âncora (máximo 6)
1. Fazendinha Viva — em andamento
2. Mundo das Cenas
3. Estúdio dos Bichos
4. Ateliê Mágico
5. Cozinha Maluca
6. (opcional) Histórias Vivas

Trem das Letras e Números e o app de 6 a 8 anos saíram: pertencem ao território escolar.

## 10. Perguntas originais (histórico)

1. **Quem faz a arte?** Contrato com ilustrador, IA com curadoria, ou vetor no código (seção 6)?
2. **Foco de idade**: continuar até 5 anos, ou já planejar a linha 6–8?
3. **Aparelhos antigos**: aceita o modo "lite" separado (seção 5)?
4. **Modelo**: continua gratuito e sem anúncio, ou app pago/assinatura para sustentar a produção de arte?
5. **Por qual jogo começar**: recomendo a **Fazendinha Viva**, por responder direto à crítica de "escolha um animal" e por servir à faixa de 2 anos que é a sua referência.

## Limite clínico
Os jogos continuam educativos e lúdicos. Não diagnosticam, não fazem triagem e não prometem tratamento.
