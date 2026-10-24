# Arte das cenas

## Estrutura
- `originais/` — imagens como saíram da IA (sem perda). Nunca editar; todo o resto se refaz a partir daqui.
- `gerados/<cena>/` — recortes transparentes no tamanho nativo (PNG).
- `public/assets/images/scenes/<cena>/` — versão do app: WebP (+ cópia PNG, exigida pelo `legacy-audit`), no máximo 420 px por figura.

## Receita para uma cena nova
1. **Fundo** (1 geração, retrato 4:5, ~928×1152): sem animais nem texto, centro livre, 25% inferior com o "chão" (areia, grama, solo).
2. **Folhas de adesivos** (1 geração = 6 figuras, 1536×1024): grade 3×2, fundo branco puro, espaço largo entre as figuras, mesmo estilo.
3. Salvar em `originais/<cena>-plate.png` e `originais/<cena>-sheet-a.png` …
4. Recortar: `python3 scripts/slice-sheet.py design/scenes/originais/<cena>-sheet-a.png <cena> nome1 nome2 … nome6` (ordem de leitura: linhas de cima para baixo, esquerda para direita). Gerar o fundo: converter para `plate.webp` + `plate.png` (qualidade 84).
5. Descrever a cena em `src/js/games/scenes/<cena>-scene.js` (bichos, posições, reações) e registrar no `game-registry.js`.
6. Rodar `npm run test:scenes`.

## Prompt base (estilo)
> Flat vector children's picture-book illustration, vibrant saturated colors, simple geometric shapes, decorative polka dots, stripes and zigzag patterns, no outlines, big friendly round dot eyes with white highlights, rosy cheeks, smiling, front view, subtle gouache paper-grain texture, cheerful Brazilian preschool animation style, consistent style across all items.

Modelo usado: `gemini-3.1-flash-image` (Figma). Folhas: "Sticker sheet of 6 separate … arranged in a clean grid of 3 columns by 2 rows with very wide empty white gaps between them so nothing touches or overlaps, every item fully visible, on a pure flat white background (#FFFFFF), no shadows on the background, no text, no labels."

## Cenas
| Cena | Fundo | Folhas | Situação |
|---|---|---|---|
| `sea` Fundo do Mar | sea-plate | sea-sheet-a (peixe-palhaço, tartaruga, polvo, caranguejo, golfinho, baleia), sea-sheet-b (baiacu, estrela, água-viva, cavalo-marinho, tubarão, peixe-anjo), sea-sheet-c (baú fechado/aberto, concha fechada/aberta, baiacu inflado, peixinho) | no jogo |
| `forest` Floresta | — | — | a fazer |
| `backyard` Quintal / jardim | — | — | a fazer |
| `space` Espaço (noite) | — | — | a fazer |
