# Locuções para gravar — Aprender & Brincar

Gerado por `node scripts/recording-list.mjs`. Marque `[x]` conforme gravar. A mesma lista, para importar em planilha ou banco de dados, está em `docs/locucoes.csv`.

## Resumo

| | Falas | Já gravadas | Falta gravar |
| --- | ---: | ---: | ---: |
| P1 — mais usadas | 20 | 3 | 17 |
| P2 — usadas hoje | 363 | 30 | 333 |
| P3 — futuro | 587 | 153 | 434 |
| **Total** | **970** | **186** | **784** |

## Gerar em lote (mesmo processo do lote anterior)

1. Use `docs/LOCUCOES_ROTEIRO.txt` no gerador de voz: uma fala por parágrafo, já na ordem certa (P1, depois P2, depois P3).
2. O gerador exporta `1_Chapter_1.mp3`, `2_Chapter_1.mp3`… na mesma ordem.
3. `docs/MAPA_RENOMEACOES_NOVAS.csv` tem o mesmo formato do `MAPA_RENOMEACOES.csv` (`ordem;arquivo_original;arquivo_renomeado`, mais a coluna `texto`).
4. Para renomear e copiar tudo de uma vez: `node scripts/rename-recordings.mjs <pasta-com-os-Chapter> docs/MAPA_RENOMEACOES_NOVAS.csv`.

Se gerar só uma parte (ex.: só P1 e P2), as primeiras linhas do roteiro e do mapa correspondem exatamente a essa parte.

## Como gravar (voz humana)

- **Arquivo:** MP3, mono, 44,1 kHz, 128 kbps. Um arquivo por fala, com o **nome exato** indicado (o app procura pelo nome).
- **Onde colocar:** `public/assets/audio/`. Depois rode `npm run build` (ou faça o deploy) — o app passa a usar o arquivo automaticamente; falas sem arquivo continuam na voz do navegador.
- **Voz:** calma, alegre e clara, um pouco mais lenta que o normal. Sorria ao falar. Mesma pessoa e mesmo microfone em todas as falas.
- **Ambiente:** cômodo silencioso, celular a ~20 cm da boca, sem eco. Deixe meio segundo de silêncio no início e no fim e depois corte.
- **Volume:** normalize todas as falas para o mesmo nível (ex.: −16 LUFS) para nenhuma ficar mais alta que as outras.
- **Perguntas** terminam com entonação de pergunta; **comemorações** com energia; **instruções** com calma.
- **Ordem sugerida:** P1 primeiro (aparece o tempo todo), depois P2 por brincadeira e, por fim, P3.

## Falas com o nome da criança

Estas falas incluem o nome configurado na Área da Família e, por isso, usam a voz do navegador. Grave a versão sem nome (já incluída em P1) — ela é usada quando não há nome configurado.

- Muito bem, {nome}!
- Oi, {nome}! Vamos brincar?

## P1 — mais usadas

### Mais usadas (várias brincadeiras) (13)

- [ ] Animais & Sons → `animais-sons.mp3`
- [ ] Có có có! → `co-co-co.mp3`
- [ ] Cores & Formas → `cores-formas.mp3`
- [ ] Criar & Mexer → `criar-mexer.mp3`
- [ ] Descobrir → `descobrir.mp3`
- [ ] Falar & Comunicar → `falar-comunicar.mp3`
- [ ] Memória & Atenção → `memoria-atencao.mp3`
- [ ] Miau! → `miau.mp3`
- [ ] Muito bem! Você terminou a brincadeira! → `muito-bem-voce-terminou-a-brincadeira.mp3`
- [ ] Muuu! → `muuu.mp3`
- [ ] Números & Lógica → `numeros-logica.mp3`
- [ ] Quá quá! → `qua-qua.mp3`
- [ ] Vamos ouvir mais uma vez. → `vamos-ouvir-mais-uma-vez.mp3`

### Telas do app (4)

- [ ] Brinque para ganhar adesivos! → `brinque-para-ganhar-adesivos.mp3`
- [ ] Hora de descansar! Até mais tarde! → `hora-de-descansar-ate-mais-tarde.mp3`
- [ ] Seus adesivos! → `seus-adesivos.mp3`
- [ ] Você brincou de novo! → `voce-brincou-de-novo.mp3`

## P2 — usadas hoje

### Animais (10)

- [ ] Au au! → `au-au.mp3`
- [ ] Cachorro. Au au! → `cachorro-au-au.mp3`
- [ ] Croac! → `croac.mp3`
- [ ] Galinha. Có có có! → `galinha-co-co-co.mp3`
- [ ] Gato. Miau! → `gato-miau.mp3`
- [ ] Leão. Grrr! → `leao-grrr.mp3`
- [ ] Onde está a galinha? → `onde-esta-a-galinha.mp3`
- [ ] Pato. Quá quá! → `pato-qua-qua.mp3`
- [ ] Sapo. Croac! → `sapo-croac.mp3`
- [ ] Vaca. Muuu! → `vaca-muuu.mp3`

### Balões dos Números (4)

- [ ] Estoure o número 1 → `estoure-o-numero-1.mp3`
- [ ] Estoure o número 2 → `estoure-o-numero-2.mp3`
- [ ] Estoure o número 3 → `estoure-o-numero-3.mp3`
- [ ] Estoure o número 4 → `estoure-o-numero-4.mp3`

### Bolhas (1)

- [ ] Estoure as bolhas! → `estoure-as-bolhas.mp3`

### Brincar com Sílabas (8)

- [ ] Bata palmas ou conte as partes da palavra. → `bata-palmas-ou-conte-as-partes-da-palavra.mp3`
- [ ] BO - LA. Muito bem! → `bo-la-muito-bem.mp3`
- [ ] BOLA → `bola.mp3`
- [ ] CA - SA. Muito bem! → `ca-sa-muito-bem.mp3`
- [ ] GA - TO. Muito bem! → `ga-to-muito-bem.mp3`
- [ ] MA - MÃE. Muito bem! → `ma-mae-muito-bem.mp3`
- [ ] MAMÃE → `mamae.mp3`
- [ ] PA - TO. Muito bem! → `pa-to-muito-bem.mp3`

### Brinque com o Ritmo (3)

- [ ] Muito bem! Ritmo combinado. → `muito-bem-ritmo-combinado.mp3`
- [ ] Vamos observar de novo. → `vamos-observar-de-novo.mp3`
- [ ] Você pode bater palmas junto. → `voce-pode-bater-palmas-junto.mp3`

### Caça às Cores (18)

- [ ] Encontre a cor Amarelo → `encontre-a-cor-amarelo.mp3`
- [ ] Encontre a cor Branco → `encontre-a-cor-branco.mp3`
- [ ] Encontre a cor Laranja → `encontre-a-cor-laranja.mp3`
- [ ] Encontre a cor Marrom → `encontre-a-cor-marrom.mp3`
- [ ] Encontre a cor Preto → `encontre-a-cor-preto.mp3`
- [ ] Encontre a cor Rosa → `encontre-a-cor-rosa.mp3`
- [ ] Encontre a cor Roxo → `encontre-a-cor-roxo.mp3`
- [ ] Encontre a cor Verde → `encontre-a-cor-verde.mp3`
- [ ] Encontre a cor Vermelho → `encontre-a-cor-vermelho.mp3`
- [ ] Muito bem! Amarelo → `muito-bem-amarelo.mp3`
- [ ] Muito bem! Branco → `muito-bem-branco.mp3`
- [ ] Muito bem! Laranja → `muito-bem-laranja.mp3`
- [ ] Muito bem! Marrom → `muito-bem-marrom.mp3`
- [ ] Muito bem! Preto → `muito-bem-preto.mp3`
- [ ] Muito bem! Rosa → `muito-bem-rosa.mp3`
- [ ] Muito bem! Roxo → `muito-bem-roxo.mp3`
- [ ] Muito bem! Verde → `muito-bem-verde.mp3`
- [ ] Muito bem! Vermelho → `muito-bem-vermelho.mp3`

### Com Que Som Começa? (24)

- [ ] Ba! Banana e Baleia! → `ba-banana-e-baleia.mp3`
- [ ] Ba… Banana. Qual começa igual? → `ba-banana-qual-comeca-igual.mp3`
- [ ] Bo! Bola e Bolo! → `bo-bola-e-bolo.mp3`
- [ ] Bo… Bola. Qual começa igual? → `bo-bola-qual-comeca-igual.mp3`
- [ ] Ca! Carro e Casa! → `ca-carro-e-casa.mp3`
- [ ] Ca… Carro. Qual começa igual? → `ca-carro-qual-comeca-igual.mp3`
- [ ] Escute de novo: Ba… Banana. Qual começa igual? → `escute-de-novo-ba-banana-qual-comeca-igual.mp3`
- [ ] Escute de novo: Bo… Bola. Qual começa igual? → `escute-de-novo-bo-bola-qual-comeca-igual.mp3`
- [ ] Escute de novo: Ca… Carro. Qual começa igual? → `escute-de-novo-ca-carro-qual-comeca-igual.mp3`
- [ ] Escute de novo: Ga… Gato. Qual começa igual? → `escute-de-novo-ga-gato-qual-comeca-igual.mp3`
- [ ] Escute de novo: Lu… Lua. Qual começa igual? → `escute-de-novo-lu-lua-qual-comeca-igual.mp3`
- [ ] Escute de novo: Ma… Macaco. Qual começa igual? → `escute-de-novo-ma-macaco-qual-comeca-igual.mp3`
- [ ] Escute de novo: Pa… Pato. Qual começa igual? → `escute-de-novo-pa-pato-qual-comeca-igual.mp3`
- [ ] Escute de novo: Sa… Sapo. Qual começa igual? → `escute-de-novo-sa-sapo-qual-comeca-igual.mp3`
- [ ] Ga! Gato e Galinha! → `ga-gato-e-galinha.mp3`
- [ ] Ga… Gato. Qual começa igual? → `ga-gato-qual-comeca-igual.mp3`
- [ ] Lu! Lua e Luva! → `lu-lua-e-luva.mp3`
- [ ] Lu… Lua. Qual começa igual? → `lu-lua-qual-comeca-igual.mp3`
- [ ] Ma! Macaco e Maçã! → `ma-macaco-e-maca.mp3`
- [ ] Ma… Macaco. Qual começa igual? → `ma-macaco-qual-comeca-igual.mp3`
- [ ] Pa! Pato e Palhaço! → `pa-pato-e-palhaco.mp3`
- [ ] Pa… Pato. Qual começa igual? → `pa-pato-qual-comeca-igual.mp3`
- [ ] Sa! Sapo e Sapato! → `sa-sapo-e-sapato.mp3`
- [ ] Sa… Sapo. Qual começa igual? → `sa-sapo-qual-comeca-igual.mp3`

### Complete a Sequência (3)

- [ ] Muito bem! Você descobriu o padrão. → `muito-bem-voce-descobriu-o-padrao.mp3`
- [ ] Observe a sequência mais uma vez. → `observe-a-sequencia-mais-uma-vez.mp3`
- [ ] Observe o padrão e escolha o que vem depois. → `observe-o-padrao-e-escolha-o-que-vem-depois.mp3`

### Contar Tocando (9)

- [ ] cinco! Muito bem! → `cinco-muito-bem.mp3`
- [ ] dois! Muito bem! → `dois-muito-bem.mp3`
- [ ] nove! Muito bem! → `nove-muito-bem.mp3`
- [ ] oito! Muito bem! → `oito-muito-bem.mp3`
- [ ] quatro! Muito bem! → `quatro-muito-bem.mp3`
- [ ] seis! Muito bem! → `seis-muito-bem.mp3`
- [ ] sete! Muito bem! → `sete-muito-bem.mp3`
- [ ] três! Muito bem! → `tres-muito-bem.mp3`
- [ ] um! Muito bem! → `um-muito-bem.mp3`

### Copie o Ritmo (1)

- [ ] Muito bem! Vamos para o próximo. → `muito-bem-vamos-para-o-proximo.mp3`

### Cores (4)

- [ ] Encontre a cor Azul → `encontre-a-cor-azul.mp3`
- [ ] Muito bem! Azul → `muito-bem-azul.mp3`
- [ ] Onde está a cor Branco? → `onde-esta-a-cor-branco.mp3`
- [ ] Onde está a cor Rosa? → `onde-esta-a-cor-rosa.mp3`

### Cores para Descobrir (1)

- [ ] Toque em uma cor para ouvir. Depois, toque em Continuar. → `toque-em-uma-cor-para-ouvir-depois-toque-em-continuar.mp3`

### Corpo (3)

- [ ] Mão → `mao.mp3`
- [ ] Olho → `olho.mp3`
- [ ] Pé → `pe.mp3`

### Desafio do Movimento (2)

- [ ] Gire → `gire.mp3`
- [ ] Vamos brincar juntos! → `vamos-brincar-juntos.mp3`

### Descobertas do bebê (3)

- [ ] Flor → `flor.mp3`
- [ ] Luz → `luz.mp3`
- [ ] Música → `musica.mp3`

### Descobrir Animais (1)

- [ ] Toque nos animais para ouvir. Quando quiser, toque em Continuar. → `toque-nos-animais-para-ouvir-quando-quiser-toque-em-continuar.mp3`

### Descobrir com as Mãos (6)

- [ ] Bola. Bola! → `bola-bola.mp3`
- [ ] Coração. Coração! → `coracao-coracao.mp3`
- [ ] Flor. Flor! → `flor-flor.mp3`
- [ ] Luz. Luz! → `luz-luz.mp3`
- [ ] Música. Música! → `musica-musica.mp3`
- [ ] Toque para descobrir. Não há respostas certas ou erradas. Toque em Continuar quando quiser. → `toque-para-descobrir-nao-ha-respostas-certas-ou-erradas-toque-em-continuar-quando-quiser.mp3`

### Descobrir Cores (1)

- [ ] Toque nas cores para ouvir o nome. Depois, toque em Continuar. → `toque-nas-cores-para-ouvir-o-nome-depois-toque-em-continuar.mp3`

### Descobrir Objetos (7)

- [ ] Camisa → `camisa.mp3`
- [ ] Colher → `colher.mp3`
- [ ] Copo → `copo.mp3`
- [ ] Escova → `escova.mp3`
- [ ] Livro → `livro.mp3`
- [ ] Não existe resposta errada aqui. Explore os objetos que quiser. → `nao-existe-resposta-errada-aqui-explore-os-objetos-que-quiser.mp3`
- [ ] Sapato → `sapato.mp3`

### Encaixe as Formas (5)

- [ ] Onde encaixa a estrela? → `onde-encaixa-a-estrela.mp3`
- [ ] Onde encaixa o círculo? → `onde-encaixa-o-circulo.mp3`
- [ ] Onde encaixa o coração? → `onde-encaixa-o-coracao.mp3`
- [ ] Onde encaixa o quadrado? → `onde-encaixa-o-quadrado.mp3`
- [ ] Onde encaixa o triângulo? → `onde-encaixa-o-triangulo.mp3`

### Encaixe e Quebra-Cabeça (1)

- [ ] Parabéns! Você completou o quebra-cabeça! → `parabens-voce-completou-o-quebra-cabeca.mp3`

### Encontre a Cor (8)

- [ ] Onde está a cor Amarelo? → `onde-esta-a-cor-amarelo.mp3`
- [ ] Onde está a cor Azul? → `onde-esta-a-cor-azul.mp3`
- [ ] Onde está a cor Laranja? → `onde-esta-a-cor-laranja.mp3`
- [ ] Onde está a cor Marrom? → `onde-esta-a-cor-marrom.mp3`
- [ ] Onde está a cor Preto? → `onde-esta-a-cor-preto.mp3`
- [ ] Onde está a cor Roxo? → `onde-esta-a-cor-roxo.mp3`
- [ ] Onde está a cor Verde? → `onde-esta-a-cor-verde.mp3`
- [ ] Onde está a cor Vermelho? → `onde-esta-a-cor-vermelho.mp3`

### Encontre o Animal (5)

- [ ] Onde está a vaca? → `onde-esta-a-vaca.mp3`
- [ ] Onde está o cachorro? → `onde-esta-o-cachorro.mp3`
- [ ] Onde está o leão? → `onde-esta-o-leao.mp3`
- [ ] Onde está o pato? → `onde-esta-o-pato.mp3`
- [ ] Onde está o sapo? → `onde-esta-o-sapo.mp3`

### Encontre o Par (7)

- [ ] O que combina com Árvore? → `o-que-combina-com-arvore.mp3`
- [ ] O que combina com Avião? → `o-que-combina-com-aviao.mp3`
- [ ] O que combina com Banana? → `o-que-combina-com-banana.mp3`
- [ ] O que combina com Bola? → `o-que-combina-com-bola.mp3`
- [ ] O que combina com Boneca? → `o-que-combina-com-boneca.mp3`
- [ ] O que combina com Carro? → `o-que-combina-com-carro.mp3`
- [ ] O que combina com Maçã? → `o-que-combina-com-maca.mp3`

### Esconde-esconde (21)

- [ ] Achou! Au au! → `achou-au-au.mp3`
- [ ] Achou! Có có có! → `achou-co-co-co.mp3`
- [ ] Achou! Croac! → `achou-croac.mp3`
- [ ] Achou! Grrr! → `achou-grrr.mp3`
- [ ] Achou! Miau! → `achou-miau.mp3`
- [ ] Achou! Muuu! → `achou-muuu.mp3`
- [ ] Achou! Quá quá! → `achou-qua-qua.mp3`
- [ ] Cadê a galinha? Onde se escondeu? → `cade-a-galinha-onde-se-escondeu.mp3`
- [ ] Cadê a galinha? Toque para achar! → `cade-a-galinha-toque-para-achar.mp3`
- [ ] Cadê a vaca? Onde se escondeu? → `cade-a-vaca-onde-se-escondeu.mp3`
- [ ] Cadê a vaca? Toque para achar! → `cade-a-vaca-toque-para-achar.mp3`
- [ ] Cadê o cachorro? Onde se escondeu? → `cade-o-cachorro-onde-se-escondeu.mp3`
- [ ] Cadê o cachorro? Toque para achar! → `cade-o-cachorro-toque-para-achar.mp3`
- [ ] Cadê o gato? Onde se escondeu? → `cade-o-gato-onde-se-escondeu.mp3`
- [ ] Cadê o gato? Toque para achar! → `cade-o-gato-toque-para-achar.mp3`
- [ ] Cadê o leão? Onde se escondeu? → `cade-o-leao-onde-se-escondeu.mp3`
- [ ] Cadê o leão? Toque para achar! → `cade-o-leao-toque-para-achar.mp3`
- [ ] Cadê o pato? Onde se escondeu? → `cade-o-pato-onde-se-escondeu.mp3`
- [ ] Cadê o pato? Toque para achar! → `cade-o-pato-toque-para-achar.mp3`
- [ ] Cadê o sapo? Onde se escondeu? → `cade-o-sapo-onde-se-escondeu.mp3`
- [ ] Cadê o sapo? Toque para achar! → `cade-o-sapo-toque-para-achar.mp3`

### Eu Quero… (4)

- [ ] Eu quero água → `eu-quero-agua.mp3`
- [ ] Eu quero colo → `eu-quero-colo.mp3`
- [ ] Eu quero comer → `eu-quero-comer.mp3`
- [ ] O que você quer dizer? Toque num cartão. → `o-que-voce-quer-dizer-toque-num-cartao.mp3`

### Eu Quero… (comunicação) (9)

- [ ] Está doendo → `esta-doendo.mp3`
- [ ] Estou com sono → `estou-com-sono.mp3`
- [ ] Estou feliz → `estou-feliz.mp3`
- [ ] Estou triste → `estou-triste.mp3`
- [ ] Eu quero brincar → `eu-quero-brincar.mp3`
- [ ] Mais, por favor → `mais-por-favor.mp3`
- [ ] Não, obrigado → `nao-obrigado.mp3`
- [ ] Quero ir ao banheiro → `quero-ir-ao-banheiro.mp3`
- [ ] Sim! → `sim.mp3`

### Grande e Pequeno (1)

- [ ] Toque no que é grande. → `toque-no-que-e-grande.mp3`

### História Interativa (3)

- [ ] A família saiu de casa. → `a-familia-saiu-de-casa.mp3`
- [ ] No parque tem uma árvore bem grande. → `no-parque-tem-uma-arvore-bem-grande.mp3`
- [ ] Vamos jogar bola? Chuta! → `vamos-jogar-bola-chuta.mp3`

### Histórias (3)

- [ ] Bom dia! → `bom-dia.mp3`
- [ ] Dia de chuva → `dia-de-chuva.mp3`
- [ ] No parque → `no-parque.mp3`

### Hora da História (11)

- [ ] A chuva parou e apareceu o arco-íris! → `a-chuva-parou-e-apareceu-o-arco-iris.mp3`
- [ ] Apareceu uma nuvem no céu. → `apareceu-uma-nuvem-no-ceu.mp3`
- [ ] Bom dia! Toque nas figuras na ordem da história. O que aconteceu primeiro? → `bom-dia-toque-nas-figuras-na-ordem-da-historia-o-que-aconteceu-primeiro.mp3`
- [ ] Começou a chover. Plic, ploc! → `comecou-a-chover-plic-ploc.mp3`
- [ ] Depois, comeu uma maçã. Hum, que gostoso! → `depois-comeu-uma-maca-hum-que-gostoso.mp3`
- [ ] Dia de chuva Toque nas figuras na ordem da história. O que aconteceu primeiro? → `dia-de-chuva-toque-nas-figuras-na-ordem-da-historia-o-que-aconteceu-primeiro.mp3`
- [ ] E depois? Pense no que veio em seguida. → `e-depois-pense-no-que-veio-em-seguida.mp3`
- [ ] Hum, o que aconteceu primeiro? → `hum-o-que-aconteceu-primeiro.mp3`
- [ ] No parque Toque nas figuras na ordem da história. O que aconteceu primeiro? → `no-parque-toque-nas-figuras-na-ordem-da-historia-o-que-aconteceu-primeiro.mp3`
- [ ] O sol nasceu. Bom dia! → `o-sol-nasceu-bom-dia.mp3`
- [ ] O ursinho acordou e foi brincar. → `o-ursinho-acordou-e-foi-brincar.mp3`

### Lousa Mágica (2)

- [ ] Que desenho incrível! → `que-desenho-incrivel.mp3`
- [ ] Vamos desenhar! Escolha uma cor. → `vamos-desenhar-escolha-uma-cor.mp3`

### Meu Corpo (6)

- [ ] Onde está a boca? → `onde-esta-a-boca.mp3`
- [ ] Onde está a cabeça? → `onde-esta-a-cabeca.mp3`
- [ ] Onde está a mão? → `onde-esta-a-mao.mp3`
- [ ] Onde está o nariz? → `onde-esta-o-nariz.mp3`
- [ ] Onde está o olho? → `onde-esta-o-olho.mp3`
- [ ] Onde está o pé? → `onde-esta-o-pe.mp3`

### Mexa o Corpo! (5)

- [ ] 👋Dê tchau → `de-tchau.mp3`
- [ ] 👏Bata palmas → `bata-palmas.mp3`
- [ ] 💃Dance → `dance.mp3`
- [ ] 🦘Pule → `pule.mp3`
- [ ] Levante, imite e brinque junto. → `levante-imite-e-brinque-junto.mp3`

### Montar Frases (9)

- [ ] Beber → `beber.mp3`
- [ ] Brincar → `brincar.mp3`
- [ ] Comer → `comer.mp3`
- [ ] Eu → `eu.mp3`
- [ ] Não quero → `nao-quero.mp3`
- [ ] Obrigada → `obrigada.mp3`
- [ ] Obrigado → `obrigado.mp3`
- [ ] Por favor → `por-favor.mp3`
- [ ] Quero → `quero.mp3`

### Movimento e ritmo (3)

- [ ] 1 palma → `1-palma.mp3`
- [ ] 2 palmas → `2-palmas.mp3`
- [ ] 3 palmas → `3-palmas.mp3`

### Mundo das Formas (4)

- [ ] Encontre a estrela. → `encontre-a-estrela.mp3`
- [ ] Encontre o círculo. → `encontre-o-circulo.mp3`
- [ ] Encontre o quadrado. → `encontre-o-quadrado.mp3`
- [ ] Encontre o triângulo. → `encontre-o-triangulo.mp3`

### Número e Quantidade (1)

- [ ] Observe a quantidade e escolha o número. → `observe-a-quantidade-e-escolha-o-numero.mp3`

### Números (4)

- [ ] dez! Muito bem! → `dez-muito-bem.mp3`
- [ ] Estoure o número 5 → `estoure-o-numero-5.mp3`
- [ ] Estoure o número 6 → `estoure-o-numero-6.mp3`
- [ ] Estoure o número 7 → `estoure-o-numero-7.mp3`

### Objetos (23)

- [ ] Árvore → `arvore.mp3`
- [ ] Boneca → `boneca.mp3`
- [ ] O que combina com Camisa? → `o-que-combina-com-camisa.mp3`
- [ ] O que combina com Casa? → `o-que-combina-com-casa.mp3`
- [ ] O que combina com Colher? → `o-que-combina-com-colher.mp3`
- [ ] O que combina com Copo? → `o-que-combina-com-copo.mp3`
- [ ] O que combina com Escova? → `o-que-combina-com-escova.mp3`
- [ ] O que combina com Livro? → `o-que-combina-com-livro.mp3`
- [ ] O que combina com Sapato? → `o-que-combina-com-sapato.mp3`
- [ ] O que pertence ao mesmo grupo de Árvore? → `o-que-pertence-ao-mesmo-grupo-de-arvore.mp3`
- [ ] O que pertence ao mesmo grupo de Avião? → `o-que-pertence-ao-mesmo-grupo-de-aviao.mp3`
- [ ] O que pertence ao mesmo grupo de Banana? → `o-que-pertence-ao-mesmo-grupo-de-banana.mp3`
- [ ] O que pertence ao mesmo grupo de Bola? → `o-que-pertence-ao-mesmo-grupo-de-bola.mp3`
- [ ] O que pertence ao mesmo grupo de Boneca? → `o-que-pertence-ao-mesmo-grupo-de-boneca.mp3`
- [ ] O que pertence ao mesmo grupo de Camisa? → `o-que-pertence-ao-mesmo-grupo-de-camisa.mp3`
- [ ] O que pertence ao mesmo grupo de Carro? → `o-que-pertence-ao-mesmo-grupo-de-carro.mp3`
- [ ] O que pertence ao mesmo grupo de Casa? → `o-que-pertence-ao-mesmo-grupo-de-casa.mp3`
- [ ] O que pertence ao mesmo grupo de Colher? → `o-que-pertence-ao-mesmo-grupo-de-colher.mp3`
- [ ] O que pertence ao mesmo grupo de Copo? → `o-que-pertence-ao-mesmo-grupo-de-copo.mp3`
- [ ] O que pertence ao mesmo grupo de Escova? → `o-que-pertence-ao-mesmo-grupo-de-escova.mp3`
- [ ] O que pertence ao mesmo grupo de Livro? → `o-que-pertence-ao-mesmo-grupo-de-livro.mp3`
- [ ] O que pertence ao mesmo grupo de Maçã? → `o-que-pertence-ao-mesmo-grupo-de-maca.mp3`
- [ ] O que pertence ao mesmo grupo de Sapato? → `o-que-pertence-ao-mesmo-grupo-de-sapato.mp3`

### Opostos (3)

- [ ] Baixo → `baixo.mp3`
- [ ] Pequeno → `pequeno.mp3`
- [ ] Vazio → `vazio.mp3`

### Opostos Divertidos (4)

- [ ] Qual é o contrário de Alto? → `qual-e-o-contrario-de-alto.mp3`
- [ ] Qual é o contrário de Cheio? → `qual-e-o-contrario-de-cheio.mp3`
- [ ] Qual é o contrário de Dia? → `qual-e-o-contrario-de-dia.mp3`
- [ ] Qual é o contrário de Grande? → `qual-e-o-contrario-de-grande.mp3`

### Ordem dos Números (2)

- [ ] Qual número vem depois? → `qual-numero-vem-depois.mp3`
- [ ] Vamos observar a sequência. → `vamos-observar-a-sequencia.mp3`

### Palavras do Dia (7)

- [ ] Onde está a água? → `onde-esta-a-agua.mp3`
- [ ] Onde está a casa? → `onde-esta-a-casa.mp3`
- [ ] Onde está a comida? → `onde-esta-a-comida.mp3`
- [ ] Onde está a mamãe? → `onde-esta-a-mamae.mp3`
- [ ] Onde está o gato? → `onde-esta-o-gato.mp3`
- [ ] Onde está o papai? → `onde-esta-o-papai.mp3`
- [ ] Onde está o parque? → `onde-esta-o-parque.mp3`

### Palavras do dia a dia (2)

- [ ] Comida → `comida.mp3`
- [ ] Papai → `papai.mp3`

### Piano dos Animais (1)

- [ ] Toque nos animais para fazer música! → `toque-nos-animais-para-fazer-musica.mp3`

### Qual é Diferente? (1)

- [ ] Qual é diferente? → `qual-e-diferente.mp3`

### Quebra-cabeça (7)

- [ ] Muito bem! Cachorro → `muito-bem-cachorro.mp3`
- [ ] Muito bem! Galinha → `muito-bem-galinha.mp3`
- [ ] Muito bem! Gato → `muito-bem-gato.mp3`
- [ ] Muito bem! Leão → `muito-bem-leao.mp3`
- [ ] Muito bem! Pato → `muito-bem-pato.mp3`
- [ ] Muito bem! Sapo → `muito-bem-sapo.mp3`
- [ ] Muito bem! Vaca → `muito-bem-vaca.mp3`

### Quem Fez Esse Som? (2)

- [ ] Grrr! → `grrr.mp3`
- [ ] Ouça com atenção. Quem fez esse som? → `ouca-com-atencao-quem-fez-esse-som.mp3`

### Quem Pertence ao Grupo? (4)

- [ ] O que pertence ao mesmo grupo de Animais? → `o-que-pertence-ao-mesmo-grupo-de-animais.mp3`
- [ ] O que pertence ao mesmo grupo de Brinquedos? → `o-que-pertence-ao-mesmo-grupo-de-brinquedos.mp3`
- [ ] O que pertence ao mesmo grupo de Frutas? → `o-que-pertence-ao-mesmo-grupo-de-frutas.mp3`
- [ ] O que pertence ao mesmo grupo de Veículos? → `o-que-pertence-ao-mesmo-grupo-de-veiculos.mp3`

### Rimas (8)

- [ ] Bolo rima com…? → `bolo-rima-com.mp3`
- [ ] Bolo, Rolo! Rimou! → `bolo-rolo-rimou.mp3`
- [ ] Escute de novo: Abelha rima com…? → `escute-de-novo-abelha-rima-com.mp3`
- [ ] Escute de novo: Bolo rima com…? → `escute-de-novo-bolo-rima-com.mp3`
- [ ] Escute de novo: Leão rima com…? → `escute-de-novo-leao-rima-com.mp3`
- [ ] Escute de novo: Queijo rima com…? → `escute-de-novo-queijo-rima-com.mp3`
- [ ] Leão rima com…? → `leao-rima-com.mp3`
- [ ] Leão, Avião! Rimou! → `leao-aviao-rimou.mp3`

### Rimas Divertidas (16)

- [ ] Abelha rima com…? → `abelha-rima-com.mp3`
- [ ] Abelha, Ovelha! Rimou! → `abelha-ovelha-rimou.mp3`
- [ ] Escute de novo: Gato rima com…? → `escute-de-novo-gato-rima-com.mp3`
- [ ] Escute de novo: Janela rima com…? → `escute-de-novo-janela-rima-com.mp3`
- [ ] Escute de novo: Mão rima com…? → `escute-de-novo-mao-rima-com.mp3`
- [ ] Escute de novo: Pato rima com…? → `escute-de-novo-pato-rima-com.mp3`
- [ ] Gato rima com…? → `gato-rima-com.mp3`
- [ ] Gato, Rato! Rimou! → `gato-rato-rimou.mp3`
- [ ] Janela rima com…? → `janela-rima-com.mp3`
- [ ] Janela, Panela! Rimou! → `janela-panela-rimou.mp3`
- [ ] Mão rima com…? → `mao-rima-com.mp3`
- [ ] Mão, Pão! Rimou! → `mao-pao-rimou.mp3`
- [ ] Pato rima com…? → `pato-rima-com.mp3`
- [ ] Pato, Sapato! Rimou! → `pato-sapato-rimou.mp3`
- [ ] Queijo rima com…? → `queijo-rima-com.mp3`
- [ ] Queijo, Beijo! Rimou! → `queijo-beijo-rimou.mp3`

### Ritmo Musical (5)

- [ ] Duas palmas → `duas-palmas.mp3`
- [ ] Observe, imite e brinque com o ritmo. → `observe-imite-e-brinque-com-o-ritmo.mp3`
- [ ] Palma → `palma.mp3`
- [ ] Palma e pausa → `palma-e-pausa.mp3`
- [ ] Palma, palma, pausa → `palma-palma-pausa.mp3`

### Separar por Cor (24)

- [ ] Onde vai a baleia? → `onde-vai-a-baleia.mp3`
- [ ] Onde vai a baleia? No cesto azul! → `onde-vai-a-baleia-no-cesto-azul.mp3`
- [ ] Onde vai a banana? → `onde-vai-a-banana.mp3`
- [ ] Onde vai a banana? No cesto amarelo! → `onde-vai-a-banana-no-cesto-amarelo.mp3`
- [ ] Onde vai a maçã? → `onde-vai-a-maca.mp3`
- [ ] Onde vai a maçã? No cesto vermelho! → `onde-vai-a-maca-no-cesto-vermelho.mp3`
- [ ] Onde vai o boné? → `onde-vai-o-bone.mp3`
- [ ] Onde vai o boné? No cesto azul! → `onde-vai-o-bone-no-cesto-azul.mp3`
- [ ] Onde vai o brócolis? → `onde-vai-o-brocolis.mp3`
- [ ] Onde vai o brócolis? No cesto verde! → `onde-vai-o-brocolis-no-cesto-verde.mp3`
- [ ] Onde vai o caminhão? → `onde-vai-o-caminhao.mp3`
- [ ] Onde vai o caminhão? No cesto vermelho! → `onde-vai-o-caminhao-no-cesto-vermelho.mp3`
- [ ] Onde vai o girassol? → `onde-vai-o-girassol.mp3`
- [ ] Onde vai o girassol? No cesto amarelo! → `onde-vai-o-girassol-no-cesto-amarelo.mp3`
- [ ] Onde vai o mirtilo? → `onde-vai-o-mirtilo.mp3`
- [ ] Onde vai o mirtilo? No cesto azul! → `onde-vai-o-mirtilo-no-cesto-azul.mp3`
- [ ] Onde vai o morango? → `onde-vai-o-morango.mp3`
- [ ] Onde vai o morango? No cesto vermelho! → `onde-vai-o-morango-no-cesto-vermelho.mp3`
- [ ] Onde vai o pintinho? → `onde-vai-o-pintinho.mp3`
- [ ] Onde vai o pintinho? No cesto amarelo! → `onde-vai-o-pintinho-no-cesto-amarelo.mp3`
- [ ] Onde vai o sapo? → `onde-vai-o-sapo.mp3`
- [ ] Onde vai o sapo? No cesto verde! → `onde-vai-o-sapo-no-cesto-verde.mp3`
- [ ] Onde vai o trevo? → `onde-vai-o-trevo.mp3`
- [ ] Onde vai o trevo? No cesto verde! → `onde-vai-o-trevo-no-cesto-verde.mp3`

### Sequência de Sons (1)

- [ ] Vamos ouvir novamente. → `vamos-ouvir-novamente.mp3`

### Vamos Contar (2)

- [ ] Conte os objetos e escolha a quantidade. → `conte-os-objetos-e-escolha-a-quantidade.mp3`
- [ ] Vamos contar novamente! → `vamos-contar-novamente.mp3`

## P3 — futuro

Vocabulário e frases que o app ainda não usa, mas que novas brincadeiras provavelmente vão precisar. Gravar agora mantém a mesma voz em todo o app.

### Alfabeto (26)

- [ ] Onde está a letra A? → `onde-esta-a-letra-a.mp3`
- [ ] Onde está a letra Agá? → `onde-esta-a-letra-aga.mp3`
- [ ] Onde está a letra Bê? → `onde-esta-a-letra-be.mp3`
- [ ] Onde está a letra Cá? → `onde-esta-a-letra-ca.mp3`
- [ ] Onde está a letra Cê? → `onde-esta-a-letra-ce.mp3`
- [ ] Onde está a letra Dáblio? → `onde-esta-a-letra-dablio.mp3`
- [ ] Onde está a letra Dê? → `onde-esta-a-letra-de.mp3`
- [ ] Onde está a letra É? → `onde-esta-a-letra-e.mp3`
- [ ] Onde está a letra Efe? → `onde-esta-a-letra-efe.mp3`
- [ ] Onde está a letra Ele? → `onde-esta-a-letra-ele.mp3`
- [ ] Onde está a letra Eme? → `onde-esta-a-letra-eme.mp3`
- [ ] Onde está a letra Ene? → `onde-esta-a-letra-ene.mp3`
- [ ] Onde está a letra Erre? → `onde-esta-a-letra-erre.mp3`
- [ ] Onde está a letra Esse? → `onde-esta-a-letra-esse.mp3`
- [ ] Onde está a letra Gê? → `onde-esta-a-letra-ge.mp3`
- [ ] Onde está a letra I? → `onde-esta-a-letra-i.mp3`
- [ ] Onde está a letra Ípsilon? → `onde-esta-a-letra-ipsilon.mp3`
- [ ] Onde está a letra Jota? → `onde-esta-a-letra-jota.mp3`
- [ ] Onde está a letra Ó? → `onde-esta-a-letra-o.mp3`
- [ ] Onde está a letra Pê? → `onde-esta-a-letra-pe.mp3`
- [ ] Onde está a letra Quê? → `onde-esta-a-letra-que.mp3`
- [ ] Onde está a letra Tê? → `onde-esta-a-letra-te.mp3`
- [ ] Onde está a letra U? → `onde-esta-a-letra-u.mp3`
- [ ] Onde está a letra Vê? → `onde-esta-a-letra-ve.mp3`
- [ ] Onde está a letra Xis? → `onde-esta-a-letra-xis.mp3`
- [ ] Onde está a letra Zê? → `onde-esta-a-letra-ze.mp3`

### Animais (94)

- [ ] A abelha faz zzzz! → `a-abelha-faz-zzzz.mp3`
- [ ] A baleia faz uuuuu! → `a-baleia-faz-uuuuu.mp3`
- [ ] A cobra faz sssss! → `a-cobra-faz-sssss.mp3`
- [ ] A coruja faz uhu uhu! → `a-coruja-faz-uhu-uhu.mp3`
- [ ] A galinha faz có có có! → `a-galinha-faz-co-co-co.mp3`
- [ ] A ovelha faz méééé! → `a-ovelha-faz-meeee.mp3`
- [ ] A vaca faz muuu! → `a-vaca-faz-muuu.mp3`
- [ ] Auuuuu! → `auuuuu.mp3`
- [ ] Blub blub! → `blub-blub.mp3`
- [ ] Cadê a abelha? → `cade-a-abelha.mp3`
- [ ] Cadê a baleia? → `cade-a-baleia.mp3`
- [ ] Cadê a borboleta? → `cade-a-borboleta.mp3`
- [ ] Cadê a cobra? → `cade-a-cobra.mp3`
- [ ] Cadê a coruja? → `cade-a-coruja.mp3`
- [ ] Cadê a formiga? → `cade-a-formiga.mp3`
- [ ] Cadê a galinha? → `cade-a-galinha.mp3`
- [ ] Cadê a girafa? → `cade-a-girafa.mp3`
- [ ] Cadê a ovelha? → `cade-a-ovelha.mp3`
- [ ] Cadê a tartaruga? → `cade-a-tartaruga.mp3`
- [ ] Cadê a vaca? → `cade-a-vaca.mp3`
- [ ] Cadê a zebra? → `cade-a-zebra.mp3`
- [ ] Cadê o cachorro? → `cade-o-cachorro.mp3`
- [ ] Cadê o cavalo? → `cade-o-cavalo.mp3`
- [ ] Cadê o coelho? → `cade-o-coelho.mp3`
- [ ] Cadê o elefante? → `cade-o-elefante.mp3`
- [ ] Cadê o gato? → `cade-o-gato.mp3`
- [ ] Cadê o jacaré? → `cade-o-jacare.mp3`
- [ ] Cadê o leão? → `cade-o-leao.mp3`
- [ ] Cadê o lobo? → `cade-o-lobo.mp3`
- [ ] Cadê o macaco? → `cade-o-macaco.mp3`
- [ ] Cadê o passarinho? → `cade-o-passarinho.mp3`
- [ ] Cadê o pato? → `cade-o-pato.mp3`
- [ ] Cadê o peixe? → `cade-o-peixe.mp3`
- [ ] Cadê o pinguim? → `cade-o-pinguim.mp3`
- [ ] Cadê o porco? → `cade-o-porco.mp3`
- [ ] Cadê o rato? → `cade-o-rato.mp3`
- [ ] Cadê o sapo? → `cade-o-sapo.mp3`
- [ ] Cadê o tigre? → `cade-o-tigre.mp3`
- [ ] Cadê o urso? → `cade-o-urso.mp3`
- [ ] Coruja → `coruja.mp3`
- [ ] Formiga → `formiga.mp3`
- [ ] Fuuuu! → `fuuuu.mp3`
- [ ] Grrrr! → `grrrr.mp3`
- [ ] Ic ic! → `ic-ic.mp3`
- [ ] Iiiirrí! → `iiiirri.mp3`
- [ ] Méééé! → `meeee.mp3`
- [ ] O cachorro faz au au! → `o-cachorro-faz-au-au.mp3`
- [ ] O cavalo faz iiiirrí! → `o-cavalo-faz-iiiirri.mp3`
- [ ] O elefante faz fuuuu! → `o-elefante-faz-fuuuu.mp3`
- [ ] O gato faz miau! → `o-gato-faz-miau.mp3`
- [ ] O leão faz grrr! → `o-leao-faz-grrr.mp3`
- [ ] O lobo faz auuuuu! → `o-lobo-faz-auuuuu.mp3`
- [ ] O macaco faz uh uh ah ah! → `o-macaco-faz-uh-uh-ah-ah.mp3`
- [ ] O passarinho faz piu piu! → `o-passarinho-faz-piu-piu.mp3`
- [ ] O pato faz quá quá! → `o-pato-faz-qua-qua.mp3`
- [ ] O peixe faz blub blub! → `o-peixe-faz-blub-blub.mp3`
- [ ] O porco faz óinc óinc! → `o-porco-faz-oinc-oinc.mp3`
- [ ] O rato faz ic ic! → `o-rato-faz-ic-ic.mp3`
- [ ] O sapo faz croac! → `o-sapo-faz-croac.mp3`
- [ ] O tigre faz grrr! → `o-tigre-faz-grrr.mp3`
- [ ] O urso faz grrrr! → `o-urso-faz-grrrr.mp3`
- [ ] Óinc óinc! → `oinc-oinc.mp3`
- [ ] Onde está a abelha? → `onde-esta-a-abelha.mp3`
- [ ] Onde está a baleia? → `onde-esta-a-baleia.mp3`
- [ ] Onde está a borboleta? → `onde-esta-a-borboleta.mp3`
- [ ] Onde está a cobra? → `onde-esta-a-cobra.mp3`
- [ ] Onde está a coruja? → `onde-esta-a-coruja.mp3`
- [ ] Onde está a formiga? → `onde-esta-a-formiga.mp3`
- [ ] Onde está a girafa? → `onde-esta-a-girafa.mp3`
- [ ] Onde está a ovelha? → `onde-esta-a-ovelha.mp3`
- [ ] Onde está a tartaruga? → `onde-esta-a-tartaruga.mp3`
- [ ] Onde está a zebra? → `onde-esta-a-zebra.mp3`
- [ ] Onde está o cavalo? → `onde-esta-o-cavalo.mp3`
- [ ] Onde está o coelho? → `onde-esta-o-coelho.mp3`
- [ ] Onde está o elefante? → `onde-esta-o-elefante.mp3`
- [ ] Onde está o jacaré? → `onde-esta-o-jacare.mp3`
- [ ] Onde está o lobo? → `onde-esta-o-lobo.mp3`
- [ ] Onde está o macaco? → `onde-esta-o-macaco.mp3`
- [ ] Onde está o passarinho? → `onde-esta-o-passarinho.mp3`
- [ ] Onde está o peixe? → `onde-esta-o-peixe.mp3`
- [ ] Onde está o pinguim? → `onde-esta-o-pinguim.mp3`
- [ ] Onde está o porco? → `onde-esta-o-porco.mp3`
- [ ] Onde está o rato? → `onde-esta-o-rato.mp3`
- [ ] Onde está o tigre? → `onde-esta-o-tigre.mp3`
- [ ] Onde está o urso? → `onde-esta-o-urso.mp3`
- [ ] Peixe → `peixe.mp3`
- [ ] Pinguim → `pinguim.mp3`
- [ ] Piu piu! → `piu-piu.mp3`
- [ ] Rato → `rato.mp3`
- [ ] Sssss! → `sssss.mp3`
- [ ] Uh uh ah ah! → `uh-uh-ah-ah.mp3`
- [ ] Uhu uhu! → `uhu-uhu.mp3`
- [ ] Uuuuu! → `uuuuu.mp3`
- [ ] Zzzz! → `zzzz.mp3`

### Clima (6)

- [ ] Arco-íris → `arco-iris.mp3`
- [ ] Está calor! → `esta-calor.mp3`
- [ ] Está chovendo! → `esta-chovendo.mp3`
- [ ] Está fazendo sol! → `esta-fazendo-sol.mp3`
- [ ] Está frio! → `esta-frio.mp3`
- [ ] Trovão → `trovao.mp3`

### Comidas (29)

- [ ] Arroz → `arroz.mp3`
- [ ] Brócolis → `brocolis.mp3`
- [ ] Feijão → `feijao.mp3`
- [ ] Manga → `manga.mp3`
- [ ] Onde está a banana? → `onde-esta-a-banana.mp3`
- [ ] Onde está a batata? → `onde-esta-a-batata.mp3`
- [ ] Onde está a cenoura? → `onde-esta-a-cenoura.mp3`
- [ ] Onde está a laranja? → `onde-esta-a-laranja.mp3`
- [ ] Onde está a maçã? → `onde-esta-a-maca.mp3`
- [ ] Onde está a manga? → `onde-esta-a-manga.mp3`
- [ ] Onde está a melancia? → `onde-esta-a-melancia.mp3`
- [ ] Onde está a pera? → `onde-esta-a-pera.mp3`
- [ ] Onde está a sopa? → `onde-esta-a-sopa.mp3`
- [ ] Onde está a uva? → `onde-esta-a-uva.mp3`
- [ ] Onde está o abacaxi? → `onde-esta-o-abacaxi.mp3`
- [ ] Onde está o arroz? → `onde-esta-o-arroz.mp3`
- [ ] Onde está o biscoito? → `onde-esta-o-biscoito.mp3`
- [ ] Onde está o bolo? → `onde-esta-o-bolo.mp3`
- [ ] Onde está o brócolis? → `onde-esta-o-brocolis.mp3`
- [ ] Onde está o feijão? → `onde-esta-o-feijao.mp3`
- [ ] Onde está o leite? → `onde-esta-o-leite.mp3`
- [ ] Onde está o mamão? → `onde-esta-o-mamao.mp3`
- [ ] Onde está o morango? → `onde-esta-o-morango.mp3`
- [ ] Onde está o ovo? → `onde-esta-o-ovo.mp3`
- [ ] Onde está o pão? → `onde-esta-o-pao.mp3`
- [ ] Onde está o queijo? → `onde-esta-o-queijo.mp3`
- [ ] Onde está o suco? → `onde-esta-o-suco.mp3`
- [ ] Ovo → `ovo.mp3`
- [ ] Sopa → `sopa.mp3`

### Cores (2)

- [ ] Onde está a cor cinza? → `onde-esta-a-cor-cinza.mp3`
- [ ] Onde está a cor dourado? → `onde-esta-a-cor-dourado.mp3`

### Corpo (36)

- [ ] Bochecha → `bochecha.mp3`
- [ ] Braço → `braco.mp3`
- [ ] Dedo → `dedo.mp3`
- [ ] Dente → `dente.mp3`
- [ ] Joelho → `joelho.mp3`
- [ ] Mostre a barriga! → `mostre-a-barriga.mp3`
- [ ] Mostre a boca! → `mostre-a-boca.mp3`
- [ ] Mostre a bochecha! → `mostre-a-bochecha.mp3`
- [ ] Mostre a cabeça! → `mostre-a-cabeca.mp3`
- [ ] Mostre a língua! → `mostre-a-lingua.mp3`
- [ ] Mostre a mão! → `mostre-a-mao.mp3`
- [ ] Mostre a orelha! → `mostre-a-orelha.mp3`
- [ ] Mostre a perna! → `mostre-a-perna.mp3`
- [ ] Mostre o braço! → `mostre-o-braco.mp3`
- [ ] Mostre o cabelo! → `mostre-o-cabelo.mp3`
- [ ] Mostre o dedo! → `mostre-o-dedo.mp3`
- [ ] Mostre o dente! → `mostre-o-dente.mp3`
- [ ] Mostre o joelho! → `mostre-o-joelho.mp3`
- [ ] Mostre o nariz! → `mostre-o-nariz.mp3`
- [ ] Mostre o olho! → `mostre-o-olho.mp3`
- [ ] Mostre o pé! → `mostre-o-pe.mp3`
- [ ] Mostre o pescoço! → `mostre-o-pescoco.mp3`
- [ ] Onde está a barriga? → `onde-esta-a-barriga.mp3`
- [ ] Onde está a bochecha? → `onde-esta-a-bochecha.mp3`
- [ ] Onde está a língua? → `onde-esta-a-lingua.mp3`
- [ ] Onde está a orelha? → `onde-esta-a-orelha.mp3`
- [ ] Onde está a perna? → `onde-esta-a-perna.mp3`
- [ ] Onde está o braço? → `onde-esta-o-braco.mp3`
- [ ] Onde está o cabelo? → `onde-esta-o-cabelo.mp3`
- [ ] Onde está o dedo? → `onde-esta-o-dedo.mp3`
- [ ] Onde está o dente? → `onde-esta-o-dente.mp3`
- [ ] Onde está o joelho? → `onde-esta-o-joelho.mp3`
- [ ] Onde está o pescoço? → `onde-esta-o-pescoco.mp3`
- [ ] Orelha → `orelha.mp3`
- [ ] Perna → `perna.mp3`
- [ ] Pescoço → `pescoco.mp3`

### Emoções (18)

- [ ] Bravo → `bravo.mp3`
- [ ] Cansado → `cansado.mp3`
- [ ] Com fome → `com-fome.mp3`
- [ ] Com medo → `com-medo.mp3`
- [ ] Com sono → `com-sono.mp3`
- [ ] Como você está se sentindo? → `como-voce-esta-se-sentindo.mp3`
- [ ] Eu estou animado. → `eu-estou-animado.mp3`
- [ ] Eu estou bravo. → `eu-estou-bravo.mp3`
- [ ] Eu estou calmo. → `eu-estou-calmo.mp3`
- [ ] Eu estou cansado. → `eu-estou-cansado.mp3`
- [ ] Eu estou com fome. → `eu-estou-com-fome.mp3`
- [ ] Eu estou com medo. → `eu-estou-com-medo.mp3`
- [ ] Eu estou com sono. → `eu-estou-com-sono.mp3`
- [ ] Eu estou feliz. → `eu-estou-feliz.mp3`
- [ ] Eu estou surpreso. → `eu-estou-surpreso.mp3`
- [ ] Eu estou triste. → `eu-estou-triste.mp3`
- [ ] Tudo bem ficar triste às vezes. → `tudo-bem-ficar-triste-as-vezes.mp3`
- [ ] Vamos respirar juntos? → `vamos-respirar-juntos.mp3`

### Família e pessoas (10)

- [ ] Amiga → `amiga.mp3`
- [ ] Amigo → `amigo.mp3`
- [ ] Bebê → `bebe.mp3`
- [ ] Irmã → `irma.mp3`
- [ ] Irmão → `irmao.mp3`
- [ ] Professor → `professor.mp3`
- [ ] Professora → `professora.mp3`
- [ ] Titia → `titia.mp3`
- [ ] Titio → `titio.mp3`
- [ ] Vovó → `vovo.mp3`

### Formas (8)

- [ ] Onde está a estrela? → `onde-esta-a-estrela.mp3`
- [ ] Onde está o círculo? → `onde-esta-o-circulo.mp3`
- [ ] Onde está o coração? → `onde-esta-o-coracao.mp3`
- [ ] Onde está o losango? → `onde-esta-o-losango.mp3`
- [ ] Onde está o oval? → `onde-esta-o-oval.mp3`
- [ ] Onde está o quadrado? → `onde-esta-o-quadrado.mp3`
- [ ] Onde está o retângulo? → `onde-esta-o-retangulo.mp3`
- [ ] Onde está o triângulo? → `onde-esta-o-triangulo.mp3`

### Incentivos (14)

- [ ] Boa tentativa! → `boa-tentativa.mp3`
- [ ] Continue assim! → `continue-assim.mp3`
- [ ] Eu sabia que você conseguia! → `eu-sabia-que-voce-conseguia.mp3`
- [ ] Mandou bem! → `mandou-bem.mp3`
- [ ] Olha só o que você fez! → `olha-so-o-que-voce-fez.mp3`
- [ ] Quase lá! → `quase-la.mp3`
- [ ] Que bonito! → `que-bonito.mp3`
- [ ] Que orgulho! → `que-orgulho.mp3`
- [ ] Respira fundo e tenta de novo. → `respira-fundo-e-tenta-de-novo.mp3`
- [ ] Sem pressa. → `sem-pressa.mp3`
- [ ] Tente outra vez! → `tente-outra-vez.mp3`
- [ ] Uau! → `uau.mp3`
- [ ] Vamos juntos? → `vamos-juntos.mp3`
- [ ] Você está aprendendo muito! → `voce-esta-aprendendo-muito.mp3`

### Instruções gerais (33)

- [ ] Agora é a sua vez. → `agora-e-a-sua-vez.mp3`
- [ ] Agora outra! → `agora-outra.mp3`
- [ ] Arraste até aqui. → `arraste-ate-aqui.mp3`
- [ ] Até amanhã! → `ate-amanha.mp3`
- [ ] Escolha um mundo. → `escolha-um-mundo.mp3`
- [ ] Escolha um. → `escolha-um.mp3`
- [ ] Escolha uma brincadeira. → `escolha-uma-brincadeira.mp3`
- [ ] Escute com atenção. → `escute-com-atencao.mp3`
- [ ] Faça silêncio. Shhh! → `faca-silencio-shhh.mp3`
- [ ] Fale junto comigo. → `fale-junto-comigo.mp3`
- [ ] Mande um beijo! → `mande-um-beijo.mp3`
- [ ] O que rima? → `o-que-rima.mp3`
- [ ] O que vem depois? → `o-que-vem-depois.mp3`
- [ ] Olhe com atenção. → `olhe-com-atencao.mp3`
- [ ] Qual começa igual? → `qual-comeca-igual.mp3`
- [ ] Qual é o maior? → `qual-e-o-maior.mp3`
- [ ] Qual é o menor? → `qual-e-o-menor.mp3`
- [ ] Quantos tem? → `quantos-tem.mp3`
- [ ] Que tal outra brincadeira? → `que-tal-outra-brincadeira.mp3`
- [ ] Quer brincar de novo? → `quer-brincar-de-novo.mp3`
- [ ] Repita comigo. → `repita-comigo.mp3`
- [ ] Tchau, tchau! → `tchau-tchau.mp3`
- [ ] Toque aqui. → `toque-aqui.mp3`
- [ ] Toque na cor. → `toque-na-cor.mp3`
- [ ] Toque na figura. → `toque-na-figura.mp3`
- [ ] Toque no animal. → `toque-no-animal.mp3`
- [ ] Vamos cantar? → `vamos-cantar.mp3`
- [ ] Vamos dançar? → `vamos-dancar.mp3`
- [ ] Vamos de novo? → `vamos-de-novo.mp3`
- [ ] Vamos ouvir a história. → `vamos-ouvir-a-historia.mp3`
- [ ] Vamos para o próximo. → `vamos-para-o-proximo.mp3`
- [ ] Vamos ver seus adesivos! → `vamos-ver-seus-adesivos.mp3`
- [ ] Você ganhou um adesivo! → `voce-ganhou-um-adesivo.mp3`

### Nomes das brincadeiras (47)

- [ ] Animais → `animais.mp3`
- [ ] Balões dos Números → `baloes-dos-numeros.mp3`
- [ ] Bolhas → `bolhas.mp3`
- [ ] Brincar com Sílabas → `brincar-com-silabas.mp3`
- [ ] Brinque com o Ritmo → `brinque-com-o-ritmo.mp3`
- [ ] Caça às Cores → `caca-as-cores.mp3`
- [ ] Com Que Som Começa? → `com-que-som-comeca.mp3`
- [ ] Complete a Sequência → `complete-a-sequencia.mp3`
- [ ] Contar Tocando → `contar-tocando.mp3`
- [ ] Copie o Ritmo → `copie-o-ritmo.mp3`
- [ ] Cores → `cores.mp3`
- [ ] Cores para Descobrir → `cores-para-descobrir.mp3`
- [ ] Desafio do Movimento → `desafio-do-movimento.mp3`
- [ ] Descobrir Animais → `descobrir-animais.mp3`
- [ ] Descobrir com as Mãos → `descobrir-com-as-maos.mp3`
- [ ] Descobrir Cores → `descobrir-cores.mp3`
- [ ] Descobrir Objetos → `descobrir-objetos.mp3`
- [ ] Encaixe as Formas → `encaixe-as-formas.mp3`
- [ ] Encaixe e Quebra-Cabeça → `encaixe-e-quebra-cabeca.mp3`
- [ ] Encontre o Animal → `encontre-o-animal.mp3`
- [ ] Encontre o Par → `encontre-o-par.mp3`
- [ ] Esconde-esconde → `esconde-esconde.mp3`
- [ ] Eu Quero… → `eu-quero.mp3`
- [ ] Frases em Ação → `frases-em-acao.mp3`
- [ ] Grande e Pequeno → `grande-e-pequeno.mp3`
- [ ] História Interativa → `historia-interativa.mp3`
- [ ] Hora da História → `hora-da-historia.mp3`
- [ ] Lousa Mágica → `lousa-magica.mp3`
- [ ] Memória → `memoria.mp3`
- [ ] Meu Corpo → `meu-corpo.mp3`
- [ ] Mexa o Corpo! → `mexa-o-corpo.mp3`
- [ ] Montar Frases → `montar-frases.mp3`
- [ ] Mundo das Formas → `mundo-das-formas.mp3`
- [ ] Número e Quantidade → `numero-e-quantidade.mp3`
- [ ] Opostos Divertidos → `opostos-divertidos.mp3`
- [ ] Ordem dos Números → `ordem-dos-numeros.mp3`
- [ ] Ouça e Encontre → `ouca-e-encontre.mp3`
- [ ] Palavras do Dia → `palavras-do-dia.mp3`
- [ ] Piano dos Animais → `piano-dos-animais.mp3`
- [ ] Quem Fez Esse Som? → `quem-fez-esse-som.mp3`
- [ ] Quem Pertence ao Grupo? → `quem-pertence-ao-grupo.mp3`
- [ ] Rimas Divertidas → `rimas-divertidas.mp3`
- [ ] Ritmo Musical → `ritmo-musical.mp3`
- [ ] Separar por Cor → `separar-por-cor.mp3`
- [ ] Sequência de Sons → `sequencia-de-sons.mp3`
- [ ] Sons e Descobertas → `sons-e-descobertas.mp3`
- [ ] Vamos Contar → `vamos-contar.mp3`

### Números (12)

- [ ] Onde está o número cinco? → `onde-esta-o-numero-cinco.mp3`
- [ ] Onde está o número dez? → `onde-esta-o-numero-dez.mp3`
- [ ] Onde está o número dois? → `onde-esta-o-numero-dois.mp3`
- [ ] Onde está o número nove? → `onde-esta-o-numero-nove.mp3`
- [ ] Onde está o número oito? → `onde-esta-o-numero-oito.mp3`
- [ ] Onde está o número quatro? → `onde-esta-o-numero-quatro.mp3`
- [ ] Onde está o número seis? → `onde-esta-o-numero-seis.mp3`
- [ ] Onde está o número sete? → `onde-esta-o-numero-sete.mp3`
- [ ] Onde está o número três? → `onde-esta-o-numero-tres.mp3`
- [ ] Onde está o número um? → `onde-esta-o-numero-um.mp3`
- [ ] Vamos contar até cinco! → `vamos-contar-ate-cinco.mp3`
- [ ] Vamos contar até dez! → `vamos-contar-ate-dez.mp3`

### Objetos (41)

- [ ] Cadeira → `cadeira.mp3`
- [ ] Cama → `cama.mp3`
- [ ] Carrinho → `carrinho.mp3`
- [ ] Chapéu → `chapeu.mp3`
- [ ] Chave → `chave.mp3`
- [ ] Escova de dentes → `escova-de-dentes.mp3`
- [ ] Guarda-chuva → `guarda-chuva.mp3`
- [ ] Janela → `janela.mp3`
- [ ] Meia → `meia.mp3`
- [ ] Mesa → `mesa.mp3`
- [ ] Mochila → `mochila.mp3`
- [ ] Óculos → `oculos.mp3`
- [ ] Onde está a bola? → `onde-esta-a-bola.mp3`
- [ ] Onde está a boneca? → `onde-esta-a-boneca.mp3`
- [ ] Onde está a cadeira? → `onde-esta-a-cadeira.mp3`
- [ ] Onde está a cama? → `onde-esta-a-cama.mp3`
- [ ] Onde está a camisa? → `onde-esta-a-camisa.mp3`
- [ ] Onde está a chave? → `onde-esta-a-chave.mp3`
- [ ] Onde está a colher? → `onde-esta-a-colher.mp3`
- [ ] Onde está a escova de dentes? → `onde-esta-a-escova-de-dentes.mp3`
- [ ] Onde está a janela? → `onde-esta-a-janela.mp3`
- [ ] Onde está a meia? → `onde-esta-a-meia.mp3`
- [ ] Onde está a mesa? → `onde-esta-a-mesa.mp3`
- [ ] Onde está a mochila? → `onde-esta-a-mochila.mp3`
- [ ] Onde está a porta? → `onde-esta-a-porta.mp3`
- [ ] Onde está o carrinho? → `onde-esta-o-carrinho.mp3`
- [ ] Onde está o chapéu? → `onde-esta-o-chapeu.mp3`
- [ ] Onde está o copo? → `onde-esta-o-copo.mp3`
- [ ] Onde está o guarda-chuva? → `onde-esta-o-guarda-chuva.mp3`
- [ ] Onde está o livro? → `onde-esta-o-livro.mp3`
- [ ] Onde está o óculos? → `onde-esta-o-oculos.mp3`
- [ ] Onde está o prato? → `onde-esta-o-prato.mp3`
- [ ] Onde está o relógio? → `onde-esta-o-relogio.mp3`
- [ ] Onde está o sapato? → `onde-esta-o-sapato.mp3`
- [ ] Onde está o telefone? → `onde-esta-o-telefone.mp3`
- [ ] Onde está o travesseiro? → `onde-esta-o-travesseiro.mp3`
- [ ] Porta → `porta.mp3`
- [ ] Prato → `prato.mp3`
- [ ] Relógio → `relogio.mp3`
- [ ] Telefone → `telefone.mp3`
- [ ] Travesseiro → `travesseiro.mp3`

### Opostos (26)

- [ ] Aberto → `aberto.mp3`
- [ ] Alto → `alto.mp3`
- [ ] Cheio → `cheio.mp3`
- [ ] Dentro → `dentro.mp3`
- [ ] Devagar → `devagar.mp3`
- [ ] Em cima → `em-cima.mp3`
- [ ] Embaixo → `embaixo.mp3`
- [ ] Fechado → `fechado.mp3`
- [ ] Fora → `fora.mp3`
- [ ] Grande → `grande.mp3`
- [ ] Limpo → `limpo.mp3`
- [ ] Longe → `longe.mp3`
- [ ] Molhado → `molhado.mp3`
- [ ] Perto → `perto.mp3`
- [ ] Qual é o contrário de aberto? → `qual-e-o-contrario-de-aberto.mp3`
- [ ] Qual é o contrário de dentro? → `qual-e-o-contrario-de-dentro.mp3`
- [ ] Qual é o contrário de em cima? → `qual-e-o-contrario-de-em-cima.mp3`
- [ ] Qual é o contrário de limpo? → `qual-e-o-contrario-de-limpo.mp3`
- [ ] Qual é o contrário de molhado? → `qual-e-o-contrario-de-molhado.mp3`
- [ ] Qual é o contrário de perto? → `qual-e-o-contrario-de-perto.mp3`
- [ ] Qual é o contrário de quente? → `qual-e-o-contrario-de-quente.mp3`
- [ ] Qual é o contrário de rápido? → `qual-e-o-contrario-de-rapido.mp3`
- [ ] Quente → `quente.mp3`
- [ ] Rápido → `rapido.mp3`
- [ ] Seco → `seco.mp3`
- [ ] Sujo → `sujo.mp3`

### Rotina (12)

- [ ] Hora de acordar! → `hora-de-acordar.mp3`
- [ ] Hora de comer! → `hora-de-comer.mp3`
- [ ] Hora de dormir! → `hora-de-dormir.mp3`
- [ ] Hora de escovar os dentes! → `hora-de-escovar-os-dentes.mp3`
- [ ] Hora de guardar os brinquedos! → `hora-de-guardar-os-brinquedos.mp3`
- [ ] Hora do banho! → `hora-do-banho.mp3`
- [ ] Hora do café da manhã! → `hora-do-cafe-da-manha.mp3`
- [ ] Vamos calçar o sapato? → `vamos-calcar-o-sapato.mp3`
- [ ] Vamos lavar as mãos? → `vamos-lavar-as-maos.mp3`
- [ ] Vamos passear? → `vamos-passear.mp3`
- [ ] Vamos tomar água? → `vamos-tomar-agua.mp3`
- [ ] Vamos vestir a roupa? → `vamos-vestir-a-roupa.mp3`

### Tempo e dias (5)

- [ ] Boa noite! → `boa-noite.mp3`
- [ ] Boa tarde! → `boa-tarde.mp3`
- [ ] Manhã → `manha.mp3`
- [ ] Ontem → `ontem.mp3`
- [ ] Tarde → `tarde.mp3`

### Transportes (15)

- [ ] Ambulância → `ambulancia.mp3`
- [ ] Caminhão de bombeiro → `caminhao-de-bombeiro.mp3`
- [ ] Helicóptero → `helicoptero.mp3`
- [ ] Onde está a ambulância? → `onde-esta-a-ambulancia.mp3`
- [ ] Onde está a bicicleta? → `onde-esta-a-bicicleta.mp3`
- [ ] Onde está a moto? → `onde-esta-a-moto.mp3`
- [ ] Onde está o avião? → `onde-esta-o-aviao.mp3`
- [ ] Onde está o barco? → `onde-esta-o-barco.mp3`
- [ ] Onde está o caminhão de bombeiro? → `onde-esta-o-caminhao-de-bombeiro.mp3`
- [ ] Onde está o caminhão? → `onde-esta-o-caminhao.mp3`
- [ ] Onde está o carro? → `onde-esta-o-carro.mp3`
- [ ] Onde está o foguete? → `onde-esta-o-foguete.mp3`
- [ ] Onde está o helicóptero? → `onde-esta-o-helicoptero.mp3`
- [ ] Onde está o ônibus? → `onde-esta-o-onibus.mp3`
- [ ] Onde está o trem? → `onde-esta-o-trem.mp3`
