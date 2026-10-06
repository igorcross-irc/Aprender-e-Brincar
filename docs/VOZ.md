# Voz: situação, alternativas e como trocar

## Onde estamos (06/10/2026)
- **244 de 244 falas têm MP3.** Nenhuma depende mais da voz do navegador.
- **88 falas** são da voz **Dora** (ElevenLabs), a voz principal do app.
- **141 falas** são **provisórias**, geradas **sem créditos** com o **Piper** (voz sintética de código aberto, rodando aqui, offline). A lista está em [`voz-provisoria.json`](voz-provisoria.json).
- Voz usada nas provisórias: `pt_BR-faber-medium` (masculina; dados de treino CC0, uso livre). Não existe voz feminina pt-BR no Piper.
- ⚠️ **Eu não consigo ouvir áudio.** Conferi só o que dá para medir (arquivo válido, duração coerente com o texto, volume ≈ -17 LUFS como as da Dora). **Ouça uma amostra antes de publicar.** Sugestões: `parabens-voce-completou-o-quebra-cabeca.mp3`, `escolha-algumas-palavras-primeiro.mp3`, `2-palmas.mp3`, `banho.mp3`.
- ⚠️ **Mistura de vozes:** numa mesma brincadeira pode tocar a Dora (feminina) e uma provisória (masculina). Para crianças pequenas o ideal é uma voz só. Por isso há três caminhos abaixo.

## Três caminhos (pode combinar)
1. **Voz da família (já implementado, grátis, a melhor):** Área da Família → **Grave a sua voz**. Grave as 25 falas mais ouvidas (Oi, Muito bem, Parabéns, cores, animais, mamãe, papai…). A gravação passa na frente do MP3 do app, fica só no aparelho e não entra no backup. Funciona no navegador; **no aplicativo Android ainda não** (precisa da permissão de microfone no app, decisão pendente).
2. **Voltar a uma voz só quando houver créditos:** gerar as 141 com a Dora (≈ 1.500 caracteres no total, uma fração do plano gratuito mensal), copiar por cima dos arquivos listados em `voz-provisoria.json`, rodar `npm run audio:compress` e esvaziar o manifesto.
3. **Trocar a voz provisória por outra:** rodar de novo o gerador com outro modelo (ex.: `pt_BR-cadu-medium`) ou outro serviço (tabela abaixo).

## Como gerar/regerar com o Piper
```bash
python3 -m venv .venv-tts && .venv-tts/bin/pip install piper-tts
# baixe o .onnx e o .onnx.json em huggingface.co/rhasspy/piper-voices/tree/main/pt/pt_BR/<voz>/medium
npm run audio:coverage                      # lista o que falta
.venv-tts/bin/python scripts/generate-voice-piper.py --model caminho/pt_BR-faber-medium.onnx
npm run audit:audio && npm run build        # confere e refaz o índice
```
O script só gera o que **não existe** (nunca sobrescreve a Dora), normaliza o volume, corta silêncio das pontas e grava mono 64 kbps. `--dry` mostra o que faria; `--only a.mp3,b.mp3` limita.
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
| **Piper (atual)** | Grátis, offline, sem limite, licença livre | Voz sintética, só masculina em pt-BR |

**Regra de ouro:** uma voz só por faixa etária.

## Licenças
- Dados de treino das vozes pt-BR do Piper (faber, cadu): **CC0**.
- O programa Piper é GPL-3.0; os áudios gerados não herdam a licença do programa.
- ElevenLabs: confira se o plano permite uso comercial dentro de app antes de publicar em loja.
