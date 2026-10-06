#!/usr/bin/env python3
"""Gera as falas que ainda não têm MP3 com o Piper (voz sintética aberta, offline, grátis).

É uma solução PROVISÓRIA para quando não há créditos de voz humana-like: as falas geradas
ficam listadas em docs/voz-provisoria.json para serem trocadas depois (veja docs/VOZ.md).
Os modelos pt_BR do Piper (faber, cadu) usam conjuntos de dados CC0.

Uso:
  python3 -m venv .venv-tts && .venv-tts/bin/pip install piper-tts
  (baixe o modelo .onnx e .onnx.json de huggingface.co/rhasspy/piper-voices/pt/pt_BR/...)
  .venv-tts/bin/python scripts/generate-voice-piper.py --model caminho/pt_BR-faber-medium.onnx [--dry] [--only a.mp3,b.mp3]
Requer ffmpeg.
"""
import argparse, json, os, re, subprocess, sys, tempfile, datetime

COVERAGE = 'docs/AUDIO_COVERAGE.md'
OUT_DIR = 'public/assets/audio'
MANIFEST = 'docs/voz-provisoria.json'

def missing_lines():
    """Lê a tabela 'Falta gravar' e devolve {arquivo: texto} (um texto por arquivo)."""
    files = {}
    for line in open(COVERAGE, encoding='utf8'):
        if not line.startswith('| ') or '.mp3' not in line:
            continue
        cells = [c.strip() for c in line.strip().strip('|').split('|')]
        text, name = cells[0], cells[1].strip('`')
        # Prefere a versão "bem escrita" (não TODA EM MAIÚSCULAS) do mesmo arquivo.
        if name not in files or (files[name].isupper() and not text.isupper()):
            files[name] = text
    return files

def speakable(text):
    text = re.sub(r'\s+', ' ', text).strip()
    # TODO EM MAIÚSCULAS vira "Todo em minúsculas": senão o sintetizador pode soletrar.
    if len(text) > 1 and text.isupper():
        text = text.capitalize()
    return text.replace('&', ' e ')

def synth(model, text, wav, length_scale):
    subprocess.run([sys.executable, '-m', 'piper', '-m', model, '-f', wav, '--length-scale', str(length_scale), '--sentence-silence', '0.12'],
                   input=text.encode('utf8'), check=True, capture_output=True)

def to_mp3(wav, mp3):
    # Tira silêncio das pontas, nivela para ≈ -16 LUFS (como as falas da Dora) e grava mono 64 kbps.
    # Atenção: só as PONTAS. (stop_periods no silenceremove corta tudo depois da 1ª pausa e trunca frases.)
    trim = 'silenceremove=start_periods=1:start_threshold=-45dB'
    chain = f'{trim},areverse,{trim},areverse,adelay=40,apad=pad_dur=0.06,loudnorm=I=-16:TP=-1.5:LRA=7'
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', wav, '-af', chain, '-ac', '1', '-ar', '44100', '-c:a', 'libmp3lame', '-b:a', '64k', '-map_metadata', '-1', mp3], check=True)

def duration(path):
    out = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', path], capture_output=True, text=True, check=True).stdout.strip()
    return float(out)

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', required=True)
    ap.add_argument('--length-scale', type=float, default=1.08, help='>1 fala mais devagar (bom para crianças)')
    ap.add_argument('--dry', action='store_true')
    ap.add_argument('--only', default='')
    args = ap.parse_args()
    todo = missing_lines()
    if args.only:
        wanted = set(args.only.split(','))
        todo = {k: v for k, v in todo.items() if k in wanted}
    todo = {k: v for k, v in todo.items() if not os.path.exists(os.path.join(OUT_DIR, k))}
    print(f'{len(todo)} falas para gerar com {os.path.basename(args.model)}')
    if args.dry:
        for name, text in todo.items():
            print(f'  {name}: {speakable(text)}')
        return
    done = []
    with tempfile.TemporaryDirectory() as tmp:
        for name, text in todo.items():
            wav = os.path.join(tmp, 'x.wav')
            out = os.path.join(OUT_DIR, name)
            synth(args.model, speakable(text), wav, args.length_scale)
            to_mp3(wav, out)
            seconds = duration(out)
            if seconds < 0.15 or seconds > 12:
                os.remove(out)
                print(f'  ✗ {name}: duração estranha ({seconds:.2f}s), descartado')
                continue
            done.append({'file': name, 'text': text, 'seconds': round(seconds, 2)})
    old = json.load(open(MANIFEST, encoding='utf8')) if os.path.exists(MANIFEST) else {'files': []}
    known = {item['file'] for item in done}
    manifest = {
        'voice': os.path.basename(args.model).replace('.onnx', ''),
        'engine': 'piper (dataset CC0)',
        'generatedAt': datetime.date.today().isoformat(),
        'note': 'Voz provisória. Troque por voz humana/Dora e apague o item daqui (docs/VOZ.md).',
        'files': [item for item in old.get('files', []) if item['file'] not in known] + done
    }
    json.dump(manifest, open(MANIFEST, 'w', encoding='utf8'), ensure_ascii=False, indent=2)
    print(f'{len(done)} falas geradas; manifesto em {MANIFEST}')

if __name__ == '__main__':
    main()
