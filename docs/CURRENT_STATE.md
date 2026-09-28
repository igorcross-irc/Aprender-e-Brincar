# Aprender & Brincar — CURRENT STATE

## Estado desta execução
A base existente foi preservada e está sendo evoluída para uma arquitetura por núcleo. O app já possui Vite, módulos ES, jogos separados, áudio resiliente, armazenamento local, manifesto e catálogo de vocabulário.

## Reaproveitado
- ResilientAudioEngine com MP3 + fallback pt-BR.
- MemoryGame, CardsGame, CanvasGame, PuzzleGame e BalloonPopGame.
- Catálogo vocabulary.js.
- Assets PNG e biblioteca de MP3 existentes.
- Vite e deploy compatível com Vercel.

## Fundação adicionada nas fases 0–5
- documentação de fonte de verdade;
- núcleo de atividades e faixas etárias;
- progresso local estruturado;
- proteção de conteúdo inserido no DOM;
- PWA com service worker e cache runtime;
- Tailwind compilado pelo build, sem CDN;
- acessibilidade/touch baseline;
- smoke checks e CI de build;
- área dos pais preparada para evoluir sem expor dados em rede.

## Pendências deliberadas
- Migração completa de todos os jogos para TypeScript.
- Backend/sincronização entre dispositivos.
- App Android nativo.
- Catálogo completo 6 meses–5 anos.
- Testes E2E em navegador real.

Essas pendências não justificam apagar os jogos atuais: eles continuam sendo conteúdo funcional e devem ser migrados gradualmente.
