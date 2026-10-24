#!/usr/bin/env python3
"""Recorta cada figura de uma folha de adesivos gerada sobre fundo branco.

Uso: python3 scripts/slice-sheet.py <folha.png> <pasta-do-jogo> <nome1> <nome2> ... (na ordem de leitura: linhas, de cima para baixo, da esquerda para a direita)

- design/scenes/gerados/<pasta>/<nome>.png   recorte transparente no tamanho nativo
- public/assets/images/scenes/<pasta>/<nome>.webp e .png   versão do app, no máximo 420 px
Só remove o branco ligado às bordas da folha: partes brancas dentro do desenho (olhos, barriga) ficam.
Requer Pillow, numpy e scipy.
"""
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
MASTERS = ROOT / 'design/scenes/gerados'
APP = ROOT / 'public/assets/images/scenes'
MAX_SIDE = 420


def foreground_mask(image):
    pixels = np.asarray(image.convert('RGB')).astype(np.float32)
    distance = np.sqrt(((255 - pixels) ** 2).sum(-1))
    border = np.concatenate([distance[0], distance[-1], distance[:, 0], distance[:, -1]])
    threshold = max(8.0, float(np.percentile(border, 99.5)) + 6)
    labels, _ = ndimage.label(distance < threshold)
    edge = set(np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))) - {0}
    outside = np.isin(labels, list(edge))
    return pixels, distance, threshold, outside


def to_rgba(image):
    pixels, distance, threshold, outside = foreground_mask(image)
    alpha = np.where(outside, 0.0, 1.0).astype(np.float32)
    band = ~outside & (ndimage.distance_transform_edt(~outside) <= 2.5)
    alpha[band] = np.clip((distance[band] - threshold) / 40, 0.25, 1)
    alpha = np.asarray(Image.fromarray((alpha * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))).astype(np.float32) / 255
    # Tira o halo branco das bordas: cor = (pixel - branco*(1-alpha)) / alpha
    a = np.clip(alpha, 0.05, 1)[..., None]
    color = np.clip((pixels - 255 * (1 - a)) / a, 0, 255)
    rgba = np.dstack([color, alpha * 255]).astype(np.uint8)
    return Image.fromarray(rgba, 'RGBA'), outside


def slice_sheet(sheet, folder, names):
    image = Image.open(sheet).convert('RGB')
    rgba, outside = to_rgba(image)
    # Une pedaços de uma mesma figura (olhos, espuma) dilatando a máscara antes de rotular.
    glued = ndimage.binary_dilation(~outside, iterations=10)
    labels, count = ndimage.label(glued)
    boxes = []
    for index, sl in enumerate(ndimage.find_objects(labels), start=1):
        if sl is None:
            continue
        area = int((labels[sl] == index).sum())
        if area < 3000:
            continue
        boxes.append((sl[0].start, sl[0].stop, sl[1].start, sl[1].stop))
    if len(boxes) != len(names):
        sys.exit(f'{sheet}: achei {len(boxes)} figuras, esperava {len(names)} ({", ".join(names)})')
    # Ordem de leitura: agrupa em linhas pelo centro vertical.
    boxes.sort(key=lambda b: (b[0] + b[1]) / 2)
    rows = max(1, round(len(names) / 3))
    per_row = len(names) // rows
    ordered = []
    for r in range(rows):
        row = sorted(boxes[r * per_row:(r + 1) * per_row], key=lambda b: b[2])
        ordered.extend(row)
    (MASTERS / folder).mkdir(parents=True, exist_ok=True)
    (APP / folder).mkdir(parents=True, exist_ok=True)
    for (y0, y1, x0, x1), name in zip(ordered, names):
        pad = 6
        crop = rgba.crop((max(0, x0 - pad), max(0, y0 - pad), min(rgba.width, x1 + pad), min(rgba.height, y1 + pad)))
        # Descarta restos de figuras vizinhas dentro do retângulo: mantém só a mancha principal.
        arr = np.asarray(crop).copy()
        lab, n = ndimage.label(ndimage.binary_dilation(arr[..., 3] > 20, iterations=8))
        if n > 1:
            sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
            keep = lab == (int(np.argmax(sizes)) + 1)
            arr[..., 3] = np.where(keep, arr[..., 3], 0)
            crop = Image.fromarray(arr, 'RGBA')
        bbox = crop.getbbox()
        crop = crop.crop(bbox)
        crop.save(MASTERS / folder / f'{name}.png')
        scale = min(1, MAX_SIDE / max(crop.size))
        small = crop.resize((max(1, round(crop.width * scale)), max(1, round(crop.height * scale))), Image.LANCZOS)
        small.save(APP / folder / f'{name}.webp', 'WEBP', quality=86, method=6)
        small.save(APP / folder / f'{name}.png', optimize=True)
        print(f'{folder}/{name}: {crop.width}x{crop.height} -> {small.width}x{small.height}')


if __name__ == '__main__':
    args = sys.argv[1:]
    if len(args) < 3:
        sys.exit(__doc__)
    slice_sheet(args[0], args[1], args[2:])
