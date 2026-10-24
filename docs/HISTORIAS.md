# Hora da Historinha — catálogo, direitos e como completar

Atualizado em 07/10/2026. **31 histórias** (mínimo de 5 por faixa), todas em domínio público ou tradição popular, com textos recontados por nós em português do Brasil.

## Regra de direitos (resumo — não substitui advogado)
- No Brasil a obra entra em domínio público **70 anos após a morte do autor**, a partir de 1º de janeiro do ano seguinte (Lei 9.610/1998, art. 41). Os **direitos morais** continuam: sempre citamos o autor e não deturpamos a obra. Por isso cada história mostra o crédito na página final.
- Folclore e tradição oral (cantigas, parlendas, lendas) não têm autor protegido.
- **Só usamos textos nossos.** Traduções e adaptações de terceiros (editoras, ilustradores) continuam protegidas; não copiamos nenhuma. As ilustrações são geradas por IA a partir de descrições nossas, nunca imitando personagens ou livros existentes.
- Adaptações suavizam trechos duros (ex.: o lobo de Chapeuzinho foge, o troll cai no rio, o ogro vira ratinho e foge) para a idade, mantendo a moral original.

## Catálogo
| Faixa | História | Origem / autor (morte) | Páginas | Arte | Narração |
|---|---|---|---|---|---|
| 6–12 m | A Dona Aranha | cantiga de roda (tradição) | 4 | ✅ | ⏳ |
| 6–12 m | Borboletinha | cantiga de roda (tradição) | 4 | ✅ | ⏳ |
| 6–12 m | Dedinhos | brincadeira de dedos (tradição) | 4 | ✅ | ⏳ |
| 6–12 m | Pombinha Branca | cantiga de roda (tradição) | 4 | ✅ | ⏳ |
| 6–12 m | Palma, Palma, Palma | brincadeira de roda (tradição) | 4 | ✅ | ⏳ |
| 12–18 m | O Sapo Não Lava o Pé | cantiga popular | 4 | ✅ | ⏳ |
| 12–18 m | Sapo Cururu | cantiga de roda | 4 | ⏳ | ⏳ |
| 12–18 m | Pirulito que Bate, Bate | cantiga popular | 4 | ✅ (provisória) | ⏳ |
| 12–18 m | Cai, Cai, Balão | cantiga popular | 4 | ✅ | ⏳ |
| 12–18 m | A Barata Diz Que Tem | cantiga popular | 4 | ✅ (provisória) | ⏳ |
| 18–24 m | O Nabo Gigante | conto popular russo (reconto) | 4 | ⏳ | ⏳ |
| 18–24 m | O Leão e o Ratinho | Esopo (séc. VI a.C.) | 4 | ⏳ | ⏳ |
| 18–24 m | Quem Mora na Luva? | conto popular ucraniano | 4 | ⏳ | ⏳ |
| 18–24 m | O Corvo e a Jarra | Esopo | 4 | ⏳ | ⏳ |
| 18–24 m | A Galinha Ruiva | conto popular inglês | 4 | ⏳ | ⏳ |
| 2–3 a | Os Três Porquinhos | conto popular inglês · Joseph Jacobs († 1916) | 6 | ⏳ | ⏳ |
| 2–3 a | A Lebre e a Tartaruga | Esopo | 6 | ⏳ | ⏳ |
| 2–3 a | Cachinhos Dourados e os Três Ursos | Robert Southey († 1843) | 6 | ⏳ | ⏳ |
| 2–3 a | A Cigarra e a Formiga | Esopo · La Fontaine († 1695) | 6 | ⏳ | ⏳ |
| 2–3 a | Os Três Cabritinhos | Asbjørnsen († 1885) e Moe († 1882) | 6 | ⏳ | ⏳ |
| 3–4 a | Chapeuzinho Vermelho | Charles Perrault († 1703) · Irmãos Grimm († 1863 e 1859) | 6 | ⏳ | ⏳ |
| 3–4 a | O Patinho Feio | Hans Christian Andersen († 1875) | 6 | ⏳ | ⏳ |
| 3–4 a | Os Músicos de Bremen | Irmãos Grimm | 6 | ⏳ | ⏳ |
| 3–4 a | A Festa no Céu | folclore brasileiro | 6 | ⏳ | ⏳ |
| 3–4 a | A Princesa e a Ervilha | Andersen | 6 | ⏳ | ⏳ |
| 4–5 a | Pedro Coelho | Beatrix Potter († 1943) | 6 | ⏳ | ⏳ |
| 4–5 a | A Roupa Nova do Imperador | Andersen | 6 | ⏳ | ⏳ |
| 4–5 a | O Elefantinho Curioso | Rudyard Kipling († 1936) | 6 | ⏳ | ⏳ |
| 4–5 a | O Gato de Botas | Perrault | 6 | ⏳ | ⏳ |
| 4–5 a | O Curupira | folclore brasileiro | 6 | ⏳ | ⏳ |
| 4–5 a | Narizinho e o Reino das Águas Claras | inspirado em Monteiro Lobato († 1948; domínio público no Brasil desde 1/1/2019) | 6 | ⏳ | ⏳ |

✅ pronto no app · ⏳ falta. "Provisória": ilustração gerada com outra ferramenta, em estilo um pouco diferente; refazer no estilo principal quando houver créditos. **Sapo Cururu** teve a ilustração descartada (texto escrito na imagem e estilos misturados) e precisa ser gerada de novo.

`npm run audit:stories` confere o catálogo (mínimo 5 por faixa, 4 ou 6 páginas, créditos, arquivos) e imprime quantas histórias já têm arte e narração por faixa.

## O que falta e o que cada coisa custa
O que está pronto: pesquisa de direitos, 31 textos, descrições das cenas, leitor (estante, páginas, "Aa" mostra/esconde texto, "Auto" vira as páginas), ilustração de 9 histórias e todo o fluxo para o resto.

**Ilustrações (22 histórias):** uma geração por história (folha com 4 ou 6 painéis).
1. `node scripts/story-prompts.mjs <id>` imprime o pedido de imagem.
2. Gerar com Figma (`gemini-3.1-flash-image`, 1024×1024 para 4 páginas, 1536×1024 para 6), que dá o estilo principal e é a melhor opção.
3. `python3 scripts/slice-panels.py <folha.png> <id> <colunas> <linhas>` corta as páginas em `public/assets/stories/<id>/p1.jpg…`.
4. `npm run audit:stories`.
Limite encontrado em 07/10: o plano Starter do Figma respondeu "usage limit" depois de 8 imagens, e o Gamma gasta 70 créditos por imagem (400 no plano grátis, sobraram 50). Gamma costuma errar o estilo (contorno preto, texto na imagem); conferir cada folha.

**Narração (31 histórias, ≈ 12.900 créditos de voz):**
1. `node scripts/narration-plan.mjs all` mostra o custo; `node scripts/narration-plan.mjs <id>` imprime o texto com as pausas.
2. Gerar **um áudio por história** no ElevenLabs (`eleven_multilingual_v2`; voz feminina Ayres, `GFPGeIuI7dxt6YeFLE7l`, ou masculina Milton Alencar, `hetAnQsiAFr5QM0HWVes`, conforme o campo `voice`).
3. `python3 scripts/split-narration.py <audio.mp3> <id>` corta nas pausas e grava `p1.mp3…`.
4. `npm run audit:stories` e `npm run build`.
Bloqueio encontrado em 07/10: a conta do ElevenLabs está no plano grátis, **sem créditos** neste mês e **sem acesso às vozes brasileiras**, que exigem plano pago. Até lá, o leitor fala com a voz do navegador, e cada MP3 novo passa a ser usado sozinho, sem mexer no código.

Enquanto não houver arte, o leitor mostra só as histórias ilustradas; se a faixa tiver menos de 5, completa com as da faixa mais próxima.
