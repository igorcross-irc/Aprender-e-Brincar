# Fase 0 — Auditoria 360°

## Resultado
A base foi considerada reaproveitável. Não foi feita limpeza destrutiva de jogos ou áudios.

### Pontos preservados
- Vite e módulos ES.
- Jogos separados em arquivos independentes.
- Motor de áudio resiliente com MP3 e fallback pt-BR.
- Biblioteca de assets existente.
- Persistência local.
- Manifesto e configuração Vercel.

### Correções aplicadas
1. Tailwind deixou de depender de CDN e passou a integrar o build.
2. Progresso ganhou schema próprio e migração do contador antigo de estrelas.
3. Nome da criança é escapado antes de ser inserido no HTML.
4. Catálogo ganhou registro central por faixa etária.
5. PWA ganhou service worker e cache runtime.
6. Área dos pais ganhou reset integrado de progresso.
7. Áudio dos animais passou a ser pré-carregado ao abrir a atividade.
8. Interface ganhou foco visível, alvos de toque e reduced-motion.
9. CI passou a executar smoke test e build.

### Riscos conhecidos
- localStorage não é armazenamento seguro contra manipulação local.
- barreira matemática é uma barreira infantil, não autenticação.
- alguns jogos ainda possuem fluxo próprio e serão migrados gradualmente para o Core.
- conteúdo específico para 6–18 meses ainda é pequeno e será ampliado.
- não há sincronização em nuvem.

### Política de limpeza
Nenhum MP3, PNG ou jogo existente foi removido nesta fase porque ainda pode ser conteúdo válido ou dependência futura. A remoção passa a exigir evidência de órfão e substituto funcional.
