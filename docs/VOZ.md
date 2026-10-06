# Voz: como completar as falas gravadas

**Situação (06/10/2026):** 88 de 244 falas têm MP3; **141 arquivos únicos** faltam (lista em [`AUDIO_COVERAGE.md`](AUDIO_COVERAGE.md)).
**Conta importante:** juntas, essas 141 falas somam **≈ 1.500 caracteres**. Com o ElevenLabs (1 crédito por caractere, ver [`FILA_DE_GERACAO.md`](FILA_DE_GERACAO.md)) isso custa **≈ 1.500 créditos, uma fração do plano gratuito mensal**. Não precisa esperar.
(O total de 14.658 créditos da fila é o banco de voz completo planejado para o futuro, não o que falta hoje.)

## Plano recomendado
1. **Agora:** gerar as 141 falas faltantes com a voz **Dora** (a mesma já usada nas 88 existentes, para a voz não mudar no meio da brincadeira). Salvar em `public/assets/audio/<arquivo>.mp3`, rodar `npm run audio:compress` e `npm run build`.
2. **Enquanto uma fala não existe:** o app usa a voz do aparelho; se o aparelho não tem voz em português, mostra a fala escrita em destaque (legenda). Nunca fica mudo.
3. **Sempre que criar conteúdo novo:** `npm run audio:coverage` mostra o que falta; gerar junto com o conteúdo.
4. **Licença:** confira se o plano usado permite uso comercial/distribuição do áudio dentro do app antes de publicar em loja.

## Alternativas ao ElevenLabs (confirme preços e termos atuais)
| Opção | Prós | Contras |
| --- | --- | --- |
| **Voz da família** (mãe, pai, avós, a própria Isadora para palavras curtas) | A mais afetiva; custo zero; a criança reconhece | Dá trabalho gravar; qualidade depende do microfone. Boa para as 20–30 falas mais ouvidas |
| **Google Cloud Text-to-Speech** (vozes pt-BR Chirp/Neural2) | Barato, boa qualidade, cota gratuita mensal | Menos expressivo para criança que o ElevenLabs |
| **Microsoft Azure Neural TTS** (pt-BR Francisca, Thalita) | Muito natural, SSML (velocidade/entonação), cota gratuita | Configuração de conta |
| **Amazon Polly** (pt-BR Camila, Vitória) | Barato, simples | Vozes menos calorosas |
| **OpenAI TTS** | Aceita instruções de estilo ("fale como professora de educação infantil, animada") | Consistência entre falas varia; gerar tudo na mesma sessão |
| **Piper (código aberto, offline)** | Grátis, roda no seu computador, sem limites | Qualidade de "voz de robô agradável"; ok como reserva |

**Regra de ouro:** uma voz só por faixa etária. Misturar vozes confunde os menores.

## Próximo passo de produto (não implementado)
**"Grave a sua voz":** na Área da Família o responsável grava as falas mais ouvidas (MediaRecorder, guardado no próprio aparelho) e elas passam na frente das demais. É o jeito mais pessoal de resolver a voz e não gasta crédito nenhum.
