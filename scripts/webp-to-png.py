#!/usr/bin/env python3
"""Cria uma cópia .png ao lado de cada .webp de public/assets/images.

Aparelhos sem WebP (iOS < 14, ex.: iPad com iOS 9) recebem o PNG: src/legacy/compat.js
troca .webp → .png nas imagens. PNG de 256 cores com transparência, para ficar leve.
Rode de novo sempre que adicionar ou trocar uma imagem .webp.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent / 'public/assets/images'
count = 0
for webp in sorted(ROOT.rglob('*.webp')):
    png = webp.with_suffix('.png')
    if png.exists() and png.stat().st_mtime >= webp.stat().st_mtime:
        continue
    image = Image.open(webp).convert('RGBA')
    image.quantize(colors=256, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(png, optimize=True)
    count += 1
print(f'{count} PNG gerados')
