#!/usr/bin/env python3
"""Recorta uma figura gerada sobre fundo branco e grava as três versões.

Uso: python3 scripts/cutout-figure.py <imagem-original> <nome> [<imagem> <nome> ...]

- design/icons/originais/fig-<nome>.webp  original sem perda (para refazer qualquer tamanho)
- design/icons/gerados/fig-<nome>.webp    recorte transparente no tamanho nativo, qualidade 95
- public/assets/images/figures/<nome>.webp versão do app, 512 px, qualidade 85

Só remove o branco ligado às bordas: partes brancas dentro do desenho ficam.
Requer Pillow, numpy e scipy.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
ORIGINALS = ROOT / 'design/icons/originais'
MASTERS = ROOT / 'design/icons/gerados'
APP = ROOT / 'public/assets/images/figures'


def cutout(source, name):
    image = Image.open(source).convert('RGB')
    pixels = np.asarray(image).astype(np.float32)
    distance = np.sqrt(((255 - pixels) ** 2).sum(-1))

    # Fundo = regiões quase brancas que tocam a borda da imagem.
    labels, _ = ndimage.label(distance < 40)
    edge = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    outside = np.isin(labels, list(edge))

    # Borda suave: a transparência acompanha o quanto o pixel se afasta do branco.
    alpha = np.where(outside, 0, 255).astype(np.float32)
    band = outside & (distance > 8)
    alpha[band] = np.clip((distance[band] - 8) / 32 * 255, 0, 255)
    mask = Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.8))

    rgba = image.convert('RGBA')
    rgba.putalpha(mask)
    ys, xs = np.where(np.asarray(mask) > 20)
    crop = rgba.crop((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1))

    # Quadrado com ~6% de margem de cada lado.
    width, height = crop.size
    side = int(max(width, height) * 1.12)
    square = Image.new('RGBA', (side, side), (0, 0, 0, 0))
    square.paste(crop, ((side - width) // 2, (side - height) // 2))

    for folder in (ORIGINALS, MASTERS, APP):
        folder.mkdir(parents=True, exist_ok=True)
    image.save(ORIGINALS / f'fig-{name}.webp', 'WEBP', lossless=True, method=6)
    square.save(MASTERS / f'fig-{name}.webp', 'WEBP', quality=95, method=6)
    square.resize((512, 512), Image.LANCZOS).save(APP / f'{name}.webp', 'WEBP', quality=85, method=6)
    print(f'{name}: recorte {width}x{height} px (lado {side})')


if __name__ == '__main__':
    args = sys.argv[1:]
    if not args or len(args) % 2:
        sys.exit(__doc__)
    for source, name in zip(args[::2], args[1::2]):
        cutout(source, name)
