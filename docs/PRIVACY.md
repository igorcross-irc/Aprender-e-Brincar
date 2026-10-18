# Privacidade — Aprender & Brincar

O Aprender & Brincar é uma aplicação pública para crianças de 6 meses a 5 anos. Por isso, foi desenhado para coletar o mínimo possível, seguindo o princípio do melhor interesse da criança (LGPD, art. 14).

## O que é guardado
- Nome ou apelido da criança (opcional) e faixa etária, informados pelo responsável.
- Progresso das brincadeiras (estrelas, brincadeiras concluídas, tempo aproximado).
- **Voz da família (opcional):** se um responsável gravar a narração de uma história, o áudio fica no IndexedDB do aparelho. O microfone só é pedido na Área da Família, quando o adulto toca em Gravar, e só enquanto a gravação dura. As gravações nunca são enviadas e podem ser apagadas página a página.
- **Diário da Família:** é montado na hora, só com o que já está guardado no aparelho, e aparece apenas na Área da Família. O botão "Copiar o resumo" copia o texto para a área de transferência do aparelho quando o adulto toca nele.

Tudo fica **apenas no armazenamento local do navegador do aparelho** (`localStorage`/`sessionStorage`). Nada é enviado a servidores.

## O que não existe
- Cadastro, login ou e-mail.
- Anúncios, rastreadores, analytics ou cookies de terceiros.
- Recursos de rede social, chat ou compras.
- Chamadas a serviços externos: fontes, áudios e imagens são servidos pelo próprio app.

## Controle do responsável
- A Área da Família fica protegida por uma verificação para adultos.
- "Zerar progresso" apaga o histórico; limpar os dados do site no navegador remove tudo.

## Regras para novas funcionalidades
Qualquer mudança que envie dados para fora do aparelho (sincronização, analytics, contas) precisa de consentimento específico e destacado de um dos pais ou responsável, revisão deste documento e aviso claro na Área da Família antes de ser publicada.
