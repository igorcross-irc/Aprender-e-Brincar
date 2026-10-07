# Monetização e anúncios — marco de decisão

Status em 07/10/2026: **anúncios não serão implementados agora.** Este documento define o que precisa existir antes de reabrir o assunto e é revisado a cada marco de entrega (ver seção 4).

## 1. Por que não agora (resumo — não substitui advogado)
- **LGPD, art. 14:** dados de criança exigem consentimento específico e destacado de pelo menos um responsável, tratamento no melhor interesse da criança e informação clara e acessível sobre o que é coletado.
- **ECA Digital (Lei 15.211/2025, em vigor desde 17/03/2026):** vale para aplicativos e jogos direcionados a crianças ou com acesso provável por elas, e **proíbe publicidade direcionada** ao público infantojuvenil. Traz também deveres de prevenção, proteção e segurança.
- **Lojas:** as políticas do Google Play (Famílias) e da App Store (Kids Category) restringem anúncios e SDKs de terceiros em apps infantis. Um SDK de anúncios é, na prática, um coletor de dados de terceiros dentro de um app que hoje é 100% local. (Conferir o texto atual das políticas antes de qualquer decisão.)
- **Produto:** o app promete "zero anúncio, zero rastreamento" (`docs/PRIVACY.md`). Quebrar isso custa a confiança das famílias, que é o ativo principal.

Fontes consultadas em 07/10/2026: Machado Meyer (ECA Digital em vigor em 17/03/2026), Congresso em Foco, Serpro (LGPD e crianças), Aurum (LGPD comentada, art. 14).

## 2. Caminho recomendado de receita (do mais ao menos aderente)
1. **Compra única ou assinatura paga pelo responsável**, numa área para adultos (a Área da Família já tem verificação). Sem dados da criança, sem terceiros.
2. **Pacotes de conteúdo** pagos pelo responsável (novas cenas, novos jogos-âncora).
3. **Licença para escolas, clínicas e profissionais** (fase tardia).
4. **Patrocínio contextual fora do jogo**, numa página para adultos. Nunca dentro da experiência da criança.
5. **Anúncios dentro do jogo infantil:** só se um parecer jurídico aprovar e as lojas permitirem. Último recurso.

## 3. Pré-requisitos antes de reabrir a discussão de anúncios
Todos precisam estar cumpridos:
- [ ] Pelo menos **3 jogos-âncora** lançados e estáveis (hoje: 2 — Fazendinha Viva e Fundo do Mar).
- [ ] **Base de usuários real**: mínimo de 1.000 famílias ativas por mês, medido sem rastrear crianças (contagem agregada de instalações/atualizações).
- [ ] **Retenção comprovada**: meta de 30% das famílias voltando em 7 dias. Hoje não há como medir, pois o app não coleta nada.
- [ ] **Parecer jurídico** (LGPD + ECA Digital) sobre o formato exato de qualquer publicidade.
- [ ] **Verificação de responsável** robusta e **consentimento específico** (LGPD art. 14), com texto simples e em áudio.
- [ ] **Política de privacidade** atualizada e página pública para adultos.
- [ ] Decisão sobre **medição**: se algum dia coletarmos métricas, serão agregadas, sem identificador e sem dados da criança.
- [ ] **Alternativa paga** funcionando (itens 1 e 2 da seção 2), para o responsável poder escolher não ter anúncio.

## 4. Como isso será monitorado
Local-first significa que **não existe painel automático**. O monitoramento é por marco:
- A cada jogo-âncora entregue, esta lista é atualizada com o que foi cumprido e o que falta.
- Ao fechar o 3º jogo-âncora, será apresentado um resumo: o que o produto já tem, o que a lei e as lojas exigem e se vale abrir o parecer jurídico.
- Qualquer mudança de lei ou de política das lojas encontrada entra aqui com a fonte.

### Histórico
- 07/10/2026 — documento criado. Jogos-âncora lançados: 0 de 3 (Fazendinha Viva em andamento). Pré-requisitos cumpridos: nenhum.
- 07/10/2026 (2) — Jogos-âncora lançados: 2 de 3 (Fazendinha Viva, Mundo das Cenas: Fundo do Mar). Falta 1 para a revisão do marco. Demais pré-requisitos: nenhum cumprido.
