# Voz: situação, alternativas e como trocar

## Onde estamos (06/10/2026)
- **244 de 244 falas têm MP3.** Nenhuma depende mais da voz do navegador.
- **88 falas** são da voz **Dora** (ElevenLabs), a voz principal do app.
- **141 falas** são **provisórias**, geradas **sem créditos**, aqui, offline, com o **Kokoro-82M** (licença Apache-2.0), voz **feminina** pt-BR `pf_dora`. A lista está em [`voz-provisoria.json`](voz-provisoria.json). (O nome "Dora" é coincidência: não é a mesma voz do ElevenLabs.)
- Voz masculina **não é usada**: as versões geradas antes com o Piper (masculino) foram apagadas.
- ⚠️ **Eu não consigo ouvir áudio.** Conferi só o que dá para medir: arquivo válido, duração coerente com o texto, volume ≈ -17 LUFS como as da Dora e tom de voz (≈ 170–190 Hz, faixa feminina; a Dora do ElevenLabs é mais aguda, ≈ 270 Hz). **Ouça uma amostra antes de publicar.** Sugestões: `parabens-voce-completou-o-quebra-cabeca.mp3`, `escolha-algumas-palavras-primeiro.mp3`, `2-palmas.mp3`, `banho.mp3`.
- Ainda assim, a Dora e a provisória são vozes diferentes: numa mesma brincadeira podem tocar as duas. Os caminhos abaixo resolvem isso.

## Três caminhos (pode combinar)
1. **Voz da família (já implementado, grátis, a melhor):** Área da Família → **Grave a sua voz**. Grave as 25 falas mais ouvidas (Oi, Muito bem, Parabéns, cores, animais, mamãe, papai…). A gravação passa na frente do MP3 do app, fica só no aparelho e não entra no backup. Funciona no navegador e **no aplicativo Android** (o app pede a permissão de microfone só quando você toca em gravar; **não testado em aparelho real**, ver `docs/ANDROID.md`).
2. **Voltar a uma voz só quando houver créditos:** gerar as 141 com a Dora (≈ 1.500 caracteres no total, uma fração do plano gratuito mensal), copiar por cima dos arquivos listados em `voz-provisoria.json`, rodar `npm run audio:compress` e esvaziar o manifesto.
3. **Trocar a voz provisória por outra:** rodar de novo o gerador com `--replace-provisional` ou usar outro serviço (tabela abaixo).

## Como gerar/regerar a voz provisória (Kokoro)
```bash
python3 -m venv .venv-tts && .venv-tts/bin/pip install kokoro-onnx soundfile
# baixe kokoro-v1.0.onnx (≈ 310 MB) e voices-v1.0.bin em
# github.com/thewh1teagle/kokoro-onnx/releases/tag/model-files-v1.0
npm run audio:coverage                      # lista o que falta
.venv-tts/bin/python scripts/generate-voice.py --kokoro-model kokoro-v1.0.onnx --kokoro-voices voices-v1.0.bin
npm run audit:audio && npm run build        # confere e refaz o índice
```
O script só gera o que **não existe** (nunca sobrescreve a Dora), normaliza o volume, corta silêncio só das pontas e grava mono 64 kbps. `--dry` mostra o que faria; `--only a.mp3,b.mp3` limita; `--replace-provisional` apaga as provisórias e gera de novo. Os modelos ficam fora do repositório.
**Voltar à voz do navegador:** apague os arquivos listados no manifesto.

## Alternativas (confirme preços e termos atuais)
| Opção | Prós | Contras |
| --- | --- | --- |
| **Voz da família** | A mais afetiva; custo zero; a criança reconhece | Dá trabalho; depende do microfone |
| **ElevenLabs (Dora)** | Voz mais natural e calorosa; já é a voz do app | Precisa de créditos (as 141 falas custam ≈ 1.500) |
| **Google Cloud TTS** (pt-BR Chirp/Neural2) | Barato, boa qualidade, cota gratuita | Menos expressivo |
| **Microsoft Azure Neural TTS** (pt-BR Francisca, Thalita) | Muito natural, SSML, cota gratuita; **tem voz feminina** | Conta e chave |
| **Amazon Polly** (pt-BR Camila, Vitória) | Barato, simples; vozes femininas | Menos calorosas |
| **OpenAI TTS** | Aceita instruções de estilo ("fale como professora animada") | Consistência varia |
| **Kokoro `pf_dora` (atual, provisória)** | Grátis, offline, sem limite, feminina, Apache-2.0 | Voz sintética; mais grave que a Dora |
| **Piper** | Grátis, offline | Só voz masculina em pt-BR (descartada) |

**Regra de ouro:** uma voz só por faixa etária.

## Licenças
- Kokoro-82M (modelo e voz `pf_dora`): **Apache-2.0**, uso comercial permitido.
- ElevenLabs: confira se o plano permite uso comercial dentro de app antes de publicar em loja.
