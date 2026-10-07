# Aprender & Brincar 🦉

Aplicativo de brincadeiras educativas para crianças de **6 meses a 5 anos**, feito para a Isadora e para outras crianças. Funciona no navegador (PWA, inclusive sem internet), em aparelhos antigos (iPad com iOS 9, Android 5) e como aplicativo Android com **modo criança** (tela fixada, sem botão Voltar).

- **Sem anúncios, sem cadastro, sem rastreamento.** Tudo fica só no aparelho. Detalhes em [`docs/PRIVACY.md`](docs/PRIVACY.md).
- **Voz primeiro:** a criança não precisa saber ler. Toda instrução é falada.
- **Feito para ajudar os pais:** limite de tempo pela idade já vem ligado, sem configuração.

## O que existe hoje

| Para a criança | Para os pais (Área da Família, atrás de uma conta de multiplicar) |
| --- | --- |
| 7 mundos: Descobrir, Falar & Comunicar, Cores & Formas, Animais & Sons, Números & Lógica, Memória & Atenção, Criar & Mexer | Perfil (nome e idade) e limite de tempo por dia (padrão por idade) |
| 49 brincadeiras (ver [catálogo](src/content/activity-catalog.js)) nas 6 faixas: 6–12 m, 12–18 m, 18–24 m, 2–3, 3–4, 4–5 anos | Resumo e histórico; "onde mais brincou" por **campo de experiência da BNCC** |
| Botão **Brincar agora** com sugestão do dia (motor adaptativo) | Ideias para brincar junto, longe da tela, e **fichas para imprimir** |
| ❤️ **Favoritos** e álbum de adesivos | **Backup** do progresso por código/arquivo e proteção contra o navegador apagar os dados |
| Datas especiais (Mês da Criança, Festa Junina, Natal) | **Baixar para usar sem internet** (≈ 4 MB) |
| **Perfis para irmãos:** cada criança com as próprias estrelas, progresso, idade, favoritos e tempo de tela; "Quem vai brincar?" ao abrir o app | **Crianças** na Área da Família: adicionar, trocar e apagar (até 6) |
| Estrelas, confete e comemoração sem competição | **Grave a sua voz** (a voz da família passa na frente das do app), **idade que avança sozinha** pelo mês de nascimento |
| Voz em **todas** as 244 falas (88 Dora + 141 provisórias femininas, ver `docs/VOZ.md`) | Modo criança (tela cheia, travas), instalação, atualizações |

### Como o app protege a criança e ajuda a família
- **Tempo de tela:** padrão por idade (10 min até 18 meses, 15 min até 2 anos, 30 min aos 2–3, 40 min aos 3–4, 45 min aos 4–5), baseado na recomendação da Sociedade Brasileira de Pediatria e da OMS. O responsável é avisado já na primeira abertura e pode mudar ou desligar (com confirmação).
- **Portão para adultos:** multiplicação de números altos; 3 erros seguidos bloqueiam por 30 s, depois 1 min, 2 min… até 10 min.
- **Voz:** todas as falas têm MP3. Se algum dia faltar um e o aparelho não tiver voz em português, a fala aparece escrita em destaque.
- **Não é avaliação.** O resumo conta quantas vezes a criança brincou em cada campo; não mede nem diagnostica. Dúvidas sobre desenvolvimento são com o pediatra.

## Como rodar

```bash
npm ci
npm start                # servidor de desenvolvimento (Vite)
npm run build            # gera dist/ (site + versão para aparelhos antigos)
npm run preview          # serve o build
```

### Testes (rode antes de publicar)
| Comando | O que faz |
| --- | --- |
| `npm run test:unit` | Testes unitários do núcleo (`tests/`, `node --test`): portão, backup, limite de tempo, BNCC, favoritos, fichas, integridade do conteúdo |
| `npm run test:core` / `smoke` / `audit:*` | Contratos de núcleo, fundação, jogos, interface infantil e áudio |
| `npm run test:e2e` | Abre **todas** as brincadeiras em todas as idades no Chromium, joga os fluxos e testa Área da Família, backup, modo criança e **uso sem internet de verdade** |
| `npm run audit:legacy` | Simula iPad com iOS 9 / Android 5 (sem Pointer Events, sem grid, sem WebP) |
| `npm run test:play-all` | Robô que joga tudo até o fim (≈ 25 min). Rode antes de uma versão grande |
| `npm run audio:coverage` | Lista as falas que ainda não têm MP3 ([`docs/AUDIO_COVERAGE.md`](docs/AUDIO_COVERAGE.md)) |
| `npm run voice:status` / `voice:import` | Troca gradual da voz provisória pela Dora: fila por prioridade e importação padronizada dos MP3 novos |
| `npm run audit:audio` | Confere que todo MP3 é válido, leve (≤ 96 kbps, ≤ 8 MB no total) e que o índice do build está em dia |
| `npm run audio:compress` | Recodifica MP3 para mono 64 kbps (voz; 9,3 MB → 3,1 MB) |

O CI ([`build.yml`](.github/workflows/build.yml)) roda tudo isso a cada push. O release ([`release.yml`](.github/workflows/release.yml)) **só publica se os testes passarem**.

## Estrutura

```
src/
  core/        regras puras e testáveis: progresso, tempo de tela, portão, backup, BNCC,
               favoritos, fichas, motor adaptativo, política por idade, atualização do app
  content/     catálogo de brincadeiras, mundos, conteúdo, recompensas, índices gerados
  js/          app, telas (ui/), controlador, motores de jogo (games/), áudio (engine/)
  legacy/      adaptações para aparelhos antigos (emoji em imagem, toque, CSS)
public/        service worker, manifest, áudio (MP3), imagens
android/       projeto nativo (Capacitor): trava do modo criança, informações do app
scripts/       testes, auditorias e ferramentas de conteúdo
tests/         testes unitários
docs/          documentação (ver abaixo)
```

## Android e atualizações
O app Android é o mesmo site empacotado com o Capacitor ([`docs/ANDROID.md`](docs/ANDROID.md)). Conteúdo novo chega sozinho pelos releases do GitHub; mudanças nativas pedem um APK novo. A segurança desse caminho está em [`docs/SEGURANCA.md`](docs/SEGURANCA.md).

## Documentação
| Arquivo | Assunto |
| --- | --- |
| [`docs/CURRENT_STATE.md`](docs/CURRENT_STATE.md) | Estado atual e arquitetura |
| [`docs/CHANGELOG.md`](docs/CHANGELOG.md) | Tudo que já foi feito, por data |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Fases e próximos passos |
| [`docs/VOZ.md`](docs/VOZ.md) | Vozes do app: Dora, provisória feminina (Kokoro), voz da família e alternativas |
| [`docs/SEGURANCA.md`](docs/SEGURANCA.md) | Atualizações assinadas, release, repositório |
| [`docs/INSPIRACAO_ESCOLA_GAMES.md`](docs/INSPIRACAO_ESCOLA_GAMES.md) | Análise do Escola Games e o que aproveitamos |
| [`docs/PRIVACY.md`](docs/PRIVACY.md) | Privacidade (LGPD, art. 14) |
| [`docs/AUDIO_COVERAGE.md`](docs/AUDIO_COVERAGE.md) | Falas sem gravação |
| [`docs/APARELHOS_ANTIGOS.md`](docs/APARELHOS_ANTIGOS.md) | iOS 9 / Android 5 |

## Histórico em uma página
1. **Fundação e reengenharia** (fases 0–6): PWA, catálogo, motor adaptativo, política por idade.
2. **Universo navegável** (fase 7) e **identidade infantil** (fases 1–2 do visual): mundos, corujinha, fonte Nunito, sons sintetizados.
3. **Brincadeiras profundas** (fase 3): bolhas, contar tocando, piano, prancha "Eu quero…", álbum de adesivos, esconde-esconde, separar por cor, rimas, som inicial, história em sequência.
4. **Família e qualidade** (fase 4): tempo de tela, relatório, robô `play-all`, E2E, cobertura de áudio.
5. **Modo criança, aparelhos antigos, Android e atualização automática.**
6. **Voz sem créditos, idade automática e gravação da voz da família** (mesmo dia).
7. **Voz feminina provisória, gravação da voz da família no Android e perfis para irmãos.**
8. **Revisão crítica de 06/10/2026** e correções: limite padrão por idade, portão com bloqueio, relatório honesto pela BNCC, backup, uso offline de verdade, áudio 3× mais leve, release com testes, conteúdo ampliado, favoritos, fichas para imprimir, datas especiais e este README.

Limite clínico: as experiências são educativas e lúdicas. Não fazem diagnóstico, triagem ou promessa de tratamento.
