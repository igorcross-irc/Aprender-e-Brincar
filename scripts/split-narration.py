#!/usr/bin/env python3
"""Corta o áudio de uma história (páginas separadas por pausa longa) em p1.mp3 … pN.mp3.

Uso: python3 scripts/split-narration.py <audio.mp3> <id-da-historia>

Procura as pausas com o ffmpeg (silencedetect). Se achar um número de trechos diferente do de páginas,
tenta limiares mais sensíveis e, no fim, aborta sem gravar nada. Saída: public/assets/stories/<id>/p<N>.mp3
(mono, 44,1 kHz, 64 kbps, com um respiro de 0,25 s no começo e no fim de cada página).
Requer ffmpeg e ffprobe.
"""
import re
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))


def page_count(story_id):
    out = subprocess.run(['node', '--input-type=module', '-e',
                          f"import {{ storyById }} from './src/content/stories/index.js'; console.log(storyById('{story_id}')?.pages.length || 0)"],
                         cwd=ROOT, capture_output=True, text=True)
    return int(out.stdout.strip().splitlines()[-1] or 0)


def detect(audio, noise_db, min_silence):
    out = subprocess.run(['ffmpeg', '-hide_banner', '-nostats', '-i', str(audio), '-af', f'silencedetect=noise={noise_db}dB:d={min_silence}', '-f', 'null', '-'],
                         capture_output=True, text=True).stderr
    starts = [float(x) for x in re.findall(r'silence_start: ([\d.]+)', out)]
    ends = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', out)]
    return starts, ends


def duration(audio):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', str(audio)], capture_output=True, text=True).stdout
    return float(out.strip())


def pieces(audio, pages):
    total = duration(audio)
    for noise in (-40, -35, -45, -30, -50):
        for min_silence in (1.4, 1.0, 1.8, 0.8):
            starts, ends = detect(audio, noise, min_silence)
            # Silêncio inicial/final não separa páginas.
            cuts = [(s, e) for s, e in zip(starts, ends) if s > 0.4 and e < total - 0.4]
            if len(cuts) == pages - 1:
                bounds = [0.0] + [(s + e) / 2 for s, e in cuts] + [total]
                return list(zip(bounds[:-1], bounds[1:]))
    return None


def main(audio, story_id):
    pages = page_count(story_id)
    if not pages:
        sys.exit(f'história desconhecida: {story_id}')
    found = pieces(Path(audio), pages)
    if not found:
        sys.exit(f'não consegui separar {pages} páginas em {audio}; confira as pausas do texto')
    out_dir = ROOT / 'public/assets/stories' / story_id
    out_dir.mkdir(parents=True, exist_ok=True)
    for i, (a, b) in enumerate(found, start=1):
        target = out_dir / f'p{i}.mp3'
        subprocess.run(['ffmpeg', '-y', '-hide_banner', '-loglevel', 'error', '-ss', f'{a:.3f}', '-to', f'{b:.3f}', '-i', str(audio),
                        '-af', 'silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=1:stop_threshold=-45dB:stop_silence=0.3,adelay=250|250,apad=pad_dur=0.25',
                        '-ac', '1', '-ar', '44100', '-b:a', '64k', str(target)], check=True)
    print(f'{story_id}: {len(found)} páginas narradas em {out_dir.relative_to(ROOT)}')


if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
