# Ícones — acervo de ilustrações

Todas as ilustrações recebidas, já limpas e com nome descritivo, em 512 px (WebP qualidade 95). Esta pasta **não** é publicada no site; as versões usadas pelo app ficam em `public/assets/images/icons/` (256 px).

- `em-uso/` — usadas no app hoje.
- `reserva/` — boas, ainda sem uso; prontas para novas telas e brincadeiras.
- `com-defeito/` — o recorte original estragou (manchas pretas ou partes cortadas). Ficam como referência: vários são desenhos únicos que valem pedir de novo.
- `PEDIDO_DE_ICONES.md` — lista do que ainda falta, com prompts e regras de exportação.

Origem: `aprender_brincar_icon_family.zip` (pacote 1, 24 ícones) e `aprender_brincar_icon_family_clean.zip` (pacote 2, 24 ícones). Ambos vieram de uma folha recortada com a grade deslocada; o tratamento removeu fundo semitransparente, pedaços dos vizinhos e manchas pretas, e reaplicou os cantos arredondados.

## em-uso (17)
| Arquivo | No app (`public/assets/images/icons/`) | Onde aparece |
| --- | --- | --- |
| casa-com-jardim | home.webp | botão de início |
| engrenagem-roxa | settings.webp | Área da Família |
| orelha-ouvindo | listening.webp | botão "ouvir de novo" |
| estrela-sorridente | star.webp | contador de estrelas |
| seta-voltar | back.webp | botões de voltar |
| trofeu-estrela | trophy.webp | Meus adesivos |
| lupa | discovery.webp | mundo Descobrir |
| ondas-de-som | sound.webp | mundo Falar & Comunicar |
| formas-circulo-triangulo-quadrado | shapes.webp | mundo Cores & Formas; Mundo das Formas; Encaixe as Formas |
| leao | animals.webp | mundo Animais & Sons; Animais |
| numeros-123 | numbers.webp | mundo Números & Lógica; Vamos Contar; Contar Tocando |
| cartas-memoria-maca | cards.webp | mundo Memória & Atenção; Memória |
| paleta-de-tintas | creative.webp | mundo Criar & Mexer |
| balao-vermelho | balloon.webp | Balões |
| quebra-cabeca-4-pecas | puzzle.webp | Quebra-Cabeça |
| nota-musical-roxa | music.webp | Piano dos Animais |
| pincel-arco-iris | art.webp | Lousa Mágica |

## reserva (21)
| Arquivo | Ideia de uso |
| --- | --- |
| dinossauro-sorrindo, dinossauro-corpo-inteiro | mascote alternativo; mundo de animais pré-históricos |
| lampada-ideia | dicas, desafios de lógica |
| capelo-formatura | relatório de aprendizagem na Área da Família |
| varinha-estrela, varinha-estrela-v2 | surpresas, recompensas, faz de conta |
| paisagem-rio, arvore-com-sol | mundo da natureza, histórias ao ar livre |
| menino-perfil-circulo, menina | perfil da criança na configuração |
| alvo-dardo, alvo-dardo-v2 | desafios, metas da semana |
| planeta-terra | mapa de mundos, geografia |
| sol-sorridente | clima, rotina da manhã |
| paleta-pincel-v2, cartas-memoria-maca-v2, quebra-cabeca-v2, formas-v2, leao-v2, balao-rosa, trofeu-estrela-v2 | variações dos ícones em uso (as quatro últimas têm um corte leve na borda) |

## com-defeito (10)
| Arquivo | Defeito |
| --- | --- |
| casa-v2 | canto preto, telhado cortado |
| livros-com-capelo | desenho cortado à direita (desenho único) |
| fone-de-ouvido | mancha preta no canto (desenho único) |
| nota-musical-rosa | mancha preta no canto |
| numeros-123-v2 | faixa preta no topo, "1" cortado |
| menino | manchas pretas no topo (desenho único) |
| engrenagem-azul | mancha preta no topo |
| alto-falante | desenho cortado à esquerda (desenho único) |
| estrela-sorridente-v2 | cantos pretos, base cortada |
| globo-com-suporte | faixa preta no topo, globo cortado (desenho único) |

## Para adicionar ou trocar
1. Coloque o arquivo limpo (fundo transparente, desenho centralizado) em `em-uso/` ou `reserva/`.
2. Gere a versão do app: 256 px, WebP qualidade ~88, em `public/assets/images/icons/`.
3. Os mapeamentos ficam em `src/js/ui/app-screens.js` (`GAME_IMAGES` e `WORLD_IMAGES`); o que não tiver imagem continua com emoji.

## gerados (ElevenLabs, gpt-image-2)
Figuras de jogo geradas no estilo dos ícones aprovados.

- `originais/` — o arquivo entregue pelo gerador, sem perda (WebP lossless). É a fonte para refazer qualquer tamanho.
- `gerados/` — recorte com fundo transparente, quadrado, no tamanho nativo (qualidade 95).
- App: `public/assets/images/figures/<nome>.webp`, 512 px, qualidade 85 (~20–30 KB). 512 px deixa a figura nítida mesmo grande num tablet.

Para processar uma figura nova: `python3 scripts/cutout-figure.py <original.png> <nome>`.
Ao gerar, peça proporção **1:1** (quadrada); a primeira leva saiu 16:9 e o desenho ficou com ~600 px.

| Figura | Original | No app |
| --- | --- | --- |
| cachorro | 1280×720 | figures/cachorro.webp |
| gato | 1280×720 | figures/gato.webp |
| maçã | 1280×720 | figures/maca.webp |
