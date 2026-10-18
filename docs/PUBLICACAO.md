# Publicação: o que falta para colocar nas lojas

Este guia junta o que as lojas costumam exigir de apps para crianças e o que o app já cumpre. As regras das lojas mudam: **confira cada item na página oficial da Google Play e da App Store no dia de publicar** e peça a um profissional de direito digital que revise a política de privacidade (LGPD e ECA Digital). Nada aqui é parecer jurídico.

## O que o app já cumpre
| Tema | Situação |
|---|---|
| Anúncios e rastreadores de terceiros | Nenhum. Sem SDK de anúncios, de análise de uso ou de login. |
| Dados pessoais | Só neste aparelho (nome ou apelido opcional, idade, progresso, galeria e gravações de voz). Nada sai do aparelho. |
| Política de privacidade pública | `public/privacidade.html` (o endereço fica `/privacidade.html` do site do app). |
| Área para adultos | Atrás de uma conta de multiplicar; tempo de tela, apagar progresso, gravações e galeria ficam lá. |
| Conteúdo | Sem chat, rede social, compras ou links para fora na tela da criança. |
| Microfone e fotos | O microfone só é pedido dentro da Área da Família, ao tocar em Gravar. Fotos são escolhidas ou tiradas pelo adulto, também só ali. |
| Funciona sem internet | Sim (PWA e aplicativo Android). |

## Para fazer antes de publicar
### Os dois dependem da sua conta de desenvolvedor
1. **Google Play**
   - Criar a conta de desenvolvedor e o aplicativo em português.
   - Público-alvo: faixa de **5 anos ou menos**. Isso coloca o app na política para famílias (Families Policy); leia a lista de exigências antes de preencher.
   - Formulário de **Segurança dos dados**: coleta = nenhuma; compartilhamento = nenhum; a voz da família e a galeria ficam só no aparelho.
   - Classificação indicativa (questionário IARC): sem violência, sem compras, sem anúncios, sem interação com desconhecidos.
   - Enviar o pacote **assinado** (AAB). A chave de assinatura é sua e **não deve ser guardada no repositório**; veja `docs/ANDROID.md`.
2. **App Store (iPhone/iPad)**
   - Conta Apple Developer. O app hoje é um PWA; para a loja é preciso empacotar com Capacitor (o projeto já usa Capacitor no Android).
   - Categoria **Crianças** (Kids): exige faixa de idade, ausência de análise e anúncios de terceiros e uma verificação para adultos antes de links externos ou compras. Leia as regras atuais.
   - Aparelhos muito antigos (iOS 9, Android 5) continuam atendidos pela versão web e pelo modo lite, mesmo que a loja peça um sistema mais novo.

### Materiais
- Ícone e **capturas de tela** por tamanho de aparelho (use as capturas dos testes como base e refaça em aparelho real).
- Descrição curta e longa em português, sem promessas de tratamento ou de resultado escolar. Usar frases como "brincadeiras para crianças de 6 meses a 5 anos".
- Vídeo curto (opcional).

### Versão
- A versão segue **0.6.0** (`package.json`, `sw.js` e `native.json`). Subir para **0.7.0 só depois** do teste com criança e em aparelho de verdade, como combinado em `docs/PLANO_DE_INTEGRACAO.md`.

## Antes de apertar o botão
- [ ] Teste em pelo menos um Android modesto e um iPhone (ou iPad) que não seja novo.
- [ ] Ouvir as gravações da Dora e a voz da família num aparelho real.
- [ ] Revisão jurídica da política de privacidade e da descrição.
- [ ] `npm run audit:budget` e todos os `npm run test:*` verdes no CI.
- [ ] Pedir a uma pedagoga e a uma fonoaudióloga que leiam o conteúdo (revisão do material, não diagnóstico).

## Depois de publicar
- Sem rastreio no app, o retorno vem das lojas (notas e comentários) e de conversa com as famílias. Planejar uma forma simples de receber relatos (um endereço de e-mail na política).
- Atualizações de conteúdo entram pelo próprio app (ver "Atualizações" na Área da Família).
