# Plano de integração — como as melhorias entram no app

Atualizado em 07/10/2026. Este plano responde "como isso chega às crianças sem quebrar o que já funciona". A estratégia dos jogos está em `docs/PLANO_JOGOS_PROFISSIONAIS.md`; aqui está o caminho de entrega.

## 1. Onde estamos
Tudo o que foi feito está na branch `claude/plano-jogos-profissionais`. **Nada foi para a `main`, nenhum pull request foi aberto e nenhum release foi publicado.** Os aparelhos das crianças continuam na versão 0.6.0.

| Entrega | Estado | Observação |
|---|---|---|
| Motor gráfico PixiJS (`src/engine/`) | pronto | carrega só quando o jogo abre (≈ 0,9 MB, em pedaço separado) |
| Fazendinha Viva | pronta, com modo lite | manhã, horta, noite, 5 novidades por visita |
| Mundo das Cenas: Fundo do Mar | pronto, com modo lite | 15 bichos, 3 momentos do dia |
| Hora da Historinha (leitor) | pronto | funciona em HTML/CSS, inclusive em aparelho antigo |
| Histórias | **9 de 31 ilustradas, 0 narradas** | texto das 31 pronto; faltam créditos de imagem e de voz |
| Testes automáticos | prontos | núcleo, auditorias, aparelho antigo, ponta a ponta, Fazendinha, Cenas, Histórias |
| Anúncios | **não** implementados, de propósito | critérios em `docs/MONETIZACAO_E_ANUNCIOS.md` |

## 2. Regras de entrega
1. **Só conteúdo web, nunca parte nativa.** Nada em `android/` nem em `capacitor.config.json` mudou, então a "impressão digital" nativa continua igual e o app Android recebe tudo **sozinho, em segundo plano** (zip do release). Se algum dia uma mudança tocar a parte nativa, a Área da Família passa a oferecer o APK novo e o conteúdo novo espera.
2. **O modo lite é obrigatório em cada jogo novo.** Aparelho antigo, sem WebGL, com pouca memória ou com a opção ligada na Área da Família recebe a versão HTML/CSS. Sem lite, o jogo não entra.
3. **Não apagar o que funciona.** Regra do documento mestre: um jogo antigo só sai (ou fica escondido, como já se faz com `DUPLICATE_ACTIVITY_IDS`) depois que o substituto passou no piloto com crianças.
4. **Sem rede e sem rastreamento.** Tudo funciona offline depois da primeira abertura; nada é enviado para fora.
5. **Cada release passa pela mesma bateria** (seção 5) antes de a tag ser criada.

## 3. Etapas

### Etapa A — "Mundo novo" (versão 0.7.0)
O que entra: motor, Fazendinha Viva, Fundo do Mar e Hora da Historinha com as 9 histórias ilustradas.
1. Abrir o pull request da branch para a `main` e rodar a integração contínua (já inclui os testes novos).
2. Testar em **aparelhos reais** (seção 5), principalmente o fluxo de arrastar com o dedo e a fluidez da Fazendinha.
3. Piloto curto com crianças (seção 6).
4. Subir `package.json` para 0.7.0, atualizar a versão do `public/sw.js` e criar a tag `v0.7.0` (o release gera o site em zip, o APK e o `update.json`).
5. Como fica na tela da criança: os três jogos aparecem no mundo **Descobrir** (a Historinha também em **Falar & Comunicar**), no topo da lista. A Historinha mostra só as histórias que já têm ilustração.

### Etapa B — "Histórias narradas" (versão 0.8.0)
O que entra: as 22 histórias que faltam ilustradas e as 31 narradas.
1. **Destravar créditos** (ver seção 7): imagens (Figma ou Gamma) e voz (ElevenLabs em plano pago, com as vozes brasileiras).
2. Para cada história: `story-prompts.mjs` → gerar → `slice-panels.py` → conferir no leitor. Para a voz: `narration-plan.mjs` → gerar um áudio → `split-narration.py`.
3. **Ouvir uma história por faixa antes de gerar o resto** (sotaque, ritmo, pausas; ajustar o texto se necessário).
4. `npm run audit:stories` precisa mostrar 5 ou mais por faixa, com arte e narração.
5. **Tamanho:** a narração acrescenta cerca de 15 MB e as ilustrações cerca de 8 MB (hoje o site tem ≈ 21 MB). Como cada atualização de conteúdo baixa o zip inteiro, a proposta é publicar a narração como **pacote separado** ("Baixar histórias narradas", na Área da Família, com a família no Wi-Fi) e manter só as ilustrações no zip principal. Decidir isso antes de gerar as 31 narrações.

### Etapa C — "Estúdio dos Bichos" (versão 0.9.0)
Terceiro jogo-âncora (música reativa com bichos). Ao entregá-lo, **revisar o marco de anúncios** (3 jogos lançados).

### Etapa D — Faxina do catálogo antigo
Depois que o piloto mostrar que os jogos-âncora seguram a atenção, esconder o que ficou redundante, **nunca apagar**:

| Novo | Pode esconder (hoje) | Condição |
|---|---|---|
| Fazendinha Viva | Animais, Encontre o Animal, Quem Fez Esse Som? | criança de 2–3 anos brinca a Fazendinha 10 min sem ajuda |
| Fundo do Mar | Bolhas, Descobrir Animais | bebê de 12–18 meses explora a cena sozinho |
| Hora da Historinha | História em Sequência, Hora da História | mantém: eles treinam outra habilidade |
| Estúdio dos Bichos (futuro) | Piano dos Animais, Copie o Ritmo | idem |

### Etapa E — Cenas e jogos seguintes
Floresta, quintal e espaço (só dados e arte, receita em `design/scenes/README.md`); Ateliê Mágico; Cozinha Maluca. Limite combinado: no máximo 5, no limite 6 jogos-âncora.

## 4. Orçamentos que não podem estourar
| Item | Meta | Como medir |
|---|---|---|
| Tamanho do site no release | abaixo de 50 MB com a narração separada | `du -sh dist` no CI |
| Abrir um jogo-âncora | menos de 3 s em aparelho de entrada | cronometrar nos aparelhos reais |
| Fluidez | 60 quadros/s em aparelho médio de 2019; sem travar no de entrada | perfil do Chrome por USB |
| Memória | sem fechar sozinho em 2 GB de RAM | uso real por 10 min |
| Aparelho antigo | continua abrindo tudo (iOS 9, Android 5) | `audit:legacy` |

## 5. Bateria antes de cada release
Automática (já no CI): `test:core`, `smoke`, `audit:games`, `audit:child-interface`, `audit:audio`, `audit:stories`, build, `test:e2e`, `audit:legacy`, `test:farm`, `test:scenes`. Antes de uma versão grande, rodar também `test:play-all`.

Manual, em aparelho real (o que o robô não vê):
- Android moderno (celular e tablet), Android de entrada, iPad/iPhone antigo e um recente.
- Arrastar comida e regador com o dedo, toque duplo acidental, palma da mão na tela.
- Modo criança (tela fixada) abrindo e liberando; botão Voltar.
- Sem internet, depois de abrir uma vez.
- Interruptor "Modo lite" na Área da Família nos dois sentidos.
- Som: voz da Historinha, mudo funcionando, volume.
- Ler a Historinha em voz alta com o responsável: texto ligado/desligado, "Auto".

## 6. Piloto com crianças (sem coletar dados)
- 5 crianças por faixa (6–12 m, 12–18 m, 18–24 m, 2–3 a, 3–4 a, 4–5 a), 15 minutos cada, com o responsável ao lado, e sem câmera nem gravação do app.
- Observar e anotar à mão: pediu para repetir? soltou o aparelho cedo? ficou frustrada? precisou de ajuda para o gesto? o texto/voz era claro?
- **Segue** se, em cada faixa, a maioria brinca 5 minutos ou mais sem ajuda e nenhuma desiste por frustração. **Volta para ajuste** se o gesto de arrastar for difícil (aumentar ajuda automática), se a voz cansar ou se houver susto com o jogo.
- O mesmo vale para a voz: ouvir uma história narrada por faixa antes de produzir o restante.

## 7. Decisões e bloqueios (dependem de você)
| Item | O que falta | Quem resolve |
|---|---|---|
| Voz | conta do ElevenLabs sem créditos e sem acesso às vozes brasileiras (plano grátis); precisa de plano pago | você |
| Imagens | limite de uso do Figma (plano Starter) e créditos do Gamma quase acabando; esperar o reset ou ampliar | você |
| Revisão do conteúdo | ler os 31 textos e as moralejas adaptadas (ex.: o lobo foge, o troll cai no rio) | você |
| Aprovar o pull request | revisar e juntar à `main` | você |
| Nome e design do mascote | ainda sem definição | você e eu |
| Aparelhos para teste | pelo menos 1 Android de entrada e 1 iPad antigo | você |

## 8. Riscos e respostas
| Risco | Resposta |
|---|---|
| Arte de IA fica inconsistente entre histórias | usar sempre o mesmo pedido-base, conferir cada folha, refazer as provisórias (Pirulito, Barata) e descartar imagem com texto |
| Voz do navegador soa ruim enquanto não há narração | manter o leitor mostrando o texto e, se preciso, só liberar histórias narradas ao responsável |
| WebGL falha no meio do jogo | já existe o retorno automático ao modo lite |
| Pacote de conteúdo cresce demais | narração em pacote separado (Etapa B) |
| Direitos da arte e das histórias | histórias só de domínio público/folclore, créditos na última página, prompts e originais guardados; revisar os termos de uso de cada ferramenta de IA a cada compra de plano |
| Tempo de tela e vício | os jogos têm começo, meio e fim (noite chega, comemoração), sem ranking nem pressão; o limite diário da Área da Família continua valendo |

## 9. Próximos passos, em ordem
1. Você decide: plano de voz, créditos de imagem e aprovação do pull request.
2. Eu abro o pull request e acompanho o CI.
3. Teste em aparelhos reais e piloto curto (Etapa A) → versão 0.7.0.
4. Completar histórias (Etapa B) → versão 0.8.0.
5. Estúdio dos Bichos (Etapa C) → revisão do marco de anúncios.
