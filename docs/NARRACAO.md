# Narração das histórias

## Provisória (já feita): Kokoro, voz `pf_dora`
Grátis, offline, sem limite, licença Apache-2.0. É a mesma voz provisória usada nas falas do app (branch `claude/zen-ramanujan-pn60we`, `scripts/generate-voice.py`). Mais grave e mais sintética que a Dora do ElevenLabs.

```
python3 -m venv .venv-tts && .venv-tts/bin/pip install kokoro-onnx soundfile
# baixar kokoro-v1.0.onnx e voices-v1.0.bin: github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
KOKORO_MODEL=kokoro-v1.0.onnx KOKORO_VOICES=voices-v1.0.bin .venv-tts/bin/python scripts/narrate-kokoro.py [--only id] [--speed 0.9] [--force]
node scripts/stories-index.mjs   # (o build já faz)
```
Gera um MP3 por página em `public/assets/stories/<id>/pN.mp3` (mono 64 kbps, −16 LUFS). As 31 histórias (156 páginas, ≈ 11 min, 6,9 MB) estão geradas.

## Definitiva: Dora (ElevenLabs)
Voz `OARkYvAPkwW2xOP8T9FE`, modelo `eleven_multilingual_v2`, ≈ 12.890 créditos para tudo. Um áudio por história: `node scripts/narration-plan.mjs <id>` → gerar → `python3 scripts/split-narration.py <audio> <id>` (sobrescreve os `pN.mp3`).
