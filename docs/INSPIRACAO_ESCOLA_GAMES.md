# Inspiração: Escola Games (escolagames.com.br)

Análise feita em 06/10/2026 lendo as páginas públicas: início, Recursos Educacionais, Quem somos, Dúvidas frequentes e a página do jogo "Cola Sílabas".
**Limite da análise:** li o texto e a estrutura das páginas; **não joguei** os jogos (rodam embutidos). Observações de jogabilidade e feedback ficam de fora porque não vi.

## O que o Escola Games é
- Plataforma gratuita (com "Conta Free", sugerindo um plano pago) de **jogos, livros infantis e músicas** alinhados à **BNCC**, para o **Ensino Fundamental (1º ao 5º ano, ≈ 6–10 anos)** e para professores e famílias.
- Navegação por **ano escolar** e **componente curricular** (Português, Matemática, Ciências, Arte…) e por **tema** (Carnaval, Festa Junina, Mês da Criança…).
- Cada jogo tem uma página com **habilidades da BNCC citadas por código** (ex.: EF01LP02), ficha pedagógica, **tela cheia**, **compartilhar** (WhatsApp, Google Classroom, Facebook), **favoritos** e **dashboard** do usuário.
- Catálogo: ≈ 12 livros infantis, ≈ 12 músicas originais, jogos da memória temáticos (frutas, Páscoa, Natal, transportes, brinquedos), quebra-cabeças, jogos de plataforma simples, caça-palavras, quizzes.
- Complementos para o professor: **planos de aula**, **blog educativo**, versão em inglês (Best School Games).
- **Só funciona online** (a FAQ diz que as atividades exigem internet e não podem ser baixadas). A FAQ não fala de privacidade.

## Onde somos diferentes (e melhores para a Isadora)
| | Escola Games | Aprender & Brincar |
| --- | --- | --- |
| Idade | 6–10 anos | **6 meses a 5 anos** (a página que consultei não cita Educação Infantil) |
| Internet | Obrigatória | **Funciona sem internet** (testado de verdade) |
| Conta/dados | Conta e dashboard | **Sem conta; tudo no aparelho** |
| Leitura | Pressupõe leitura | **Voz primeiro; não precisa ler** |
| Tempo de tela | Não vi controle | **Limite por idade já ligado** |

## O que aproveitamos (já implementado)
1. **Ligação com a BNCC.** Eles citam códigos por jogo. Para 0–5 anos o currículo é por **campos de experiência**; a Área da Família agora mostra "onde mais brincou" por campo, com a ressalva de que não é avaliação (`src/core/bncc.js`).
2. **Favoritos.** A criança toca em ❤️ no fim da brincadeira e ganha um atalho "Favoritos" na tela inicial (`src/core/favorites.js`).
3. **Datas especiais.** "Mês da Criança" (outubro), Festa Junina e Natal enfeitam a tela inicial e a saudação (`src/core/seasons.js`).
4. **Destaque na tela inicial.** O botão "Brincar agora" sugere a próxima brincadeira pelo motor adaptativo, no papel dos carrosséis deles.
5. **Fichas para imprimir** (equivalente dos planos de aula/fichas pedagógicas): contar, ligar iguais, sequência e pintar, ajustadas à idade; mais ideias de brincar junto, longe da tela.
6. **Mais histórias** (de 3 para 8), no espírito da seção de livros: banho, festa, dormir, sítio e barco.

## O que NÃO copiamos, de propósito
- **Conta, dashboard e compartilhamento em redes sociais:** contradizem a regra de privacidade para crianças (LGPD, art. 14) e a promessa "sem cadastro".
- **Catálogo grande de jogos soltos:** nossa regra é motores reutilizáveis com conteúdo variado, não centenas de jogos isolados.
- **Dependência de leitura:** a maioria dos jogos deles exige ler; os nossos não podem.

## Próximas ideias inspiradas neles (por ordem de valor)
1. **Músicas:** cantigas tradicionais (domínio público) com gestos e o "Piano dos animais"; precisa de gravação/voz (ver [`VOZ.md`](VOZ.md)) e atenção a direitos de gravações existentes.
2. **Livrinhos ilustrados:** transformar "Hora da História" em livros de 6–8 páginas narrados, com virar de página por toque.
3. **Jogos da memória temáticos** sazonais (frutas, transportes, Natal) usando o motor de memória que já existe: só conteúdo.
4. **Plano de brincadeira da semana** para os pais (3 brincadeiras + 1 atividade fora da tela), gerado pelo motor adaptativo, sem conta.
5. **Código da habilidade por brincadeira** (EI01/EI02/EI03 da BNCC) na Área da Família, com revisão de uma pedagoga.
