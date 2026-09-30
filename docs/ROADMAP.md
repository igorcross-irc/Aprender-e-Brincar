# Roadmap — Aprender & Brincar

## Fases 0–6 — Fundação e Reengenharia
Concluídas e incorporadas em `main`.

## Fase 7 — Universo Navegável
Implementada nesta etapa.
- Mapa por faixa etária.
- 7 mundos temáticos.
- Navegação idade → mundo → experiência → resultado.
- Atividades vinculadas a mundos.
- Progresso visual de experiências exploradas.
- Área da Família inicial.
- Identidade visual de navegação sem substituir os motores existentes.

## Fase 8 — Profundidade de Conteúdo
Em execução — expansão profunda implementada: catálogo ampliado, experiências progressivas por mundo, progressão persistente e novos caminhos de conteúdo.
- Reescrever e aprofundar cada experiência atual.
- Criar múltiplas variações por idade e dificuldade.
- Vocabulário temático por animais, casa, alimentos, corpo, natureza e cotidiano.
- Histórias interativas curtas.
- Música, ritmo e memória auditiva.
- Comunicação funcional e linguagem receptiva/expressiva.
- Padrões, classificação e lógica.
- Desafios motores guiados.
- Biblioteca de experiências específicas para 6–24 meses.

## Fase 9 — Identidade Infantil
Primeira camada implementada: recompensas não competitivas e leitura familiar do progresso.
- Personagem/companheiro seguro.
- Ilustrações próprias.
- Animações leves.
- Feedback visual e sonoro consistente.
- Recompensas não competitivas.
- Conquistas persistentes por exploração, repetição e diversidade de mundos.
- Visão familiar por domínios de desenvolvimento, sem avaliação clínica.
- Ambientes próprios para cada mundo.
- Sistema visual preparado para futuros ícones e artes dedicadas.

## Fase 10 — Área da Família
- Histórico de brincadeiras.
- Exploração por domínio.
- Preferências de áudio.
- Tempo de uso apresentado com contexto.
- Explicação do objetivo de cada experiência.
- Controles de privacidade.
- Sem avaliação clínica automática.

## Fase 11 — Plataforma
- Offline aprofundado.
- Instalação PWA refinada.
- Android.
- Sincronização opcional e segura, se necessária.

### Regra estrutural
Não criar centenas de jogos isolados. Criar motores reutilizáveis e combiná-los com conteúdo, idade, dificuldade e objetivos diferentes.

### Regra de segurança de produto
Não apagar uma experiência ou asset válido sem evidência de que está órfão e sem substituição equivalente.

## Saltos 31–36 — Leitura de jornada e contexto adaptativo
Em implementação na staging.
- Leitura centralizada de tempo, sessões e histórico recente.
- Recomendações com contexto estruturado e nível adaptativo.
- Jornada familiar consumindo o resumo central do núcleo.
- Histórico local recente acessível diretamente pela jornada.
- Nível contextual exibido nas sugestões do mundo.
- Testes de núcleo ampliados para esses contratos.

## Saltos 37–41 — Comunicação infantil por idade
Implementados na staging.
- Política central de interface por faixa etária.
- 6–24 meses: voz como canal principal, rótulos infantis visuais reduzidos e instruções preservadas por acessibilidade/áudio.
- 2–3 anos: modelo voice-supported, mantendo texto curto como apoio.
- 3–5 anos: interface mista, com texto progressivamente útil para linguagem e pré-alfabetização.
- Experiências principais passaram a marcar instruções e rótulos como conteúdo infantil, permitindo adaptação consistente.
- Instruções das experiências centrais são narradas automaticamente no modo voice-first.
- Experiências guiadas também priorizam voz e reduzem texto visual nas faixas iniciais.
- Regra de produto: a criança não deve precisar ler para conseguir brincar.


## Saltos 42–46 — Sistema visual infantil
Implementados na staging.
- Base central de visuais infantis reutilizáveis, separada do conteúdo e pronta para receber ilustrações próprias.
- Biblioteca visual inicial com chaves semânticas para objetos, animais, natureza e partes do corpo.
- Componentes visuais passam a priorizar imagem/ícone grande antes do rótulo.
- Faixas iniciais mantêm rótulos infantis ocultos, mas preservam instruções acessíveis e áudio.
- Experiências de descoberta, escolha e experiências guiadas passaram a consumir o sistema visual.
- Estilos visuais foram preparados para baixa poluição, áreas grandes de toque e substituição gradual de emojis por ilustrações próprias.
- Testes centrais cobrem normalização e disponibilidade mínima da biblioteca visual.
- Próxima evolução: substituir os fallbacks emoji por ilustrações próprias reais, mantendo a mesma API visual.


## Saltos 47–51 — Feedback, densidade e validação
Implementados na staging.
- Feedback visual infantil reutilizável para seleção, acerto e nova tentativa, com animação curta e respeito a redução de movimento.
- Contrato de assets preparado para substituir fallbacks emoji por ilustrações próprias sem alterar os jogos.
- Política de interface ampliada com densidade de escolhas e escala visual por faixa etária.
- Experiências centrais limitam a quantidade de escolhas de acordo com a idade sem remover a alternativa correta.
- Biblioteca visual e feedback passaram a ter cobertura adicional nos testes de núcleo.
- Criada validação automática da staging para executar testes de núcleo e build a cada push em branches staging.
- Revisão crítica: a base visual está funcional, mas ainda não deve ser considerada identidade visual final; emojis continuam como fallback até as ilustrações próprias serem realmente produzidas e integradas.


## Saltos 52–56 — Hardening do núcleo infantil
Em desenvolvimento na staging.
- Limite de escolhas extraído para um contrato reutilizável, preservando explicitamente a resposta correta ao reduzir alternativas.
- Grid de escolhas passa a ter regra central de colunas por faixa etária, preparando integração uniforme entre motores.
- Contrato visual endurecido: caminhos de imagem aceitos apenas em formato local seguro e com extensões conhecidas; fallback permanece automático.
- Feedback infantil tornou-se resistente a sobreposição de timers, evitando que um feedback antigo remova um feedback novo.
- Criado mapa de cobertura por faixa etária para detectar lacunas de conteúdo antes de avançar para novas experiências.
- Testes de núcleo ampliados para escolhas, cobertura etária, feedback e segurança de assets.


## Saltos 57–60 — Contrato de interação e auditoria
Em desenvolvimento na staging.
- Contrato único de interação infantil combina política de interface e perfil de experiência por idade.
- Tamanho mínimo de alvo de toque foi explicitado por faixa etária, com piso de segurança de 56px.
- Auditoria estática dedicada verifica cobertura das seis faixas, densidade de escolhas, ausência de pressão competitiva, cobertura de conteúdo e biblioteca visual.
- Auditoria adicionada como comando de desenvolvimento para ser incorporada ao ciclo de validação antes de futuros merges.
- Testes centrais cobrem o contrato de interação e seus limites.
