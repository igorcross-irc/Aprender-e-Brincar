# Aprender & Brincar — PROJECT MASTER

## Visão
Aplicação infantil web-first, preparada para PWA e futura distribuição Android, para crianças de 6 meses a 5 anos. A experiência combina atividades livres, jogos educativos, exploração, áudio amigável em português do Brasil e recompensas não competitivas.

## Princípios
- Criança primeiro: interface simples, grandes áreas de toque, feedback visual e sonoro curto.
- Desenvolvimento por faixa etária: conteúdo configurável por idade, sem transformar o app em ferramenta de diagnóstico.
- Local-first: progresso e preferências ficam no dispositivo por padrão.
- Privacidade: zero publicidade, zero rastreamento comportamental e nenhuma coleta desnecessária.
- Áudio ElevenLabs é o recurso principal quando o arquivo existir; speechSynthesis é apenas fallback.
- Reaproveitar código funcional antes de substituir. Não simplificar removendo capacidades existentes.
- Jogos e atividades são módulos independentes registrados em um núcleo comum.
- Toda alteração deve preservar regressão: build, navegação, áudio, toque e conteúdo existente.

## Faixas de conteúdo
- 6–12 meses: descoberta sensorial e causa/efeito.
- 12–18 meses: toque, arraste simples, reconhecimento.
- 18–24 meses: associação e vocabulário inicial.
- 2–3 anos: cores, animais, formas, sons, coordenação e linguagem.
- 3–4 anos: memória, associação, números, letras e sequências.
- 4–5 anos: desafios graduais, linguagem, lógica, números e criatividade.

## Arquitetura alvo
CORE: App Core, Activity Registry, Audio Engine, Progress Store, Reward Engine, Accessibility, Storage.
CONTENT: catálogo por idade, habilidades, dificuldade, áudio e disponibilidade offline.
GAMES: módulos independentes existentes e futuros.
PARENT: configurações protegidas por barreira infantil, sem tratar a barreira como autenticação.
PLATFORM: Vite, PWA, Web APIs, futura camada Android.

## Segurança e privacidade
A barreira dos pais é UX, não autenticação criptográfica. Dados locais podem ser alterados por quem controla o dispositivo. Nunca colocar segredos, tokens ou credenciais no frontend.

## Regra de evolução
1. Auditar estado atual.
2. Reutilizar o que funciona.
3. Implementar em camadas.
4. Testar build e referências.
5. Registrar estado e mudanças.
6. Só remover legado quando houver substituto funcional ou quando estiver comprovadamente órfão.
