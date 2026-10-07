# Playbook: trocar a voz provisória pela Dora (ElevenLabs)

> **Para o Claude numa sessão futura:** quando o responsável disser que **há créditos no ElevenLabs** (ou pedir "gere as falas"), siga este roteiro. Quem gerencia a gravação é você; o responsável só informa o saldo e ouve o resultado.
> Contexto: as 141 falas provisórias (Kokoro, voz feminina) são um paliativo e o responsável não as considera tão boas quanto a Dora. Ver `docs/VOZ.md`.

## Dados fixos
| Item | Valor |
| --- | --- |
| Voz | **Dora - Contando histórias** — `voice_id` `OARkYvAPkwW2xOP8T9FE` (vinda de `docs/FILA_DE_GERACAO.md`; **confirme** com `creative_list_voices` pesquisando "Dora" antes de gastar crédito) |
| Modelo | `eleven_multilingual_v2` |
| Variações | **`generations_count: 1`** (o padrão da ferramenta é 4 e cobraria 4×) |
| Custo | 1 crédito por caractere do texto |
| Entrada | `docs/falas-para-elevenlabs.csv` (arquivo, texto, créditos) e `docs/FILA_PROVISORIAS.md` |
| Saída | MP3 salvos numa pasta temporária, depois `npm run voice:import` |
| Ferramentas MCP | `mcp__ElevenLabs__creative_list_voices`, `…creative_generate_speech`, `…creative_get_flow_run_status` (podem estar "deferred": carregue com ToolSearch `select:`) |

## Passo a passo
1. **Saldo e lote.** Pergunte quantos créditos há. Rode `npm run voice:status -- --credits <saldo>`: lista o lote que cabe (mais ouvidas por crédito primeiro). Prefira **terminar brincadeiras inteiras** (a fila mostra quais) para a criança não ouvir duas vozes no mesmo jogo.
2. **Confirmar a voz.** `creative_list_voices` com `search: "Dora"`, `languages: ["pt"]`. Se o id mudou ou não aparece, **pare e pergunte** ao responsável.
3. **Estimar antes de gastar.** Para o lote: `creative_generate_speech` com `estimate_only: true` em uma fala e confira se o custo ≈ nº de caracteres. Mostre o total ao responsável e **espere o OK** quando o lote passar de ~500 créditos.
4. **Gerar, uma fala por chamada.** `prompt` = texto exato da coluna "texto" (com a pontuação do CSV), `model_id: eleven_multilingual_v2`, `voice_id` da Dora, `generations_count: 1`, `context` curto ("falas do app infantil Aprender & Brincar"). Anote `flow_id` e `session_ids`.
   - **Nunca repita a chamada de geração para "tentar de novo":** cada chamada cobra de novo. Se falhar, olhe o status primeiro.
   - Dá para reaproveitar o mesmo `flow_id` nas falas do lote.
5. **Esperar.** `creative_get_flow_run_status` com `flow_id` + `session_ids`, respeitando `poll_after_seconds`, até `all_completed` ou `has_failures`.
6. **Baixar o áudio.** ⚠️ **Passo ainda não validado nesta base.** O status devolve as gerações; procure nele a URL/identificador do MP3 e baixe com `curl` (a internet sai por proxy; ver `/root/.ccr/README.md`) para `~/dora-lote-N/<arquivo>.mp3`, usando **exatamente** o nome da coluna "arquivo". Se o status não trouxer link baixável, peça ao responsável para baixar do canvas (a ferramenta devolve uma `url`) e enviar os arquivos; o importador aceita nomes que contenham o texto.
   - Na **primeira vez**, registre aqui em "Registro de execuções" o que funcionou.
7. **Importar.** `npm run voice:import -- ~/dora-lote-N --dry` (confere), depois sem `--dry`. Ele corta silêncio das pontas, nivela o volume (≈ -16 LUFS), grava mono 64 kbps e tira a fala do manifesto.
8. **Conferir.** `npm run audit:audio && npm run voice:status && npm run test:unit && npm run build`. Para ter certeza de que nada quebrou: `node scripts/e2e-test.mjs`.
9. **Pedir para ouvir.** Publique/atualize a página de escuta (artefato "Vozes do App": gere de novo com `build_page` descrito em "Página de escuta" abaixo) ou peça para testar no app. Se uma fala não ficou boa, regere **só aquela** (nova cobrança) e importe de novo.
10. **Registrar e enviar.** Atualize `docs/CHANGELOG.md` (quantas falas trocadas, créditos usados), commit na branch de trabalho e `git push`. **Não abra pull request** sem o responsável pedir.

## Quando criar conteúdo novo
1. Rode `npm run audio:coverage`; o que faltar entra na fila.
2. Sem créditos: gere a provisória (`scripts/generate-voice.py`, ver `docs/VOZ.md`) para o app nunca ficar mudo.
3. Com créditos: gere direto na Dora (passos acima) e nem precisa da provisória.

## Falas com palavra variável (ainda sem MP3)
Frases montadas no código (ex.: "Onde está o gato?", "Encontre a cor azul") **não entram** no `audio:coverage` (ele ignora textos com `${}`) e hoje usam a voz do navegador ou a legenda. O banco completo planejado está em `docs/FILA_DE_GERACAO.md` (gerado por `node scripts/generation-queue.mjs`; 784 falas, ≈ 14.658 créditos) e `scripts/voice-bank-future.mjs`. Prioridade sugerida depois das provisórias: perguntas "Onde está …?" das brincadeiras de 2–3 anos.

## Página de escuta (para o responsável ouvir no celular)
Foi um artefato HTML com as falas embutidas (base64) e 👍/👎. Para refazer: gere o HTML a partir de `docs/voz-provisoria.json` + algumas falas da Dora para comparação, carregue as dicas de design do `Artifact` (quickstart `other`) e publique. A versão anterior: https://claude.ai/artifact/FcTQn37RmBUc2tMCHVtyQC (republicar o mesmo arquivo mantém o link).

## Regras do responsável (não esquecer)
- Voz **feminina**; nada de voz masculina.
- Uma voz só por brincadeira sempre que possível.
- Gastar créditos só com o OK dele quando for um lote grande.
- Sem pull request nem HawkScan por enquanto.

## Registro de execuções
| Data | Lote | Créditos | Como o MP3 foi baixado | Observações |
| --- | --- | --- | --- | --- |
| (nenhuma ainda) | | | | |
