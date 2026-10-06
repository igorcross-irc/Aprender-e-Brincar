# Segurança — como deixar a atualização e o release blindados

> Realidade: nenhum sistema é "100% blindado". O objetivo é que **ninguém consiga colocar código num aparelho de criança sem a sua chave** e que um erro seu não vá para o ar sem teste.

## Ameaça principal
O app Android baixa um zip do release do GitHub e roda como código do app. Antes, a única proteção era o sha256 publicado **no mesmo release**: quem controlasse o release (conta ou token do GitHub comprometidos) podia trocar o zip e o sha256 juntos.

## O que já foi feito
- **Release só publica com testes verdes** (`release.yml`: unitários, núcleo, auditorias, build, E2E e auditoria de aparelhos antigos).
- **Sem soma de verificação não baixa:** o app recusa um release sem `sha256`.
- **Android:** `allowBackup="false"` (nome e progresso da criança não vão para backup na nuvem do Google) e `usesCleartextTraffic="false"` (só HTTPS).
- **Privacidade:** `PRIVACY.md` documenta a única chamada externa (consulta de versão ao GitHub).
- **Dependabot** semanal para dependências e para as ações do GitHub; **CODEOWNERS** exige o dono nas mudanças de workflow, Android e atualização.

## Assinatura do pacote de conteúdo (falta ligar — precisa da sua chave)
O plugin de atualização (Capgo) suporta criptografia/assinatura de ponta a ponta: o pacote é cifrado com uma chave **privada que só você tem** e o app só aceita o que bate com a **chave pública** embutida nele. Mesmo com o GitHub inteiro comprometido, sem a chave privada ninguém publica atualização válida.

Passos (uma vez):
1. No seu computador: `npx @capgo/cli key create` → gera um par de chaves. **Guarde a privada fora do repositório** (gerenciador de senhas + cópia offline).
2. GitHub → Settings → Secrets → crie `CAPGO_PRIVATE_KEY` com a chave privada.
3. Coloque a chave pública em `capacitor.config.json` → `plugins.CapacitorUpdater.publicKey`.
4. Rode o release **por uma branch de teste** (Actions → Release → Run workflow): fora da `main` ele só guarda os arquivos como artefato. Confira que `update.json` traz `web.signed: true` e `web.sessionKey`.
5. Gere o APK novo (a chave pública muda a parte nativa → o fingerprint muda → instale o APK uma vez nos aparelhos) e teste a atualização num aparelho real.

⚠️ O passo de assinatura em `release.yml` foi escrito segundo a documentação do Capgo mas **não foi executado**: os argumentos exatos do CLI podem precisar de ajuste no passo 4. Por isso ele só roda se o segredo existir; sem o segredo o release continua funcionando como antes. **Não ligue a chave pública (passo 3) antes de o passo 4 dar certo**, ou os aparelhos passam a recusar atualizações sem assinatura.

## Proteja a conta e o repositório (Settings do GitHub)
- Ative **autenticação em dois fatores** (de preferência chave de segurança/passkey).
- Branch `main`: exigir pull request, exigir o check "Build & Test", bloquear push forçado.
- Em Actions: permissão padrão do token = somente leitura (o release já pede `contents: write` só onde precisa).
- Ative **secret scanning** e **push protection**.
- Guarde a **keystore do Android** (`ANDROID_KEYSTORE_BASE64`) também em cópia offline: sem ela não há como assinar atualizações do APK.

## Outras camadas (futuras)
- Publicar na **Google Play** (Play App Signing + política "Families") dá revisão, assinatura gerenciada e atualização pela loja.
- `npm audit` no CI e fixar versões das ações por hash.
- Política de Content-Security-Policy no `index.html` do site.
