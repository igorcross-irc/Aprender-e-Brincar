# Estado Atual — Fase 7 — Universo Navegável

## Base consolidada
- Fases 0–6 incorporadas em `main`.
- Vite + Tailwind compilado + PWA + Service Worker + CI.
- 329 MP3s existentes preservados.
- Catálogo central por faixa etária, domínio e habilidade.
- Motor `LearningWorldGame` reutilizado para experiências progressivas.

## Fase 7 implementada
- Criado o **Mapa do Aprender & Brincar**, com navegação em três níveis: idade → mundo → experiência.
- Criados 7 mundos reutilizáveis:
  - 🌱 Descobrir
  - 🗣️ Falar & Comunicar
  - 🎨 Cores & Formas
  - 🐾 Animais & Sons
  - 🔢 Números & Lógica
  - 🧠 Memória & Atenção
  - ✨ Criar & Mexer
- Cada experiência agora pertence a um mundo principal e continua filtrada pela faixa etária.
- A tela de mundo mostra objetivo, quantidade de brincadeiras, dificuldade e se a experiência já foi explorada.
- O fluxo infantil evita competição: estrelas são recompensa simples, não ranking.
- A Área da Família passou a apresentar estrelas, experiências exploradas, total disponível, nome da criança, privacidade e reset protegido.
- A navegação mantém retorno claro entre idade, mundo e experiência.
- A experiência visual ganhou cartões, caminhos, etapas, estados de progresso e hierarquia infantil.

## Conteúdo
O catálogo atual cobre:
- descoberta e causa/efeito;
- cores e formas;
- animais e sons;
- atenção e memória;
- números e quantidades;
- classificação e lógica;
- linguagem e comunicação;
- sílabas, rimas e consciência fonológica inicial;
- histórias e sequência;
- movimento, ritmo e criatividade.

## Expansão implementada nesta etapa
- Experiências específicas para 6–18 meses: descoberta e cores.
- Vocabulário cotidiano reutilizável.
- Histórias interativas curtas.
- Música e ritmo.
- Classificação adicional.
- Plano de locuções ampliado para os novos mundos.

## Próxima profundidade
A arquitetura está pronta para multiplicar conteúdo sem criar centenas de motores independentes. A próxima expansão deve aumentar a variedade dentro de cada mundo, incluindo:
- vocabulário temático;
- histórias interativas;
- música;
- memória auditiva;
- comunicação funcional;
- padrões e lógica;
- desafios motores;
- experiências específicas para 6–24 meses;
- personagens e identidade visual própria.

## Áudio
- Reutilizar primeiro os 329 MP3s existentes.
- Fallback pt-BR permanece disponível.
- Novas gravações serão consolidadas posteriormente em uma lista única, sem duplicidades.

## Limite clínico
As experiências são educativas e lúdicas. Não fazem diagnóstico, triagem clínica ou promessa de tratamento.


## Estado adicional — 30/09/2026
- Staging acumulada em `staging/saltos-86-100` continua separada da `main` até validação final.
- Mascote infantil reutilizável em SVG foi integrado à landing e ao resultado de experiência.
- Cabeçalho ganhou indicação online/offline e preparação de instalação PWA.
- Build correspondente ao commit `d32286b8615757bb1fe930f0e6b3dffa9d788846` foi concluído como READY no Vercel.
- O GitHub Actions apresenta falha de infraestrutura/inicialização nas execuções recentes: o job termina com zero steps em aproximadamente dois segundos. Isso não deve ser confundido com falha de build da aplicação.
- A identidade visual final dos objetos ainda não está completa: o sistema de visuais continua preparado para substituir emojis por ilustrações próprias reais.


## Biblioteca visual — revisão 30/09/2026
- Os ícones de navegação já estavam versionados no GitHub.
- A biblioteca visual anterior gerada fora do repositório (pacote WebP/PNG citado no histórico) não estava disponível como arquivo binário recuperável no ambiente desta execução; portanto, não foi apresentada como se tivesse sido recuperada.
- Foi implementado no staging um conjunto de 24 assets SVG em `public/assets/images/visual-library/`, cobrindo todos os objetos já reconhecidos pelo `child-visual-system`.
- O `child-visual-system` agora aponta para esses assets com fallback preservado.
- Crítica: estes SVGs são uma camada de integração/compatibilidade, não devem ser considerados a versão artística final da biblioteca. A próxima substituição pode usar ilustrações próprias detalhadas mantendo exatamente os mesmos caminhos e contratos.
- O deployment do commit `8d105042acb900c5a66b90b6d84ad1ae9f8d48da` foi concluído como READY no Vercel.
