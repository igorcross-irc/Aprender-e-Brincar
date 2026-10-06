# Privacidade — Aprender & Brincar

O Aprender & Brincar é uma aplicação pública para crianças de 6 meses a 5 anos. Por isso, foi desenhado para coletar o mínimo possível, seguindo o princípio do melhor interesse da criança (LGPD, art. 14).

## O que é guardado
- Nome ou apelido da criança (opcional), faixa etária e, se o responsável quiser, **mês e ano de nascimento** (para a faixa avançar sozinha), informados pelo responsável.
- Se o responsável usar **Grave a sua voz**: gravações curtas (até 6 s) da voz dele, no IndexedDB do aparelho. O microfone só liga enquanto ele grava, a gravação nunca sai do aparelho e não entra no backup. Dá para apagar uma a uma.
- Progresso das brincadeiras (estrelas, brincadeiras concluídas, tempo aproximado).

Tudo fica **apenas no armazenamento local do navegador do aparelho** (`localStorage`/`sessionStorage`). Nada é enviado a servidores.

## O que não existe
- Cadastro, login ou e-mail.
- Anúncios, rastreadores, analytics ou cookies de terceiros.
- Recursos de rede social, chat ou compras.
- Chamadas a serviços externos no site/PWA: nenhuma. Fontes, áudios e imagens são servidos pelo próprio app.
- **Exceção, só no aplicativo Android:** a cada 6 horas ele consulta a lista pública de versões no GitHub (`api.github.com`) para saber se há atualização. Nenhum dado da criança ou do aparelho é enviado; como em qualquer acesso à internet, o GitHub vê o endereço IP e o tipo de aplicativo. Para evitar, use o aparelho sem internet ou o site (PWA).

## Backup
O backup é um código de texto gerado na Área da Família. Ele só sai do aparelho se o responsável copiar ou baixar; o app não envia nada sozinho.

## Controle do responsável
- A Área da Família fica protegida por uma verificação para adultos.
- "Zerar progresso" apaga o histórico; limpar os dados do site no navegador remove tudo.

## Regras para novas funcionalidades
Qualquer mudança que envie dados para fora do aparelho (sincronização, analytics, contas) precisa de consentimento específico e destacado de um dos pais ou responsável, revisão deste documento e aviso claro na Área da Família antes de ser publicada.
