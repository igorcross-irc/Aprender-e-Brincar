#!/usr/bin/env python3
"""Corta uma folha de ilustrações de história (grade de painéis separados por branco) em páginas.

Uso: python3 scripts/slice-panels.py <folha.png> <id-da-historia> <colunas> <linhas>

- design/stories/originais/<id>.png        cópia da folha original (sem perda)
- public/assets/stories/<id>/p1.jpg … pN.jpg   páginas quadradas, no máximo 640 px, JPEG progressivo
Procura as faixas brancas entre os painéis; se não achar, divide em partes iguais.
Requer Pillow e numpy.
"""
import shutil
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
MAX_SIDE = 640


def runs(flags, min_len):
    """Trechos consecutivos onde flags é True, com pelo menos min_len."""
    out, start = [], None
    for i, f in enumerate(list(flags) + [False]):
        if f and start is None:
            start = i
        elif not f and start is not None:
            if i - start >= min_len:
                out.append((start, i))
            start = None
    return out


def segments(white_fraction, count, total):
    """Trechos de conteúdo entre faixas brancas; devolve `count` intervalos (início, fim)."""
    gutter = white_fraction > 0.985
    content = runs(~gutter, int(total * 0.12))
    if len(content) == count:
        return content
    # Tolerância: junta/descarta trechos até bater com a quantidade esperada.
    if len(content) > count:
        content = sorted(sorted(content, key=lambda r: r[0] - r[1])[:count])
        return content
    step = total / count
    return [(round(i * step), round((i + 1) * step)) for i in range(count)]


def slice_sheet(sheet, story_id, cols, rows):
    image = Image.open(sheet).convert('RGB')
    arr = np.asarray(image).astype(np.int16)
    near_white = (arr > 244).all(-1)
    h, w = near_white.shape
    row_bands = segments(near_white.mean(axis=1), rows, h)
    out_dir = ROOT / 'public/assets/stories' / story_id
    out_dir.mkdir(parents=True, exist_ok=True)
    (ROOT / 'design/stories/originais').mkdir(parents=True, exist_ok=True)
    shutil.copyfile(sheet, ROOT / 'design/stories/originais' / f'{story_id}.png')
    page = 0
    for (y0, y1) in row_bands:
        col_bands = segments(near_white[y0:y1].mean(axis=0), cols, w)
        for (x0, x1) in col_bands:
            page += 1
            inset = int(0.05 * min(x1 - x0, y1 - y0))  # tira os cantos arredondados (brancos) do painel
            panel = image.crop((x0 + inset, y0 + inset, x1 - inset, y1 - inset))
            side = min(panel.size)
            left, top = (panel.width - side) // 2, (panel.height - side) // 2
            panel = panel.crop((left, top, left + side, top + side))
            if side > MAX_SIDE:
                panel = panel.resize((MAX_SIDE, MAX_SIDE), Image.LANCZOS)
            panel.save(out_dir / f'p{page}.jpg', 'JPEG', quality=84, optimize=True, progressive=True)
    print(f'{story_id}: {page} páginas ({cols}x{rows}) em {out_dir.relative_to(ROOT)}')
    if page != cols * rows:
        sys.exit(f'esperava {cols * rows} páginas')


if __name__ == '__main__':
    a = sys.argv[1:]
    if len(a) != 4:
        sys.exit(__doc__)
    slice_sheet(a[0], a[1], int(a[2]), int(a[3]))
