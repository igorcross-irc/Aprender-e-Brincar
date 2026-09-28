# Roadmap — Aprender & Brincar

## Fase 0 — Auditoria
Status: CONCLUÍDA nesta execução.
- mapear arquitetura, assets, jogos e pontos de risco;
- registrar o que é reutilizável;
- identificar lacunas de PWA, segurança, progressão e escalabilidade.

## Fase 1 — Fundação
Status: IMPLEMENTADA nesta execução.
- núcleo comum;
- catálogo de atividades;
- armazenamento de progresso;
- design/touch baseline;
- Tailwind compilado;
- CI de build.

## Fase 2 — Conteúdo
Status: FUNDAÇÃO IMPLEMENTADA.
- catálogo por idade;
- metadados de habilidades/dificuldade;
- mapeamento de jogos existentes;
- estrutura pronta para expansão sem reescrever o app.

## Fase 3 — Progresso local
Status: IMPLEMENTADA.
- estrelas preservadas;
- progresso por atividade;
- contadores de conclusão;
- preferências locais;
- schema versionado.

## Fase 4 — PWA/offline
Status: IMPLEMENTADA.
- service worker;
- app shell cache;
- cache runtime de assets e áudio;
- atualização por versão;
- registro automático.

## Fase 5 — Área dos pais
Status: BASE IMPLEMENTADA.
- barreira infantil mantida;
- nome sanitizado;
- configurações locais;
- reset de progresso;
- base para controles futuros.

## Próxima evolução
Migrar cada jogo para o Activity Registry, adicionar níveis por faixa etária, completar catálogo de 6 meses a 5 anos, criar testes E2E e somente então considerar sincronização/Android.
