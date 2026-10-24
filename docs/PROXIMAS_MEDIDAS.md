# Próximas medidas: sair do básico que qualquer lugar tem

Escrito em 18/10/2026 e atualizado no mesmo dia. Marcas: ✅ feito, ⏳ falta.

## O que já nos separa do comum
- **Sem anúncios, sem cadastro, sem rastreio**, e tudo guardado no aparelho (ver `docs/PRIVACY.md` e `/privacidade.html`).
- **6 jogos com mundo próprio** em vez de dezenas de minijogos soltos, cada um com versão leve para aparelho antigo.
- **Voz da família** nas histórias (feito) e **Diário da Família** com ideias para brincar fora da tela (feito).
- Tudo em português do Brasil, com voz.

O que ainda é comum: a lista de atividades antigas (81), a narração provisória, o menu em "mundos" e a falta de validação com criança real.

## Medidas, em ordem de valor

## Estado
- ✅ Leitura em dupla (perguntas para o adulto nas histórias) · ✅ Meu Livro e Galeria · ✅ Hora de dormir · ✅ Comunicação com foto e voz da família · ✅ Sentimentos (jogo novo) · ✅ Campos da BNCC no Diário · ✅ Orçamento de tamanho no CI (código principal 476 → 299 kB) · ✅ Guia de publicação (`docs/PUBLICACAO.md`)
- ✅ Parlendas e Gestos (folclore falado, sem precisar de ilustração nova)
- ✅ Que roupa eu visto? (tempo e clima; 2 a 5 anos)
- ✅ Rotina do Dia (escovar os dentes, banho e guardar brinquedos; 12 meses a 5 anos)
- ⏳ Teste em aparelho real e com criança · ⏳ Cantigas de roda cantadas e ilustradas (depende de créditos de imagem e de voz) · ⏳ Revisão de pedagoga e fonoaudióloga · ⏳ Revisão jurídica da política · ⏳ Conta de desenvolvedor nas lojas

### 1. Confiança e qualidade (sem isso o resto não vale)
1. **Teste em aparelho real e com criança.** Um Android modesto, um iPhone antigo e a sua filha. Anotar travadas, toques que a criança errou e o que ela pediu de novo. É a única forma de saber se a dificuldade por idade está certa.
2. **Selo de confiança público.** Uma página simples ("o que o app guarda, o que nunca faz") já existe (`public/privacidade.html`). Falta publicar o app com a política e seguir as regras de apps infantis da Google Play (Designed for Families) e da App Store (Kids), que exigem esse tipo de informação.
3. **Orçamento de desempenho.** Hoje o pacote principal passa de 900 kB e o teste que joga todas as atividades leva mais de 30 minutos. Dividir o pacote por jogo, medir o tempo de abertura em aparelho fraco e fixar um limite que o CI cobra.
4. **Acessibilidade de verdade.** Respeitar "reduzir movimento" em todos os jogos (já há em parte), alvos de toque grandes, uso com uma mão e contraste. Pedir revisão de uma pessoa com experiência em acessibilidade infantil.

### 2. O que ninguém tem igual (diferenciais)
1. **Leitura em dupla (leitura dialogada).** Em cada história, perguntas curtas para o adulto fazer ("O que será que vai acontecer?", "Você já viu um bicho assim?"). Estudos sobre leitura dialogada apontam ganho em linguagem. Os apps comuns entregam a história sozinha; o nosso pode convidar o adulto a brincar junto, e a voz da família já abre esse caminho.
2. **Meu Livro (impresso).** Juntar desenhos pintados, construções, pratos e a música, e gerar um PDF para a família imprimir como lembrança. É o que transforma o app de passatempo em memória.
3. **Folclore e cultura brasileira de verdade.** Cantigas de roda com gesto, Saci, Curupira, festas do ano (Festa Junina, Dia da Criança, Carnaval), personagens com tons de pele e famílias variadas. É identidade que os apps internacionais não têm.
4. **Rotinas e sono.** Modo noite (luz baixa, cantiga, história calma), canções para banho, escovar os dentes e guardar os brinquedos. Ajuda o dia a dia, não só a tela.
5. **Comunicação personalizada.** A prancha de comunicação já existe. Permitir fotos e a voz da família nos cartões a transforma em ferramenta para crianças com atraso de fala ou com autismo. Sem prometer tratamento, só apoio.
6. **Sentimentos.** O app quase não trabalha o eu e o outro (emoções, dividir, esperar a vez). Cenas e histórias sobre sentimentos fechariam essa lacuna.

### 3. Base pedagógica que dá credibilidade
- Mapear cada jogo aos **campos de experiência da BNCC da Educação Infantil** e à faixa de idade, e mostrar isso no Diário (sem notas, sem comparação).
- Pedir **revisão profissional** (pedagoga da primeira infância e fonoaudióloga) dos textos e da dificuldade. Revisão do material, não diagnóstico.
- Registrar no repositório as fontes usadas.

### 4. Sustentabilidade sem anúncios
Quando o app estiver publicado e medido, decidir entre pagamento único, assinatura familiar ou licença para escolas e clínicas (ver `docs/MONETIZACAO_E_ANUNCIOS.md`). Não abrir essa conversa antes de ter famílias usando.

## O que depende de você
- Aparelhos e criança para o teste (item 1.1).
- Créditos de imagem (19 histórias, mais cenas) e de voz (28 narrações).
- Escolher qual diferencial vem primeiro (2.1 a 2.6).
- Contas de desenvolvedor nas lojas, se quiser publicar.

## Minha sugestão de ordem
1. 1.1 e 1.3 (teste em aparelho e desempenho) — nada disso depende de crédito.
2. 2.1 (leitura em dupla) e 2.2 (Meu Livro): rápidos de fazer e fortes na hora de mostrar o app a outras famílias.
3. 2.3 (folclore) à medida que as ilustrações voltarem.
4. 1.2 quando for publicar.
