# Ferramentas de arte e som com IA — o que testamos e o que vem a seguir

Atualizado em 07/10/2026. A arte do Fundo do Mar nasceu daqui.

## Testado nesta sessão
| Ferramenta | Situação | Veredito |
|---|---|---|
| **Figma** (`generate_image`) | Conectado, conta "A equipe de Igor Cruz" (plano Starter). Modelos: `gemini-3.1-flash-lite-image`, `gemini-3.1-flash-image`, `gpt-image-2.5-sunburst`. Devolve arquivo completo (PNG/JPEG até 2048 px) por link que vale 7 dias. | **Usado.** Melhor para o nosso fluxo: o arquivo vem em alta resolução e dá para baixar por `curl`. `gemini-3.1-flash-image` entregou folhas de adesivos consistentes. Consome créditos de IA do plano. |
| **Canva** (`generate-image`) | Conectado e autorizado, sem brand kit. Aceita imagens de referência (bom para manter o estilo). | **Bom para ideias e estilo.** Resultado bonito e polido, mas o Claude só recebe uma miniatura de 200 px; o arquivo completo precisa ser baixado por você no link "Abrir imagem gerada". Não serve para o fluxo automático. |
| **Gamma** (`generate_image`) | Disponível. | Feito para apresentações; não testado, não recomendado para sprites. |
| **ElevenLabs** (imagem, vídeo, voz, música, efeitos) | Estava conectado e caiu durante a sessão. | Mais promissor para **voz e som** (ver abaixo). Voltar a testar quando reconectar. |
| **Adobe / Firefly, Cloudinary** | Pedem autorização na conta. | Não testados. Firefly tem boa fama de uso comercial seguro. |

## Outras IAs para considerar (pesquisa de 07/10/2026)
- **Recraft** — único grande gerador que entrega **SVG de verdade** (formas separadas e editáveis). Plano grátis com 50 gerações por dia; **licença comercial só no plano pago** (Pro, cerca de US$ 45/mês). Ótimo para ícones, objetos e cenários que precisam ser animados parte por parte.
- **Ludo.ai, Scenario, Layer.ai, AutoSprite** — geradores de sprites e folhas de animação. **Scenario** treina um modelo no *nosso* estilo (consistência entre jogos); **AutoSprite** cria folha de animação a partir de uma imagem. Os de pixel art (PixelLab, Quick Sprites) não combinam com o nosso estilo.
- **Rive** (editor de animação por esqueleto) — não é IA, mas é o que transforma um personagem recortado em personagem que respira, pisca e reage. Arquivos minúsculos e rodam no Pixi.
- **Som e música:** **ElevenLabs** (plano pago dá direitos comerciais para voz, música e efeitos, com música treinada em dados licenciados) e **Stable Audio** (licença para uso comercial, treino em dados licenciados). **Suno** deixa mais risco jurídico. Para jogo infantil, preferir os licenciados.
- **Voz humana gravada continua sendo a prioridade** do projeto (`docs/AUDIO_RECORDING_QUEUE.md`); IA de voz serve de rascunho e para sons de ambiente.

Fontes: [Ludo – best AI sprite generators](https://new.ludo.ai/compare/best-ai-sprite-generators), [Sorceress – sprites com IA em 2026](https://sorceress.games/blog/how-to-generate-game-sprites-with-ai-in-2026), [Recraft – visão geral](https://buildfastwithai.com/ai-tools/recraft), [Recraft V3 SVG](https://replicate.com/recraft-ai/recraft-v3-svg), [Melhores geradores de música para jogos](https://app.cinevva.com/guides/ai-music-generators-games), [ElevenLabs vs Suno](https://elevenlabs.io/blog/elevenlabs-vs-suno).

## Cuidados (não substitui advogado)
- **Licença:** conferir, na data de uso, se o plano usado permite uso comercial da imagem gerada. Guardar os prompts e os originais (já guardamos em `design/scenes/originais/`).
- **Propriedade autoral:** obra gerada por IA pode ter proteção limitada; o que protege o projeto é o conjunto (direção de arte, curadoria, código, composição). Vale registrar a marca e os personagens-mascote que forem criados à mão.
- **Sem copiar:** os prompts descrevem um *estilo* (chapado, vibrante, geométrico), nunca um personagem ou marca existente.
- **Créditos:** cada geração consome créditos do plano; usar `generations_count` baixo e pedir folhas com vários itens por imagem (1 geração = 6 bichos).

## Como gerar mais arte no mesmo estilo
Veja `design/scenes/README.md` (prompt base, folhas de adesivos e o script de recorte).
