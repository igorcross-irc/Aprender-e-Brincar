# Ícones — arquivo de ilustrações

Ilustrações 3D aprovadas, já recortadas e limpas, em alta resolução (512 px, WebP qualidade 95). Esta pasta **não** é publicada no site: é o acervo de onde saem as versões usadas no app.

## Origem e tratamento
- `pacote-1/`: do `aprender_brincar_icon_family.zip` (24 ícones). O recorte original tinha grade deslocada, pedaços dos ícones vizinhos e fundo semitransparente; foram limpos automaticamente (fundo e faixas removidos, cantos arredondados reaplicados). Todos ficaram bons.
- `pacote-2/`: do `aprender_brincar_icon_family_clean.zip`. Só os 11 que ficaram bons depois do tratamento. Os demais tinham manchas pretas ou partes cortadas e foram descartados (todos têm versão boa no pacote 1).

## Em uso no app (`public/assets/images/icons/`, 256 px)
| Arquivo no app | Origem | Onde aparece |
| --- | --- | --- |
| `home.webp` | pacote-1/home | botão de início |
| `settings.webp` | pacote-1/settings | Área da Família |
| `listening.webp` | pacote-1/listening | botão "ouvir de novo" |
| `star.webp` | pacote-1/star | contador de estrelas |
| `back.webp` | pacote-1/back | botões de voltar |
| `trophy.webp` | pacote-1/trophy | Meus adesivos |
| `discovery.webp` | pacote-2/discovery (lupa) | mundo Descobrir |
| `sound.webp` | pacote-1/sound | mundo Falar & Comunicar |
| `shapes.webp` | pacote-1/shapes | mundo Cores & Formas; Mundo das Formas; Encaixe as Formas |
| `animals.webp` | pacote-1/animals | mundo Animais & Sons; Animais |
| `numbers.webp` | pacote-1/numbers | mundo Números & Lógica; Vamos Contar; Contar Tocando |
| `cards.webp` | pacote-1/cards | mundo Memória & Atenção; Memória |
| `creative.webp` | pacote-1/creative | mundo Criar & Mexer |
| `balloon.webp` | pacote-1/balloon | Balões |
| `puzzle.webp` | pacote-1/puzzle | Quebra-Cabeça |
| `music.webp` | pacote-1/music | Piano dos Animais |
| `art.webp` | pacote-1/art | Lousa Mágica |

## Guardados para o futuro
- pacote-1: `dinosaur`, `discovery` (lâmpada), `learning`, `magic`, `nature`, `profile`, `target`, `worlds`.
- pacote-2: `art`, `cards`, `dinosaur`, `magic`, `nature`, `profile-boy`, `profile-girl`, `puzzle`, `shapes`, `sun` (variações do mesmo estilo).

## Para adicionar ou trocar
1. Coloque o PNG/WebP limpo (fundo transparente, desenho centralizado) aqui.
2. Gere a versão do app: 256 px em WebP (qualidade ~88) em `public/assets/images/icons/` com o nome usado no código.
3. Mapeamentos ficam em `src/js/ui/app-screens.js` (`GAME_IMAGES` e `WORLD_IMAGES`); o que não tiver imagem usa o emoji.
