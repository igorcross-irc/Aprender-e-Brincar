# Aprender & Brincar — Documento Mestre

## Visão
Aplicativo infantil web/PWA para crianças de 6 meses a 5 anos, com experiências de descoberta, brincadeira, aprendizagem e estímulo do desenvolvimento.

## Princípios
- Criança no centro: interfaces grandes, simples, alegres e seguras.
- Local-first e privacidade por padrão.
- Zero publicidade e sem perfil comportamental infantil.
- Atividades não precisam ter pontuação.
- Jogos podem ter desafio e recompensa, mas não são a única forma de aprendizagem.
- Idade define complexidade, não apenas velocidade.
- Reaproveitar conteúdo e áudio antes de criar novos assets.
- Nenhum conteúdo clínico deve se apresentar como diagnóstico ou tratamento.
- Novas locuções serão acumuladas em uma fila única e gravadas em lote quando o catálogo estiver maduro.

## Universo de desenvolvimento
O produto passa a considerar, de forma lúdica:
- comunicação e linguagem;
- fala e consciência fonológica;
- audição e atenção auditiva;
- cognição e memória;
- funções executivas iniciais;
- percepção visual;
- motricidade fina;
- motricidade ampla;
- criatividade;
- interação e comunicação funcional;
- pré-alfabetização;
- matemática inicial.

## Fonoaudiologia como referência
A Fonoaudiologia serve como referência para organização de experiências de estímulo. O aplicativo não substitui avaliação profissional, não diagnostica e não promete tratar alterações de fala, linguagem, audição ou desenvolvimento.

## Faixas
6–12m, 12–18m, 18–24m, 2–3y, 3–4y e 4–5y.

## Conteúdo existente
Os 329 áudios existentes são patrimônio do projeto e devem ser reaproveitados sempre que semanticamente adequados. Arquivos não devem ser renomeados sem necessidade.

## Arquitetura
CORE → catálogo → motores de experiência → interface → PWA. O catálogo central declara idade, domínio, habilidade, dificuldade e necessidades de áudio.

## Locuções
Quando o catálogo estiver consolidado, gerar uma lista única de todas as locuções necessárias, eliminando duplicidades e retirando tudo o que já existir nos 329 áudios.