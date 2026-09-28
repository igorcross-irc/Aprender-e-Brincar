# Arquitetura 1.0 — Aprender & Brincar

APRENDER & BRINCAR
- CORE: AppCore, ActivityRegistry, ProgressStore, AudioEngine, Storage
- CONTENT: activity-catalog.js, vocabulary.js
- GAMES: Cards, Memory, Puzzle, Canvas, Balloon Pop
- PARENT: settings + child gate
- ASSETS: images + audio
- PLATFORM: Vite, PWA/Service Worker, Vercel

## Activity x Game
Uma atividade não precisa ter pontuação. Um jogo pode ter regras, desafio e recompensa. O catálogo suporta ambos os tipos para evitar que experiências de bebê sejam forçadas a seguir o modelo de jogo.

## Contrato de atividade
Cada atividade deve possuir id, title, type, ages, category, difficulty e skills. Recursos opcionais incluem áudio, offline, duração e modo de interação.

## Migração incremental
Os jogos atuais continuam funcionando. Cada módulo será adaptado para receber contexto do Core, registrar conclusão e declarar metadados. A migração não exige reescrever tudo de uma vez.
