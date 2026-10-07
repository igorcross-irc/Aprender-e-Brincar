#!/usr/bin/env python3
"""Narração provisória das histórias com Kokoro (voz pf_dora, offline e grátis).

Uso: python3 scripts/narrate-kokoro.py [--only id1,id2] [--speed 0.9] [--force]
Requer: pip install kokoro-onnx soundfile; ffmpeg; kokoro-v1.0.onnx e voices-v1.0.bin (veja docs/NARRACAO.md).
Gera public/assets/stories/<id>/p<N>.mp3 (uma página por arquivo). Troque depois pela voz da Dora (ElevenLabs).
"""
import argparse, json, os, subprocess, tempfile
import soundfile as sf
from kokoro_onnx import Kokoro

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--model', default=os.environ.get('KOKORO_MODEL', 'kokoro-v1.0.onnx'))
ap.add_argument('--voices', default=os.environ.get('KOKORO_VOICES', 'voices-v1.0.bin'))
ap.add_argument('--voice', default='pf_dora')
ap.add_argument('--speed', type=float, default=0.9)
ap.add_argument('--only', default='')
ap.add_argument('--force', action='store_true')
args = ap.parse_args()

pages = json.loads(subprocess.run(['node', '-e', "import('./src/content/stories/index.js').then(m=>console.log(JSON.stringify(m.stories.map(s=>({id:s.id,pages:s.pages.map(p=>p[0])})))))"], cwd=ROOT, capture_output=True, text=True, check=True).stdout)
only = set(filter(None, args.only.split(',')))
kokoro = Kokoro(args.model, args.voices)
trim = 'silenceremove=start_periods=1:start_threshold=-45dB'
chain = f'{trim},areverse,{trim},areverse,adelay=60,apad=pad_dur=0.25,loudnorm=I=-16:TP=-1.5:LRA=7'
count = 0
for story in pages:
    if only and story['id'] not in only:
        continue
    folder = os.path.join(ROOT, 'public/assets/stories', story['id'])
    os.makedirs(folder, exist_ok=True)
    for i, text in enumerate(story['pages'], 1):
        out = os.path.join(folder, f'p{i}.mp3')
        if os.path.exists(out) and not args.force:
            continue
        spoken = text.replace('&', ' e ')
        samples, rate = kokoro.create(spoken, voice=args.voice, speed=args.speed, lang='pt-br')
        with tempfile.TemporaryDirectory() as tmp:
            wav = os.path.join(tmp, 'x.wav')
            sf.write(wav, samples, rate)
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', chain, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', '-map_metadata', '-1', out], check=True)
        count += 1
    print(story['id'], len(story['pages']), 'páginas')
print(count, 'arquivos gerados')
